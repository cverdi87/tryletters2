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
    const match = block.match(new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["'][^>]*\\/?>`, "i"));
    return match ? match[1] : null;
  };

  const stripHtml = (s: string | null) => (s ? s.replace(/<[^>]+>/g, "").trim() : null);

  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const block = match[1];
    const title = stripHtml(extractTag(block, "title"));
    const link = extractTag(block, "link");
    const description = stripHtml(extractTag(block, "description"));
    const pubDate = extractTag(block, "pubDate") || extractTag(block, "published");
    const mediaUrl = extractAttr(block, "media:content", "url") || extractAttr(block, "enclosure", "url");

    if (title && link) {
      articles.push({
        source,
        source_category: category,
        title,
        link: link.trim(),
        description,
        image_url: mediaUrl,
        published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      });
    }
  }

  // Fallback: try Atom-style <entry> if no <item> blocks were found
  if (articles.length === 0) {
    while ((match = entryRegex.exec(xmlText)) !== null) {
      const block = match[1];
      const title = stripHtml(extractTag(block, "title"));
      const link = extractAttr(block, "link", "href") || extractTag(block, "link");
      const description = stripHtml(extractTag(block, "summary") || extractTag(block, "content"));
      const pubDate = extractTag(block, "published") || extractTag(block, "updated");

      if (title && link) {
        articles.push({
          source,
          source_category: category,
          title,
          link: link.trim(),
          description,
          image_url: null,
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
