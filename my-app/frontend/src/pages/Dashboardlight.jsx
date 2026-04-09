/**
 * DashboardLight.jsx — SKY BLUE (LIGHT) THEME
 * Self-contained: all CSS is inlined via the CSS constant.
 * Cards are fully transparent glass — background image shows through.
 * Theme toggle navigates back to /dashboard (navy blue).
 */

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

function IcoDashboard({ size = 18 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8" /></svg>;
}
function IcoEmpanel({ size = 18 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M12 3L4 7v5c0 5.25 3.5 10.15 8 11 4.5-.85 8-5.75 8-11V7l-8-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><polyline points="9 12 11 14 15 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function IcoClients({ size = 18 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function IcoProspects({ size = 18 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="12" r="2" fill="currentColor" /></svg>;
}
function IcoGift({ size = 18 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><polyline points="20 12 20 22 4 22 4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><rect x="2" y="7" width="20" height="5" rx="1" stroke="currentColor" strokeWidth="1.8" /><line x1="12" y1="22" x2="12" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function IcoLogout({ size = 17 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function IcoMenu({ size = 20 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="3" y1="18" x2="21" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function IcoAlert({ size = 22 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>;
}
function IcoCalendar({ size = 22 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" /><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8" /><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>;
}

const NAV = [
    { id: null, label: "Dashboard", Icon: IcoDashboard },
    { id: "empanelment", label: "Empanelment", Icon: IcoEmpanel },
    { id: "invested", label: "Clients", Icon: IcoClients },
    { id: "interested", label: "Prospects", Icon: IcoProspects },
    { id: "giftcity", label: "Gift City A/C", Icon: IcoGift },
    { id: "customers", label: "Customers", Icon: IcoClients },
    { id: "products", label: "Products", Icon: IcoProspects },
];

const STATS = [
    { key: "empanelment_done", label: "Empanelment Done", sub: "this month", Icon: IcoEmpanel, iconBg: "rgba(42,109,217,0.15)", accent: "#2a6dd9", type: "ratio" },
    { key: "customers_onboarding", label: "Customers Onboarding", sub: "this week", Icon: IcoClients, iconBg: "rgba(15,158,110,0.15)", accent: "#0f9e6e", type: "ratio" },
    { key: "gift_city_ac_active", label: "Gift City A/C", sub: "prospects", Icon: IcoGift, iconBg: "rgba(201,124,8,0.15)", accent: "#c97c08", type: "ratio" },
    { key: "prospects_count", label: "Prospects", sub: "Prospects", Icon: IcoProspects, iconBg: "rgba(107,78,198,0.15)", accent: "#6b4ec6", type: "single" },
];

function StatCard({ cfg, data, loading }) {
    const { Icon } = cfg;
    const completed = data?.completed ?? 0;
    const total = data?.total ?? 0;
    const single = typeof data === "number" ? data : (data?.total ?? data?.count ?? data?.completed ?? 0);
    const isRatio = cfg.type === "ratio";
    return (
        <div className="sc" style={{ "--accent": cfg.accent }}>
            <div className="sc-body">
                <div className="sc-icon" style={{ background: cfg.iconBg }}>
                    <Icon size={22} />
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

function PendingActionsCard({ refreshTick, onNavigate }) {
    const [count, setCount] = useState(null);
    const [breakdown, setBreakdown] = useState({ empanelment: 0, customers: 0, giftCity: 0 });
    const [loading, setLoading] = useState(true);

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
                const e = Array.isArray(empPend) ? empPend.length : 0;
                const c = Array.isArray(custPend) ? custPend.length : 0;
                const g = Array.isArray(giftPend) ? giftPend.length : 0;
                setBreakdown({ empanelment: e, customers: c, giftCity: g });
                setCount(e + c + g);
            } catch { if (!cancelled) setCount(0); }
            finally { if (!cancelled) setLoading(false); }
        })();
        return () => { cancelled = true; };
    }, [refreshTick]);

    return (
        <div className="side-card side-card-red">
            <div className="side-card-header">
                <div className="side-card-icon-wrap side-card-icon-red"><IcoAlert size={16} /></div>
                <span className="side-card-label">Pending Actions</span>
                {loading ? <div className="sc-skel" style={{ width: 36, height: 28, marginLeft: "auto", borderRadius: 6 }} />
                    : <span className="side-card-count" style={{ color: "#b02020" }}>{count}</span>}
            </div>
            <div className="side-card-divider" />
            <div className="side-card-rows">
                {[
                    { lbl: "Empanelment", val: breakdown.empanelment, color: "#2a6dd9", page: "empanelment", tab: "pending" },
                    { lbl: "Clients", val: breakdown.customers, color: "#0f9e6e", page: "invested", tab: "pending" },
                    { lbl: "Gift A/C", val: breakdown.giftCity, color: "#c97c08", page: "giftcity", tab: "inactive" },
                ].map(({ lbl, val, color, page, tab }) => (
                    <div className="side-card-row pending-nav-row" key={lbl} onClick={() => onNavigate?.(page, tab)} style={{ cursor: "pointer" }}>
                        <span className="side-card-row-dot" style={{ background: color }} />
                        <span className="side-card-row-lbl">{lbl}</span>
                        <span className="side-card-row-val" style={{ color }}>{loading ? "…" : val}</span>
                        <span style={{ color: "rgba(10,45,120,0.25)", fontSize: ".7rem", marginLeft: 2 }}>›</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function UpcomingMeetingsCard({ refreshTick, onNavigate }) {
    const [allMeetings, setAllMeetings] = useState([]);
    const [total, setTotal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);
    const PREVIEW = 3;

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true); setExpanded(false);
            try {
                const data = await fetch(`${API}/interested`).then(r => r.json());
                if (cancelled) return;
                const rows = Array.isArray(data) ? data : [];
                const now = new Date(); now.setHours(0, 0, 0, 0);
                const upcoming = rows
                    .filter(r => r.next_action_date && new Date(r.next_action_date) >= now)
                    .sort((a, b) => new Date(a.next_action_date) - new Date(b.next_action_date));
                setTotal(upcoming.length); setAllMeetings(upcoming);
            } catch { if (!cancelled) { setTotal(0); setAllMeetings([]); } }
            finally { if (!cancelled) setLoading(false); }
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
        if (diff === 0) return { bg: "rgba(15,158,110,0.14)", color: "#0a7a56", border: "rgba(15,158,110,0.28)" };
        if (diff <= 3) return { bg: "rgba(201,124,8,0.14)", color: "#845004", border: "rgba(201,124,8,0.28)" };
        return { bg: "rgba(42,109,217,0.12)", color: "#1a50b5", border: "rgba(42,109,217,0.26)" };
    };

    const visible = expanded ? allMeetings : allMeetings.slice(0, PREVIEW);
    const remaining = (total ?? 0) - PREVIEW;

    return (
        <div className="side-card side-card-purple">
            <div className="side-card-header">
                <div className="side-card-icon-wrap side-card-icon-purple"><IcoCalendar size={16} /></div>
                <span className="side-card-label" onClick={() => onNavigate?.()} style={{ cursor: "pointer", textDecoration: "underline dotted", textUnderlineOffset: 3 }}>
                    Upcoming Meetings
                </span>
                {loading ? <div className="sc-skel" style={{ width: 36, height: 28, marginLeft: "auto", borderRadius: 6 }} />
                    : <span className="side-card-count" style={{ color: "#4e30a0" }}>{total}</span>}
            </div>
            <div className="side-card-divider" />
            <div className="side-card-rows">
                {loading ? [1, 2, 3].map(i => <div key={i} className="sc-skel" style={{ width: "100%", height: 22, borderRadius: 6, marginBottom: 4 }} />) :
                    allMeetings.length === 0 ? (
                        <div style={{ color: "rgba(10,45,120,0.4)", fontSize: ".71rem", textAlign: "center", padding: "8px 0", fontStyle: "italic" }}>No upcoming meetings</div>
                    ) : (
                        <>
                            {visible.map((m, i) => {
                                const diff = daysDiff(m.next_action_date);
                                const chip = chipColor(diff);
                                return (
                                    <div key={m.id ?? i} className="side-card-row" style={{ alignItems: "center" }}>
                                        <span className="side-card-row-lbl" style={{ overflow: "hidden", textOverflow: "ellipsis", maxWidth: 95, whiteSpace: "nowrap" }} title={m.client_name}>
                                            {m.client_name || "—"}
                                        </span>
                                        <span style={{ fontSize: ".63rem", fontWeight: 700, padding: "2px 6px", borderRadius: 20, background: chip.bg, color: chip.color, border: `1px solid ${chip.border}`, whiteSpace: "nowrap", marginLeft: "auto", flexShrink: 0 }}>
                                            {fmtShort(m.next_action_date)}
                                        </span>
                                    </div>
                                );
                            })}
                            {remaining > 0 && !expanded && (
                                <button onClick={() => setExpanded(true)} style={{ marginTop: 6, width: "100%", background: "rgba(100,72,195,0.08)", border: "1px dashed rgba(100,72,195,0.3)", borderRadius: 8, color: "#4e30a0", fontSize: ".69rem", fontWeight: 700, padding: "5px 0", cursor: "pointer", fontFamily: "inherit", letterSpacing: ".03em" }}>
                                    +{remaining} more
                                </button>
                            )}
                            {expanded && (
                                <button onClick={() => setExpanded(false)} style={{ marginTop: 6, width: "100%", background: "rgba(100,72,195,0.04)", border: "1px dashed rgba(100,72,195,0.2)", borderRadius: 8, color: "rgba(100,72,195,0.55)", fontSize: ".67rem", fontWeight: 600, padding: "4px 0", cursor: "pointer", fontFamily: "inherit" }}>
                                    Show less ↑
                                </button>
                            )}
                        </>
                    )}
            </div>
        </div>
    );
}

export default function DashboardLight() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const [selected, setSelected] = useState(null);
    const [headerCounts, setHeaderCounts] = useState({});
    const [headerLoading, setHeaderLoading] = useState(true);
    const [refreshTick, setRefreshTick] = useState(0);
    const [sideOpen, setSideOpen] = useState(false);
    const [initialTab, setInitialTab] = useState(null);

    useEffect(() => {
        document.body.style.background = `url('/gift-city-light-back.jpeg') center/cover no-repeat fixed`;
    }, []);

    useEffect(() => {
        (async () => {
            setHeaderLoading(true);
            try { const d = await fetch(`${API}/count/all`).then(r => r.json()); setHeaderCounts(d); } catch { }
            finally { setHeaderLoading(false); }
        })();
    }, [refreshTick]);

    const refreshCounts = () => setRefreshTick(t => t + 1);
    const handleLogout = () => { localStorage.removeItem("user"); navigate("/login"); };

    const renderContent = () => {
        if (selected === "empanelment") return <Empanelment key={initialTab} inline onDataChange={refreshCounts} initialTab={initialTab} theme="light" />;
        if (selected === "invested") return <Invested key={initialTab} inline onDataChange={refreshCounts} initialTab={initialTab} theme="light" />;
        if (selected === "interested") return <Interested inline onDataChange={refreshCounts} theme="light" />;
        if (selected === "giftcity") return <GiftCity key={initialTab} inline onDataChange={refreshCounts} initialTab={initialTab} theme="light" />;
        if (selected === "customers") return <Customers inline onDataChange={refreshCounts} theme="light" />;
        if (selected === "products") return <Products inline onDataChange={refreshCounts} theme="light" />;
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
                            <div className="theme-toggle-wrap">
                                <span className="theme-toggle-ico">🌙</span>
                                <label className="theme-switch" title="Switch to dark mode">
                                    <input type="checkbox" checked={true} onChange={() => navigate("/dashboard")} />
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
                            {/* ── Stats ── */}
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
                                        <AMCTable key={refreshTick} onDataChange={refreshCounts} theme="light" />
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

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blue:#2a6dd9;--green:#0f9e6e;--gold:#c97c08;--purple:#6b4ec6;--red:#b02020;
  --muted:rgba(0,0,0,0.5);--side-w:210px;--hdr-h:64px;
  --spring:cubic-bezier(0.34,1.56,0.64,1);--smooth:cubic-bezier(0.4,0,0.2,1);
  --fh:'Inter',sans-serif;--fb:'Inter',sans-serif;
}
html,body{margin:0;padding:0;min-height:100%;overflow-x:hidden}
body{font-family:var(--fb);background:transparent;color:#111827;padding:12px;box-sizing:border-box}
button{font-family:var(--fb)}

/* ── ROOT LAYOUT ── */
.root{
  min-height:100vh;
  display:flex;
  align-items:stretch;
  background:transparent;
  box-sizing:border-box;
  overflow:hidden;        /* ← prevents horizontal scroll at root */
}
.page-card{
  display:flex;
  flex:1;
  min-width:0;            /* ← KEY: allows flex children to shrink */
  gap:10px;
  align-items:stretch;
  border-radius:20px;
  border:1px solid rgba(10,30,100,0.35);
  box-shadow:0 0 40px rgba(10,30,100,0.1);
  padding:10px;
  background:transparent;
  overflow:hidden;        /* ← clips anything that bleeds out */
  width:100%;
}

/* ── SIDEBAR ── */
.side{
  width:var(--side-w);
  flex-shrink:0;
  background:transparent;
  border:1px solid rgba(10,30,100,0.3);
  border-radius:20px;
  box-shadow:0 0 20px rgba(10,30,100,0.08);
  display:flex;
  flex-direction:column;
  z-index:300;
  transition:transform .4s var(--spring);
  position:relative;
  overflow:hidden;
}
.side-overlay{position:fixed;inset:0;z-index:299;background:rgba(0,0,0,0.3);backdrop-filter:blur(4px)}
.side-logo{padding:20px 14px 18px;border-bottom:1px solid rgba(10,30,100,0.2)}
.logo-box{border:1.5px solid rgba(10,30,100,0.4);border-radius:12px;padding:14px 12px;display:flex;flex-direction:column;align-items:center;background:rgba(135,206,250,0.22);backdrop-filter:blur(12px);box-shadow:0 2px 12px rgba(10,30,100,0.08),inset 0 1px 0 rgba(255,255,255,0.5)}
.logo-words{display:flex;flex-direction:column;align-items:center;width:100%;gap:3px}
.logo-main{font-weight:800;font-size:.85rem;color:#111827;letter-spacing:.1em;text-align:center;line-height:1.3;word-break:break-word}
.logo-est{font-size:.63rem;color:rgba(0,0,0,0.55);letter-spacing:.16em;text-align:center;text-transform:uppercase;margin-top:2px}
.side-nav{flex:1;padding:18px 10px;display:flex;flex-direction:column;gap:2px;overflow-y:auto}
.nav-btn{width:100%;display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:10px;border:1px solid transparent;background:transparent;cursor:pointer;color:rgba(0,0,0,0.65);font-size:.88rem;font-weight:500;transition:all .22s var(--smooth);text-align:left;letter-spacing:.01em}
.nav-btn:hover{color:#000;background:rgba(10,30,100,0.06);border-color:rgba(10,30,100,0.15)}
.nav-active{color:#000!important;background:rgba(10,30,100,0.08)!important;border-color:rgba(10,30,100,0.2)!important;box-shadow:none;position:relative}
.nav-active::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;border-radius:0 2px 2px 0;background:linear-gradient(180deg,#2a6dd9,#6b4ec6)}
.nav-ico{display:flex;align-items:center;flex-shrink:0}
.nav-lbl{font-weight:600;font-size:.72rem;letter-spacing:.04em}
.logout-card{margin:8px 0 16px;padding:6px;border-radius:12px;border:1px solid rgba(10,30,100,0.2);background:transparent;transition:transform .28s var(--spring),box-shadow .28s}
.logout-card:hover{transform:scale(1.06) translateY(-3px);box-shadow:0 8px 24px rgba(10,30,100,0.12);border-color:rgba(10,30,100,0.35)}
.logout-nav{width:100%;margin-bottom:0}
.logout-nav:hover{color:#000!important;background:transparent!important;border-color:transparent!important}

/* ── MAIN — THE KEY FIX ── */
.main{
  flex:1;
  min-width:0;            /* ← CRITICAL: without this, main ignores flex shrink */
  display:flex;
  flex-direction:column;
  position:relative;
  z-index:1;
  background:transparent;
  border-radius:20px;
  overflow:hidden;
}
.topbar{
  height:var(--hdr-h);
  display:flex;
  align-items:center;
  padding:0 12px;
  gap:8px;
  background:transparent;
  position:sticky;
  top:0;
  z-index:200;
  min-width:0;
  overflow:hidden;        /* topbar itself must not overflow */
}
.menu-btn{display:none;background:none;border:none;color:#111827;cursor:pointer;padding:5px;border-radius:7px;flex-shrink:0}
.topbar-title{
  flex:1;
  min-width:0;
  font-weight:800;
  font-size:1.1rem;
  color:#111827;
  letter-spacing:.06em;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}
.user-chip{display:flex;align-items:center;gap:8px;padding:4px 12px 4px 4px;background:transparent;border:1px solid rgba(10,30,100,0.25);border-radius:40px;flex-shrink:0}
.user-av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#2a6dd9,#6b4ec6);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;color:#fff}
.user-name{font-size:.8rem;font-weight:700;color:#111827;letter-spacing:.02em;white-space:nowrap}

/* ── CONTENT ── */
.content{
  flex:1;
  padding:0 12px 24px;
  display:flex;
  flex-direction:column;
  gap:14px;
  min-width:0;
  overflow:hidden;
}

/* ── STATS ── */
.stats-card{
  border:1px solid rgba(10,30,100,0.28);
  border-radius:20px;
  padding:12px;
  background:rgba(135,206,250,0.18);
  width:100%;
  box-sizing:border-box;
}
.stats-row{
  display:grid;
  grid-template-columns:repeat(4,1fr);  /* 4 equal columns */
  gap:10px;
  width:100%;
}

/* ── STAT CARD ── */
.sc{
  position:relative;
  overflow:hidden;
  border-radius:14px;
  border:1px solid rgba(10,30,100,0.28);
  padding:10px 12px;
  background:rgba(135,206,250,0.22)!important;
  backdrop-filter:blur(12px);
  box-shadow:0 2px 12px rgba(10,30,100,0.08),inset 0 1px 0 rgba(255,255,255,0.5);
  transition:transform .35s var(--spring),box-shadow .35s;
  cursor:default;
  min-width:0;             /* ← allows card to shrink */
}
.sc:hover{transform:translateY(-4px) scale(1.015);box-shadow:0 10px 28px rgba(10,30,100,0.15)}
.sc-body{position:relative;z-index:1;display:flex;align-items:center;gap:8px;min-width:0}
.sc-icon{width:36px;height:36px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--accent);border:1.5px solid rgba(10,30,100,0.15)}
.sc-text{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}
.sc-label{font-size:.5rem;font-weight:700;letter-spacing:.05em;color:rgba(0,0,0,0.65);white-space:normal;word-break:break-word;text-transform:uppercase;line-height:1.3}
.sc-ratio{display:flex;align-items:baseline;gap:2px;flex-wrap:wrap}
.sc-big{font-size:1.55rem;font-weight:800;line-height:1;color:#111827}
.sc-slash{font-size:.85rem;color:rgba(0,0,0,0.45)}
.sc-tot{font-size:.85rem;color:rgba(0,0,0,0.55)}
.sc-single{font-size:1.75rem;font-weight:800;line-height:1;color:#111827}
.sc-sub{font-size:.55rem;color:var(--accent);margin-top:2px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sc-skel{height:24px;width:60px;border-radius:6px;background:rgba(10,30,100,0.08);animation:sk 1.4s infinite}
@keyframes sk{0%,100%{opacity:.4}50%{opacity:.8}}

/* ── DASHBOARD BOTTOM ── */
.dashboard-bottom{display:flex;gap:12px;align-items:flex-start;min-width:0}
.amc-table-col{flex:1;min-width:0;overflow:hidden}
.side-cards-col{display:flex;flex-direction:column;gap:12px;width:190px;flex-shrink:0}

/* ── SIDE CARDS ── */
.side-card{border-radius:16px;border:1px solid rgba(10,30,100,0.28);padding:14px 12px 12px;display:flex;flex-direction:column;background:transparent;animation:pIn .38s var(--spring) both;transition:transform .28s var(--spring),box-shadow .28s;position:relative;overflow:hidden}
.side-card-red{border-color:rgba(10,30,100,0.35)}
.side-card-purple{border-color:rgba(10,30,100,0.35)}
.side-card:hover{transform:translateY(-3px) scale(1.01);box-shadow:0 8px 24px rgba(10,30,100,0.1)}
.side-card-header{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.side-card-icon-wrap{width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.side-card-icon-red{background:rgba(180,50,50,0.1);color:#b02020;border:1px solid rgba(10,30,100,0.2)}
.side-card-icon-purple{background:rgba(90,62,185,0.1);color:#4e30a0;border:1px solid rgba(10,30,100,0.2)}
.side-card-label{font-size:.48rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(0,0,0,0.6);line-height:1.2;flex:1;min-width:0}
.side-card-count{font-size:1.35rem;font-weight:800;line-height:1;margin-left:auto;flex-shrink:0}
.side-card-divider{height:1px;background:rgba(10,30,100,0.15);margin:0 0 9px;border-radius:1px}
.side-card-rows{display:flex;flex-direction:column;gap:6px}
.side-card-row{display:flex;align-items:center;gap:6px;font-size:.71rem}
.side-card-row-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.side-card-row-lbl{color:rgba(0,0,0,0.6);flex:1;font-weight:500;font-size:.68rem;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.side-card-row-val{font-weight:800;font-size:.76rem;flex-shrink:0}
.pending-nav-row{border-radius:7px;padding:3px 5px;margin:0 -5px;transition:background .18s,transform .15s}
.pending-nav-row:hover{background:rgba(10,30,100,0.06);transform:translateX(2px)}

/* ── MODULE PANEL ── */
.module-panel{
  background:transparent;
  border:1px solid rgba(10,30,100,0.28);
  border-radius:18px;
  overflow:hidden;          /* ← clips table overflow inside panel */
  box-shadow:none;
  animation:pIn .38s var(--spring) both;
  min-width:0;
  width:100%;
}
@keyframes pIn{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}

/* ── TABLE SHARED ── */
.mod-wrap{min-height:200px;width:100%;min-width:0}
.mod-hdr{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:12px 16px;border-bottom:1px solid rgba(10,30,100,0.15)}
.tabs-row{display:flex;gap:6px;flex-wrap:wrap}
.tab-pill{padding:6px 16px;border-radius:50px;border:1px solid rgba(10,30,100,0.2);background:transparent;color:rgba(0,0,0,0.6);font-size:.8rem;font-weight:600;cursor:pointer;font-family:var(--fh);transition:all .28s var(--spring);white-space:nowrap;letter-spacing:.04em}
.tab-pill:hover{color:#000;border-color:rgba(10,30,100,0.35);background:rgba(10,30,100,0.05)}
.tab-active{background:rgba(42,109,217,0.12)!important;color:#000!important;border-color:rgba(42,109,217,0.4)!important;transform:translateY(-1px)}
.tbl-hdr{display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid rgba(10,30,100,0.15);flex-wrap:wrap}
.tbl-title{font-weight:800;font-size:.95rem;color:#111827;letter-spacing:.06em}
.tbl-badge{padding:3px 10px;border-radius:20px;font-size:.65rem;font-weight:700;background:rgba(42,109,217,0.1);color:#1a50b5;border:1px solid rgba(42,109,217,0.25)}

/* ── TABLE SCROLL — THE KEY FIX ── */
.tbl-wrap{
  overflow-x:auto;         /* horizontal scroll when needed */
  -webkit-overflow-scrolling:touch;
  width:100%;
}
.tbl-wrap::-webkit-scrollbar{height:4px}
.tbl-wrap::-webkit-scrollbar-track{background:rgba(10,30,100,0.04)}
.tbl-wrap::-webkit-scrollbar-thumb{background:rgba(42,109,217,0.3);border-radius:4px}

.fd-tbl{width:100%;border-collapse:collapse;font-size:.83rem;min-width:600px}
.fd-tbl thead tr{background:rgba(10,30,100,0.05)}
.fd-tbl th{padding:11px 14px;text-align:left;font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(0,0,0,0.6);border-bottom:1px solid rgba(10,30,100,0.25);white-space:nowrap}
.fd-tbl tbody tr{background:transparent;transition:background .18s;animation:rIn .32s ease both}
.fd-tbl tbody tr:nth-child(even){background:rgba(10,30,100,0.03)}
.fd-tbl tbody tr:nth-child(1){animation-delay:.03s}.fd-tbl tbody tr:nth-child(2){animation-delay:.06s}.fd-tbl tbody tr:nth-child(3){animation-delay:.09s}.fd-tbl tbody tr:nth-child(4){animation-delay:.12s}.fd-tbl tbody tr:nth-child(5){animation-delay:.15s}
@keyframes rIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
.fd-tbl tbody tr:hover{background:rgba(10,30,100,0.05)!important}
.fd-tbl tbody tr:last-child td{border-bottom:none}
.fd-tbl td{padding:8px 14px;color:#111827;border-bottom:1px solid rgba(10,30,100,0.15);vertical-align:middle;white-space:nowrap;background:transparent;font-size:.84rem}
.fd-num{color:rgba(0,0,0,0.4);font-size:.74rem}
.fd-empty{text-align:center;padding:48px 20px!important;color:rgba(0,0,0,0.4);font-style:italic;font-size:.84rem}
.act-cell{display:flex;gap:5px;align-items:center;justify-content:center}
.ab{width:28px;height:28px;border-radius:8px;border:1px solid transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .22s var(--spring);flex-shrink:0}
.ab:hover{transform:scale(1.15) translateY(-2px)}
.ab-del{background:rgba(180,50,50,0.1);color:#9a2020;border-color:rgba(180,50,50,0.18)}.ab-del:hover{background:#d14040;color:#fff;box-shadow:0 4px 14px rgba(180,50,50,0.4)}
.ab-edit{background:rgba(42,109,217,0.1);color:#1a50b5;border-color:rgba(42,109,217,0.18)}.ab-edit:hover{background:#2a6dd9;color:#fff;box-shadow:0 4px 14px rgba(42,109,217,0.4)}
.ab-dl{background:rgba(14,165,155,0.1);color:#0a7a72;border-color:rgba(14,165,155,0.18)}.ab-dl:hover{background:#0ea59b;color:#fff;box-shadow:0 4px 14px rgba(14,165,155,0.36)}
.ab-promo{background:rgba(190,115,8,0.1);color:#845004;border-color:rgba(190,115,8,0.18)}.ab-promo:hover{background:#c97c08;color:#fff;box-shadow:0 4px 14px rgba(190,115,8,0.36)}
.ab-view{background:rgba(90,62,185,0.1);color:#4e30a0;border-color:rgba(90,62,185,0.18)}.ab-view:hover{background:#6b4ec6;color:#fff;box-shadow:0 4px 14px rgba(90,62,185,0.36)}
.add-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:none;cursor:pointer;color:#fff;font-size:.78rem;font-weight:700;background:linear-gradient(135deg,#2a6dd9,#5a3fb5);box-shadow:0 4px 14px rgba(42,109,217,0.32);transition:all .28s var(--spring);white-space:nowrap;flex-shrink:0}
.add-btn:hover{transform:translateY(-2px);filter:brightness(1.1);box-shadow:0 6px 20px rgba(42,109,217,0.42)}
.chip{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:.71rem;font-weight:700}
.chip-yes{background:rgba(15,158,110,0.12);color:#076642;border:1px solid rgba(15,158,110,0.25)}
.chip-no{background:rgba(180,50,50,0.09);color:#7a1a1a;border:1px solid rgba(180,50,50,0.2)}
.fd-spin{display:flex;justify-content:center;align-items:center;padding:56px}
.spinner{width:28px;height:28px;border-radius:50%;border:3px solid rgba(42,109,217,0.18);border-top-color:#2a6dd9;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

/* ── DIALOG ── */
.dlg-ov{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,0.35);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;animation:fIn .18s ease;box-sizing:border-box}
@keyframes fIn{from{opacity:0}to{opacity:1}}
.dlg-box{background:rgba(255,255,255,0.75);backdrop-filter:blur(40px) saturate(180%);border:1px solid rgba(10,30,100,0.2);border-radius:18px;width:100%;max-width:min(450px,calc(100vw - 32px));overflow:hidden;box-shadow:0 8px 40px rgba(10,30,100,0.15);animation:dPop .32s var(--spring);box-sizing:border-box}
@keyframes dPop{from{opacity:0;transform:scale(.88) translateY(22px)}to{opacity:1;transform:none}}
.dlg-hdr{padding:16px 20px 12px;border-bottom:1px solid rgba(10,30,100,0.12);display:flex;align-items:center;gap:11px;background:rgba(135,206,250,0.15)}
.dlg-bar{width:4px;height:22px;border-radius:2px;flex-shrink:0}
.dlg-ttl{font-weight:800;font-size:.95rem;color:#111827}
.dlg-sub{font-size:.67rem;color:rgba(0,0,0,0.5);margin-top:2px}
.dlg-body{padding:16px 20px;display:flex;flex-direction:column;gap:12px;max-height:55vh;overflow-y:auto;background:transparent}
.dlg-foot{padding:12px 20px;border-top:1px solid rgba(10,30,100,0.12);display:flex;justify-content:flex-end;gap:8px;background:transparent}
.fld{display:flex;flex-direction:column;gap:6px}
.fld-lbl{font-size:.67rem;font-weight:700;color:rgba(0,0,0,0.65);letter-spacing:.08em;text-transform:uppercase}
.fld-inp{width:100%;padding:9px 12px;border-radius:10px;background:rgba(255,255,255,0.6);border:1px solid rgba(10,30,100,0.2);color:#111827;font-size:.84rem;font-family:var(--fb);transition:border-color .2s,box-shadow .2s;outline:none;box-sizing:border-box}
.fld-inp:focus{border-color:#2a6dd9;box-shadow:0 0 0 3px rgba(42,109,217,0.12)}
.fld-inp option{background:#fff;color:#111827}
.fld-hi{border-color:#c97c08!important}
.fld-note{font-size:.66rem;margin-top:2px;color:rgba(0,0,0,0.5)}
.btn-cancel{padding:8px 14px;border-radius:10px;border:1px solid rgba(10,30,100,0.2);background:none;color:rgba(0,0,0,0.65);cursor:pointer;font-size:.8rem;font-weight:600;transition:all .2s}
.btn-cancel:hover{border-color:rgba(10,30,100,0.4);color:#000}
.btn-ok{padding:8px 16px;border-radius:10px;border:none;cursor:pointer;color:#fff;font-size:.8rem;font-weight:700;transition:all .25s var(--spring)}
.btn-ok:hover{transform:translateY(-1px);filter:brightness(1.1)}
.btn-ok:disabled{opacity:.6;cursor:not-allowed}
.btn-primary{background:linear-gradient(135deg,#2a6dd9,#5a3fb5);box-shadow:0 4px 16px rgba(42,109,217,0.35)}
.btn-success{background:linear-gradient(135deg,#0f9e6e,#057a52);box-shadow:0 4px 16px rgba(15,158,110,0.3)}
.btn-danger{background:linear-gradient(135deg,#d14040,#a82424);box-shadow:0 4px 16px rgba(180,50,50,0.3)}
.snack{position:fixed;bottom:22px;right:22px;z-index:2000;padding:11px 18px;border-radius:12px;font-size:.84rem;font-weight:600;box-shadow:0 8px 30px rgba(0,0,0,0.2);animation:snkIn .32s var(--spring)}
@keyframes snkIn{from{opacity:0;transform:translateY(16px) scale(.9)}to{opacity:1;transform:none}}
.snack-success{background:linear-gradient(135deg,#057a52,#0f9e6e);color:#fff}
.snack-error{background:linear-gradient(135deg,#a82424,#d14040);color:#fff}

/* ── THEME TOGGLE ── */
.theme-toggle-wrap{display:flex;align-items:center;gap:6px;flex-shrink:0}
.theme-toggle-ico{font-size:.85rem;line-height:1;user-select:none;pointer-events:none;opacity:.8}
.theme-switch{position:relative;width:42px;height:23px;cursor:pointer;flex-shrink:0}
.theme-switch input{opacity:0;width:0;height:0;position:absolute}
.theme-switch-track{position:absolute;inset:0;border-radius:99px;background:rgba(130,195,255,0.55);border:1px solid rgba(70,155,230,0.65);box-shadow:inset 0 1px 3px rgba(0,0,0,0.1)}
.theme-switch-thumb{position:absolute;top:3px;left:3px;width:15px;height:15px;border-radius:50%;background:linear-gradient(135deg,#f7d46a,#ffb020);box-shadow:0 1px 6px rgba(200,140,0,0.5);transition:transform .3s var(--spring);transform:translateX(19px)}
.theme-switch input:not(:checked) ~ .theme-switch-track{background:rgba(30,60,180,0.4);border-color:rgba(80,140,230,0.5)}
.theme-switch input:not(:checked) ~ .theme-switch-thumb{transform:translateX(0);background:linear-gradient(135deg,#7eb3ff,#fff);box-shadow:0 1px 6px rgba(0,0,0,0.45)}

/* ── LIGHT THEME DIALOG OVERRIDES ── */
.theme-light .dlg-box{background:rgba(255,255,255,0.82)!important;border:1px solid rgba(10,30,100,0.2)!important}
.theme-light .dlg-hdr{border-bottom:1px solid rgba(10,30,100,0.12)!important;background:rgba(135,206,250,0.15)!important}
.theme-light .dlg-ttl{color:#111827!important}
.theme-light .fld-lbl{color:rgba(0,0,0,0.65)!important}
.theme-light .fld-inp{background:rgba(255,255,255,0.7)!important;border:1px solid rgba(10,30,100,0.2)!important;color:#111827!important}
.theme-light .fld-inp:focus{border-color:#2a6dd9!important;box-shadow:0 0 0 3px rgba(42,109,217,0.12)!important}
.theme-light .fld-inp option{background:#fff!important;color:#111827!important}
.theme-light .btn-cancel{border:1px solid rgba(10,30,100,0.2)!important;color:rgba(0,0,0,0.65)!important}

/* ═══════════════════════
   RESPONSIVE BREAKPOINTS
═══════════════════════ */

/* 4 → 2 columns when stats row gets tight */
@media(max-width:1024px){
  .stats-row{grid-template-columns:repeat(2,1fr)}
}

/* Tablet: sidebar hidden, menu button shown */
@media(max-width:768px){
  .root{padding:6px}
  .page-card{padding:6px;gap:6px}
  .side{
    position:fixed;
    top:6px;left:6px;bottom:6px;
    border-radius:20px;
    transform:translateX(calc(-100% - 20px));
    background:rgba(255,255,255,0.95);
    backdrop-filter:blur(24px);
  }
  .side-open{transform:translateX(0)}
  .menu-btn{display:flex}
  .stats-row{grid-template-columns:repeat(2,1fr);gap:8px}
  .content{padding:0 8px 16px}
  .topbar{padding:0 8px;gap:6px}
  .topbar-title{font-size:.95rem}
  .user-name{display:none}  /* hide name on mobile, keep avatar */
  .dashboard-bottom{flex-direction:column}
  .side-cards-col{width:100%;flex-direction:row}
  .side-card{flex:1}
  .module-panel{border-radius:14px}
}

/* Small phone */
@media(max-width:520px){
  .stats-row{grid-template-columns:1fr 1fr;gap:6px}
  .sc{padding:8px 10px}
  .sc-big{font-size:1.3rem}
  .sc-single{font-size:1.5rem}
  .sc-label{font-size:.48rem}
  .sc-icon{width:30px;height:30px}
  .fd-tbl th,.fd-tbl td{padding:8px 10px;font-size:.76rem}
  .topbar-title{font-size:.85rem}
}

/* Very small */
@media(max-width:400px){
  .stats-row{grid-template-columns:1fr}
  .side-cards-col{flex-direction:column}
  .dlg-box{border-radius:18px 18px 0 0;max-width:100%}
  .dlg-ov{align-items:flex-end;padding:0}
}

.amc-table-col .count,
.amc-table-col .clients-count,
.amc-table-col .clients-pending-count,
.amc-table-col .products-count,
.amc-table-col td span {
  color: #111827 !important; /* black/dark */
  font-weight: 600;
}
`;