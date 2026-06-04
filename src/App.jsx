import { useState, useEffect } from "react";

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

// ── Shared: Nav ───────────────────────────────────────────────────────────────
function Nav({ navigate, onRequestInvite, bg = "rgba(255,255,255,0.96)", border = "#F0EDE8" }) {
  return (
    <header style={{ borderBottom: `1px solid ${border}`, background: bg, backdropFilter: "blur(10px)", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 28px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 0 }}>
          <Logo size={34}/>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 900, color: "#111", letterSpacing: "-0.01em" }}>Letters<span style={{ color: "#C8A96E" }}>.</span></span>
        </button>
        <button onClick={onRequestInvite} style={{ background: "#111", border: "none", borderRadius: 20, padding: "7px 18px", fontSize: 12.5, color: "#F0EAD8", fontFamily: "'DM Sans', sans-serif", fontWeight: 500, cursor: "pointer" }}>
          Request invite
        </button>
      </div>
    </header>
  );
}

// ── Shared: BroadsheetRule ────────────────────────────────────────────────────
function BroadsheetRule({ left, center, right }) {
  return (
    <div style={{ borderTop: "3px solid #111", borderBottom: "1px solid #111", padding: "5px 0", marginBottom: 28, display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#888", fontFamily: "'DM Mono', monospace" }}>{left}</span>
      <span style={{ fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C8A96E", fontFamily: "'DM Mono', monospace" }}>✦ {center} ✦</span>
      <span style={{ fontSize: 9.5, letterSpacing: "0.16em", textTransform: "uppercase", color: "#888", fontFamily: "'DM Mono', monospace" }}>{right}</span>
    </div>
  );
}

// ── Page: Homepage ────────────────────────────────────────────────────────────
const feed = [
  { id:1, type:"letter", author:"Margaret T.", initial:"M", color:"#2D6A4F", timeAgo:"2h ago", section:"Economy", publication:"The Atlantic", headline:"The Quiet Death of the American Middle Class", preview:"The framing of this piece misses what's actually happening in rust-belt communities. Having lived in Youngstown for 30 years, I can tell you the numbers don't capture the social fabric that's unraveled...", replies:14, likes:38 },
  { id:2, type:"news", publication:"Reuters", section:"World", headline:"EU Reaches Historic Agreement on AI Liability Framework", summary:"After three years of negotiations, member states have signed a landmark directive holding AI developers responsible for harms caused by their systems.", timeAgo:"4h ago", letters:6 },
  { id:3, type:"letter", author:"David K.", initial:"D", color:"#1B4F72", timeAgo:"5h ago", section:"Technology", publication:"NYT", headline:"EU Reaches Historic Agreement on AI Liability Framework", preview:"This is being celebrated as progress, but the liability caps written into section 4(b) effectively immunize the largest players while crushing any startup that can't afford compliance infrastructure...", replies:27, likes:91 },
  { id:4, type:"letter", author:"Priya N.", initial:"P", color:"#6B2D8B", timeAgo:"7h ago", section:"Climate", publication:"The Guardian", headline:"Climate Scientists Warn of Tipping Points by 2030", preview:"As someone who has spent 15 years modeling ice sheet dynamics, I want to clarify what 'irreversible' actually means in this context — the article conflates two very different timescales...", replies:42, likes:156 },
  { id:5, type:"news", publication:"AP News", section:"Politics", headline:"Senate Advances Bipartisan Infrastructure Spending Bill", summary:"The measure allocates $180 billion to broadband expansion and rural transit over the next decade.", timeAgo:"9h ago", letters:18 },
  { id:6, type:"letter", author:"James W.", initial:"J", color:"#7A3B1E", timeAgo:"11h ago", section:"Culture", publication:"The New Yorker", headline:"How Streaming Killed the Auteur", preview:"Coppola's latest is a disaster by almost any metric, but it's a fascinating one — the kind of failure only possible when a filmmaker has total freedom and no one left to say no...", replies:63, likes:204 },
];

function Avatar({ initial, color, size=34 }) {
  return <div style={{ width:size, height:size, borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:size*0.38, fontFamily:"'Playfair Display', serif", fontWeight:500, flexShrink:0 }}>{initial}</div>;
}

function LetterCard({ item }) {
  return (
    <article style={{ borderBottom:"1px solid #F0EDE8", padding:"20px 0" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, paddingLeft:46 }}>
        <div style={{ width:2, height:26, background:"#C8A96E", borderRadius:2, marginLeft:-18, flexShrink:0 }}/>
        <div>
          <span style={{ fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{item.publication}</span>
          <span style={{ fontSize:10, color:"#aaa", fontFamily:"'DM Mono', monospace" }}> · {item.section}</span>
          <div style={{ fontSize:11.5, color:"#666", fontFamily:"'EB Garamond', Georgia, serif", fontStyle:"italic", marginTop:1 }}>{item.headline}</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:12 }}>
        <Avatar initial={item.initial} color={item.color}/>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:13, fontWeight:600, color:"#1a1a1a", fontFamily:"'DM Sans', sans-serif" }}>{item.author}</span>
            <span style={{ fontSize:10, color:"#bbb", fontFamily:"'DM Mono', monospace" }}>{item.timeAgo}</span>
          </div>
          <p style={{ margin:0, fontSize:14.5, lineHeight:1.65, color:"#444", fontFamily:"'EB Garamond', Georgia, serif", display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{item.preview}</p>
          <div style={{ display:"flex", gap:18, marginTop:12 }}>
            <span style={{ fontSize:11, color:"#bbb", fontFamily:"'DM Sans', sans-serif" }}>♡ {item.likes}</span>
            <span style={{ fontSize:11, color:"#bbb", fontFamily:"'DM Sans', sans-serif" }}>↩ {item.replies} replies</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function NewsCard({ item }) {
  return (
    <article style={{ borderBottom:"1px solid #F0EDE8", padding:"20px 0", background:"#FDFCFA", margin:"0 -20px", paddingLeft:20, paddingRight:20 }}>
      <div style={{ display:"flex", justifyContent:"space-between", gap:16, alignItems:"flex-start" }}>
        <div style={{ flex:1 }}>
          <div style={{ marginBottom:6 }}>
            <span style={{ fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:600 }}>{item.publication}</span>
            <span style={{ fontSize:10, color:"#aaa", fontFamily:"'DM Mono', monospace" }}> · {item.section}</span>
          </div>
          <h3 style={{ margin:"0 0 7px", fontSize:16, fontWeight:600, lineHeight:1.35, color:"#111", fontFamily:"'EB Garamond', Georgia, serif" }}>{item.headline}</h3>
          <p style={{ margin:"0 0 10px", fontSize:13, lineHeight:1.6, color:"#777", fontFamily:"'EB Garamond', Georgia, serif" }}>{item.summary}</p>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:10, color:"#bbb", fontFamily:"'DM Mono', monospace" }}>{item.timeAgo}</span>
            <span style={{ fontSize:11, color:"#999", background:"#F0EDE8", borderRadius:20, padding:"2px 10px", fontFamily:"'DM Sans', sans-serif" }}>✉ {item.letters} letters</span>
          </div>
        </div>
        <div style={{ width:64, height:64, borderRadius:6, background:"#EDEBE4", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
        </div>
      </div>
    </article>
  );
}

function HomepageModal({ onDismiss, navigate }) {
  const [view, setView] = useState("cta");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 20); }, []);

  const inputStyle = (field) => ({
    width:"100%", padding:"10px 13px", fontSize:14,
    fontFamily:"'EB Garamond', Georgia, serif", color:"#111",
    background: focused===field ? "#fff" : "#FDFCF8",
    border:`1px solid ${focused===field ? "#111" : "#C8BFA8"}`,
    borderRadius:5, outline:"none", transition:"all 0.15s", boxSizing:"border-box",
  });

  return (
    <div onClick={onDismiss} style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", padding:24, opacity:visible?1:0, transition:"opacity 0.3s ease" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:"#F7F4EE", border:"1px solid #C8BFA8", borderRadius:14, width:"100%", maxWidth:460, overflow:"hidden", opacity:visible?1:0, transform:visible?"translateY(0)":"translateY(20px)", transition:"opacity 0.3s ease, transform 0.3s ease" }}>

        {/* Banner */}
        <div style={{ padding:"22px 28px 0" }}>
          <BroadsheetRule left="Vol. I — No. 1" center="Coming Soon" right="Free to Join"/>
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

        {/* CTA */}
        {view==="cta" && (
          <div style={{ padding:"0 28px 26px", display:"flex", flexDirection:"column", gap:10 }}>
            <button onClick={() => navigate("invite")}
              style={{ width:"100%", background:"#111", color:"#F0EAD8", border:"none", borderRadius:6, padding:"15px 0", fontSize:13.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer", lineHeight:1.4 }}>
              <span style={{ display:"block", fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:500, marginBottom:2 }}>First Print</span>
              Request an Early Invitation →
            </button>
            <button onClick={() => navigate("how-it-works")}
              style={{ width:"100%", background:"none", color:"#555", border:"1px solid #C8BFA8", borderRadius:6, padding:"15px 0", fontSize:13.5, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer", lineHeight:1.4 }}>
              <span style={{ display:"block", fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"#888", fontFamily:"'DM Mono', monospace", fontWeight:500, marginBottom:2 }}>Dear Reader</span>
              How Letters Works
            </button>
            <div style={{ textAlign:"center", paddingTop:4 }}>
              <span style={{ fontSize:11, color:"#555", fontFamily:"'EB Garamond', serif", fontStyle:"italic" }}>Interested in investing? </span>
              <button onClick={() => navigate("investor")} style={{ background:"none", border:"none", fontSize:11, color:"#C8A96E", fontFamily:"'EB Garamond', serif", fontStyle:"italic", cursor:"pointer", padding:0, textDecoration:"underline" }}>Learn more →</button>
            </div>
          </div>
        )}

        {/* Confirmed */}
        {view==="confirmed" && (
          <div style={{ padding:"0 28px 32px", textAlign:"center" }}>
            <div style={{ width:52, height:52, borderRadius:"50%", background:"#F0EDE8", border:"1px solid #C8BFA8", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:22 }}>✦</div>
            <div style={{ fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:10 }}>You're on the list</div>
            <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:15, lineHeight:1.7, color:"#555", margin:"0 0 20px", fontStyle:"italic" }}>
              Thank you{name ? `, ${name.split(" ")[0]}` : ""}. We'll be in touch at <strong style={{ fontStyle:"normal", color:"#111" }}>{email}</strong> when your invitation is ready.
            </p>
            <button onClick={onDismiss} style={{ background:"none", color:"#AAA", border:"1px solid #C8BFA8", borderRadius:6, padding:"9px 24px", fontSize:12, fontFamily:"'DM Sans', sans-serif", cursor:"pointer" }}>
              Continue reading →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function HomePage({ navigate }) {
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    const t = setTimeout(() => setShowModal(true), 3000);
    return () => clearTimeout(t);
  }, [dismissed]);

  const dismiss = () => { setShowModal(false); setDismissed(true); };

  return (
    <div style={{ minHeight:"100vh", background:"#fff" }}>
      <header style={{ position:"sticky", top:0, zIndex:50, background:"rgba(255,255,255,0.96)", backdropFilter:"blur(10px)", borderBottom:"1px solid #F0EDE8" }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"0 20px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Logo size={38}/>
          <button onClick={() => setShowModal(true)} style={{ background:"#111", border:"none", borderRadius:20, padding:"6px 16px", fontSize:12.5, color:"#F0EAD8", fontFamily:"'DM Sans', sans-serif", fontWeight:500, cursor:"pointer" }}>Request invite</button>
        </div>
      </header>
      <main style={{ maxWidth:680, margin:"0 auto", padding:"0 20px", filter:showModal?"blur(2px)":"none", transition:"filter 0.3s ease", pointerEvents:showModal?"none":"auto" }}>
        <div style={{ display:"flex", borderBottom:"1px solid #F0EDE8", marginTop:8 }}>
          {["For You","Following","Latest"].map((t,i) => (
            <button key={t} style={{ background:"none", border:"none", borderBottom:i===0?"2px solid #C8A96E":"2px solid transparent", padding:"12px 16px", fontSize:13, fontFamily:"'DM Sans', sans-serif", fontWeight:i===0?600:400, color:i===0?"#111":"#bbb", cursor:"pointer" }}>{t}</button>
          ))}
        </div>
        {feed.map(item => item.type==="letter" ? <LetterCard key={item.id} item={item}/> : <NewsCard key={item.id} item={item}/>)}
        <div style={{ height:80 }}/>
      </main>
      {showModal && <HomepageModal onDismiss={dismiss} navigate={(page) => { dismiss(); navigate(page); }}/>}
    </div>
  );
}

// ── Page: How It Works ────────────────────────────────────────────────────────
function HowItWorksPage({ navigate }) {
  const cards = [
    { number:"01", label:"Start", headline:"Create A Free Account", body:"Build a bio. What are your interests? What are your daily reads? You've done this part before.", icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
    { number:"02", label:"Follow", headline:"Follow Your Favorites", body:"Find your friends, favorite authors or journalists, everyone is welcome on Letters. You've done this part before too.", icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { number:"03", label:"Share", headline:"Share Your Letters", body:"Here is where things change a bit. Have you ever written a letter to an editor or wanted to share your opinion on a news piece? Every Letter, or post, will be attached to a source - something you are reading. Link the material and share your voice.", icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> },
    { number:"04", label:"Respond", headline:"Respond to Others", body:"Add reactions or comments. Publish (share) other users' letters. This is a space for engaging with real news in real time.", icon:<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#F9F6F0" }}>
      <Nav navigate={navigate} onRequestInvite={() => navigate("invite")} bg="rgba(249,246,240,0.96)" border="#E8E0D0"/>

      {/* Hero */}
      <section style={{ maxWidth:900, margin:"0 auto", padding:"80px 28px 64px" }}>
        <BroadsheetRule left="Dear Reader" center="How Letters Works" right="Est. 2025"/>
        <div style={{ maxWidth:640 }}>
          <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:16 }}>A note from the editors</div>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:52, fontWeight:900, color:"#111", lineHeight:1.05, letterSpacing:"-0.02em", margin:"0 0 24px" }}>
            Social Media.<br/><span style={{ fontStyle:"italic", fontWeight:700 }}>Elevated.</span>
          </h1>
          <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:18, lineHeight:1.75, color:"#555", margin:"0 0 16px" }}>
            Letters is a new kind of social media. One that is meant for deep engagement and elevated discourse. A place for you to read the news, dive deep, and share your thoughts.
          </p>
          <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:18, lineHeight:1.75, color:"#555", margin:"0 0 36px" }}>
            Are you tired of the same stale social media slop? Try a different kind of platform.
          </p>
          <button onClick={() => navigate("invite")} style={{ background:"#111", color:"#F0EAD8", border:"none", borderRadius:6, padding:"14px 28px", fontSize:14, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer", lineHeight:1.4 }}>
            <span style={{ display:"block", fontSize:9, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:2 }}>First Print</span>
            Request an Early Invitation →
          </button>
        </div>
      </section>

      {/* Cards */}
      <section style={{ background:"#fff", borderTop:"1px solid #E8E0D0", borderBottom:"1px solid #E8E0D0" }}>
        <div style={{ maxWidth:900, margin:"0 auto", padding:"64px 28px" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:9.5, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:12 }}>Getting Started</div>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:32, fontWeight:900, color:"#111", margin:0, letterSpacing:"-0.01em" }}>How to Enjoy Letters</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            {cards.map(card => (
              <div key={card.number} style={{ background:"#F9F6F0", border:"1px solid #E8E0D0", borderRadius:12, padding:"32px 28px", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:16, right:20, fontSize:48, fontFamily:"'Playfair Display', serif", fontWeight:900, color:"#111", opacity:0.04, lineHeight:1, userSelect:"none" }}>{card.number}</div>
                <div style={{ width:48, height:48, borderRadius:10, background:"#111", display:"flex", alignItems:"center", justifyContent:"center", color:"#C8A96E", marginBottom:20 }}>{card.icon}</div>
                <div style={{ fontSize:9.5, letterSpacing:"0.18em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:8 }}>{card.number} — {card.label}</div>
                <h3 style={{ fontFamily:"'Playfair Display', serif", fontSize:20, fontWeight:700, color:"#111", margin:"0 0 10px", lineHeight:1.2 }}>{card.headline}</h3>
                <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:15.5, lineHeight:1.7, color:"#666", margin:0 }}>{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bridge */}
      <section style={{ background:"#111", borderTop:"1px solid #2a2a2a", borderBottom:"1px solid #2a2a2a" }}>
        <div style={{ maxWidth:720, margin:"0 auto", padding:"64px 28px", textAlign:"center" }}>
          <div style={{ width:32, height:1, background:"#C8A96E", margin:"0 auto 28px" }}/>
          <p style={{ fontFamily:"'Playfair Display', Georgia, serif", fontWeight:700, fontStyle:"italic", fontSize:30, lineHeight:1.5, color:"#F0EAD8", margin:0 }}>
            That was enough to get started, but there is a lot more to Letters. Watch our video below to get the whole picture.
          </p>
          <div style={{ width:32, height:1, background:"#C8A96E", margin:"28px auto 0" }}/>
        </div>
      </section>

      {/* Video */}
      <section style={{ maxWidth:900, margin:"0 auto", padding:"72px 28px" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:9.5, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:12 }}>See it in action</div>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:32, fontWeight:900, color:"#111", margin:"0 0 14px", letterSpacing:"-0.01em" }}>Change How You Scroll</h2>
          <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:17, color:"#888", margin:"0 auto", maxWidth:480, lineHeight:1.65, fontStyle:"italic" }}>
            Trade in sourceless quotes, pictures, and bots for a real online town square.
          </p>
        </div>
        <div style={{ position:"relative", borderRadius:14, overflow:"hidden", background:"#1a1612", border:"1px solid #2a2418", aspectRatio:"16/9", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
          <div style={{ width:72, height:72, borderRadius:"50%", border:"2px solid #C8A96E", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#C8A96E"><polygon points="5,3 19,12 5,21"/></svg>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:6 }}>Explainer video</div>
            <div style={{ fontSize:13, color:"#555", fontFamily:"'EB Garamond', Georgia, serif", fontStyle:"italic" }}>Coming soon — video placeholder</div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ background:"#111", padding:"72px 28px" }}>
        <div style={{ maxWidth:560, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:9.5, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:16 }}>First Print</div>
          <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:38, fontWeight:900, color:"#F0EAD8", letterSpacing:"-0.02em", lineHeight:1.1, margin:"0 0 16px" }}>
            Closing headline<br/><span style={{ fontStyle:"italic", fontWeight:700 }}>goes here.</span>
          </h2>
          <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:16.5, color:"#666", lineHeight:1.7, margin:"0 0 36px", fontStyle:"italic" }}>
            One final sentence that seals the deal — why request an invitation today? Make it feel urgent and genuine.
          </p>
          <button onClick={() => navigate("invite")} style={{ background:"#F0EAD8", color:"#111", border:"none", borderRadius:6, padding:"14px 32px", fontSize:14, fontFamily:"'DM Sans', sans-serif", fontWeight:700, cursor:"pointer" }}>
            Request an Early Invitation →
          </button>
          <div style={{ borderTop:"1px solid #2a2a2a", marginTop:48 }}/>
          <div style={{ marginTop:24, fontSize:9.5, letterSpacing:"0.14em", textTransform:"uppercase", color:"#333", fontFamily:"'DM Mono', monospace" }}>Read · Write · Respond</div>
        </div>
      </section>
    </div>
  );
}

