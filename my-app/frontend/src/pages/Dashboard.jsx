import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Invested from "./Invested";
import Interested from "./Interested";
import Empanelment from "./Empanelment";
import GiftCity from "./GiftCity";
import Customers from "./Customers";
import Products from "./Products";


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
    key: "empanelment_done",
    label: "Empanelment Done",
    sub: "this month",
    Icon: IcoEmpanel,
    from: "#1a3a6e", to: "#0e2247",
    iconBg: "rgba(79,142,247,0.22)",
    accent: "#4F8EF7",
    glow: "rgba(60,120,255,0.55)",
    type: "ratio",
  },
  {
    key: "customers_onboarding",
    label: "Customers Onboarding",
    sub: "this week",
    Icon: IcoClients,
    from: "#0f3d2e", to: "#082218",
    iconBg: "rgba(52,211,153,0.18)",
    accent: "#34D399",
    glow: "rgba(20,180,120,0.5)",
    type: "ratio",
  },
  {
    key: "gift_city_ac_active",
    label: "Gift City A/C",
    sub: "prospects",
    Icon: IcoGift,
    from: "#3d2500", to: "#1f1200",
    iconBg: "rgba(245,158,11,0.18)",
    accent: "#F59E0B",
    glow: "rgba(220,130,0,0.55)",
    type: "ratio",
  },
  {
    key: "prospects_count",
    label: "Prospects",
    sub: "Prospects",
    Icon: IcoProspects,
    from: "#1e1045", to: "#10082a",
    iconBg: "rgba(167,139,250,0.18)",
    accent: "#A78BFA",
    glow: "rgba(130,80,240,0.5)",
    type: "single",
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
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><polyline points="20 12 20 22 4 22 4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><rect x="2" y="7" width="20" height="5" rx="1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="22" x2="12" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoLogout({ size = 17 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function IcoMenu({ size = 20 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({ cfg, data, loading }) {
  const { Icon } = cfg;
  const completed = data?.completed ?? 0;
  const total     = data?.total     ?? 0;
  const single    = typeof data === "number" ? data : 0;
  const isRatio   = cfg.type === "ratio";

  return (
    <div className="sc" style={{ "--glow": cfg.glow, "--accent": cfg.accent }}>
      <div className="sc-bg" style={{ background: `linear-gradient(135deg, ${cfg.from} 0%, ${cfg.to} 100%)` }} />
      <div className="sc-orb" />
      <div className="sc-body">
        <div className="sc-icon" style={{ background: cfg.iconBg }}>
          <Icon size={26} />
        </div>
        <div className="sc-text">
          <div className="sc-label">{cfg.label}</div>
          {loading ? (
            <div className="sc-skel" />
          ) : isRatio ? (
            <div className="sc-ratio">
              <span className="sc-big">{completed}</span>
              <span className="sc-slash"> / </span>
              <span className="sc-tot">{total}</span>
            </div>
          ) : (
            <div className="sc-single">{single}</div>
          )}
          {!loading && (
            <div className="sc-sub">
              + {isRatio ? completed : single} {cfg.sub}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard ──────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [selected, setSelected]           = useState(null);
  const [headerCounts, setHeaderCounts]   = useState({});
  const [headerLoading, setHeaderLoading] = useState(true);
  const [refreshTick, setRefreshTick]     = useState(0);
  const [sideOpen, setSideOpen]           = useState(false);

  const refreshCounts = () => setRefreshTick((t) => t + 1);

  useEffect(() => {
    (async () => {
      setHeaderLoading(true);
      try {
        const res  = await fetch(`${API}/count/all`);
        const data = await res.json();
        setHeaderCounts(data);
      } catch {}
      finally { setHeaderLoading(false); }
    })();
  }, [refreshTick]);

  const handleLogout = () => { localStorage.removeItem("user"); navigate("/login"); };

  const renderContent = () => {
    if (selected === "empanelment") return <Empanelment inline onDataChange={refreshCounts} />;
    if (selected === "invested")    return <Invested    inline onDataChange={refreshCounts} />;
    if (selected === "interested")  return <Interested  inline onDataChange={refreshCounts} />;
    if (selected === "giftcity")    return <GiftCity    inline onDataChange={refreshCounts} />;
    if (selected === "customers")   return <Customers   inline onDataChange={refreshCounts} />;
    if (selected === "products")    return <Products    inline onDataChange={refreshCounts} />;
    return null;
  };

  const activeNav = NAV.find((n) => n.id === selected);

  return (
    <>
      <style>{CSS}</style>

      <div className="root">
        <div className="stars" aria-hidden />
        <div className="page-card">

        {sideOpen && <div className="side-overlay" onClick={() => setSideOpen(false)} />}

        {/* ════ SIDEBAR CARD ════ */}
        <aside className={`side ${sideOpen ? "side-open" : ""}`}>
          {/* LOGO */}
          <div className="side-logo">
            <div className="logo-box">
              <div className="logo-words">
                <span className="logo-main">FINANCE DOCTOR</span>
                <span className="logo-est">Est. 2002</span>
              </div>
            </div>
          </div>

          {/* NAV */}
          <nav className="side-nav">
            {NAV.map(({ id, label, Icon }) => (
              <button
                key={String(id)}
                className={`nav-btn ${selected === id ? "nav-active" : ""}`}
                onClick={() => { setSelected(id); setSideOpen(false); }}
              >
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

        {/* ════ MAIN CARD ════ */}
        <div className="main">
          <header className="topbar">
            <button className="menu-btn" onClick={() => setSideOpen(true)} aria-label="menu">
              <IcoMenu />
            </button>
            <h1 className="topbar-title">
              {activeNav ? activeNav.label : "Finance Doctor"}
            </h1>
            <div className="user-chip">
              <div className="user-av">
                {(user.name || "A").charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{user.name || "Admin"}</span>
            </div>
          </header>

          <div className="content">
            {/* Stat cards wrapped in glass card */}
            <div className="stats-card">
              <div className="stats-row">
                {STATS.map((cfg) => (
                  <StatCard key={cfg.key} cfg={cfg} data={headerCounts[cfg.key]} loading={headerLoading} />
                ))}
              </div>
            </div>

            {/* Module panel or welcome */}
            {selected === null ? (
              <div className="welcome">
                <div className="welcome-title">Welcome back, {user.name || "Admin"}! 👋</div>
                <div className="welcome-sub">Select a module from the sidebar to get started</div>
                <div className="quick-grid">
                  {NAV.filter((n) => n.id).map(({ id, label, Icon }) => (
                    <button key={id} className="quick-card" onClick={() => setSelected(id)}>
                      <span className="quick-ico"><Icon size={22} /></span>
                      <span className="quick-lbl">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="module-panel">
                {renderContent()}
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────── CSS ─────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;600;700;800&family=Exo+2:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #07091e;
  --border:    rgba(60,100,220,0.18);
  --border-hi: rgba(79,142,247,0.5);
  --text:      #ffffff;
  --muted:     rgba(180,200,255,0.6);
  --blue:      #4F8EF7;
  --green:     #34D399;
  --gold:      #F59E0B;
  --purple:    #A78BFA;
  --red:       #F87171;
  --side-w:    210px;
  --gap:       18px;
  --hdr-h:     64px;
  --r:         14px;
  --spring:    cubic-bezier(0.34,1.56,0.64,1);
  --smooth:    cubic-bezier(0.4,0,0.2,1);
  --fh:        'Orbitron', sans-serif;
  --fb:        'Exo 2', sans-serif;
}

html {
  min-height: 100%;
  background: #07091e url('/bg.png') center center / cover no-repeat fixed;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: var(--fb);
  background: transparent;
  color: var(--text);
  overflow-x: hidden;
  min-height: 100%;
  margin: 0;
  padding: 12px;
  box-sizing: border-box;
}
button { font-family: var(--fb); }

.root {
  min-height: 100vh;
  display: flex;
  align-items: stretch;
  padding: 12px;
  position: relative;
  background: transparent;
  box-sizing: border-box;
}

.page-card {
  display: flex;
  flex: 1;
  gap: 10px;
  align-items: stretch;
  border-radius: 20px;
  border: 1px solid rgba(79,142,247,0.35);
  box-shadow: 0 0 40px rgba(30,60,180,0.25), 0 0 80px rgba(10,20,80,0.4);
  padding: 10px;
  background: transparent;
}

/* ══ SIDEBAR ══ */
.side {
  width: var(--side-w);
  flex-shrink: 0;
  background: transparent;
  border: 1px solid rgba(79,142,247,0.35);
  border-radius: 20px;
  box-shadow: 0 0 30px rgba(30,60,180,0.2), 0 0 60px rgba(10,20,80,0.3);
  display: flex;
  flex-direction: column;
  z-index: 300;
  transition: transform .4s var(--spring);
  position: relative;
  overflow: hidden;
}
.side-overlay {
  position: fixed; inset: 0; z-index: 299;
  background: rgba(0,0,0,0.65);
  backdrop-filter: blur(4px);
}

/* ── LOGO BOX ── */
.side-logo {
  padding: 20px 14px 18px;
  border-bottom: 1px solid rgba(79,142,247,0.2);
}
.logo-box {
  border: 1.5px solid rgba(79,142,247,0.72);
  border-radius: 12px;
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(79,142,247,0.06);
  box-shadow:
    0 0 32px rgba(79,142,247,0.22),
    0 0 8px  rgba(79,142,247,0.4),
    inset 0 1px 0 rgba(255,255,255,0.07);
}
.logo-words {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 3px;
}
.logo-main {
  font-family: var(--fh);
  font-weight: 700;
  font-size: .85rem;
  color: #ffffff;
  letter-spacing: .1em;
  text-align: center;
  line-height: 1.3;
  white-space: normal;
  word-break: break-word;
  text-shadow: 0 0 22px rgba(79,142,247,0.65);
}
.logo-est {
  font-size: .63rem;
  color: rgba(160,190,255,0.65);
  letter-spacing: .16em;
  text-align: center;
  text-transform: uppercase;
  margin-top: 2px;
}

/* ── NAV ── */
.side-nav {
  flex: 1;
  padding: 18px 10px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}
.nav-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  color: rgba(200,220,255,0.75);
  font-size: .88rem;
  font-weight: 500;
  transition: all .22s var(--smooth);
  text-align: left;
  letter-spacing: .01em;
}
.nav-btn:hover {
  color: #fff;
  background: rgba(79,142,247,0.1);
  border-color: rgba(79,142,247,0.22);
}
.nav-active {
  color: #fff !important;
  background: linear-gradient(90deg, rgba(79,142,247,0.38), rgba(79,142,247,0.15)) !important;
  border-color: rgba(79,142,247,0.5) !important;
  box-shadow: 0 0 18px rgba(79,142,247,0.2);
  position: relative;
}
.nav-active::before {
  content: '';
  position: absolute;
  left: 0; top: 20%; bottom: 20%;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background: linear-gradient(180deg, var(--blue), var(--purple));
  box-shadow: 0 0 8px var(--blue);
}
.nav-ico { display: flex; align-items: center; flex-shrink: 0; }
.nav-lbl { font-weight: 500; font-size: .72rem; letter-spacing: .04em; }

/* ── LOGOUT CARD ── */
.logout-card {
  margin: 8px 0 16px;
  padding: 6px;
  border-radius: 12px;
  border: 1px solid rgba(79,142,247,0.25);
  background: rgba(79,142,247,0.05);
  box-shadow: 0 0 16px rgba(79,142,247,0.1), inset 0 1px 0 rgba(255,255,255,0.05);
  transition: transform .28s var(--spring), box-shadow .28s;
}
.logout-card:hover {
  transform: scale(1.06) translateY(-3px);
  box-shadow: 0 10px 30px rgba(79,142,247,0.3), inset 0 1px 0 rgba(255,255,255,0.08);
  border-color: rgba(79,142,247,0.5);
}
.logout-nav { width: 100%; margin-bottom: 0; }
.logout-nav:hover {
  color: #fff !important;
  background: transparent !important;
  border-color: transparent !important;
  transform: none;
  box-shadow: none;
}

/* ════ MAIN ════ */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  background: transparent;
  border-radius: 20px;
  overflow: hidden;
  min-height: 0;
}

/* ── TOPBAR ── */
.topbar {
  height: var(--hdr-h);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  background: transparent;
  position: sticky;
  top: 0;
  z-index: 200;
}
.menu-btn {
  display: none;
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 5px;
  border-radius: 7px;
}
.topbar-title {
  flex: 1;
  font-family: var(--fh);
  font-weight: 700;
  font-size: 1.1rem;
  color: #ffffff;
  letter-spacing: .08em;
}
.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 16px 4px 4px;
  background: rgba(12,20,65,0.5);
  border: 1px solid rgba(79,142,247,0.45);
  border-radius: 40px;
  backdrop-filter: blur(14px);
}
.user-av {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg,#2050c8,#6622bb);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: .85rem;
  color: #fff;
  box-shadow: 0 0 14px rgba(79,142,247,0.5);
}
.user-name {
  font-size: .85rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: .02em;
}

/* ── content ── */
.content {
  flex: 1;
  padding: 0 16px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ════ STATS GLASS CARD WRAPPER ════ */
.stats-card {
  border: 1px solid rgba(79,142,247,0.32);
  border-radius: 20px;
  padding: 14px;
  background: transparent;
  margin: 0 4px;
}

/* ════ STAT CARDS ════ */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4,1fr);
  gap: 14px;
}
.sc {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(79,142,247,0.45);
  padding: 12px 16px;
  transition: transform .35s var(--spring), box-shadow .35s;
  cursor: default;
  background: transparent;
  box-shadow: 0 0 14px rgba(0,0,0,0.6), 0 0 4px rgba(79,142,247,0.15), inset 0 1px 0 rgba(255,255,255,0.05);
}
.sc:hover {
  transform: translateY(-5px) scale(1.018);
  box-shadow: 0 0 22px rgba(0,0,0,0.75), 0 0 8px rgba(79,142,247,0.2), inset 0 1px 0 rgba(255,255,255,0.08);
}
.sc-bg  { display: none; }
.sc-orb {
  position: absolute;
  top: -20px; right: -20px;
  width: 100px; height: 100px;
  border-radius: 50%;
  background: var(--glow);
  filter: blur(32px);
  z-index: 0;
  pointer-events: none;
  display: none;
}
.sc-body {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}
.sc-icon {
  width: 40px; height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  border: 1.5px solid rgba(255,255,255,0.12);
  box-shadow: 0 0 14px rgba(0,0,0,0.4);
}
.sc-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.sc-label {
  font-family: var(--fh);
  font-size: .55rem;
  font-weight: 700;
  letter-spacing: .06em;
  color: rgba(220,235,255,0.95);
  white-space: normal;
  word-break: break-word;
  text-transform: uppercase;
  line-height: 1.3;
  text-shadow: 0 0 10px rgba(79,142,247,0.4);
}
.sc-ratio  { display: flex; align-items: baseline; gap: 2px; }
.sc-big    { font-family: var(--fh); font-size: 1.75rem; font-weight: 800; line-height: 1; color: #ffffff; text-shadow: 0 0 20px rgba(255,255,255,0.5); }
.sc-slash  { font-size: .9rem; color: rgba(220,235,255,0.7); }
.sc-tot    { font-size: .9rem; color: rgba(220,235,255,0.8); }
.sc-single { font-family: var(--fh); font-size: 2rem; font-weight: 800; line-height: 1; color: #ffffff; text-shadow: 0 0 20px rgba(255,255,255,0.5); }
.sc-sub    { font-size: .6rem; color: var(--accent); opacity: 1; margin-top: 2px; font-weight: 600; text-shadow: 0 0 8px var(--accent); }
.sc-skel   { height: 26px; width: 70px; border-radius: 6px; background: rgba(255,255,255,0.07); animation: sk 1.4s infinite; }
@keyframes sk { 0%,100%{opacity:.4} 50%{opacity:.8} }

/* ════ MODULE PANEL ════ */
.module-panel {
  background: rgba(8,12,45,0.32);
  border: 1px solid rgba(79,142,247,0.28);
  border-radius: 18px;
  overflow: visible;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow:
    0 0 0 1px rgba(79,142,247,0.08),
    0 8px 40px rgba(0,0,60,0.35),
    inset 0 1px 0 rgba(255,255,255,0.04);
  animation: pIn .38s var(--spring) both;
  margin: 0 4px 4px;
}
@keyframes pIn { from{opacity:0;transform:translateY(14px) scale(.985)} to{opacity:1;transform:none} }

/* ════ WELCOME ════ */
.welcome { text-align: center; padding: 48px 20px; animation: pIn .4s var(--spring) both; }
.welcome-title { font-family: var(--fh); font-size: 1.65rem; font-weight: 700; margin-bottom: 8px; color: #fff; }
.welcome-sub   { color: var(--muted); font-size: .9rem; margin-bottom: 26px; }
.quick-grid    { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; max-width: 440px; margin: 0 auto; }
.quick-card {
  background: rgba(12,18,55,0.5);
  border: 1px solid rgba(79,142,247,0.2);
  border-radius: var(--r);
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  transition: all .3s var(--spring);
  color: #fff;
  backdrop-filter: blur(10px);
}
.quick-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-hi);
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.quick-ico { color: var(--blue); }
.quick-lbl { font-weight: 600; font-size: .88rem; color: #fff; }

/* ════ MODULE HEADER ════ */
.mod-wrap { min-height: 200px; }
.mod-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(79,142,247,0.15);
}

/* ── TABS ── */
.tabs-row { display: flex; gap: 6px; flex-wrap: wrap; }
.tab-pill {
  padding: 7px 20px;
  border-radius: 50px;
  border: 1px solid rgba(79,142,247,0.28);
  background: rgba(10,14,60,0.6);
  color: rgba(180,210,255,0.68);
  backdrop-filter: blur(8px);
  font-size: .82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--fh);
  transition: all .28s var(--spring);
  white-space: nowrap;
  letter-spacing: .05em;
}
.tab-pill:hover {
  color: #fff;
  border-color: rgba(79,142,247,0.5);
  background: rgba(79,142,247,0.1);
}
.tab-active {
  background: linear-gradient(90deg, rgba(79,142,247,0.38), rgba(79,142,247,0.15)) !important;
  color: #fff !important;
  border-color: rgba(79,142,247,0.5) !important;
  box-shadow: 0 0 18px rgba(79,142,247,0.2);
  transform: translateY(-1px);
}

/* ── TABLE SECTION HEADER ── */
.tbl-hdr {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(79,142,247,0.15);
}
.tbl-title {
  font-family: var(--fh);
  font-weight: 700;
  font-size: 1rem;
  color: #fff;
  letter-spacing: .06em;
}
.tbl-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: .65rem;
  font-weight: 700;
  background: rgba(79,142,247,0.14);
  color: var(--blue);
  border: 1px solid rgba(79,142,247,0.28);
  font-family: var(--fb);
}

/* ── TABLE ── */
.tbl-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.fd-tbl { width: 100%; border-collapse: collapse; font-size: .84rem; }
.fd-tbl thead tr { background: rgba(20,35,110,0.28); }
.fd-tbl th {
  padding: 13px 18px;
  text-align: left;
  font-size: .68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: rgba(180,210,255,0.65);
  border-bottom: 1px solid rgba(79,142,247,0.22);
  white-space: nowrap;
}
.fd-tbl tbody tr {
  background: transparent;
  transition: background .18s;
  animation: rIn .32s ease both;
}
.fd-tbl tbody tr:nth-child(even) { background: rgba(79,142,247,0.04); }
.fd-tbl tbody tr:nth-child(1){animation-delay:.03s}
.fd-tbl tbody tr:nth-child(2){animation-delay:.06s}
.fd-tbl tbody tr:nth-child(3){animation-delay:.09s}
.fd-tbl tbody tr:nth-child(4){animation-delay:.12s}
.fd-tbl tbody tr:nth-child(5){animation-delay:.15s}
@keyframes rIn { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:none} }
.fd-tbl tbody tr:hover { background: rgba(79,142,247,0.08) !important; }
.fd-tbl tbody tr:last-child td { border-bottom: none; }
.fd-tbl td {
  padding: 8px 18px;
  color: #e8f0ff;
  border-bottom: 1px solid rgba(79,142,247,0.1);
  vertical-align: middle;
  white-space: nowrap;
  background: transparent;
  font-size: .86rem;
}
.fd-num   { color: rgba(160,190,255,0.5); font-size: .74rem; }
.fd-empty { text-align: center; padding: 56px 20px !important; color: var(--muted); font-style: italic; font-size: .84rem; }

/* ── ACTION BUTTONS ── */
.act-cell { display: flex; gap: 6px; align-items: center; justify-content: center; }
.ab {
  width: 30px; height: 30px;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all .22s var(--spring);
  flex-shrink: 0;
}
.ab:hover { transform: scale(1.15) translateY(-2px); }

.ab-del        { background: rgba(239,68,68,0.2);    color: #ef4444; border-color: rgba(239,68,68,0.28); }
.ab-del:hover  { background: #ef4444; color: #fff; border-color: #ef4444; box-shadow: 0 4px 14px rgba(239,68,68,0.5); }

.ab-edit       { background: rgba(79,142,247,0.2);   color: #4F8EF7; border-color: rgba(79,142,247,0.3); }
.ab-edit:hover { background: #4F8EF7; color: #fff; border-color: #4F8EF7; box-shadow: 0 4px 14px rgba(79,142,247,0.5); }

.ab-dl         { background: rgba(20,184,166,0.18);  color: #2dd4bf; border-color: rgba(20,184,166,0.26); }
.ab-dl:hover   { background: #14b8a6; color: #fff; border-color: #14b8a6; box-shadow: 0 4px 14px rgba(20,184,166,0.45); }

.ab-promo      { background: rgba(245,158,11,0.18);  color: #f59e0b; border-color: rgba(245,158,11,0.26); }
.ab-promo:hover{ background: #f59e0b; color: #fff; border-color: #f59e0b; box-shadow: 0 4px 14px rgba(245,158,11,0.45); }

.ab-view       { background: rgba(167,139,250,0.18); color: #a78bfa; border-color: rgba(167,139,250,0.26); }
.ab-view:hover { background: #a78bfa; color: #fff; border-color: #a78bfa; box-shadow: 0 4px 14px rgba(167,139,250,0.45); }

.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  color: #fff;
  font-size: .8rem;
  font-weight: 700;
  transition: all .28s var(--spring);
  letter-spacing: .03em;
}
.add-btn:hover { transform: translateY(-2px); filter: brightness(1.12); box-shadow: 0 6px 20px rgba(0,0,0,0.3); }

.chip { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: .71rem; font-weight: 700; }
.chip-yes { background: rgba(52,211,153,0.13); color: var(--green); border: 1px solid rgba(52,211,153,0.24); }
.chip-no  { background: rgba(248,113,113,0.1);  color: var(--red);  border: 1px solid rgba(248,113,113,0.2);  }

.fd-spin  { display: flex; justify-content: center; align-items: center; padding: 56px; }
.spinner  { width: 30px; height: 30px; border-radius: 50%; border: 3px solid rgba(79,142,247,0.18); border-top-color: var(--blue); animation: spin .8s linear infinite; }
@keyframes spin { to{transform:rotate(360deg)} }

/* ════ DIALOG ════ */
.dlg-ov {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,10,0.12);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
  animation: fIn .18s ease;
}
@keyframes fIn { from{opacity:0} to{opacity:1} }
.dlg-box {
  background: rgba(7,9,30,0.22);
  backdrop-filter: blur(44px) saturate(160%);
  -webkit-backdrop-filter: blur(44px) saturate(160%);
  border: 1px solid rgba(79,142,247,0.52);
  border-radius: 18px;
  width: 100%; max-width: 450px;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(79,142,247,0.1),
    0 8px 40px rgba(0,0,0,0.18),
    0 0 60px rgba(30,60,180,0.12),
    inset 0 1px 0 rgba(255,255,255,0.09);
  animation: dPop .32s var(--spring);
}
@keyframes dPop { from{opacity:0;transform:scale(.88) translateY(22px)} to{opacity:1;transform:none} }
.dlg-hdr {
  padding: 18px 22px 14px;
  border-bottom: 1px solid rgba(79,142,247,0.18);
  display: flex; align-items: center; gap: 11px;
  background: transparent;
}
.dlg-bar { width: 4px; height: 22px; border-radius: 2px; flex-shrink: 0; }
.dlg-ttl { font-family: var(--fh); font-weight: 700; font-size: 1rem; color: #fff; }
.dlg-sub { font-size: .67rem; color: var(--muted); margin-top: 2px; }
.dlg-body {
  padding: 18px 22px;
  display: flex; flex-direction: column; gap: 12px;
  max-height: 60vh; overflow-y: auto;
  background: transparent;
}
.dlg-foot {
  padding: 14px 22px;
  border-top: 1px solid rgba(79,142,247,0.15);
  display: flex; justify-content: flex-end; gap: 8px;
  background: transparent;
}
.fld  { display: flex; flex-direction: column; gap: 6px; }
.fld-lbl { font-size: .67rem; font-weight: 600; color: rgba(180,210,255,0.75); letter-spacing: .08em; text-transform: uppercase; }
.fld-inp {
  width: 100%; padding: 9px 12px; border-radius: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(79,142,247,0.3);
  color: #fff; font-size: .84rem; font-family: var(--fb);
  transition: border-color .2s, box-shadow .2s; outline: none;
}
.fld-inp:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(79,142,247,0.16); }
.fld-inp option { background: #0c1638; }
.fld-hi   { border-color: #f59e0b !important; }
.fld-note { font-size: .66rem; margin-top: 2px; }
.btn-cancel {
  padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(79,142,247,0.25);
  background: none; color: rgba(180,210,255,0.7); cursor: pointer;
  font-size: .8rem; font-weight: 600; transition: all .2s;
}
.btn-cancel:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
.btn-ok {
  padding: 8px 18px; border-radius: 10px; border: none; cursor: pointer; color: #fff;
  font-size: .8rem; font-weight: 700; transition: all .25s var(--spring);
}
.btn-ok:hover    { transform: translateY(-1px); filter: brightness(1.12); }
.btn-ok:disabled { opacity: .6; cursor: not-allowed; }
.btn-primary { background: linear-gradient(135deg,#4F8EF7,#7B5FFF); box-shadow: 0 4px 16px rgba(79,142,247,0.35); }
.btn-success { background: linear-gradient(135deg,#34D399,#059669); box-shadow: 0 4px 16px rgba(52,211,153,0.3); }
.btn-danger  { background: linear-gradient(135deg,#EF4444,#DC2626); box-shadow: 0 4px 16px rgba(239,68,68,0.3); }

/* ── SNACK ── */
.snack {
  position: fixed; bottom: 22px; right: 22px; z-index: 2000;
  padding: 11px 18px; border-radius: 12px;
  font-size: .84rem; font-weight: 600;
  box-shadow: 0 8px 30px rgba(0,0,0,0.45);
  animation: snkIn .32s var(--spring);
}
@keyframes snkIn { from{opacity:0;transform:translateY(16px) scale(.9)} to{opacity:1;transform:none} }
.snack-success { background: linear-gradient(135deg,#059669,#34D399); color:#fff; }
.snack-error   { background: linear-gradient(135deg,#DC2626,#EF4444); color:#fff; }

/* ════ RESPONSIVE ════ */
@media(max-width:1100px){ .stats-row{grid-template-columns:repeat(2,1fr);} }
@media(max-width:768px){
  :root { --gap: 10px; }
  .root { padding: 8px; gap: 0; }
  .side {
    position: fixed;
    top: 8px; left: 8px; bottom: 8px;
    border-radius: 20px;
    transform: translateX(calc(-100% - 20px));
    background: rgba(5,8,28,0.96);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .side-open { transform: translateX(0); }
  .main { border-radius: 20px; }
  .menu-btn { display: flex; }
  .stats-row { grid-template-columns: repeat(2,1fr); gap: 10px; }
  .content { padding: 4px 8px 20px; }
  .topbar { padding: 0 8px; }
  .sc-big { font-size: 1.75rem; }
  .sc-icon { width: 50px; height: 50px; }
}
@media(max-width:520px){
  .stats-row { grid-template-columns: 1fr 1fr; gap: 8px; }
  .sc { padding: 12px 13px; }
  .sc-body { gap: 9px; }
  .sc-icon { width: 44px; height: 44px; }
  .sc-big { font-size: 1.45rem; }
  .sc-single { font-size: 1.65rem; }
  .sc-label { font-size: .62rem; }
  .quick-grid { grid-template-columns: 1fr 1fr; }
  .fd-tbl th, .fd-tbl td { padding: 9px 10px; font-size: .78rem; }
}
@media(max-width:400px){
  .stats-row { grid-template-columns: 1fr; }
  .dlg-box { border-radius: 18px 18px 0 0; }
  .dlg-ov { align-items: flex-end; padding: 0; }
}
`;