import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FROM = "Letters <waitlist@tryletters.tech>";
const SITE = "https://tryletters.tech";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req) => {
  try {
    const { email } = await req.json();
    if (!email) return json({ error: "missing email" }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: rows } = await supabase
      .from("waitlist")
      .select("email, first_name, status")
      .ilike("email", String(email).trim())
      .order("created_at", { ascending: false })
      .limit(1);
    const row = rows && rows[0];

    if (!row || row.status !== "approved") return json({ skipped: true }, 200);

    const firstName = (row.first_name || "").trim();
    const greeting = firstName ? `Dear ${firstName},` : "Dear reader,";

    const html = `
      <div style="max-width:520px;margin:0 auto;font-family:Georgia,'EB Garamond',serif;color:#1a1a1a;line-height:1.6">
        <div style="border-bottom:2px solid #111;padding-bottom:14px;margin-bottom:24px">
          <div style="font-family:'Playfair Display',Georgia,serif;font-size:30px;font-weight:900;letter-spacing:-0.01em">Letters<span style="color:#C8A96E">.</span></div>
          <div style="font-family:'DM Mono',monospace;font-size:10px;letter-spacing:0.16em;text-transform:uppercase;color:#C8A96E;margin-top:4px">Your invitation has been accepted</div>
        </div>
        <p style="font-size:16px">${greeting}</p>
        <p style="font-size:16px">You're in. Your request to join <strong>Letters</strong> has been approved, and your seat at the editorial page is ready.</p>
        <p style="font-size:16px">Create your account with this same email address to begin reading, writing, and replying.</p>
        <div style="text-align:center;margin:28px 0">
          <a href="${SITE}/signin?mode=signup" style="display:inline-block;background:#111;color:#F0EAD8;text-decoration:none;font-family:'DM Sans',Arial,sans-serif;font-weight:600;font-size:14px;padding:13px 28px;border-radius:6px">Create your account</a>
        </div>
        <p style="font-size:14px;color:#777;font-style:italic">Sign up with <strong>${row.email}</strong> — that's the address your invitation is tied to.</p>
        <p style="font-size:14px;color:#999;margin-top:24px">Awaiting your reply,<br/>The Letters editorial team</p>
      </div>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: row.email,
        subject: "You're in — welcome to Letters",
        html,
      }),
    });

    if (!res.ok) return json({ error: await res.text() }, 500);
    return json({ sent: true, to: row.email }, 200);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