// ── Page: Invite Form ─────────────────────────────────────────────────────────
const referralOptions = ["A friend or colleague","Twitter / X","Instagram","LinkedIn","A newsletter","Online article or blog","Search engine","Other"];

function InvitePage({ navigate }) {
  const [form, setForm] = useState({ firstName:"", lastName:"", email:"", occupation:"", referral:"", referralOther:"" });
  const [focused, setFocused] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k,v) => setForm(f => ({...f, [k]:v}));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    if (!form.occupation.trim()) e.occupation = "Required";
    if (!form.referral) e.referral = "Please select an option";
    return e;
  };

  const inputStyle = (field) => ({
    width:"100%", padding:"12px 14px", fontSize:15,
    fontFamily:"'EB Garamond', Georgia, serif", color:"#111",
    background: focused===field ? "#fff" : "#FDFCF8",
    border:`1px solid ${errors[field] ? "#C0392B" : focused===field ? "#111" : "#C8BFA8"}`,
    borderRadius:5, outline:"none", transition:"all 0.15s", boxSizing:"border-box", appearance:"none",
  });

  const labelStyle = { fontSize:9.5, letterSpacing:"0.14em", textTransform:"uppercase", color:"#888", fontFamily:"'DM Mono', monospace", display:"block", marginBottom:6 };
  const errStyle = { fontSize:11, color:"#C0392B", fontFamily:"'EB Garamond', serif", fontStyle:"italic", marginTop:4, display:"block" };

  return (
    <div style={{ minHeight:"100vh", background:"#F9F6F0" }}>
      <Nav navigate={navigate} onRequestInvite={() => {}} bg="rgba(249,246,240,0.96)" border="#E8E0D0"/>
      <main style={{ maxWidth:560, margin:"0 auto", padding:"60px 28px 80px" }}>
        {!submitted ? (
          <>
            <BroadsheetRule left="Vol. I — No. 1" center="First Print" right="Free to Join"/>
            <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:12 }}>Request an Invitation</div>
            <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:38, fontWeight:900, color:"#111", margin:"0 0 14px", letterSpacing:"-0.02em", lineHeight:1.1 }}>Join Letters<span style={{ color:"#C8A96E" }}>.</span></h1>
            <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:16.5, color:"#777", lineHeight:1.7, margin:"0 0 28px", fontStyle:"italic" }}>
              Letters is launching to a small group of founding members first. Leave your details below and we'll be in touch when your invitation is ready.
            </p>
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
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e=>set("email",e.target.value)} onFocus={()=>{setFocused("email");setErrors(er=>({...er,email:null}))}} onBlur={()=>setFocused(null)} style={inputStyle("email")}/>
                {errors.email && <span style={errStyle}>{errors.email}</span>}
              </div>
              <div>
                <label style={labelStyle}>Occupation / Profession</label>
                <input type="text" placeholder="What do you do?" value={form.occupation} onChange={e=>set("occupation",e.target.value)} onFocus={()=>{setFocused("occupation");setErrors(er=>({...er,occupation:null}))}} onBlur={()=>setFocused(null)} style={inputStyle("occupation")}/>
                {errors.occupation && <span style={errStyle}>{errors.occupation}</span>}
              </div>
              <div>
                <label style={labelStyle}>How did you hear about Letters?</label>
                <div style={{ position:"relative" }}>
                  <select value={form.referral} onChange={e=>{set("referral",e.target.value);setErrors(er=>({...er,referral:null}))}} onFocus={()=>setFocused("referral")} onBlur={()=>setFocused(null)} style={{...inputStyle("referral"), color:form.referral?"#111":"#B8B0A0", fontStyle:form.referral?"normal":"italic", paddingRight:36, cursor:"pointer"}}>
                    <option value="" disabled>Select an option</option>
                    {referralOptions.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <svg style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
                {errors.referral && <span style={errStyle}>{errors.referral}</span>}
              </div>
              {form.referral==="Other" && (
                <div>
                  <label style={labelStyle}>Please tell us more</label>
                  <input type="text" placeholder="Where did you find us?" value={form.referralOther} onChange={e=>set("referralOther",e.target.value)} onFocus={()=>setFocused("referralOther")} onBlur={()=>setFocused(null)} style={inputStyle("referralOther")}/>
                </div>
              )}
              <div style={{ borderTop:"1px solid #E8E0D0", margin:"4px 0" }}/>
              <button onClick={() => { const e=validate(); if(Object.keys(e).length){setErrors(e);return;} setSubmitted(true); }}
                style={{ width:"100%", background:"#111", color:"#F0EAD8", border:"none", borderRadius:6, padding:"15px 0", fontSize:14, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer", lineHeight:1.4 }}>
                <span style={{ display:"block", fontSize:9.5, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:500, marginBottom:2 }}>First Print</span>
                Submit My Request →
              </button>
              <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:12.5, color:"#BBB", textAlign:"center", margin:0, lineHeight:1.6 }}>
                By submitting this form you agree to be contacted by the Letters team. We'll never share your information with third parties.
              </p>
            </div>
          </>
        ) : (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <BroadsheetRule left="Vol. I — No. 1" center="First Print" right="Free to Join"/>
            <Logo size={64}/>
            <div style={{ marginTop:32, marginBottom:16 }}>
              <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:14 }}>You're on the list</div>
              <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:36, fontWeight:900, color:"#111", margin:"0 0 16px", letterSpacing:"-0.02em", lineHeight:1.1 }}>
                Thank you, {form.firstName}<span style={{ color:"#C8A96E" }}>.</span>
              </h2>
              <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:17, color:"#666", lineHeight:1.75, margin:"0 auto 32px", maxWidth:400, fontStyle:"italic" }}>
                Your request has been received. We'll be in touch at <strong style={{ fontStyle:"normal", color:"#111" }}>{form.email}</strong> when your invitation is ready.
              </p>
            </div>
            <button onClick={() => navigate("home")} style={{ background:"none", color:"#AAA", border:"1px solid #C8BFA8", borderRadius:6, padding:"9px 24px", fontSize:12, fontFamily:"'DM Sans', sans-serif", cursor:"pointer" }}>
              ← Back to Letters
            </button>
            <div style={{ borderTop:"1px solid #E8E0D0", paddingTop:32, marginTop:32 }}>
              <div style={{ fontSize:9.5, letterSpacing:"0.18em", textTransform:"uppercase", color:"#CCC", fontFamily:"'DM Mono', monospace" }}>Read · Write · Respond</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Page: Investor ────────────────────────────────────────────────────────────
