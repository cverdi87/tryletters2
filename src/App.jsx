import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
import { supabase } from "./supabase";
import Auth from "./Auth";
import { MASTHEAD_LABEL } from "./version";

// ── Shared: Logo ──────────────────────────────────────────────────────────────
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

// ── Shared: BroadsheetRule ────────────────────────────────────────────────────
function BroadsheetRule({ left, center, right }) {
  return (
    <div style={{ borderTop:"3px solid #111", borderBottom:"1px solid #111", padding:"5px 0", marginBottom:28, display:"flex", justifyContent:"space-between" }}>
      <span style={{ fontSize:9.5, letterSpacing:"0.16em", textTransform:"uppercase", color:"#888", fontFamily:"'DM Mono', monospace" }}>{left}</span>
      <span style={{ fontSize:9.5, letterSpacing:"0.16em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace" }}>✦ {center} ✦</span>
      <span style={{ fontSize:9.5, letterSpacing:"0.16em", textTransform:"uppercase", color:"#888", fontFamily:"'DM Mono', monospace" }}>{right}</span>
    </div>
  );
}

// ── Shared: Top Bar ───────────────────────────────────────────────────────────
// ── Brand image placeholders (shown when an image is missing or fails) ──
function LMark({ size = 24 }) {
  return (
    <div aria-hidden="true" style={{ width:size, height:size, background:"#171717", borderRadius:"23%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <span style={{ fontFamily:"'Playfair Display', serif", color:"#F4ECD8", fontSize:Math.round(size*0.56), fontWeight:900, lineHeight:1 }}>L</span>
    </div>
  );
}

// Shows the article image, falling back to a branded placeholder when it is
// missing OR fails to load. Large slots get a source drop-cap; small slots get a
// compact ink monogram — both tinted with the source's assigned color.
function NewsThumb({ src, color, publication, initial, height, radius = 0, lead = false, gradient = false }) {
  const [failed, setFailed] = useState(false);
  const bg = color || "#7C7C7C";
  const init = (initial || (publication || "").replace(/^the\s+/i, "").trim().charAt(0) || "L").toUpperCase();
  const showImg = src && !failed;
  const big = lead || (height ? height >= 150 : true);
  return (
    <div style={{ position:"relative", width:"100%", height: height || "100%", background:bg, overflow:"hidden", borderRadius:radius }}>
      {showImg ? (
        <img src={src} alt={publication || ""} referrerPolicy="no-referrer" loading="lazy"
          onError={() => setFailed(true)}
          style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
      ) : big ? (
        <>
          <div aria-hidden="true" style={{ position:"absolute", right:-8, bottom:-30, fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:Math.max(150,(height||220)*0.95), lineHeight:1, color:"rgba(249,246,240,0.15)", userSelect:"none" }}>{init}</div>
          {publication && <div style={{ position:"absolute", left:14, top:13, fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(249,246,240,0.92)" }}>{publication}</div>}
          <div style={{ position:"absolute", left:14, bottom:13, display:"flex", alignItems:"center", gap:7 }}>
            <LMark size={22}/>
            <span style={{ fontFamily:"'DM Mono', monospace", fontSize:9, letterSpacing:"0.16em", color:"rgba(249,246,240,0.62)" }}>No image</span>
          </div>
        </>
      ) : (
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6, padding:8 }}>
          <LMark size={(height||110) < 80 ? 22 : 28}/>
          {publication && (height||110) >= 96 && <span style={{ fontFamily:"'DM Mono', monospace", fontSize:8.5, letterSpacing:"0.14em", textTransform:"uppercase", color:"rgba(249,246,240,0.72)", textAlign:"center", padding:"0 6px" }}>{publication}</span>}
        </div>
      )}
      {gradient && showImg && <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"55%", background:"linear-gradient(to top, rgba(0,0,0,0.4), transparent)", pointerEvents:"none" }}/>}
    </div>
  );
}

// A Letters nameplate crest — the picture area for letters until they carry
// their own cover images.
function LetterCover({ height = 96, section }) {
  const nameSize = Math.max(20, Math.round(height * 0.34));
  const ruleW = Math.min(190, Math.round(height * 1.7));
  const gap = Math.round(height * 0.09);
  return (
    <div style={{ position:"relative", width:"100%", height, background:"#FBF7EF", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
      <div style={{ width:ruleW, height:2, background:"#141414", marginBottom:gap }}/>
      <div style={{ fontFamily:"'Playfair Display', serif", fontSize:nameSize, fontWeight:900, color:"#141414", letterSpacing:"-0.01em", lineHeight:1 }}>Letters<span style={{ color:"#C8A96E" }}>.</span></div>
      <div style={{ width:ruleW, borderTop:"1px solid #141414", marginTop:gap, paddingTop:Math.round(height*0.06) }}>
        <div style={{ fontFamily:"'DM Mono', monospace", fontSize:8.5, letterSpacing:"0.24em", color:"#B0873E", textAlign:"center", paddingLeft:"0.24em", textTransform:"uppercase" }}>{section || "From our writers"}</div>
      </div>
    </div>
  );
}

function TopBar({ title, onSignOut, rightAction, maxWidth = 680 }) {
  return (
    <header style={{ position:"sticky", top:0, zIndex:50, background:"rgba(249,246,240,0.97)", backdropFilter:"blur(10px)", borderBottom:"1px solid #E8E0D0" }}>
      <div style={{ maxWidth, margin:"0 auto", padding:"0 20px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Logo size={32}/>
          <span style={{ fontFamily:"'Playfair Display', serif", fontSize:17, fontWeight:900, color:"#111", letterSpacing:"-0.01em" }}>
            {title || <span>Letters<span style={{ color:"#C8A96E" }}>.</span></span>}
          </span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {rightAction}
          {onSignOut && (
            <button onClick={onSignOut} style={{ background:"none", border:"1px solid #E0D8CC", borderRadius:20, padding:"5px 14px", fontSize:12, color:"#888", fontFamily:"'DM Sans', sans-serif", cursor:"pointer" }}>
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

// ── Shared: Bottom Tab Bar ────────────────────────────────────────────────────
function BottomNav({ active, onNavigate }) {
  const tabs = [
    {
      id: "feed",
      label: "Feed",
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "#111" : "none"} stroke={active ? "#111" : "#999"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      id: "read",
      label: "Read",
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#111" : "#999"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      )
    },
    {
      id: "write",
      label: "Write",
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#111" : "#999"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      )
    },
    {
      id: "forums",
      label: "Forums",
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#111" : "#999"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      )
    },
    {
      id: "you",
      label: "You",
      icon: (active) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? "#111" : "#999"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    },
  ];

  return (
    <nav style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:50,
      background:"rgba(249,246,240,0.97)", backdropFilter:"blur(10px)",
      borderTop:"1px solid #E8E0D0",
      display:"flex", justifyContent:"space-around",
      padding:"10px 0 16px",
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onNavigate(tab.id)}
          style={{
            background:"none", border:"none", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"center", gap:3,
            padding:"0 16px",
            color: active === tab.id ? "#111" : "#999",
            fontFamily:"'DM Sans', sans-serif",
            fontSize:10, fontWeight: active === tab.id ? 600 : 400,
            letterSpacing:"0.02em",
          }}>
          {tab.icon(active === tab.id)}
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

// ── Right Nav (desktop only) ──────────────────────────────────────────────────
function RightNav({ active, onNavigate }) {
  const tabs = [
    { id:"feed",   label:"Feed",   icon: (isActive) => <svg width="20" height="20" viewBox="0 0 24 24" fill={isActive?"#111":"none"} stroke={isActive?"#111":"#999"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
    { id:"read",   label:"Read",   icon: (isActive) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isActive?"#111":"#999"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
    { id:"write",  label:"Write",  icon: (isActive) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isActive?"#111":"#999"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
    { id:"forums", label:"Forums", icon: (isActive) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isActive?"#111":"#999"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id:"you",    label:"You",    icon: (isActive) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isActive?"#111":"#999"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
  ];

  return (
    <div className="letters-rightnav" style={{ display:"none", position:"fixed", top:0, right:0, bottom:0, width:160, background:"#fff", borderLeft:"1px solid #F0EDE8", zIndex:60, flexDirection:"column", alignItems:"stretch", padding:"24px 0" }}>
      <div style={{ padding:"0 16px 20px", borderBottom:"1px solid #F0EDE8", marginBottom:8 }}>
        <div style={{ fontSize:9, letterSpacing:"0.16em", textTransform:"uppercase", color:"#BBB", fontFamily:"'DM Mono', monospace" }}>Navigate</div>
      </div>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onNavigate(t.id)}
          style={{
            background: active===t.id ? "#F9F6F0" : "none",
            border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", gap:10,
            padding:"12px 16px", margin:"1px 8px",
            borderRadius:10,
            color: active===t.id ? "#111" : "#999",
            fontFamily:"'DM Sans', sans-serif", fontSize:13.5,
            fontWeight: active===t.id ? 600 : 400,
            transition:"background 0.15s",
            textAlign:"left",
          }}
          onMouseEnter={e => { if(active!==t.id) e.currentTarget.style.background="#F9F6F0"; }}
          onMouseLeave={e => { if(active!==t.id) e.currentTarget.style.background="none"; }}
        >
          <span style={{ color: active===t.id ? "#C8A96E" : "#CCC", display:"flex", flexShrink:0 }}>{t.icon(active===t.id)}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ── Page: Feed ────────────────────────────────────────────────────────────────
const contributorStatuses = {
  "contributor":          "✦ Letters Contributor",
  "founding":             "✦ Founding Member",
  "featured":             "✦ Featured Contributor",
  "senior":               "✦ Senior Correspondent",
  "contributing-editor":  "✦ Contributing Editor",
  "journalist":           "✦ Verified Journalist",
  "staff":                "✦ Staff Writer",
  "editor":               "✦ Editor at Large",
};

const statusColors = {
  "contributor":          "#AAA",
  "founding":             "#C8A96E",
  "featured":             "#C8A96E",
  "senior":               "#E67E22",
  "contributing-editor":  "#8E44AD",
  "journalist":           "#2980B9",
  "staff":                "#27AE60",
  "editor":               "#C0392B",
};

const mockFeed = [
  { id:1, type:"letter", author:"Margaret T.", username:"margaret_t", status:"founding", initial:"M", color:"#2D6A4F", timeAgo:"2h ago", section:"Economy", publication:"The Atlantic", headline:"The Quiet Death of the American Middle Class", preview:"The framing of this piece misses what's actually happening in rust-belt communities. Having lived in Youngstown for 30 years, I can tell you the numbers don't capture the social fabric that's unraveled...", replies:14, likes:38 },
  { id:2, type:"news", publication:"Reuters", section:"World", headline:"EU Reaches Historic Agreement on AI Liability Framework", summary:"After three years of negotiations, member states have signed a landmark directive holding AI developers responsible for harms caused by their systems.", timeAgo:"4h ago", letters:6 },
  { id:3, type:"letter", author:"David K.", username:"david_k", status:"journalist", initial:"D", color:"#1B4F72", timeAgo:"5h ago", section:"Technology", publication:"NYT", headline:"EU Reaches Historic Agreement on AI Liability Framework", preview:"This is being celebrated as progress, but the liability caps written into section 4(b) effectively immunize the largest players while crushing any startup that can't afford compliance infrastructure...", replies:27, likes:91 },
  { id:4, type:"letter", author:"Priya N.", username:"priya_n", status:"senior", initial:"P", color:"#6B2D8B", timeAgo:"7h ago", section:"Climate", publication:"The Guardian", headline:"Climate Scientists Warn of Tipping Points by 2030", preview:"As someone who has spent 15 years modeling ice sheet dynamics, I want to clarify what 'irreversible' actually means in this context — the article conflates two very different timescales...", replies:42, likes:156 },
  { id:5, type:"news", publication:"AP News", section:"Politics", headline:"Senate Advances Bipartisan Infrastructure Spending Bill", summary:"The measure allocates $180 billion to broadband expansion and rural transit over the next decade.", timeAgo:"9h ago", letters:18 },
  { id:6, type:"letter", author:"James W.", username:"james_w", status:"contributing-editor", initial:"J", color:"#7A3B1E", timeAgo:"11h ago", section:"Culture", publication:"The New Yorker", headline:"How Streaming Killed the Auteur", preview:"Coppola's latest is a disaster by almost any metric, but it's a fascinating one — the kind of failure only possible when a filmmaker has total freedom and no one left to say no...", replies:63, likes:204 },
  { id:7, type:"news", publication:"BBC Sport", section:"Sports", headline:"Champions League Final: A Night Nobody Will Forget", summary:"In a match that defied expectations from kickoff, the final produced three goals in extra time and a penalty shootout that left fans breathless across the globe.", timeAgo:"3h ago", letters:41 },
  { id:8, type:"news", publication:"ESPN", section:"Sports", headline:"Why Gen Z Is Falling Back in Love With Baseball", summary:"Attendance is up, viewership among 18-34 year olds has climbed for the third straight year, and a new generation of stars is driving a renaissance nobody saw coming.", timeAgo:"1d ago", letters:28 },
];

function Avatar({ initial, color, size=34 }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:size*0.38, fontFamily:"'Playfair Display', serif", fontWeight:500, flexShrink:0 }}>{initial}</div>;
}

// ── Letter Detail View ────────────────────────────────────────────────────────
const mockReplies = [
  { id:1, author:"Thomas R.", initial:"T", color:"#1B4F72", timeAgo:"1h ago", body:"This is exactly the kind of nuanced take that's been missing from the mainstream coverage. The distinction you're drawing between structural and cyclical factors is crucial — most commentary collapses the two." },
  { id:2, author:"Elena V.", initial:"E", color:"#117A65", timeAgo:"2h ago", body:"I'd push back slightly on the framing here. The data from the Midwest doesn't necessarily generalize — coastal rust belt cities have had very different trajectories over the same period." },
  { id:3, author:"Sam K.", initial:"S", color:"#6E2F8C", timeAgo:"3h ago", body:"Agreed with the core argument. What's your take on the role of remote work in reversing some of these trends? We're seeing unusual migration patterns that complicate the narrative." },
];

function LetterDetailView({ item, onBack, session }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(item.likes);
  const [replies, setReplies] = useState(mockReplies);
  const [replyText, setReplyText] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(l => liked ? l - 1 : l + 1);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    // In production this saves to Supabase
    const newReply = {
      id: replies.length + 1,
      author: session?.user?.email?.split("@")[0] || "You",
      initial: (session?.user?.email?.[0] || "Y").toUpperCase(),
      color: "#C8A96E",
      timeAgo: "Just now",
      body: replyText,
    };
    setTimeout(() => {
      setReplies(r => [...r, newReply]);
      setReplyText("");
      setSubmitting(false);
      setFocused(false);
    }, 400);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#fff", paddingBottom:120 }}>
      {/* Header */}
      <header style={{ position:"sticky", top:0, zIndex:50, background:"rgba(255,255,255,0.97)", backdropFilter:"blur(10px)", borderBottom:"1px solid #F0EDE8" }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"0 20px", height:54, display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", padding:4, color:"#555", display:"flex", alignItems:"center", gap:6, fontFamily:"'DM Sans', sans-serif", fontSize:13 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Feed
          </button>
          <div style={{ width:1, height:20, background:"#E8E0D0" }}/>
          <span style={{ fontSize:11, color:"#AAA", fontFamily:"'DM Mono', monospace", letterSpacing:"0.08em" }}>Letter</span>
        </div>
      </header>

      <main style={{ maxWidth:680, margin:"0 auto", padding:"24px 20px 0" }}>

        {/* Source article */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:24, padding:"14px 16px", background:"#F9F6F0", borderRadius:10, border:"1px solid #E8E0D0" }}>
          <div style={{ width:3, background:"#C8A96E", borderRadius:2, alignSelf:"stretch", flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <div style={{ marginBottom:3 }}>
              <span style={{ fontSize:9.5, letterSpacing:"0.12em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{item.publication}</span>
              <span style={{ fontSize:9.5, color:"#BBB", fontFamily:"'DM Mono', monospace" }}> · {item.section}</span>
            </div>
            <div style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:14, color:"#555", fontStyle:"italic", lineHeight:1.4 }}>{item.headline}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </div>

        {/* Author */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <Avatar initial={item.initial} color={item.color} size={44}/>
          <div>
            <div style={{ fontSize:15, fontWeight:600, color:"#111", fontFamily:"'DM Sans', sans-serif" }}>{item.author}</div>
            <div style={{ fontSize:11, color:"#BBB", fontFamily:"'DM Mono', monospace", marginTop:2 }}>{item.timeAgo}</div>
          </div>
        </div>

        {/* Letter body — full text */}
        <div style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:18, lineHeight:1.85, color:"#222", marginBottom:28 }}>
          <p style={{ margin:"0 0 18px" }}>{item.preview}</p>
          <p style={{ margin:"0 0 18px" }}>The data tells one story, but the lived experience of communities like Youngstown, Gary, and Flint tells another. When we talk about "middle class decline," we're often really talking about the collapse of a particular kind of place — the industrial city that built American prosperity and has been hollowed out over fifty years of deindustrialization, disinvestment, and demographic change.</p>
          <p style={{ margin:0 }}>What this piece gets right is the urgency. What it misses is the geography. Not all of America is declining equally, and our policy responses need to reflect that complexity rather than treating the middle class as a monolith.</p>
        </div>

        {/* Actions */}
        <div style={{ display:"flex", alignItems:"center", gap:20, paddingBottom:20, borderBottom:"1px solid #F0EDE8", marginBottom:24 }}>
          <button onClick={handleLike}
            style={{ display:"flex", alignItems:"center", gap:7, background:"none", border:"none", cursor:"pointer", padding:0, color: liked ? "#C0392B" : "#AAA", fontFamily:"'DM Sans', sans-serif", fontSize:13, fontWeight: liked ? 600 : 400, transition:"all 0.15s" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill={liked ? "#C0392B" : "none"} stroke="currentColor" strokeWidth="1.8">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {likes}
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:7, color:"#AAA", fontFamily:"'DM Sans', sans-serif", fontSize:13 }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {replies.length} replies
          </div>
          <button style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, background:"none", border:"1px solid #E8E0D0", borderRadius:20, padding:"6px 14px", cursor:"pointer", color:"#777", fontFamily:"'DM Sans', sans-serif", fontSize:12 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share
          </button>
        </div>

        {/* Replies */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace", marginBottom:16 }}>
            {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
          </div>
          {replies.map((reply, i) => (
            <div key={reply.id} style={{ display:"flex", gap:12, paddingBottom:20, marginBottom: i < replies.length-1 ? 20 : 0, borderBottom: i < replies.length-1 ? "1px solid #F9F6F0" : "none" }}>
              <Avatar initial={reply.initial} color={reply.color} size={34}/>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:600, color:"#111", fontFamily:"'DM Sans', sans-serif" }}>{reply.author}</span>
                  <span style={{ fontSize:10, color:"#BBB", fontFamily:"'DM Mono', monospace" }}>{reply.timeAgo}</span>
                </div>
                <p style={{ margin:0, fontSize:15, lineHeight:1.7, color:"#444", fontFamily:"'EB Garamond', Georgia, serif" }}>{reply.body}</p>
                <button style={{ marginTop:8, background:"none", border:"none", cursor:"pointer", fontSize:11, color:"#BBB", fontFamily:"'DM Sans', sans-serif", padding:0 }}>♡ Like</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Reply compose — pinned at bottom */}
      <div style={{ position:"fixed", bottom:64, left:0, right:0, background:"rgba(255,255,255,0.97)", backdropFilter:"blur(10px)", borderTop:"1px solid #E8E0D0", padding:"12px 20px", zIndex:40 }}>
        <div style={{ maxWidth:680, margin:"0 auto", display:"flex", gap:10, alignItems:"flex-end" }}>
          <Avatar initial={(session?.user?.email?.[0] || "Y").toUpperCase()} color="#C8A96E" size={32}/>
          <div style={{ flex:1, background:"#F9F6F0", border:`1px solid ${focused ? "#111" : "#E8E0D0"}`, borderRadius:20, padding:"8px 14px", transition:"border-color 0.15s" }}>
            <textarea
              placeholder="Write a reply..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              rows={focused && replyText ? 3 : 1}
              style={{ width:"100%", background:"none", border:"none", outline:"none", resize:"none", fontFamily:"'EB Garamond', Georgia, serif", fontSize:15, color:"#111", lineHeight:1.5 }}
            />
          </div>
          {replyText.trim() && (
            <button onClick={handleReply} disabled={submitting}
              style={{ background:"#111", border:"none", borderRadius:"50%", width:36, height:36, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0, transition:"background 0.15s" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F0EAD8" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function LetterCard({ item, onOpen, selected, onToggleLike, isLiked, onToggleRepublish, isRepublished }) {
  return (
    <article onClick={() => onOpen && onOpen(item)}
      style={{ borderBottom:"1px solid #F0EDE8", padding:"20px 0", cursor:"pointer", background: selected ? "#FDFAF4" : "#fff", borderLeft: selected ? "3px solid #C8A96E" : "3px solid transparent", paddingLeft: selected ? 12 : 0, transition:"all 0.15s" }}
      onMouseEnter={e => { if (selected) return; const s = e.currentTarget.style; s.margin = "0 -12px"; s.padding = "20px 12px"; s.background = "#FDFBF6"; s.boxShadow = "inset 0 0 0 1px #E5DBC8"; s.borderRadius = "12px"; s.borderBottomColor = "transparent"; }}
      onMouseLeave={e => { if (selected) return; const s = e.currentTarget.style; s.margin = "0"; s.padding = "20px 0"; s.background = "#fff"; s.boxShadow = "none"; s.borderRadius = "0"; s.borderBottomColor = "#F0EDE8"; }}>

      {/* Republished banner — shown above the Letter label when this card is a republish */}
      {item.republishedBy && (
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10, color:"#999" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          <span style={{ fontSize:10.5, fontFamily:"'DM Mono', monospace", letterSpacing:"0.03em" }}>Republished from <strong style={{ color:"#777" }}>{item.republishedBy}</strong></span>
        </div>
      )}

      {/* Letter label */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
        <div style={{ width:2, height:14, background:"#C8A96E", borderRadius:2 }}/>
        <span style={{ fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>Letter</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </div>

      {/* Author + body */}
      <div style={{ display:"flex", gap:12, minWidth:0 }}>
        <Avatar initial={item.initial} color={item.color}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <span style={{ fontSize:13, fontWeight:600, color:"#1a1a1a", fontFamily:"'DM Sans', sans-serif" }}>{item.author}</span>
              <span style={{ fontSize:10, color:"#bbb", fontFamily:"'DM Mono', monospace", flexShrink:0 }}>{item.timeAgo}</span>
            </div>
            <div style={{ fontSize:10, fontFamily:"'DM Mono', monospace", marginTop:2, letterSpacing:"0.04em" }}>
              <span style={{ color:"#BBB" }}>by </span>
              <span style={{ color:"#888" }}>{item.username}</span>
              <span style={{ color:statusColors[item.status] || "#AAA", marginLeft:6 }}>
                {contributorStatuses[item.status] || contributorStatuses["contributor"]}
              </span>
            </div>
          </div>
          <p style={{ margin:0, fontSize:14.5, lineHeight:1.65, color:"#333", fontFamily:"'EB Garamond', Georgia, serif", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
            {item.title && <strong style={{ fontFamily:"'Playfair Display', serif", fontWeight:700, display:"block", marginBottom:4, fontSize:15.5 }}>{item.title}</strong>}
            {item.preview}
          </p>

          {/* Source article — below the letter body, only if one is linked */}
          {item.headline && (
            <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginTop:12, padding:"9px 12px", background:"#F9F6F0", borderRadius:8, border:"1px solid #EDE8E0" }}>
              <div style={{ width:2, alignSelf:"stretch", background:"#C8A96E", borderRadius:2, flexShrink:0, minHeight:16 }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:4, marginBottom:2 }}>
                  <span style={{ fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", color:"#BBB", fontFamily:"'DM Mono', monospace" }}>In response to</span>
                </div>
                <span style={{ fontSize:9.5, letterSpacing:"0.1em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{item.publication}</span>
                {item.section && <span style={{ fontSize:9.5, color:"#bbb", fontFamily:"'DM Mono', monospace" }}> · {item.section}</span>}
                <div style={{ fontSize:12, color:"#777", fontFamily:"'EB Garamond', Georgia, serif", fontStyle:"italic", marginTop:2, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:1, WebkitBoxOrient:"vertical" }}>{item.headline}</div>
              </div>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:2 }}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </div>
          )}

          <div style={{ display:"flex", gap:18, marginTop:12, alignItems:"center" }}>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLike && onToggleLike(item); }}
              disabled={!item.isReal}
              style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none", padding:0, cursor: item.isReal ? "pointer" : "default", color: isLiked ? "#C0392B" : "#bbb", fontSize:11, fontFamily:"'DM Sans', sans-serif", transition:"color 0.15s" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={isLiked ? "#C0392B" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {item.likes}
            </button>
            <span style={{ fontSize:11, color:"#bbb", fontFamily:"'DM Sans', sans-serif" }}>↩ {item.replies} replies</span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleRepublish && onToggleRepublish(item); }}
              disabled={!item.isReal}
              title={isRepublished ? "Remove from your feed" : "Republish to your feed"}
              style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none", padding:0, marginLeft:"auto", cursor: item.isReal ? "pointer" : "default", color: isRepublished ? "#117A65" : "#bbb", fontSize:11, fontFamily:"'DM Sans', sans-serif", fontWeight: isRepublished ? 600 : 400, transition:"color 0.15s" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
              {isRepublished ? "Republished" : "Republish"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// Lighter-weight card for short posts (kind === "post"): no "Letter" masthead,
// no title, no source, no 3-line clamp — the whole (short) body is shown.
// Shares the same like / reply / republish actions as LetterCard.
function PostCard({ item, onOpen, selected, onToggleLike, isLiked, onToggleRepublish, isRepublished }) {
  return (
    <article onClick={() => onOpen && onOpen(item)}
      style={{ borderBottom:"1px solid #F0EDE8", padding:"18px 0", cursor:"pointer", background: selected ? "#FDFAF4" : "#fff", borderLeft: selected ? "3px solid #C8A96E" : "3px solid transparent", paddingLeft: selected ? 12 : 0, transition:"all 0.15s" }}
      onMouseEnter={e => { if (selected) return; const s = e.currentTarget.style; s.margin = "0 -12px"; s.padding = "18px 12px"; s.background = "#FDFBF6"; s.boxShadow = "inset 0 0 0 1px #E5DBC8"; s.borderRadius = "12px"; s.borderBottomColor = "transparent"; }}
      onMouseLeave={e => { if (selected) return; const s = e.currentTarget.style; s.margin = "0"; s.padding = "18px 0"; s.background = "#fff"; s.boxShadow = "none"; s.borderRadius = "0"; s.borderBottomColor = "#F0EDE8"; }}>

      {/* Republished banner — same treatment as LetterCard */}
      {item.republishedBy && (
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10, color:"#999" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          <span style={{ fontSize:10.5, fontFamily:"'DM Mono', monospace", letterSpacing:"0.03em" }}>Republished from <strong style={{ color:"#777" }}>{item.republishedBy}</strong></span>
        </div>
      )}

      {/* Post label — muted ink rather than the gold "Letter" masthead */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
        <div style={{ width:2, height:14, background:"#8A7B5C", borderRadius:2 }}/>
        <span style={{ fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase", color:"#8A7B5C", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>Post</span>
      </div>

      <div style={{ display:"flex", gap:12, minWidth:0 }}>
        <Avatar initial={item.initial} color={item.color}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ marginBottom:8 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <span style={{ fontSize:13, fontWeight:600, color:"#1a1a1a", fontFamily:"'DM Sans', sans-serif" }}>{item.author}</span>
              <span style={{ fontSize:10, color:"#bbb", fontFamily:"'DM Mono', monospace", flexShrink:0 }}>{item.timeAgo}</span>
            </div>
            <div style={{ fontSize:10, fontFamily:"'DM Mono', monospace", marginTop:2, letterSpacing:"0.04em" }}>
              <span style={{ color:"#BBB" }}>by </span>
              <span style={{ color:"#888" }}>{item.username}</span>
              <span style={{ color:statusColors[item.status] || "#AAA", marginLeft:6 }}>
                {contributorStatuses[item.status] || contributorStatuses["contributor"]}
              </span>
            </div>
          </div>

          {/* Full post text — short, so no clamp; preserve the writer's line breaks */}
          <p style={{ margin:0, fontSize:15.5, lineHeight:1.6, color:"#222", fontFamily:"'EB Garamond', Georgia, serif", whiteSpace:"pre-wrap" }}>
            {item.fullBody || item.preview}
          </p>

          <div style={{ display:"flex", gap:18, marginTop:12, alignItems:"center" }}>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleLike && onToggleLike(item); }}
              disabled={!item.isReal}
              style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none", padding:0, cursor: item.isReal ? "pointer" : "default", color: isLiked ? "#C0392B" : "#bbb", fontSize:11, fontFamily:"'DM Sans', sans-serif", transition:"color 0.15s" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={isLiked ? "#C0392B" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {item.likes}
            </button>
            <span style={{ fontSize:11, color:"#bbb", fontFamily:"'DM Sans', sans-serif" }}>↩ {item.replies} replies</span>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleRepublish && onToggleRepublish(item); }}
              disabled={!item.isReal}
              title={isRepublished ? "Remove from your feed" : "Republish to your feed"}
              style={{ display:"flex", alignItems:"center", gap:5, background:"none", border:"none", padding:0, marginLeft:"auto", cursor: item.isReal ? "pointer" : "default", color: isRepublished ? "#117A65" : "#bbb", fontSize:11, fontFamily:"'DM Sans', sans-serif", fontWeight: isRepublished ? 600 : 400, transition:"color 0.15s" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
              {isRepublished ? "Republished" : "Republish"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function NewsCard({ item }) {
  // Publication color map
  const pubColors = {
    "Reuters":"#E67E22", "AP News":"#C0392B", "The Guardian":"#27AE60",
    "BBC News":"#2980B9", "BBC Sport":"#F39C12", "ESPN":"#CC0000",
    "NPR":"#8E44AD", "The Atlantic":"#2C3E50", "Wired":"#1A1A1A",
    "Ars Technica":"#E74C3C", "Politico":"#C0392B",
  };
  const pubColor = pubColors[item.publication] || "#888";

  return (
    <article style={{ borderBottom:"1px solid #E8E0D0", padding:"18px 20px", background:"#FDFCF8", margin:"0 -20px" }}>
      {/* News label */}
      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
        <div style={{ width:2, height:14, background:pubColor, borderRadius:2 }}/>
        <span style={{ fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase", color:pubColor, fontFamily:"'DM Mono', monospace", fontWeight:600 }}>News</span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={pubColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", gap:16, alignItems:"flex-start" }}>
        <div style={{ flex:1, minWidth:0 }}>
          {/* Publication */}
          <div style={{ marginBottom:6, display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:3, height:3, borderRadius:"50%", background:pubColor }}/>
            <span style={{ fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:pubColor, fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{item.publication}</span>
            <span style={{ fontSize:10, color:"#aaa", fontFamily:"'DM Mono', monospace" }}> · {item.section}</span>
          </div>
          <h3 style={{ margin:"0 0 7px", fontSize:16, fontWeight:700, lineHeight:1.3, color:"#111", fontFamily:"'Playfair Display', Georgia, serif" }}>{item.headline}</h3>
          <p style={{ margin:"0 0 10px", fontSize:13, lineHeight:1.6, color:"#888", fontFamily:"'EB Garamond', Georgia, serif" }}>{item.summary}</p>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:10, color:"#bbb", fontFamily:"'DM Mono', monospace" }}>{item.timeAgo}</span>
            <span style={{ fontSize:11, color:pubColor, background:`${pubColor}15`, borderRadius:20, padding:"2px 10px", fontFamily:"'DM Sans', sans-serif", fontWeight:500 }}>✉ {item.letters} letters</span>
          </div>
        </div>
        {/* Thumbnail */}
        <div style={{ width:68, height:68, borderRadius:8, background:pubColor, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", opacity:0.15 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={pubColor} strokeWidth="1.5" opacity="4"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        </div>
      </div>
    </article>
  );
}

// ── Shared: Side Nav (desktop) + Hamburger (mobile) ──────────────────────────

const mockPodcasts = [
  { id:1, title:"The AI Accountability Debate", forum:"Technology", duration:"42m", live:false },
  { id:2, title:"Breaking: Senate Budget Crisis", forum:"Politics", duration:"18m", live:true  },
  { id:3, title:"Culture Wars & the Algorithm",  forum:"Culture",   duration:"61m", live:false },
];

const discoverPodcasts = [
  { id:4, title:"The Weekly Letter",          forum:"World",      duration:"34m", live:false, reason:"Popular this week" },
  { id:5, title:"Sports Desk Live",           forum:"Sports",     duration:"28m", live:true,  reason:"Trending in Sports" },
  { id:6, title:"Inside the Economy",         forum:"Economy",    duration:"52m", live:false, reason:"Based on your reads" },
  { id:7, title:"Climate Now",                forum:"Climate",    duration:"41m", live:false, reason:"Based on your reads" },
  { id:8, title:"Press Freedom Roundtable",   forum:"World",      duration:"67m", live:false, reason:"Featured" },
];

const mockBreaking = [
  { id:1, headline:"Markets fall sharply on Fed rate decision", source:"Reuters",      timeAgo:"8m ago",  urgent:true  },
  { id:2, headline:"Major earthquake hits Pacific coast",       source:"AP News",      timeAgo:"22m ago", urgent:true  },
  { id:3, headline:"EU parliament votes on emergency measure",  source:"BBC News",     timeAgo:"41m ago", urgent:false },
];

const discoverPeople = [
  { name:"Elena V.",   username:"elena_v",   status:"journalist",         initial:"E", color:"#117A65" },
  { name:"Thomas R.",  username:"thomas_r",  status:"featured",           initial:"T", color:"#1B4F72" },
  { name:"Sam K.",     username:"sam_k",     status:"contributing-editor",initial:"S", color:"#6E2F8C" },
];

function SideNav({ activeTab, onNavigate, onSignOut, session }) {
  const [sideTab, setSideTab] = useState("breaking");

  const sideTabs = [
    { id:"breaking", label:"Breaking" },
    { id:"discover", label:"Discover" },
    { id:"podcasts", label:"Podcasts" },
    { id:"saved",    label:"Saved"    },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", overflowY:"auto" }}>

      {/* Logo */}
      <div style={{ padding:"20px 16px 16px", borderBottom:"1px solid #F0EDE8", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Logo size={30}/>
          <span style={{ fontFamily:"'Playfair Display', serif", fontSize:16, fontWeight:900, color:"#111", letterSpacing:"-0.01em" }}>Letters<span style={{ color:"#C8A96E" }}>.</span></span>
        </div>
      </div>

      {/* Write CTA */}
      <div style={{ padding:"12px 12px 0", flexShrink:0 }}>
        <button onClick={() => onNavigate("write")}
          style={{ width:"100%", background:"#111", color:"#F0EAD8", border:"none", borderRadius:10, padding:"10px 0", fontSize:12.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          Write a Letter
        </button>
      </div>

      {/* Section tabs */}
      <div style={{ padding:"12px 12px 0", flexShrink:0 }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
          {sideTabs.map(t => (
            <button key={t.id} onClick={() => setSideTab(t.id)}
              style={{ background: sideTab===t.id ? "#F0EDE8" : "none", border:"none", borderRadius:7, padding:"6px 0", fontSize:11, fontFamily:"'DM Sans', sans-serif", fontWeight: sideTab===t.id ? 600 : 400, color: sideTab===t.id ? "#111" : "#AAA", cursor:"pointer", transition:"all 0.15s" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex:1, padding:"12px", overflowY:"auto" }}>

        {/* Breaking News */}
        {sideTab === "breaking" && (
          <div>
            <div style={{ fontSize:9, letterSpacing:"0.16em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace", marginBottom:10 }}>Live Updates</div>
            {mockBreaking.map(item => (
              <div key={item.id} style={{ padding:"10px 0", borderBottom:"1px solid #F0EDE8", cursor:"pointer" }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:7 }}>
                  {item.urgent && <div style={{ width:5, height:5, borderRadius:"50%", background:"#E74C3C", flexShrink:0, marginTop:5, animation:"pulse 1.5s infinite" }}/>}
                  <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:13, lineHeight:1.45, color:"#222", margin:0, fontWeight:500 }}>{item.headline}</p>
                </div>
                <div style={{ display:"flex", gap:6, marginTop:5, paddingLeft: item.urgent ? 12 : 0 }}>
                  <span style={{ fontSize:9.5, color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em" }}>{item.source}</span>
                  <span style={{ fontSize:9.5, color:"#CCC", fontFamily:"'DM Mono', monospace" }}>· {item.timeAgo}</span>
                </div>
              </div>
            ))}
            <button style={{ width:"100%", background:"none", border:"none", padding:"10px 0", fontSize:11, color:"#C8A96E", fontFamily:"'DM Sans', sans-serif", cursor:"pointer", textAlign:"center" }}>
              View all breaking news →
            </button>
          </div>
        )}

        {/* Discover */}
        {sideTab === "discover" && (
          <div>
            <div style={{ fontSize:9, letterSpacing:"0.16em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace", marginBottom:10 }}>Writers to follow</div>
            {discoverPeople.map(person => (
              <div key={person.username} style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 0", borderBottom:"1px solid #F0EDE8" }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:person.color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:12, fontFamily:"'Playfair Display', serif", fontWeight:700, flexShrink:0 }}>{person.initial}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12.5, fontWeight:600, color:"#111", fontFamily:"'DM Sans', sans-serif" }}>{person.name}</div>
                  <div style={{ fontSize:9.5, color: statusColors[person.status] || "#AAA", fontFamily:"'DM Mono', monospace" }}>
                    {contributorStatuses[person.status]}
                  </div>
                </div>
                <button style={{ background:"#111", border:"none", borderRadius:20, padding:"4px 12px", fontSize:10.5, color:"#F0EAD8", fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer", flexShrink:0 }}>Follow</button>
              </div>
            ))}
            <div style={{ fontSize:9, letterSpacing:"0.16em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace", margin:"14px 0 10px" }}>Forums to join</div>
            {[{name:"AI & Society",color:"#1A1A1A"},{name:"World Affairs",color:"#2C3E50"},{name:"Sports Central",color:"#F39C12"}].map(f => (
              <div key={f.name} style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 0", borderBottom:"1px solid #F0EDE8" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:f.color, flexShrink:0 }}/>
                <span style={{ flex:1, fontSize:12.5, fontFamily:"'DM Sans', sans-serif", color:"#333" }}>{f.name}</span>
                <button style={{ background:"none", border:"1px solid #E0D8CC", borderRadius:20, padding:"3px 10px", fontSize:10.5, color:"#888", fontFamily:"'DM Sans', sans-serif", cursor:"pointer" }}>Join</button>
              </div>
            ))}
          </div>
        )}

        {/* Podcasts */}
        {sideTab === "podcasts" && (
          <div>
            {/* Recent episodes */}
            <div style={{ fontSize:9, letterSpacing:"0.16em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace", marginBottom:10 }}>Recent episodes</div>
            {mockPodcasts.map(pod => (
              <div key={pod.id} style={{ padding:"10px 0", borderBottom:"1px solid #F0EDE8", cursor:"pointer" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:36, height:36, borderRadius:8, background:"#111", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, position:"relative" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#C8A96E"><polygon points="5,3 19,12 5,21"/></svg>
                    {pod.live && <div style={{ position:"absolute", top:-3, right:-3, width:8, height:8, borderRadius:"50%", background:"#E74C3C", border:"1.5px solid #fff" }}/>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12.5, fontWeight:600, color:"#111", fontFamily:"'DM Sans', sans-serif", lineHeight:1.3, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{pod.title}</div>
                    <div style={{ display:"flex", gap:6, marginTop:3 }}>
                      <span style={{ fontSize:9.5, color:"#C8A96E", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.08em", fontWeight:600 }}>{pod.forum}</span>
                      {pod.live
                        ? <span style={{ fontSize:9.5, color:"#E74C3C", fontFamily:"'DM Mono', monospace" }}>· LIVE</span>
                        : <span style={{ fontSize:9.5, color:"#CCC", fontFamily:"'DM Mono', monospace" }}>· {pod.duration}</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Discover */}
            <div style={{ fontSize:9, letterSpacing:"0.16em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace", margin:"16px 0 10px" }}>Discover</div>
            {discoverPodcasts.map(pod => (
              <div key={pod.id} style={{ padding:"9px 0", borderBottom:"1px solid #F0EDE8", cursor:"pointer" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:7, background:"#F0EDE8", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, position:"relative" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#C8BFA8"><polygon points="5,3 19,12 5,21"/></svg>
                    {pod.live && <div style={{ position:"absolute", top:-3, right:-3, width:7, height:7, borderRadius:"50%", background:"#E74C3C", border:"1.5px solid #fff" }}/>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:500, color:"#333", fontFamily:"'DM Sans', sans-serif", lineHeight:1.3, display:"-webkit-box", WebkitLineClamp:1, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{pod.title}</div>
                    <div style={{ display:"flex", gap:6, marginTop:2, alignItems:"center" }}>
                      <span style={{ fontSize:9, color:"#C8A96E", fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.06em", fontWeight:600 }}>{pod.forum}</span>
                      {pod.live
                        ? <span style={{ fontSize:9, color:"#E74C3C", fontFamily:"'DM Mono', monospace" }}>· LIVE</span>
                        : <span style={{ fontSize:9, color:"#CCC", fontFamily:"'DM Mono', monospace" }}>· {pod.duration}</span>
                      }
                    </div>
                    <div style={{ fontSize:9, color:"#BBB", fontFamily:"'DM Mono', monospace", marginTop:1, fontStyle:"italic" }}>{pod.reason}</div>
                  </div>
                </div>
              </div>
            ))}

            <button style={{ width:"100%", background:"none", border:"none", padding:"12px 0 2px", fontSize:11, color:"#C8A96E", fontFamily:"'DM Sans', sans-serif", cursor:"pointer", textAlign:"center", fontWeight:500 }}>
              Browse all podcasts →
            </button>
          </div>
        )}

        {/* Saved */}
        {sideTab === "saved" && (
          <div style={{ textAlign:"center", padding:"24px 0" }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"#F0EDE8", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8BFA8" strokeWidth="1.8"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:8 }}>Nothing saved yet</div>
            <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:13, color:"#AAA", margin:0, lineHeight:1.5 }}>Bookmark letters and articles to read them later.</p>
          </div>
        )}
      </div>

      {/* Sign out */}
      <div style={{ padding:"12px", borderTop:"1px solid #F0EDE8", flexShrink:0 }}>
        <button onClick={onSignOut}
          style={{ width:"100%", background:"none", color:"#BBB", border:"none", padding:"8px 0", fontSize:11.5, fontFamily:"'DM Sans', sans-serif", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign out
        </button>
      </div>
    </div>
  );
}

function FeedPage({ onSignOut, session, onNavigate, activeTab }) {
  const [activeFeedTab, setActiveFeedTab] = useState("for-you");
  const navigate = useNavigate();
  const { letterId } = useParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [realLetters, setRealLetters] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [myLikedLetterIds, setMyLikedLetterIds] = useState([]); // dbIds the current user has liked, for feed-card hearts
  const [myRepublishedLetterIds, setMyRepublishedLetterIds] = useState([]); // dbIds the current user has republished
  const [republishCounts, setRepublishCounts] = useState({}); // dbId -> count
  const [republishEntries, setRepublishEntries] = useState([]); // extra feed cards representing other users' republishes
  const [myProfile, setMyProfile] = useState(null);

  // Quick-post composer at the top of the feed (short posts, kind === "post")
  const [composeText, setComposeText] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composingPost, setComposingPost] = useState(false);
  const COMPOSE_LIMIT = 216;

  // Follow graph — the set of user_ids the current user follows
  const [myFollowing, setMyFollowing] = useState([]);
  const [followBusy, setFollowBusy] = useState(false);
  const isFollowing = (uid) => myFollowing.includes(uid);

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase.from("follows").select("following_id").eq("follower_id", session.user.id)
      .then(({ data }) => { if (data) setMyFollowing(data.map(f => f.following_id)); });
  }, [session?.user?.id]);

  const toggleFollow = async (targetId) => {
    if (!session?.user?.id || !targetId || targetId === session.user.id) return;
    setFollowBusy(true);
    const already = myFollowing.includes(targetId);
    if (already) {
      setMyFollowing(prev => prev.filter(id => id !== targetId)); // optimistic
      const { error } = await supabase.from("follows").delete()
        .eq("follower_id", session.user.id).eq("following_id", targetId);
      if (error) { setMyFollowing(prev => [...prev, targetId]); console.error("Unfollow failed:", error); }
    } else {
      setMyFollowing(prev => [...prev, targetId]); // optimistic
      const { error } = await supabase.from("follows")
        .insert({ follower_id: session.user.id, following_id: targetId });
      if (error) { setMyFollowing(prev => prev.filter(id => id !== targetId)); console.error("Follow failed:", error); }
    }
    setFollowBusy(false);
  };

  // Pull-to-refresh state — tracks gesture distance and refresh phase for the wax-seal animation
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullStartY = useRef(null);
  const feedScrollRef = useRef(null);
  const PULL_THRESHOLD = 80; // px of pull needed to trigger a refresh

  const handleTouchStart = (e) => {
    if (feedScrollRef.current && feedScrollRef.current.scrollTop <= 0) {
      pullStartY.current = e.touches[0].clientY;
    } else {
      pullStartY.current = null;
    }
  };

  const handleTouchMove = (e) => {
    if (pullStartY.current === null || isRefreshing) return;
    const delta = e.touches[0].clientY - pullStartY.current;
    if (delta > 0) {
      setPullDistance(Math.min(delta * 0.5, 120)); // dampened, capped pull
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD); // hold the seal in place while refreshing
      await fetchRealLetters();
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 600); // let the seal animation finish before retracting
    } else {
      setPullDistance(0);
    }
    pullStartY.current = null;
  };

  // Fetch the current user's own profile once, so we can label their own republishes correctly
  useEffect(() => {
    if (!session?.user?.id) return;
    supabase.from("profiles").select("username, full_name").eq("id", session.user.id).single()
      .then(({ data }) => { if (data) setMyProfile(data); });
  }, [session?.user?.id]);

  // Likes/replies for the currently open letter
  const [letterLikes, setLetterLikes] = useState([]); // array of user_ids who liked
  const [letterReplies, setLetterReplies] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyFocused, setReplyFocused] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);

  // Color palette to assign to real authors based on a hash of their user_id (consistent per-person)
  const avatarColors = ["#2D6A4F","#1B4F72","#6B2D8B","#7A3B1E","#117A65","#8E5C2E","#3B5998","#A23B3B"];
  const colorForId = (id) => avatarColors[(id || "").split("").reduce((a,c)=>a+c.charCodeAt(0),0) % avatarColors.length];

  const timeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const stripHtml = (html) => {
    if (!html) return "";
    if (typeof document === "undefined") return html;
    // Insert a space wherever a block-level boundary was, so paragraphs and
    // line breaks don't collapse directly into the next word with no gap
    // (e.g. "...mobile" + "News feed..." becoming "...mobileNews feed...").
    const withSpacing = html
      .replace(/<\/(p|div|li|blockquote|h[1-6])>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ");
    const div = document.createElement("div");
    div.innerHTML = withSpacing;
    return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
  };

  const fetchRealLetters = async () => {
    setLoadingFeed(true);
    // Fetch letters joined with their author's profile info
    const { data, error } = await supabase
      .from("letters")
      .select("*, profiles:user_id (username, full_name, status)")
      .order("created_at", { ascending: false })
      .limit(50);

      if (!error && data) {
        // Fetch all likes + replies + republishes once, then derive per-letter data client-side (fine at beta scale)
        const letterIds = data.map(l => l.id);
        const [{ data: allLikes }, { data: allReplies }, { data: allRepublishes }] = await Promise.all([
          letterIds.length ? supabase.from("likes").select("letter_id, user_id").in("letter_id", letterIds) : { data: [] },
          letterIds.length ? supabase.from("replies").select("letter_id").in("letter_id", letterIds) : { data: [] },
          letterIds.length ? supabase.from("republishes").select("*, profiles:user_id (username, full_name)").in("letter_id", letterIds) : { data: [] },
        ]);
        const likeCounts = {};
        (allLikes || []).forEach(l => { likeCounts[l.letter_id] = (likeCounts[l.letter_id] || 0) + 1; });
        const myLiked = (allLikes || []).filter(l => l.user_id === session?.user?.id).map(l => l.letter_id);
        setMyLikedLetterIds(myLiked);
        const replyCounts = {};
        (allReplies || []).forEach(r => { replyCounts[r.letter_id] = (replyCounts[r.letter_id] || 0) + 1; });

        const repubCounts = {};
        (allRepublishes || []).forEach(r => { repubCounts[r.letter_id] = (repubCounts[r.letter_id] || 0) + 1; });
        setRepublishCounts(repubCounts);
        const myRepublished = (allRepublishes || []).filter(r => r.user_id === session?.user?.id).map(r => r.letter_id);
        setMyRepublishedLetterIds(myRepublished);

        const mapped = data.map(letter => {
          const profile = letter.profiles || {};
          const plainBody = stripHtml(letter.body);
          return {
            id: `real-${letter.id}`,
            dbId: letter.id,
            type: "letter",
            kind: letter.kind || "letter", // "letter" (long) or "post" (short) — drives which feed card renders
            isReal: true,
            userId: letter.user_id, // author — used by the follow button + Following filter
            author: profile.full_name || profile.username || "Anonymous",
            username: profile.username || "user",
            status: profile.status || "contributor",
            initial: (profile.full_name || profile.username || "A")[0].toUpperCase(),
            color: colorForId(letter.user_id),
            timeAgo: timeAgo(letter.created_at),
            createdAt: letter.created_at,
            section: letter.source_publication ? "" : "General",
            publication: letter.source_publication || "",
            headline: letter.source_title || "",
            title: letter.title,
            preview: plainBody.length > 280 ? plainBody.slice(0, 280) + "…" : plainBody,
            fullBody: letter.body,
            replies: replyCounts[letter.id] || 0,
            likes: likeCounts[letter.id] || 0,
          };
        });
        setRealLetters(mapped);

        // Build separate feed cards for every republish — including your own —
        // each shows "Republished from {original author}" with the republisher's
        // own timestamp, but otherwise mirrors the original letter's content.
        const byId = {};
        mapped.forEach(l => { byId[l.dbId] = l; });
        const repubEntries = (allRepublishes || [])
          .map(r => {
            const original = byId[r.letter_id];
            if (!original) return null;
            const republisherProfile = r.profiles || {};
            return {
              ...original,
              id: `republish-${r.id}`,
              dbId: original.dbId,
              timeAgo: timeAgo(r.created_at),
              createdAt: r.created_at,
              republishedBy: republisherProfile.full_name || republisherProfile.username || "someone",
              republishedByMe: r.user_id === session?.user?.id,
            };
          })
          .filter(Boolean);
        setRepublishEntries(repubEntries);
      }
    setLoadingFeed(false);
  };

  useEffect(() => {
    fetchRealLetters();
  }, []);

  // Minimal derivation needed early — full combinedFeed-based lookup happens
  // later once republishEntries/mockFeed are in scope; this covers the most
  // common case (a real letter) for the likes/replies effect below.
  const openLetterEarly = letterId
    ? realLetters.find(item => item.dbId === letterId) || null
    : null;

  // Fetch likes + replies whenever a real letter is opened
  useEffect(() => {
    if (!openLetterEarly || !openLetterEarly.isReal) {
      setLetterLikes([]);
      setLetterReplies([]);
      return;
    }
    const fetchDetail = async () => {
      setLoadingDetail(true);
      const [{ data: likesData }, { data: repliesData }] = await Promise.all([
        supabase.from("likes").select("user_id").eq("letter_id", openLetterEarly.dbId),
        supabase.from("replies").select("*, profiles:user_id (username, full_name, status)").eq("letter_id", openLetterEarly.dbId).order("created_at", { ascending: true }),
      ]);
      setLetterLikes((likesData || []).map(l => l.user_id));
      setLetterReplies((repliesData || []).map(r => ({
        id: r.id,
        author: r.profiles?.full_name || r.profiles?.username || "Anonymous",
        initial: (r.profiles?.full_name || r.profiles?.username || "A")[0].toUpperCase(),
        color: colorForId(r.user_id),
        timeAgo: timeAgo(r.created_at),
        body: r.body,
      })));
      setLoadingDetail(false);
    };
    fetchDetail();
  }, [openLetterEarly?.dbId]);

  const isLikedByMe = letterLikes.includes(session?.user?.id);

  // Works for any letter — used directly by feed cards, and by the detail pane below
  const toggleFeedLike = async (letterItem) => {
    if (!letterItem?.isReal || !session?.user?.id) return;
    const wasLiked = myLikedLetterIds.includes(letterItem.dbId);
    const newLiked = !wasLiked;

    // Optimistic UI updates
    setMyLikedLetterIds(prev => newLiked ? [...prev, letterItem.dbId] : prev.filter(id => id !== letterItem.dbId));
    setRealLetters(prev => prev.map(l => l.dbId === letterItem.dbId ? { ...l, likes: newLiked ? l.likes + 1 : Math.max(0, l.likes - 1) } : l));
    if (openLetter?.dbId === letterItem.dbId) {
      setLetterLikes(prev => newLiked ? [...prev, session.user.id] : prev.filter(id => id !== session.user.id));
    }

    if (newLiked) {
      await supabase.from("likes").insert({ letter_id: letterItem.dbId, user_id: session.user.id });
    } else {
      await supabase.from("likes").delete().eq("letter_id", letterItem.dbId).eq("user_id", session.user.id);
    }
  };

  // Detail pane's like button just delegates to the shared toggle for the open letter
  const toggleLike = () => openLetter && toggleFeedLike(openLetter);

  const toggleRepublish = async (letterItem) => {
    if (!letterItem?.isReal || !session?.user?.id) return;
    const wasRepublished = myRepublishedLetterIds.includes(letterItem.dbId);
    const newRepublished = !wasRepublished;
    const myName = myProfile?.full_name || myProfile?.username || session.user.email?.split("@")[0] || "You";

    // Optimistic UI update
    setMyRepublishedLetterIds(prev => newRepublished ? [...prev, letterItem.dbId] : prev.filter(id => id !== letterItem.dbId));
    setRepublishCounts(prev => ({ ...prev, [letterItem.dbId]: Math.max(0, (prev[letterItem.dbId] || 0) + (newRepublished ? 1 : -1)) }));

    if (newRepublished) {
      // Add a feed card right away so the repost shows up immediately, no refresh needed
      const { data } = await supabase.from("republishes").insert({ letter_id: letterItem.dbId, user_id: session.user.id }).select().single();
      setRepublishEntries(prev => [
        {
          ...letterItem,
          id: `republish-${data?.id || `temp-${Date.now()}`}`,
          dbId: letterItem.dbId,
          timeAgo: "Just now",
          createdAt: new Date().toISOString(),
          republishedBy: myName,
          republishedByMe: true,
        },
        ...prev,
      ]);
    } else {
      await supabase.from("republishes").delete().eq("letter_id", letterItem.dbId).eq("user_id", session.user.id);
      setRepublishEntries(prev => prev.filter(e => !(e.dbId === letterItem.dbId && e.republishedByMe)));
    }
  };

  const submitReply = async () => {
    if (!replyText.trim() || !openLetter?.isReal || !session?.user?.id) return;
    setSubmittingReply(true);
    const myName = myProfile?.full_name || myProfile?.username || session.user.email?.split("@")[0] || "You";
    const { data, error } = await supabase
      .from("replies")
      .insert({ letter_id: openLetter.dbId, user_id: session.user.id, body: replyText.trim() })
      .select()
      .single();
    if (error) {
      console.error("Reply failed:", error);
      alert(`Reply failed: ${error.message}`);
    } else if (data) {
      setLetterReplies(prev => [...prev, {
        id: data.id,
        author: myName,
        initial: myName[0].toUpperCase(),
        color: colorForId(session.user.id),
        timeAgo: "Just now",
        body: data.body,
      }]);
      setReplyText("");
      setRealLetters(prev => prev.map(l => l.dbId === openLetter.dbId ? { ...l, replies: l.replies + 1 } : l));
    }
    setSubmittingReply(false);
  };

  // Publish a short post from the feed compose box, then drop it into the feed
  // immediately (optimistic) so it appears without a refresh.
  const submitPost = async () => {
    if (!composeText.trim() || !session?.user?.id) return;
    setComposingPost(true);
    const myName = myProfile?.full_name || myProfile?.username || session.user.email?.split("@")[0] || "You";
    const { data, error } = await supabase
      .from("letters")
      .insert({ user_id: session.user.id, body: composeText.trim(), kind: "post" })
      .select()
      .single();
    if (error) {
      console.error("Post failed:", error);
      alert(`Post failed: ${error.message}`);
    } else if (data) {
      const plain = composeText.trim();
      setRealLetters(prev => [{
        id: `real-${data.id}`, dbId: data.id, type: "letter", kind: "post", isReal: true,
        userId: session.user.id,
        author: myName, username: myProfile?.username || "you", status: myProfile?.status || "founding",
        initial: myName[0].toUpperCase(), color: colorForId(session.user.id),
        timeAgo: "Just now", createdAt: data.created_at || new Date().toISOString(),
        section: "", publication: "", headline: "", title: null,
        preview: plain, fullBody: plain, replies: 0, likes: 0,
      }, ...prev]);
      setComposeText("");
      setComposeOpen(false);
    }
    setComposingPost(false);
  };

  // Merge real letters with mock news cards, sorted so real content appears woven in naturally
  const combinedFeedBase = [...realLetters, ...republishEntries, ...mockFeed].sort((a, b) => {
    if (a.isReal && !b.isReal) return -1;
    if (!a.isReal && b.isReal) return 1;
    return 0;
  });

  // "Latest" — pure chronological sort across everything that has a real timestamp.
  // Mock items (which don't carry a real createdAt) sink to the bottom rather than
  // disappearing, so the tab never looks emptier than For You.
  const latestFeed = [...combinedFeedBase].sort((a, b) => {
    if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
    if (a.createdAt && !b.createdAt) return -1;
    if (!a.createdAt && b.createdAt) return 1;
    return 0;
  });

  // "Following" tab: show only people you follow; if you follow no one yet, fall back to everyone.
  const followingFeed =
    myFollowing.length === 0
      ? combinedFeedBase
      : combinedFeedBase.filter(item => item.isReal && item.userId && myFollowing.includes(item.userId));

  const combinedFeed =
    activeFeedTab === "latest" ? latestFeed :
    activeFeedTab === "following" ? followingFeed :
    combinedFeedBase;

  // Derive the open letter from the URL param (e.g. /feed/letter/abc123) instead
  // of separate local state, so individual letters are real, shareable URLs.
  // Real letters use their dbId (a UUID); mock letters use a "mock-N" slug
  // since they don't have a database id of their own.
  const openLetter = letterId
    ? combinedFeed.find(item => item.dbId === letterId) ||
      realLetters.find(item => item.dbId === letterId) ||
      combinedFeed.find(item => `mock-${item.id}` === letterId && !item.isReal) ||
      null
    : null;

  const setOpenLetter = (item) => {
    if (!item) { navigate("/feed"); return; }
    const slug = item.dbId ? item.dbId : `mock-${item.id}`;
    navigate(`/feed/letter/${slug}`);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#fff" }}>

      {/* Mobile hamburger header */}
      <header className="letters-hamburger" style={{ position:"sticky", top:0, zIndex:50, background:"rgba(255,255,255,0.97)", backdropFilter:"blur(10px)", borderBottom:"1px solid #F0EDE8" }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"0 20px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Logo size={32}/>
            <span style={{ fontFamily:"'Playfair Display', serif", fontSize:17, fontWeight:900, color:"#111" }}>Letters<span style={{ color:"#C8A96E" }}>.</span></span>
          </div>
          <button onClick={() => setMenuOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:6, color:"#555" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </header>

      {/* Mobile slide-out menu */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:70, backdropFilter:"blur(2px)" }}/>
          <div style={{ position:"fixed", top:0, left:0, bottom:0, width:260, background:"#fff", zIndex:80, boxShadow:"4px 0 24px rgba(0,0,0,0.12)", display:"flex", flexDirection:"column" }}>
            <button onClick={() => setMenuOpen(false)} style={{ position:"absolute", top:14, right:14, background:"none", border:"none", cursor:"pointer", color:"#AAA", padding:4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
            <SideNav activeTab={activeTab} onNavigate={(tab) => { onNavigate(tab); setMenuOpen(false); }} onSignOut={onSignOut} session={session}/>
          </div>
        </>
      )}

      {/* ── Desktop: split pane layout ── */}
      <div className="letters-split" style={{ display:"block" }}>
        <style>{`
          @media (min-width: 768px) {
            .letters-split { display: flex !important; height: 100vh; overflow: hidden; }
            .letters-feed-pane { overflow-y: auto; border-right: 1px solid #F0EDE8; flex-shrink: 0; }
            .letters-detail-pane {
              display: flex !important;
              overflow-y: auto;
              flex: 1;
              position: static !important;
              top: auto !important; left: auto !important; right: auto !important; bottom: auto !important;
              z-index: auto !important;
            }
          }
        `}</style>

        {/* Feed pane — wider when nothing is open, narrows once a letter is selected */}
        <div
          ref={feedScrollRef}
          className={`letters-feed-pane${openLetter ? "" : " is-expanded"}`}
          style={{ width:"100%", paddingBottom:80, position:"relative" }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Pull-to-refresh wax seal animation */}
          {pullDistance > 0 && (
            <div style={{
              position:"absolute", top:0, left:0, right:0, height:pullDistance,
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:6,
              overflow:"hidden", transition: isRefreshing ? "none" : "height 0.2s ease",
              zIndex:5, pointerEvents:"none",
            }}>
              <style>{`
                @keyframes seal-press { 0% { transform: scale(0.7) rotate(-8deg); opacity: 0.4; } 60% { transform: scale(1.08) rotate(2deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
                @keyframes seal-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.06); } }
              `}</style>
              <div style={{
                width:44, height:44, borderRadius:"50%",
                background: pullDistance >= PULL_THRESHOLD ? "#C8A96E" : "#E8D5A8",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:"0 2px 8px rgba(200,169,110,0.35)",
                animation: isRefreshing ? "seal-pulse 0.9s ease-in-out infinite" : (pullDistance >= PULL_THRESHOLD ? "seal-press 0.3s ease-out" : "none"),
                opacity: Math.min(pullDistance / PULL_THRESHOLD, 1),
              }}>
                {/* Wax seal icon — a simple stamped emblem motif */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="8"/>
                  <path d="M12 8v4l3 2"/>
                </svg>
              </div>
              {pullDistance > 30 && (
                <span style={{ fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", opacity:Math.min((pullDistance-20)/40, 1) }}>
                  {isRefreshing ? "Sealing..." : pullDistance >= PULL_THRESHOLD ? "Release to refresh" : "Pull to refresh"}
                </span>
              )}
            </div>
          )}

          <div style={{ transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : "none", transition: isRefreshing ? "none" : "transform 0.2s ease" }}>
          <div style={{ maxWidth: openLetter ? 600 : 720, margin:"0 auto", padding:"0 20px" }}>
            <div style={{ display:"flex", alignItems:"center", borderBottom:"1px solid #F0EDE8", marginTop:8 }}>
              <div style={{ display:"flex", flex:1 }}>
                {["For You","Following","Latest"].map(t => (
                  <button key={t} onClick={() => setActiveFeedTab(t.toLowerCase().replace(" ","-"))}
                    style={{ background:"none", border:"none", borderBottom:activeFeedTab===t.toLowerCase().replace(" ","-")?"2px solid #C8A96E":"2px solid transparent", padding:"12px 16px", fontSize:13, fontFamily:"'DM Sans', sans-serif", fontWeight:activeFeedTab===t.toLowerCase().replace(" ","-")?600:400, color:activeFeedTab===t.toLowerCase().replace(" ","-")?"#111":"#bbb", cursor:"pointer" }}>{t}
                  </button>
                ))}
              </div>
              <button
                onClick={async () => {
                  if (isRefreshing) return;
                  setIsRefreshing(true);
                  await fetchRealLetters();
                  setTimeout(() => setIsRefreshing(false), 400);
                }}
                title="Refresh feed"
                style={{ background:"none", border:"none", cursor: isRefreshing ? "default" : "pointer", color:"#BBB", padding:"8px 12px", display:"flex", alignItems:"center" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ animation: isRefreshing ? "spin 0.8s linear infinite" : "none" }}>
                  <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
              </button>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>

            {/* Quick-post composer — short posts (kind: "post") straight from the feed */}
            <div style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"14px 0", borderBottom:"1px solid #F0EDE8" }}>
              <Avatar initial={(myProfile?.full_name || myProfile?.username || session?.user?.email?.[0] || "Y")[0].toUpperCase()} color="#C8A96E" size={38}/>
              <div style={{ flex:1, minWidth:0 }}>
                <textarea
                  value={composeText}
                  onChange={e => setComposeText(e.target.value.slice(0, COMPOSE_LIMIT))}
                  onFocus={() => setComposeOpen(true)}
                  placeholder="Share a quick post…"
                  rows={composeOpen ? 3 : 1}
                  style={{ width:"100%", border:`1px solid ${composeOpen ? "#C8A96E" : "#E8E0D0"}`, borderRadius:12, padding:"10px 14px", fontFamily:"'EB Garamond', Georgia, serif", fontSize:15, lineHeight:1.5, color:"#111", background:"#FDFCF8", outline:"none", resize:"none", boxSizing:"border-box", transition:"border-color 0.15s" }}
                />
                {composeOpen && (
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
                    <span style={{ fontSize:11, color: composeText.length > COMPOSE_LIMIT - 50 ? "#C0392B" : "#CCC", fontFamily:"'DM Mono', monospace" }}>{composeText.length}/{COMPOSE_LIMIT}</span>
                    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                      <button onClick={() => { setComposeText(""); setComposeOpen(false); }}
                        style={{ background:"none", border:"none", fontSize:12, color:"#BBB", fontFamily:"'DM Sans', sans-serif", cursor:"pointer" }}>Cancel</button>
                      <button onClick={submitPost} disabled={composingPost || !composeText.trim()}
                        style={{ background: composeText.trim() ? "#111" : "#E8E0D0", color: composeText.trim() ? "#F0EAD8" : "#AAA", border:"none", borderRadius:20, padding:"7px 18px", fontSize:12.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor: composeText.trim() ? "pointer" : "default" }}>
                        {composingPost ? "Posting…" : "Post"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {loadingFeed && realLetters.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 0", fontSize:11, color:"#CCC", fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em" }}>Loading feed...</div>
            ) : activeFeedTab === "following" && myFollowing.length > 0 && combinedFeed.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DDD8CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom:16 }}>
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <div style={{ fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:10 }}>Quiet in here</div>
                <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:15, color:"#AAA", margin:0, maxWidth:280, marginLeft:"auto", marginRight:"auto", lineHeight:1.6 }}>
                  No new letters from the writers you follow yet. Explore For You to find more voices.
                </p>
              </div>
            ) : combinedFeed.map(item => {
              if (item.type !== "letter") return <NewsCard key={item.id} item={item}/>;
              // For real letters and republish entries, pull the freshest like/reply counts
              // from realLetters so a like/reply made anywhere updates every card showing this letter.
              const live = item.isReal ? realLetters.find(l => l.dbId === item.dbId) : null;
              const displayItem = live ? { ...item, likes: live.likes, replies: live.replies } : item;
              // Short posts render through the lighter PostCard; long letters keep LetterCard.
              const CardComp = item.kind === "post" ? PostCard : LetterCard;
              return (
                <CardComp
                  key={item.id}
                  item={displayItem}
                  onOpen={setOpenLetter}
                  selected={openLetter?.id === item.id}
                  onToggleLike={toggleFeedLike}
                  isLiked={item.isReal && myLikedLetterIds.includes(item.dbId)}
                  onToggleRepublish={toggleRepublish}
                  isRepublished={item.isReal && myRepublishedLetterIds.includes(item.dbId)}
                />
              );
            })}
            <div style={{ height:40 }}/>
          </div>
          </div>
        </div>

        {/* Detail pane — full-screen overlay on mobile when a letter is open, side pane on desktop */}
        <div
          className="letters-detail-pane"
          style={{
            display: openLetter ? "flex" : "none",
            background: "#fff",
            minHeight: "100vh",
            position: openLetter ? "fixed" : "static",
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: openLetter ? 100 : "auto",
            overflowY: "auto",
          }}
        >
          {openLetter ? (
            <div style={{ width:"100%", paddingBottom:60 }}>
              {/* Close bar */}
              <div style={{ position:"sticky", top:0, background:"rgba(253,252,248,0.97)", backdropFilter:"blur(10px)", borderBottom:"1px solid #F0EDE8", padding:"0 24px", height:48, display:"flex", alignItems:"center", justifyContent:"space-between", zIndex:10 }}>
                <span style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace" }}>Letter</span>
                <button onClick={() => setOpenLetter(null)} style={{ background:"none", border:"none", cursor:"pointer", color:"#BBB", padding:4, display:"flex", alignItems:"center", gap:5, fontSize:12, fontFamily:"'DM Sans', sans-serif" }}>
                  Close
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
                </button>
              </div>

              <LetterCover height={140} />

              <div style={{ padding:"24px 28px" }}>
                {/* Source — only if linked */}
                {openLetter.headline && (
                  <div style={{ display:"flex", alignItems:"flex-start", gap:10, marginBottom:20, padding:"12px 14px", background:"#F0EDE8", borderRadius:10, border:"1px solid #E8E0D0" }}>
                    <div style={{ width:2, background:"#C8A96E", borderRadius:2, alignSelf:"stretch", flexShrink:0, minHeight:14 }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ marginBottom:2 }}>
                        <span style={{ fontSize:9.5, letterSpacing:"0.1em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{openLetter.publication}</span>
                        {openLetter.section && <span style={{ fontSize:9.5, color:"#BBB", fontFamily:"'DM Mono', monospace" }}> · {openLetter.section}</span>}
                      </div>
                      <div style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:13.5, color:"#666", fontStyle:"italic", lineHeight:1.4 }}>{openLetter.headline}</div>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </div>
                )}

                {/* Author */}
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
                  <Avatar initial={openLetter.initial} color={openLetter.color} size={44}/>
                  <div>
                    <div style={{ fontSize:15, fontWeight:600, color:"#111", fontFamily:"'DM Sans', sans-serif" }}>{openLetter.author}</div>
                    <div style={{ fontSize:10, fontFamily:"'DM Mono', monospace", marginTop:2 }}>
                      <span style={{ color:"#BBB" }}>by </span>
                      <span style={{ color:"#777" }}>{openLetter.username}</span>
                      <span style={{ color: statusColors[openLetter.status] || "#AAA", marginLeft:5 }}>{contributorStatuses[openLetter.status] || contributorStatuses["contributor"]}</span>
                    </div>
                  </div>
                  <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:12 }}>
                    {openLetter.isReal && openLetter.userId && session?.user?.id && openLetter.userId !== session.user.id && (
                      <button onClick={() => toggleFollow(openLetter.userId)} disabled={followBusy}
                        style={{
                          background: isFollowing(openLetter.userId) ? "#F0EDE8" : "#111",
                          color: isFollowing(openLetter.userId) ? "#888" : "#F0EAD8",
                          border: isFollowing(openLetter.userId) ? "1px solid #E0D8CC" : "none",
                          borderRadius:20, padding:"6px 16px", fontSize:12, fontFamily:"'DM Sans', sans-serif", fontWeight:600,
                          cursor: followBusy ? "default" : "pointer", transition:"all 0.15s", whiteSpace:"nowrap"
                        }}>
                        {isFollowing(openLetter.userId) ? "Following" : "Follow"}
                      </button>
                    )}
                    <span style={{ fontSize:10, color:"#BBB", fontFamily:"'DM Mono', monospace" }}>{openLetter.timeAgo}</span>
                  </div>
                </div>

                {/* Title, if present */}
                {openLetter.title && (
                  <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:24, fontWeight:800, color:"#111", margin:"0 0 14px", lineHeight:1.2 }}>{openLetter.title}</h2>
                )}

                {/* Full body — posts render plain text with line breaks preserved; real letters render their HTML; mock letters use placeholder paragraphs */}
                {openLetter.isReal ? (
                  openLetter.kind === "post" ? (
                    <div style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:17, lineHeight:1.85, color:"#222", marginBottom:24, whiteSpace:"pre-wrap" }}>
                      {openLetter.fullBody || ""}
                    </div>
                  ) : (
                    <div style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:17, lineHeight:1.85, color:"#222", marginBottom:24 }}
                      dangerouslySetInnerHTML={{ __html: openLetter.fullBody || "" }}/>
                  )
                ) : (
                  <div style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:17, lineHeight:1.85, color:"#222", marginBottom:24 }}>
                    <p style={{ margin:"0 0 16px" }}>{openLetter.preview}</p>
                    <p style={{ margin:"0 0 16px" }}>The data tells one story, but the lived experience of communities like Youngstown, Gary, and Flint tells another. When we talk about "middle class decline," we're often really talking about the collapse of a particular kind of place — the industrial city that built American prosperity and has been hollowed out over fifty years of deindustrialization, disinvestment, and demographic change.</p>
                    <p style={{ margin:0 }}>What this piece gets right is the urgency. What it misses is the geography. Not all of America is declining equally, and our policy responses need to reflect that complexity rather than treating the middle class as a monolith.</p>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display:"flex", alignItems:"center", gap:16, paddingBottom:20, borderBottom:"1px solid #F0EDE8", marginBottom:20 }}>
                  <button onClick={toggleLike} disabled={!openLetter.isReal}
                    style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor: openLetter.isReal ? "pointer" : "default", padding:0, color: isLikedByMe ? "#C0392B" : "#AAA", fontFamily:"'DM Sans', sans-serif", fontSize:13, transition:"color 0.15s" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isLikedByMe ? "#C0392B" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    {openLetter.isReal ? letterLikes.length : openLetter.likes}
                  </button>
                  <div style={{ display:"flex", alignItems:"center", gap:6, color:"#AAA", fontFamily:"'DM Sans', sans-serif", fontSize:13 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {openLetter.isReal ? letterReplies.length : openLetter.replies} replies
                  </div>
                </div>

                {/* Replies */}
                <div style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace", marginBottom:14 }}>
                  {openLetter.isReal ? `${letterReplies.length} ${letterReplies.length === 1 ? "Reply" : "Replies"}` : "Replies"}
                </div>

                {openLetter.isReal ? (
                  loadingDetail ? (
                    <div style={{ textAlign:"center", padding:"20px 0", fontSize:11, color:"#CCC", fontFamily:"'DM Mono', monospace" }}>Loading replies...</div>
                  ) : letterReplies.length === 0 ? (
                    <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:14, color:"#CCC", margin:"0 0 16px" }}>No replies yet — be the first to respond.</p>
                  ) : letterReplies.map((reply, i, arr) => (
                    <div key={reply.id} style={{ display:"flex", gap:10, paddingBottom:16, marginBottom: i<arr.length-1?16:0, borderBottom: i<arr.length-1?"1px solid #F0EDE8":"none" }}>
                      <Avatar initial={reply.initial} color={reply.color} size={30}/>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:12.5, fontWeight:600, color:"#111", fontFamily:"'DM Sans', sans-serif" }}>{reply.author}</span>
                          <span style={{ fontSize:9.5, color:"#BBB", fontFamily:"'DM Mono', monospace" }}>{reply.timeAgo}</span>
                        </div>
                        <p style={{ margin:0, fontSize:14, lineHeight:1.65, color:"#555", fontFamily:"'EB Garamond', serif" }}>{reply.body}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  [
                    { id:1, author:"Thomas R.", initial:"T", color:"#1B4F72", timeAgo:"1h ago", body:"This is exactly the nuanced take missing from mainstream coverage. The distinction between structural and cyclical factors is crucial." },
                    { id:2, author:"Elena V.",  initial:"E", color:"#117A65", timeAgo:"2h ago", body:"I'd push back slightly. The data from the Midwest doesn't necessarily generalize — coastal rust belt cities have had very different trajectories." },
                    { id:3, author:"Sam K.",    initial:"S", color:"#6E2F8C", timeAgo:"3h ago", body:"What's your take on the role of remote work in reversing some of these trends? We're seeing unusual migration patterns." },
                  ].map((reply, i, arr) => (
                    <div key={reply.id} style={{ display:"flex", gap:10, paddingBottom:16, marginBottom: i<arr.length-1?16:0, borderBottom: i<arr.length-1?"1px solid #F0EDE8":"none" }}>
                      <Avatar initial={reply.initial} color={reply.color} size={30}/>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:12.5, fontWeight:600, color:"#111", fontFamily:"'DM Sans', sans-serif" }}>{reply.author}</span>
                          <span style={{ fontSize:9.5, color:"#BBB", fontFamily:"'DM Mono', monospace" }}>{reply.timeAgo}</span>
                        </div>
                        <p style={{ margin:0, fontSize:14, lineHeight:1.65, color:"#555", fontFamily:"'EB Garamond', serif" }}>{reply.body}</p>
                      </div>
                    </div>
                  ))
                )}

                {/* Reply box */}
                {openLetter.isReal && (
                  <div style={{ marginTop:20, display:"flex", gap:10, alignItems:"flex-end", padding:"14px 0", borderTop:"1px solid #F0EDE8" }}>
                    <Avatar initial={(session?.user?.email?.[0] || "Y").toUpperCase()} color="#C8A96E" size={30}/>
                    <div style={{ flex:1, background:"#F0EDE8", border:`1px solid ${replyFocused ? "#C8A96E" : "transparent"}`, borderRadius:18, padding:"9px 16px", transition:"border-color 0.15s" }}>
                      <textarea
                        placeholder="Write a reply..."
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        onFocus={() => setReplyFocused(true)}
                        onBlur={() => setReplyFocused(false)}
                        rows={replyFocused && replyText ? 3 : 1}
                        style={{ width:"100%", background:"none", border:"none", outline:"none", resize:"none", fontFamily:"'EB Garamond', Georgia, serif", fontSize:14, color:"#111", lineHeight:1.5 }}
                      />
                    </div>
                    {replyText.trim() && (
                      <button onClick={submitReply} disabled={submittingReply}
                        style={{ background:"#111", border:"none", borderRadius:"50%", width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", cursor: submittingReply ? "default" : "pointer", flexShrink:0 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F0EAD8" strokeWidth="2.5" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty state — white panel with a soft gold circle holding the icon + copy */
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40, background:"#fff", textAlign:"center", minHeight:"100vh" }}>
              <div style={{ width:280, height:280, borderRadius:"50%", background:"#F5EFE4", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:40 }}>
                <svg width="56" height="38" viewBox="0 0 32 20" fill="none" stroke="#C8A96E" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom:18, opacity:0.55 }}>
                  {/* Wide envelope body */}
                  <rect x="1" y="1" width="30" height="18" rx="1.5"/>
                  {/* V flap from top corners down to center */}
                  <polyline points="1,1 16,11 31,1"/>
                </svg>
                <div style={{ fontFamily:"'Playfair Display', serif", fontSize:20, fontWeight:900, color:"#C8A96E", letterSpacing:"-0.01em", marginBottom:8, opacity:0.8 }}>
                  Open a Letter
                </div>
                <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:13.5, color:"#C8A96E", margin:0, lineHeight:1.55, maxWidth:170, opacity:0.6 }}>
                  Select any letter from the feed to read it here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page: Read ────────────────────────────────────────────────────────────────
// Color mapping for real RSS sources — extends the existing mock newsSources palette
// so real articles from these publications render with brand-appropriate colors.
const realSourceColors = {
  "BBC News": "#2980B9",
  "The Guardian": "#27AE60",
  "NPR": "#8E44AD",
  "AP News": "#C0392B",
  "Reuters": "#E67E22",
  "The Atlantic": "#2C3E50",
  "Wired": "#1A1A1A",
  "Ars Technica": "#E74C3C",
  "Politico": "#C0392B",
  "BBC Sport": "#F39C12",
  "Signal Cleveland": "#4A6B8A",
  "Block Club Chicago": "#D14836",
  "The Texas Tribune": "#9B2335",
  "Houston Landing": "#1C6E8C",
  "MinnPost": "#3D5A80",
  "Billy Penn": "#2E6F40",
  "CalMatters": "#B5651D",
};
const colorForSource = (source) => realSourceColors[source] || "#888";

// Sanitize RSS image URLs before use: RSS feeds frequently store HTML-encoded
// URLs (e.g. Guardian's ...&amp;s=SIG), which break the request when dropped
// into an <img src>. Decode entities and force https to dodge mixed-content
// blocking. Returns "" for empty input so the color-block fallback still fires.
const cleanImageUrl = (url) => {
  if (!url) return "";
  let u = String(url).trim();
  const decode = (s) => s
    .replace(/&amp;/gi, "&").replace(/&#0*38;?/g, "&").replace(/&#x0*26;?/gi, "&")
    .replace(/&quot;/gi, '"').replace(/&#0*39;?/g, "'");
  u = decode(decode(u)); // twice, to unwind double-encoding like &amp;amp;
  if (u.startsWith("//")) u = "https:" + u;
  else if (u.startsWith("http://")) u = "https://" + u.slice(7);
  return u;
};

// Turn RSS description/title markup into clean display text. Feeds hand us
// entity-escaped HTML (e.g. "&lt;p&gt;...&lt;/p&gt;"): decode entities so the
// tags become real, convert block boundaries to paragraph breaks, strip the
// remaining tags, then decode anything left in the text. Preserves \n\n so the
// article reader can still split into paragraphs.
const cleanNewsText = (raw) => {
  if (!raw) return "";
  const decode = (str) => {
    if (typeof document === "undefined") {
      return str
        .replace(/&lt;/gi, "<").replace(/&gt;/gi, ">").replace(/&quot;/gi, '"')
        .replace(/&#0*39;/g, "'").replace(/&apos;/gi, "'").replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&");
    }
    const ta = document.createElement("textarea");
    ta.innerHTML = str;
    return ta.value;
  };
  let s = decode(String(raw));                                  // &lt;p&gt; -> <p>
  s = s.replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, "\n\n")   // block ends -> breaks
       .replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<[^>]*>/g, "");                                 // strip remaining tags
  s = decode(s);                                                // decode entities in text
  return s.replace(/[ \t\u00a0]+/g, " ")
          .replace(/\n{3,}/g, "\n\n")
          .replace(/[ \t]*\n[ \t]*/g, "\n")
          .trim();
};

const timeAgoRead = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const newsSources = [
  { name:"AP News", category:"World", color:"#C0392B" },
  { name:"Reuters", category:"World", color:"#E67E22" },
  { name:"The Guardian", category:"World", color:"#27AE60" },
  { name:"BBC News", category:"World", color:"#2980B9" },
  { name:"NPR", category:"Culture", color:"#8E44AD" },
  { name:"The Atlantic", category:"Culture", color:"#2C3E50" },
  { name:"Wired", category:"Technology", color:"#1A1A1A" },
  { name:"Ars Technica", category:"Technology", color:"#E74C3C" },
  { name:"Politico", category:"Politics", color:"#C0392B" },
  { name:"BBC Sport", category:"Sports", color:"#F39C12" },
];

const trendingArticles = [
  { id:1,  title:"The Quiet Death of the American Middle Class",       publication:"The Atlantic",  category:"Economy",    timeAgo:"2h ago",  color:"#2C3E50", imgId:159,  reason:"Trending in your feed",    letters:14, dek:"Fifty years of wage stagnation and deindustrialization have hollowed out more than paychecks — they've unraveled entire communities.", body:"For fifty years, economists have debated when exactly the American middle class began to erode. The data is clear on the broad strokes: wage growth has stagnated relative to productivity, the cost of housing, healthcare, and education has outpaced inflation, and the social safety net that once cushioned economic shocks has steadily thinned.\n\nBut numbers alone don't capture what's been lost. In towns across the Rust Belt, the disappearance of stable manufacturing jobs didn't just remove a paycheck — it removed an entire social structure. Union halls closed. Main streets emptied. The sense of mutual obligation between employer and employee, between neighbor and neighbor, frayed in ways that don't show up in GDP figures.\n\nWhat comes next is an open question. Some economists point to remote work and the gig economy as potential equalizers, distributing opportunity beyond traditional urban centers. Others warn that without deliberate policy intervention, the divide between America's prosperous coastal metros and its hollowed-out interior will only widen.\n\nThe answer likely lies somewhere in between — in policies that combine the dynamism of the new economy with the stability the old one once provided." },
  { id:2,  title:"EU Reaches Historic Agreement on AI Liability",      publication:"Reuters",       category:"Technology", timeAgo:"4h ago",  color:"#E67E22", imgId:48,   reason:"Popular this week",         letters:6,  dek:"The directive holds AI developers legally responsible for harms, marking the most aggressive AI regulation from any major economy.", body:"After three years of negotiation, the European Union has finalized a sweeping directive that holds AI developers legally responsible for harms caused by their systems, marking the most aggressive regulatory stance on artificial intelligence taken by any major economy to date.\n\nThe framework establishes tiered liability based on risk classification, with the highest scrutiny reserved for AI systems used in healthcare, hiring, and law enforcement. Companies deploying these systems will be required to maintain detailed audit trails and submit to regular third-party assessments.\n\nIndustry response has been mixed. Major tech firms have warned that compliance costs could push smaller AI startups out of the European market entirely, while consumer advocacy groups have praised the measure as a long-overdue check on unaccountable algorithmic decision-making.\n\nThe directive takes effect in eighteen months, giving companies a transition period to adapt their compliance infrastructure." },
  { id:3,  title:"Climate Scientists Warn of Tipping Points by 2030",  publication:"The Guardian",  category:"Climate",    timeAgo:"5h ago",  color:"#27AE60", imgId:1043, reason:"Based on your interests",   letters:22, dek:"New modeling suggests critical climate thresholds could be crossed within five years, far sooner than previous estimates.", body:"New modeling published this week suggests that several critical climate tipping points — thresholds beyond which changes become self-sustaining and irreversible — may be reached earlier than previously projected, potentially within the next five years.\n\nThe research focuses on Arctic ice sheet dynamics, permafrost thaw, and coral reef collapse, three systems considered especially vulnerable to even modest additional warming. Once crossed, these thresholds could trigger cascading effects that accelerate warming independent of future emissions reductions.\n\nLead researchers emphasize that 'irreversible' does not mean 'instantaneous' — the full effects of crossing these tipping points could unfold over decades or centuries. But the political and economic implications are immediate: the window for preventive action is narrower than policymakers have assumed.\n\nThe findings are expected to feature prominently in upcoming international climate negotiations." },
  { id:4,  title:"The AI Arms Race Nobody Is Talking About",           publication:"Wired",         category:"Technology", timeAgo:"6h ago",  color:"#1A1A1A", imgId:180,  reason:"From sources you follow",   letters:9,  dek:"Autonomous weapons and military AI are proliferating faster than international law can address them.", body:"While public attention remains fixed on consumer-facing AI products, a quieter and arguably more consequential race is underway in military and defense applications. Autonomous weapons systems, AI-driven intelligence analysis, and algorithmic logistics are being deployed faster than international law can address them.\n\nDefense analysts describe a fragmented regulatory landscape where individual nations are setting their own rules — or none at all — creating a patchwork of standards that could prove dangerous as these systems proliferate.\n\nThe absence of binding international agreements echoes early nuclear arms control debates, but with a key difference: AI systems are far cheaper to develop and far easier to proliferate than nuclear weapons, lowering the barrier to entry for state and non-state actors alike." },
  { id:5,  title:"Senate Advances Bipartisan Infrastructure Bill",     publication:"AP News",       category:"Politics",   timeAgo:"9h ago",  color:"#C0392B", imgId:249,  reason:"Trending in Politics",      letters:18, dek:"The $180 billion package focused on rural broadband and transit cleared a key procedural hurdle with rare bipartisan support.", body:"The Senate voted to advance a $180 billion infrastructure package focused on broadband expansion and rural transit, clearing a key procedural hurdle with support from both parties — a rarity in the current legislative environment.\n\nThe bill allocates the bulk of funding toward closing the rural broadband gap, an issue that has gained renewed urgency as remote work and telehealth have become more central to everyday life. A smaller but significant portion is earmarked for transit projects in underserved rural communities.\n\nSupporters call it a pragmatic, narrowly-scoped measure that avoids the partisan gridlock that has stalled larger infrastructure proposals. Critics on both ends of the spectrum argue it doesn't go far enough — either in total investment or in addressing urban infrastructure needs.\n\nThe bill now moves to a final floor vote expected within the next two weeks." },
  { id:6,  title:"Inside the World's Most Secretive Election",         publication:"BBC News",      category:"World",      timeAgo:"11h ago", color:"#2980B9", imgId:326,  reason:"Trending in World",         letters:31, dek:"Behind closed doors, one of the world's most opaque electoral processes draws renewed international scrutiny.", body:"Behind closed doors and away from international observers, one of the world's most opaque electoral processes is once again underway, drawing renewed scrutiny from human rights organizations and foreign governments alike.\n\nUnlike most national elections, this process involves no public campaigning, no independent media coverage, and no verifiable vote count. Information that does emerge comes primarily through unofficial channels and diaspora networks, making it nearly impossible to verify claims from either the government or opposition voices.\n\nInternational pressure has done little to change the process historically, though several governments have signaled they may reconsider diplomatic and trade relationships depending on the outcome and how it's reached.\n\nAnalysts caution against expecting meaningful transparency in the near term, noting that the opacity itself has become a defining feature of the political system." },
  { id:7,  title:"How Streaming Killed the Auteur",                    publication:"The New Yorker",category:"Culture",    timeAgo:"1d ago",  color:"#8E44AD", imgId:342,  reason:"Popular in Culture",        letters:63, dek:"Streaming's economics favor predictable volume over singular vision, critics argue, quietly dismantling a defining cultural role.", body:"There was a time when a director's vision, however uncommercial, could find its way to a movie screen because a studio executive believed in it enough to take the risk. That era, film critics increasingly argue, is over — and streaming platforms, despite their promise of creative freedom, may be partly responsible.\n\nThe economics of streaming favor volume and algorithmic predictability over singular artistic vision. A film that performs modestly but consistently across a subscriber base is, in financial terms, more valuable to a platform than a polarizing masterpiece that divides audiences sharply.\n\nThis isn't a uniformly negative story — streaming has also enabled niche and international films to find audiences they never could have reached theatrically. But the particular cultural function of the auteur, the director whose name alone could greenlight a project, has been quietly dismantled.\n\nWhat replaces it remains an open question, one playing out in real time across every major platform." },
  { id:8,  title:"Champions League Final: A Night Nobody Will Forget", publication:"BBC Sport",     category:"Sports",     timeAgo:"3h ago",  color:"#F39C12", imgId:416,  reason:"Trending in Sports",        letters:41, dek:"A stoppage-time equalizer, extra time, and a five-round shootout delivered the drama the sport's biggest stage rarely fulfills.", body:"In a final that will be replayed in highlight reels for years, last night's match delivered everything the sport's biggest stage promises and so rarely fulfills: drama, controversy, and a finish that defied every prediction.\n\nThe first half offered little hint of what was to come, a cautious, tactical affair that suggested a low-scoring, defensively-minded final. Everything changed in the second half, when a stoppage-time equalizer forced extra time, followed by two more goals that pushed the match to penalties.\n\nThe shootout itself became its own spectacle — five rounds, two missed attempts, and a save that will likely define one goalkeeper's career. When the final whistle blew, both sets of players collapsed to the turf, exhausted in a way that transcended the usual post-match ritual.\n\nFor the winning club, it's a moment of vindication after years of near-misses. For the losing side, it's a heartbreak that will take time to process — but a performance that, in defeat, may have won them new admirers." },
  { id:9,  title:"The Hidden Economics of College Athletics",          publication:"The Atlantic",  category:"Sports",     timeAgo:"8h ago",  color:"#2C3E50", imgId:452,  reason:"Based on your interests",   letters:17, dek:"Television contracts and NIL payments have transformed college sports into a multi-billion dollar industry with murky accountability.", body:"Beneath the pageantry of college sports lies a financial system so byzantine that even university administrators struggle to fully explain it. Television contracts, conference realignments, and now name-image-likeness payments have transformed what was once framed as amateur athletics into a multi-billion dollar industry with murky accountability.\n\nThe recent wave of conference realignment, driven almost entirely by television revenue rather than geographic or academic logic, has left some of the sport's oldest rivalries severed and replaced by cross-country matchups that exist purely for broadcast appeal.\n\nMeanwhile, the introduction of NIL payments has created a new layer of complexity, with boosters and collectives operating in a regulatory gray zone that the NCAA has struggled to police. The result is a system where the line between amateur and professional athletics has effectively dissolved, even as the institutional framework still pretends otherwise.\n\nReform efforts continue, but few close observers expect a clean resolution anytime soon." },
  { id:10, title:"Why Gen Z Is Falling Back in Love With Baseball",    publication:"NPR",           category:"Sports",     timeAgo:"1d ago",  color:"#8E44AD", imgId:488,  reason:"Popular this week",         letters:28, dek:"Rule changes and a new generation of charismatic stars are reversing a decade-long decline in young viewership.", body:"For a sport long dismissed as too slow for a generation raised on short-form video, baseball is experiencing an unexpected renaissance among viewers under 25 — and the numbers back it up. Attendance among 18-34 year olds has climbed for three consecutive years, reversing a decade-long decline.\n\nPart of the shift traces back to rule changes designed to speed up gameplay: a pitch clock, larger bases, and restrictions on defensive positioning have shortened average game length by nearly thirty minutes since their introduction.\n\nBut rule changes alone don't explain the cultural shift. A new generation of charismatic, often multicultural stars has given the sport a social media presence it previously lacked, with highlight clips and personality-driven content reaching audiences who would never tune into a full nine-inning broadcast.\n\nWhether this momentum translates into long-term audience growth remains to be seen, but for a sport that spent years anxious about its future, the early signs are unmistakably encouraging." },
];

// ── Article Reader View ───────────────────────────────────────────────────────
function ArticleReaderView({ article, onBack, onWriteAbout }) {
  const [fontSize, setFontSize] = useState(17);
  const [darkMode, setDarkMode] = useState(false);

  const bg = darkMode ? "#1A1612" : "#fff";
  const text = darkMode ? "#E8E0D0" : "#222";
  const subtext = darkMode ? "#999" : "#888";
  const border = darkMode ? "#2A2418" : "#F0EDE8";

  return (
    <div style={{ minHeight:"100vh", background:bg, transition:"background 0.2s" }}>
      {/* Header */}
      <header style={{ position:"sticky", top:0, zIndex:50, background: darkMode ? "rgba(26,22,18,0.97)" : "rgba(255,255,255,0.97)", backdropFilter:"blur(10px)", borderBottom:`1px solid ${border}` }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"0 20px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", padding:4, color:subtext, display:"flex", alignItems:"center", gap:6, fontFamily:"'DM Sans', sans-serif", fontSize:13 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Read
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            {/* Font size controls */}
            <div style={{ display:"flex", alignItems:"center", gap:2 }}>
              <button
                onClick={() => setFontSize(f => Math.max(14, f-1))}
                style={{ background:"none", border:"none", cursor:"pointer", color:subtext, fontFamily:"'DM Sans', sans-serif", fontSize:13, fontWeight:600, padding:"10px 8px", minWidth:36, minHeight:36, touchAction:"manipulation" }}>
                A−
              </button>
              <button
                onClick={() => setFontSize(f => Math.min(22, f+1))}
                style={{ background:"none", border:"none", cursor:"pointer", color:subtext, fontFamily:"'DM Sans', sans-serif", fontSize:16, fontWeight:600, padding:"10px 8px", minWidth:36, minHeight:36, touchAction:"manipulation" }}>
                A+
              </button>
            </div>
            {/* Dark mode toggle */}
            <button onClick={() => setDarkMode(d => !d)} style={{ background:"none", border:"none", cursor:"pointer", color:subtext, padding:4 }}>
              {darkMode ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:640, margin:"0 auto", padding:"32px 24px 60px" }}>
        {/* Publication + category */}
        <div style={{ marginBottom:16 }}>
          <span style={{ fontSize:10.5, letterSpacing:"0.12em", textTransform:"uppercase", color:article.color === "#1A1A1A" && darkMode ? "#C8A96E" : article.color, fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{article.publication}</span>
          <span style={{ fontSize:10.5, color:subtext, fontFamily:"'DM Mono', monospace" }}> · {article.category}</span>
        </div>

        {/* Headline */}
        <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:34, fontWeight:900, color:text, lineHeight:1.15, letterSpacing:"-0.01em", margin:"0 0 16px" }}>
          {article.title}
        </h1>

        {/* Meta */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28, paddingBottom:20, borderBottom:`1px solid ${border}` }}>
          <span style={{ fontSize:11, color:subtext, fontFamily:"'DM Mono', monospace" }}>{article.timeAgo}</span>
          <span style={{ fontSize:11, color:subtext, fontFamily:"'DM Mono', monospace" }}>·</span>
          <span style={{ fontSize:11, color:subtext, fontFamily:"'DM Mono', monospace" }}>{Math.ceil((article.body?.length||800)/1000)} min read</span>
        </div>

        {/* Hero image */}
        <div style={{ borderRadius:10, overflow:"hidden", marginBottom:28 }}>
          <NewsThumb lead height={300} radius={0}
            src={article.image_url || (article.imgId ? `https://picsum.photos/seed/${article.imgId}/640/360` : null)}
            color={article.color} publication={article.publication} />
        </div>

        {/* Body */}
        <div style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize, lineHeight:1.85, color:text }}>
          {(article.body || article.description || "Full article content is available at the original source — tap below to read the complete piece.").split("\n\n").map((para, i) => (
            <p key={i} style={{ margin:"0 0 20px" }}>{para}</p>
          ))}
          {article.isReal && article.link && (
            <a href={article.link} target="_blank" rel="noopener noreferrer"
              style={{ display:"inline-flex", alignItems:"center", gap:6, color:"#C8A96E", fontFamily:"'DM Sans', sans-serif", fontSize:13, fontWeight:600, textDecoration:"none" }}>
              Read full article at {article.publication} →
            </a>
          )}
        </div>

        {/* Write about this CTA */}
        <div style={{ marginTop:36, padding:"22px 24px", background: darkMode ? "#241F18" : "#F9F6F0", borderRadius:12, border:`1px solid ${border}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div>
            <div style={{ fontSize:9.5, letterSpacing:"0.16em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:6 }}>Have a take?</div>
            <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:14, color:subtext, margin:0 }}>Write a letter responding to this article.</p>
          </div>
          <button onClick={() => onWriteAbout(article)} style={{ background:"#111", color:"#F0EAD8", border:"none", borderRadius:6, padding:"10px 18px", fontSize:12.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer", flexShrink:0 }}>
            Write →
          </button>
        </div>

        {/* Letters count */}
        <div style={{ marginTop:24, textAlign:"center" }}>
          <span style={{ fontSize:11, color:subtext, fontFamily:"'DM Sans', sans-serif" }}>✉ {article.letters_count ?? article.letters ?? 0} people have written letters about this</span>
        </div>
      </main>
    </div>
  );
}

// ── Publication Page ──────────────────────────────────────────────────────────
function PublicationPage({ publication, articles, onBack, onOpenArticle }) {
  const filtered = (articles || []).filter(a => a.publication === publication.name);

  return (
    <div style={{ minHeight:"100vh", background:"#F9F6F0" }}>
      <header style={{ position:"sticky", top:0, zIndex:50, background:"rgba(249,246,240,0.97)", backdropFilter:"blur(10px)", borderBottom:"1px solid #E8E0D0" }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"0 20px", height:54, display:"flex", alignItems:"center" }}>
          <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", padding:4, color:"#888", display:"flex", alignItems:"center", gap:6, fontFamily:"'DM Sans', sans-serif", fontSize:13 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Read
          </button>
        </div>
      </header>

      <main style={{ maxWidth:680, margin:"0 auto", padding:"24px 20px 60px" }}>
        {/* Publication header */}
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
          <div style={{ width:56, height:56, borderRadius:12, background:publication.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2z"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M4 10h16"/></svg>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Playfair Display', serif", fontSize:24, fontWeight:900, color:"#111", lineHeight:1.1 }}>{publication.name}</div>
            <div style={{ fontSize:10.5, letterSpacing:"0.1em", textTransform:"uppercase", color:"#BBB", fontFamily:"'DM Mono', monospace", marginTop:4 }}>{publication.category}</div>
          </div>
          <button style={{ background:"#111", color:"#F0EAD8", border:"none", borderRadius:20, padding:"8px 18px", fontSize:12.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer", flexShrink:0 }}>
            Follow
          </button>
        </div>

        {/* Articles list */}
        <div style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace", marginBottom:14 }}>
          {filtered.length > 0 ? `${filtered.length} recent ${filtered.length===1?"article":"articles"}` : "No recent articles"}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 20px", background:"#fff", borderRadius:12, border:"1px solid #E8E0D0" }}>
            <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:15, color:"#AAA", margin:0 }}>Articles from {publication.name} will appear here once connected.</p>
          </div>
        ) : filtered.map(article => (
          <div key={article.id} onClick={() => onOpenArticle(article)}
            style={{ display:"flex", gap:14, padding:"16px", background:"#fff", border:"1px solid #E8E0D0", borderRadius:12, marginBottom:10, cursor:"pointer", transition:"border-color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor="#C8A96E"}
            onMouseLeave={e => e.currentTarget.style.borderColor="#E8E0D0"}>
            <div style={{ width:64, height:64, borderRadius:8, overflow:"hidden", flexShrink:0, background:article.color }}>
              {article.image_url ? (
                <img src={article.image_url} alt={article.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} referrerPolicy="no-referrer" loading="lazy" onError={e => { e.target.style.display = "none"; }}/>
              ) : article.imgId ? (
                <img src={`https://picsum.photos/seed/${article.imgId}/128/128`} alt={article.title} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              ) : null}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:15, fontWeight:600, color:"#111", lineHeight:1.3, marginBottom:6, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{article.title}</div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:10, color:"#BBB", fontFamily:"'DM Mono', monospace" }}>{article.timeAgo}</span>
                <span style={{ fontSize:10, color:"#DDD", fontFamily:"'DM Mono', monospace" }}>·</span>
                <span style={{ fontSize:10, color:"#BBB", fontFamily:"'DM Sans', sans-serif" }}>✉ {article.letters_count ?? article.letters ?? 0}</span>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

function ReadPage({ onNavigate, session }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const navigate = useNavigate();
  const { articleId, publicationName } = useParams();
  const [realArticles, setRealArticles] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const categories = ["All", "World", "Local", "Politics", "Technology", "Culture", "Sports"];

  // Long letters (kind: "letter") to surface in the dedicated Letters section
  const [readLetters, setReadLetters] = useState([]);
  const [loadingReadLetters, setLoadingReadLetters] = useState(true);
  const [readFollowing, setReadFollowing] = useState([]); // user_ids the current user follows

  const stripHtmlRead = (html) => {
    if (!html) return "";
    if (typeof document === "undefined") return html;
    const withSpacing = html.replace(/<\/(p|div|li|blockquote|h[1-6])>/gi, " ").replace(/<br\s*\/?>/gi, " ");
    const div = document.createElement("div");
    div.innerHTML = withSpacing;
    return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
  };
  const readLetterColors = ["#2D6A4F","#1B4F72","#6B2D8B","#7A3B1E","#117A65","#8E5C2E","#3B5998","#A23B3B"];
  const readLetterColorForId = (id) => readLetterColors[(id || "").split("").reduce((a,c)=>a+c.charCodeAt(0),0) % readLetterColors.length];

  useEffect(() => {
    const fetchRealArticles = async () => {
      setLoadingArticles(true);
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(40);
      if (!error && data) {
        const mapped = data.map(a => ({
          id: `real-${a.id}`,
          dbId: a.id,
          isReal: true,
          title: cleanNewsText(a.title),
          publication: a.source,
          category: a.source_category,
          timeAgo: timeAgoRead(a.published_at),
          color: colorForSource(a.source),
          image_url: cleanImageUrl(a.image_url),
          description: cleanNewsText(a.description),
          link: a.link,
          letters_count: a.letters_count || 0,
          reason: "From your sources",
        }));
        setRealArticles(mapped);
      }
      setLoadingArticles(false);
    };
    fetchRealArticles();
  }, []);

  // Pull recent long letters (kind: "letter") for the Letters section — most recent first.
  useEffect(() => {
    const fetchReadLetters = async () => {
      setLoadingReadLetters(true);
      const { data, error } = await supabase
        .from("letters")
        .select("id, title, body, source_title, source_publication, created_at, user_id, kind, profiles:user_id (username, full_name, status)")
        .eq("kind", "letter")
        .order("created_at", { ascending: false })
        .limit(8);
      if (!error && data) {
        const mapped = data.map(l => {
          const profile = l.profiles || {};
          const plain = stripHtmlRead(l.body);
          return {
            dbId: l.id,
            userId: l.user_id,
            title: l.title,
            author: profile.full_name || profile.username || "Anonymous",
            username: profile.username || "user",
            status: profile.status || "contributor",
            initial: (profile.full_name || profile.username || "A")[0].toUpperCase(),
            color: readLetterColorForId(l.user_id),
            timeAgo: timeAgoRead(l.created_at),
            sourcePublication: l.source_publication || "",
            snippet: plain.length > 180 ? plain.slice(0, 180) + "…" : plain,
          };
        });
        setReadLetters(mapped);
      }
      setLoadingReadLetters(false);
    };
    fetchReadLetters();
  }, []);

  // Filter the Letters section to writers you follow; fall back to everyone when
  // you follow no one yet (or none of them have posted long letters).
  useEffect(() => {
    if (!session?.user?.id) return;
    supabase.from("follows").select("following_id").eq("follower_id", session.user.id)
      .then(({ data }) => { if (data) setReadFollowing(data.map(f => f.following_id)); });
  }, [session?.user?.id]);

  const followedLetters = readLetters.filter(l => readFollowing.includes(l.userId));
  const displayLetters = (readFollowing.length > 0 && followedLetters.length > 0) ? followedLetters : readLetters;

  // Merge real articles ahead of mock ones — mock content fills in categories/sources
  // we haven't connected real RSS feeds for yet, so the page never looks sparse.
  const allArticles = [...realArticles, ...trendingArticles];
  const filteredSources = activeCategory === "All" ? newsSources : newsSources.filter(s => s.category === activeCategory);
  const filteredArticles = activeCategory === "All" ? allArticles : allArticles.filter(a => a.category === activeCategory);

  // Derive open article/publication from the URL instead of local state, so
  // individual articles and publication pages are real, shareable URLs.
  // Real articles match by dbId (UUID); mock articles fall back to a
  // "mock-N" slug since they don't have a database id of their own.
  const openArticle = articleId
    ? allArticles.find(a => a.dbId === articleId) ||
      allArticles.find(a => `mock-${a.id}` === articleId && !a.isReal) ||
      null
    : null;

  const openPublication = publicationName
    ? newsSources.find(s => s.name === decodeURIComponent(publicationName)) || null
    : null;

  const setOpenArticle = (article) => {
    if (!article) { navigate("/read"); return; }
    const slug = article.dbId ? article.dbId : `mock-${article.id}`;
    navigate(`/read/article/${slug}`);
  };

  const setOpenPublication = (publication) => {
    if (!publication) { navigate("/read"); return; }
    navigate(`/read/publication/${encodeURIComponent(publication.name)}`);
  };

  if (openArticle) return (
    <ArticleReaderView
      key={openArticle.dbId || openArticle.id}
      article={openArticle}
      onBack={() => setOpenArticle(null)}
      onWriteAbout={(article) => onNavigate && onNavigate("write", article)}
    />
  );

  if (openPublication) return (
    <PublicationPage
      publication={openPublication}
      articles={allArticles}
      onBack={() => setOpenPublication(null)}
      onOpenArticle={setOpenArticle}
    />
  );

  return (
    <div className="letters-main" style={{ minHeight:"100vh", background:"#F9F6F0", paddingBottom:80 }}>
      <TopBar title={<span>Read<span style={{ color:"#C8A96E" }}>.</span></span>}/>
      <main className="read-main" style={{ maxWidth:680, margin:"0 auto", padding:"16px 20px 0" }}>

        {/* Category filter */}
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:16 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ background: activeCategory===cat ? "#111" : "#fff", color: activeCategory===cat ? "#F0EAD8" : "#888", border:"1px solid #E0D8CC", borderRadius:20, padding:"6px 16px", fontSize:12, fontFamily:"'DM Sans', sans-serif", fontWeight:activeCategory===cat?600:400, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, transition:"all 0.15s" }}>
              {cat}
            </button>
          ))}
        </div>

        {/* ── Read layout (Option A): news column + persistent Letters rail ── */}
        <div className="read-grid">

        {/* ── Letters rail — the standing "letters to the editor" column.
             DOM-first so it stacks ON TOP on mobile; grid-column places it on
             the RIGHT on desktop (>=1200px). Persistent across categories. ── */}
        <aside className="read-rail" style={{ marginBottom:28 }}>
          {/* Masthead */}
          <div style={{ borderTop:"3px solid #111", borderBottom:"1px solid #111", padding:"8px 0 6px", marginBottom:14, display:"flex", alignItems:"baseline", justifyContent:"space-between" }}>
            <span style={{ fontFamily:"'Playfair Display', serif", fontSize:20, fontWeight:900, color:"#111", letterSpacing:"-0.01em" }}>
              Letters<span style={{ color:"#C8A96E" }}>.</span>
            </span>
            <span style={{ fontSize:8.5, letterSpacing:"0.16em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace" }}>
              From our writers
            </span>
          </div>

          {loadingReadLetters ? (
            /* Loading skeleton */
            <div>
              {[0,1,2].map(i => (
                <div key={i} style={{ height:78, background:"#fff", border:"1px solid #EFE9DD", borderRadius:11, marginBottom:10, opacity:0.55 }}/>
              ))}
            </div>
          ) : displayLetters.length === 0 ? (
            /* Empty state — invite the reader to open the column */
            <div style={{ background:"#fff", border:"1px solid #E8E0D0", borderLeft:"3px solid #C8A96E", borderRadius:11, padding:"20px 18px" }}>
              <div style={{ fontSize:8.5, letterSpacing:"0.18em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600, marginBottom:8 }}>The column is open</div>
              <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontStyle:"italic", fontSize:15, lineHeight:1.5, color:"#666", margin:"0 0 14px" }}>
                No letters yet. Be the first to weigh in — the editorial page is awaiting your reply.
              </p>
              <button onClick={() => navigate("/write")}
                style={{ background:"#111", color:"#F0EAD8", border:"none", borderRadius:20, padding:"8px 16px", fontSize:11.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer", letterSpacing:"0.02em" }}>
                Write a letter →
              </button>
            </div>
          ) : (
            <>
              {/* Lead letter — featured */}
              <div onClick={() => navigate(`/feed/letter/${displayLetters[0].dbId}`)}
                style={{ background:"#fff", border:"1px solid #E8E0D0", borderLeft:"3px solid #C8A96E", borderRadius:11, overflow:"hidden", cursor:"pointer", marginBottom:11, transition:"border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor="#C8A96E"}
                onMouseLeave={e => { e.currentTarget.style.borderColor="#E8E0D0"; e.currentTarget.style.borderLeftColor="#C8A96E"; }}>
                <LetterCover height={88} />
                <div style={{ padding:"13px 17px 15px" }}>
                <div style={{ fontSize:8, letterSpacing:"0.18em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600, marginBottom:9 }}>Featured Letter</div>
                {displayLetters[0].title && (
                  <div style={{ fontFamily:"'Playfair Display', serif", fontSize:19, fontWeight:900, color:"#111", lineHeight:1.22, letterSpacing:"-0.01em", marginBottom:8 }}>{displayLetters[0].title}</div>
                )}
                <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:14, lineHeight:1.58, color:"#555", margin:"0 0 12px", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                  {displayLetters[0].snippet}
                </p>
                {displayLetters[0].sourcePublication && (
                  <div style={{ fontSize:8.5, letterSpacing:"0.08em", textTransform:"uppercase", color:"#BBB", fontFamily:"'DM Mono', monospace", marginBottom:11 }}>
                    In response to · {displayLetters[0].sourcePublication}
                  </div>
                )}
                <div style={{ display:"flex", alignItems:"center", gap:8, paddingTop:10, borderTop:"1px solid #F0EDE8" }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:displayLetters[0].color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontFamily:"'Playfair Display', serif", fontWeight:700, flexShrink:0 }}>{displayLetters[0].initial}</div>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:"#111", fontFamily:"'DM Sans', sans-serif", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{displayLetters[0].author}</div>
                    <div style={{ fontSize:8.5, color: statusColors[displayLetters[0].status] || "#AAA", fontFamily:"'DM Mono', monospace" }}>{contributorStatuses[displayLetters[0].status] || contributorStatuses["contributor"]}</div>
                  </div>
                  <span style={{ marginLeft:"auto", fontSize:8.5, color:"#BBB", fontFamily:"'DM Mono', monospace", flexShrink:0 }}>{displayLetters[0].timeAgo}</span>
                </div>
                </div>
              </div>

              {/* Remaining letters — compact single-column list */}
              {displayLetters.slice(1, 6).map((letter, i, arr) => (
                <div key={letter.dbId} onClick={() => navigate(`/feed/letter/${letter.dbId}`)}
                  style={{ background:"#fff", border:"1px solid #E8E0D0", borderRadius:11, padding:"13px 15px", cursor:"pointer", marginBottom: i < arr.length-1 ? 10 : 0, transition:"border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="#C8A96E"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="#E8E0D0"}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                    <div style={{ width:2, height:11, background:"#C8A96E", borderRadius:2 }}/>
                    <span style={{ fontSize:8, letterSpacing:"0.18em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>Letter</span>
                    <span style={{ marginLeft:"auto", fontSize:8.5, color:"#C4C4C4", fontFamily:"'DM Mono', monospace" }}>{letter.timeAgo}</span>
                  </div>
                  {letter.title && (
                    <div style={{ fontFamily:"'Playfair Display', serif", fontSize:15.5, fontWeight:800, color:"#111", lineHeight:1.25, marginBottom:6 }}>{letter.title}</div>
                  )}
                  <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:13, lineHeight:1.55, color:"#666", margin:"0 0 10px", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                    {letter.snippet}
                  </p>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <div style={{ width:22, height:22, borderRadius:"50%", background:letter.color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10, fontFamily:"'Playfair Display', serif", fontWeight:700, flexShrink:0 }}>{letter.initial}</div>
                    <div style={{ fontSize:11, fontWeight:600, color:"#333", fontFamily:"'DM Sans', sans-serif", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{letter.author}</div>
                  </div>
                </div>
              ))}

              {/* Foot — add your own reply */}
              <button onClick={() => navigate("/write")}
                style={{ width:"100%", marginTop:12, background:"none", color:"#8A7A55", border:"1px dashed #D8CDB2", borderRadius:10, padding:"10px", fontSize:11, fontFamily:"'DM Mono', monospace", letterSpacing:"0.06em", textTransform:"uppercase", cursor:"pointer", transition:"all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="#C8A96E"; e.currentTarget.style.color="#C8A96E"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="#D8CDB2"; e.currentTarget.style.color="#8A7A55"; }}>
                + Add your reply
              </button>
            </>
          )}
        </aside>

        {/* ── News column ── */}
        <div className="read-news">

        {/* ── Trending — newspaper-style tiered layout ── */}
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:14 }}>
            Trending · Based on your interests
          </div>

          {filteredArticles.length === 0 ? (
            <div style={{ textAlign:"center", padding:"32px", background:"#fff", borderRadius:12, border:"1px solid #E8E0D0" }}>
              <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:15, color:"#AAA", margin:0 }}>No trending articles in this category yet.</p>
            </div>
          ) : (
            <>
              {/* ── Tier 1: Lead story — full width, large image, dek ── */}
              {filteredArticles[0] && (
                <div onClick={() => setOpenArticle(filteredArticles[0])}
                  style={{ background:"#fff", border:"1px solid #E8E0D0", borderRadius:14, overflow:"hidden", cursor:"pointer", marginBottom:14, transition:"border-color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="#C8A96E"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="#E8E0D0"}>
                  <NewsThumb lead height={220}
                    src={filteredArticles[0].image_url || (filteredArticles[0].imgId ? `https://picsum.photos/seed/${filteredArticles[0].imgId}/700/440` : null)}
                    color={filteredArticles[0].color} publication={filteredArticles[0].publication} gradient />
                  <div style={{ padding:"18px 20px 20px" }}>
                    <div style={{ marginBottom:8 }}>
                      <span style={{ fontSize:10.5, letterSpacing:"0.1em", textTransform:"uppercase", color:filteredArticles[0].color, fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{filteredArticles[0].publication}</span>
                      <span style={{ fontSize:10.5, color:"#BBB", fontFamily:"'DM Mono', monospace" }}> · {filteredArticles[0].timeAgo}</span>
                    </div>
                    <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:25, fontWeight:900, color:"#111", lineHeight:1.18, letterSpacing:"-0.01em", margin:"0 0 8px" }}>
                      {filteredArticles[0].title}
                    </h2>
                    {(filteredArticles[0].dek || filteredArticles[0].description) && (
                      <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:15, lineHeight:1.55, color:"#777", margin:"0 0 12px" }}>
                        {filteredArticles[0].dek || filteredArticles[0].description}
                      </p>
                    )}
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:10, color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontStyle:"italic" }}>{filteredArticles[0].reason}</span>
                      <span style={{ fontSize:10, color:"#DDD" }}>·</span>
                      <span style={{ fontSize:10.5, color:"#BBB", fontFamily:"'DM Sans', sans-serif" }}>✉ {filteredArticles[0].letters_count ?? filteredArticles[0].letters ?? 0} letters</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Tier 2: Secondary stories — 2 medium cards with smaller images ── */}
              {filteredArticles.length > 1 && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
                  {filteredArticles.slice(1, 3).map(article => (
                    <div key={article.id} onClick={() => setOpenArticle(article)}
                      style={{ background:"#fff", border:"1px solid #E8E0D0", borderRadius:12, overflow:"hidden", cursor:"pointer", transition:"border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor="#C8A96E"}
                      onMouseLeave={e => e.currentTarget.style.borderColor="#E8E0D0"}>
                      <NewsThumb height={110}
                        src={article.image_url || (article.imgId ? `https://picsum.photos/seed/${article.imgId}/360/220` : null)}
                        color={article.color} publication={article.publication} />
                      <div style={{ padding:"12px 14px" }}>
                        <span style={{ fontSize:9.5, letterSpacing:"0.1em", textTransform:"uppercase", color:article.color, fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{article.publication}</span>
                        <div style={{ fontFamily:"'Playfair Display', serif", fontSize:15.5, fontWeight:700, color:"#111", lineHeight:1.28, margin:"5px 0 0" }}>
                          {article.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Tier 3: Briefs — text only, no images ── */}
              {filteredArticles.length > 3 && (
                <div style={{ background:"#fff", border:"1px solid #E8E0D0", borderRadius:12, overflow:"hidden" }}>
                  <div style={{ padding:"10px 16px", borderBottom:"1px solid #F0EDE8", background:"#FDFCF8" }}>
                    <span style={{ fontSize:9.5, letterSpacing:"0.14em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace" }}>More stories</span>
                  </div>
                  {filteredArticles.slice(3).map((article, i, arr) => (
                    <div key={article.id} onClick={() => setOpenArticle(article)}
                      style={{ padding:"13px 16px", borderBottom: i < arr.length-1 ? "1px solid #F0EDE8" : "none", cursor:"pointer", transition:"background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background="#FDFCF8"}
                      onMouseLeave={e => e.currentTarget.style.background="none"}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:14.5, fontWeight:600, color:"#222", lineHeight:1.4, marginBottom:4 }}>
                            {article.title}
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <span style={{ fontSize:9.5, letterSpacing:"0.08em", textTransform:"uppercase", color:article.color, fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{article.publication}</span>
                            <span style={{ fontSize:9.5, color:"#DDD" }}>·</span>
                            <span style={{ fontSize:9.5, color:"#BBB", fontFamily:"'DM Mono', monospace" }}>{article.timeAgo}</span>
                          </div>
                        </div>
                        <span style={{ fontSize:10, color:"#CCC", fontFamily:"'DM Sans', sans-serif", flexShrink:0, marginTop:2 }}>✉ {article.letters_count ?? article.letters ?? 0}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Publications ── */}
        <div style={{ borderTop:"1px solid #E8E0D0", paddingTop:24, marginBottom:24 }}>
          <div style={{ fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:"#888", fontFamily:"'DM Mono', monospace", marginBottom:14 }}>
            Publications
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {filteredSources.map(source => (
              <div key={source.name} onClick={() => setOpenPublication(source)}
                style={{ background:"#fff", border:"1px solid #E8E0D0", borderRadius:10, padding:"16px 16px", cursor:"pointer", position:"relative", overflow:"hidden", transition:"border-color 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor="#C8A96E"}
                onMouseLeave={e => e.currentTarget.style.borderColor="#E8E0D0"}>
                <div style={{ width:3, height:"100%", background:source.color, position:"absolute", left:0, top:0, bottom:0 }}/>
                <div style={{ paddingLeft:10 }}>
                  <div style={{ fontSize:9.5, letterSpacing:"0.12em", textTransform:"uppercase", color:"#BBB", fontFamily:"'DM Mono', monospace", marginBottom:3 }}>{source.category}</div>
                  <div style={{ fontFamily:"'Playfair Display', serif", fontSize:15, fontWeight:700, color:"#111" }}>{source.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>{/* /read-news */}
        </div>{/* /read-grid */}

        {/* Coming soon banner */}
        <div style={{ background:"#111", borderRadius:12, padding:"28px 24px", textAlign:"center", marginBottom:20 }}>
          <div style={{ fontSize:9.5, letterSpacing:"0.18em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:12 }}>Coming Soon</div>
          <h3 style={{ fontFamily:"'Playfair Display', serif", fontSize:22, fontWeight:900, color:"#F0EAD8", margin:"0 0 10px" }}>The full reading experience.</h3>
          <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:15, color:"#666", margin:"0 0 16px", lineHeight:1.6 }}>
            Custom fonts, dark mode, AI insights, and a premium news subscription — all coming in our next release.
          </p>
          <div style={{ width:48, height:48, borderRadius:"50%", border:"2px solid #C8A96E", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto", cursor:"pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#C8A96E"><polygon points="5,3 19,12 5,21"/></svg>
          </div>
          <div style={{ fontSize:11, color:"#555", fontFamily:"'DM Mono', monospace", marginTop:8 }}>Watch the explainer</div>
        </div>
      </main>
    </div>
  );
}

// ── Page: Write ───────────────────────────────────────────────────────────────

// Mock article data — in production from RSS + reading history
const recentArticles = [
  { id:1, title:"The Quiet Death of the American Middle Class", publication:"The Atlantic", date:"Jun 10, 2025", url:"https://theatlantic.com", color:"#2C3E50", imgId:159, readAt:"2h ago" },
  { id:2, title:"EU Reaches Historic Agreement on AI Liability", publication:"Reuters", date:"Jun 10, 2025", url:"https://reuters.com", color:"#E67E22", imgId:48, readAt:"4h ago" },
  { id:3, title:"Climate Scientists Warn of Tipping Points by 2030", publication:"The Guardian", date:"Jun 9, 2025", url:"https://theguardian.com", color:"#27AE60", imgId:1043, readAt:"Yesterday" },
  { id:4, title:"Senate Advances Bipartisan Infrastructure Bill", publication:"AP News", date:"Jun 9, 2025", url:"https://apnews.com", color:"#C0392B", imgId:249, readAt:"Yesterday" },
  { id:5, title:"How Streaming Killed the Auteur", publication:"The New Yorker", date:"Jun 8, 2025", url:"https://newyorker.com", color:"#8E44AD", imgId:342, readAt:"2 days ago" },
];

const recommendedArticles = [
  { id:6,  title:"The AI Arms Race Nobody Is Talking About", publication:"Wired", date:"Jun 10, 2025", url:"https://wired.com", color:"#1A1A1A", imgId:180, reason:"Based on your interests" },
  { id:7,  title:"Inside the World's Most Secretive Election", publication:"BBC News", date:"Jun 10, 2025", url:"https://bbc.com", color:"#2980B9", imgId:326, reason:"Trending in World" },
  { id:8,  title:"Why America's Cities Are Emptying Out", publication:"Politico", date:"Jun 9, 2025", url:"https://politico.com", color:"#C0392B", imgId:267, reason:"Trending in Politics" },
  { id:9,  title:"The New Science of Longevity", publication:"The Atlantic", date:"Jun 9, 2025", url:"https://theatlantic.com", color:"#2C3E50", imgId:399, reason:"Based on your interests" },
  { id:10, title:"How Open Source Is Eating AI", publication:"Ars Technica", date:"Jun 8, 2025", url:"https://arstechnica.com", color:"#E74C3C", imgId:201, reason:"From sources you follow" },
];

function ArticleRow({ article, onSelect, onRead }) {
  return (
    <div style={{ borderBottom:"1px solid #F0EDE8", padding:"14px 20px", display:"flex", alignItems:"center", gap:14 }}>
      {/* Image thumbnail */}
      <div style={{ width:52, height:52, borderRadius:8, background:article.color, overflow:"hidden", flexShrink:0 }}>
        <img src={`https://picsum.photos/seed/${article.imgId}/104/104`} alt={article.title} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
      </div>
      {/* Content */}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:15, fontWeight:600, color:"#111", lineHeight:1.3, marginBottom:4, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{article.title}</div>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <span style={{ fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:article.color, fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{article.publication}</span>
          <span style={{ fontSize:10, color:"#DDD", fontFamily:"'DM Mono', monospace" }}>·</span>
          <span style={{ fontSize:10, color:"#BBB", fontFamily:"'DM Mono', monospace" }}>{article.readAt || article.reason}</span>
        </div>
      </div>
      {/* Actions */}
      <div style={{ display:"flex", flexDirection:"column", gap:6, flexShrink:0 }}>
        <button onClick={() => onSelect(article)}
          style={{ background:"#111", border:"none", borderRadius:6, padding:"6px 12px", fontSize:11, fontFamily:"'DM Sans', sans-serif", fontWeight:600, color:"#F0EAD8", cursor:"pointer", whiteSpace:"nowrap" }}>
          Link →
        </button>
        <button onClick={() => onRead(article)}
          style={{ background:"none", border:"1px solid #E0D8CC", borderRadius:6, padding:"5px 12px", fontSize:11, fontFamily:"'DM Sans', sans-serif", color:"#888", cursor:"pointer", whiteSpace:"nowrap" }}>
          Read
        </button>
      </div>
    </div>
  );
}

function ArticleBrowseModal({ onSelect, onRead, onClose }) {
  const [activeTab, setActiveTab] = useState("recent");
  const [search, setSearch] = useState("");

  const allArticles = activeTab === "recent" ? recentArticles : recommendedArticles;
  const filtered = search
    ? [...recentArticles, ...recommendedArticles].filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.publication.toLowerCase().includes(search.toLowerCase())
      )
    : allArticles;

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#F9F6F0", borderRadius:"16px 16px 0 0", width:"100%", maxWidth:680, maxHeight:"82vh", display:"flex", flexDirection:"column" }}>

        {/* Handle */}
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
          <div style={{ width:36, height:4, borderRadius:2, background:"#DDD8CC" }}/>
        </div>

        {/* Search */}
        <div style={{ padding:"8px 20px 0" }}>
          <div style={{ position:"relative" }}>
            <input
              type="text"
              placeholder="Search all articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              style={{ width:"100%", padding:"10px 14px 10px 36px", fontSize:14, fontFamily:"'DM Sans', sans-serif", color:"#111", background:"#fff", border:"1px solid #C8BFA8", borderRadius:8, outline:"none", boxSizing:"border-box" }}
            />
            <svg style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            {search && (
              <button onClick={() => setSearch("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#AAA", fontSize:16, lineHeight:1, padding:2 }}>✕</button>
            )}
          </div>
        </div>

        {/* Tabs — only shown when not searching */}
        {!search && (
          <div style={{ display:"flex", borderBottom:"1px solid #E8E0D0", margin:"12px 20px 0", paddingBottom:0 }}>
            {[
              { id:"recent", label:"Recently Read" },
              { id:"recommended", label:"Recommended for You" },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ background:"none", border:"none", borderBottom: activeTab===t.id ? "2px solid #C8A96E" : "2px solid transparent", marginBottom:-1, padding:"8px 16px 10px", fontSize:12, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:"'DM Mono', monospace", fontWeight: activeTab===t.id ? 500 : 400, color: activeTab===t.id ? "#111" : "#AAA", cursor:"pointer", whiteSpace:"nowrap" }}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Search results label */}
        {search && (
          <div style={{ padding:"10px 20px 0", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{search}"
          </div>
        )}

        {/* Article list */}
        <div style={{ overflowY:"auto", flex:1, paddingBottom:20 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"40px 20px", fontSize:15, color:"#AAA", fontFamily:"'EB Garamond', serif", fontStyle:"italic" }}>No articles found</div>
          ) : filtered.map(article => (
            <ArticleRow key={article.id} article={article} onSelect={onSelect} onRead={onRead}/>
          ))}
        </div>

        {/* Close */}
        <div style={{ padding:"12px 20px 24px", borderTop:"1px solid #E8E0D0" }}>
          <button onClick={onClose} style={{ width:"100%", background:"none", border:"1px solid #C8BFA8", borderRadius:8, padding:"12px 0", fontSize:13, fontFamily:"'DM Sans', sans-serif", color:"#888", cursor:"pointer" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function QuoteSourceModal({ sourceTitle, sourcePublication, onInsert, onClose }) {
  const [selection, setSelection] = useState("");
  const matched = trendingArticles.find(a => a.title === sourceTitle);
  const paragraphs = matched?.body ? matched.body.split("\n\n") : null;

  const handleTextSelect = () => {
    const sel = window.getSelection().toString().trim();
    if (sel) setSelection(sel);
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"#FDFCF8", borderRadius:16, width:"100%", maxWidth:560, maxHeight:"86vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ padding:"16px 22px", borderBottom:"1px solid #E8E0D0", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <div style={{ fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace" }}>Quote Source</div>
            <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"#AAA", padding:4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:12.5, color:"#AAA", margin:0 }}>Highlight a passage below, then insert it as a blockquote.</p>
        </div>

        <div style={{ padding:"18px 22px", borderBottom:"1px solid #E8E0D0", flexShrink:0 }}>
          <span style={{ fontSize:9.5, letterSpacing:"0.1em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{sourcePublication}</span>
          <div style={{ fontFamily:"'Playfair Display', serif", fontSize:17, fontWeight:800, color:"#111", marginTop:4, lineHeight:1.3 }}>{sourceTitle}</div>
        </div>

        <div onMouseUp={handleTextSelect} style={{ overflowY:"auto", flex:1, padding:"18px 22px", userSelect:"text", cursor:"text" }}>
          {paragraphs ? paragraphs.map((para, i) => (
            <p key={i} style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:15.5, lineHeight:1.75, color:"#333", margin:"0 0 16px" }}>{para}</p>
          )) : (
            <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:14, color:"#AAA", margin:0 }}>
              Full article text isn't available for this source yet. Once live RSS is connected, the full article will be readable and selectable here.
            </p>
          )}
        </div>

        <div style={{ padding:"14px 22px", borderTop:"1px solid #E8E0D0", flexShrink:0, background:"#fff" }}>
          {selection ? (
            <div style={{ marginBottom:10, padding:"10px 12px", background:"#F9F6F0", borderRadius:8, border:"1px solid #EDE8E0", borderLeft:"3px solid #C8A96E" }}>
              <div style={{ fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:"#BBB", fontFamily:"'DM Mono', monospace", marginBottom:3 }}>Selected</div>
              <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:13.5, color:"#555", margin:0, lineHeight:1.5, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>"{selection}"</p>
            </div>
          ) : (
            <p style={{ fontSize:12, color:"#CCC", fontFamily:"'DM Sans', sans-serif", margin:"0 0 10px", fontStyle:"italic" }}>No text selected yet — highlight a passage above.</p>
          )}
          <button onClick={() => selection && onInsert(selection)} disabled={!selection}
            style={{ width:"100%", background: selection ? "#111" : "#E8E0D0", color: selection ? "#F0EAD8" : "#AAA", border:"none", borderRadius:6, padding:"11px 0", fontSize:13, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor: selection ? "pointer" : "not-allowed" }}>
            Insert Quote →
          </button>
        </div>
      </div>
    </div>
  );
}

function WritePage({ session, onNavigate }) {
  const draftKey = `letters-draft-${session?.user?.id || "anon"}`;

  const [form, setForm] = useState(() => {
    try {
      const saved = localStorage.getItem(draftKey);
      return saved ? JSON.parse(saved) : { sourceUrl:"", sourceTitle:"", sourcePublication:"", title:"", body:"" };
    } catch { return { sourceUrl:"", sourceTitle:"", sourcePublication:"", title:"", body:"" }; }
  });
  const [focused, setFocused] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [kind, setKind] = useState("letter"); // "letter" (full editor) | "post" (quick short post)
  const [postBody, setPostBody] = useState(""); // plain-text body used only in post mode
  const POST_LIMIT = 216;
  const [showBrowse, setShowBrowse] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showQuoteSource, setShowQuoteSource] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [bodyFontSize, setBodyFontSize] = useState(17);
  const [bodyFont, setBodyFont] = useState("EB Garamond");
  const [realRecentArticles, setRealRecentArticles] = useState([]);
  const [loadingRecentArticles, setLoadingRecentArticles] = useState(true);
  const editorRef = useRef(null);

  // Pull the 4 most recently published real articles for the source-linking panel
  useEffect(() => {
    const fetchRecent = async () => {
      setLoadingRecentArticles(true);
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .order("published_at", { ascending: false })
        .limit(4);
      if (!error && data) {
        const mapped = data.map(a => ({
          id: `real-${a.id}`,
          dbId: a.id,
          isReal: true,
          title: cleanNewsText(a.title),
          publication: a.source,
          url: a.link,
          color: colorForSource(a.source),
          image_url: cleanImageUrl(a.image_url),
          readAt: timeAgoRead(a.published_at),
        }));
        setRealRecentArticles(mapped);
      }
      setLoadingRecentArticles(false);
    };
    fetchRecent();
  }, []);

  // Real articles first, falling back to mock content to fill out to 4 if
  // the live feed doesn't have enough yet — keeps the panel from looking sparse.
  const recentArticlesCombined = [...realRecentArticles, ...recentArticles].slice(0, 4);

  const fontOptions = [
    { name:"EB Garamond",    label:"Garamond",    sample:"Serif · Classic",   stack:"'EB Garamond', Georgia, serif" },
    { name:"Lora",           label:"Lora",         sample:"Serif · Editorial", stack:"'Lora', Georgia, serif" },
    { name:"Source Serif 4", label:"Source Serif", sample:"Serif · Modern",    stack:"'Source Serif 4', Georgia, serif" },
    { name:"Special Elite",  label:"Typewriter",   sample:"Mono · Retro",      stack:"'Special Elite', monospace" },
    { name:"Inter",          label:"Inter",         sample:"Sans · Clean",      stack:"'Inter', sans-serif" },
  ];

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  // Rich text formatting commands for the contentEditable body
  const applyFormat = (command) => {
    if (editorRef.current) editorRef.current.focus();
    document.execCommand(command, false, null);
    if (editorRef.current) set("body", editorRef.current.innerHTML);
  };

  const adjustFontSize = (delta) => {
    setBodyFontSize(s => Math.max(12, Math.min(28, s + delta)));
  };

  const insertQuote = (quotedText) => {
    if (editorRef.current) {
      editorRef.current.focus();
      // contenteditable="false" makes this block atomic — selectable and
      // deletable as a whole unit, but the text inside cannot be edited.
      // This preserves the integrity of what was actually quoted from the source.
      const quoteHtml = `<blockquote contenteditable="false" data-quote="true" style="margin:10px 0; padding:8px 14px 8px 16px; border-left:3px solid #C8A96E; background:#F9F6F0; font-style:italic; color:#555; cursor:default; user-select:text; position:relative;">${quotedText}</blockquote><p><br></p>`;
      document.execCommand("insertHTML", false, quoteHtml);
      set("body", editorRef.current.innerHTML);
    }
    setShowQuoteSource(false);
  };

  const handleEditorInput = () => {
    if (editorRef.current) set("body", editorRef.current.innerHTML);
  };

  // Pressing Enter while the cursor sits at the end of a blockquote should
  // break out into a normal paragraph instead of staying trapped inside the quote.
  const handleEditorKeyDown = (e) => {
    if (e.key !== "Enter") return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    let node = range.startContainer;
    // Walk up to find an enclosing blockquote, if any
    let blockquote = null;
    let cursor = node;
    while (cursor && cursor !== editorRef.current) {
      if (cursor.nodeType === 1 && cursor.tagName === "BLOCKQUOTE") { blockquote = cursor; break; }
      cursor = cursor.parentNode;
    }
    if (!blockquote) return; // not inside a quote, let default behavior happen

    // Check if cursor is at (or very near) the end of the blockquote's text
    const atEnd = range.collapsed && (() => {
      const testRange = range.cloneRange();
      testRange.selectNodeContents(blockquote);
      testRange.setStart(range.endContainer, range.endOffset);
      return testRange.toString().trim().length === 0;
    })();

    if (atEnd) {
      e.preventDefault();
      const p = document.createElement("p");
      p.innerHTML = "<br>";
      blockquote.parentNode.insertBefore(p, blockquote.nextSibling);
      const newRange = document.createRange();
      newRange.setStart(p, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
      handleEditorInput();
    }
    // If cursor is mid-quote (not at the end), allow default Enter behavior
    // so users can still add line breaks within a longer quoted passage.
  };

  const getWordCount = () => {
    if (typeof document === "undefined") return 0;
    const div = document.createElement("div");
    div.innerHTML = form.body;
    const text = (div.textContent || "").trim();
    return text ? text.split(/\s+/).length : 0;
  };
  const getCharCount = () => {
    if (typeof document === "undefined") return 0;
    const div = document.createElement("div");
    div.innerHTML = form.body;
    return (div.textContent || "").length;
  };

  // Sync editor content when draft loads or form.body changes externally (e.g. clearDraft)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== form.body) {
      editorRef.current.innerHTML = form.body || "";
    }
  }, [form.body === "" ? "empty" : null]);

  // Auto-save draft to localStorage, debounced
  useEffect(() => {
    const hasContent = form.body.trim() || form.title.trim() || form.sourceTitle;
    if (!hasContent) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(form));
        setSavedAt(new Date());
      } catch {}
    }, 600);
    return () => clearTimeout(timer);
  }, [form, draftKey]);

  const selectArticle = (article) => {
    setForm(f => ({ ...f, sourceTitle: article.title, sourcePublication: article.publication, sourceUrl: article.url }));
    setShowBrowse(false);
  };

  const clearSource = () => setForm(f => ({ ...f, sourceUrl:"", sourceTitle:"", sourcePublication:"" }));

  const clearDraft = () => {
    try { localStorage.removeItem(draftKey); } catch {}
    setForm({ sourceUrl:"", sourceTitle:"", sourcePublication:"", title:"", body:"" });
    setSavedAt(null);
    if (editorRef.current) editorRef.current.innerHTML = "";
  };

  const inputStyle = (field, multiline=false) => ({
    width:"100%", padding:"12px 14px",
    fontSize: multiline ? 16 : 14,
    fontFamily: multiline ? "'EB Garamond', Georgia, serif" : "'DM Sans', sans-serif",
    color:"#111",
    background: focused===field ? "#fff" : "#FDFCF8",
    border:`1px solid ${focused===field ? "#111" : "#C8BFA8"}`,
    borderRadius:5, outline:"none", transition:"all 0.15s",
    boxSizing:"border-box", resize:"none",
    lineHeight: multiline ? 1.75 : 1.4,
  });

  const labelStyle = { fontSize:9.5, letterSpacing:"0.14em", textTransform:"uppercase", color:"#888", fontFamily:"'DM Mono', monospace", display:"block", marginBottom:6 };

  const handlePublish = async () => {
    const isPost = kind === "post";
    if (isPost) {
      if (!postBody.trim()) { setError("Your post can't be empty."); return; }
    } else {
      const plainCheck = form.body.replace(/<[^>]*>/g, "").trim();
      if (!plainCheck) { setError("Your letter can't be empty."); return; }
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.from("letters").insert(
      isPost
        ? {
            user_id: session.user.id,
            body: postBody.trim(),
            title: null,
            source_url: null,
            source_title: null,
            source_publication: null,
            kind: "post",
          }
        : {
            user_id: session.user.id,
            title: form.title || null,
            body: form.body,
            source_url: form.sourceUrl || null,
            source_title: form.sourceTitle || null,
            source_publication: form.sourcePublication || null,
            kind: "letter",
          }
    );
    if (error) { setError(error.message); setLoading(false); return; }
    if (!isPost) { try { localStorage.removeItem(draftKey); } catch {} }
    setSuccess(true);
    setLoading(false);
  };

  // Shared Letter/Post segmented toggle, rendered at the top of both composers.
  const modeToggle = (
    <div style={{ display:"flex", gap:4, background:"#F0EDE8", borderRadius:10, padding:4, width:"fit-content" }}>
      {[{ k:"letter", label:"Letter" }, { k:"post", label:"Post" }].map(m => (
        <button key={m.k} onClick={() => { setKind(m.k); setError(null); }}
          style={{ background: kind===m.k ? "#111" : "none", color: kind===m.k ? "#F0EAD8" : "#888", border:"none", borderRadius:7, padding:"6px 20px", fontSize:12.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer", transition:"all 0.15s" }}>
          {m.label}
        </button>
      ))}
    </div>
  );

  if (success) return (
    <div className="letters-main" style={{ minHeight:"100vh", background:"#F9F6F0", paddingBottom:80 }}>
      <TopBar title={<span>Write<span style={{ color:"#C8A96E" }}>.</span></span>} maxWidth={1040}/>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"60px 20px", textAlign:"center" }}>
        <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:16 }}>Published</div>
        <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:32, fontWeight:900, color:"#111", margin:"0 0 16px" }}>Your {kind === "post" ? "post" : "letter"} is live<span style={{ color:"#C8A96E" }}>.</span></h2>
        <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:16, color:"#888", margin:"0 0 32px" }}>It's now visible in the feed for your followers to read and respond to.</p>
        <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
          <button onClick={() => { setSuccess(false); setForm({ sourceUrl:"", sourceTitle:"", sourcePublication:"", title:"", body:"" }); setPostBody(""); if(editorRef.current) editorRef.current.innerHTML=""; }}
            style={{ background:"none", border:"1px solid #C8BFA8", borderRadius:6, padding:"10px 20px", fontSize:13, fontFamily:"'DM Sans', sans-serif", cursor:"pointer", color:"#555" }}>
            Write another
          </button>
          <button onClick={() => onNavigate("feed")}
            style={{ background:"#111", border:"none", borderRadius:6, padding:"10px 20px", fontSize:13, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer", color:"#F0EAD8" }}>
            Go to feed →
          </button>
        </div>
      </div>
    </div>
  );

  // ── Post mode — a stripped-down composer for short posts ──
  if (kind === "post") return (
    <div className="letters-main" style={{ minHeight:"100vh", background:"#F9F6F0", paddingBottom:80 }}>
      <TopBar title={<span>Write<span style={{ color:"#C8A96E" }}>.</span></span>} maxWidth={1040}/>
      <main className="letters-write-main" style={{ maxWidth:1040, margin:"0 auto", padding:"24px 20px", display:"flex", flexDirection:"column", gap:18 }}>

        {modeToggle}

        <div className="letters-write-row" style={{ display:"flex", flexDirection:"column", gap:28 }}>

        {/* ── Form column — same flex width/position as the Letter editor, so toggling Letter↔Post doesn't shift the box ── */}
        <div style={{ flex:"1.4 1 560px", minWidth:0, display:"flex", flexDirection:"column", gap:20 }}>

          {/* Hero */}
          <div style={{ background:"#111", borderRadius:14, overflow:"hidden", position:"relative" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg, #C8A96E, #E8D5A8, #C8A96E)" }}/>
            <div style={{ padding:"22px 28px" }}>
              <div style={{ fontSize:9.5, letterSpacing:"0.22em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:6 }}>Letters · Est. 2025</div>
              <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:30, fontWeight:900, color:"#F0EAD8", margin:0, letterSpacing:"-0.01em", lineHeight:1.1 }}>Write a Post<span style={{ color:"#C8A96E" }}>.</span></h1>
              <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:13.5, color:"#888", margin:"8px 0 0" }}>A quick thought — no headline, no source, just say it.</p>
            </div>
          </div>

          {/* Simple textarea */}
          <div style={{ background:"#fff", border:"1px solid #E8E0D0", borderRadius:10, padding:"16px 18px" }}>
            <textarea
              value={postBody}
              onChange={e => setPostBody(e.target.value.slice(0, POST_LIMIT))}
              placeholder="What's on your mind?"
              autoFocus
              style={{ width:"100%", minHeight:150, border:"none", outline:"none", resize:"none", fontFamily:"'EB Garamond', Georgia, serif", fontSize:17, lineHeight:1.7, color:"#222", background:"none", boxSizing:"border-box" }}
            />
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:8, paddingTop:10, borderTop:"1px solid #F9F6F0" }}>
              <span style={{ fontSize:11, color: postBody.length > POST_LIMIT - 30 ? "#C0392B" : "#CCC", fontFamily:"'DM Mono', monospace" }}>{postBody.length}/{POST_LIMIT}</span>
            </div>
          </div>

          {error && (
            <div style={{ background:"#FDF0F0", border:"1px solid #C8A8A8", borderRadius:5, padding:"10px 14px", fontSize:13, color:"#C0392B", fontFamily:"'EB Garamond', serif", fontStyle:"italic" }}>
              {error}
            </div>
          )}

          <button onClick={handlePublish} disabled={loading}
            style={{ width:"100%", background:loading?"#555":"#111", color:"#F0EAD8", border:"none", borderRadius:6, padding:"15px 0", fontSize:14, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:loading?"not-allowed":"pointer", letterSpacing:"0.02em", lineHeight:1.4, transition:"background 0.15s" }}>
            <span style={{ display:"block", fontSize:9.5, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:500, marginBottom:2 }}>
              {loading ? "Posting..." : "Say it plainly"}
            </span>
            {loading ? "Please wait..." : "Publish Post →"}
          </button>
        </div>

        {/* Empty spacer reserves the source column's width so the form column stays put; source panel simply isn't shown for posts. Hidden on mobile. */}
        <div className="write-source-spacer" style={{ flex:"1 1 340px", minWidth:0 }} />
        </div>
      </main>
    </div>
  );

  const displayName = session?.user?.email?.split("@")[0] || "You";
  const initial = displayName[0].toUpperCase();

  return (
    <div className="letters-main" style={{ minHeight:"100vh", background:"#F9F6F0", paddingBottom:80 }}>
      <TopBar title={<span>Write<span style={{ color:"#C8A96E" }}>.</span></span>} maxWidth={1040}/>
      <main className="letters-write-main" style={{ maxWidth:1040, margin:"0 auto", padding:"24px 20px", display:"flex", flexDirection:"column", gap:18 }}>

        {modeToggle}

        <div className="letters-write-row" style={{ display:"flex", flexDirection:"column", gap:28 }}>

        {/* ── Form column ── */}
        <div style={{ flex:"1.4 1 560px", minWidth:0, display:"flex", flexDirection:"column", gap:20 }}>

          {/* ── Prominent writing hero banner ── */}
          <div style={{ background:"#111", borderRadius:14, overflow:"hidden", position:"relative" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg, #C8A96E, #E8D5A8, #C8A96E)" }}/>
            <div style={{ padding:"22px 28px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
              <div>
                <div style={{ fontSize:9.5, letterSpacing:"0.22em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:6 }}>
                  Letters · Est. 2025
                </div>
                <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:30, fontWeight:900, color:"#F0EAD8", margin:0, letterSpacing:"-0.01em", lineHeight:1.1 }}>
                  Write a Letter<span style={{ color:"#C8A96E" }}>.</span>
                </h1>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                {savedAt && (
                  <div style={{ fontSize:10.5, color:"#888", fontFamily:"'DM Mono', monospace", display:"flex", alignItems:"center", gap:5 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Draft saved
                  </div>
                )}
                <button onClick={() => setShowPreview(true)}
                  style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:20, padding:"8px 18px", fontSize:12.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, color:"#F0EAD8", cursor:"pointer", display:"flex", alignItems:"center", gap:7, transition:"background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.14)"}
                  onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.08)"}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  Preview
                </button>
              </div>
            </div>
          </div>

          {/* ── Letter body — word-processor style with floating toolbar ── */}
          <div style={{ display:"flex", gap:10 }}>

            {/* Floating vertical toolbar */}
            <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", gap:4, background:"#fff", border:"1px solid #E8E0D0", borderRadius:10, padding:"10px 6px", height:"fit-content", position:"sticky", top:90 }}>
              <button onMouseDown={e => { e.preventDefault(); applyFormat("bold"); }} title="Bold"
                style={{ width:32, height:32, background:"none", border:"none", borderRadius:6, cursor:"pointer", color:"#555", fontFamily:"'DM Sans', sans-serif", fontWeight:700, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background="#F5EFE4"} onMouseLeave={e => e.currentTarget.style.background="none"}>
                B
              </button>
              <button onMouseDown={e => { e.preventDefault(); applyFormat("italic"); }} title="Italicize"
                style={{ width:32, height:32, background:"none", border:"none", borderRadius:6, cursor:"pointer", color:"#555", fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background="#F5EFE4"} onMouseLeave={e => e.currentTarget.style.background="none"}>
                I
              </button>
              <button onMouseDown={e => { e.preventDefault(); applyFormat("underline"); }} title="Underline"
                style={{ width:32, height:32, background:"none", border:"none", borderRadius:6, cursor:"pointer", color:"#555", fontFamily:"'DM Sans', sans-serif", textDecoration:"underline", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background="#F5EFE4"} onMouseLeave={e => e.currentTarget.style.background="none"}>
                U
              </button>

              <div style={{ width:20, height:1, background:"#F0EDE8", margin:"4px 0" }}/>

              <button onMouseDown={e => { e.preventDefault(); adjustFontSize(1); }} title="Increase font size"
                style={{ width:32, height:32, background:"none", border:"none", borderRadius:6, cursor:"pointer", color:"#888", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background="#F5EFE4"} onMouseLeave={e => e.currentTarget.style.background="none"}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/><line x1="19" y1="9" x2="19" y2="15"/><line x1="16" y1="12" x2="22" y2="12"/></svg>
              </button>
              <div style={{ fontSize:9, color:"#CCC", fontFamily:"'DM Mono', monospace", textAlign:"center" }}>{bodyFontSize}</div>
              <button onMouseDown={e => { e.preventDefault(); adjustFontSize(-1); }} title="Decrease font size"
                style={{ width:32, height:32, background:"none", border:"none", borderRadius:6, cursor:"pointer", color:"#888", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background="#F5EFE4"} onMouseLeave={e => e.currentTarget.style.background="none"}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/><line x1="16" y1="12" x2="22" y2="12"/></svg>
              </button>

              <div style={{ width:20, height:1, background:"#F0EDE8", margin:"4px 0" }}/>

              <button onMouseDown={e => e.preventDefault()} onClick={() => setShowQuoteSource(true)} title="Quote source text"
                disabled={!form.sourceTitle}
                style={{ width:32, height:32, background:"none", border:"none", borderRadius:6, cursor: form.sourceTitle ? "pointer" : "not-allowed", color: form.sourceTitle ? "#C8A96E" : "#DDD", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s" }}
                onMouseEnter={e => { if(form.sourceTitle) e.currentTarget.style.background="#F5EFE4"; }} onMouseLeave={e => e.currentTarget.style.background="none"}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
              </button>

              <div style={{ width:20, height:1, background:"#F0EDE8", margin:"4px 0" }}/>

              {/* Font selector */}
              <div style={{ fontSize:8, color:"#CCC", fontFamily:"'DM Mono', monospace", letterSpacing:"0.08em", textAlign:"center", textTransform:"uppercase", marginBottom:2 }}>Font</div>
              <div style={{ display:"flex", flexDirection:"column", gap:3, width:"100%" }}>
                {fontOptions.map(font => (
                  <button key={font.name} onMouseDown={e => e.preventDefault()} onClick={() => setBodyFont(font.name)}
                    title={`${font.label} — ${font.sample}`}
                    style={{
                      width:32, height:32, background: bodyFont===font.name ? "#F5EFE4" : "none",
                      border: bodyFont===font.name ? "1px solid #C8A96E" : "1px solid transparent",
                      borderRadius:6, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
                      fontFamily: font.stack, fontSize:13, color: bodyFont===font.name ? "#C8A96E" : "#777",
                      fontWeight: bodyFont===font.name ? 600 : 400, transition:"all 0.15s",
                    }}
                    onMouseEnter={e => { if(bodyFont!==font.name) e.currentTarget.style.background="#F9F6F0"; }}
                    onMouseLeave={e => { if(bodyFont!==font.name) e.currentTarget.style.background="none"; }}>
                    A
                  </button>
                ))}
              </div>
            </div>

            {/* Editor */}
            <div style={{ flex:1, minWidth:0, background:"#fff", border:"1px solid #E8E0D0", borderRadius:10, overflow:"hidden" }}>
              <div style={{ padding:"14px 20px 0" }}>
                <input type="text" placeholder="Give your letter a headline..." value={form.title} onChange={e=>set("title",e.target.value)} onFocus={()=>setFocused("title")} onBlur={()=>setFocused(null)}
                  style={{ width:"100%", padding:"6px 0 14px", fontSize:22, fontFamily:"'Playfair Display', serif", fontWeight:800, color:"#111", background:"none", border:"none", borderBottom:"1px solid #F0EDE8", outline:"none", boxSizing:"border-box" }}/>
              </div>

              <div style={{ padding:"16px 20px 20px" }}>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  onKeyDown={handleEditorKeyDown}
                  onFocus={()=>setFocused("body")}
                  onBlur={()=>setFocused(null)}
                  data-placeholder="Dear reader..."
                  className="letters-editor"
                  style={{ width:"100%", padding:0, fontSize:bodyFontSize, fontFamily: fontOptions.find(f=>f.name===bodyFont)?.stack || "'EB Garamond', Georgia, serif", lineHeight:1.85, color:"#222", background:"none", border:"none", outline:"none", boxSizing:"border-box", minHeight:420 }}
                />
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:10, paddingTop:10, borderTop:"1px solid #F9F6F0" }}>
                  <span style={{ fontSize:11, color:"#CCC", fontFamily:"'DM Mono', monospace" }}>{getWordCount()} words</span>
                  <span style={{ fontSize:11, color:"#CCC", fontFamily:"'DM Mono', monospace" }}>{getCharCount()} characters</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background:"#FDF0F0", border:"1px solid #C8A8A8", borderRadius:5, padding:"10px 14px", fontSize:13, color:"#C0392B", fontFamily:"'EB Garamond', serif", fontStyle:"italic" }}>
              {error}
            </div>
          )}

          <div style={{ display:"flex", gap:10 }}>
            <button onClick={handlePublish} disabled={loading}
              style={{ flex:1, background:loading?"#555":"#111", color:"#F0EAD8", border:"none", borderRadius:6, padding:"15px 0", fontSize:14, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:loading?"not-allowed":"pointer", letterSpacing:"0.02em", lineHeight:1.4, transition:"background 0.15s" }}>
              <span style={{ display:"block", fontSize:9.5, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:500, marginBottom:2 }}>
                {loading ? "Publishing..." : "Ready to share"}
              </span>
              {loading ? "Please wait..." : "Publish Letter →"}
            </button>
            {(form.body || form.title || form.sourceTitle) && (
              <button onClick={clearDraft} title="Discard draft"
                style={{ background:"none", border:"1px solid #E0D8CC", borderRadius:6, padding:"0 18px", fontSize:12, fontFamily:"'DM Sans', sans-serif", color:"#AAA", cursor:"pointer" }}>
                Discard
              </button>
            )}
          </div>
        </div>

        {/* ── Source-linking column — visible on all screen sizes; sits beside the
             writing area on desktop, stacks below it on mobile (flex-direction
             switches to column under 768px via .letters-write-main) ── */}
        <div style={{ flex:"1 1 340px", minWidth:0 }}>
          <div style={{ position:"sticky", top:24 }}>

            {/* ── Source section ── */}
            <div style={{ background:"#fff", border:"1px solid #E8E0D0", borderRadius:10, overflow:"hidden" }}>
              <div style={{ padding:"16px 20px 12px", borderBottom:"1px solid #F0EDE8", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace" }}>Link a source</div>
                <button onClick={() => setShowBrowse(true)}
                  style={{ background:"none", border:"1px solid #E0D8CC", borderRadius:16, padding:"4px 12px", fontSize:11, fontFamily:"'DM Sans', sans-serif", color:"#888", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  Browse all
                </button>
              </div>
              <div style={{ padding:"10px 20px 0" }}>
                <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:12.5, color:"#AAA", margin:0, lineHeight:1.5 }}>Optional, but linking a source adds context for readers.</p>
              </div>

              {/* Selected source — shown when article is picked */}
              {form.sourceTitle ? (
                <div style={{ margin:"14px 20px", padding:"12px 14px", background:"#FDFCF8", borderRadius:8, border:"1px solid #F0EDE8", display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:3, height:36, background:"#C8A96E", borderRadius:2, flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:9.5, letterSpacing:"0.1em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600, marginBottom:2 }}>{form.sourcePublication}</div>
                    <div style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:13, color:"#333", lineHeight:1.3, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{form.sourceTitle}</div>
                  </div>
                  <button onClick={clearSource} style={{ background:"none", border:"none", cursor:"pointer", color:"#CCC", padding:4, flexShrink:0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              ) : null}

              {/* Vertical list of recent articles (better fit for narrower column) */}
              <div style={{ padding:"14px 20px 6px" }}>
                <div style={{ fontSize:9.5, letterSpacing:"0.12em", textTransform:"uppercase", color:"#BBB", fontFamily:"'DM Mono', monospace", marginBottom:10 }}>Recent articles</div>
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {loadingRecentArticles && realRecentArticles.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"16px 0", fontSize:10.5, color:"#CCC", fontFamily:"'DM Mono', monospace" }}>Loading...</div>
                  ) : recentArticlesCombined.map(article => {
                    const isSelected = form.sourceTitle === article.title;
                    return (
                      <button key={article.id} onClick={() => selectArticle(article)}
                        style={{
                          display:"flex", alignItems:"center", gap:10,
                          background: isSelected ? "#111" : "#fff",
                          border:`1px solid ${isSelected ? "#111" : "#E8E0D0"}`,
                          borderRadius:8, padding:"8px 10px", cursor:"pointer", textAlign:"left",
                          transition:"all 0.15s",
                        }}
                        onMouseEnter={e => { if(!isSelected) e.currentTarget.style.borderColor="#C8A96E"; }}
                        onMouseLeave={e => { if(!isSelected) e.currentTarget.style.borderColor="#E8E0D0"; }}>
                        <div style={{ width:36, height:36, borderRadius:6, overflow:"hidden", flexShrink:0, background:article.color, position:"relative" }}>
                          {article.image_url ? (
                            <img src={article.image_url} alt={article.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} referrerPolicy="no-referrer" loading="lazy" onError={e => { e.target.style.display = "none"; }}/>
                          ) : article.imgId ? (
                            <img src={`https://picsum.photos/seed/${article.imgId}/72/72`} alt={article.title} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                          ) : null}
                          {isSelected && (
                            <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            </div>
                          )}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:9, letterSpacing:"0.08em", textTransform:"uppercase", color: isSelected ? "#C8A96E" : article.color, fontFamily:"'DM Mono', monospace", fontWeight:600, marginBottom:2 }}>{article.publication}</div>
                          <div style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:12, color: isSelected ? "#F0EAD8" : "#333", lineHeight:1.3, display:"-webkit-box", WebkitLineClamp:1, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{article.title}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setShowBrowse(true)}
                  style={{ width:"100%", marginTop:8, background:"#FDFCF8", border:"1px dashed #C8BFA8", borderRadius:8, padding:"9px 0", cursor:"pointer", fontSize:11, color:"#BBB", fontFamily:"'DM Mono', monospace", letterSpacing:"0.05em", transition:"background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background="#F5EFE4"}
                  onMouseLeave={e => e.currentTarget.style.background="#FDFCF8"}>
                  Browse more articles →
                </button>
              </div>

              {/* Manual URL input */}
              <div style={{ padding:"6px 20px 18px" }}>
                <label style={labelStyle}>Or paste a URL manually</label>
                <input type="url" placeholder="https://..." value={form.sourceUrl} onChange={e=>set("sourceUrl",e.target.value)} onFocus={()=>setFocused("sourceUrl")} onBlur={()=>setFocused(null)} style={inputStyle("sourceUrl")}/>
              </div>
            </div>

            {/* Writing tips card */}
            <div style={{ marginTop:16, background:"#F5EFE4", border:"1px solid #EDE0C8", borderRadius:10, padding:"16px 18px" }}>
              <div style={{ fontSize:9.5, letterSpacing:"0.14em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:8 }}>Writing tip</div>
              <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:13.5, color:"#8A7B5C", margin:0, lineHeight:1.55 }}>
                Letters that link a source and reference specific details tend to get more thoughtful replies.
              </p>
            </div>
          </div>
        </div>
        </div>
      </main>

      {/* Preview modal */}
      {showPreview && (
        <div onClick={() => setShowPreview(false)} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.55)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#F9F6F0", borderRadius:16, width:"100%", maxWidth:560, maxHeight:"86vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ padding:"16px 22px", borderBottom:"1px solid #E8E0D0", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
              <div style={{ fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", display:"flex", alignItems:"center", gap:6 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Preview
              </div>
              <button onClick={() => setShowPreview(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"#AAA", padding:4 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div style={{ overflowY:"auto", padding:"22px" }}>
              {/* Mimics LetterCard styling */}
              <article style={{ background:"#fff", border:"1px solid #F0EDE8", borderRadius:12, padding:"20px", boxShadow:"0 1px 3px rgba(0,0,0,0.03)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                  <div style={{ width:2, height:14, background:"#C8A96E", borderRadius:2 }}/>
                  <span style={{ fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>Letter</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>

                <div style={{ display:"flex", gap:12 }}>
                  <Avatar initial={initial} color="#C8A96E"/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ marginBottom:8 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                        <span style={{ fontSize:13, fontWeight:600, color:"#1a1a1a", fontFamily:"'DM Sans', sans-serif" }}>{displayName}</span>
                        <span style={{ fontSize:10, color:"#bbb", fontFamily:"'DM Mono', monospace", flexShrink:0 }}>now</span>
                      </div>
                      <div style={{ fontSize:10, fontFamily:"'DM Mono', monospace", marginTop:2, letterSpacing:"0.04em" }}>
                        <span style={{ color:"#BBB" }}>by </span>
                        <span style={{ color:"#888" }}>{displayName}</span>
                        <span style={{ color:"#C8A96E", marginLeft:6 }}>✦ Founding Member</span>
                      </div>
                    </div>

                    {form.title && (
                      <div style={{ fontFamily:"'Playfair Display', serif", fontSize:16, fontWeight:700, color:"#111", marginBottom:8, lineHeight:1.25 }}>
                        {form.title}
                      </div>
                    )}

                    {form.body ? (
                      <div style={{ margin:"0 0 12px", fontSize:14.5, lineHeight:1.65, color:"#333", fontFamily:"'EB Garamond', Georgia, serif" }}
                        dangerouslySetInnerHTML={{ __html: form.body }}/>
                    ) : (
                      <p style={{ margin:"0 0 12px", fontSize:14.5, lineHeight:1.65, color:"#CCC", fontFamily:"'EB Garamond', Georgia, serif", fontStyle:"italic" }}>
                        Your letter will appear here as you write it...
                      </p>
                    )}

                    {form.sourceTitle && (
                      <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:10, padding:"9px 12px", background:"#F9F6F0", borderRadius:8, border:"1px solid #EDE8E0" }}>
                        <div style={{ width:2, alignSelf:"stretch", background:"#C8A96E", borderRadius:2, flexShrink:0, minHeight:16 }}/>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", color:"#BBB", fontFamily:"'DM Mono', monospace", marginBottom:2 }}>In response to</div>
                          <span style={{ fontSize:9.5, letterSpacing:"0.1em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{form.sourcePublication}</span>
                          <div style={{ fontSize:12, color:"#777", fontFamily:"'EB Garamond', Georgia, serif", fontStyle:"italic", marginTop:2, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:1, WebkitBoxOrient:"vertical" }}>{form.sourceTitle}</div>
                        </div>
                      </div>
                    )}

                    <div style={{ display:"flex", gap:18 }}>
                      <span style={{ fontSize:11, color:"#bbb", fontFamily:"'DM Sans', sans-serif" }}>♡ 0</span>
                      <span style={{ fontSize:11, color:"#bbb", fontFamily:"'DM Sans', sans-serif" }}>↩ 0 replies</span>
                    </div>
                  </div>
                </div>
              </article>

              <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:12.5, color:"#BBB", textAlign:"center", marginTop:14 }}>
                This is how your letter will appear in the feed.
              </p>
            </div>
          </div>
        </div>
      )}

      {showQuoteSource && (
        <QuoteSourceModal
          sourceTitle={form.sourceTitle}
          sourcePublication={form.sourcePublication}
          onInsert={insertQuote}
          onClose={() => setShowQuoteSource(false)}
        />
      )}

      {showBrowse && <ArticleBrowseModal onSelect={selectArticle} onRead={(article) => { setShowBrowse(false); window.open(article.url, "_blank"); }} onClose={() => setShowBrowse(false)}/>}
    </div>
  );
}

// ── Page: Forums ──────────────────────────────────────────────────────────────

const myForums = [
  { id:1, name:"Politics & Policy", type:"topic", lastActive:"2m ago", unread:4, color:"#C0392B", imgId:249 },
  { id:2, name:"NYT Forum", type:"institutional", verified:true, lastActive:"8m ago", unread:12, color:"#1A1A1A", imgId:159 },
];

const allForums = [
  // Institutional
  { id:3,  name:"NYT Forum",           type:"institutional", verified:true,  description:"Moderated by The New York Times. In-depth discussion on the stories that matter.", members:14200, color:"#1A1A1A", imgId:159,  topic:"News",       live:false },
  { id:4,  name:"The Guardian Forum",  type:"institutional", verified:true,  description:"The Guardian's official space for readers to engage on global news and culture.", members:8900,  color:"#27AE60", imgId:1043, topic:"News",       live:true  },
  { id:5,  name:"BBC Debate",          type:"institutional", verified:true,  description:"BBC's moderated forum for civil debate on current affairs and world events.",     members:11400, color:"#2980B9", imgId:326,  topic:"World",      live:false },
  // Topic-based
  { id:6,  name:"Politics & Policy",   type:"topic",         verified:false, description:"Debate the issues shaping government and society — from local to global.",       members:6200,  color:"#C0392B", imgId:249,  topic:"Politics",   live:false },
  { id:7,  name:"Technology",          type:"topic",         verified:false, description:"From AI to gadgets — the ideas driving the future of how we live and work.",     members:5100,  color:"#1A1A1A", imgId:180,  topic:"Technology", live:false },
  { id:8,  name:"Climate & Earth",     type:"topic",         verified:false, description:"Science, policy, and the urgent path forward on our planet's future.",            members:3800,  color:"#27AE60", imgId:1043, topic:"Climate",    live:true  },
  { id:9,  name:"Culture & Arts",      type:"topic",         verified:false, description:"Film, music, literature, and the ideas that move us.",                            members:4400,  color:"#8E44AD", imgId:342,  topic:"Culture",    live:false },
  { id:10, name:"Business & Economy",  type:"topic",         verified:false, description:"Markets, companies, and the forces shaping the global economy.",                  members:3100,  color:"#E67E22", imgId:48,   topic:"Economy",    live:false },
  { id:11, name:"World Affairs",       type:"topic",         verified:false, description:"International news and global perspectives from every corner of the world.",      members:5600,  color:"#2C3E50", imgId:326,  topic:"World",      live:false },
  { id:12, name:"Sports Central",      type:"topic",         verified:false, description:"All sports, all the time. Game threads, analysis, and hot takes welcome.",        members:7800,  color:"#F39C12", imgId:416,  topic:"Sports",     live:true  },
  // User-created
  { id:13, name:"Dr. Who Universe",    type:"user",          verified:false, description:"A fan forum for all things Doctor Who — lore, episodes, theories, and debates.", members:920,   color:"#2980B9", imgId:201,  topic:"Culture",    live:false },
  { id:14, name:"Iran: Developing Story", type:"user",       verified:false, description:"Following the developing situation in Iran — news aggregation and analysis.",     members:2100,  color:"#C0392B", imgId:399,  topic:"World",      live:true  },
  { id:15, name:"AI & Society",        type:"user",          verified:false, description:"How artificial intelligence is reshaping work, democracy, and everyday life.",    members:1400,  color:"#1A1A1A", imgId:488,  topic:"Technology", live:false },
];

const mockForumFeed = [
  { id:1, forum:"Politics & Policy", author:"Sarah M.", initial:"S", color:"#C0392B", timeAgo:"4m ago", publication:"Reuters", headline:"Senate Passes Emergency Budget Resolution", preview:"This vote represents a fundamental shift in how the majority caucus is willing to negotiate. Having watched three budget crises play out in the last decade, I can say this one feels structurally different...", replies:8, likes:24 },
  { id:2, forum:"NYT Forum", author:"James K.", initial:"J", color:"#1A1A1A", timeAgo:"12m ago", publication:"NYT", headline:"The Loneliness Epidemic Has a New Face", preview:"What the data doesn't show is the quality of the connections we've lost. We've substituted convenience for depth and wonder why we feel empty...", replies:31, likes:89, verified:true },
  { id:3, forum:"Climate & Earth", author:"Priya N.", initial:"P", color:"#27AE60", timeAgo:"28m ago", publication:"The Guardian", headline:"Arctic Ice Sheet Loss Accelerating", preview:"The modelling suggests we've crossed a threshold that wasn't supposed to happen until 2040. This isn't alarmism — it's the data, and it demands a policy response proportional to the scale of the problem...", replies:15, likes:47 },
];

function ForumCard({ forum, joined, onJoin, onOpen }) {
  const [hovered, setHovered] = useState(false);
  const initial = (forum.name || "F").replace(/^the\s+/i, "").trim().charAt(0).toUpperCase();
  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background:"#fff", border:`1px solid ${hovered ? "#C8A96E" : "#E8E0D0"}`, borderRadius:14, overflow:"hidden", transition:"border-color 0.15s", cursor:"pointer", display:"flex", flexDirection:"column" }}>
      {/* Cover — real image, or the forum color with a drop-cap initial */}
      <div style={{ height:96, background:forum.color || "#1A1A1A", position:"relative", overflow:"hidden" }}>
        {forum.cover_image ? (
          <img src={forum.cover_image} alt="" referrerPolicy="no-referrer" loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.currentTarget.style.display = "none"; }}/>
        ) : (
          <div aria-hidden="true" style={{ position:"absolute", right:-6, bottom:-26, fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:120, lineHeight:1, color:"rgba(249,246,240,0.16)", userSelect:"none" }}>{initial}</div>
        )}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.42), rgba(0,0,0,0.06))" }}/>
        <div style={{ position:"absolute", top:10, left:12, display:"flex", gap:6 }}>
          {forum.verified && (
            <span style={{ background:"rgba(0,0,0,0.6)", borderRadius:20, padding:"3px 10px", fontSize:9.5, color:"#F0EAD8", fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", display:"flex", alignItems:"center", gap:4 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="#C8A96E"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              Verified
            </span>
          )}
          {forum.type === "user" && !forum.verified && (
            <span style={{ background:"rgba(0,0,0,0.6)", borderRadius:20, padding:"3px 10px", fontSize:9.5, color:"#F0EAD8", fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em" }}>Community</span>
          )}
        </div>
        {forum.live && (
          <div style={{ position:"absolute", top:10, right:12, background:"#E74C3C", borderRadius:20, padding:"3px 10px", fontSize:9.5, color:"white", fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:"white", animation:"pulse 1.5s infinite" }}/>
            LIVE
          </div>
        )}
      </div>
      {/* Content */}
      <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", flex:1 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:6 }}>
          <div style={{ fontFamily:"'Playfair Display', serif", fontSize:16, fontWeight:700, color:"#111", lineHeight:1.2 }}>{forum.name}</div>
          <button
            onClick={e => { e.stopPropagation(); onJoin(); }}
            style={{ background: joined ? "#F0EDE8" : "#111", color: joined ? "#888" : "#F0EAD8", border:"none", borderRadius:20, padding:"5px 14px", fontSize:11.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer", flexShrink:0, transition:"all 0.15s" }}>
            {joined ? "Joined" : "Join"}
          </button>
        </div>
        <p style={{ fontFamily:"'EB Garamond', serif", fontSize:13.5, color:"#888", fontStyle:"italic", margin:"0 0 10px", lineHeight:1.5, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", flex:1 }}>{forum.description}</p>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span style={{ fontSize:10, color:"#BBB", fontFamily:"'DM Mono', monospace" }}>{(forum.member_count || 0).toLocaleString()} {forum.member_count === 1 ? "member" : "members"}</span>
          {forum.topic && <span style={{ fontSize:10, color:"#C8A96E", fontFamily:"'DM Mono', monospace", letterSpacing:"0.08em", textTransform:"uppercase" }}>{forum.topic}</span>}
        </div>
      </div>
    </div>
  );
}

function ForumFeedCard({ item }) {
  return (
    <article style={{ borderBottom:"1px solid #F0EDE8", padding:"18px 0" }}>
      {/* Forum + source label */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, paddingLeft:46 }}>
        <div style={{ width:2, height:26, background:"#C8A96E", borderRadius:2, marginLeft:-18, flexShrink:0 }}/>
        <div>
          <span style={{ fontSize:10, color:"#BBB", fontFamily:"'DM Mono', monospace" }}>{item.forum}</span>
          <span style={{ fontSize:10, color:"#DDD", fontFamily:"'DM Mono', monospace" }}> · </span>
          <span style={{ fontSize:10, letterSpacing:"0.08em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{item.publication}</span>
          {item.verified && <span style={{ marginLeft:5, fontSize:9 }}>✓</span>}
          <div style={{ fontSize:11.5, color:"#666", fontFamily:"'EB Garamond', serif", fontStyle:"italic", marginTop:1 }}>{item.headline}</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:12 }}>
        <div style={{ width:34, height:34, borderRadius:"50%", background:item.color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:13, fontFamily:"'Playfair Display', serif", fontWeight:500, flexShrink:0 }}>{item.initial}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:13, fontWeight:600, color:"#1a1a1a", fontFamily:"'DM Sans', sans-serif" }}>{item.author}</span>
            <span style={{ fontSize:10, color:"#bbb", fontFamily:"'DM Mono', monospace" }}>{item.timeAgo}</span>
          </div>
          <p style={{ margin:0, fontSize:14.5, lineHeight:1.65, color:"#444", fontFamily:"'EB Garamond', serif", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{item.preview}</p>
          <div style={{ display:"flex", gap:18, marginTop:12 }}>
            <span style={{ fontSize:11, color:"#bbb", fontFamily:"'DM Sans', sans-serif" }}>♡ {item.likes}</span>
            <span style={{ fontSize:11, color:"#bbb", fontFamily:"'DM Sans', sans-serif" }}>↩ {item.replies} replies</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function RequestForumModal({ onClose, session, initialName }) {
  const [form, setForm] = useState({ name: initialName || "", topic:"", description:"", reason:"" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(null);
  const handleSubmit = async () => {
    if (!form.name.trim() || !form.description.trim() || submitting) return;
    setSubmitting(true); setError("");
    const { error: err } = await supabase.from("forum_requests").insert({
      requested_by: session?.user?.id || null,
      name: form.name.trim(),
      topic: form.topic || null,
      description: form.description.trim(),
      reason: form.reason.trim() || null,
    });
    setSubmitting(false);
    if (err) { setError("Something went wrong — please try again."); return; }
    setSubmitted(true);
  };
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const inputStyle = (field, multi=false) => ({
    width:"100%", padding:"10px 13px", fontSize:14,
    fontFamily: multi ? "'EB Garamond', Georgia, serif" : "'DM Sans', sans-serif",
    color:"#111", background: focused===field ? "#fff" : "#FDFCF8",
    border:`1px solid ${focused===field ? "#111" : "#C8BFA8"}`,
    borderRadius:5, outline:"none", transition:"all 0.15s", boxSizing:"border-box", resize:"none",
  });
  const labelStyle = { fontSize:9.5, letterSpacing:"0.14em", textTransform:"uppercase", color:"#888", fontFamily:"'DM Mono', monospace", display:"block", marginBottom:5 };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#F9F6F0", borderRadius:"16px 16px 0 0", width:"100%", maxWidth:680, maxHeight:"88vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}>
          <div style={{ width:36, height:4, borderRadius:2, background:"#DDD8CC" }}/>
        </div>
        <div style={{ padding:"8px 24px 16px", borderBottom:"1px solid #E8E0D0" }}>
          <div style={{ fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:4 }}>Request a Forum</div>
          <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:13.5, color:"#888", margin:0, lineHeight:1.5 }}>
            Describe your forum idea and we'll review it within 48 hours.
          </p>
        </div>
        <div style={{ overflowY:"auto", flex:1, padding:"20px 24px" }}>
          {!submitted ? (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={labelStyle}>Forum Name</label>
                <input type="text" placeholder="e.g. Dr. Who Universe" value={form.name} onChange={e=>set("name",e.target.value)} onFocus={()=>setFocused("name")} onBlur={()=>setFocused(null)} style={inputStyle("name")}/>
              </div>
              <div>
                <label style={labelStyle}>Topic Category</label>
                <select value={form.topic} onChange={e=>set("topic",e.target.value)} style={{...inputStyle("topic"), cursor:"pointer"}}>
                  <option value="">Select a category</option>
                  {["News","Politics","Technology","Culture","Sports","World","Economy","Science","Other"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <textarea placeholder="What will this forum be about?" value={form.description} onChange={e=>set("description",e.target.value)} onFocus={()=>setFocused("desc")} onBlur={()=>setFocused(null)} style={{...inputStyle("desc",true), minHeight:80}} rows={3}/>
              </div>
              <div>
                <label style={labelStyle}>Why should Letters approve this forum?</label>
                <textarea placeholder="Tell us why this community would add value to Letters..." value={form.reason} onChange={e=>set("reason",e.target.value)} onFocus={()=>setFocused("reason")} onBlur={()=>setFocused(null)} style={{...inputStyle("reason",true), minHeight:80}} rows={3}/>
              </div>
              {error && <div style={{ fontSize:12.5, color:"#C0392B", fontFamily:"'DM Sans', sans-serif", textAlign:"center" }}>{error}</div>}
              <button onClick={handleSubmit} disabled={submitting || !form.name.trim() || !form.description.trim()}
                style={{ width:"100%", background:"#111", color:"#F0EAD8", border:"none", borderRadius:6, padding:"13px 0", fontSize:13.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor: submitting ? "default" : "pointer", opacity: (submitting || !form.name.trim() || !form.description.trim()) ? 0.6 : 1, lineHeight:1.4 }}>
                <span style={{ display:"block", fontSize:9.5, letterSpacing:"0.16em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:2 }}>Submit for review</span>
                {submitting ? "Submitting…" : "Request This Forum →"}
              </button>
            </div>
          ) : (
            <div style={{ textAlign:"center", padding:"32px 0" }}>
              <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:12 }}>Request Received</div>
              <h3 style={{ fontFamily:"'Playfair Display', serif", fontSize:24, fontWeight:900, color:"#111", margin:"0 0 12px" }}>We'll be in touch<span style={{ color:"#C8A96E" }}>.</span></h3>
              <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:15, color:"#888", margin:"0 0 24px", lineHeight:1.6 }}>
                Your forum request for <strong style={{ fontStyle:"normal" }}>{form.name}</strong> has been submitted. We'll review it within 48 hours.
              </p>
              <button onClick={onClose} style={{ background:"none", border:"1px solid #C8BFA8", borderRadius:6, padding:"10px 24px", fontSize:13, fontFamily:"'DM Sans', sans-serif", color:"#888", cursor:"pointer" }}>Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CreateForumModal({ session, onClose, onCreated, initialName }) {
  const slugify = (s) => (s || "").toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const [form, setForm] = useState({ name: initialName || "", slug: slugify(initialName || ""), type:"topic", topic:"", description:"", color:"#1A1A1A", cover_image:"", verified:false, live:false });
  const [slugEdited, setSlugEdited] = useState(false);
  const [focused, setFocused] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const onName = (v) => setForm(f => ({ ...f, name: v, slug: slugEdited ? f.slug : slugify(v) }));
  const palette = ["#1A1A1A","#C0392B","#27AE60","#8E44AD","#2C3E50","#E67E22","#F39C12","#C8A96E"];
  const inputStyle = (field, multi=false) => ({ width:"100%", padding:"10px 13px", fontSize:14, fontFamily: multi ? "'EB Garamond', Georgia, serif" : "'DM Sans', sans-serif", color:"#111", background: focused===field ? "#fff" : "#FDFCF8", border:`1px solid ${focused===field ? "#111" : "#C8BFA8"}`, borderRadius:5, outline:"none", transition:"all 0.15s", boxSizing:"border-box", resize:"none" });
  const labelStyle = { fontSize:9.5, letterSpacing:"0.14em", textTransform:"uppercase", color:"#888", fontFamily:"'DM Mono', monospace", display:"block", marginBottom:5 };

  const handleCreate = async () => {
    const name = form.name.trim();
    const slug = (form.slug || slugify(name)).trim();
    if (!name || !slug || submitting) return;
    setSubmitting(true); setError("");
    const { data, error: err } = await supabase.from("forums").insert({
      slug, name, type: form.type, verified: form.verified,
      description: form.description.trim() || null, topic: form.topic || null,
      color: form.color, cover_image: form.cover_image.trim() || null,
      live: form.live, created_by: session?.user?.id || null,
    }).select().maybeSingle();
    setSubmitting(false);
    if (err) {
      if (err.code === "23505" || /duplicate|unique/i.test(err.message || "")) setError(`The slug "${slug}" is already taken — pick another.`);
      else if (/row-level security|policy/i.test(err.message || "")) setError("Only Letters staff can create forums.");
      else setError("Couldn't create the forum — please try again.");
      return;
    }
    onCreated && onCreated(data);
  };

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.5)", display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#F9F6F0", borderRadius:"16px 16px 0 0", width:"100%", maxWidth:680, maxHeight:"90vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 4px" }}><div style={{ width:36, height:4, borderRadius:2, background:"#DDD8CC" }}/></div>
        <div style={{ padding:"8px 24px 16px", borderBottom:"1px solid #E8E0D0" }}>
          <div style={{ fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:4 }}>Staff · Create a Forum</div>
          <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:13.5, color:"#888", margin:0, lineHeight:1.5 }}>This forum goes live immediately.</p>
        </div>
        <div style={{ overflowY:"auto", flex:1, padding:"20px 24px", display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={labelStyle}>Forum Name</label>
            <input type="text" placeholder="e.g. Climate & Earth" value={form.name} onChange={e=>onName(e.target.value)} onFocus={()=>setFocused("name")} onBlur={()=>setFocused(null)} style={inputStyle("name")}/>
          </div>
          <div>
            <label style={labelStyle}>URL Slug</label>
            <div style={{ display:"flex", alignItems:"center" }}>
              <span style={{ fontFamily:"'DM Mono', monospace", fontSize:12.5, color:"#B0A488", paddingRight:4, whiteSpace:"nowrap" }}>/forums/</span>
              <input type="text" value={form.slug} onChange={e=>{ setSlugEdited(true); set("slug", slugify(e.target.value)); }} onFocus={()=>setFocused("slug")} onBlur={()=>setFocused(null)} style={{...inputStyle("slug"), fontFamily:"'DM Mono', monospace", fontSize:13}}/>
            </div>
          </div>
          <div style={{ display:"flex", gap:12 }}>
            <div style={{ flex:1 }}>
              <label style={labelStyle}>Type</label>
              <select value={form.type} onChange={e=>set("type",e.target.value)} style={{...inputStyle("type"), cursor:"pointer"}}>
                <option value="topic">Topic</option>
                <option value="institutional">Institutional</option>
                <option value="user">Community</option>
              </select>
            </div>
            <div style={{ flex:1 }}>
              <label style={labelStyle}>Category</label>
              <select value={form.topic} onChange={e=>set("topic",e.target.value)} style={{...inputStyle("cat"), cursor:"pointer"}}>
                <option value="">None</option>
                {["News","Politics","Technology","Culture","Sports","World","Economy","Science","Letters","Other"].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea placeholder="What is this forum about?" value={form.description} onChange={e=>set("description",e.target.value)} onFocus={()=>setFocused("desc")} onBlur={()=>setFocused(null)} style={{...inputStyle("desc",true), minHeight:74}} rows={3}/>
          </div>
          <div>
            <label style={labelStyle}>Accent Color</label>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {palette.map(c => (
                <button key={c} onClick={()=>set("color",c)} style={{ width:30, height:30, borderRadius:8, background:c, border: form.color===c ? "2px solid #111" : "1px solid #E0D8C8", cursor:"pointer", padding:0 }}/>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Cover Image URL (optional)</label>
            <input type="text" placeholder="https://…" value={form.cover_image} onChange={e=>set("cover_image",e.target.value)} onFocus={()=>setFocused("cover")} onBlur={()=>setFocused(null)} style={{...inputStyle("cover"), fontFamily:"'DM Mono', monospace", fontSize:12.5}}/>
          </div>
          <div style={{ display:"flex", gap:22 }}>
            <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
              <input type="checkbox" checked={form.verified} onChange={e=>set("verified",e.target.checked)}/>
              <span style={{ fontSize:13, fontFamily:"'DM Sans', sans-serif", color:"#444" }}>Verified badge</span>
            </label>
            <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
              <input type="checkbox" checked={form.live} onChange={e=>set("live",e.target.checked)}/>
              <span style={{ fontSize:13, fontFamily:"'DM Sans', sans-serif", color:"#444" }}>Live now</span>
            </label>
          </div>
          {error && <div style={{ fontSize:12.5, color:"#C0392B", fontFamily:"'DM Sans', sans-serif" }}>{error}</div>}
          <button onClick={handleCreate} disabled={submitting || !form.name.trim() || !form.slug.trim()}
            style={{ width:"100%", background:"#111", color:"#F0EAD8", border:"none", borderRadius:6, padding:"13px 0", fontSize:13.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor: submitting ? "default" : "pointer", opacity: (submitting || !form.name.trim() || !form.slug.trim()) ? 0.6 : 1 }}>
            {submitting ? "Creating…" : "Create Forum →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ForumsPage({ session, onSignOut, onNavigate }) {
  const navigate = useNavigate();
  const userId = session?.user?.id;
  const [forums, setForums] = useState([]);
  const [joinedIds, setJoinedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [prefill, setPrefill] = useState("");
  const isStaff = !!session?.user?.email && session.user.email.toLowerCase().endsWith("@tryletters.tech");
  const openCreator = (name = "") => { setPrefill(name); if (isStaff) setShowCreate(true); else setShowRequest(true); };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: f } = await supabase.from("forums").select("*")
        .order("live", { ascending:false }).order("member_count", { ascending:false });
      let mine = [];
      if (userId) {
        const { data: m } = await supabase.from("forum_members").select("forum_id").eq("user_id", userId);
        mine = (m || []).map(r => r.forum_id);
      }
      if (!cancelled) { setForums(f || []); setJoinedIds(mine); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const toggleJoin = async (forum) => {
    if (!userId) return;
    const isJoined = joinedIds.includes(forum.id);
    setJoinedIds(prev => isJoined ? prev.filter(id => id !== forum.id) : [...prev, forum.id]);
    setForums(prev => prev.map(f => f.id === forum.id ? { ...f, member_count: Math.max(0, (f.member_count||0) + (isJoined ? -1 : 1)) } : f));
    if (isJoined) await supabase.from("forum_members").delete().eq("forum_id", forum.id).eq("user_id", userId);
    else await supabase.from("forum_members").insert({ forum_id: forum.id, user_id: userId });
  };

  const openForum = (forum) => navigate(`/forums/${forum.slug}`);

  const q = query.trim().toLowerCase();
  const matches = q ? forums.filter(f => f.name.toLowerCase().includes(q) || (f.topic||"").toLowerCase().includes(q)).slice(0, 6) : [];

  const suggested = (() => {
    const notJoined = forums.filter(f => !joinedIds.includes(f.id));
    const founder = notJoined.find(f => f.slug === "founders-forum");
    const rest = notJoined.filter(f => f.slug !== "founders-forum");
    return [founder, ...rest].filter(Boolean).slice(0, 3);
  })();

  return (
    <div className="letters-main" style={{ minHeight:"100vh", background:"#F9F6F0", paddingBottom:80 }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .forums-suggest-grid { grid-template-columns: 1fr; }
        @media (min-width: 720px) { .forums-suggest-grid { grid-template-columns: repeat(3, 1fr); } }
      `}</style>
      <TopBar title={<span>Forums<span style={{ color:"#C8A96E" }}>.</span></span>} maxWidth={1040}
        rightAction={
          <button onClick={() => openCreator("")}
            style={{ background:"#111", border:"none", borderRadius:20, padding:"5px 14px", fontSize:12, color:"#F0EAD8", fontFamily:"'DM Sans', sans-serif", fontWeight:500, cursor:"pointer" }}>
            {isStaff ? "+ Create" : "+ Request"}
          </button>
        }/>

      <main style={{ maxWidth:840, margin:"0 auto", padding:"0 20px" }}>

        {/* ── Masthead banner ── */}
        <div style={{ textAlign:"center", padding:"56px 0 36px" }}>
          <div style={{ fontSize:10, letterSpacing:"0.26em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:16, paddingLeft:"0.26em" }}>Est. 2025 · A place for readers</div>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(38px, 6vw, 60px)", fontWeight:900, color:"#141414", letterSpacing:"-0.02em", lineHeight:1.02, margin:0 }}>
            Letters Forums<span style={{ color:"#C8A96E" }}>.</span>
          </h1>
          <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:"clamp(18px, 2.4vw, 23px)", color:"#8A8172", margin:"12px 0 0" }}>Where we meet.</p>
        </div>

        {/* ── Search with autocomplete ── */}
        <div style={{ maxWidth:560, margin:"0 auto", position:"relative" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, background:"#fff", border:`1.5px solid ${focused ? "#C8A96E" : "#E2D8C4"}`, borderRadius: (focused && (matches.length || q)) ? "16px 16px 0 0" : 999, padding:"0 18px", height:54, boxShadow: focused ? "0 6px 22px rgba(200,169,110,0.15)" : "0 1px 3px rgba(0,0,0,0.04)", transition:"border-color 0.15s, box-shadow 0.15s" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 160)}
              placeholder="Search forums…"
              style={{ flex:1, border:"none", outline:"none", background:"transparent", fontSize:16, fontFamily:"'DM Sans', sans-serif", color:"#141414" }}/>
            {query && (
              <button onMouseDown={e => { e.preventDefault(); setQuery(""); }} style={{ background:"none", border:"none", cursor:"pointer", color:"#C4BCA8", padding:4, display:"flex" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>

          {focused && matches.length > 0 && (
            <div style={{ position:"absolute", left:0, right:0, top:54, background:"#fff", border:"1.5px solid #C8A96E", borderTop:"1px solid #F0EDE8", borderRadius:"0 0 16px 16px", boxShadow:"0 10px 28px rgba(0,0,0,0.09)", overflow:"hidden", zIndex:30 }}>
              {matches.map(f => (
                <button key={f.id} onMouseDown={() => openForum(f)}
                  style={{ display:"flex", alignItems:"center", gap:12, width:"100%", textAlign:"left", background:"none", border:"none", borderBottom:"1px solid #F5F1E9", padding:"11px 18px", cursor:"pointer" }}
                  onMouseEnter={e => e.currentTarget.style.background="#FBF8F1"}
                  onMouseLeave={e => e.currentTarget.style.background="none"}>
                  <div style={{ width:30, height:30, borderRadius:8, background:f.color || "#1A1A1A", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#F4ECD8", fontFamily:"'Playfair Display', serif", fontWeight:700, fontSize:14 }}>{(f.name||"F").replace(/^the\s+/i,"").charAt(0).toUpperCase()}</div>
                  <div style={{ minWidth:0, flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:600, color:"#141414", fontFamily:"'DM Sans', sans-serif", display:"flex", alignItems:"center", gap:5 }}>
                      {f.name}
                      {f.verified && <svg width="12" height="12" viewBox="0 0 24 24" fill="#C8A96E"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
                    </div>
                    <div style={{ fontSize:11, color:"#AAA", fontFamily:"'DM Mono', monospace" }}>{(f.member_count||0).toLocaleString()} members{f.topic ? ` · ${f.topic}` : ""}</div>
                  </div>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DDD5C2" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              ))}
            </div>
          )}

          {focused && q && matches.length === 0 && (
            <div style={{ position:"absolute", left:0, right:0, top:54, background:"#fff", border:"1.5px solid #C8A96E", borderTop:"1px solid #F0EDE8", borderRadius:"0 0 16px 16px", padding:"16px 18px", zIndex:30, textAlign:"center" }}>
              <span style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:14, color:"#999" }}>No forum matches “{query}” yet.</span>
              <button onMouseDown={() => openCreator(query)} style={{ marginLeft:8, background:"none", border:"none", color:"#C8A96E", fontFamily:"'DM Sans', sans-serif", fontSize:13, fontWeight:600, cursor:"pointer" }}>{isStaff ? "Create it →" : "Request it →"}</button>
            </div>
          )}
        </div>

        {isStaff && (
          <div style={{ textAlign:"center", marginTop:26 }}>
            <div style={{ fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C0B79E", fontFamily:"'DM Mono', monospace", marginBottom:9 }}>Letters staff</div>
            <button onClick={() => openCreator("")}
              style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#111", color:"#F0EAD8", border:"none", borderRadius:26, padding:"12px 26px", fontSize:14, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer", boxShadow:"0 3px 14px rgba(0,0,0,0.15)", transition:"transform 0.12s, box-shadow 0.12s" }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow="0 5px 18px rgba(0,0,0,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 3px 14px rgba(0,0,0,0.15)"; }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              Create a Forum
            </button>
          </div>
        )}

        {/* ── Suggested forums ── */}
        <div style={{ marginTop:52 }}>
          <div style={{ fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace", marginBottom:16, textAlign:"center" }}>Suggested forums</div>
          {loading ? (
            <div className="forums-suggest-grid" style={{ display:"grid", gap:16 }}>
              {[0,1,2].map(i => <div key={i} style={{ height:232, background:"#fff", border:"1px solid #EFE9DD", borderRadius:14, opacity:0.5 }}/>)}
            </div>
          ) : suggested.length === 0 ? (
            <p style={{ textAlign:"center", fontFamily:"'EB Garamond', serif", fontStyle:"italic", color:"#AAA", fontSize:15 }}>You've joined every forum there is — more on the way.</p>
          ) : (
            <div className="forums-suggest-grid" style={{ display:"grid", gap:16 }}>
              {suggested.map(f => (
                <ForumCard key={f.id} forum={f} joined={joinedIds.includes(f.id)} onJoin={() => toggleJoin(f)} onOpen={() => openForum(f)}/>
              ))}
            </div>
          )}

          <div style={{ textAlign:"center", marginTop:30 }}>
            <button onClick={() => openCreator("")} style={{ background:"none", border:"none", color:"#B0A488", fontFamily:"'DM Mono', monospace", fontSize:11.5, letterSpacing:"0.04em", cursor:"pointer" }}>
              {isStaff ? "+ Create a new forum" : "Don't see your forum? Request one →"}
            </button>
          </div>
        </div>
      </main>

      {showRequest && <RequestForumModal session={session} initialName={prefill} onClose={() => setShowRequest(false)}/>}
      {showCreate && <CreateForumModal session={session} initialName={prefill} onClose={() => setShowCreate(false)} onCreated={(forum) => { setShowCreate(false); if (forum && forum.slug) navigate(`/forums/${forum.slug}`); }}/>}
    </div>
  );
}

function ForumDetailPage({ session, onNavigate }) {
  const navigate = useNavigate();
  const { slug } = useParams();
  const userId = session?.user?.id;
  const [forum, setForum] = useState(null);
  const [joined, setJoined] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: f } = await supabase.from("forums").select("*").eq("slug", slug).maybeSingle();
      if (!f) { if (!cancelled) { setForum(null); setLoading(false); } return; }
      let isJoined = false;
      if (userId) {
        const { data: m } = await supabase.from("forum_members").select("forum_id").eq("forum_id", f.id).eq("user_id", userId).maybeSingle();
        isJoined = !!m;
      }
      const { data: pp } = await supabase.from("letters").select("id, title, body, created_at").eq("forum_id", f.id).order("created_at", { ascending:false }).limit(30);
      if (!cancelled) { setForum(f); setJoined(isJoined); setPosts(pp || []); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [slug, userId]);

  const toggleJoin = async () => {
    if (!userId || !forum) return;
    const next = !joined;
    setJoined(next);
    setForum(prev => prev ? { ...prev, member_count: Math.max(0, (prev.member_count||0) + (next ? 1 : -1)) } : prev);
    if (next) await supabase.from("forum_members").insert({ forum_id: forum.id, user_id: userId });
    else await supabase.from("forum_members").delete().eq("forum_id", forum.id).eq("user_id", userId);
  };

  const shell = (children) => (
    <div className="letters-main" style={{ minHeight:"100vh", background:"#F9F6F0", paddingBottom:80 }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      <TopBar title={<span>Forums<span style={{ color:"#C8A96E" }}>.</span></span>} maxWidth={1040}/>
      {children}
    </div>
  );

  if (loading) return shell(<div style={{ textAlign:"center", padding:"80px 0", fontFamily:"'DM Mono', monospace", fontSize:11, color:"#CCC", letterSpacing:"0.1em" }}>Loading forum…</div>);
  if (!forum) return shell(
    <main style={{ maxWidth:560, margin:"0 auto", padding:"80px 20px", textAlign:"center" }}>
      <div style={{ fontFamily:"'Playfair Display', serif", fontSize:26, fontWeight:900, color:"#141414", marginBottom:10 }}>Forum not found</div>
      <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", color:"#999", marginBottom:20 }}>This forum may have been renamed or removed.</p>
      <button onClick={() => navigate("/forums")} style={{ background:"#111", color:"#F0EAD8", border:"none", borderRadius:20, padding:"9px 20px", fontSize:13, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer" }}>← Back to Forums</button>
    </main>
  );

  const initial = (forum.name || "F").replace(/^the\s+/i, "").trim().charAt(0).toUpperCase();
  return shell(
    <main style={{ maxWidth:680, margin:"0 auto", padding:"18px 20px 40px" }}>
      <button onClick={() => navigate("/forums")} style={{ background:"none", border:"none", color:"#B0A488", fontFamily:"'DM Mono', monospace", fontSize:11.5, letterSpacing:"0.06em", cursor:"pointer", marginBottom:16, display:"flex", alignItems:"center", gap:6 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6"/></svg> Forums
      </button>

      <div style={{ height:150, borderRadius:14, overflow:"hidden", position:"relative", background:forum.color || "#1A1A1A", marginBottom:18 }}>
        {forum.cover_image ? (
          <img src={forum.cover_image} alt="" referrerPolicy="no-referrer" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e => { e.currentTarget.style.display = "none"; }}/>
        ) : (
          <div aria-hidden="true" style={{ position:"absolute", right:-4, bottom:-42, fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:200, lineHeight:1, color:"rgba(249,246,240,0.15)", userSelect:"none" }}>{initial}</div>
        )}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0.05))" }}/>
        {forum.live && (
          <div style={{ position:"absolute", top:12, right:14, background:"#E74C3C", borderRadius:20, padding:"3px 11px", fontSize:9.5, color:"white", fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em", display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:5, height:5, borderRadius:"50%", background:"white", animation:"pulse 1.5s infinite" }}/> LIVE
          </div>
        )}
      </div>

      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:14, marginBottom:10 }}>
        <div style={{ minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:5 }}>
            <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:28, fontWeight:900, color:"#141414", letterSpacing:"-0.01em", margin:0 }}>{forum.name}</h1>
            {forum.verified && <svg width="18" height="18" viewBox="0 0 24 24" fill="#C8A96E"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
          </div>
          <div style={{ fontSize:11, color:"#AAA", fontFamily:"'DM Mono', monospace", letterSpacing:"0.04em" }}>
            {(forum.member_count||0).toLocaleString()} {forum.member_count === 1 ? "member" : "members"}{forum.topic ? ` · ${forum.topic}` : ""}
          </div>
        </div>
        <button onClick={toggleJoin} disabled={!userId}
          style={{ background: joined ? "#F0EDE8" : "#111", color: joined ? "#888" : "#F0EAD8", border: joined ? "1px solid #E0D8C8" : "none", borderRadius:22, padding:"9px 20px", fontSize:13, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor: userId ? "pointer" : "default", flexShrink:0, transition:"all 0.15s" }}>
          {joined ? "Joined" : "Join"}
        </button>
      </div>
      {forum.description && <p style={{ fontFamily:"'EB Garamond', serif", fontSize:16, lineHeight:1.6, color:"#555", margin:"0 0 26px" }}>{forum.description}</p>}

      <div style={{ borderTop:"1px solid #E8E0D0", paddingTop:22 }}>
        <div style={{ fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace", marginBottom:14 }}>Discussion</div>
        {posts.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 20px", background:"#fff", border:"1px dashed #E0D8C8", borderRadius:12 }}>
            <div style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:700, color:"#333", marginBottom:6 }}>No letters here yet</div>
            <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:14.5, color:"#999", margin:"0 auto", maxWidth:340, lineHeight:1.55 }}>
              Posting straight into a forum is coming next — soon you'll be able to write a letter into {forum.name}.
            </p>
          </div>
        ) : (
          posts.map(post => (
            <article key={post.id} style={{ borderBottom:"1px solid #F0EDE8", padding:"18px 0" }}>
              {post.title && <div style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:800, color:"#141414", lineHeight:1.25, marginBottom:6 }}>{post.title}</div>}
              <p style={{ fontFamily:"'EB Garamond', serif", fontSize:14.5, lineHeight:1.6, color:"#555", margin:0, display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{post.body}</p>
              <div style={{ fontSize:10, color:"#BBB", fontFamily:"'DM Mono', monospace", marginTop:8 }}>{new Date(post.created_at).toLocaleDateString()}</div>
            </article>
          ))
        )}
      </div>
    </main>
  );
}

// ── Page: You ─────────────────────────────────────────────────────────────────

// Stock profile photos using picsum with consistent seeds
const profilePhotos = {
  default: "https://picsum.photos/seed/profile-default/200/200",
};

const demoFollowedPublications = [
  { name:"The Atlantic",  color:"#2C3E50", category:"Culture"    },
  { name:"Reuters",       color:"#E67E22", category:"World"      },
  { name:"The Guardian",  color:"#27AE60", category:"World"      },
  { name:"Wired",         color:"#1A1A1A", category:"Technology" },
  { name:"Politico",      color:"#C0392B", category:"Politics"   },
  { name:"BBC Sport",     color:"#F39C12", category:"Sports"     },
];

const demoStats = { letters: 12, replies: 47, likes: 203, following: 34, followers: 89 };

function YouPage({ session, onSignOut }) {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [followCounts, setFollowCounts] = useState({ following: 0, followers: 0 });
  const [activeTab, setActiveTab] = useState("letters");
  const [editingLocation, setEditingLocation] = useState(false);
  const [location, setLocation] = useState("Cleveland, OH");
  const [locationInput, setLocationInput] = useState("Cleveland, OH");
  const [bio, setBio] = useState("Pharmacist and health policy enthusiast based in Cleveland. Writing about healthcare, local politics, and the occasional sports take.");
  const [editingBio, setEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(bio);
  const [imgError, setImgError] = useState(false);
  const [activity, setActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [realStats, setRealStats] = useState({ letters: 0, replies: 0, likes: 0 });
  const [savingField, setSavingField] = useState(null); // "bio" | "location" | null, for subtle saving feedback

  // Real follower / following counts from the follows table
  useEffect(() => {
    if (!session?.user?.id) return;
    (async () => {
      const [{ count: following }, { count: followers }] = await Promise.all([
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", session.user.id),
        supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", session.user.id),
      ]);
      setFollowCounts({ following: following || 0, followers: followers || 0 });
    })();
  }, [session?.user?.id]);

  const saveLocation = async () => {
    const trimmed = locationInput.trim();
    setLocation(trimmed);
    setEditingLocation(false);
    setSavingField("location");
    const { error } = await supabase.from("profiles").update({ location: trimmed }).eq("id", session.user.id);
    if (error) { console.error("Failed to save location:", error); alert(`Couldn't save location: ${error.message}`); }
    setSavingField(null);
  };

  const saveBio = async () => {
    const trimmed = bioInput.trim();
    setBio(trimmed);
    setEditingBio(false);
    setSavingField("bio");
    const { error } = await supabase.from("profiles").update({ bio: trimmed }).eq("id", session.user.id);
    if (error) { console.error("Failed to save bio:", error); alert(`Couldn't save bio: ${error.message}`); }
    setSavingField(null);
  };

  const userStatus = profile?.status || "founding";

  const stripHtml = (html) => {
    if (!html) return "";
    if (typeof document === "undefined") return html;
    // Insert a space wherever a block-level boundary was, so paragraphs and
    // line breaks don't collapse directly into the next word with no gap
    // (e.g. "...mobile" + "News feed..." becoming "...mobileNews feed...").
    const withSpacing = html
      .replace(/<\/(p|div|li|blockquote|h[1-6])>/gi, " ")
      .replace(/<br\s*\/?>/gi, " ");
    const div = document.createElement("div");
    div.innerHTML = withSpacing;
    return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
  };

  const timeAgoYou = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  useEffect(() => {
    const fetchActivity = async () => {
      setLoadingActivity(true);
      const [{ data: myLikes }, { data: myReplies }, { data: myRepubs }, { data: myOwnLetters }] = await Promise.all([
        supabase.from("likes").select("created_at, letter_id, letters:letter_id (title, body, user_id, profiles:user_id (username, full_name))").eq("user_id", session.user.id),
        supabase.from("replies").select("created_at, body, letter_id, letters:letter_id (title, body, user_id, profiles:user_id (username, full_name))").eq("user_id", session.user.id),
        supabase.from("republishes").select("created_at, letter_id, letters:letter_id (title, body, user_id, profiles:user_id (username, full_name))").eq("user_id", session.user.id),
        supabase.from("letters").select("id, created_at, title, body").eq("user_id", session.user.id),
      ]);

      // Likes RECEIVED on your own letters — separate from likes you've given out above
      const myLetterIds = (myOwnLetters || []).map(l => l.id);
      const { data: likesReceived } = myLetterIds.length
        ? await supabase.from("likes").select("id").in("letter_id", myLetterIds)
        : { data: [] };

      setRealStats({
        letters: myOwnLetters?.length || 0,
        replies: myReplies?.length || 0,
        likes: likesReceived?.length || 0,
      });

      const nameFor = (l) => l?.profiles?.full_name || l?.profiles?.username || "someone";
      const titleFor = (l) => l?.title || stripHtml(l?.body || "").slice(0, 40) + "…";

      const events = [
        ...(myLikes || []).map(l => ({
          type:"like", icon:"♡", color:"#C0392B",
          text: l.letters ? `Liked a letter by ${nameFor(l.letters)}` : "Liked a letter",
          created_at: l.created_at,
        })),
        ...(myReplies || []).map(r => ({
          type:"reply", icon:"↩", color:"#2980B9",
          text: r.letters ? `Replied to ${nameFor(r.letters)}'s letter` : "Replied to a letter",
          created_at: r.created_at,
        })),
        ...(myRepubs || []).map(r => ({
          type:"republish", icon:"⤴", color:"#117A65",
          text: r.letters ? `Republished a letter by ${nameFor(r.letters)}` : "Republished a letter",
          created_at: r.created_at,
        })),
        ...(myOwnLetters || []).map(l => ({
          type:"letter", icon:"✉", color:"#C8A96E",
          text: `Published "${titleFor(l)}"`,
          created_at: l.created_at,
        })),
      ];

      events.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setActivity(events.slice(0, 25).map(e => ({ ...e, timeAgo: timeAgoYou(e.created_at) })));
      setLoadingActivity(false);
    };
    if (session?.user?.id) fetchActivity();
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: profileData } = await supabase
        .from("profiles").select("*").eq("id", session.user.id).single();
      setProfile(profileData);
      if (profileData?.bio) { setBio(profileData.bio); setBioInput(profileData.bio); }
      if (profileData?.location) { setLocation(profileData.location); setLocationInput(profileData.location); }
      const { data: lettersData } = await supabase
        .from("letters").select("*").eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      setLetters(lettersData || []);
      setLoading(false);
    };
    fetchData();
  }, [session]);

  const displayName = profile?.full_name || session.user.email.split("@")[0];
  const username = profile?.username || session.user.email.split("@")[0];
  const initial = displayName[0].toUpperCase();
  const photoSeed = `user-${session.user.id?.slice(0,8) || "default"}`;

  return (
    <div className="letters-main" style={{ minHeight:"100vh", background:"#F9F6F0", paddingBottom:80 }}>
      <TopBar
        title={<span>You<span style={{ color:"#C8A96E" }}>.</span></span>}
        onSignOut={onSignOut}
        rightAction={
          <button style={{ background:"none", border:"1px solid #E0D8CC", borderRadius:20, padding:"5px 14px", fontSize:12, color:"#888", fontFamily:"'DM Sans', sans-serif", cursor:"pointer" }}>
            Edit profile
          </button>
        }
      />

      <main style={{ maxWidth:680, margin:"0 auto" }}>

        {/* ── Profile header ── */}
        <div style={{ background:"#fff", borderBottom:"1px solid #E8E0D0", padding:"24px 20px 0" }}>

          {/* Avatar + core info */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:16, marginBottom:16 }}>
            {/* Profile photo */}
            <div style={{ position:"relative", flexShrink:0 }}>
              {!imgError ? (
                <img
                  src={`https://picsum.photos/seed/${photoSeed}/120/120`}
                  alt={displayName}
                  onError={() => setImgError(true)}
                  style={{ width:72, height:72, borderRadius:"50%", objectFit:"cover", border:"3px solid #fff", boxShadow:"0 0 0 1.5px #E8E0D0" }}
                />
              ) : (
                <div style={{ width:72, height:72, borderRadius:"50%", background:"#111", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Playfair Display', serif", fontSize:28, fontWeight:900, color:"#F0EAD8", border:"3px solid #fff", boxShadow:"0 0 0 1.5px #E8E0D0" }}>
                  {initial}
                </div>
              )}
            </div>

            {/* Name + byline + status */}
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Playfair Display', serif", fontSize:22, fontWeight:900, color:"#111", lineHeight:1.1, marginBottom:3 }}>
                {displayName}
              </div>
              <div style={{ fontSize:10.5, fontFamily:"'DM Mono', monospace", marginBottom:6, letterSpacing:"0.04em" }}>
                <span style={{ color:"#BBB" }}>by </span>
                <span style={{ color:"#777" }}>{username}</span>
                <span style={{ color: statusColors[userStatus] || "#AAA", marginLeft:6 }}>
                  {contributorStatuses[userStatus] || contributorStatuses["contributor"]}
                </span>
              </div>

              {/* Location */}
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                {editingLocation ? (
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <input
                      value={locationInput}
                      onChange={e => setLocationInput(e.target.value)}
                      autoFocus
                      style={{ fontSize:12, fontFamily:"'DM Sans', sans-serif", color:"#555", background:"#F9F6F0", border:"1px solid #C8BFA8", borderRadius:4, padding:"3px 8px", outline:"none", width:140 }}
                    />
                    <button onClick={saveLocation}
                      style={{ background:"#111", color:"#F0EAD8", border:"none", borderRadius:4, padding:"3px 10px", fontSize:11, fontFamily:"'DM Sans', sans-serif", cursor:"pointer" }}>Save</button>
                    <button onClick={() => setEditingLocation(false)}
                      style={{ background:"none", color:"#BBB", border:"none", fontSize:11, cursor:"pointer", padding:0 }}>✕</button>
                  </div>
                ) : (
                  <button onClick={() => setEditingLocation(true)}
                    style={{ display:"flex", alignItems:"center", gap:4, background:"none", border:"none", cursor:"pointer", padding:0 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span style={{ fontSize:12, color:"#AAA", fontFamily:"'DM Sans', sans-serif" }}>{location}</span>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#CCC" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                )}
                {savingField === "location" && (
                  <span style={{ fontSize:10, color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontStyle:"italic", marginLeft:4 }}>Saving...</span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div style={{ padding:"12px 0 16px", borderTop:"1px solid #F0EDE8" }}>
            {editingBio ? (
              <div>
                <textarea
                  value={bioInput}
                  onChange={e => setBioInput(e.target.value)}
                  autoFocus
                  maxLength={160}
                  rows={3}
                  style={{ width:"100%", fontFamily:"'EB Garamond', Georgia, serif", fontSize:14.5, color:"#444", background:"#F9F6F0", border:"1px solid #C8BFA8", borderRadius:6, padding:"8px 12px", outline:"none", resize:"none", boxSizing:"border-box", lineHeight:1.6 }}
                />
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:6 }}>
                  <span style={{ fontSize:10, color:"#CCC", fontFamily:"'DM Mono', monospace" }}>{bioInput.length}/160</span>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => setEditingBio(false)} style={{ background:"none", border:"none", fontSize:12, color:"#BBB", cursor:"pointer", fontFamily:"'DM Sans', sans-serif" }}>Cancel</button>
                    <button onClick={saveBio} style={{ background:"#111", color:"#F0EAD8", border:"none", borderRadius:4, padding:"4px 14px", fontSize:12, fontFamily:"'DM Sans', sans-serif", cursor:"pointer" }}>Save</button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
                <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:14.5, lineHeight:1.65, color:"#555", margin:0, flex:1, fontStyle: bio ? "normal" : "italic" }}>
                  {bio || "Add a short bio..."}
                </p>
                <button onClick={() => { setBioInput(bio); setEditingBio(true); }}
                  style={{ background:"none", border:"none", cursor:"pointer", color:"#CCC", padding:2, flexShrink:0, marginTop:2 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </div>
            )}
            {savingField === "bio" && (
              <span style={{ fontSize:10, color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontStyle:"italic", display:"block", marginTop:6 }}>Saving...</span>
            )}
          </div>

          {/* Stats row */}
          <div style={{ display:"flex", gap:0, borderTop:"1px solid #F0EDE8", marginBottom:0 }}>
            {[
              { label:"Letters", value:realStats.letters },
              { label:"Replies", value:realStats.replies },
              { label:"Likes", value:realStats.likes },
              { label:"Following", value:followCounts.following },
              { label:"Followers", value:followCounts.followers },
            ].map((stat, i) => (
              <div key={stat.label} style={{ flex:1, textAlign:"center", padding:"12px 4px", borderRight: i < 4 ? "1px solid #F0EDE8" : "none" }}>
                <div style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:700, color:"#111", lineHeight:1 }}>{stat.value}</div>
                <div style={{ fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace", marginTop:3 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Profile tabs */}
          <div style={{ display:"flex", marginTop:0, borderTop:"1px solid #F0EDE8" }}>
            {[
              { id:"letters", label:"Letters" },
              { id:"publications", label:"Publications" },
              { id:"activity", label:"Activity" },
            ].map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ flex:1, background:"none", border:"none", borderBottom: activeTab===t.id ? "2px solid #C8A96E" : "2px solid transparent", padding:"11px 0", fontSize:12.5, fontFamily:"'DM Sans', sans-serif", fontWeight: activeTab===t.id ? 600 : 400, color: activeTab===t.id ? "#111" : "#BBB", cursor:"pointer", transition:"all 0.15s" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div style={{ padding:"20px 20px 0" }}>

          {/* Letters tab */}
          {activeTab === "letters" && (
            loading ? (
              <div style={{ textAlign:"center", padding:"40px 0", fontSize:11, color:"#AAA", fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em" }}>Loading...</div>
            ) : letters.length === 0 ? (
              <div style={{ textAlign:"center", padding:"48px 20px" }}>
                <div style={{ fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:12 }}>Nothing yet</div>
                <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:16, color:"#888", margin:0 }}>
                  You haven't written any letters yet. Share your first response to a news story.
                </p>
              </div>
            ) : letters.map(letter => (
              <div key={letter.id} style={{ borderBottom:"1px solid #F0EDE8", padding:"18px 0" }}>
                {letter.source_publication && (
                  <div style={{ fontSize:9.5, letterSpacing:"0.1em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:5 }}>
                    {letter.source_publication}{letter.source_title && ` · ${letter.source_title}`}
                  </div>
                )}
                {letter.title && (
                  <div style={{ fontFamily:"'Playfair Display', serif", fontSize:17, fontWeight:700, color:"#111", marginBottom:6 }}>{letter.title}</div>
                )}
                <p style={{ fontFamily:"'EB Garamond', serif", fontSize:15, lineHeight:1.65, color:"#444", margin:"0 0 8px", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{stripHtml(letter.body)}</p>
                <div style={{ fontSize:10, color:"#BBB", fontFamily:"'DM Mono', monospace" }}>
                  {new Date(letter.created_at).toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" })}
                </div>
              </div>
            ))
          )}

          {/* Publications tab */}
          {activeTab === "publications" && (
            <div>
              <div style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace", marginBottom:14 }}>
                Following {demoFollowedPublications.length} publications
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {demoFollowedPublications.map(pub => (
                  <div key={pub.name} style={{ background:"#fff", border:"1px solid #E8E0D0", borderRadius:10, padding:"14px 16px", display:"flex", alignItems:"center", gap:12, position:"relative", overflow:"hidden" }}>
                    <div style={{ width:3, height:"100%", background:pub.color, position:"absolute", left:0, top:0, bottom:0, borderRadius:"3px 0 0 3px" }}/>
                    <div style={{ paddingLeft:8 }}>
                      <div style={{ fontFamily:"'Playfair Display', serif", fontSize:14, fontWeight:700, color:"#111" }}>{pub.name}</div>
                      <div style={{ fontSize:9.5, letterSpacing:"0.1em", textTransform:"uppercase", color:"#BBB", fontFamily:"'DM Mono', monospace", marginTop:2 }}>{pub.category}</div>
                    </div>
                    <button style={{ marginLeft:"auto", background:"none", border:"1px solid #E0D8CC", borderRadius:20, padding:"3px 12px", fontSize:11, fontFamily:"'DM Sans', sans-serif", color:"#888", cursor:"pointer", flexShrink:0 }}>
                      Following
                    </button>
                  </div>
                ))}
                {/* Add more */}
                <div style={{ background:"none", border:"1px dashed #C8BFA8", borderRadius:10, padding:"14px 16px", display:"flex", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8BFA8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
                  <span style={{ fontSize:12, color:"#BBB", fontFamily:"'DM Sans', sans-serif" }}>Add more</span>
                </div>
              </div>
            </div>
          )}

          {/* Activity tab */}
          {activeTab === "activity" && (
            <div>
              <div style={{ fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace", marginBottom:14 }}>Recent activity</div>
              {loadingActivity ? (
                <div style={{ textAlign:"center", padding:"40px 0", fontSize:11, color:"#CCC", fontFamily:"'DM Mono', monospace", letterSpacing:"0.1em" }}>Loading...</div>
              ) : activity.length === 0 ? (
                <div style={{ textAlign:"center", padding:"48px 20px" }}>
                  <div style={{ fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:12 }}>Nothing yet</div>
                  <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:16, color:"#888", margin:0 }}>
                    Like, reply to, or republish a letter to see your activity here.
                  </p>
                </div>
              ) : activity.map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 0", borderBottom:"1px solid #F0EDE8" }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:`${item.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:item.color, flexShrink:0 }}>
                    {item.icon}
                  </div>
                  <div style={{ flex:1 }}>
                    <span style={{ fontSize:13.5, fontFamily:"'EB Garamond', serif", color:"#444" }}>{item.text}</span>
                  </div>
                  <span style={{ fontSize:10, color:"#BBB", fontFamily:"'DM Mono', monospace", flexShrink:0 }}>{item.timeAgo}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Marketing pages (pre-login) ───────────────────────────────────────────────
const referralOptions = ["A friend or colleague","Twitter / X","Instagram","LinkedIn","A newsletter","Online article or blog","Search engine","Other"];

function HomepageModal({ onDismiss, navigate }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 20); }, []);
  return (
    <div onClick={onDismiss} style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", padding:24, opacity:visible?1:0, transition:"opacity 0.3s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#F7F4EE", border:"1px solid #C8BFA8", borderRadius:14, width:"100%", maxWidth:460, overflow:"hidden", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)", transition:"opacity 0.3s ease, transform 0.3s ease" }}>
        <div style={{ padding:"22px 28px 0" }}>
          <BroadsheetRule left={MASTHEAD_LABEL} center="Coming Soon" right="Free to Join"/>
          <div style={{ display:"flex", alignItems:"center", gap:20, marginBottom:16, marginTop:-10 }}>
            <div style={{ flex:1 }}>
              <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:40, fontWeight:900, color:"#111", margin:"0 0 7px", lineHeight:0.95, letterSpacing:"-0.02em" }}>Letters<span style={{ color:"#C8A96E" }}>.</span></h2>
              <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontStyle:"italic", fontSize:13.5, color:"#777", margin:0, lineHeight:1.55 }}>Read the news. Write your response.<br/>Join the conversation.</p>
            </div>
            <div style={{ width:1, alignSelf:"stretch", background:"#C8BFA8", flexShrink:0 }}/>
            <div style={{ width:80, textAlign:"center", flexShrink:0 }}><Logo size={48}/></div>
          </div>
          <div style={{ borderTop:"1px solid #111", borderBottom:"3px solid #111", padding:"4px 0", marginBottom:22, textAlign:"center" }}>
            <span style={{ fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase", color:"#888", fontFamily:"'DM Mono', monospace" }}>Read · Write · Respond</span>
          </div>
        </div>
        <div style={{ padding:"0 28px 26px", display:"flex", flexDirection:"column", gap:10 }}>
          <button onClick={() => navigate("invite")} style={{ width:"100%", background:"#111", color:"#F0EAD8", border:"none", borderRadius:6, padding:"15px 0", fontSize:13.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer", lineHeight:1.4 }}>
            <span style={{ display:"block", fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:500, marginBottom:2 }}>First Print</span>
            Request an Early Invitation →
          </button>
          <button onClick={() => navigate("how-it-works")} style={{ width:"100%", background:"none", color:"#555", border:"1px solid #C8BFA8", borderRadius:6, padding:"15px 0", fontSize:13.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer", lineHeight:1.4 }}>
            <span style={{ display:"block", fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"#888", fontFamily:"'DM Mono', monospace", fontWeight:500, marginBottom:2 }}>Dear Reader</span>
            How Letters Works
          </button>
          <div style={{ textAlign:"center", paddingTop:4 }}>
            <span style={{ fontSize:11, color:"#555", fontFamily:"'EB Garamond', serif", fontStyle:"italic" }}>Interested in investing? </span>
            <button onClick={() => navigate("investor")} style={{ background:"none", border:"none", fontSize:11, color:"#C8A96E", fontFamily:"'EB Garamond', serif", fontStyle:"italic", cursor:"pointer", padding:0, textDecoration:"underline" }}>Learn more →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Reusable phone frame for the landing-page demo slides ──────────────────────
function PhoneFrame({ children }) {
  return (
    <div style={{ width:260, margin:"0 auto", background:"linear-gradient(165deg, #1c1c1c, #0a0a0a)", borderRadius:34, padding:"14px 10px", boxShadow:"0 20px 46px rgba(0,0,0,0.22), inset 0 1px 1px rgba(255,255,255,0.06)", position:"relative" }}>
      <div style={{ position:"absolute", left:-2, top:90, width:3, height:34, background:"#2a2a2a", borderRadius:2 }}/>
      <div style={{ position:"absolute", right:-2, top:130, width:3, height:50, background:"#2a2a2a", borderRadius:2 }}/>
      <div style={{ background:"#fff", borderRadius:22, overflow:"hidden", height:430, position:"relative" }}>
        <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:72, height:17, background:"#111", borderRadius:"0 0 11px 11px", zIndex:20 }}/>
        {children}
      </div>
    </div>
  );
}

// Five-act landing-page demo, one per product tab:
//   Slide 0 — Feed (phone):    scroll the feed, open a letter, like it, post a reply.
//   Slide 1 — Desktop (laptop): browse Read, click Write in the nav, the desktop Write screen opens.
//   Slide 2 — Write (phone):   a headline appears, the body types itself out, Publish presses.
//   Slide 3 — Forums (phone):  browse forum cards, a Join button flips to Joined.
//   Slide 4 — You (phone):     the profile builds — badge fades in, stat numbers count up.
// Then the whole thing loops back to Slide 0.
function AnimatedDemoFeed() {
  const [phase, setPhase] = useState("mobile-scroll");
  const [typedComment, setTypedComment] = useState(0);
  const [liked, setLiked] = useState(false);
  const [commentPosted, setCommentPosted] = useState(false);
  const [touchPos, setTouchPos] = useState(null);
  const [desktopCursor, setDesktopCursor] = useState({ x: 43, y: 50 }); // laptop-slide pointer position, in %
  const [writeTyped, setWriteTyped] = useState(0);     // chars of the Write-slide body typed so far
  const [forumJoined, setForumJoined] = useState(false); // Forums-slide Join → Joined
  const [statsProgress, setStatsProgress] = useState(0); // You-slide count-up, 0 → 1
  const scrollRef = useRef(null);

  const demoArticle = { publication:"The Atlantic", section:"Economy", headline:"The Quiet Death of the American Middle Class" };
  const demoLetterAuthor = mockFeed.find(i => i.type === "letter") || { author:"Margaret T.", username:"margaret_t", status:"founding", initial:"M", color:"#2D6A4F", preview:"The framing of this piece misses what's actually happening in rust-belt communities. Having lived in Youngstown for 30 years, I can tell you the numbers don't capture the social fabric that's unraveled..." };
  const commentText = "I was thinking the same thing! Great minds!";

  // Write-slide content
  const writeHeadline = "When the local paper dies";
  const writeBody = "Local newsrooms are vanishing, and with them the daily record of civic life — the quiet work of showing up to the meeting and taking the minutes.";

  // Forums-slide content
  const demoForums = [
    { name:"Politics & Policy", members:"6.2k", color:"#C0392B" },
    { name:"Technology",        members:"5.1k", color:"#1A1A1A" },
    { name:"Climate & Earth",   members:"3.8k", color:"#27AE60" },
  ];

  // You-slide stats (count up to these)
  const youStats = [
    { label:"Letters", value:12 },
    { label:"Replies", value:47 },
    { label:"Likes",   value:203 },
  ];

  const goTo = (next, delay) => { const t = setTimeout(() => setPhase(next), delay); return () => clearTimeout(t); };

  // ── Slide 0: Feed (phone) ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "mobile-scroll") return;
    let raf, start = null;
    const duration = 2200;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      if (scrollRef.current) scrollRef.current.scrollTop = progress * (scrollRef.current.scrollHeight - scrollRef.current.clientHeight);
      if (progress < 1) raf = requestAnimationFrame(animate);
      else setTimeout(() => setPhase("mobile-tap"), 350);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    if (phase !== "mobile-tap") return;
    setTouchPos({ x: 50, y: 32 });
    const t = setTimeout(() => setPhase("mobile-open"), 550);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => { if (phase === "mobile-open") { setTouchPos(null); return goTo("mobile-like-tap", 900); } }, [phase]);

  useEffect(() => {
    if (phase !== "mobile-like-tap") return;
    setTouchPos({ x: 12, y: 71 });
    const t = setTimeout(() => { setTouchPos(null); setPhase("mobile-like"); }, 450);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => { if (phase === "mobile-like") { setLiked(true); return goTo("mobile-comment-type", 800); } }, [phase]);

  useEffect(() => {
    if (phase !== "mobile-comment-type") return;
    setTypedComment(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedComment(i);
      if (i >= commentText.length) { clearInterval(interval); setTimeout(() => setPhase("mobile-comment-sent"), 600); }
    }, 28);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => { if (phase === "mobile-comment-sent") { setCommentPosted(true); return goTo("desktop-read", 1200); } }, [phase]);

  // ── Slide 1: Desktop (laptop) — Read → click Write → Write screen ───────────
  useEffect(() => {
    if (phase !== "desktop-read") return;
    setDesktopCursor({ x: 43, y: 50 }); // idle over the Read content
    return goTo("desktop-cursor", 1500);
  }, [phase]);

  useEffect(() => {
    if (phase !== "desktop-cursor") return;
    setDesktopCursor({ x: 50, y: 12 }); // glide up to the "Write" nav item
    return goTo("desktop-write", 950);
  }, [phase]);

  useEffect(() => { if (phase === "desktop-write") return goTo("write-in", 2000); }, [phase]);

  // ── Slide 2: Write (phone) ─────────────────────────────────────────────────
  useEffect(() => { if (phase === "write-in") return goTo("write-type", 500); }, [phase]);

  useEffect(() => {
    if (phase !== "write-type") return;
    setWriteTyped(0);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setWriteTyped(i);
      if (i >= writeBody.length) { clearInterval(interval); setTimeout(() => setPhase("write-publish"), 600); }
    }, 22);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => { if (phase === "write-publish") return goTo("write-success", 700); }, [phase]);
  useEffect(() => { if (phase === "write-success") return goTo("forums-in", 1500); }, [phase]);

  // ── Slide 3: Forums (phone) ────────────────────────────────────────────────
  useEffect(() => { if (phase === "forums-in") return goTo("forums-scroll", 500); }, [phase]);
  useEffect(() => { if (phase === "forums-scroll") return goTo("forums-join", 1000); }, [phase]);
  useEffect(() => { if (phase === "forums-join") { setForumJoined(true); return goTo("you-in", 1400); } }, [phase]);

  // ── Slide 4: You (phone) ───────────────────────────────────────────────────
  useEffect(() => { if (phase === "you-in") return goTo("you-count", 400); }, [phase]);

  useEffect(() => {
    if (phase !== "you-count") return;
    let raf, start = null, resetTimer = null;
    const duration = 1100;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setStatsProgress(progress);
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      } else {
        // Hold the finished profile for a beat, then reset everything and loop.
        resetTimer = setTimeout(() => {
          setLiked(false); setCommentPosted(false); setTypedComment(0); setTouchPos(null);
          setWriteTyped(0); setForumJoined(false); setStatsProgress(0);
          setDesktopCursor({ x: 43, y: 50 });
          if (scrollRef.current) scrollRef.current.scrollTop = 0;
          setPhase("mobile-scroll");
        }, 1300);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(raf); if (resetTimer) clearTimeout(resetTimer); };
  }, [phase]);

  const mobileOpen = phase !== "mobile-scroll" && phase !== "mobile-tap";
  const desktopWriteScreen = phase === "desktop-write";

  // ── Carousel mechanics ──────────────────────────────────────────────────────
  const phaseToSlide = {
    "mobile-scroll":0, "mobile-tap":0, "mobile-open":0, "mobile-like-tap":0, "mobile-like":0,
    "mobile-comment-type":0, "mobile-comment-sent":0,
    "desktop-read":1, "desktop-cursor":1, "desktop-write":1,
    "write-in":2, "write-type":2, "write-publish":2, "write-success":2,
    "forums-in":3, "forums-scroll":3, "forums-join":3,
    "you-in":4, "you-count":4,
  };
  const slideIndex = phaseToSlide[phase] ?? 0;
  const SLOT = 420; // width reserved per slide (slide 320 + 100 gap), keeps the wide laptop clear of its neighbors

  const slideStyle = (i) => {
    const distance = slideIndex - i; // 0 = active, 1 = one slide back, etc.; <0 = not yet reached
    return {
      width:320, flexShrink:0, marginRight:100,
      opacity: distance < 0 ? 0 : distance === 0 ? 1 : Math.max(0.18, 1 - distance * 0.4),
      transform: distance < 0 ? "scale(0.96)" : "scale(1)",
      transition:"opacity 0.5s ease, transform 0.5s ease",
    };
  };

  // Small shared header bar for the phone-based slides (Write / Forums / You)
  const ScreenHeader = ({ label }) => (
    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"24px 12px 8px", borderBottom:"1px solid #F0EDE8", flexShrink:0 }}>
      <Logo size={14}/>
      <span style={{ fontSize:9.5, color:"#444", fontFamily:"'Playfair Display', serif", fontWeight:900 }}>{label}<span style={{ color:"#C8A96E" }}>.</span></span>
    </div>
  );

  return (
    <div style={{ position:"relative", width:"100%", maxWidth:760, margin:"0 auto", overflow:"hidden" }}>
      <div style={{
        display:"flex", alignItems:"center",
        transform:`translateX(calc(50% - 160px - ${slideIndex * SLOT}px))`,
        transition:"transform 0.6s cubic-bezier(0.22,1,0.36,1)",
      }}>

        {/* ── Slide 0: Phone — Feed ── */}
        <div style={slideStyle(0)}>
          <div style={{ width:260, margin:"0 auto", background:"linear-gradient(165deg, #1c1c1c, #0a0a0a)", borderRadius:34, padding:"14px 10px", boxShadow:"0 20px 46px rgba(0,0,0,0.22), inset 0 1px 1px rgba(255,255,255,0.06)", position:"relative" }}>
            <div style={{ position:"absolute", left:-2, top:90, width:3, height:34, background:"#2a2a2a", borderRadius:2 }}/>
            <div style={{ position:"absolute", right:-2, top:130, width:3, height:50, background:"#2a2a2a", borderRadius:2 }}/>

            <div style={{ background:"#fff", borderRadius:22, overflow:"hidden", height:430, position:"relative" }}>
              <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:72, height:17, background:"#111", borderRadius:"0 0 11px 11px", zIndex:20 }}/>

              {touchPos && (
                <div style={{
                  position:"absolute", left:`${touchPos.x}%`, top:`${touchPos.y}%`,
                  transform:"translate(-50%, -50%)", zIndex:30, pointerEvents:"none",
                  width:30, height:30, borderRadius:"50%",
                  background:"rgba(200,169,110,0.35)", border:"2px solid rgba(200,169,110,0.7)",
                  animation:"touch-pulse 0.45s ease-out",
                }}/>
              )}

              {!mobileOpen ? (
                <div ref={scrollRef} style={{ height:"100%", overflow:"hidden", padding:"26px 12px 0" }}>
                  {mockFeed.slice(0, 4).map(item => (
                    <div key={item.id} style={{ transform:"scale(0.74)", transformOrigin:"top center" }}>
                      {item.type==="letter" ? <LetterCard item={item}/> : <NewsCard item={item}/>}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ height:"100%", display:"flex", flexDirection:"column", paddingTop:24 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 12px", borderBottom:"1px solid #F0EDE8" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                    <span style={{ fontSize:9.5, color:"#888", fontFamily:"'DM Sans', sans-serif" }}>Feed</span>
                  </div>
                  <div style={{ flex:1, overflow:"hidden", padding:"12px 14px" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:6, marginBottom:10, padding:"7px 9px", background:"#F9F6F0", borderRadius:7, border:"1px solid #E8E0D0" }}>
                      <div style={{ width:2, background:"#C8A96E", borderRadius:2, alignSelf:"stretch" }}/>
                      <div>
                        <span style={{ fontSize:7, letterSpacing:"0.08em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{demoArticle.publication}</span>
                        <div style={{ fontSize:8.5, color:"#777", fontFamily:"'EB Garamond', serif", fontStyle:"italic", marginTop:1 }}>{demoArticle.headline}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:10 }}>
                      <div style={{ width:26, height:26, borderRadius:"50%", background:demoLetterAuthor.color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontFamily:"'Playfair Display', serif", fontWeight:700 }}>{demoLetterAuthor.initial}</div>
                      <div>
                        <div style={{ fontSize:10.5, fontWeight:600, color:"#111", fontFamily:"'DM Sans', sans-serif" }}>{demoLetterAuthor.author}</div>
                        <div style={{ fontSize:7.5, color:"#BBB", fontFamily:"'DM Mono', monospace" }}>by {demoLetterAuthor.username} <span style={{ color:"#C8A96E" }}>✦ Founding Member</span></div>
                      </div>
                    </div>
                    <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:10.5, lineHeight:1.55, color:"#333", margin:"0 0 12px" }}>{demoLetterAuthor.preview}</p>

                    <div style={{ display:"flex", alignItems:"center", gap:14, paddingBottom:10, borderBottom:"1px solid #F0EDE8", marginBottom:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:4, color: liked ? "#C0392B" : "#bbb", transition:"color 0.2s" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill={liked ? "#C0392B" : "none"} stroke="currentColor" strokeWidth="2" style={{ transform: liked ? "scale(1.15)" : "scale(1)", transition:"transform 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <span style={{ fontSize:9 }}>{liked ? (demoLetterAuthor.likes || 38) + 1 : (demoLetterAuthor.likes || 38)}</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:4, color:"#bbb" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <span style={{ fontSize:9 }}>{commentPosted ? (demoLetterAuthor.replies || 14) + 1 : (demoLetterAuthor.replies || 14)}</span>
                      </div>
                    </div>

                    {commentPosted && (
                      <div style={{ display:"flex", gap:6, animation:"fade-in-up 0.3s ease" }}>
                        <div style={{ width:20, height:20, borderRadius:"50%", background:"#C8A96E", flexShrink:0 }}/>
                        <div>
                          <div style={{ fontSize:8.5, fontWeight:600, color:"#111", fontFamily:"'DM Sans', sans-serif" }}>You</div>
                          <p style={{ fontSize:9, color:"#555", fontFamily:"'EB Garamond', serif", margin:0, lineHeight:1.4 }}>{commentText}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ padding:"8px 12px", borderTop:"1px solid #F0EDE8" }}>
                    <div style={{ background:"#F0EDE8", borderRadius:14, padding:"6px 10px", fontSize:9, color: typedComment > 0 ? "#333" : "#BBB", fontFamily:"'EB Garamond', serif", fontStyle: typedComment > 0 ? "normal" : "italic", minHeight:14 }}>
                      {typedComment > 0 && phase === "mobile-comment-type" ? (
                        <>{commentText.slice(0, typedComment)}<span style={{ display:"inline-block", width:1.5, height:10, background:"#C8A96E", marginLeft:1, verticalAlign:"middle", animation:"blink-cursor 0.9s step-end infinite" }}/></>
                      ) : !commentPosted ? "Write a reply..." : ""}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Slide 1: Laptop — desktop experience: browse Read → click Write → Write screen ── */}
        {/* The laptop is intentionally larger than the phone. It lives in a normal 320px slot for
            the carousel's centering math, but its inner frame is 460px wide and centered via a
            negative margin so it overflows the slot symmetrically. */}
        <div style={slideStyle(1)}>
          <div style={{ width:460, marginLeft:-70 }}>
            <div>
              {/* Lid + screen (landscape, ~16:10) */}
              <div style={{ background:"linear-gradient(165deg, #1c1c1c, #0a0a0a)", borderRadius:"14px 14px 4px 4px", padding:"12px 12px 0", boxShadow:"0 24px 54px rgba(0,0,0,0.24), inset 0 1px 1px rgba(255,255,255,0.06)" }}>
                <div style={{ background:"#fff", borderRadius:5, overflow:"hidden", height:282, position:"relative", display:"flex", flexDirection:"column" }}>

                  {/* Browser chrome */}
                  <div style={{ background:"#F5EFE4", padding:"7px 12px", display:"flex", alignItems:"center", gap:6, borderBottom:"1px solid #E8E0D0", flexShrink:0 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:"#E0D5C0" }}/>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:"#E0D5C0" }}/>
                    <div style={{ width:7, height:7, borderRadius:"50%", background:"#E0D5C0" }}/>
                    <div style={{ flex:1, textAlign:"center", fontSize:9.5, color:"#AAA", fontFamily:"'DM Mono', monospace" }}>
                      tryletters.tech/{desktopWriteScreen ? "write" : "read"}
                    </div>
                  </div>

                  {/* Top nav */}
                  <div style={{ display:"flex", justifyContent:"center", gap:22, padding:"8px 0", borderBottom:"1px solid #F0EDE8", background:"#fff", flexShrink:0 }}>
                    {["Feed","Read","Write","Forums","You"].map(n => {
                      const active = (n === "Read" && phase === "desktop-read") || (n === "Write" && (phase === "desktop-cursor" || phase === "desktop-write"));
                      return (
                        <span key={n} style={{ fontSize:11, fontFamily:"'DM Sans', sans-serif", fontWeight: active ? 700 : 400, color: active ? "#111" : "#BBB", borderBottom: active ? "2px solid #C8A96E" : "2px solid transparent", paddingBottom:2, transition:"color 0.2s ease" }}>{n}</span>
                      );
                    })}
                  </div>

                  {/* Content area */}
                  <div style={{ flex:1, position:"relative", overflow:"hidden" }}>

                    {/* READ screen */}
                    <div style={{ position:"absolute", inset:0, padding:"14px 18px", background:"#F9F6F0", opacity: desktopWriteScreen ? 0 : 1, transition:"opacity 0.4s ease", zIndex:1 }}>
                      <div style={{ fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:11 }}>Trending · Based on your interests</div>
                      {/* Lead story — horizontal */}
                      <div style={{ background:"#fff", border:"1px solid #E8E0D0", borderRadius:9, display:"flex", gap:12, padding:11, marginBottom:11 }}>
                        <div style={{ width:90, height:66, borderRadius:6, background:"#2C3E50", flexShrink:0 }}/>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontSize:8.5, letterSpacing:"0.1em", textTransform:"uppercase", color:"#2C3E50", fontFamily:"'DM Mono', monospace", fontWeight:600, marginBottom:4 }}>The Atlantic · Economy</div>
                          <div style={{ fontFamily:"'Playfair Display', serif", fontSize:15, fontWeight:800, color:"#111", lineHeight:1.2 }}>The Quiet Death of the American Middle Class</div>
                        </div>
                      </div>
                      {/* Two secondary cards */}
                      <div style={{ display:"flex", gap:11 }}>
                        {[{c:"#E67E22",p:"Reuters",t:"EU Reaches Historic Agreement on AI Liability"},{c:"#27AE60",p:"The Guardian",t:"Climate Scientists Warn of Tipping Points by 2030"}].map(a => (
                          <div key={a.p} style={{ flex:1, background:"#fff", border:"1px solid #E8E0D0", borderRadius:9, overflow:"hidden", minWidth:0 }}>
                            <div style={{ height:48, background:a.c }}/>
                            <div style={{ padding:"8px 10px" }}>
                              <div style={{ fontSize:8, letterSpacing:"0.1em", textTransform:"uppercase", color:a.c, fontFamily:"'DM Mono', monospace", fontWeight:600, marginBottom:3 }}>{a.p}</div>
                              <div style={{ fontFamily:"'Playfair Display', serif", fontSize:11.5, fontWeight:700, color:"#111", lineHeight:1.25, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{a.t}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* WRITE screen — the two-column desktop composer */}
                    <div style={{ position:"absolute", inset:0, background:"#F9F6F0", opacity: desktopWriteScreen ? 1 : 0, transform: desktopWriteScreen ? "translateY(0)" : "translateY(8px)", transition:"opacity 0.45s ease, transform 0.45s ease", pointerEvents:"none", zIndex:2 }}>
                      {/* Dark hero */}
                      <div style={{ background:"#111", padding:"11px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderTop:"2px solid #C8A96E" }}>
                        <div>
                          <div style={{ fontSize:7, letterSpacing:"0.22em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:2 }}>Letters · Est. 2025</div>
                          <div style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:900, color:"#F0EAD8", lineHeight:1 }}>Write a Letter<span style={{ color:"#C8A96E" }}>.</span></div>
                        </div>
                        <div style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:14, padding:"5px 12px", fontSize:8.5, color:"#F0EAD8", fontFamily:"'DM Sans', sans-serif", fontWeight:600 }}>◉ Preview</div>
                      </div>
                      {/* Two columns */}
                      <div style={{ display:"flex", gap:9, padding:12 }}>
                        {/* Editor column */}
                        <div style={{ flex:"1.5", display:"flex", gap:6, minWidth:0 }}>
                          <div style={{ display:"flex", flexDirection:"column", gap:5, background:"#fff", border:"1px solid #E8E0D0", borderRadius:5, padding:"7px 4px", height:"fit-content" }}>
                            {[{l:"B",b:1,i:0},{l:"I",b:0,i:1},{l:"U",b:0,i:0}].map(x => (
                              <div key={x.l} style={{ fontSize:10, fontWeight:x.b?700:400, fontStyle:x.i?"italic":"normal", textDecoration:x.l==="U"?"underline":"none", color:"#888", textAlign:"center", width:15, fontFamily:x.i?"'EB Garamond', serif":"'DM Sans', sans-serif" }}>{x.l}</div>
                            ))}
                          </div>
                          <div style={{ flex:1, background:"#fff", border:"1px solid #E8E0D0", borderRadius:5, padding:"10px 12px", minWidth:0 }}>
                            <div style={{ fontFamily:"'Playfair Display', serif", fontSize:13, fontWeight:800, color:"#CCC", borderBottom:"1px solid #F0EDE8", paddingBottom:6, marginBottom:7 }}>Give your letter a headline…</div>
                            <div style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:11.5, color:"#CCC" }}>Dear reader…</div>
                          </div>
                        </div>
                        {/* Source column */}
                        <div style={{ flex:"1", background:"#fff", border:"1px solid #E8E0D0", borderRadius:5, padding:"9px 11px", minWidth:0 }}>
                          <div style={{ fontSize:8, letterSpacing:"0.12em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:8 }}>Link a source</div>
                          {[{c:"#F39C12",p:"BBC Sport"},{c:"#27AE60",p:"The Guardian"}].map(a => (
                            <div key={a.p} style={{ display:"flex", gap:7, alignItems:"center", marginBottom:8 }}>
                              <div style={{ width:22, height:22, borderRadius:4, background:a.c, flexShrink:0 }}/>
                              <div style={{ fontSize:8, letterSpacing:"0.08em", textTransform:"uppercase", color:a.c, fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{a.p}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Cursor — spans the whole screen (chrome + nav + content) so it can reach the Write tab */}
                  {(phase === "desktop-read" || phase === "desktop-cursor") && (
                    <div style={{ position:"absolute", left:`${desktopCursor.x}%`, top:`${desktopCursor.y}%`, transition:"left 0.8s cubic-bezier(0.4,0,0.2,1), top 0.8s cubic-bezier(0.4,0,0.2,1)", zIndex:15, pointerEvents:"none", filter:"drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="#111" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round"><path d="M5 2l5.5 17 2.2-7.2 7.3-2.2L5 2z"/></svg>
                    </div>
                  )}
                </div>
              </div>
              {/* Laptop base + hinge */}
              <div style={{ width:496, marginLeft:-18, height:13, background:"linear-gradient(180deg, #1f1f1f, #0c0c0c)", borderRadius:"2px 2px 7px 7px", boxShadow:"0 9px 18px rgba(0,0,0,0.22)", position:"relative" }}>
                <div style={{ width:84, height:4, background:"#2a2a2a", borderRadius:"0 0 5px 5px", margin:"0 auto" }}/>
              </div>
            </div>
          </div>
        </div>

        {/* ── Slide 2: Phone — Write ── */}
        <div style={slideStyle(2)}>
          <PhoneFrame>
            <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
              <ScreenHeader label="Write"/>
              {phase === "write-success" ? (
                <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 22px", textAlign:"center", animation:"fade-in-up 0.4s ease" }}>
                  <div style={{ width:46, height:46, borderRadius:"50%", background:"#C8A96E", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14, boxShadow:"0 2px 10px rgba(200,169,110,0.4)" }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div style={{ fontSize:8, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:7 }}>Published</div>
                  <div style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:900, color:"#111", lineHeight:1.15 }}>Your letter<br/>is live<span style={{ color:"#C8A96E" }}>.</span></div>
                </div>
              ) : (
                <>
                  <div style={{ flex:1, padding:"14px 16px", overflow:"hidden" }}>
                    {/* Linked source chip */}
                    <div style={{ display:"flex", alignItems:"flex-start", gap:6, marginBottom:13, padding:"7px 9px", background:"#F9F6F0", borderRadius:7, border:"1px solid #E8E0D0", opacity: phase === "write-in" ? 0 : 1, transition:"opacity 0.4s ease" }}>
                      <div style={{ width:2, background:"#C8A96E", borderRadius:2, alignSelf:"stretch" }}/>
                      <div>
                        <div style={{ fontSize:6.5, letterSpacing:"0.1em", textTransform:"uppercase", color:"#BBB", fontFamily:"'DM Mono', monospace", marginBottom:1 }}>In response to</div>
                        <span style={{ fontSize:7, letterSpacing:"0.08em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{demoArticle.publication}</span>
                        <div style={{ fontSize:8.5, color:"#777", fontFamily:"'EB Garamond', serif", fontStyle:"italic", marginTop:1 }}>{demoArticle.headline}</div>
                      </div>
                    </div>
                    {/* Headline */}
                    <div style={{ fontFamily:"'Playfair Display', serif", fontSize:16, fontWeight:800, color:"#111", marginBottom:9, lineHeight:1.2, minHeight:19, opacity: phase === "write-in" ? 0 : 1, transition:"opacity 0.4s ease" }}>{writeHeadline}</div>
                    {/* Body — types itself out */}
                    <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:11, lineHeight:1.65, color:"#333", margin:0 }}>
                      {writeBody.slice(0, writeTyped)}
                      {phase === "write-type" && writeTyped < writeBody.length && (
                        <span style={{ display:"inline-block", width:1.5, height:11, background:"#C8A96E", marginLeft:1, verticalAlign:"middle", animation:"blink-cursor 0.9s step-end infinite" }}/>
                      )}
                    </p>
                  </div>
                  <div style={{ padding:"10px 14px", borderTop:"1px solid #F0EDE8" }}>
                    <div style={{ width:"100%", background:"#111", color:"#F0EAD8", borderRadius:6, padding:"10px 0", textAlign:"center", fontSize:10.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, transform: phase === "write-publish" ? "scale(0.95)" : "scale(1)", opacity: phase === "write-publish" ? 0.85 : 1, transition:"transform 0.15s ease, opacity 0.15s ease" }}>
                      Publish Letter →
                    </div>
                  </div>
                </>
              )}
            </div>
          </PhoneFrame>
        </div>

        {/* ── Slide 3: Phone — Forums ── */}
        <div style={slideStyle(3)}>
          <PhoneFrame>
            <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
              <ScreenHeader label="Forums"/>
              <div style={{ flex:1, overflow:"hidden", padding:"12px 14px", background:"#F9F6F0" }}>
                <div style={{ fontSize:7.5, letterSpacing:"0.14em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace", marginBottom:10 }}>Discover forums</div>
                {demoForums.map((f, i) => {
                  const joined = forumJoined && i === 0;
                  return (
                    <div key={f.name} style={{ background:"#fff", border:"1px solid #E8E0D0", borderRadius:9, padding:"9px 10px", marginBottom:8, display:"flex", alignItems:"center", gap:9 }}>
                      <div style={{ width:30, height:30, borderRadius:7, background:f.color, flexShrink:0 }}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:"'Playfair Display', serif", fontSize:11, fontWeight:700, color:"#111", lineHeight:1.1 }}>{f.name}</div>
                        <div style={{ fontSize:7.5, color:"#BBB", fontFamily:"'DM Mono', monospace", marginTop:2 }}>{f.members} members</div>
                      </div>
                      <div style={{
                        background: joined ? "#F0EDE8" : "#111", color: joined ? "#888" : "#F0EAD8",
                        borderRadius:20, padding:"4px 12px", fontSize:8.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600,
                        transition:"all 0.25s ease", transform: joined ? "scale(1.05)" : "scale(1)",
                      }}>
                        {joined ? "Joined" : "Join"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </PhoneFrame>
        </div>

        {/* ── Slide 4: Phone — You ── */}
        <div style={slideStyle(4)}>
          <PhoneFrame>
            <div style={{ height:"100%", display:"flex", flexDirection:"column" }}>
              <ScreenHeader label="You"/>
              <div style={{ flex:1, padding:"18px 16px", background:"#fff" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:15 }}>
                  <div style={{ width:52, height:52, borderRadius:"50%", background:"#2D6A4F", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontFamily:"'Playfair Display', serif", fontSize:22, fontWeight:900, flexShrink:0 }}>M</div>
                  <div>
                    <div style={{ fontFamily:"'Playfair Display', serif", fontSize:15, fontWeight:900, color:"#111", lineHeight:1.1 }}>Margaret T.</div>
                    <div style={{ fontSize:8, fontFamily:"'DM Mono', monospace", marginTop:3, color:"#C8A96E", opacity: phase === "you-count" ? 1 : 0, transition:"opacity 0.5s ease" }}>✦ Founding Member</div>
                  </div>
                </div>
                <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:10, lineHeight:1.55, color:"#666", margin:"0 0 16px", fontStyle:"italic" }}>
                  Pharmacist and health-policy writer in Youngstown. Letters on healthcare, local news, and the long arc of the Rust Belt.
                </p>
                <div style={{ display:"flex", borderTop:"1px solid #F0EDE8", borderBottom:"1px solid #F0EDE8" }}>
                  {youStats.map((s, i) => (
                    <div key={s.label} style={{ flex:1, textAlign:"center", padding:"11px 2px", borderRight: i < youStats.length-1 ? "1px solid #F0EDE8" : "none" }}>
                      <div style={{ fontFamily:"'Playfair Display', serif", fontSize:17, fontWeight:700, color:"#111", lineHeight:1 }}>{Math.round(s.value * statsProgress)}</div>
                      <div style={{ fontSize:6.5, letterSpacing:"0.1em", textTransform:"uppercase", color:"#AAA", fontFamily:"'DM Mono', monospace", marginTop:3 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </PhoneFrame>
        </div>

      </div>

      <style>{`
        @keyframes blink-cursor { 0%,49% { opacity:1 } 50%,100% { opacity:0 } }
        @keyframes fade-in-up { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }
        @keyframes touch-pulse { 0% { transform:translate(-50%,-50%) scale(0.4); opacity:0.8; } 100% { transform:translate(-50%,-50%) scale(1); opacity:1; } }
      `}</style>
    </div>
  );
}

function MarketingHomePage({ navigate }) {
  const [showModal, setShowModal] = useState(false);
  return (
    <div style={{ minHeight:"100vh", background:"#fff" }}>
      <header style={{ position:"sticky", top:0, zIndex:50, background:"rgba(255,255,255,0.96)", backdropFilter:"blur(10px)", borderBottom:"1px solid #F0EDE8" }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"0 20px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <Logo size={38}/>
            <span style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:900, color:"#111", letterSpacing:"-0.01em" }}>Letters<span style={{ color:"#C8A96E" }}>.</span></span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button onClick={() => navigate("signin")} style={{ background:"none", border:"none", fontSize:12.5, color:"#888", fontFamily:"'DM Sans', sans-serif", fontWeight:500, cursor:"pointer" }}>Sign in</button>
            <button onClick={() => setShowModal(true)} style={{ background:"#111", border:"none", borderRadius:20, padding:"6px 16px", fontSize:12.5, color:"#F0EAD8", fontFamily:"'DM Sans', sans-serif", fontWeight:500, cursor:"pointer" }}>Request invite</button>
          </div>
        </div>
      </header>
      <main style={{ filter:showModal?"blur(2px)":"none", transition:"filter 0.3s ease", pointerEvents:showModal?"none":"auto" }}>

        {/* Hero — logo and tagline as the entire pitch, no supporting copy block */}
        <div style={{ maxWidth:760, margin:"0 auto", padding:"80px 24px 40px", textAlign:"center" }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:32 }}>
            <Logo size={168}/>
          </div>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:"clamp(34px, 7vw, 64px)", fontWeight:900, color:"#111", margin:"0 0 22px", letterSpacing:"-0.03em", lineHeight:1.05, whiteSpace:"nowrap" }}>
            Awaiting Your Reply<span style={{ color:"#C8A96E" }}>.</span>
          </h1>
          <div style={{ fontSize:11, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:36 }}>
            Now accepting founding members
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => setShowModal(true)} style={{ background:"#111", color:"#F0EAD8", border:"none", borderRadius:6, padding:"14px 30px", fontSize:14, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer" }}>
              Request an Invitation →
            </button>
            <button onClick={() => navigate("how-it-works")} style={{ background:"none", color:"#555", border:"1px solid #C8BFA8", borderRadius:6, padding:"14px 30px", fontSize:14, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer" }}>
              How It Works
            </button>
          </div>
        </div>

        {/* Self-playing demo — phone scrolls/opens/likes/replies, then a desktop panel
            slides in alongside it to show quoting an article into a letter */}
        <div style={{ maxWidth:1020, margin:"0 auto 100px", padding:"0 24px", overflowX:"auto" }}>
          <AnimatedDemoFeed/>
        </div>
      </main>
      {showModal && <HomepageModal onDismiss={() => setShowModal(false)} navigate={(page) => { setShowModal(false); navigate(page); }}/>}
    </div>
  );
}

function HowItWorksPage({ navigate }) {
  const steps = [
    {
      label: "Read",
      title: "Curated news, no algorithm games.",
      body: "A real-time feed pulling from national outlets and local civic newsrooms — BBC, The Guardian, NPR, and a growing list of nonprofit local papers. No engagement-bait, no outrage sorting.",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    },
    {
      label: "Write",
      title: "A letter, not a tweet.",
      body: "Respond to a story with a real letter — quote the source verbatim, format your thinking, and put your name behind it. No character limit forcing you into a soundbite.",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    },
    {
      label: "Build standing",
      title: "Quality earns you a name, not a viral hit.",
      body: "Contributor status — from Letters Contributor up through Senior Correspondent and Verified Journalist — is built on the substance of what you write, not how many people retweeted it.",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12"/></svg>,
    },
    {
      label: "Gather",
      title: "Forums for people who want to go deeper.",
      body: "Topic communities, verified institutional spaces (think a publication's own moderated forum), and communities anyone can request to start — each pairing a letters-style feed with live discussion.",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#C8A96E" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#fff" }}>
      <header style={{ position:"sticky", top:0, zIndex:50, background:"rgba(255,255,255,0.96)", backdropFilter:"blur(10px)", borderBottom:"1px solid #F0EDE8" }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"0 20px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={() => navigate("home")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:10, padding:0 }}>
            <Logo size={34}/><span style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:900, color:"#111" }}>Letters<span style={{ color:"#C8A96E" }}>.</span></span>
          </button>
          <button onClick={() => navigate("home")} style={{ fontSize:12, color:"#AAA", fontFamily:"'EB Garamond', serif", fontStyle:"italic", background:"none", border:"none", cursor:"pointer" }}>← Back</button>
        </div>
      </header>

      <main style={{ maxWidth:640, margin:"0 auto", padding:"56px 24px 80px" }}>
        <BroadsheetRule left={MASTHEAD_LABEL} center="Dear Reader" right="Free to Join"/>
        <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:12 }}>How It Works</div>
        <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:36, fontWeight:900, color:"#111", margin:"0 0 16px", letterSpacing:"-0.02em", lineHeight:1.1 }}>
          Awaiting Your Reply<span style={{ color:"#C8A96E" }}>.</span>
        </h1>
        <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:17, color:"#777", lineHeight:1.75, margin:"0 0 40px", fontStyle:"italic" }}>
          Most platforms reward the loudest take. Letters rewards the best one. Here's the loop.
        </p>

        <div style={{ display:"flex", flexDirection:"column", gap:32 }}>
          {steps.map((step, i) => (
            <div key={step.label} style={{ display:"flex", gap:18 }}>
              <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center" }}>
                <div style={{ width:44, height:44, borderRadius:"50%", background:"#F9F6F0", border:"1px solid #E8E0D0", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {step.icon}
                </div>
                {i < steps.length - 1 && <div style={{ width:1, flex:1, background:"#E8E0D0", marginTop:8 }}/>}
              </div>
              <div style={{ paddingBottom:8 }}>
                <div style={{ fontSize:9.5, letterSpacing:"0.16em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:6 }}>
                  Step {i+1} · {step.label}
                </div>
                <h3 style={{ fontFamily:"'Playfair Display', serif", fontSize:20, fontWeight:800, color:"#111", margin:"0 0 8px", lineHeight:1.25 }}>{step.title}</h3>
                <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:15, color:"#666", lineHeight:1.65, margin:0 }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop:48, padding:"24px 26px", background:"#F9F6F0", borderRadius:12, border:"1px solid #E8E0D0", textAlign:"center" }}>
          <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:15, color:"#777", margin:"0 0 18px", lineHeight:1.6 }}>
            Letters is launching to a small group of founding members first.
          </p>
          <button onClick={() => navigate("invite")} style={{ background:"#111", color:"#F0EAD8", border:"none", borderRadius:6, padding:"13px 28px", fontSize:13.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer" }}>
            Request an Invitation →
          </button>
        </div>
      </main>
    </div>
  );
}

function InvestorPage({ navigate }) {
  return (
    <div style={{ minHeight:"100vh", background:"#fff" }}>
      <header style={{ position:"sticky", top:0, zIndex:50, background:"rgba(255,255,255,0.96)", backdropFilter:"blur(10px)", borderBottom:"1px solid #F0EDE8" }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"0 20px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={() => navigate("home")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:10, padding:0 }}>
            <Logo size={34}/><span style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:900, color:"#111" }}>Letters<span style={{ color:"#C8A96E" }}>.</span></span>
          </button>
          <button onClick={() => navigate("home")} style={{ fontSize:12, color:"#AAA", fontFamily:"'EB Garamond', serif", fontStyle:"italic", background:"none", border:"none", cursor:"pointer" }}>← Back</button>
        </div>
      </header>

      <main style={{ maxWidth:640, margin:"0 auto", padding:"56px 24px 80px" }}>
        <BroadsheetRule left={MASTHEAD_LABEL} center="For Investors" right="Pre-Seed"/>
        <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:12 }}>The Thesis</div>
        <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:34, fontWeight:900, color:"#111", margin:"0 0 16px", letterSpacing:"-0.02em", lineHeight:1.15 }}>
          Quality, not virality<span style={{ color:"#C8A96E" }}>.</span>
        </h1>
        <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:16.5, color:"#666", lineHeight:1.75, margin:"0 0 32px" }}>
          Every major social platform monetizes attention through engagement-optimized algorithms, which rewards outrage over insight. Letters is built on the opposite premise: a platform where the quality of what you write determines your standing, not how viral it goes.
        </p>

        <div style={{ borderTop:"1px solid #111", borderBottom:"3px solid #111", padding:"5px 0", marginBottom:28 }}/>

        {[
          { label:"The Comparables", body:"Substack proved readers and writers will pay for quality. The Atlantic and NYT proved premium editorial content commands premium pricing. Reddit proved community-organized discourse at scale is valuable — Letters positions as the anti-Reddit on quality bar." },
          { label:"The Model", body:"A platform-wide reader subscription (the \"Letters Press Pass\") pools revenue and distributes it to contributors based on actual engagement their letters receive — ad-free, and aligned with quality rather than volume." },
          { label:"The Stage", body:"Pre-seed. A working product is live with a real, automated news pipeline, real user-generated content infrastructure, and an engaged early cohort. Raising to bring on a technical co-founder and reach the first 1,000 active users." },
        ].map(section => (
          <div key={section.label} style={{ marginBottom:26 }}>
            <div style={{ fontSize:9.5, letterSpacing:"0.16em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:8 }}>{section.label}</div>
            <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:15.5, color:"#555", lineHeight:1.7, margin:0 }}>{section.body}</p>
          </div>
        ))}

        <div style={{ marginTop:40, padding:"24px 26px", background:"#111", borderRadius:12, textAlign:"center" }}>
          <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:15, color:"#999", margin:"0 0 18px", lineHeight:1.6 }}>
            Interested in the full deck or a conversation?
          </p>
          <a href="mailto:chris@tryletters.tech" style={{ display:"inline-block", background:"#F0EAD8", color:"#111", border:"none", borderRadius:6, padding:"13px 28px", fontSize:13.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, textDecoration:"none" }}>
            Get in touch →
          </a>
        </div>
      </main>
    </div>
  );
}

function InvitePage({ navigate }) {
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", occupation:"", referral:"", referralOther:"" });
  const [focused, setFocused] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [errors, setErrors] = useState({});
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    setSubmitError(null);
    const { error } = await supabase.from("waitlist").insert({
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      email: form.email.trim(),
      occupation: form.occupation.trim(),
      referral: form.referral,
      referral_other: form.referralOther.trim() || null,
    });
    if (error) {
      console.error("Waitlist submission failed:", error);
      setSubmitError("Something went wrong submitting your request. Please try again.");
      setSubmitting(false);
      return;
    }

    // Notify chris@tryletters.tech that a new invite request came in.
    // Fire-and-forget: the waitlist row is already saved, so the user's signup
    // succeeds and they see the success screen even if this email ever fails.
    supabase.functions.invoke("notify-waitlist", {
      body: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        occupation: form.occupation.trim(),
        referral: form.referral,
        referralOther: form.referralOther.trim() || null,
      },
    }).catch((err) => console.error("Notification email failed (signup still recorded):", err));

    setSubmitting(false);
    setSubmitted(true);
  };

  const validate = () => {
    const e={};
    if(!form.firstName.trim()) e.firstName="Required";
    if(!form.lastName.trim()) e.lastName="Required";
    if(!form.email.trim()||!form.email.includes("@")) e.email="Valid email required";
    if(!form.occupation.trim()) e.occupation="Required";
    if(!form.referral) e.referral="Please select an option";
    return e;
  };
  const inputStyle = (field) => ({ width:"100%", padding:"12px 14px", fontSize:15, fontFamily:"'EB Garamond', Georgia, serif", color:"#111", background:focused===field?"#fff":"#FDFCF8", border:`1px solid ${errors[field]?"#C0392B":focused===field?"#111":"#C8BFA8"}`, borderRadius:5, outline:"none", transition:"all 0.15s", boxSizing:"border-box", appearance:"none" });
  const labelStyle = { fontSize:9.5, letterSpacing:"0.14em", textTransform:"uppercase", color:"#888", fontFamily:"'DM Mono', monospace", display:"block", marginBottom:6 };
  const errStyle = { fontSize:11, color:"#C0392B", fontFamily:"'EB Garamond', serif", fontStyle:"italic", marginTop:4, display:"block" };
  return (
    <div style={{ minHeight:"100vh", background:"#F9F6F0" }}>
      <header style={{ borderBottom:"1px solid #E8E0D0", background:"rgba(249,246,240,0.96)", backdropFilter:"blur(10px)", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:900, margin:"0 auto", padding:"0 28px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <button onClick={() => navigate("home")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:10, padding:0 }}>
            <Logo size={34}/><span style={{ fontFamily:"'Playfair Display', serif", fontSize:18, fontWeight:900, color:"#111" }}>Letters<span style={{ color:"#C8A96E" }}>.</span></span>
          </button>
          <button onClick={() => navigate("home")} style={{ fontSize:12, color:"#AAA", fontFamily:"'EB Garamond', serif", fontStyle:"italic", background:"none", border:"none", cursor:"pointer" }}>← Back</button>
        </div>
      </header>
      <main style={{ maxWidth:560, margin:"0 auto", padding:"60px 28px 80px" }}>
        {!submitted ? (
          <>
            <BroadsheetRule left={MASTHEAD_LABEL} center="First Print" right="Free to Join"/>
            <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:12 }}>Request an Invitation</div>
            <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:38, fontWeight:900, color:"#111", margin:"0 0 14px", letterSpacing:"-0.02em", lineHeight:1.1 }}>Join Letters<span style={{ color:"#C8A96E" }}>.</span></h1>
            <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:16.5, color:"#777", lineHeight:1.7, margin:"0 0 28px", fontStyle:"italic" }}>Letters is launching to a small group of founding members first. Leave your details and we'll be in touch.</p>
            <div style={{ borderTop:"1px solid #111", borderBottom:"3px solid #111", padding:"5px 0", marginBottom:28 }}/>
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div style={{ display:"flex", gap:14 }}>
                <div style={{ flex:1 }}>
                  <label style={labelStyle}>First Name</label>
                  <input type="text" placeholder="First name" value={form.firstName} onChange={e=>set("firstName",e.target.value)} onFocus={()=>{setFocused("firstName");setErrors(er=>({...er,firstName:null}))}} onBlur={()=>setFocused(null)} style={inputStyle("firstName")}/>
                  {errors.firstName && <span style={errStyle}>{errors.firstName}</span>}
                </div>
                <div style={{ flex:1 }}>
                  <label style={labelStyle}>Last Name</label>
                  <input type="text" placeholder="Last name" value={form.lastName} onChange={e=>set("lastName",e.target.value)} onFocus={()=>{setFocused("lastName");setErrors(er=>({...er,lastName:null}))}} onBlur={()=>setFocused(null)} style={inputStyle("lastName")}/>
                  {errors.lastName && <span style={errStyle}>{errors.lastName}</span>}
                </div>
              </div>
              <div><label style={labelStyle}>Email Address</label><input type="email" placeholder="you@example.com" value={form.email} onChange={e=>set("email",e.target.value)} onFocus={()=>{setFocused("email");setErrors(er=>({...er,email:null}))}} onBlur={()=>setFocused(null)} style={inputStyle("email")}/>{errors.email && <span style={errStyle}>{errors.email}</span>}</div>
              <div><label style={labelStyle}>Occupation / Profession</label><input type="text" placeholder="What do you do?" value={form.occupation} onChange={e=>set("occupation",e.target.value)} onFocus={()=>{setFocused("occupation");setErrors(er=>({...er,occupation:null}))}} onBlur={()=>setFocused(null)} style={inputStyle("occupation")}/>{errors.occupation && <span style={errStyle}>{errors.occupation}</span>}</div>
              <div>
                <label style={labelStyle}>How did you hear about Letters?</label>
                <div style={{ position:"relative" }}>
                  <select value={form.referral} onChange={e=>{set("referral",e.target.value);setErrors(er=>({...er,referral:null}))}} style={{...inputStyle("referral"), color:form.referral?"#111":"#B8B0A0", fontStyle:form.referral?"normal":"italic", paddingRight:36, cursor:"pointer"}}>
                    <option value="" disabled>Select an option</option>
                    {referralOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <svg style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
                {errors.referral && <span style={errStyle}>{errors.referral}</span>}
              </div>
              {form.referral==="Other" && <div><label style={labelStyle}>Please tell us more</label><input type="text" placeholder="Where did you find us?" value={form.referralOther} onChange={e=>set("referralOther",e.target.value)} onFocus={()=>setFocused("referralOther")} onBlur={()=>setFocused(null)} style={inputStyle("referralOther")}/></div>}
              <div style={{ borderTop:"1px solid #E8E0D0", margin:"4px 0" }}/>
              {submitError && (
                <div style={{ background:"#FDF0F0", border:"1px solid #C8A8A8", borderRadius:5, padding:"10px 14px", fontSize:13, color:"#C0392B", fontFamily:"'EB Garamond', serif", fontStyle:"italic" }}>
                  {submitError}
                </div>
              )}
              <button onClick={handleSubmit} disabled={submitting} style={{ width:"100%", background:submitting?"#555":"#111", color:"#F0EAD8", border:"none", borderRadius:6, padding:"15px 0", fontSize:14, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:submitting?"not-allowed":"pointer", lineHeight:1.4 }}>
                <span style={{ display:"block", fontSize:9.5, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:500, marginBottom:2 }}>First Print</span>
                {submitting ? "Submitting..." : "Submit My Request →"}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <Logo size={64}/>
            <div style={{ marginTop:32 }}>
              <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:14 }}>You're on the list</div>
              <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:36, fontWeight:900, color:"#111", margin:"0 0 16px" }}>Thank you, {form.firstName}<span style={{ color:"#C8A96E" }}>.</span></h2>
              <p style={{ fontFamily:"'EB Garamond', serif", fontSize:17, lineHeight:1.75, color:"#666", fontStyle:"italic", margin:"0 0 32px" }}>We'll be in touch at <strong style={{ fontStyle:"normal", color:"#111" }}>{form.email}</strong> when your invitation is ready.</p>
              <button onClick={() => navigate("home")} style={{ background:"none", color:"#AAA", border:"1px solid #C8BFA8", borderRadius:6, padding:"9px 24px", fontSize:12, fontFamily:"'DM Sans', sans-serif", cursor:"pointer" }}>← Back to Letters</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── App Router ────────────────────────────────────────────────────────────────
// Wraps the real authenticated app in a Router context and translates the
// old setTab("write")-style calls into real navigation, so every existing
// page component (FeedPage, ReadPage, WritePage, ForumsPage, YouPage) keeps
// working with minimal internal changes.
function AuthenticatedApp({ session, handleSignOut }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive the active top-level tab from the URL for the nav components,
  // e.g. "/feed/letter/abc123" -> "feed"
  const activeTab = location.pathname.split("/")[1] || "feed";

  // Old code calls onNavigate("write") etc. — translate that single-segment
  // tab name into a real route change.
  const goToTab = (tabName) => navigate(`/${tabName}`);

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&family=Lora:ital,wght@0,400;0,600;1,400&family=Special+Elite&family=Inter:wght@400;500&display=swap');
        .letters-bottom-nav { display: block; }
        .letters-sidebar { display: none; }
        .letters-rightnav { display: none; }
        .letters-write-preview { display: none; }
        @media (min-width: 768px) {
          .letters-sidebar { display: flex !important; }
          .letters-rightnav { display: flex !important; }
          .letters-hamburger { display: none !important; }
          .letters-main { margin-left: 220px !important; margin-right: 160px !important; }
          .letters-feed-pane { margin-left: 220px !important; width: 480px !important; flex-shrink: 0 !important; border-right: 1px solid #F0EDE8; transition: width 0.25s ease; }
          .letters-feed-pane.is-expanded { width: 760px !important; }
          .letters-detail-pane { display: flex !important; margin-right: 160px !important; }
          .letters-write-preview { display: block !important; }
          .letters-write-row { flex-direction: row !important; }
          .write-source-spacer { display: block !important; }
          .letters-bottom-nav { display: none !important; }
        }
        /* ── Read tab (Option A): persistent Letters rail beside the news column.
             Single stacked column until 1200px (below that the fixed 220px+160px
             nav chrome leaves too little room for two columns); Letters on top. ── */
        .read-grid { display: block; }
        @media (min-width: 1200px) {
          .read-main { max-width: 1120px !important; }
          .read-grid {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) 312px;
            gap: 32px;
            align-items: start;
          }
          .read-news { grid-column: 1; grid-row: 1; min-width: 0; }
          .read-rail {
            grid-column: 2;
            grid-row: 1;
            position: sticky;
            /* Clear the 54px sticky TopBar so the "Letters" banner pins cleanly
               below it and the whole rail travels down with the scroll. */
            top: 70px;
            max-height: calc(100vh - 86px);
            overflow-y: auto;
            scrollbar-width: thin;
          }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .write-source-spacer { display: none; }
        .letters-editor:empty:before { content: attr(data-placeholder); color: #B0A898; font-style: italic; }
        blockquote { margin: 10px 0; padding: 8px 14px; border-left: 3px solid #C8A96E; background: #F9F6F0; font-style: italic; color: #555; }
        .letters-editor blockquote[data-quote="true"] { position: relative; padding-right: 30px; }
        .letters-editor blockquote[data-quote="true"]::after {
          content: "❝";
          position: absolute;
          top: 6px;
          right: 12px;
          font-size: 15px;
          color: #C8A96E;
          opacity: 0.45;
          font-style: normal;
        }
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>

      {/* Global desktop sidebar — visible on all tabs */}
      <div className="letters-sidebar" style={{ position:"fixed", top:0, left:0, bottom:0, width:220, background:"#fff", borderRight:"1px solid #F0EDE8", zIndex:60, flexDirection:"column" }}>
        <SideNav activeTab={activeTab} onNavigate={goToTab} onSignOut={handleSignOut} session={session}/>
      </div>

      {/* Global desktop right nav */}
      <RightNav active={activeTab} onNavigate={goToTab}/>

      {/* Page content — real routes now, not state */}
      <Routes>
        <Route path="/" element={<Navigate to="/feed" replace/>}/>
        <Route path="/feed" element={<FeedPage session={session} onSignOut={handleSignOut} onNavigate={goToTab} activeTab={activeTab}/>}/>
        <Route path="/feed/letter/:letterId" element={<FeedPage session={session} onSignOut={handleSignOut} onNavigate={goToTab} activeTab={activeTab}/>}/>
        <Route path="/read" element={<ReadPage onNavigate={goToTab} session={session}/>}/>
        <Route path="/read/article/:articleId" element={<ReadPage onNavigate={goToTab} session={session}/>}/>
        <Route path="/read/publication/:publicationName" element={<ReadPage onNavigate={goToTab} session={session}/>}/>
        <Route path="/write" element={<WritePage session={session} onNavigate={goToTab}/>}/>
        <Route path="/forums" element={<ForumsPage session={session} onSignOut={handleSignOut} onNavigate={goToTab}/>}/>
        <Route path="/forums/:slug" element={<ForumDetailPage session={session} onNavigate={goToTab}/>}/>
        <Route path="/you" element={<YouPage session={session} onSignOut={handleSignOut}/>}/>
        <Route path="*" element={<Navigate to="/feed" replace/>}/>
      </Routes>

      {/* Global mobile bottom nav */}
      <div className="letters-bottom-nav">
        <BottomNav active={activeTab} onNavigate={goToTab}/>
      </div>
    </div>
  );
}

// Marketing/auth site shown when logged out — also routed, so /signin and
// /invite are real, shareable, refreshable URLs instead of button-only state.
function MarketingSite({ onAuthSuccess }) {
  const navigate = useNavigate();
  const goTo = (page) => navigate(page === "home" ? "/" : `/${page}`);

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: #B0A898; font-style: italic; font-family: 'EB Garamond', Georgia, serif; font-size: 14px; }
      `}</style>
      <Routes>
        <Route path="/" element={<MarketingHomePage navigate={goTo}/>}/>
        <Route path="/invite" element={<InvitePage navigate={goTo}/>}/>
        <Route path="/how-it-works" element={<HowItWorksPage navigate={goTo}/>}/>
        <Route path="/investor" element={<InvestorPage navigate={goTo}/>}/>
        <Route path="/signin" element={
          <div style={{ minHeight:"100vh", background:"#F9F6F0", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20 }}>
            <button onClick={() => goTo("home")}
              style={{ position:"fixed", top:20, left:20, background:"none", border:"none", cursor:"pointer", color:"#888", display:"flex", alignItems:"center", gap:6, fontFamily:"'DM Sans', sans-serif", fontSize:13 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
              Back
            </button>
            <Auth onAuthSuccess={onAuthSuccess}/>
          </div>
        }/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  if (loadingSession) return (
    <div style={{ minHeight:"100vh", background:"#F9F6F0", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace" }}>Loading...</span>
    </div>
  );

  return (
    <BrowserRouter>
      {!session
        ? <MarketingSite onAuthSuccess={() => setSession(true)}/>
        : <AuthenticatedApp session={session} handleSignOut={handleSignOut}/>
      }
    </BrowserRouter>
  );
}
