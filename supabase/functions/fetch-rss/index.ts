// Supabase Edge Function: fetch-rss
// Fetches a curated list of RSS feeds, parses them, and upserts articles
// into the news_articles table. Designed to run on a schedule (every 10-15 min)
// via Supabase's pg_cron, but can also be triggered manually for testing.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Feed sources — national + local civic newsrooms ──
const FEEDS = [
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml", source: "BBC News",     category: "World"   },
  { url: "https://feeds.bbci.co.uk/news/rss.xml",        source: "BBC News",     category: "World"   },
  { url: "https://www.theguardian.com/world/rss",        source: "The Guardian", category: "World"   },
  { url: "https://feeds.npr.org/1001/rss.xml",            source: "NPR",          category: "Culture" },
  { url: "https://www.wired.com/feed/rss",                source: "Wired",        category: "Technology" },
  { url: "https://feeds.arstechnica.com/arstechnica/index", source: "Ars Technica", category: "Technology" },
  { url: "https://rss.politico.com/politics-news.xml",    source: "Politico",     category: "Politics" },
  { url: "https://feeds.bbci.co.uk/sport/rss.xml",        source: "BBC Sport",    category: "Sports" },
  // Local / civic newsrooms — one per major region, chosen for editorial quality
  { url: "https://signalcleveland.org/feed",              source: "Signal Cleveland", category: "Local" },
  { url: "https://blockclubchicago.org/feed",             source: "Block Club Chicago", category: "Local" },
  { url: "https://feeds.texastribune.org/feeds/main/",    source: "The Texas Tribune", category: "Local" },
  { url: "https://houstonlanding.org/feed",               source: "Houston Landing", category: "Local" },
  { url: "https://www.minnpost.com/feed",                 source: "MinnPost", category: "Local" },
  { url: "https://billypenn.com/feed",                    source: "Billy Penn", category: "Local" },
  { url: "https://calmatters.org/feed",                   source: "CalMatters", category: "Local" },
];

// ── Text & URL sanitizing ──────────────────────────────────────────────────
// RSS feeds frequently ship entity-escaped HTML (e.g. "&lt;p&gt;...") — decode
// FIRST so the tags become real, strip them, then decode once more for any
// entities that were inside the text itself. Store clean prose, not markup.

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;/g, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#(\d+);/g, (_, n) => {
      try { return String.fromCodePoint(parseInt(n, 10)); } catch { return " "; }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => {
      try { return String.fromCodePoint(parseInt(n, 16)); } catch { return " "; }
    })
    .replace(/&amp;/gi, "&"); // last, so &amp;lt; doesn't double-decode early
}

function cleanText(raw: string | null): string | null {
  if (!raw) return null;
  let s = decodeEntities(raw);          // &lt;p&gt; -> <p>
  s = s
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, "\n\n") // block ends -> breaks
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ");           // strip remaining tags
  s = decodeEntities(s);                 // entities that were inside the text
  s = s.replace(/[ \t\u00a0]+/g, " ").replace(/\n{3,}/g, "\n\n").replace(/[ \t]*\n[ \t]*/g, "\n").trim();
  return s || null;
}

