// supabase/functions/notify-waitlist/index.ts
//
// Sends an email to chris@tryletters.tech whenever someone requests an invite
// on the Letters marketing site. Called fire-and-forget from InvitePage's
// handleSubmit via supabase.functions.invoke("notify-waitlist", { body: {...} }).
//
// Required secret (set once, see deploy steps):  RESEND_API_KEY
//
// IMPORTANT: the `FROM` address below must be on a domain you've verified in
// Resend (tryletters.tech, from your DKIM setup). If the domain isn't verified
// yet, Resend will reject the send — see the note in the chat.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const TO = "chris@tryletters.tech";
const FROM = "Letters <waitlist@tryletters.tech>"; // change the local part if you prefer (e.g. noreply@)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY is not set" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { firstName, lastName, email, occupation, referral, referralOther } = await req.json();

    const fullName = `${firstName ?? ""} ${lastName ?? ""}`.trim() || "Someone";
    const heard = referralOther ? `${referral} — ${referralOther}` : referral;

    const html = `
      <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; color: #222;">
        <p style="font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; color: #C8A96E; margin: 0 0 6px;">Letters · New invite request</p>
        <h2 style="font-family: Georgia, serif; font-size: 22px; margin: 0 0 16px;">${esc(fullName)} wants in.</h2>
        <table style="border-collapse: collapse; width: 100%; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #888; width: 130px;">Name</td><td style="padding: 8px 0;">${esc(fullName)}</td></tr>
          <tr><td style="padding: 8px 0; color: #888;">Email</td><td style="padding: 8px 0;"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #888;">Occupation</td><td style="padding: 8px 0;">${esc(occupation)}</td></tr>
          <tr><td style="padding: 8px 0; color: #888;">Heard via</td><td style="padding: 8px 0;">${esc(heard)}</td></tr>
        </table>
        <p style="font-size: 13px; color: #999; margin-top: 20px;">Reply to this email to respond directly to ${esc(firstName)}.</p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email || undefined,
        subject: `New Letters invite request — ${fullName}`,
        html,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: errText }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("notify-waitlist failed:", e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
