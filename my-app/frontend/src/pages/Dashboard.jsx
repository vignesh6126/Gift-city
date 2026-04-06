import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Invested from "./Invested";
import Interested from "./Interested";
import Empanelment from "./Empanelment";
import GiftCity from "./GiftCity";
import Customers from "./Customers";
import Products from "./Products";
import AMCTable from "./AMCTable";

const API = import.meta.env.VITE_API_URL;

/* ─── nav config ─────────────────────────────────────────── */
const NAV = [
  { id: null,          label: "Dashboard",     Icon: IcoDashboard },
  { id: "empanelment", label: "Empanelment",   Icon: IcoEmpanel   },
  { id: "invested",    label: "Clients",       Icon: IcoClients   },
  { id: "interested",  label: "Prospects",     Icon: IcoProspects },
  { id: "giftcity",    label: "Gift City A/C", Icon: IcoGift      },
  { id: "customers",   label: "Customers",     Icon: IcoClients   },
  { id: "products",    label: "Products",      Icon: IcoProspects },
];

/* ─── stat card config ───────────────────────────────────── */
const STATS = [
  {
    key: "empanelment_done", label: "Empanelment Done", sub: "this month",
    Icon: IcoEmpanel, from: "#1a3a6e", to: "#0e2247",
    iconBg: "rgba(79,142,247,0.22)", accent: "#4F8EF7", type: "ratio",
  },
  {
    key: "customers_onboarding", label: "Customers Onboarding", sub: "this week",
    Icon: IcoClients, from: "#0f3d2e", to: "#082218",
    iconBg: "rgba(52,211,153,0.18)", accent: "#34D399", type: "ratio",
  },
  {
    key: "gift_city_ac_active", label: "Gift City A/C", sub: "prospects",
    Icon: IcoGift, from: "#3d2500", to: "#1f1200",
    iconBg: "rgba(245,158,11,0.18)", accent: "#F59E0B", type: "ratio",
  },
  {
    key: "prospects_count", label: "Prospects", sub: "Prospects",
    Icon: IcoProspects, from: "#1e1045", to: "#10082a",
    iconBg: "rgba(167,139,250,0.18)", accent: "#A78BFA", type: "single",
  },
  {
    id: "products",
    title: "PRODUCTS",
    color: "#0EA5E9",
    bgColor: "#F0F9FF",
    borderColor: "#7DD3FC",
    description: "Manage investment products, AMC details, and structures.",
  },
];

