// supabase/functions/podcast-ingest/index.ts
//
// "Add to library" for a podcast that isn't in our catalogue yet. Takes an
// iTunes search result (specifically its feed_url), inserts the show into
// podcast_shows as a NON-curated show, parses the RSS feed, and inserts the
// most recent episodes. After this the show behaves exactly like a curated
// one — it appears in Listen, can be followed, and gets refreshed by the cron.
//
// Idempotent: if the show already exists (same feed_url), we reuse it and just
// refresh its episodes, so hitting "Add" twice never creates a duplicate.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

// --- tiny, dependency-free RSS helpers -------------------------------------
// Podcast feeds are plain RSS 2.0; we pull just the fields our tables need.
const tag = (block: string, name: string): string | null => {
  const m = block.match(new RegExp("<" + name + "[^>]*>([\\s\\S]*?)</" + name + ">", "i"));
  if (!m) return null;
  return m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
};
const attr = (block: string, name: string, a: string): string | null => {
  const m = block.match(new RegExp("<" + name + "[^>]*\\b" + a + "=[\"']([^\"']+)[\"']", "i"));
  return m ? m[1] : null;
};
// iTunes duration can be "3600", "1:02:03" or "02:03" — normalise to seconds.
const toSeconds = (raw: string | null): number | null => {
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return parseInt(raw, 10);
  const parts = raw.split(":").map((n) => parseInt(n, 10));
  if (parts.some(isNaN)) return null;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { feed_url, title, author, image_url, category, website } = await req.json();
    if (!feed_url || !title) return json({ error: "feed_url and title are required" }, 400);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Find or create the show. curated=false so the cron only keeps it fresh
    //    while at least one person follows it; featured=false keeps it out of
    //    the curated rails. episode_count is NOT NULL, so seed it at 0.
    let show;
    const { data: existing } = await admin
      .from("podcast_shows").select("*").eq("feed_url", feed_url).maybeSingle();

    if (existing) {
      show = existing;
    } else {
      const { data: created, error: showErr } = await admin
        .from("podcast_shows")
        .insert({
          feed_url,
          title,
          author: author || null,
          image_url: image_url || null,
          category: category || null,
          website: website || null,
          curated: false,
          featured: false,
          episode_count: 0,
        })
        .select().single();
      if (showErr) return json({ error: "show insert failed: " + showErr.message }, 500);
      show = created;
    }

    // 2. Fetch + parse the RSS feed.
    const res = await fetch(feed_url, { headers: { "User-Agent": "Letters/1.0 (podcast ingest)" } });
    if (!res.ok) return json({ show, episodesAdded: 0, warning: "feed " + res.status });
    const xml = await res.text();

    const items = xml.split(/<item[\s>]/i).slice(1).slice(0, 50); // newest 50
    const feedImage = attr(xml, "itunes:image", "href") || tag(xml, "url");

    const rows = items.map((raw) => {
      const block = "<item " + raw;
      const enclosure = attr(block, "enclosure", "url");
      const guid = tag(block, "guid") || enclosure || tag(block, "link");
      const t = tag(block, "title");
      if (!enclosure || !guid || !t) return null; // audio_url/guid/title are NOT NULL
      const pub = tag(block, "pubDate");
      return {
        show_id: show.id,
        guid,
        title: t,
        description: tag(block, "description") || tag(block, "itunes:summary") || null,
        audio_url: enclosure,
        duration: toSeconds(tag(block, "itunes:duration")),
        image_url: attr(block, "itunes:image", "href") || image_url || feedImage || null,
        published_at: pub ? new Date(pub).toISOString() : null,
      };
    }).filter(Boolean);

    // 3. Upsert on (show_id, guid) so re-ingesting never duplicates episodes.
    //    Requires a unique constraint on (show_id, guid) — see the SQL file.
    let added = 0;
    if (rows.length) {
      const { error: epErr, count } = await admin
        .from("podcast_episodes")
        .upsert(rows, { onConflict: "show_id,guid", ignoreDuplicates: true, count: "exact" });
      if (epErr) return json({ show, episodesAdded: 0, warning: "episode upsert: " + epErr.message });
      added = count ?? rows.length;
    }

    // 4. Keep the show's counters honest.
    const { count: total } = await admin
      .from("podcast_episodes").select("*", { count: "exact", head: true }).eq("show_id", show.id);
    await admin.from("podcast_shows")
      .update({ episode_count: total ?? rows.length, last_fetched: new Date().toISOString() })
      .eq("id", show.id);

    return json({ show, episodesAdded: added });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
