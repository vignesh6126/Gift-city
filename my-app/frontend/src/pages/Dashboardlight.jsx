import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

const NAV = [
  { id: null,          label: "Dashboard",     Icon: IcoDashboard },
  { id: "empanelment", label: "Empanelment",   Icon: IcoEmpanel   },
  { id: "invested",    label: "Clients",       Icon: IcoClients   },
  { id: "interested",  label: "Prospects",     Icon: IcoProspects },
  { id: "giftcity",    label: "Gift City A/C", Icon: IcoGift      },
  { id: "customers",   label: "Customers",     Icon: IcoClients   },
  { id: "products",    label: "Products",      Icon: IcoProspects },
];

const STATS = [
  { key: "empanelment_done",     label: "Empanelment Done",     sub: "this month", Icon: IcoEmpanel,   iconBg: "rgba(42,109,217,0.15)",  accent: "#2a6dd9", type: "ratio"  },
  { key: "customers_onboarding", label: "Customers Onboarding", sub: "this week",  Icon: IcoClients,   iconBg: "rgba(15,158,110,0.15)",  accent: "#0f9e6e", type: "ratio"  },
  { key: "gift_city_ac_active",  label: "Gift City A/C",        sub: "prospects",  Icon: IcoGift,      iconBg: "rgba(201,124,8,0.15)",   accent: "#c97c08", type: "ratio"  },
  { key: "prospects_count",      label: "Prospects",            sub: "Prospects",  Icon: IcoProspects, iconBg: "rgba(107,78,198,0.15)",  accent: "#6b4ec6", type: "single" },
];

function StatCard({ cfg, data, loading }) {
  const { Icon } = cfg;
  const completed = data?.completed ?? 0;
  const total     = data?.total ?? 0;
  const single    = typeof data === "number" ? data : (data?.total ?? data?.count ?? data?.completed ?? 0);
  const isRatio   = cfg.type === "ratio";
  return (
    <div className="sc" style={{ "--accent": cfg.accent }}>
      <div className="sc-body">
        <div className="sc-icon" style={{ background: cfg.iconBg }}><Icon size={22} /></div>
        <div className="sc-text">
          <div className="sc-label">{cfg.label}</div>
          {loading ? <div className="sc-skel" /> : isRatio ? (
            <div className="sc-ratio">
              <span className="sc-big">{completed}</span>
              <span className="sc-slash"> / </span>
              <span className="sc-tot">{total}</span>
            </div>
          ) : <div className="sc-single">{single}</div>}
          {!loading && <div className="sc-sub">+ {isRatio ? completed : single} {cfg.sub}</div>}
        </div>
      </div>
    </div>
  );
}