/* ─── SVG Icons ──────────────────────────────────────────── */
function IcoDashboard({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/></svg>;
}
function IcoEmpanel({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 3L4 7v5c0 5.25 3.5 10.15 8 11 4.5-.85 8-5.75 8-11V7l-8-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><polyline points="9 12 11 14 15 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoClients({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoProspects({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>;
}
function IcoGift({ size = 18 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><polyline points="20 12 20 22 4 22 4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="7" width="20" height="5" rx="1" stroke="currentColor" strokeWidth="1.8"/><line x1="12" y1="22" x2="12" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoLogout({ size = 17 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoMenu({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}
function IcoAlert({ size = 22 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>;
}
function IcoCalendar({ size = 22 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;
}

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({ cfg, data, loading }) {
  const { Icon } = cfg;
  const completed = data?.completed ?? 0;
  const total     = data?.total ?? 0;
const single = typeof data === "number"
  ? data
  : (data?.total ?? data?.count ?? data?.completed ?? 0);  const isRatio   = cfg.type === "ratio";
  return (
    <div className="sc" style={{ "--accent": cfg.accent, background: `linear-gradient(135deg,${cfg.from} 0%,${cfg.to} 100%)` }}>
      <div className="sc-body">
        <div className="sc-icon" style={{ background: cfg.iconBg }}>
          <Icon size={26} />
        </div>
        <div className="sc-text">
          <div className="sc-label">{cfg.label}</div>
          {loading ? <div className="sc-skel" /> : isRatio ? (
            <div className="sc-ratio">
              <span className="sc-big">{completed}</span>
              <span className="sc-slash"> / </span>
              <span className="sc-tot">{total}</span>
            </div>
          ) : (
            <div className="sc-single">{single}</div>
          )}
          {!loading && <div className="sc-sub">+ {isRatio ? completed : single} {cfg.sub}</div>}
        </div>
      </div>
    </div>
  );
}

/* ─── Pending Actions Side Card ─────────────────────────── */
function PendingActionsCard({ refreshTick, onNavigate }) {
  const [count, setCount]         = useState(null);
  const [breakdown, setBreakdown] = useState({ empanelment: 0, customers: 0, giftCity: 0 });
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [empPend, custPend, giftPend] = await Promise.all([
          fetch(`${API}/empanelment/pending`).then(r => r.json()),
          fetch(`${API}/invested/pending`).then(r => r.json()),
          fetch(`${API}/gift-city/inactive`).then(r => r.json()),
        ]);
        if (cancelled) return;
        const e = Array.isArray(empPend)  ? empPend.length  : 0;
        const c = Array.isArray(custPend) ? custPend.length : 0;
        const g = Array.isArray(giftPend) ? giftPend.length : 0;
        setBreakdown({ empanelment: e, customers: c, giftCity: g });
        setCount(e + c + g);
      } catch { if (!cancelled) setCount(0); }
      finally  { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [refreshTick]);

  return (
    <div className="side-card side-card-red">
      <div className="side-card-header">
        <div className="side-card-icon-wrap side-card-icon-red"><IcoAlert size={16} /></div>
        <span className="side-card-label">Pending Actions</span>
        {loading
          ? <div className="sc-skel" style={{ width: 36, height: 28, marginLeft: "auto", borderRadius: 6 }} />
          : <span className="side-card-count" style={{ color: "#F87171" }}>{count}</span>}
      </div>
      <div className="side-card-divider" />
      <div className="side-card-rows">
        {[
          { lbl: "Empanelment", val: breakdown.empanelment, color: "#4F8EF7", page: "empanelment", tab: "pending"  },
          { lbl: "Clients",     val: breakdown.customers,   color: "#34D399", page: "invested",    tab: "pending"  },
          { lbl: "Gift A/C",    val: breakdown.giftCity,    color: "#F59E0B", page: "giftcity",    tab: "inactive" },
        ].map(({ lbl, val, color, page, tab }) => (
          <div className="side-card-row pending-nav-row" key={lbl}
            onClick={() => onNavigate?.(page, tab)} style={{ cursor: "pointer" }}>
            <span className="side-card-row-dot" style={{ background: color }} />
            <span className="side-card-row-lbl">{lbl}</span>
            <span className="side-card-row-val" style={{ color }}>{loading ? "…" : val}</span>
            <span style={{ color: "rgba(180,210,255,0.3)", fontSize: ".7rem", marginLeft: 2 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Upcoming Meetings Card ─────────────────────────────── */
function UpcomingMeetingsCard({ refreshTick, onNavigate }) {
  const [allMeetings, setAllMeetings] = useState([]);
  const [total, setTotal]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [expanded, setExpanded]       = useState(false);
  const PREVIEW = 3;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setExpanded(false);
      try {
        const data = await fetch(`${API}/interested`).then(r => r.json());
        if (cancelled) return;
        const rows = Array.isArray(data) ? data : [];
        const now  = new Date(); now.setHours(0, 0, 0, 0);
        const upcoming = rows
          .filter(r => r.discussion_date && new Date(r.discussion_date) >= now)
          .sort((a, b) => new Date(a.discussion_date) - new Date(b.discussion_date));
        setTotal(upcoming.length); setAllMeetings(upcoming);
      } catch { if (!cancelled) { setTotal(0); setAllMeetings([]); } }
      finally  { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [refreshTick]);

  const fmtShort = d => {
    if (!d) return "—";
    const dt = new Date(d), today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((dt - today) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };
  const daysDiff = d => {
    if (!d) return null;
    const dt = new Date(d), today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((dt - today) / 86400000);
  };
  const chipColor = diff => {
    if (diff === 0) return { bg: "rgba(52,211,153,0.18)",  color: "#34D399", border: "rgba(52,211,153,0.3)"  };
    if (diff <= 3)  return { bg: "rgba(245,158,11,0.18)",  color: "#F59E0B", border: "rgba(245,158,11,0.3)"  };
    return              { bg: "rgba(79,142,247,0.14)",  color: "#4F8EF7", border: "rgba(79,142,247,0.28)" };
  };

  const visible   = expanded ? allMeetings : allMeetings.slice(0, PREVIEW);
  const remaining = (total ?? 0) - PREVIEW;

  return (
    <div className="side-card side-card-purple">
      <div className="side-card-header">
        <div className="side-card-icon-wrap side-card-icon-purple"><IcoCalendar size={16} /></div>
        <span
  className="side-card-label"
  onClick={() => onNavigate?.()}
  style={{ cursor: "pointer", textDecoration: "underline dotted", textUnderlineOffset: 3 }}
>
  Upcoming Meetings
</span>
        {loading
          ? <div className="sc-skel" style={{ width: 36, height: 28, marginLeft: "auto", borderRadius: 6 }} />
          : <span className="side-card-count" style={{ color: "#A78BFA" }}>{total}</span>}
      </div>
      <div className="side-card-divider" />
      <div className="side-card-rows">
        {loading ? [1,2,3].map(i => <div key={i} className="sc-skel" style={{ width:"100%",height:22,borderRadius:6,marginBottom:4 }} />) :
         allMeetings.length === 0 ? (
          <div style={{ color:"rgba(160,190,255,0.4)",fontSize:".71rem",textAlign:"center",padding:"8px 0",fontStyle:"italic" }}>No upcoming meetings</div>
        ) : (
          <>
            {visible.map((m, i) => {
              const diff = daysDiff(m.discussion_date);
              const chip = chipColor(diff);
              return (
                <div key={m.id ?? i} className="side-card-row" style={{ alignItems:"center" }}>
                  <span className="side-card-row-lbl" style={{ overflow:"hidden",textOverflow:"ellipsis",maxWidth:95,whiteSpace:"nowrap" }} title={m.client_name}>
                    {m.client_name || "—"}
                  </span>
                  <span style={{ fontSize:".63rem",fontWeight:700,padding:"2px 6px",borderRadius:20,background:chip.bg,color:chip.color,border:`1px solid ${chip.border}`,whiteSpace:"nowrap",marginLeft:"auto",flexShrink:0 }}>
                    {fmtShort(m.discussion_date)}
                  </span>
                </div>
              );
            })}
            {remaining > 0 && !expanded && (
              <button onClick={() => setExpanded(true)} style={{ marginTop:6,width:"100%",background:"rgba(167,139,250,0.1)",border:"1px dashed rgba(167,139,250,0.35)",borderRadius:8,color:"#A78BFA",fontSize:".69rem",fontWeight:700,padding:"5px 0",cursor:"pointer",fontFamily:"inherit",letterSpacing:".03em" }}>
                +{remaining} more
              </button>
            )}
            {expanded && (
              <button onClick={() => setExpanded(false)} style={{ marginTop:6,width:"100%",background:"rgba(167,139,250,0.07)",border:"1px dashed rgba(167,139,250,0.25)",borderRadius:8,color:"rgba(167,139,250,0.6)",fontSize:".67rem",fontWeight:600,padding:"4px 0",cursor:"pointer",fontFamily:"inherit" }}>
                Show less ↑
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Dashboard (Navy Blue) ──────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [selected,      setSelected]      = useState(null);
  const [headerCounts,  setHeaderCounts]  = useState({});
  const [headerLoading, setHeaderLoading] = useState(true);
  const [refreshTick,   setRefreshTick]   = useState(0);
  const [sideOpen,      setSideOpen]      = useState(false);
  const [initialTab,    setInitialTab]    = useState(null);

  useEffect(() => {
    document.body.style.background = `#060a1e url('/bg.png') center/cover no-repeat fixed`;
  }, []);

  useEffect(() => {
    (async () => {
      setHeaderLoading(true);
      try { const d = await fetch(`${API}/count/all`).then(r => r.json()); setHeaderCounts(d); } catch {}
      finally { setHeaderLoading(false); }
    })();
  }, [refreshTick]);

  const refreshCounts = () => setRefreshTick(t => t + 1);
  const handleLogout  = () => { localStorage.removeItem("user"); navigate("/login"); };

  const renderContent = () => {
    if (selected === "empanelment") return <Empanelment key={initialTab} inline onDataChange={refreshCounts} initialTab={initialTab} />;
    if (selected === "invested")    return <Invested    key={initialTab} inline onDataChange={refreshCounts} initialTab={initialTab} />;
    if (selected === "interested")  return <Interested  inline onDataChange={refreshCounts} />;
    if (selected === "giftcity")    return <GiftCity    key={initialTab} inline onDataChange={refreshCounts} initialTab={initialTab} />;
    if (selected === "customers")   return <Customers   inline onDataChange={refreshCounts} />;
    if (selected === "products")    return <Products    inline onDataChange={refreshCounts} />;
    return null;
  };

  const activeNav = NAV.find(n => n.id === selected);

  return (
    <>
      <style>{CSS}</style>
      <div className="root">
        <div className="page-card">
          {sideOpen && <div className="side-overlay" onClick={() => setSideOpen(false)} />}

          {/* ════ SIDEBAR ════ */}
          <aside className={`side ${sideOpen ? "side-open" : ""}`}>
            <div className="side-logo">
              <div className="logo-box">
                <div className="logo-words">
                  <span className="logo-main">FINANCE DOCTOR</span>
                  <span className="logo-est">Est. 2002</span>
                </div>
              </div>
            </div>
            <nav className="side-nav">
              {NAV.map(({ id, label, Icon }) => (
                <button key={String(id)}
                  className={`nav-btn ${selected === id ? "nav-active" : ""}`}
                  onClick={() => { setSelected(id); setInitialTab(null); setSideOpen(false); }}>
                  <span className="nav-ico"><Icon /></span>
                  <span className="nav-lbl">{label}</span>
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <div className="logout-card">
                <button className="nav-btn logout-nav" onClick={handleLogout}>
                  <span className="nav-ico"><IcoLogout /></span>
                  <span className="nav-lbl">Logout</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* ════ MAIN ════ */}
          <div className="main">
            <header className="topbar">
              <button className="menu-btn" onClick={() => setSideOpen(true)} aria-label="menu"><IcoMenu /></button>
              <h1 className="topbar-title">{activeNav ? activeNav.label : "Finance Doctor"}</h1>

              {/* Theme toggle → go to light */}
              <div className="theme-toggle-wrap">
                <span className="theme-toggle-ico">🌙</span>
                <label className="theme-switch" title="Switch to light mode">
                  <input type="checkbox" checked={false} onChange={() => navigate("/Dashboardlight")} />
                  <span className="theme-switch-track" />
                  <span className="theme-switch-thumb" />
                </label>
                <span className="theme-toggle-ico">☀️</span>
              </div>

              <div className="user-chip">
                <div className="user-av">{(user.name || "A").charAt(0).toUpperCase()}</div>
                <span className="user-name">{user.name || "Admin"}</span>
              </div>
            </header>

            <div className="content">
              <div className="stats-card">
                <div className="stats-row">
                  {STATS.map(cfg => (
                    <StatCard key={cfg.key} cfg={cfg} data={headerCounts[cfg.key]} loading={headerLoading} />
                  ))}
                </div>
              </div>

              {selected === null ? (
                <div className="dashboard-bottom">
                  <div className="amc-table-col">
                    <AMCTable key={refreshTick} onDataChange={refreshCounts} />
                  </div>
                  <div className="side-cards-col">
                    <PendingActionsCard refreshTick={refreshTick}
                      onNavigate={(page, tab) => { setInitialTab(tab); setSelected(page); }} />
                    <UpcomingMeetingsCard refreshTick={refreshTick} onNavigate={() => setSelected("interested")} />
                  </div>
                </div>
              ) : (
                <div className="module-panel">{renderContent()}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   NAVY BLUE THEME CSS
═══════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blue:#4F8EF7;--green:#34D399;--gold:#F59E0B;--purple:#A78BFA;--red:#F87171;
  --muted:rgba(180,200,255,0.6);--side-w:210px;--hdr-h:64px;
  --spring:cubic-bezier(0.34,1.56,0.64,1);--smooth:cubic-bezier(0.4,0,0.2,1);
  --fh:'Inter',sans-serif;--fb:'Inter',sans-serif;
}
html{min-height:100%;padding:0;box-sizing:border-box}
body{font-family:var(--fb);background:transparent;color:#fff;overflow-x:hidden;min-height:100%;margin:0;padding:12px;box-sizing:border-box}
button{font-family:var(--fb)}

.root{min-height:100vh;display:flex;align-items:stretch;padding:12px;background:transparent;box-sizing:border-box}
.page-card{display:flex;flex:1;gap:10px;align-items:stretch;border-radius:20px;border:1px solid rgba(79,142,247,0.35);box-shadow:0 0 40px rgba(30,60,180,0.25),0 0 80px rgba(10,20,80,0.4);padding:10px;background:transparent}

/* ── Sidebar ── */
.side{width:var(--side-w);flex-shrink:0;background:transparent;border:1px solid rgba(79,142,247,0.35);border-radius:20px;box-shadow:0 0 30px rgba(30,60,180,0.2),0 0 60px rgba(10,20,80,0.3);display:flex;flex-direction:column;z-index:300;transition:transform .4s var(--spring);position:relative;overflow:hidden}
.side-overlay{position:fixed;inset:0;z-index:299;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px)}
.side-logo{padding:20px 14px 18px;border-bottom:1px solid rgba(79,142,247,0.2)}
.logo-box{border:1.5px solid rgba(79,142,247,0.72);border-radius:12px;padding:14px 12px;display:flex;flex-direction:column;align-items:center;background:rgba(79,142,247,0.06);box-shadow:0 0 32px rgba(79,142,247,0.22),0 0 8px rgba(79,142,247,0.4),inset 0 1px 0 rgba(255,255,255,0.07)}
.logo-words{display:flex;flex-direction:column;align-items:center;width:100%;gap:3px}
.logo-main{font-family:var(--fh);font-weight:700;font-size:.85rem;color:#fff;letter-spacing:.1em;text-align:center;line-height:1.3;word-break:break-word;text-shadow:0 0 22px rgba(79,142,247,0.65)}
.logo-est{font-size:.63rem;color:rgba(160,190,255,0.65);letter-spacing:.16em;text-align:center;text-transform:uppercase;margin-top:2px}
.side-nav{flex:1;padding:18px 10px;display:flex;flex-direction:column;gap:2px;overflow-y:auto}
.nav-btn{width:100%;display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:10px;border:1px solid transparent;background:transparent;cursor:pointer;color:rgba(200,220,255,0.75);font-size:.88rem;font-weight:500;transition:all .22s var(--smooth);text-align:left;letter-spacing:.01em}
.nav-btn:hover{color:#fff;background:rgba(79,142,247,0.1);border-color:rgba(79,142,247,0.22)}
.nav-active{color:#fff!important;background:linear-gradient(90deg,rgba(79,142,247,0.38),rgba(79,142,247,0.15))!important;border-color:rgba(79,142,247,0.5)!important;box-shadow:0 0 18px rgba(79,142,247,0.2);position:relative}
.nav-active::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;border-radius:0 2px 2px 0;background:linear-gradient(180deg,var(--blue),var(--purple));box-shadow:0 0 8px var(--blue)}
.nav-ico{display:flex;align-items:center;flex-shrink:0}
.nav-lbl{font-weight:500;font-size:.72rem;letter-spacing:.04em}
.logout-card{margin:8px 0 16px;padding:6px;border-radius:12px;border:1px solid rgba(79,142,247,0.25);background:rgba(79,142,247,0.05);box-shadow:0 0 16px rgba(79,142,247,0.1),inset 0 1px 0 rgba(255,255,255,0.05);transition:transform .28s var(--spring),box-shadow .28s}
.logout-card:hover{transform:scale(1.06) translateY(-3px);box-shadow:0 10px 30px rgba(79,142,247,0.3);border-color:rgba(79,142,247,0.5)}
.logout-nav{width:100%;margin-bottom:0}
.logout-nav:hover{color:#fff!important;background:transparent!important;border-color:transparent!important}

/* ── Main ── */
.main{flex:1;display:flex;flex-direction:column;position:relative;z-index:1;background:transparent;border-radius:20px;overflow:hidden;min-height:0}
.topbar{height:var(--hdr-h);display:flex;align-items:center;padding:0 16px;gap:12px;background:transparent;position:sticky;top:0;z-index:200}
.menu-btn{display:none;background:none;border:none;color:#fff;cursor:pointer;padding:5px;border-radius:7px}
.topbar-title{flex:1;font-family:var(--fh);font-weight:700;font-size:1.1rem;color:#fff;letter-spacing:.08em}
.user-chip{display:flex;align-items:center;gap:8px;padding:4px 16px 4px 4px;background:rgba(12,20,65,0.5);border:1px solid rgba(79,142,247,0.45);border-radius:40px;backdrop-filter:blur(14px)}
.user-av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#2050c8,#6622bb);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;color:#fff;box-shadow:0 0 14px rgba(79,142,247,0.5)}
.user-name{font-size:.85rem;font-weight:600;color:#fff;letter-spacing:.02em}

/* ── Content ── */
.content{flex:1;padding:0 16px 28px;display:flex;flex-direction:column;gap:16px}
.stats-card{border:1px solid rgba(79,142,247,0.32);border-radius:20px;padding:14px;background:transparent;margin:0 4px}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}

/* ── Stat Cards ── */
.sc{position:relative;overflow:hidden;border-radius:16px;border:1px solid rgba(79,142,247,0.45);padding:12px 16px;transition:transform .35s var(--spring),box-shadow .35s;cursor:default;box-shadow:0 0 14px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.05)}
.sc:hover{transform:translateY(-5px) scale(1.018);box-shadow:0 0 22px rgba(0,0,0,0.75),inset 0 1px 0 rgba(255,255,255,0.08)}
.sc-body{position:relative;z-index:1;display:flex;align-items:center;gap:10px}
.sc-icon{width:40px;height:40px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--accent);border:1.5px solid rgba(255,255,255,0.12);box-shadow:0 0 14px rgba(0,0,0,0.4)}
.sc-text{display:flex;flex-direction:column;gap:1px;min-width:0}
.sc-label{font-size:.55rem;font-weight:700;letter-spacing:.06em;color:rgba(220,235,255,0.95);white-space:normal;word-break:break-word;text-transform:uppercase;line-height:1.3;text-shadow:0 0 10px rgba(79,142,247,0.4)}
.sc-ratio{display:flex;align-items:baseline;gap:2px}
.sc-big{font-size:1.75rem;font-weight:800;line-height:1;color:#fff;text-shadow:0 0 20px rgba(255,255,255,0.5)}
.sc-slash{font-size:.9rem;color:rgba(220,235,255,0.7)}
.sc-tot{font-size:.9rem;color:rgba(220,235,255,0.8)}
.sc-single{font-size:2rem;font-weight:800;line-height:1;color:#fff;text-shadow:0 0 20px rgba(255,255,255,0.5)}
.sc-sub{font-size:.6rem;color:var(--accent);margin-top:2px;font-weight:600;text-shadow:0 0 8px var(--accent)}
.sc-skel{height:26px;width:70px;border-radius:6px;background:rgba(255,255,255,0.07);animation:sk 1.4s infinite}
@keyframes sk{0%,100%{opacity:.4}50%{opacity:.8}}

/* ── Dashboard bottom layout ── */
.dashboard-bottom{display:flex;gap:12px;align-items:flex-start;margin:0 4px 4px}
.amc-table-col{flex:1;min-width:0}
.side-cards-col{display:flex;flex-direction:column;gap:12px;width:200px;flex-shrink:0}

/* ── Side Info Cards ── */
.side-card{border-radius:16px;border:1px solid rgba(79,142,247,0.28);padding:16px 14px 14px;display:flex;flex-direction:column;background:rgba(8,12,48,0.45);backdrop-filter:blur(8px);animation:pIn .38s var(--spring) both;transition:transform .28s var(--spring),box-shadow .28s;position:relative;overflow:hidden}
.side-card::before{content:'';position:absolute;inset:0;border-radius:16px;opacity:.06;pointer-events:none}
.side-card-red{border-color:rgba(248,113,113,0.28);box-shadow:0 0 24px rgba(248,113,113,0.07),inset 0 1px 0 rgba(255,255,255,0.05)}
.side-card-red::before{background:radial-gradient(ellipse at top left,#F87171,transparent 70%)}
.side-card-purple{border-color:rgba(167,139,250,0.28);box-shadow:0 0 24px rgba(167,139,250,0.07),inset 0 1px 0 rgba(255,255,255,0.05)}
.side-card-purple::before{background:radial-gradient(ellipse at top left,#A78BFA,transparent 70%)}
.side-card:hover{transform:translateY(-3px) scale(1.01)}
.side-card-red:hover{box-shadow:0 8px 28px rgba(248,113,113,0.18),inset 0 1px 0 rgba(255,255,255,0.07)}
.side-card-purple:hover{box-shadow:0 8px 28px rgba(167,139,250,0.18),inset 0 1px 0 rgba(255,255,255,0.07)}
.side-card-header{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.side-card-icon-wrap{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.side-card-icon-red{background:rgba(248,113,113,0.16);color:#F87171;border:1px solid rgba(248,113,113,0.28)}
.side-card-icon-purple{background:rgba(167,139,250,0.16);color:#A78BFA;border:1px solid rgba(167,139,250,0.28)}
.side-card-label{font-size:.5rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(200,220,255,0.75);line-height:1.2;flex:1}
.side-card-count{font-size:1.45rem;font-weight:800;line-height:1;margin-left:auto;flex-shrink:0;text-shadow:0 0 16px currentColor}
.side-card-divider{height:1px;background:rgba(79,142,247,0.14);margin:0 0 9px;border-radius:1px}
.side-card-rows{display:flex;flex-direction:column;gap:6px}
.side-card-row{display:flex;align-items:center;gap:6px;font-size:.71rem}
.side-card-row-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.side-card-row-lbl{color:rgba(180,210,255,0.65);flex:1;font-weight:500;font-size:.7rem}
.side-card-row-val{font-weight:800;font-size:.78rem}
.pending-nav-row{border-radius:7px;padding:3px 5px;margin:0 -5px;transition:background .18s,transform .15s}
.pending-nav-row:hover{background:rgba(79,142,247,0.1);transform:translateX(2px)}

/* ── Module Panel ── */
.module-panel{background:rgba(8,12,45,0.32);border:1px solid rgba(79,142,247,0.28);border-radius:18px;overflow:visible;backdrop-filter:blur(4px);box-shadow:0 0 0 1px rgba(79,142,247,0.08),0 8px 40px rgba(0,0,60,0.35),inset 0 1px 0 rgba(255,255,255,0.04);animation:pIn .38s var(--spring) both;margin:0 4px 4px}
@keyframes pIn{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}

/* ── Table shared classes ── */
.mod-wrap{min-height:200px}
.mod-hdr{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;padding:14px 20px;border-bottom:1px solid rgba(79,142,247,0.15)}
.tabs-row{display:flex;gap:6px;flex-wrap:wrap}
.tab-pill{padding:7px 20px;border-radius:50px;border:1px solid rgba(79,142,247,0.28);background:rgba(10,14,60,0.6);color:rgba(180,210,255,0.68);backdrop-filter:blur(8px);font-size:.82rem;font-weight:600;cursor:pointer;font-family:var(--fh);transition:all .28s var(--spring);white-space:nowrap;letter-spacing:.05em}
.tab-pill:hover{color:#fff;border-color:rgba(79,142,247,0.5);background:rgba(79,142,247,0.1)}
.tab-active{background:linear-gradient(90deg,rgba(79,142,247,0.38),rgba(79,142,247,0.15))!important;color:#fff!important;border-color:rgba(79,142,247,0.5)!important;box-shadow:0 0 18px rgba(79,142,247,0.2);transform:translateY(-1px)}
.tbl-hdr{display:flex;align-items:center;gap:10px;padding:12px 20px;border-bottom:1px solid rgba(79,142,247,0.15)}
.tbl-title{font-weight:700;font-size:1rem;color:#fff;letter-spacing:.06em}
.tbl-badge{padding:3px 10px;border-radius:20px;font-size:.65rem;font-weight:700;background:rgba(79,142,247,0.14);color:var(--blue);border:1px solid rgba(79,142,247,0.28)}
.tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
.fd-tbl{width:100%;border-collapse:collapse;font-size:.84rem}
.fd-tbl thead tr{background:rgba(20,35,110,0.28)}
.fd-tbl th{padding:13px 18px;text-align:left;font-size:.68rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(180,210,255,0.65);border-bottom:1px solid rgba(79,142,247,0.22);white-space:nowrap}
.fd-tbl tbody tr{background:transparent;transition:background .18s;animation:rIn .32s ease both}
.fd-tbl tbody tr:nth-child(even){background:rgba(79,142,247,0.04)}
.fd-tbl tbody tr:nth-child(1){animation-delay:.03s}.fd-tbl tbody tr:nth-child(2){animation-delay:.06s}.fd-tbl tbody tr:nth-child(3){animation-delay:.09s}.fd-tbl tbody tr:nth-child(4){animation-delay:.12s}.fd-tbl tbody tr:nth-child(5){animation-delay:.15s}
@keyframes rIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
.fd-tbl tbody tr:hover{background:rgba(79,142,247,0.08)!important}
.fd-tbl tbody tr:last-child td{border-bottom:none}
.fd-tbl td{padding:8px 18px;color:#e8f0ff;border-bottom:1px solid rgba(79,142,247,0.1);vertical-align:middle;white-space:nowrap;background:transparent;font-size:.86rem}
.fd-num{color:rgba(160,190,255,0.5);font-size:.74rem}
.fd-empty{text-align:center;padding:56px 20px!important;color:var(--muted);font-style:italic;font-size:.84rem}
.act-cell{display:flex;gap:6px;align-items:center;justify-content:center}
.ab{width:30px;height:30px;border-radius:8px;border:1px solid transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .22s var(--spring);flex-shrink:0}
.ab:hover{transform:scale(1.15) translateY(-2px)}
.ab-del{background:rgba(239,68,68,0.2);color:#ef4444;border-color:rgba(239,68,68,0.28)}.ab-del:hover{background:#ef4444;color:#fff;box-shadow:0 4px 14px rgba(239,68,68,0.5)}
.ab-edit{background:rgba(79,142,247,0.2);color:#4F8EF7;border-color:rgba(79,142,247,0.3)}.ab-edit:hover{background:#4F8EF7;color:#fff;box-shadow:0 4px 14px rgba(79,142,247,0.5)}
.ab-dl{background:rgba(20,184,166,0.18);color:#2dd4bf;border-color:rgba(20,184,166,0.26)}.ab-dl:hover{background:#14b8a6;color:#fff;box-shadow:0 4px 14px rgba(20,184,166,0.45)}
.ab-promo{background:rgba(245,158,11,0.18);color:#f59e0b;border-color:rgba(245,158,11,0.26)}.ab-promo:hover{background:#f59e0b;color:#fff;box-shadow:0 4px 14px rgba(245,158,11,0.45)}
.ab-view{background:rgba(167,139,250,0.18);color:#a78bfa;border-color:rgba(167,139,250,0.26)}.ab-view:hover{background:#a78bfa;color:#fff;box-shadow:0 4px 14px rgba(167,139,250,0.45)}
.add-btn{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:10px;border:none;cursor:pointer;color:#fff;font-size:.8rem;font-weight:700;transition:all .28s var(--spring);letter-spacing:.03em}
.add-btn:hover{transform:translateY(-2px);filter:brightness(1.12);box-shadow:0 6px 20px rgba(0,0,0,0.3)}
.chip{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:.71rem;font-weight:700}
.chip-yes{background:rgba(52,211,153,0.13);color:var(--green);border:1px solid rgba(52,211,153,0.24)}
.chip-no{background:rgba(248,113,113,0.1);color:var(--red);border:1px solid rgba(248,113,113,0.2)}
.fd-spin{display:flex;justify-content:center;align-items:center;padding:56px}
.spinner{width:30px;height:30px;border-radius:50%;border:3px solid rgba(79,142,247,0.18);border-top-color:var(--blue);animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.dlg-ov{position:fixed;inset:0;z-index:1000;background:rgba(0,0,10,0.12);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:16px;animation:fIn .18s ease}
@keyframes fIn{from{opacity:0}to{opacity:1}}
.dlg-box{background:rgba(7,9,30,0.22);backdrop-filter:blur(44px) saturate(160%);border:1px solid rgba(79,142,247,0.52);border-radius:18px;width:100%;max-width:450px;overflow:hidden;box-shadow:0 0 0 1px rgba(79,142,247,0.1),0 8px 40px rgba(0,0,0,0.18),inset 0 1px 0 rgba(255,255,255,0.09);animation:dPop .32s var(--spring)}
@keyframes dPop{from{opacity:0;transform:scale(.88) translateY(22px)}to{opacity:1;transform:none}}
.dlg-hdr{padding:18px 22px 14px;border-bottom:1px solid rgba(79,142,247,0.18);display:flex;align-items:center;gap:11px;background:transparent}
.dlg-bar{width:4px;height:22px;border-radius:2px;flex-shrink:0}
.dlg-ttl{font-weight:700;font-size:1rem;color:#fff}
.dlg-sub{font-size:.67rem;color:var(--muted);margin-top:2px}
.dlg-body{padding:18px 22px;display:flex;flex-direction:column;gap:12px;max-height:60vh;overflow-y:auto;background:transparent}
.dlg-foot{padding:14px 22px;border-top:1px solid rgba(79,142,247,0.15);display:flex;justify-content:flex-end;gap:8px;background:transparent}
.fld{display:flex;flex-direction:column;gap:6px}
.fld-lbl{font-size:.67rem;font-weight:600;color:rgba(180,210,255,0.75);letter-spacing:.08em;text-transform:uppercase}
.fld-inp{width:100%;padding:9px 12px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(79,142,247,0.3);color:#fff;font-size:.84rem;font-family:var(--fb);transition:border-color .2s,box-shadow .2s;outline:none}
.fld-inp:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(79,142,247,0.16)}
.fld-inp option{background:#0c1638}
.fld-hi{border-color:#f59e0b!important}
.fld-note{font-size:.66rem;margin-top:2px}
.btn-cancel{padding:8px 16px;border-radius:10px;border:1px solid rgba(79,142,247,0.25);background:none;color:rgba(180,210,255,0.7);cursor:pointer;font-size:.8rem;font-weight:600;transition:all .2s}
.btn-cancel:hover{border-color:rgba(255,255,255,0.25);color:#fff}
.btn-ok{padding:8px 18px;border-radius:10px;border:none;cursor:pointer;color:#fff;font-size:.8rem;font-weight:700;transition:all .25s var(--spring)}
.btn-ok:hover{transform:translateY(-1px);filter:brightness(1.12)}
.btn-ok:disabled{opacity:.6;cursor:not-allowed}
.btn-primary{background:linear-gradient(135deg,#4F8EF7,#7B5FFF);box-shadow:0 4px 16px rgba(79,142,247,0.35)}
.btn-success{background:linear-gradient(135deg,#34D399,#059669);box-shadow:0 4px 16px rgba(52,211,153,0.3)}
.btn-danger{background:linear-gradient(135deg,#EF4444,#DC2626);box-shadow:0 4px 16px rgba(239,68,68,0.3)}
.snack{position:fixed;bottom:22px;right:22px;z-index:2000;padding:11px 18px;border-radius:12px;font-size:.84rem;font-weight:600;box-shadow:0 8px 30px rgba(0,0,0,0.45);animation:snkIn .32s var(--spring)}
@keyframes snkIn{from{opacity:0;transform:translateY(16px) scale(.9)}to{opacity:1;transform:none}}
.snack-success{background:linear-gradient(135deg,#059669,#34D399);color:#fff}
.snack-error{background:linear-gradient(135deg,#DC2626,#EF4444);color:#fff}

/* ── Theme Toggle ── */
.theme-toggle-wrap{display:flex;align-items:center;gap:7px;margin-right:4px;flex-shrink:0}
.theme-toggle-ico{font-size:.9rem;line-height:1;user-select:none;pointer-events:none;opacity:.8}
.theme-switch{position:relative;width:44px;height:24px;cursor:pointer;flex-shrink:0}
.theme-switch input{opacity:0;width:0;height:0;position:absolute}
.theme-switch-track{position:absolute;inset:0;border-radius:99px;background:rgba(30,60,180,0.4);border:1px solid rgba(80,140,230,0.5);transition:background .3s;box-shadow:inset 0 1px 3px rgba(0,0,0,0.35)}
.theme-switch-thumb{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:linear-gradient(135deg,#7eb3ff,#fff);box-shadow:0 1px 6px rgba(0,0,0,0.45);transition:transform .3s var(--spring)}
.theme-switch input:checked ~ .theme-switch-thumb{transform:translateX(20px)}

/* ── Responsive ── */
@media(max-width:1100px){.stats-row{grid-template-columns:repeat(2,1fr)}}
@media(max-width:900px){.dashboard-bottom{flex-direction:column}.side-cards-col{width:100%;flex-direction:row}.side-card{flex:1}}
@media(max-width:768px){
  .root{padding:8px}
  .side{position:fixed;top:8px;left:8px;bottom:8px;border-radius:20px;transform:translateX(calc(-100% - 20px));background:rgba(5,8,28,0.96);backdrop-filter:blur(20px)}
  .side-open{transform:translateX(0)}
  .main{border-radius:20px}
  .menu-btn{display:flex}
  .stats-row{grid-template-columns:repeat(2,1fr);gap:10px}
  .content{padding:4px 8px 20px}
  .topbar{padding:0 8px}
}
@media(max-width:600px){.side-cards-col{flex-direction:column}}
@media(max-width:520px){
  .stats-row{grid-template-columns:1fr 1fr;gap:8px}
  .sc{padding:12px 13px}.sc-big{font-size:1.45rem}.sc-single{font-size:1.65rem}.sc-label{font-size:.62rem}
  .fd-tbl th,.fd-tbl td{padding:9px 10px;font-size:.78rem}
}
@media(max-width:400px){
  .stats-row{grid-template-columns:1fr}
  .dlg-box{border-radius:18px 18px 0 0}
  .dlg-ov{align-items:flex-end;padding:0}
}
`;
