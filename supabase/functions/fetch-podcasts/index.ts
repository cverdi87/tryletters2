// Letters · fetch-podcasts
// Parses every feed in `podcast_shows` and upserts episodes into
// `podcast_episodes`. Mirrors the `fetch-rss` news pipeline: pg_cron drives it,
// the service role bypasses RLS, and upserts ignore duplicates so re-running is
// safe and cheap.
//
// Deploy:
//   npx supabase functions deploy fetch-podcasts \
//     --project-ref fybargwzyhqeutstfvtx --no-verify-jwt
//
// Schedule (SQL editor):
//   select cron.schedule('fetch-podcasts', '0 */6 * * *',
//     $$ select net.http_post(
//          url := 'https://fybargwzyhqeutstfvtx.functions.supabase.co/fetch-podcasts',
//          headers := jsonb_build_object('Content-Type','application/json'),
//          body := '{}'::jsonb) $$);
//
// Podcast feeds change far less often than news, so every 6 hours is plenty.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const EPISODES_PER_SHOW = 40;   // keep the catalog useful without unbounded growth

// ── XML helpers ─────────────────────────────────────────────────────────────
// Deliberately regex-based rather than a DOM parser: podcast feeds are large and
// frequently malformed, and Deno's DOM parsers choke on real-world RSS. This is
// the same trade-off the news fetcher makes.

function decodeEntities(s: string): string {
  if (!s) return "";
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ").replace(/&mdash;/g, "—").replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…").replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"').replace(/&rdquo;/g, '"')
    .replace(/&amp;/g, "&")
    .trim();
}

function stripTags(s: string): string {
  return decodeEntities((s || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function tag(xml: string, name: string): string | null {
  // Matches <name ...>value</name>, namespace-aware (itunes:summary etc).
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i");
  const m = xml.match(re);
  return m ? decodeEntities(m[1]) : null;
}

function attr(xml: string, tagName: string, attrName: string): string | null {
  const re = new RegExp(`<${tagName}[^>]*\\s${attrName}\\s*=\\s*["']([^"']+)["'][^>]*>`, "i");
  const m = xml.match(re);
  return m ? decodeEntities(m[1]) : null;
}

// "01:23:45" | "23:45" | "1234" (seconds) -> seconds
function parseDuration(raw: string | null): number | null {
  if (!raw) return null;
  const s = raw.trim();
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  const parts = s.split(":").map(p => parseInt(p, 10));
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

function parseDate(raw: string | null): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

// Episode art: itunes:image href, else <image><url>, else null (client falls
// back to the show's art).
function itemImage(item: string): string | null {
  return attr(item, "itunes:image", "href") || tag(item, "url");
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: shows, error } = await supabase
    .from("podcast_shows")
    .select("id, feed_url, title");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  if (!shows?.length) {
    return new Response(JSON.stringify({ shows: 0, episodes: 0 }), { status: 200 });
  }

  let totalEpisodes = 0;
  const failures: string[] = [];

  for (const show of shows) {
    try {
      const res = await fetch(show.feed_url, {
        headers: { "User-Agent": "Letters/1.0 (+https://tryletters.tech)" },
      });
      if (!res.ok) { failures.push(`${show.title}: HTTP ${res.status}`); continue; }
      const xml = await res.text();

      // ── Show-level metadata (refresh it; feeds rename and re-art themselves) ──
      const channel = xml.split(/<item[\s>]/i)[0];
      const showImage =
        attr(channel, "itunes:image", "href") ||
        (channel.match(/<image>[\s\S]*?<url>([\s\S]*?)<\/url>[\s\S]*?<\/image>/i)?.[1] ?? null);
      const showDesc = tag(channel, "itunes:summary") || tag(channel, "description");
      const showAuthor = tag(channel, "itunes:author") || tag(channel, "managingEditor");
      const website = tag(channel, "link");

      await supabase.from("podcast_shows").update({
        image_url: showImage ? decodeEntities(showImage).trim() : null,
        description: showDesc ? stripTags(showDesc).slice(0, 600) : null,
        author: showAuthor ? stripTags(showAuthor) : null,
        website: website ? decodeEntities(website).trim() : null,
        last_fetched: new Date().toISOString(),
      }).eq("id", show.id);

      // ── Episodes ──
      const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
      const rows: Record<string, unknown>[] = [];

      for (const item of items.slice(0, EPISODES_PER_SHOW)) {
        // The enclosure URL is the audio. No audio -> not an episode.
        const audio = attr(item, "enclosure", "url");
        if (!audio) continue;

        const title = tag(item, "title");
        if (!title) continue;

        // GUID is the stable identity. Some feeds omit it — fall back to the
        // audio URL, which is unique in practice.
        const guid = tag(item, "guid") || audio;
        const desc = tag(item, "itunes:summary") || tag(item, "description") || tag(item, "content:encoded");

        rows.push({
          show_id: show.id,
          guid: guid.trim(),
          title: stripTags(title),
          description: desc ? stripTags(desc).slice(0, 2000) : null,
          audio_url: audio.trim(),
          duration: parseDuration(tag(item, "itunes:duration")),
          image_url: itemImage(item),
          published_at: parseDate(tag(item, "pubDate")),
        });
      }

      if (rows.length) {
        // ignoreDuplicates: existing episodes stay put (preserving playback rows
        // that reference them); only genuinely new episodes are inserted.
        const { error: insErr } = await supabase
          .from("podcast_episodes")
          .upsert(rows, { onConflict: "show_id,guid", ignoreDuplicates: true });
        if (insErr) failures.push(`${show.title}: ${insErr.message}`);
        else totalEpisodes += rows.length;
      }
    } catch (e) {
      failures.push(`${show.title}: ${String(e)}`);
    }
  }

  return new Response(
    JSON.stringify({ shows: shows.length, episodesSeen: totalEpisodes, failures }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
