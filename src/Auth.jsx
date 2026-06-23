import { useState } from "react";
import { supabase } from "./supabase";

function Logo({ size = 40 }) {
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <rect x="1" y="1" width={size-2} height={size-2} rx={size*0.12} fill="#111" stroke="#2a2a2a" strokeWidth="1"/>
      <text x={r} y={size*0.60} textAnchor="middle" fontSize={size*0.50} fontFamily="'Playfair Display', serif" fontWeight="900" fill="#F0EAD8">L</text>
      <line x1={size*0.2} y1={size*0.73} x2={size*0.8} y2={size*0.73} stroke="#C8A96E" strokeWidth="0.8"/>
      <text x={r} y={size*0.86} textAnchor="middle" fontSize={size*0.075} fontFamily="'DM Mono', monospace" fill="#C8A96E" letterSpacing="2">LETTERS</text>
    </svg>
  );
}

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [form, setForm] = useState({ email: "", password: "", fullName: "", username: "" });
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inputStyle = (field) => ({
    width: "100%",
    padding: "12px 14px",
    fontSize: 15,
    fontFamily: "'EB Garamond', Georgia, serif",
    color: "#111",
    background: focused === field ? "#fff" : "#FDFCF8",
    border: `1px solid ${focused === field ? "#111" : "#C8BFA8"}`,
    borderRadius: 5,
    outline: "none",
    transition: "all 0.15s",
    boxSizing: "border-box",
  });

  const labelStyle = {
    fontSize: 9.5,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#888",
    fontFamily: "'DM Mono', monospace",
    display: "block",
    marginBottom: 6,
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) {
      setError(error.message);
    } else {
      onAuthSuccess();
    }

    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    if (!form.fullName.trim()) { setError("Please enter your full name."); setLoading(false); return; }
    if (!form.username.trim()) { setError("Please choose a username."); setLoading(false); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); setLoading(false); return; }

    // Create auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Create profile row
    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          full_name: form.fullName,
          username: form.username.toLowerCase().replace(/\s/g, ""),
          status: "founding",
        });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }

    setMessage("Account created! You can now sign in.");
    setMode("signin");
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F9F6F0", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::placeholder { color: #B8B0A0; font-style: italic; font-family: 'EB Garamond', Georgia, serif; font-size: 14px; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 480 }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Logo size={64} />
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: "#111", margin: "16px 0 6px", letterSpacing: "-0.02em" }}>
            Letters<span style={{ color: "#C8A96E" }}>.</span>
          </h1>
          <p style={{ fontFamily: "'EB Garamond', serif", fontStyle: "italic", fontSize: 15, color: "#888", margin: 0 }}>
            Social Media. Elevated.
          </p>
        </div>

        {/* Card */}
        <div style={{ background: "#F7F4EE", border: "1px solid #C8BFA8", borderRadius: 14, overflow: "hidden" }}>

          {/* Broadsheet rule */}
          <div style={{ padding: "20px 28px 0" }}>
            <div style={{ borderTop: "3px solid #111", borderBottom: "1px solid #111", padding: "4px 0", marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#888", fontFamily: "'DM Mono', monospace" }}>Vol. I — No. 1</span>
              <span style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C8A96E", fontFamily: "'DM Mono', monospace" }}>✦ Members Only ✦</span>
              <span style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: "#888", fontFamily: "'DM Mono', monospace" }}>Est. 2025</span>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #C8BFA8", margin: "0 28px" }}>
            {["signin", "signup"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(null); setMessage(null); }}
                style={{ background: "none", border: "none", borderBottom: mode === m ? "2px solid #111" : "2px solid transparent", marginBottom: -1, padding: "8px 20px 10px", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", fontWeight: mode === m ? 500 : 400, color: mode === m ? "#111" : "#AAA", cursor: "pointer", transition: "all 0.15s" }}>
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Form */}
          <div style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Success message */}
            {message && (
              <div style={{ background: "#F0F7F0", border: "1px solid #A8C8A8", borderRadius: 5, padding: "10px 14px", fontSize: 13, color: "#2D6A4F", fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}>
                {message}
              </div>
            )}

            {/* Error message */}
            {error && (
              <div style={{ background: "#FDF0F0", border: "1px solid #C8A8A8", borderRadius: 5, padding: "10px 14px", fontSize: 13, color: "#C0392B", fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}>
                {error}
              </div>
            )}

            {/* Sign up extra fields */}
            {mode === "signup" && (
              <>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" placeholder="Your full name" value={form.fullName}
                    onChange={e => set("fullName", e.target.value)}
                    onFocus={() => setFocused("fullName")} onBlur={() => setFocused(null)}
                    style={inputStyle("fullName")}/>
                </div>
                <div>
                  <label style={labelStyle}>Username</label>
                  <input type="text" placeholder="Choose a username" value={form.username}
                    onChange={e => set("username", e.target.value)}
                    onFocus={() => setFocused("username")} onBlur={() => setFocused(null)}
                    style={inputStyle("username")}/>
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => set("email", e.target.value)}
                onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                style={inputStyle("email")}/>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                {mode === "signin" && (
                  <button style={{ background: "none", border: "none", fontSize: 11, color: "#C8A96E", fontFamily: "'EB Garamond', serif", fontStyle: "italic", cursor: "pointer", padding: 0 }}>
                    Forgot password?
                  </button>
                )}
              </div>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => set("password", e.target.value)}
                onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                style={inputStyle("password")}/>
              {mode === "signup" && (
                <span style={{ fontSize: 11, color: "#BBB", fontFamily: "'EB Garamond', serif", fontStyle: "italic", marginTop: 4, display: "block" }}>
                  At least 6 characters
                </span>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={mode === "signin" ? handleSignIn : handleSignUp}
              disabled={loading}
              style={{ width: "100%", background: loading ? "#555" : "#111", color: "#F0EAD8", border: "none", borderRadius: 6, padding: "13px 0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.02em", marginTop: 4, transition: "background 0.15s" }}>
              {loading ? "Please wait..." : mode === "signin" ? "Sign In →" : "Create Account →"}
            </button>

            {/* Bottom link */}
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 12, color: "#AAA", fontFamily: "'EB Garamond', serif", fontStyle: "italic" }}>
                {mode === "signin" ? "New to Letters? " : "Already have an account? "}
              </span>
              <button onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setMessage(null); }}
                style={{ background: "none", border: "none", fontSize: 12, color: "#C8A96E", fontFamily: "'EB Garamond', serif", fontStyle: "italic", cursor: "pointer", padding: 0, textDecoration: "underline" }}>
                {mode === "signin" ? "Create an account" : "Sign in"}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <span style={{ fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", color: "#BBB", fontFamily: "'DM Mono', monospace" }}>
            Read · Write · Respond
          </span>
        </div>
      </div>
    </div>
  );
}