// Image URLs come with their own hazards: HTML-encoded query strings
// (&amp;quality=... breaks signed CDN URLs) and http/protocol-relative schemes
// that get blocked as mixed content on an https site.
function cleanImageUrl(url: string | null): string | null {
  if (!url) return null;
  let u = decodeEntities(String(url).trim());
  if (u.startsWith("//")) u = "https:" + u;
  else if (u.startsWith("http://")) u = "https://" + u.slice(7);
  if (!u.startsWith("https://")) return null;
  // Upscale CDNs that serve arbitrary widths from an unsigned URL. (The Guardian's
  // i.guim.co.uk URLs are signed per-width, so we never rewrite those.)
  if (/ichef\.bbci\.co\.uk/i.test(u)) {
    u = u
      .replace(/\/(\d{2,4})\/cpsprodpb\//, "/800/cpsprodpb/")   // .../news/240/cpsprodpb/...
      .replace(/\/ic\/(\d{2,4})x(\d{2,4})\//, "/ic/800x450/"); // .../ic/240x135/...
  }
  return u;
}

// Minimal, dependency-free RSS/Atom parser.
// RSS feeds vary in structure, so this pulls the common fields defensively
// rather than assuming a strict schema.
function parseRSS(xmlText: string, source: string, category: string) {
  const articles: Array<{
    source: string; source_category: string; title: string; link: string;
    description: string | null; image_url: string | null; published_at: string;
  }> = [];

  // Split on <item> or <entry> (Atom feeds use <entry>)
  const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  const entryRegex = /<entry\b[^>]*>([\s\S]*?)<\/entry>/gi;

  const extractTag = (block: string, tag: string): string | null => {
    const cdataMatch = block.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*<\\/${tag}>`, "i"));
    if (cdataMatch) return cdataMatch[1].trim();
    const plainMatch = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
    return plainMatch ? plainMatch[1].trim() : null;
  };

  const extractAttr = (block: string, tag: string, attr: string): string | null => {
    const match = block.match(new RegExp(`<${tag}[^>]*\\b${attr}=["']([^"']+)["'][^>]*\\/?>`, "i"));
    return match ? match[1] : null;
  };

  // Image extraction: walk the formats feeds actually use, in order of quality.
  //  1. <media:content url>      (Guardian, NYT, Politico, many)
  //  2. <media:thumbnail url>    (BBC News / BBC Sport)
  //  3. <enclosure url>          (WordPress feeds; only if type is image/absent)
  //  4. <itunes:image href>      (occasional)
  //  5. first <img src> inside content:encoded or description (decoded first,
  //     since those payloads are usually entity-escaped HTML)
  const extractImage = (block: string): string | null => {
    // Collect every media:content / media:thumbnail candidate with its width,
    // then take the largest — feeds often list the same image at several sizes.
    const candidates: Array<{ url: string; width: number }> = [];
    const mediaRegex = /<media:(?:content|thumbnail)\b[^>]*>/gi;
    let mtag;
    while ((mtag = mediaRegex.exec(block)) !== null) {
      const tag = mtag[0];
      const urlM = tag.match(/\burl=["']([^"']+)["']/i);
      if (!urlM) continue;
      const typeM = tag.match(/\btype=["']([^"']+)["']/i);
      if (typeM && !/^image\//i.test(typeM[1])) continue; // skip video/audio media
      const wM = tag.match(/\bwidth=["']?(\d+)/i);
      candidates.push({ url: urlM[1], width: wM ? parseInt(wM[1], 10) : 0 });
    }
    let url: string | null = null;
    if (candidates.length) {
      candidates.sort((a, b) => b.width - a.width);
      url = candidates[0].url;
    }
    if (!url) {
      const encUrl = extractAttr(block, "enclosure", "url");
      if (encUrl) {
        const encType = extractAttr(block, "enclosure", "type");
        if (!encType || /^image\//i.test(encType)) url = encUrl;
      }
    }
    if (!url) url = extractAttr(block, "itunes:image", "href");
    if (!url) {
      const htmlPayload = extractTag(block, "content:encoded") || extractTag(block, "description") || extractTag(block, "content") || "";
      const decoded = decodeEntities(htmlPayload);
      const imgMatch = decoded.match(/<img[^>]*\bsrc=["']([^"']+)["']/i);
      if (imgMatch) url = imgMatch[1];
    }
    return cleanImageUrl(url);
  };

  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const block = match[1];
    const title = cleanText(extractTag(block, "title"));
    const link = extractTag(block, "link");
    const description = cleanText(extractTag(block, "description"));
    const pubDate = extractTag(block, "pubDate") || extractTag(block, "published");
    const imageUrl = extractImage(block);

    if (title && link) {
      articles.push({
        source,
        source_category: category,
        title,
        link: link.trim(),
        description,
        image_url: imageUrl,
        published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      });
    }
  }

  // Fallback: try Atom-style <entry> if no <item> blocks were found
  if (articles.length === 0) {
    while ((match = entryRegex.exec(xmlText)) !== null) {
      const block = match[1];
      const title = cleanText(extractTag(block, "title"));
      const link = extractAttr(block, "link", "href") || extractTag(block, "link");
      const description = cleanText(extractTag(block, "summary") || extractTag(block, "content"));
      const pubDate = extractTag(block, "published") || extractTag(block, "updated");
      const imageUrl = extractImage(block);

      if (title && link) {
        articles.push({
          source,
          source_category: category,
          title,
          link: link.trim(),
          description,
          image_url: imageUrl,
          published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        });
      }
    }
  }

  return articles;
}

Deno.serve(async (_req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const results: Array<{ source: string; fetched: number; inserted: number; error?: string }> = [];

  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; LettersBot/1.0)" },
      });
      if (!res.ok) {
        results.push({ source: feed.source, fetched: 0, inserted: 0, error: `HTTP ${res.status}` });
        continue;
      }
      const xmlText = await res.text();
      const articles = parseRSS(xmlText, feed.source, feed.category);

      if (articles.length === 0) {
        results.push({ source: feed.source, fetched: 0, inserted: 0, error: "No articles parsed" });
        continue;
      }

      // Upsert on `link` so re-running the fetch doesn't create duplicates —
      // existing articles with the same link are left as-is (ignoreDuplicates).
      const { error, count } = await supabase
        .from("news_articles")
        .upsert(articles, { onConflict: "link", ignoreDuplicates: true, count: "exact" });

      if (error) {
        results.push({ source: feed.source, fetched: articles.length, inserted: 0, error: error.message });
      } else {
        results.push({ source: feed.source, fetched: articles.length, inserted: count || 0 });
      }
    } catch (err) {
      results.push({ source: feed.source, fetched: 0, inserted: 0, error: String(err) });
    }
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
});