function PendingActionsCard({ refreshTick, onNavigate }) {
  const [count,     setCount]     = useState(null);
  const [breakdown, setBreakdown] = useState({ empanelment: 0, customers: 0, giftCity: 0 });
  const [loading,   setLoading]   = useState(true);

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
          : <span className="side-card-count" style={{ color: "#b02020" }}>{count}</span>}
      </div>
      <div className="side-card-divider" />
      <div className="side-card-rows">
        {[
          { lbl: "Empanelment", val: breakdown.empanelment, color: "#2a6dd9", page: "empanelment", tab: "pending"  },
          { lbl: "Clients",     val: breakdown.customers,   color: "#0f9e6e", page: "invested",    tab: "pending"  },
          { lbl: "Gift A/C",    val: breakdown.giftCity,    color: "#c97c08", page: "giftcity",    tab: "inactive" },
        ].map(({ lbl, val, color, page, tab }) => (
          <div className="side-card-row pending-nav-row" key={lbl}
            onClick={() => onNavigate?.(page, tab)} style={{ cursor: "pointer" }}>
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

function MeetingsModal({ meetings, onClose, theme }) {
  const isDark = theme !== "light";

  const fmtDate = d => {
    if (!d) return "—";
    const dt = new Date(d), today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((dt - today) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };
  const daysDiff = d => {
    if (!d) return null;
    const dt = new Date(d), today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((dt - today) / 86400000);
  };
  const chipStyle = diff => {
    if (isDark) {
      if (diff === 0) return { bg: "rgba(52,211,153,0.18)",  color: "#34D399", border: "rgba(52,211,153,0.3)"  };
      if (diff <= 3)  return { bg: "rgba(245,158,11,0.18)",  color: "#F59E0B", border: "rgba(245,158,11,0.3)"  };
      return              { bg: "rgba(79,142,247,0.14)",  color: "#4F8EF7", border: "rgba(79,142,247,0.28)" };
    } else {
      if (diff === 0) return { bg: "rgba(15,158,110,0.14)", color: "#0a7a56", border: "rgba(15,158,110,0.28)" };
      if (diff <= 3)  return { bg: "rgba(201,124,8,0.14)",  color: "#845004", border: "rgba(201,124,8,0.28)"  };
      return              { bg: "rgba(42,109,217,0.12)",  color: "#1a50b5", border: "rgba(42,109,217,0.26)" };
    }
  };
  const sourceBadge = src => {
    if (isDark) {
      return src === "prospect"
        ? { bg: "rgba(230,126,34,0.15)", color: "#E67E22", border: "rgba(230,126,34,0.3)"   }
        : { bg: "rgba(100,181,246,0.12)", color: "#64B5F6", border: "rgba(100,181,246,0.28)" };
    } else {
      return src === "prospect"
        ? { bg: "rgba(201,124,8,0.12)",  color: "#845004", border: "rgba(201,124,8,0.28)"  }
        : { bg: "rgba(42,109,217,0.1)",  color: "#1a50b5", border: "rgba(42,109,217,0.25)" };
    }
  };

  const overlayBg   = isDark ? "rgba(0,0,10,0.72)"        : "rgba(10,20,80,0.35)";
  const boxBg       = isDark ? "rgba(7,9,30,0.97)"         : "rgba(255,255,255,0.97)";
  const boxBorder   = isDark ? "rgba(79,142,247,0.48)"     : "rgba(42,109,217,0.22)";
  const boxShadow   = isDark ? "0 8px 48px rgba(0,0,0,0.65),inset 0 1px 0 rgba(255,255,255,0.07)" : "0 8px 40px rgba(10,30,100,0.18)";
  const hdrBg       = isDark ? "rgba(79,142,247,0.05)"     : "rgba(42,109,217,0.06)";
  const hdrBdr      = isDark ? "rgba(79,142,247,0.18)"     : "rgba(42,109,217,0.15)";
  const accentBar   = isDark ? "linear-gradient(180deg,#4F8EF7,#A78BFA)" : "#2a6dd9";
  const titleClr    = isDark ? "#fff"                      : "#111827";
  const subClr      = isDark ? "rgba(180,210,255,0.5)"     : "rgba(0,0,0,0.5)";
  const badgeBg     = isDark ? "rgba(167,139,250,0.15)"    : "rgba(100,72,195,0.1)";
  const badgeClr    = isDark ? "#A78BFA"                   : "#4e30a0";
  const badgeBdr    = isDark ? "rgba(167,139,250,0.3)"     : "rgba(100,72,195,0.25)";
  const closeBg     = isDark ? "rgba(79,142,247,0.12)"     : "rgba(42,109,217,0.1)";
  const closeBdr    = isDark ? "rgba(79,142,247,0.28)"     : "rgba(42,109,217,0.2)";
  const closeClr    = isDark ? "rgba(180,210,255,0.8)"     : "rgba(0,0,0,0.6)";
  const legendBg    = isDark ? "rgba(0,0,0,0.18)"          : "rgba(0,0,0,0.02)";
  const rowBdr      = isDark ? "rgba(79,142,247,0.09)"     : "rgba(10,30,100,0.1)";
  const rowHoverBg  = isDark ? "rgba(79,142,247,0.07)"     : "rgba(42,109,217,0.05)";
  const numClr      = isDark ? "rgba(130,160,255,0.35)"    : "rgba(0,0,0,0.3)";
  const nameClr     = isDark ? "rgba(220,235,255,0.9)"     : "#111827";
  const emptyClr    = isDark ? "rgba(160,190,255,0.4)"     : "rgba(0,0,0,0.4)";
  const scrollThumb = isDark ? "rgba(79,142,247,0.28)"     : "rgba(42,109,217,0.2)";
  const srcDot = src => src === "prospect"
    ? (isDark ? "#E67E22" : "#c97c08")
    : (isDark ? "#64B5F6" : "#2a6dd9");

  return createPortal(
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position:"fixed",inset:0,zIndex:99999,background:overlayBg,
      backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)",
      display:"flex",alignItems:"center",justifyContent:"center",
      padding:16,boxSizing:"border-box",overflowY:"auto",animation:"umFadeIn .2s ease",
    }}>
      <style>{`
        @keyframes umFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes umSlideIn { from{opacity:0;transform:translateY(20px) scale(.96)} to{opacity:1;transform:none} }
        .um-row:hover  { background: ${rowHoverBg} !important; }
        .um-close:hover { background: ${isDark ? "rgba(79,142,247,0.25)" : "rgba(42,109,217,0.18)"} !important; color:${isDark ? "#fff" : "#000"} !important; }
        .um-scroll::-webkit-scrollbar { width:4px; }
        .um-scroll::-webkit-scrollbar-thumb { background:${scrollThumb}; border-radius:4px; }
        .um-foot-btn:hover { border-color:${isDark ? "#4F8EF7" : "#2a6dd9"} !important; color:${isDark ? "#4F8EF7" : "#2a6dd9"} !important; }
      `}</style>
      <div className="um-scroll" style={{
        background:boxBg,backdropFilter:"blur(48px) saturate(180%)",WebkitBackdropFilter:"blur(48px) saturate(180%)",
        border:`1px solid ${boxBorder}`,borderRadius:22,boxShadow:boxShadow,
        width:"100%",maxWidth:"min(540px, calc(100vw - 32px))",maxHeight:"calc(100vh - 48px)",
        display:"flex",flexDirection:"column",animation:"umSlideIn .32s cubic-bezier(0.34,1.56,0.64,1)",
        boxSizing:"border-box",overflow:"hidden",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"18px 22px 15px",borderBottom:`1px solid ${hdrBdr}`,background:hdrBg,flexShrink:0}}>
          <div style={{width:4,height:26,borderRadius:2,background:accentBar,flexShrink:0}}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:800,fontSize:"1rem",color:titleClr,letterSpacing:".02em",fontFamily:"'Inter',sans-serif"}}>Upcoming Meetings</div>
            <div style={{fontSize:".7rem",color:subClr,marginTop:3,fontFamily:"'Inter',sans-serif"}}>Prospects &amp; Pending Clients · sorted by nearest date</div>
          </div>
          <div style={{padding:"3px 12px",borderRadius:20,background:badgeBg,border:`1px solid ${badgeBdr}`,color:badgeClr,fontSize:".72rem",fontWeight:700,fontFamily:"'Inter',sans-serif",flexShrink:0}}>{meetings.length} total</div>
          <button className="um-close" onClick={onClose} style={{background:closeBg,border:`1px solid ${closeBdr}`,borderRadius:9,width:32,height:32,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:closeClr,fontSize:"1.15rem",fontWeight:700,transition:"all .18s",flexShrink:0,lineHeight:1}}>×</button>
        </div>
        <div style={{display:"flex",gap:10,padding:"10px 22px",borderBottom:`1px solid ${hdrBdr}`,background:legendBg,flexShrink:0,flexWrap:"wrap",alignItems:"center"}}>
          {[{src:"prospect",label:"Prospect"},{src:"pending",label:"Pending Client"}].map(({src,label})=>{
            const b=sourceBadge(src);
            return <span key={src} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 11px",borderRadius:20,background:b.bg,border:`1px solid ${b.border}`,color:b.color,fontSize:".65rem",fontWeight:700,fontFamily:"'Inter',sans-serif"}}><span style={{width:6,height:6,borderRadius:"50%",background:b.color,display:"inline-block",flexShrink:0}}/>{label}</span>;
          })}
          <span style={{fontSize:".63rem",color:isDark?"rgba(120,150,220,0.4)":"rgba(0,0,0,0.3)",fontFamily:"'Inter',sans-serif"}}>· chip colour = urgency</span>
        </div>
        <div className="um-scroll" style={{overflowY:"auto",flex:1}}>
          {meetings.length===0
            ? <div style={{textAlign:"center",padding:"52px 20px",color:emptyClr,fontSize:".84rem",fontStyle:"italic"}}>No upcoming meetings found</div>
            : meetings.map((m,i)=>{
                const diff=daysDiff(m.next_action_date);const chip=chipStyle(diff);const badge=sourceBadge(m._source);
                return <div key={`${m._source}-${m.id}-${i}`} className="um-row" style={{display:"flex",alignItems:"center",gap:12,padding:"12px 22px",borderBottom:`1px solid ${rowBdr}`,transition:"background .15s",cursor:"default"}}>
                  <span style={{fontSize:".7rem",fontWeight:700,color:numClr,width:24,textAlign:"right",flexShrink:0}}>{i+1}</span>
                  <span style={{width:8,height:8,borderRadius:"50%",background:srcDot(m._source),flexShrink:0,display:"inline-block"}}/>
                  <span style={{flex:1,minWidth:0,fontSize:".84rem",fontWeight:600,color:nameClr,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Inter',sans-serif"}} title={m.client_name}>{m.client_name||"—"}</span>
                  <span style={{padding:"2px 9px",borderRadius:20,background:badge.bg,border:`1px solid ${badge.border}`,color:badge.color,fontSize:".62rem",fontWeight:700,fontFamily:"'Inter',sans-serif",whiteSpace:"nowrap",flexShrink:0}}>{m._source==="prospect"?"Prospect":"Pending"}</span>
                  <span style={{padding:"3px 10px",borderRadius:20,background:chip.bg,border:`1px solid ${chip.border}`,color:chip.color,fontSize:".68rem",fontWeight:700,fontFamily:"'Inter',sans-serif",whiteSpace:"nowrap",flexShrink:0}}>{fmtDate(m.next_action_date)}</span>
                </div>;
              })
          }
        </div>
        <div style={{padding:"12px 22px",borderTop:`1px solid ${hdrBdr}`,background:hdrBg,display:"flex",justifyContent:"flex-end",flexShrink:0}}>
          <button className="um-foot-btn" onClick={onClose} style={{padding:"8px 20px",borderRadius:10,border:`1px solid ${closeBdr}`,background:"none",color:closeClr,cursor:"pointer",fontSize:".8rem",fontWeight:600,fontFamily:"'Inter',sans-serif",transition:"all .18s"}}>Close</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function UpcomingMeetingsCard({ refreshTick, theme = "dark" }) {
  const [allMeetings, setAllMeetings] = useState([]);
  const [total,       setTotal]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [modalOpen,   setModalOpen]   = useState(false);
  const PREVIEW = 3;
  const isDark  = theme !== "light";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [intData, pendData] = await Promise.all([
          fetch(`${API}/interested`).then(r => r.json()),
          fetch(`${API}/invested/pending`).then(r => r.json()),
        ]);
        if (cancelled) return;
        const now = new Date(); now.setHours(0, 0, 0, 0);
        const fromInterested = (Array.isArray(intData)  ? intData  : []).filter(r => r.next_action_date && new Date(r.next_action_date) >= now).map(r => ({ ...r, _source: "prospect" }));
        const fromPending    = (Array.isArray(pendData) ? pendData : []).filter(r => r.next_action_date && new Date(r.next_action_date) >= now).map(r => ({ ...r, _source: "pending" }));
        const combined = [...fromInterested, ...fromPending].sort((a, b) => new Date(a.next_action_date) - new Date(b.next_action_date));
        setAllMeetings(combined); setTotal(combined.length);
      } catch { if (!cancelled) { setTotal(0); setAllMeetings([]); } }
      finally  { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [refreshTick]);

  const fmtShort = d => {
    if (!d) return "—";
    const dt = new Date(d), today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = Math.round((dt - today) / 86400000);
    if (diff === 0) return "Today"; if (diff === 1) return "Tomorrow";
    return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };
  const daysDiff = d => {
    if (!d) return null;
    const dt = new Date(d), today = new Date(); today.setHours(0, 0, 0, 0);
    return Math.round((dt - today) / 86400000);
  };
  const chipColor = diff => {
    if (isDark) {
      if (diff === 0) return { bg: "rgba(52,211,153,0.18)",  color: "#34D399", border: "rgba(52,211,153,0.3)"  };
      if (diff <= 3)  return { bg: "rgba(245,158,11,0.18)",  color: "#F59E0B", border: "rgba(245,158,11,0.3)"  };
      return              { bg: "rgba(79,142,247,0.14)",  color: "#4F8EF7", border: "rgba(79,142,247,0.28)" };
    } else {
      if (diff === 0) return { bg: "rgba(15,158,110,0.14)", color: "#0a7a56", border: "rgba(15,158,110,0.28)" };
      if (diff <= 3)  return { bg: "rgba(201,124,8,0.14)",  color: "#845004", border: "rgba(201,124,8,0.28)"  };
      return              { bg: "rgba(42,109,217,0.12)",  color: "#1a50b5", border: "rgba(42,109,217,0.26)" };
    }
  };

  const iconBg    = isDark ? "rgba(167,139,250,0.16)" : "rgba(90,62,185,0.1)";
  const iconColor = isDark ? "#A78BFA"                : "#4e30a0";
  const iconBorder= isDark ? "rgba(167,139,250,0.28)" : "rgba(10,30,100,0.2)";
  const labelColor= isDark ? "rgba(200,220,255,0.75)" : "rgba(0,0,0,0.6)";
  const countColor= isDark ? "#A78BFA"                : "#4e30a0";
  const emptyColor= isDark ? "rgba(160,190,255,0.4)"  : "rgba(10,45,120,0.4)";
  const rowLblClr = isDark ? "rgba(180,210,255,0.65)" : "rgba(0,0,0,0.6)";
  const moreBg    = isDark ? "rgba(167,139,250,0.1)"  : "rgba(100,72,195,0.08)";
  const moreBdr   = isDark ? "rgba(167,139,250,0.35)" : "rgba(100,72,195,0.3)";
  const moreClr   = isDark ? "#A78BFA"                : "#4e30a0";
  const srcDot = src => src==="prospect" ? (isDark?"#E67E22":"#c97c08") : (isDark?"#64B5F6":"#2a6dd9");

  const preview = allMeetings.slice(0, PREVIEW);

  return (
    <>
      <div className="side-card side-card-purple">
        <div className="side-card-header">
          <div className="side-card-icon-wrap" style={{background:iconBg,color:iconColor,border:`1px solid ${iconBorder}`}}><IcoCalendar size={16}/></div>
          <span className="side-card-label" style={{color:labelColor,cursor:"pointer",textDecoration:"underline dotted",textUnderlineOffset:3}} onClick={()=>setModalOpen(true)}>Upcoming Meetings</span>
          {loading
            ? <div className="sc-skel" style={{width:36,height:28,marginLeft:"auto",borderRadius:6}}/>
            : <span className="side-card-count" style={{color:countColor}}>{total}</span>}
        </div>
        <div className="side-card-divider"/>
        <div className="side-card-rows">
          {loading
            ? [1,2,3].map(i=><div key={i} className="sc-skel" style={{width:"100%",height:22,borderRadius:6,marginBottom:4}}/>)
            : allMeetings.length===0
              ? <div style={{color:emptyColor,fontSize:".71rem",textAlign:"center",padding:"8px 0",fontStyle:"italic"}}>No upcoming meetings</div>
              : <>
                  {preview.map((m,i)=>{
                    const diff=daysDiff(m.next_action_date);const chip=chipColor(diff);
                    return <div key={`${m._source}-${m.id}-${i}`} className="side-card-row" style={{alignItems:"center"}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:srcDot(m._source),flexShrink:0,display:"inline-block"}}/>
                      <span className="side-card-row-lbl" style={{color:rowLblClr,overflow:"hidden",textOverflow:"ellipsis",maxWidth:82,whiteSpace:"nowrap"}} title={m.client_name}>{m.client_name||"—"}</span>
                      <span style={{fontSize:".63rem",fontWeight:700,padding:"2px 6px",borderRadius:20,background:chip.bg,color:chip.color,border:`1px solid ${chip.border}`,whiteSpace:"nowrap",marginLeft:"auto",flexShrink:0}}>{fmtShort(m.next_action_date)}</span>
                    </div>;
                  })}
                  {allMeetings.length>PREVIEW && (
                    <button onClick={()=>setModalOpen(true)} style={{marginTop:6,width:"100%",background:moreBg,border:`1px dashed ${moreBdr}`,borderRadius:8,color:moreClr,fontSize:".69rem",fontWeight:700,padding:"5px 0",cursor:"pointer",fontFamily:"inherit",letterSpacing:".03em"}}>
                      +{allMeetings.length-PREVIEW} more · View all
                    </button>
                  )}
                </>
          }
        </div>
      </div>
      {modalOpen && <MeetingsModal meetings={allMeetings} onClose={()=>setModalOpen(false)} theme={theme}/>}
    </>
  );
}

/* ══════════════════════════════════════════════════
   DashboardLight  (light theme)
══════════════════════════════════════════════════ */
export default function DashboardLight() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [selected,      setSelected]      = useState(null);
  const [headerCounts,  setHeaderCounts]  = useState({});
  const [headerLoading, setHeaderLoading] = useState(true);
  const [refreshTick,   setRefreshTick]   = useState(0);
  const [sideOpen,      setSideOpen]      = useState(false);
  const [initialTab,    setInitialTab]    = useState(null);

  useEffect(() => {
    document.body.style.background = `url('/gift-city-light-back.jpeg') center/cover no-repeat fixed`;
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
    if (selected === "empanelment") return <Empanelment key={initialTab} inline onDataChange={refreshCounts} initialTab={initialTab} theme="light" />;
    if (selected === "invested")    return <Invested    key={initialTab} inline onDataChange={refreshCounts} initialTab={initialTab} theme="light" />;
    if (selected === "interested")  return <Interested  inline onDataChange={refreshCounts} theme="light" />;
    if (selected === "giftcity")    return <GiftCity    key={initialTab} inline onDataChange={refreshCounts} initialTab={initialTab} theme="light" />;
    if (selected === "customers")   return <Customers   inline onDataChange={refreshCounts} theme="light" />;
    if (selected === "products")    return <Products    inline onDataChange={refreshCounts} theme="light" />;
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
                    <UpcomingMeetingsCard refreshTick={refreshTick} theme="light" />
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

/* ─── Light-theme CSS string (plain template literal — NOT a CSS module) ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blue:#2a6dd9;--green:#0f9e6e;--gold:#c97c08;--purple:#6b4ec6;--red:#b02020;
  --muted:rgba(0,0,0,0.5);--side-w:210px;--hdr-h:64px;
  --spring:cubic-bezier(0.34,1.56,0.64,1);--smooth:cubic-bezier(0.4,0,0.2,1);
  --fh:'Inter',sans-serif;--fb:'Inter',sans-serif;
}
html,body{margin:0;padding:0;height:100%;overflow:hidden}
body{font-family:var(--fb);background:transparent;color:#111827;padding:12px;box-sizing:border-box}
button{font-family:var(--fb)}

.root{height:100vh;display:flex;align-items:stretch;background:transparent;box-sizing:border-box;overflow:hidden}
.page-card{display:flex;flex:1;min-width:0;gap:10px;align-items:stretch;border-radius:20px;border:1px solid rgba(42,109,217,0.3);box-shadow:0 0 40px rgba(10,30,100,0.12),0 0 80px rgba(10,20,80,0.08);padding:10px;background:rgba(255,255,255,0.55);backdrop-filter:blur(20px);overflow:hidden;width:100%;height:100%}

.side{width:var(--side-w);flex-shrink:0;background:rgba(255,255,255,0.7);border:1px solid rgba(42,109,217,0.28);border-radius:20px;box-shadow:0 0 20px rgba(10,30,100,0.1);display:flex;flex-direction:column;z-index:300;transition:transform .4s var(--spring);position:relative;overflow:hidden;backdrop-filter:blur(16px)}
.side-overlay{position:fixed;inset:0;z-index:299;background:rgba(0,0,0,0.3);backdrop-filter:blur(4px)}
.side-logo{padding:20px 14px 18px;border-bottom:1px solid rgba(42,109,217,0.15);flex-shrink:0}
.logo-box{border:1.5px solid rgba(42,109,217,0.5);border-radius:12px;padding:14px 12px;display:flex;flex-direction:column;align-items:center;background:rgba(42,109,217,0.06);box-shadow:0 0 20px rgba(42,109,217,0.1),inset 0 1px 0 rgba(255,255,255,0.8)}
.logo-words{display:flex;flex-direction:column;align-items:center;width:100%;gap:3px}
.logo-main{font-weight:800;font-size:.85rem;color:#111827;letter-spacing:.1em;text-align:center;line-height:1.3;word-break:break-word}
.logo-est{font-size:.63rem;color:rgba(0,0,0,0.45);letter-spacing:.16em;text-align:center;text-transform:uppercase;margin-top:2px}
.side-nav{flex:1;padding:18px 10px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;min-height:0}
.nav-btn{width:100%;display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:10px;border:1px solid transparent;background:transparent;cursor:pointer;color:rgba(0,0,0,0.6);font-size:.88rem;font-weight:500;transition:all .22s var(--smooth);text-align:left;letter-spacing:.01em}
.nav-btn:hover{color:#111827;background:rgba(42,109,217,0.08);border-color:rgba(42,109,217,0.2)}
.nav-active{color:#111827!important;background:linear-gradient(90deg,rgba(42,109,217,0.18),rgba(42,109,217,0.08))!important;border-color:rgba(42,109,217,0.4)!important;box-shadow:0 0 12px rgba(42,109,217,0.12);position:relative}
.nav-active::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;border-radius:0 2px 2px 0;background:linear-gradient(180deg,var(--blue),var(--purple));box-shadow:0 0 6px var(--blue)}
.nav-ico{display:flex;align-items:center;flex-shrink:0}
.nav-lbl{font-weight:600;font-size:.72rem;letter-spacing:.04em}
.logout-card{margin:8px 0 16px;padding:6px;border-radius:12px;border:1px solid rgba(42,109,217,0.2);background:rgba(42,109,217,0.04);transition:transform .28s var(--spring),box-shadow .28s;flex-shrink:0}
.logout-card:hover{transform:scale(1.06) translateY(-3px);box-shadow:0 10px 24px rgba(42,109,217,0.18)}
.logout-nav{width:100%;margin-bottom:0}
.logout-nav:hover{color:#111827!important;background:transparent!important;border-color:transparent!important}

.main{flex:1;min-width:0;display:flex;flex-direction:column;position:relative;z-index:1;background:transparent;border-radius:20px;overflow:hidden;min-height:0}
.topbar{height:var(--hdr-h);display:flex;align-items:center;padding:0 12px;gap:8px;background:transparent;z-index:200;min-width:0;overflow:hidden;flex-shrink:0}
.menu-btn{display:none;background:none;border:none;color:#111827;cursor:pointer;padding:5px;border-radius:7px;flex-shrink:0}
.topbar-title{flex:1;min-width:0;font-weight:800;font-size:1.1rem;color:#111827;letter-spacing:.06em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-chip{display:flex;align-items:center;gap:8px;padding:4px 12px 4px 4px;background:rgba(255,255,255,0.7);border:1px solid rgba(42,109,217,0.3);border-radius:40px;backdrop-filter:blur(14px);flex-shrink:0}
.user-av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#2a6dd9,#6b4ec6);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;color:#fff;box-shadow:0 0 10px rgba(42,109,217,0.35)}
.user-name{font-size:.8rem;font-weight:600;color:#111827;letter-spacing:.02em;white-space:nowrap}

.content{flex:1;padding:0 12px 12px;display:flex;flex-direction:column;gap:14px;min-width:0;overflow:hidden;min-height:0}
.stats-card{border:1px solid rgba(42,109,217,0.2);border-radius:20px;padding:12px;background:rgba(255,255,255,0.5);backdrop-filter:blur(12px);width:100%;box-sizing:border-box;flex-shrink:0}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:100%}
.sc{position:relative;overflow:hidden;border-radius:14px;border:1px solid rgba(42,109,217,0.22);padding:10px 12px;transition:transform .35s var(--spring),box-shadow .35s;cursor:default;background:rgba(255,255,255,0.65);backdrop-filter:blur(8px);box-shadow:0 2px 12px rgba(10,30,100,0.08),inset 0 1px 0 rgba(255,255,255,0.9);min-width:0}
.sc:hover{transform:translateY(-4px) scale(1.015);box-shadow:0 8px 24px rgba(10,30,100,0.14)}
.sc-body{position:relative;z-index:1;display:flex;align-items:center;gap:8px;min-width:0}
.sc-icon{width:36px;height:36px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--accent);border:1.5px solid rgba(0,0,0,0.08)}
.sc-text{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}
.sc-label{font-size:.5rem;font-weight:700;letter-spacing:.05em;color:rgba(0,0,0,0.55);white-space:normal;word-break:break-word;text-transform:uppercase;line-height:1.3}
.sc-ratio{display:flex;align-items:baseline;gap:2px;flex-wrap:wrap}
.sc-big{font-size:1.55rem;font-weight:800;line-height:1;color:#111827}
.sc-slash{font-size:.85rem;color:rgba(0,0,0,0.45)}
.sc-tot{font-size:.85rem;color:rgba(0,0,0,0.6)}
.sc-single{font-size:1.75rem;font-weight:800;line-height:1;color:#111827}
.sc-sub{font-size:.55rem;color:var(--accent);margin-top:2px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sc-skel{height:24px;width:60px;border-radius:6px;background:rgba(0,0,0,0.06);animation:sk 1.4s infinite}
@keyframes sk{0%,100%{opacity:.4}50%{opacity:.8}}

.dashboard-bottom{display:flex;gap:12px;align-items:stretch;min-width:0;flex:1;min-height:0;overflow:hidden}
.amc-table-col{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}
.side-cards-col{display:flex;flex-direction:column;gap:12px;width:190px;flex-shrink:0;overflow-y:auto;max-height:100%;scrollbar-width:thin;scrollbar-color:rgba(42,109,217,0.3) transparent;padding-right:2px}
.side-cards-col::-webkit-scrollbar{width:3px}
.side-cards-col::-webkit-scrollbar-track{background:transparent}
.side-cards-col::-webkit-scrollbar-thumb{background:rgba(42,109,217,0.3);border-radius:3px}
.side-cards-col::-webkit-scrollbar-thumb:hover{background:rgba(42,109,217,0.55)}

.side-card{border-radius:16px;border:1px solid rgba(42,109,217,0.2);padding:14px 12px 12px;display:flex;flex-direction:column;background:rgba(255,255,255,0.7);backdrop-filter:blur(8px);animation:pIn .38s var(--spring) both;transition:transform .28s var(--spring),box-shadow .28s;position:relative;overflow:hidden;flex-shrink:0}
.side-card-red{border-color:rgba(176,32,32,0.22);box-shadow:0 0 16px rgba(176,32,32,0.06)}
.side-card-purple{border-color:rgba(107,78,198,0.22);box-shadow:0 0 16px rgba(107,78,198,0.06)}
.side-card:hover{transform:translateY(-3px) scale(1.01);box-shadow:0 8px 24px rgba(10,30,100,0.1)}
.side-card-header{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.side-card-icon-wrap{width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.side-card-icon-red{background:rgba(176,32,32,0.1);color:#b02020;border:1px solid rgba(176,32,32,0.25)}
.side-card-label{font-size:.48rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(0,0,0,0.55);line-height:1.2;flex:1;min-width:0}
.side-card-count{font-size:1.35rem;font-weight:800;line-height:1;margin-left:auto;flex-shrink:0}
.side-card-divider{height:1px;background:rgba(42,109,217,0.12);margin:0 0 9px}
.side-card-rows{display:flex;flex-direction:column;gap:6px}
.side-card-row{display:flex;align-items:center;gap:6px;font-size:.71rem}
.side-card-row-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.side-card-row-lbl{color:rgba(0,0,0,0.6);flex:1;font-weight:500;font-size:.68rem;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.side-card-row-val{font-weight:800;font-size:.76rem;flex-shrink:0}
.pending-nav-row{border-radius:7px;padding:3px 5px;margin:0 -5px;transition:background .18s,transform .15s}
.pending-nav-row:hover{background:rgba(42,109,217,0.08);transform:translateX(2px)}

.module-panel{background:rgba(255,255,255,0.6);border:1px solid rgba(42,109,217,0.22);border-radius:18px;overflow:hidden;backdrop-filter:blur(8px);box-shadow:0 4px 24px rgba(10,30,100,0.08);animation:pIn .38s var(--spring) both;min-width:0;width:100%;flex:1;min-height:0}
@keyframes pIn{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}

.fd-tbl{width:100%;border-collapse:collapse;font-size:.83rem;min-width:600px}
.fd-tbl thead tr{background:rgba(224,236,255,0.97)}
.fd-tbl th{padding:11px 14px;text-align:left;font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(30,65,150,0.8);border-bottom:1px solid rgba(42,109,217,0.2);white-space:nowrap}
.fd-tbl tbody tr{background:transparent;transition:background .18s;animation:rIn .32s ease both}
.fd-tbl tbody tr:nth-child(even){background:rgba(42,109,217,0.03)}
@keyframes rIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
.fd-tbl tbody tr:hover{background:rgba(42,109,217,0.07)!important}
.fd-tbl tbody tr:last-child td{border-bottom:none}
.fd-tbl td{padding:8px 14px;color:#1e293b;border-bottom:1px solid rgba(42,109,217,0.08);vertical-align:middle;white-space:nowrap;background:transparent;font-size:.84rem}
.fd-num{color:rgba(0,0,0,0.3);font-size:.74rem}
.fd-empty{text-align:center;padding:48px 20px!important;color:rgba(0,0,0,0.4);font-style:italic;font-size:.84rem}
.fd-spin{display:flex;justify-content:center;align-items:center;padding:56px;flex-shrink:0}
.spinner{width:28px;height:28px;border-radius:50%;border:3px solid rgba(42,109,217,0.15);border-top-color:var(--blue);animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}

.act-cell{display:flex;gap:5px;align-items:center;justify-content:center}
.ab{width:28px;height:28px;border-radius:8px;border:1px solid transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .22s var(--spring);flex-shrink:0}
.ab:hover{transform:scale(1.15) translateY(-2px)}
.ab-del{background:rgba(176,32,32,0.1);color:#b02020;border-color:rgba(176,32,32,0.25)}.ab-del:hover{background:#b02020;color:#fff}
.ab-edit{background:rgba(42,109,217,0.1);color:#1a50b5;border-color:rgba(42,109,217,0.25)}.ab-edit:hover{background:#2a6dd9;color:#fff}
.ab-promo{background:rgba(15,158,110,0.1);color:#0a7a56;border-color:rgba(15,158,110,0.25)}.ab-promo:hover{background:#0f9e6e;color:#fff}

.dlg-ov{position:fixed;inset:0;z-index:1000;background:rgba(10,20,80,0.3);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;animation:fIn .18s ease;box-sizing:border-box}
@keyframes fIn{from{opacity:0}to{opacity:1}}
.dlg-box{background:rgba(255,255,255,0.95);backdrop-filter:blur(44px);border:1px solid rgba(42,109,217,0.25);border-radius:18px;width:100%;max-width:min(450px,calc(100vw - 32px));overflow:hidden;box-shadow:0 8px 40px rgba(10,30,100,0.18),inset 0 1px 0 rgba(255,255,255,0.9);animation:dPop .32s var(--spring);box-sizing:border-box}
@keyframes dPop{from{opacity:0;transform:scale(.88) translateY(22px)}to{opacity:1;transform:none}}
.dlg-hdr{padding:16px 20px 12px;border-bottom:1px solid rgba(42,109,217,0.15);display:flex;align-items:center;gap:11px;background:rgba(42,109,217,0.04)}
.dlg-bar{width:4px;height:22px;border-radius:2px;flex-shrink:0}
.dlg-ttl{font-weight:700;font-size:.95rem;color:#111827}
.dlg-sub{font-size:.67rem;color:rgba(0,0,0,0.5);margin-top:2px}
.dlg-body{padding:16px 20px;display:flex;flex-direction:column;gap:12px;max-height:55vh;overflow-y:auto;background:transparent}
.dlg-foot{padding:12px 20px;border-top:1px solid rgba(42,109,217,0.12);display:flex;justify-content:flex-end;gap:8px;background:transparent}
.fld{display:flex;flex-direction:column;gap:6px}
.fld-lbl{font-size:.67rem;font-weight:600;color:rgba(0,0,0,0.6);letter-spacing:.08em;text-transform:uppercase}
.fld-inp{width:100%;padding:9px 12px;border-radius:10px;background:rgba(255,255,255,0.7);border:1px solid rgba(42,109,217,0.22);color:#111827;font-size:.84rem;font-family:var(--fb);transition:border-color .2s,box-shadow .2s;outline:none;box-sizing:border-box}
.fld-inp:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(42,109,217,0.12)}
.fld-hi{border-color:#c97c08!important}
.fld-note{font-size:.66rem;margin-top:2px}
.btn-cancel{padding:8px 14px;border-radius:10px;border:1px solid rgba(42,109,217,0.2);background:none;color:rgba(0,0,0,0.6);cursor:pointer;font-size:.8rem;font-weight:600;transition:all .2s}
.btn-cancel:hover{border-color:rgba(42,109,217,0.4);color:#111827}
.btn-ok{padding:8px 16px;border-radius:10px;border:none;cursor:pointer;color:#fff;font-size:.8rem;font-weight:700;transition:all .25s var(--spring)}
.btn-ok:hover{transform:translateY(-1px);filter:brightness(1.1)}
.btn-ok:disabled{opacity:.6;cursor:not-allowed}
.btn-primary{background:linear-gradient(135deg,#2a6dd9,#6b4ec6);box-shadow:0 4px 16px rgba(42,109,217,0.3)}
.btn-success{background:linear-gradient(135deg,#0f9e6e,#059669);box-shadow:0 4px 16px rgba(15,158,110,0.25)}
.btn-danger{background:linear-gradient(135deg,#b02020,#9a1a1a);box-shadow:0 4px 16px rgba(176,32,32,0.25)}
.chip{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:.71rem;font-weight:700}
.chip-yes{background:rgba(15,158,110,0.12);color:#076642;border:1px solid rgba(15,158,110,0.25)}
.chip-no{background:rgba(176,32,32,0.1);color:#b02020;border:1px solid rgba(176,32,32,0.2)}
.snack{position:fixed;bottom:22px;right:22px;z-index:2000;padding:11px 18px;border-radius:12px;font-size:.84rem;font-weight:600;box-shadow:0 8px 30px rgba(0,0,0,0.15);animation:snkIn .32s var(--spring)}
@keyframes snkIn{from{opacity:0;transform:translateY(16px) scale(.9)}to{opacity:1;transform:none}}
.snack-success{background:linear-gradient(135deg,#059669,#0f9e6e);color:#fff}
.snack-error{background:linear-gradient(135deg,#b02020,#9a1a1a);color:#fff}

.theme-toggle-wrap{display:flex;align-items:center;gap:6px;flex-shrink:0}
.theme-toggle-ico{font-size:.85rem;line-height:1;user-select:none;pointer-events:none;opacity:.8}
.theme-switch{position:relative;width:42px;height:23px;cursor:pointer;flex-shrink:0}
.theme-switch input{opacity:0;width:0;height:0;position:absolute}
.theme-switch-track{position:absolute;inset:0;border-radius:99px;background:rgba(42,109,217,0.2);border:1px solid rgba(42,109,217,0.4);transition:background .3s;box-shadow:inset 0 1px 3px rgba(0,0,0,0.1)}
.theme-switch-thumb{position:absolute;top:3px;left:3px;width:15px;height:15px;border-radius:50%;background:linear-gradient(135deg,#2a6dd9,#6b4ec6);box-shadow:0 1px 6px rgba(0,0,0,0.2);transition:transform .3s var(--spring)}
.theme-switch input:checked ~ .theme-switch-thumb{transform:translateX(19px)}

@media(max-width:1024px){.stats-row{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){
  .root{padding:6px;height:100dvh}.page-card{padding:6px;gap:6px}
  .side{position:fixed;top:6px;left:6px;bottom:6px;border-radius:20px;transform:translateX(calc(-100% - 20px));background:rgba(255,255,255,0.97)}
  .side-open{transform:translateX(0)}.menu-btn{display:flex}
  .stats-row{grid-template-columns:repeat(2,1fr);gap:8px}
  .content{padding:0 8px 10px}.topbar{padding:0 8px;gap:6px}.topbar-title{font-size:.95rem}
  .user-name{display:none}.dashboard-bottom{flex-direction:column;overflow-y:auto}
  .side-cards-col{width:100%;flex-direction:row;overflow-y:visible;max-height:none}
  .side-card{flex:1}.module-panel{border-radius:14px}
}
@media(max-width:520px){
  .stats-row{grid-template-columns:1fr 1fr;gap:6px}.sc{padding:8px 10px}
  .sc-big{font-size:1.3rem}.sc-single{font-size:1.5rem}.sc-label{font-size:.48rem}.sc-icon{width:30px;height:30px}
  .fd-tbl th,.fd-tbl td{padding:8px 10px;font-size:.76rem}.topbar-title{font-size:.85rem}
}
@media(max-width:400px){
  .stats-row{grid-template-columns:1fr}.side-cards-col{flex-direction:column}
  .dlg-box{border-radius:18px 18px 0 0;max-width:100%}.dlg-ov{align-items:flex-end;padding:0}
}
`;