function InvestorPage({ navigate }) {
  const [view, setView] = useState("form");
  const [form, setForm] = useState({ name:"", email:"", firm:"" });
  const [focused, setFocused] = useState(null);
  const [errors, setErrors] = useState({});

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const inputStyle = (field) => ({
    width:"100%", padding:"12px 14px", fontSize:15,
    fontFamily:"'EB Garamond', Georgia, serif", color:"#111",
    background: focused===field?"#fff":"#FDFCF8",
    border:`1px solid ${errors[field]?"#C0392B":focused===field?"#111":"#C8BFA8"}`,
    borderRadius:5, outline:"none", transition:"all 0.15s", boxSizing:"border-box",
  });
  const labelStyle = { fontSize:9.5, letterSpacing:"0.14em", textTransform:"uppercase", color:"#888", fontFamily:"'DM Mono', monospace", display:"block", marginBottom:6 };
  const errStyle = { fontSize:11, color:"#C0392B", fontFamily:"'EB Garamond', serif", fontStyle:"italic", marginTop:4, display:"block" };

  const validate = () => {
    const e={};
    if(!form.name.trim()) e.name="Required";
    if(!form.email.trim()||!form.email.includes("@")) e.email="Valid email required";
    if(!form.firm.trim()) e.firm="Required";
    return e;
  };

  if (view === "brief") return (
    <div style={{ minHeight:"100vh", background:"#F9F6F0" }}>
      <Nav navigate={navigate} onRequestInvite={() => navigate("invite")} bg="rgba(249,246,240,0.96)" border="#E8E0D0"/>
      <section style={{ maxWidth:800, margin:"0 auto", padding:"64px 28px 56px" }}>
        <BroadsheetRule left="Investor Brief" center="Confidential" right="Est. 2025"/>
        <div style={{ maxWidth:620 }}>
          <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:16 }}>The Vision</div>
          <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:52, fontWeight:900, color:"#111", lineHeight:1.05, letterSpacing:"-0.02em", margin:"0 0 24px" }}>
            The internet needs a<br/><span style={{ fontStyle:"italic", fontWeight:700 }}>town square.</span>
          </h1>
          <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:18, lineHeight:1.75, color:"#555", margin:"0 0 16px" }}>
            Social media has failed the public discourse. Platforms built on outrage, anonymity, and algorithmic manipulation have eroded the quality of online conversation. Letters is built on a different premise entirely.
          </p>
          <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:18, lineHeight:1.75, color:"#555", margin:0 }}>
            Every post on Letters is a letter — attached to a real source, authored by a real person, and open to real response. We are rebuilding the public square from the ground up.
          </p>
        </div>
      </section>
      <section style={{ background:"#111", borderTop:"1px solid #2a2a2a", borderBottom:"1px solid #2a2a2a" }}>
        <div style={{ maxWidth:800, margin:"0 auto", padding:"64px 28px", display:"flex", gap:48 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:9.5, letterSpacing:"0.18em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:16 }}>The Problem</div>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:28, fontWeight:900, color:"#F0EAD8", margin:"0 0 16px", lineHeight:1.2 }}>Social media is broken.</h2>
            <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:16, lineHeight:1.75, color:"#888", margin:0 }}>Sourceless quotes, bot accounts, algorithmic rage, and zero accountability have made the internet's public square uninhabitable for serious people.</p>
          </div>
          <div style={{ width:1, background:"#2a2a2a", flexShrink:0 }}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:9.5, letterSpacing:"0.18em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:16 }}>The Solution</div>
            <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:28, fontWeight:900, color:"#F0EAD8", margin:"0 0 16px", lineHeight:1.2 }}>Letters.</h2>
            <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:16, lineHeight:1.75, color:"#888", margin:0 }}>A platform where every post is sourced, every voice is accountable, and the conversation is anchored to the news that matters. Social media — elevated.</p>
          </div>
        </div>
      </section>
      <section style={{ maxWidth:800, margin:"0 auto", padding:"64px 28px" }}>
        <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:40, textAlign:"center" }}>By the numbers</div>
        <div style={{ display:"flex", gap:2 }}>
          {[{stat:"$XX B",label:"Global social media market",sub:"Placeholder"},{stat:"XXM",label:"News readers seeking discourse",sub:"Placeholder"},{stat:"XX%",label:"Users dissatisfied with current platforms",sub:"Placeholder"}].map((item,i) => (
            <div key={i} style={{ flex:1, padding:"32px 28px", background:i===1?"#111":"#F9F6F0", border:"1px solid #E8E0D0", textAlign:"center" }}>
              <div style={{ fontFamily:"'Playfair Display', serif", fontSize:42, fontWeight:900, color:i===1?"#F0EAD8":"#111", letterSpacing:"-0.02em", lineHeight:1 }}>{item.stat}</div>
              <div style={{ fontSize:12, fontWeight:600, color:i===1?"#C8A96E":"#555", fontFamily:"'DM Sans', sans-serif", margin:"10px 0 6px" }}>{item.label}</div>
              <div style={{ fontSize:11, color:i===1?"#555":"#AAA", fontFamily:"'EB Garamond', serif", fontStyle:"italic" }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ background:"#F9F6F0", borderTop:"1px solid #E8E0D0" }}>
        <div style={{ maxWidth:800, margin:"0 auto", padding:"64px 28px" }}>
          <BroadsheetRule left="Investment Opportunity" center="Confidential" right="Est. 2025"/>
          <div style={{ display:"flex", gap:48, alignItems:"flex-start" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:14 }}>The Ask</div>
              <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:38, fontWeight:900, color:"#111", margin:"0 0 20px", letterSpacing:"-0.02em", lineHeight:1.1 }}>Join us at<br/><span style={{ fontStyle:"italic" }}>the beginning.</span></h2>
              <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:17, lineHeight:1.75, color:"#666", margin:"0 0 16px" }}>We are raising a pre-seed round to fund product development, founding team, and the launch of our invitation-only community.</p>
              <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:17, lineHeight:1.75, color:"#666", margin:0 }}>Founding investors will receive preferred terms and a seat at the table as we define the future of online discourse.</p>
            </div>
            <div style={{ width:220, flexShrink:0, background:"#111", borderRadius:12, padding:"28px 24px" }}>
              <div style={{ fontSize:9.5, letterSpacing:"0.16em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:20 }}>Round Details</div>
              {[{label:"Stage",value:"Pre-Seed"},{label:"Raising",value:"$X,XXX,XXX"},{label:"Instrument",value:"SAFE / Equity"},{label:"Min. Check",value:"$XX,XXX"}].map(({label,value}) => (
                <div key={label} style={{ marginBottom:16, paddingBottom:16, borderBottom:"1px solid #2a2a2a" }}>
                  <div style={{ fontSize:9.5, letterSpacing:"0.12em", textTransform:"uppercase", color:"#555", fontFamily:"'DM Mono', monospace", marginBottom:4 }}>{label}</div>
                  <div style={{ fontFamily:"'Playfair Display', serif", fontSize:20, fontWeight:700, color:"#F0EAD8" }}>{value}</div>
                </div>
              ))}
              <button style={{ width:"100%", background:"#C8A96E", color:"#111", border:"none", borderRadius:5, padding:"11px 0", fontSize:12.5, fontFamily:"'DM Sans', sans-serif", fontWeight:700, cursor:"pointer", marginTop:4 }}>Get in Touch →</button>
            </div>
          </div>
        </div>
      </section>
      <div style={{ background:"#111", padding:"28px", textAlign:"center" }}>
        <div style={{ fontSize:9.5, letterSpacing:"0.16em", textTransform:"uppercase", color:"#333", fontFamily:"'DM Mono', monospace" }}>Letters · tryletters.tech · Strictly Confidential · {new Date().getFullYear()}</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#F9F6F0" }}>
      <Nav navigate={navigate} onRequestInvite={() => navigate("invite")} bg="rgba(249,246,240,0.96)" border="#E8E0D0"/>
      <main style={{ maxWidth:560, margin:"0 auto", padding:"60px 28px 80px" }}>
        {view==="form" ? (
          <>
            <BroadsheetRule left="Confidential" center="Investor Relations" right="Est. 2025"/>
            <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:12 }}>Request Access</div>
            <h1 style={{ fontFamily:"'Playfair Display', serif", fontSize:38, fontWeight:900, color:"#111", margin:"0 0 14px", letterSpacing:"-0.02em", lineHeight:1.1 }}>Invest in Letters<span style={{ color:"#C8A96E" }}>.</span></h1>
            <p style={{ fontFamily:"'EB Garamond', Georgia, serif", fontSize:16.5, color:"#777", lineHeight:1.7, margin:"0 0 28px", fontStyle:"italic" }}>
              Our investor materials are shared privately. Leave your details below and we'll send you a personal link to our full investor brief.
            </p>
            <div style={{ borderTop:"1px solid #111", borderBottom:"3px solid #111", padding:"5px 0", marginBottom:28 }}/>
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input type="text" placeholder="Your full name" value={form.name} onChange={e=>set("name",e.target.value)} onFocus={()=>{setFocused("name");setErrors(er=>({...er,name:null}))}} onBlur={()=>setFocused(null)} style={inputStyle("name")}/>
                {errors.name && <span style={errStyle}>{errors.name}</span>}
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" placeholder="you@firm.com" value={form.email} onChange={e=>set("email",e.target.value)} onFocus={()=>{setFocused("email");setErrors(er=>({...er,email:null}))}} onBlur={()=>setFocused(null)} style={inputStyle("email")}/>
                {errors.email && <span style={errStyle}>{errors.email}</span>}
              </div>
              <div>
                <label style={labelStyle}>Firm / Organization</label>
                <input type="text" placeholder="Your firm or organization" value={form.firm} onChange={e=>set("firm",e.target.value)} onFocus={()=>{setFocused("firm");setErrors(er=>({...er,firm:null}))}} onBlur={()=>setFocused(null)} style={inputStyle("firm")}/>
                {errors.firm && <span style={errStyle}>{errors.firm}</span>}
              </div>
              <div style={{ borderTop:"1px solid #E8E0D0", margin:"4px 0" }}/>
              <button onClick={() => { const e=validate(); if(Object.keys(e).length){setErrors(e);return;} setView("submitted"); }}
                style={{ width:"100%", background:"#111", color:"#F0EAD8", border:"none", borderRadius:6, padding:"15px 0", fontSize:14, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer", lineHeight:1.4 }}>
                <span style={{ display:"block", fontSize:9.5, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", fontWeight:500, marginBottom:2 }}>Confidential</span>
                Request Investor Access →
              </button>
              <p style={{ fontFamily:"'EB Garamond', serif", fontStyle:"italic", fontSize:12.5, color:"#BBB", textAlign:"center", margin:0, lineHeight:1.6 }}>
                All materials are strictly confidential. We'll be in touch within 48 hours.
              </p>
            </div>
          </>
        ) : (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <Logo size={60}/>
            <div style={{ marginTop:32 }}>
              <div style={{ fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#C8A96E", fontFamily:"'DM Mono', monospace", marginBottom:14 }}>Request received</div>
              <h2 style={{ fontFamily:"'Playfair Display', serif", fontSize:34, fontWeight:900, color:"#111", margin:"0 0 16px", letterSpacing:"-0.02em" }}>Thank you<span style={{ color:"#C8A96E" }}>.</span></h2>
              <p style={{ fontFamily:"'EB Garamond', serif", fontSize:17, lineHeight:1.75, color:"#777", fontStyle:"italic", margin:"0 0 32px" }}>
                We've received your request and will send your personal investor link within 48 hours.
              </p>
              <button onClick={() => setView("brief")} style={{ background:"#111", color:"#F0EAD8", border:"none", borderRadius:6, padding:"12px 24px", fontSize:13, fontFamily:"'DM Sans', sans-serif", fontWeight:600, cursor:"pointer" }}>
                Preview investor page →
              </button>
              <div style={{ fontSize:11, color:"#CCC", fontFamily:"'EB Garamond', serif", fontStyle:"italic", marginTop:12 }}>(In production, this link arrives by email)</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ── App Router ────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");

  const navigate = (p) => {
    setPage(p);
    window.scrollTo(0, 0);
  };

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: #B0A898; font-style: italic; font-family: 'EB Garamond', Georgia, serif; font-size: 14px; }
        select option { font-family: 'DM Sans', sans-serif; font-style: normal; }
        body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      {page === "home"          && <HomePage navigate={navigate}/>}
      {page === "how-it-works"  && <HowItWorksPage navigate={navigate}/>}
      {page === "invite"        && <InvitePage navigate={navigate}/>}
      {page === "investor"      && <InvestorPage navigate={navigate}/>}
    </div>
  );
}
