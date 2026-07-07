// Letters · send-board-emails
// Sweeps unsent `board_decision` notifications and emails each recipient via
// Resend, then marks them emailed. Designed to be invoked on a schedule
// (pg_cron -> net.http_post). Idempotent: marks emailed only after a send
// succeeds, so a Resend hiccup simply retries on the next sweep.
//
// Deploy:
//   npx supabase functions deploy send-board-emails \
//     --project-ref fybargwzyhqeutstfvtx --no-verify-jwt
//
// Secrets (set in your terminal, never in chat):
//   npx supabase secrets set RESEND_API_KEY=... CRON_SECRET=... \
//     EMAIL_FROM='Letters <notifications@tryletters.tech>' \
//     APP_URL='https://tryletters.tech'
// (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") ?? "Letters <notifications@tryletters.tech>";
const APP_URL = Deno.env.get("APP_URL") ?? "https://tryletters.tech";
const CRON_SECRET = Deno.env.get("CRON_SECRET"); // optional shared-secret guard

function escapeHtml(s: string): string {
  return (s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function emailHtml(title: string, body: string, link: string): string {
  const t = escapeHtml(title);
  const b = escapeHtml(body);
  return `
  <div style="background:#F9F6F0;padding:32px 12px;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #E8E0D0;border-radius:14px;overflow:hidden;">
      <div style="background:#111111;padding:18px 28px;">
        <span style="color:#F0EAD8;font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:900;">Letters<span style="color:#C8A96E;">.</span></span>
      </div>
      <div style="padding:28px;">
        <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C8A96E;margin-bottom:12px;">${t}</div>
        <p style="font-size:16px;line-height:1.65;color:#333333;margin:0 0 24px;">${b}</p>
        <a href="${link}" style="display:inline-block;background:#111111;color:#F0EAD8;text-decoration:none;padding:11px 22px;border-radius:22px;font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:600;">View in Letters &rarr;</a>
      </div>
      <div style="padding:16px 28px;border-top:1px solid #F0EDE8;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;color:#AAAAAA;">
        You're receiving this because you sit on an editorial board at Letters.
      </div>
    </div>
  </div>`;
}

Deno.serve(async (req: Request) => {
  // Shared-secret guard so only the scheduler can trigger a send.
  if (CRON_SECRET) {
    if (req.headers.get("x-cron-secret") !== CRON_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: pending, error } = await supabase.rpc("pending_board_emails", { lim: 100 });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  if (!pending || pending.length === 0) {
    return new Response(JSON.stringify({ seen: 0, sent: 0 }), { status: 200 });
  }

  const sentIds: string[] = [];
  for (const n of pending) {
    const link = n.forum_slug ? `${APP_URL}/forums/${n.forum_slug}` : `${APP_URL}/inbox`;
    const html = emailHtml(n.title, n.body ?? "", link);
    const text = `${n.body ?? n.title}\n\nView in Letters: ${link}`;
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: n.email,
          subject: n.title,
          html,
          text,
        }),
      });
      if (res.ok) {
        sentIds.push(n.id);
      } else {
        console.error("Resend failed", n.id, res.status, await res.text());
      }
    } catch (e) {
      console.error("Send error", n.id, String(e));
    }
  }

  if (sentIds.length > 0) {
    const { error: markErr } = await supabase.rpc("mark_board_emailed", { ids: sentIds });
    if (markErr) console.error("mark_board_emailed failed", markErr.message);
  }

  return new Response(
    JSON.stringify({ seen: pending.length, sent: sentIds.length }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
