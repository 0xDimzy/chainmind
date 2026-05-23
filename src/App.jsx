import { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  Filler, Tooltip, Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const PORTFOLIO = [
  { sym: "BTC", name: "Bitcoin",   amt: 0.42,  price: 67420, chg: 2.31,  color: "#F7931A", spark: [58000,61000,63500,62000,65000,66800,67420] },
  { sym: "ETH", name: "Ethereum",  amt: 3.15,  price: 3512,  chg: -1.24, color: "#627EEA", spark: [3100,3200,3400,3600,3550,3580,3512] },
  { sym: "SOL", name: "Solana",    amt: 28.5,  price: 168,   chg: 4.87,  color: "#9945FF", spark: [140,145,150,158,162,165,168] },
  { sym: "BNB", name: "BNB",       amt: 5.0,   price: 571,   chg: 0.43,  color: "#F0B90B", spark: [540,545,552,558,565,568,571] },
  { sym: "AVAX", name: "Avalanche",amt: 12.3,  price: 37.2,  chg: -3.11, color: "#E84142", spark: [42,40,39,38.5,38,37.8,37.2] },
];

const PERF_DATA = {
  "7D":  { labels: ["6d","5d","4d","3d","2d","1d","now"], data: [36200,37100,38400,37800,38900,39200,39847] },
  "30D": { labels: ["4w","3w","2w","1w+","1w","2d","now"], data: [29000,30500,32000,31200,34500,37000,39847] },
  "90D": { labels: ["3mo","10w","8w","6w","4w","2w","now"], data: [22000,25000,28000,26000,31000,35000,39847] },
  "1Y":  { labels: ["Jan","Mar","May","Jul","Sep","Nov","now"], data: [15000,18000,22000,28000,32000,36000,39847] },
};

const AGENT_CONTEXT = `You are an elite crypto portfolio AI advisor embedded in ChainMind, a professional DeFi dashboard. Portfolio:
- BTC: 0.42 @ $67,420 (+2.31% 24h) = $28,316
- ETH: 3.15 @ $3,512 (-1.24% 24h) = $11,062
- SOL: 28.5 @ $168 (+4.87% 24h) = $4,788
- BNB: 5.0 @ $571 (+0.43% 24h) = $2,855
- AVAX: 12.3 @ $37.2 (-3.11% 24h) = $457
Total: $39,847. Sharpe: 1.34. Beta vs BTC: 0.87. Risk: 63/100 (moderate).
Be sharp and concise. Use **bold** for key numbers. Max 200 words. Short paragraphs, no unnecessary lists.`;

function fmt(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtK(n) {
  return "$" + Math.round(n / 1000) + "k";
}

function Sparkline({ data, color, up }) {
  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [{
      data,
      borderColor: up ? "#00d4a0" : "#ff4d6d",
      borderWidth: 1.5,
      pointRadius: 0,
      tension: 0.4,
      fill: false,
    }],
  };
  const opts = {
    responsive: true,
    animation: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } },
  };
  return <Line data={chartData} options={opts} style={{ width: 70, height: 32 }} />;
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center", padding: "8px 0" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 4, height: 4, background: "#4a4e63", borderRadius: "50%",
          display: "inline-block",
          animation: `typing 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  );
}

export default function App() {
  const [range, setRange] = useState("7D");
  const [messages, setMessages] = useState([
    { role: "agent", content: "Portfolio loaded. I can see <strong>5 assets</strong> worth <strong>$39,847</strong> with moderate risk exposure. Ask me anything or use the quick actions above." }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const [clock, setClock] = useState("");
  const [navItem, setNavItem] = useState("Dashboard");
  const chatRef = useRef(null);
  const textareaRef = useRef(null);

  const total = PORTFOLIO.reduce((s, a) => s + a.amt * a.price, 0);
  const totalChange = PORTFOLIO.reduce((s, a) => s + a.amt * a.price * (a.chg / 100), 0);

  useEffect(() => {
    const t = setInterval(() => {
      setClock(new Date().toLocaleTimeString("en-US", { hour12: false }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = 99999;
  }, [messages]);

  const perfChart = {
    labels: PERF_DATA[range].labels,
    datasets: [{
      data: PERF_DATA[range].data,
      borderColor: "#6c63ff",
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.4,
      fill: true,
      backgroundColor: "rgba(108,99,255,0.06)",
    }],
  };

  const perfOpts = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 300 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1a1d2b", titleColor: "#8b8fa8", bodyColor: "#e8eaef",
        borderColor: "#ffffff12", borderWidth: 1,
        callbacks: { label: ctx => "$" + ctx.raw.toLocaleString() },
      },
    },
    scales: {
      x: { grid: { color: "#ffffff06" }, ticks: { color: "#4a4e63", font: { size: 10, family: "JetBrains Mono" } } },
      y: { grid: { color: "#ffffff06" }, ticks: { color: "#4a4e63", font: { size: 10, family: "JetBrains Mono" }, callback: v => fmtK(v) } },
    },
  };

  async function callAgent(userMsg, newHistory) {
    setBusy(true);
    setMessages(prev => [...prev, { role: "typing" }]);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: AGENT_CONTEXT,
          messages: newHistory.slice(-10),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(b => b.text || "").join("") || "Something went wrong.";
      const formatted = reply
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n\n/g, '</p><p style="margin-top:8px">')
        .replace(/\n/g, "<br>");
      setMessages(prev => [...prev.filter(m => m.role !== "typing"), { role: "agent", content: "<p>" + formatted + "</p>" }]);
      setHistory(h => [...h, { role: "assistant", content: reply }]);
    } catch {
      setMessages(prev => [...prev.filter(m => m.role !== "typing"), { role: "agent", content: '<span style="color:#ff4d6d">Connection error.</span>' }]);
    }
    setBusy(false);
  }

  function sendMessage(q) {
    const msg = q || input.trim();
    if (!msg || busy) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    const newHistory = [...history, { role: "user", content: msg }];
    setHistory(newHistory);
    callAgent(msg, newHistory);
  }

  const navItems = [
    { label: "Dashboard", icon: "ti-layout-dashboard" },
    { label: "Analytics", icon: "ti-chart-candle" },
    { label: "Rebalance", icon: "ti-arrows-exchange" },
    { label: "Alerts", icon: "ti-bell" },
  ];
  const agentItems = [
    { label: "Risk agent", icon: "ti-robot" },
    { label: "Signal agent", icon: "ti-eye" },
    { label: "Sentiment agent", icon: "ti-news" },
  ];

  const quickActions = [
    { label: "Risk scan", desc: "Concentration analysis", icon: "ti-shield-half", q: "Analyze my current portfolio risk. What are the biggest concentration risks and what should I do?" },
    { label: "Opportunities", desc: "Signal detection", icon: "ti-target", q: "Find entry opportunities in my portfolio based on RSI, funding rates, and momentum signals." },
    { label: "Rebalance", desc: "MPT allocation", icon: "ti-scale", q: "Suggest an optimal rebalancing plan using Modern Portfolio Theory with target allocations and estimated costs." },
    { label: "Market brief", desc: "Sentiment digest", icon: "ti-news", q: "Give me a quick daily market summary and how it affects my portfolio." },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.44.0/tabler-icons.min.css');
        * { margin:0; padding:0; box-sizing:border-box; }
        :root {
          --bg:#08090d; --bg1:#0e1018; --bg2:#13151f; --bg3:#1a1d2b;
          --border:#ffffff12; --border2:#ffffff1e;
          --text:#e8eaef; --text2:#8b8fa8; --text3:#4a4e63;
          --green:#00d4a0; --green-dim:#00d4a015; --green-border:#00d4a030;
          --red:#ff4d6d; --red-dim:#ff4d6d15; --red-border:#ff4d6d30;
          --accent:#6c63ff; --accent-dim:#6c63ff18; --accent-border:#6c63ff40;
          --amber:#f5a623;
        }
        html, body, #root { height:100%; background:var(--bg); color:var(--text); font-family:'Syne',sans-serif; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-thumb { background:var(--border2); border-radius:2px; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        @keyframes typing { 0%,80%,100%{transform:scale(.7);opacity:.4} 40%{transform:scale(1);opacity:1} }
      `}</style>

      <div style={{ display:"grid", gridTemplateColumns:"220px 1fr 320px", gridTemplateRows:"56px 1fr", height:"100vh", minHeight:700 }}>

        {/* TOPBAR */}
        <div style={{ gridColumn:"1/-1", display:"flex", alignItems:"center", padding:"0 20px", borderBottom:"1px solid var(--border)", gap:16, background:"var(--bg1)" }}>
          <div style={{ fontSize:15, fontWeight:800, letterSpacing:"-0.03em" }}>
            chain<span style={{ color:"var(--accent)" }}>mind</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"var(--green-dim)", border:"1px solid var(--green-border)", borderRadius:20, padding:"4px 12px", fontSize:11, color:"var(--green)", fontFamily:"'JetBrains Mono',monospace" }}>
            <span style={{ width:6, height:6, background:"var(--green)", borderRadius:"50%", display:"inline-block", animation:"pulse 2s infinite" }} />
            agent online
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:"var(--text3)" }}>{clock}</span>
            <button style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, padding:"5px 12px", fontSize:11, color:"var(--text2)", cursor:"pointer", fontFamily:"'Syne',sans-serif" }}>mainnet</button>
            <button style={{ background:"var(--accent-dim)", border:"1px solid var(--accent-border)", borderRadius:8, padding:"5px 12px", fontSize:11, color:"var(--accent)", cursor:"pointer", fontFamily:"'JetBrains Mono',monospace" }}>0x3f...a91c</button>
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ background:"var(--bg1)", borderRight:"1px solid var(--border)", padding:"16px 12px", display:"flex", flexDirection:"column", gap:4, overflowY:"auto" }}>
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", color:"var(--text3)", padding:"8px 10px 4px", textTransform:"uppercase" }}>workspace</div>
          {navItems.map(n => (
            <div key={n.label} onClick={() => setNavItem(n.label)} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, cursor:"pointer", fontSize:13, color: navItem===n.label ? "var(--text)" : "var(--text2)", background: navItem===n.label ? "var(--accent-dim)" : "transparent", border: navItem===n.label ? "1px solid var(--accent-border)" : "1px solid transparent", transition:"all 0.15s" }}>
              <i className={`ti ${n.icon}`} style={{ fontSize:16, color: navItem===n.label ? "var(--accent)" : undefined }} aria-hidden="true" />
              {n.label}
            </div>
          ))}
          <div style={{ fontSize:9, fontWeight:700, letterSpacing:"0.12em", color:"var(--text3)", padding:"12px 10px 4px", textTransform:"uppercase" }}>agents</div>
          {agentItems.map(n => (
            <div key={n.label} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:8, cursor:"pointer", fontSize:13, color:"var(--text2)", border:"1px solid transparent", transition:"all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color="var(--text)"; e.currentTarget.style.background="var(--bg3)"; }}
              onMouseLeave={e => { e.currentTarget.style.color="var(--text2)"; e.currentTarget.style.background="transparent"; }}>
              <i className={`ti ${n.icon}`} style={{ fontSize:16 }} aria-hidden="true" />
              {n.label}
            </div>
          ))}

          <div style={{ marginTop:"auto", padding:10, background:"var(--bg2)", borderRadius:10, border:"1px solid var(--border)" }}>
            <div style={{ fontSize:10, color:"var(--text3)", marginBottom:4, fontFamily:"'JetBrains Mono',monospace" }}>net worth</div>
            <div style={{ fontSize:18, fontWeight:700, fontFamily:"'JetBrains Mono',monospace" }}>{fmt(total)}</div>
            <div style={{ fontSize:11, color:"var(--green)", marginTop:2 }}>+{fmt(totalChange)} today</div>
          </div>
        </div>

        {/* MAIN */}
        <div style={{ background:"var(--bg)", overflowY:"auto", padding:20 }}>

          {/* Stats */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:20 }}>
            {[
              { label:"Portfolio Value", val:fmt(total), sub:"+$719 today", subColor:"var(--green)" },
              { label:"Sharpe Ratio", val:"1.34", sub:"30-day rolling", subColor:"var(--text3)" },
              { label:"Beta vs BTC", val:"0.87", sub:"moderate corr.", subColor:"var(--amber)" },
            ].map(s => (
              <div key={s.label} style={{ background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:12, padding:14 }}>
                <div style={{ fontSize:10, color:"var(--text3)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:6 }}>{s.label}</div>
                <div style={{ fontSize:22, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"-0.02em" }}>{s.val}</div>
                <div style={{ fontSize:11, marginTop:3, fontFamily:"'JetBrains Mono',monospace", color:s.subColor }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Performance chart */}
          <div style={{ background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:12, padding:16, marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
              <div style={{ fontSize:13, fontWeight:600 }}>Portfolio performance</div>
              <div style={{ display:"flex", gap:4 }}>
                {["7D","30D","90D","1Y"].map(r => (
                  <button key={r} onClick={() => setRange(r)} style={{ padding:"4px 10px", borderRadius:6, fontSize:11, cursor:"pointer", fontFamily:"'JetBrains Mono',monospace", border:"1px solid", borderColor: range===r ? "var(--border2)" : "transparent", background: range===r ? "var(--bg3)" : "transparent", color: range===r ? "var(--text)" : "var(--text3)", transition:"all 0.15s" }}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ height:140 }}>
              <Line data={perfChart} options={perfOpts} />
            </div>
          </div>

          {/* Risk meter */}
          <div style={{ background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:12, padding:14, marginBottom:20 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div style={{ fontSize:13, fontWeight:600 }}>Risk exposure</div>
              <div style={{ fontSize:11, color:"var(--amber)", fontFamily:"'JetBrains Mono',monospace" }}>MODERATE — 63/100</div>
            </div>
            <div style={{ height:6, background:"var(--bg3)", borderRadius:3, overflow:"hidden", marginBottom:6 }}>
              <div style={{ height:"100%", width:"63%", background:"var(--amber)", borderRadius:3 }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:9, color:"var(--text3)", fontFamily:"'JetBrains Mono',monospace" }}>
              <span>low</span><span>moderate</span><span>high</span><span>extreme</span>
            </div>
          </div>

          {/* Assets table */}
          <div style={{ background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:12, overflow:"hidden" }}>
            <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1.2fr 80px 80px", padding:"10px 16px", borderBottom:"1px solid var(--border)", fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--text3)" }}>
              <div>Asset</div><div>Price</div><div>Holdings</div><div>24h</div><div>7D</div>
            </div>
            {PORTFOLIO.map((a, i) => {
              const val = a.amt * a.price;
              const alloc = (val / total * 100).toFixed(1);
              return (
                <div key={a.sym} style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1.2fr 80px 80px", padding:"12px 16px", borderBottom: i < PORTFOLIO.length-1 ? "1px solid var(--border)" : "none", alignItems:"center", cursor:"pointer", transition:"background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background="var(--bg2)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:`${a.color}18`, color:a.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, fontFamily:"'JetBrains Mono',monospace", flexShrink:0 }}>
                      {a.sym.slice(0,2)}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700 }}>{a.sym}</div>
                      <div style={{ fontSize:11, color:"var(--text3)", marginTop:1 }}>{a.name}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>{fmt(a.price)}</div>
                  <div>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>{fmt(val)}</div>
                    <div style={{ height:3, background:"var(--border)", borderRadius:2, overflow:"hidden", marginTop:4 }}>
                      <div style={{ height:"100%", width:`${alloc}%`, background:`${a.color}80`, borderRadius:2 }} />
                    </div>
                  </div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color: a.chg >= 0 ? "var(--green)" : "var(--red)" }}>
                    {a.chg >= 0 ? "+" : ""}{a.chg}%
                  </div>
                  <div style={{ display:"flex", alignItems:"center" }}>
                    <Sparkline data={a.spark} up={a.chg >= 0} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ background:"var(--bg1)", borderLeft:"1px solid var(--border)", display:"flex", flexDirection:"column", overflow:"hidden" }}>

          <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <div style={{ fontSize:13, fontWeight:700 }}>AI advisor</div>
            <div style={{ background:"var(--accent-dim)", border:"1px solid var(--accent-border)", borderRadius:6, padding:"3px 8px", fontSize:10, color:"var(--accent)", fontFamily:"'JetBrains Mono',monospace" }}>claude-3.5</div>
          </div>

          {/* Mimo target */}
          <div style={{ margin:"12px 12px 0", background:"var(--accent-dim)", border:"1px solid var(--accent-border)", borderRadius:10, padding:"10px 14px", flexShrink:0 }}>
            <div style={{ fontSize:10, color:"var(--accent)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:3 }}>Mimo allocation target</div>
            <div style={{ fontSize:18, fontWeight:800, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"-0.02em" }}>100T tokens</div>
            <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>Agent-powered DeFi analytics · submission ready</div>
          </div>

          {/* Quick actions */}
          <div style={{ padding:12, display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, borderBottom:"1px solid var(--border)", flexShrink:0 }}>
            {quickActions.map(qa => (
              <button key={qa.label} onClick={() => sendMessage(qa.q)} disabled={busy}
                style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:8, padding:"9px 10px", cursor:"pointer", textAlign:"left", transition:"all 0.15s", opacity: busy ? 0.5 : 1 }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="var(--border2)"; e.currentTarget.style.background="var(--bg3)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.background="var(--bg2)"; }}>
                <i className={`ti ${qa.icon}`} style={{ fontSize:14, color:"var(--text2)", display:"block", marginBottom:3 }} aria-hidden="true" />
                <div style={{ fontSize:11, fontWeight:600, color:"var(--text)", lineHeight:1.2 }}>{qa.label}</div>
                <div style={{ fontSize:9, color:"var(--text3)", marginTop:2 }}>{qa.desc}</div>
              </button>
            ))}
          </div>

          {/* Chat */}
          <div ref={chatRef} style={{ flex:1, overflowY:"auto", padding:12, display:"flex", flexDirection:"column", gap:10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display:"flex", flexDirection:"column", gap:3 }}>
                {m.role === "typing" ? (
                  <>
                    <div style={{ fontSize:9, color:"var(--text3)", fontFamily:"'JetBrains Mono',monospace", padding:"0 2px" }}>agent · thinking</div>
                    <TypingDots />
                  </>
                ) : (
                  <>
                    <div style={{ fontSize:9, color:"var(--text3)", fontFamily:"'JetBrains Mono',monospace", padding:"0 2px" }}>
                      {m.role === "user" ? "you · now" : "agent · now"}
                    </div>
                    <div style={{
                      padding:"10px 12px", borderRadius:10, fontSize:12, lineHeight:1.65, wordBreak:"break-word",
                      background: m.role === "user" ? "var(--bg3)" : "var(--bg2)",
                      border: m.role === "user" ? "1px solid var(--border2)" : "1px solid var(--border)",
                      color: m.role === "user" ? "var(--text)" : "var(--text2)",
                      alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                      maxWidth:"100%",
                      borderBottomRightRadius: m.role === "user" ? 3 : 10,
                      borderBottomLeftRadius: m.role === "agent" ? 3 : 10,
                    }} dangerouslySetInnerHTML={{ __html: m.content }} />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding:12, borderTop:"1px solid var(--border)", flexShrink:0 }}>
            <div style={{ display:"flex", gap:6, alignItems:"flex-end" }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,80)+"px"; }}
                onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();} }}
                placeholder="Ask the agent..."
                rows={1}
                style={{ flex:1, background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:10, padding:"9px 12px", color:"var(--text)", fontSize:12, fontFamily:"'Syne',sans-serif", outline:"none", resize:"none", lineHeight:1.4, maxHeight:80 }}
              />
              <button onClick={() => sendMessage()} disabled={!input.trim() || busy}
                style={{ width:34, height:34, background:"var(--accent)", border:"none", borderRadius:8, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, opacity: (!input.trim()||busy) ? 0.4 : 1, transition:"opacity 0.15s" }}
                aria-label="Send">
                <i className="ti ti-arrow-up" style={{ fontSize:15, color:"#fff" }} aria-hidden="true" />
              </button>
            </div>
            <div style={{ fontSize:10, color:"var(--text3)", marginTop:6, fontFamily:"'JetBrains Mono',monospace" }}>↵ send · shift+↵ newline</div>
          </div>
        </div>
      </div>
    </>
  );
}
