// supabase/functions/podcast-search/index.ts
//
// Proxies the Apple iTunes Search API so the client can search the whole
// podcast catalogue, not just the shows already in podcast_shows. Returns
// each show with its RSS feed URL (feedUrl) — that's what podcast-ingest
// needs in order to pull the show into our own tables.
//
// iTunes Search is free and needs no API key. We proxy it (rather than
// calling it from the browser) so we can add CORS headers, keep the shape
// stable, and swap the provider later without touching the client.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { term } = await req.json().catch(() => ({ term: "" }));
    const q = (term || "").toString().trim();
    if (q.length < 2) return json({ results: [] });

    const url = new URL("https://itunes.apple.com/search");
    url.searchParams.set("term", q);
    url.searchParams.set("media", "podcast");
    url.searchParams.set("entity", "podcast");
    url.searchParams.set("limit", "25");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "Letters/1.0 (podcast search)" },
    });
    if (!res.ok) return json({ results: [], error: `itunes ${res.status}` }, 502);

    const data = await res.json();

    // Only shows that actually expose an RSS feed can be ingested, so drop the
    // rest. Normalise into the shape our client and ingest function expect.
    const results = (data.results || [])
      .filter((r: any) => r.feedUrl)
      .map((r: any) => ({
        itunes_id: r.collectionId,
        title: r.collectionName || r.trackName || "Untitled",
        author: r.artistName || "",
        feed_url: r.feedUrl,
        // Ask iTunes for a larger square than the default 100px thumbnail.
        image_url: (r.artworkUrl600 || r.artworkUrl100 || "").replace(/\/\d+x\d+bb/, "/600x600bb"),
        category: (r.primaryGenreName || "").toString(),
        episode_count: r.trackCount || null,
      }));

    return json({ results });
  } catch (err) {
    return json({ results: [], error: String(err) }, 500);
  }
});
