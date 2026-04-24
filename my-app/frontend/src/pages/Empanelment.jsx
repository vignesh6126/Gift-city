import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

const API = import.meta.env.VITE_API_URL;

const TABS = [
  { id: "completed", label: "Empanelment Completed" },
  { id: "pending",   label: "Empanelment Pending"   },
];
const COMPLETED_COLS = [
  { key: "AMC_name",         label: "AMC Name",        type: "text"   },
  { key: "products",         label: "Products",         type: "number" },
  { key: "Empanelment_date", label: "Empanelment Date", type: "date"   },
  { key: "boardings",        label: "Boardings",        type: "number" },
];
const PENDING_COLS = [
  { key: "AMC_name",        label: "AMC Name",       type: "text"   },
  { key: "products",        label: "Products",        type: "number" },
  { key: "submission_date", label: "Submission Date", type: "date"   },
  { key: "status",          label: "Status",          type: "text"   },
];
const AUTO_KEYS   = new Set(["AMC_name", "products", "boardings"]);
const MANUAL_KEYS = new Set(["Empanelment_date"]);

const pendingToCompleted = (r) => ({ AMC_name: r.AMC_name||"", products: r.products||"", Empanelment_date:"", boardings:"" });
const emptyC = () => ({ AMC_name:"", products:"", Empanelment_date:"", boardings:"" });
const emptyP = () => ({ AMC_name:"", products:"", submission_date:"", status:"" });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "—";

/* ─── Icons ─── */
const IcoEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoDel    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoMove   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2"/><circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const IcoSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const IcoClear  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>;
const IcoUser   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

/* ─── Highlight matching text ─── */
function Highlight({ text, query, theme = "dark" }) {
  if (!query || !text) return <>{text ?? "—"}</>;
  const str = String(text);
  const idx = str.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{str}</>;
  return (
    <>
      {str.slice(0, idx)}
      <mark style={{
        background: theme === "light" ? "rgba(42,109,217,0.2)" : "rgba(79,142,247,0.35)",
        color: theme === "light" ? "#1a50b5" : "#fff",
        borderRadius: 3, padding: "0 1px",
      }}>
        {str.slice(idx, idx + query.length)}
      </mark>
      {str.slice(idx + query.length)}
    </>
  );
}

/* ─── Number Badge ─── */
function NumberBadge({ value, onClick, theme = "dark", title = "" }) {
  const isDark = theme === "dark";
  const display = (value !== null && value !== undefined && value !== "") ? value : 0;
  const isClickable = !!onClick;

  const baseStyle = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    minWidth: 32, height: 26, padding: "0 8px", borderRadius: 6,
    fontSize: ".8rem", fontWeight: 700, fontFamily: "var(--fh,'Orbitron',sans-serif)",
    border: isDark ? "1.5px solid rgba(79,142,247,0.45)" : "1.5px solid rgba(42,109,217,0.4)",
    background: isDark ? "rgba(79,142,247,0.12)" : "rgba(173,214,255,0.25)",
    color: isDark ? "#7bb8ff" : "#1a50b5",
    boxShadow: isDark
      ? "0 0 0 1px rgba(79,142,247,0.08), inset 0 1px 0 rgba(255,255,255,0.06)"
      : "0 0 0 1px rgba(42,109,217,0.06), inset 0 1px 0 rgba(255,255,255,0.5)",
    transition: "all .18s", cursor: isClickable ? "pointer" : "default",
    userSelect: "none", letterSpacing: "0.02em",
  };

  if (!isClickable) return <span style={baseStyle} title={title}>{display}</span>;

  return (
    <button
      title={title} onClick={onClick}
      style={{ ...baseStyle, background: isDark ? "rgba(79,142,247,0.15)" : "rgba(173,214,255,0.35)" }}
      onMouseEnter={e => {
        e.currentTarget.style.background = isDark ? "rgba(79,142,247,0.28)" : "rgba(42,109,217,0.18)";
        e.currentTarget.style.borderColor = isDark ? "rgba(79,142,247,0.75)" : "rgba(42,109,217,0.7)";
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = isDark ? "0 3px 10px rgba(79,142,247,0.25)" : "0 3px 10px rgba(42,109,217,0.2)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = isDark ? "rgba(79,142,247,0.15)" : "rgba(173,214,255,0.35)";
        e.currentTarget.style.borderColor = isDark ? "rgba(79,142,247,0.45)" : "rgba(42,109,217,0.4)";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = isDark
          ? "0 0 0 1px rgba(79,142,247,0.08), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 0 0 1px rgba(42,109,217,0.06), inset 0 1px 0 rgba(255,255,255,0.5)";
      }}
    >
      {display}
    </button>
  );
}

function Field({ col, value, onChange, highlight, disabled }) {
  const cls = `fld-inp${highlight ? " fld-hi" : ""}`;
  return (
    <div className="fld">
      <label className="fld-lbl">{col.label}</label>
      <input
        className={cls}
        type={col.type==="number"?"number":col.type==="date"?"date":"text"}
        value={value||""}
        onChange={e=>onChange(col.key,e.target.value)}
        disabled={disabled}
        style={disabled ? { opacity: 0.6, cursor: "not-allowed" } : {}}
      />
    </div>
  );
}

function Snack({ msg, severity, onClose }) {
  useEffect(()=>{ const t=setTimeout(onClose,3000); return ()=>clearTimeout(t); },[]);
  return <div className={`snack snack-${severity}`}>{msg}</div>;
}

/* ─── Search Bar ─── */
function SearchBar({ value, onChange, placeholder, resultCount, totalCount, theme = "dark" }) {
  const inputRef = useRef(null);
  const isActive = value.length > 0;
  return (
    <div style={{
      padding: "10px 20px 12px",
      borderBottom: theme === "light" ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(79,142,247,0.12)",
      background: theme === "light" ? "rgba(0,0,0,0.02)" : "rgba(79,142,247,0.02)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 420 }}>
          <span style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            color: isActive ? (theme === "light" ? "#2a6dd9" : "#4F8EF7") : (theme === "light" ? "rgba(0,0,0,0.3)" : "rgba(160,190,255,0.4)"),
            display: "flex", pointerEvents: "none", transition: "color .2s",
          }}><IcoSearch /></span>
          <input
            ref={inputRef} type="text" value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%", padding: "8px 34px 8px 32px", borderRadius: 10,
              border: isActive
                ? (theme === "light" ? "1px solid rgba(42,109,217,0.6)" : "1px solid rgba(79,142,247,0.55)")
                : (theme === "light" ? "1px solid rgba(0,0,0,0.2)" : "1px solid rgba(79,142,247,0.22)"),
              background: isActive
                ? (theme === "light" ? "rgba(42,109,217,0.07)" : "rgba(79,142,247,0.08)")
                : (theme === "light" ? "rgba(255,255,255,0.6)" : "rgba(10,16,60,0.5)"),
              color: theme === "light" ? "#111827" : "#fff",
              fontSize: ".82rem", fontFamily: "var(--fb,'Exo 2',sans-serif)",
              outline: "none", transition: "all .22s",
              boxShadow: isActive ? (theme === "light" ? "0 0 0 3px rgba(42,109,217,0.12)" : "0 0 0 3px rgba(79,142,247,0.12)") : "none",
            }}
            onFocus={e => {
              e.target.style.borderColor = theme === "light" ? "rgba(42,109,217,0.8)" : "rgba(79,142,247,0.7)";
              e.target.style.boxShadow = theme === "light" ? "0 0 0 3px rgba(42,109,217,0.15)" : "0 0 0 3px rgba(79,142,247,0.15)";
            }}
            onBlur={e => {
              e.target.style.borderColor = isActive
                ? (theme === "light" ? "rgba(42,109,217,0.6)" : "rgba(79,142,247,0.55)")
                : (theme === "light" ? "rgba(0,0,0,0.2)" : "rgba(79,142,247,0.22)");
              e.target.style.boxShadow = isActive
                ? (theme === "light" ? "0 0 0 3px rgba(42,109,217,0.12)" : "0 0 0 3px rgba(79,142,247,0.12)")
                : "none";
            }}
          />
          {isActive && (
            <button onClick={() => { onChange(""); inputRef.current?.focus(); }}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: theme === "light" ? "rgba(42,109,217,0.14)" : "rgba(79,142,247,0.18)", border: "none", borderRadius: "50%",
                width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: theme === "light" ? "rgba(0,0,0,0.55)" : "rgba(180,210,255,0.8)", transition: "all .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = theme === "light" ? "rgba(42,109,217,0.28)" : "rgba(79,142,247,0.35)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = theme === "light" ? "rgba(42,109,217,0.14)" : "rgba(79,142,247,0.18)"; e.currentTarget.style.color = theme === "light" ? "rgba(0,0,0,0.55)" : "rgba(180,210,255,0.8)"; }}
            ><IcoClear /></button>
          )}
        </div>
        {isActive && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 12px", borderRadius: 20,
            background: resultCount > 0 ? "rgba(79,142,247,0.12)" : "rgba(248,113,113,0.12)",
            border: `1px solid ${resultCount > 0 ? "rgba(79,142,247,0.28)" : "rgba(248,113,113,0.28)"}`,
            fontSize: ".7rem", fontWeight: 700,
            color: resultCount > 0 ? (theme === "light" ? "#2a6dd9" : "#4F8EF7") : (theme === "light" ? "#b02020" : "#F87171"),
            fontFamily: "var(--fh,'Orbitron',sans-serif)", animation: "srIn .18s ease", whiteSpace: "nowrap",
          }}>
            {resultCount > 0
              ? <><span style={{ opacity: .7 }}>↳</span> {resultCount} <span style={{ opacity: .55, fontWeight: 500 }}>of {totalCount}</span></>
              : <>No results</>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Portal style helpers ─── */
const pOv  = (d) => ({ position:"fixed",inset:0,background:d?"rgba(0,0,10,0.6)":"rgba(10,20,80,0.25)",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:99999,padding:16,boxSizing:"border-box",overflowY:"auto" });
const pBox = (d) => d ? {} : { background:"rgba(255,255,255,0.97)",border:"1px solid rgba(42,109,217,0.22)",boxShadow:"0 8px 40px rgba(10,30,100,0.15)" };
const pHdr = (d) => d ? {} : { borderBottom:"1px solid rgba(42,109,217,0.15)",background:"rgba(42,109,217,0.06)" };
const pFt  = (d) => d ? {} : { borderTop:"1px solid rgba(42,109,217,0.14)",background:"rgba(42,109,217,0.03)" };
const pTtl = (d) => ({ display:"flex",alignItems:"center",gap:7,color:d?"#fff":"#111827" });
const pSub = (d) => ({ fontSize:".72rem",color:d?"rgba(180,210,255,0.55)":"rgba(0,0,0,0.5)",marginTop:2 });
const pTh  = (d) => ({ color:d?"rgba(79,142,247,.65)":"rgba(0,0,0,0.48)" });
const pTd  = (d) => ({ borderBottomColor:d?"rgba(79,142,247,.07)":"rgba(10,30,100,0.09)",color:d?"rgba(200,220,255,.85)":"#1e293b" });
const pNum = (d) => ({ color:d?"rgba(79,142,247,.4)":"rgba(0,0,0,0.3)",fontSize:".72rem",width:42 });
const pEmp = (d) => ({ textAlign:"center",padding:"32px 20px",color:d?"rgba(200,220,255,.3)":"rgba(0,0,0,0.38)",fontSize:".82rem" });

const fmtAmt = (val) => {
  if (val===null||val===undefined||val==="") return "—";
  const n=Number(val); if(isNaN(n)) return val;
  if(n>=10000000) return "₹"+(n/10000000).toFixed(2)+" Cr";
  if(n>=100000)   return "₹"+(n/100000).toFixed(2)+" L";
  if(n>=1000)     return "₹"+(n/1000).toFixed(1)+"K";
  return "₹"+n.toLocaleString("en-IN");
};

/* ─── Helper: check if product_name is valid (not null/empty) ─── */
const hasValidProductName = (p) =>
  p.product_name !== null &&
  p.product_name !== undefined &&
  String(p.product_name).trim() !== "";

/* ─── Products Popup ─── */
function ProductsPopup({ amcName, onClose, theme="dark" }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const d = theme === "dark";
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API}/products`);
        const data = await r.json();
        // FIX 3: filter out products with null/empty product_name
        setProducts(
          (Array.isArray(data) ? data : []).filter(p =>
            (p.amc_name || "").toLowerCase() === (amcName || "").toLowerCase() &&
            hasValidProductName(p)
          )
        );
      } catch { setProducts([]); } finally { setLoading(false); }
    })();
  }, [amcName]);

  const structChip = (val) => {
    const map = {
      "outbound/cat-III": { bg:"rgba(79,142,247,0.13)",  color:"#4F8EF7", border:"rgba(79,142,247,0.28)"  },
      "inbound/cat-III":  { bg:"rgba(167,139,250,0.13)", color:"#a78bfa", border:"rgba(167,139,250,0.28)" },
      "outbound/retail":  { bg:"rgba(245,158,11,0.13)",  color:"#f59e0b", border:"rgba(245,158,11,0.28)"  },
      "inbound/retail":   { bg:"rgba(52,211,153,0.13)",  color:"#34d399", border:"rgba(52,211,153,0.28)"  },
    };
    const s = map[val] || { bg:"rgba(120,120,120,0.1)", color:d?"#aaa":"#555", border:"rgba(120,120,120,0.2)" };
    return (
      <span style={{
        display:"inline-flex", alignItems:"center", padding:"3px 9px", borderRadius:20,
        fontSize:".68rem", fontWeight:700, background:s.bg, color:s.color,
        border:`1px solid ${s.border}`, whiteSpace:"nowrap",
      }}>
        {val ?? "—"}
      </span>
    );
  };

  return createPortal(
    <div style={pOv(d)} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="dlg-box" style={{ maxWidth:"min(680px,calc(100vw - 32px))", ...pBox(d) }}>
        <div className="dlg-hdr" style={pHdr(d)}>
          <div className="dlg-bar" style={{ background: d ? "#4F8EF7" : "#2a6dd9" }} />
          <div style={{ flex:1, minWidth:0 }}>
            <div className="dlg-ttl" style={pTtl(d)}>{amcName} — Products</div>
            {!loading && <div style={pSub(d)}>{products.length} {products.length === 1 ? "product" : "products"} found</div>}
          </div>
        </div>
        <div className="dlg-body" style={{ padding:0, maxHeight:"55vh" }}>
          {loading
            ? <div className="fd-spin"><div className="spinner" style={!d ? { borderColor:"rgba(42,109,217,0.15)", borderTopColor:"#2a6dd9" } : {}} /></div>
            : products.length === 0
              ? <div style={pEmp(d)}>No products found for this AMC.</div>
              : <div className="tbl-wrap">
                  <table className="fd-tbl" style={{ minWidth:520 }}>
                    <thead>
                      <tr style={{
                        borderBottom: d ? "1px solid rgba(79,142,247,.15)" : "1px solid rgba(10,30,100,0.18)",
                        background: d
                          ? "linear-gradient(180deg,rgba(15,25,70,0.98) 0%,rgba(10,18,55,0.98) 100%)"
                          : "linear-gradient(180deg,rgba(224,236,255,0.99) 0%,rgba(210,228,255,0.99) 100%)",
                      }}>
                        <th style={{ width:36, ...pTh(d) }}>#</th>
                        {["Product Name","Min. Investment","Onboarding","Structure","Lock-in"].map(h =>
                          <th key={h} style={pTh(d)}>{h}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, i) => (
                        <tr key={p.id || i} style={{ borderBottom:`1px solid ${pTd(d).borderBottomColor}` }}>
                          <td style={{ ...pNum(d), padding:"9px 14px" }}>{i + 1}</td>
                          <td style={{ ...pTd(d), padding:"9px 14px", whiteSpace:"normal", wordBreak:"break-word", maxWidth:180 }}>
                            {p.product_name}
                          </td>
                          <td style={{ ...pTd(d), padding:"9px 14px", fontWeight:700, color:d?"#34D399":"#059669" }}>
                            {fmtAmt(p.min_investment)}
                          </td>
                          <td style={{ ...pTd(d), padding:"9px 14px" }}>
                            <span className={`chip ${p.onboarding_process === "online" ? "chip-yes" : "chip-no"}`}>
                              {p.onboarding_process ? p.onboarding_process.charAt(0).toUpperCase() + p.onboarding_process.slice(1) : "—"}
                            </span>
                          </td>
                          <td style={{ ...pTd(d), padding:"9px 14px" }}>{structChip(p.structure)}</td>
                          <td style={{ ...pTd(d), padding:"9px 14px" }}>{p.lock_in || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
          }
        </div>
        <div className="dlg-foot" style={pFt(d)}>
          <button className="btn-ok btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Boardings Popup ─── */
function BoardingsPopup({ amcName, onClose, theme="dark" }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const d = theme === "dark";
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`${API}/invested/completed`);
        const data = await r.json();
        setClients((Array.isArray(data)?data:[]).filter(c=>(c.amc_name||"").toLowerCase()===(amcName||"").toLowerCase()));
      } catch { setClients([]); } finally { setLoading(false); }
    })();
  }, [amcName]);

  const bankChip = (val) => {
    const map = {
      gift:    { bg:"rgba(79,142,247,0.13)",  color:"#4F8EF7", border:"rgba(79,142,247,0.28)"  },
      savings: { bg:"rgba(52,211,153,0.13)",  color:"#34d399", border:"rgba(52,211,153,0.28)"  },
      both:    { bg:"rgba(245,158,11,0.13)",  color:"#f59e0b", border:"rgba(245,158,11,0.28)"  },
    };
    const s = map[val] || { bg:"rgba(120,120,120,0.1)", color:d?"#aaa":"#555", border:"rgba(120,120,120,0.2)" };
    return (
      <span style={{
        display:"inline-flex", alignItems:"center", padding:"3px 9px", borderRadius:20,
        fontSize:".68rem", fontWeight:700, background:s.bg, color:s.color,
        border:`1px solid ${s.border}`, whiteSpace:"nowrap",
      }}>
        {val ? val.charAt(0).toUpperCase() + val.slice(1) : "—"}
      </span>
    );
  };

  return createPortal(
    <div style={pOv(d)} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="dlg-box" style={{ maxWidth:"min(740px,calc(100vw - 32px))", ...pBox(d) }}>
        <div className="dlg-hdr" style={pHdr(d)}>
          <div className="dlg-bar" style={{ background: d ? "#34D399" : "#059669" }} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={pTtl(d)}><IcoUser />{amcName} — Boarded Clients</div>
            {!loading && <div style={pSub(d)}>{clients.length} {clients.length === 1 ? "client" : "clients"} boarded</div>}
          </div>
        </div>
        <div className="dlg-body" style={{ padding:0, maxHeight:"55vh" }}>
          {loading
            ? <div className="fd-spin"><div className="spinner" style={!d ? { borderColor:"rgba(42,109,217,0.15)", borderTopColor:"#2a6dd9" } : {}} /></div>
            : clients.length === 0
              ? <div style={pEmp(d)}>No clients found for this AMC.</div>
              : <div className="tbl-wrap">
                  <table className="fd-tbl" style={{ minWidth:580 }}>
                    <thead>
                      <tr style={{
                        borderBottom: d ? "1px solid rgba(79,142,247,.15)" : "1px solid rgba(10,30,100,0.18)",
                        background: d
                          ? "linear-gradient(180deg,rgba(15,25,70,0.98) 0%,rgba(10,18,55,0.98) 100%)"
                          : "linear-gradient(180deg,rgba(224,236,255,0.99) 0%,rgba(210,228,255,0.99) 100%)",
                      }}>
                        <th style={{ width:36, ...pTh(d) }}>#</th>
                        {["Client Name","Scheme","Amount","Bank","First Investment"].map(h =>
                          <th key={h} style={pTh(d)}>{h}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {clients.map((c, i) => (
                        <tr key={c.id || i}>
                          <td style={{ ...pNum(d), padding:"9px 14px" }}>{i + 1}</td>
                          <td style={{ ...pTd(d), padding:"9px 14px", fontWeight:600 }}>{c.client_name || "—"}</td>
                          <td style={{ ...pTd(d), padding:"9px 14px", maxWidth:160, overflow:"hidden", textOverflow:"ellipsis" }}>{c.scheme || "—"}</td>
                          <td style={{ ...pTd(d), padding:"9px 14px", fontWeight:700, color:d?"#34D399":"#059669" }}>{fmtAmt(c.amount)}</td>
                          <td style={{ ...pTd(d), padding:"9px 14px" }}>{bankChip(c.bank)}</td>
                          <td style={{ ...pTd(d), padding:"9px 14px" }}>{fmtDate(c.first_investment)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
          }
        </div>
        <div className="dlg-foot" style={pFt(d)}>
          <button className="btn-ok btn-primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Fetch helpers ─── */
async function fetchProductCount(amcName) {
  try {
    const r = await fetch(`${API}/products`);
    const data = await r.json();
    // FIX 1: only count products that have a valid (non-null, non-empty) product_name
    return (Array.isArray(data) ? data : []).filter(p =>
      (p.amc_name || "").toLowerCase() === (amcName || "").toLowerCase() &&
      hasValidProductName(p)
    ).length;
  } catch { return 0; }
}

async function fetchBoardingsCount(amcName) {
  try {
    const r = await fetch(`${API}/invested/completed`);
    const data = await r.json();
    return (Array.isArray(data) ? data : []).filter(c =>
      (c.amc_name || "").toLowerCase() === (amcName || "").toLowerCase()
    ).length;
  } catch { return 0; }
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════ */
export default function Empanelment({ inline=false, onDataChange, initialTab, theme="dark" }) {
  const [tab,          setTab]          = useState(initialTab || "completed");
  const [rows,         setRows]         = useState([]);
  const [liveProducts, setLiveProducts] = useState({});
  const [liveBoarding, setLiveBoarding] = useState({});
  const [search,       setSearch]       = useState("");
  const [loading,      setLoading]      = useState(false);
  const [dlg,          setDlg]          = useState(false);
  const [editRow,      setEditRow]      = useState(null);
  const [form,         setForm]         = useState({});
  const [delId,        setDelId]        = useState(null);
  const [confirm,      setConfirm]      = useState(false);
  const [promo,        setPromo]        = useState(false);
  const [promoId,      setPromoId]      = useState(null);
  const [promoForm,    setPromoForm]    = useState({});
  const [promoLoading, setPromoLoading] = useState(false);
  const [snack,        setSnack]        = useState(null);
  const [productsPopup,  setProductsPopup]  = useState(null);
  const [boardingsPopup, setBoardingsPopup] = useState(null);
  const [amcFetching,    setAmcFetching]    = useState(false);

  useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);
  useEffect(() => { setSearch(""); }, [tab]);

  const cols = tab === "completed" ? COMPLETED_COLS : PENDING_COLS;
  const showSnack = (msg, severity = "success") => setSnack({ msg, severity });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/empanelment/${tab}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const loaded = Array.isArray(data) ? data : [];
      setRows(loaded);
      if (loaded.length > 0) {
        try {
          const [prodRes, invRes] = await Promise.all([
            fetch(`${API}/products`),
            fetch(`${API}/invested/completed`),
          ]);
          const [prodData, invData] = await Promise.all([prodRes.json(), invRes.json()]);

          // FIX 2: only count products with a valid (non-null, non-empty) product_name
          const prodMap = {};
          (Array.isArray(prodData) ? prodData : [])
            .filter(p => hasValidProductName(p))
            .forEach(p => {
              const k = (p.amc_name || "").toLowerCase();
              prodMap[k] = (prodMap[k] || 0) + 1;
            });

          const invMap = {};
          (Array.isArray(invData) ? invData : []).forEach(c => {
            const k = (c.amc_name || "").toLowerCase();
            invMap[k] = (invMap[k] || 0) + 1;
          });

          const liveP = {}, liveB = {};
          loaded.forEach(row => {
            const k = (row.AMC_name || "").toLowerCase();
            liveP[row.AMC_name] = prodMap[k] || 0;
            liveB[row.AMC_name] = invMap[k]  || 0;
          });
          setLiveProducts(liveP);
          setLiveBoarding(liveB);
        } catch { /* non-critical */ }
      }
    } catch (e) {
      setSnack({ msg: `Failed to load: ${e.message}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const filteredRows = search.trim()
    ? rows.filter(r => (r.AMC_name || "").toLowerCase().includes(search.trim().toLowerCase()))
    : rows;

  const openAdd  = () => { setEditRow(null); setForm(tab === "completed" ? emptyC() : emptyP()); setDlg(true); };
  const openEdit = (row) => { setEditRow(row); setForm({ ...row }); setDlg(true); };

  const debounceRef = useRef(null);
  const setFieldDebounced = (k, v) => {
    setForm(p => ({ ...p, [k]: v }));
    if (k === "AMC_name") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (v && v.trim().length > 1) {
          setAmcFetching(true);
          try {
            const [pCount, bCount] = await Promise.all([
              fetchProductCount(v.trim()),
              fetchBoardingsCount(v.trim()),
            ]);
            setForm(p => ({ ...p, products: pCount, boardings: bCount }));
          } catch { } finally { setAmcFetching(false); }
        }
      }, 600);
    }
  };

  const save = async () => {
    const url = editRow ? `${API}/empanelment/${tab}/${editRow.id}` : `${API}/empanelment/${tab}`;
    try {
      const r = await fetch(url, {
        method: editRow ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw 0;
      showSnack(editRow ? "Updated!" : "Added!");
      setDlg(false); load(); onDataChange?.();
    } catch { showSnack("Save failed", "error"); }
  };

  const del = async () => {
    try {
      const r = await fetch(`${API}/empanelment/${tab}/${delId}`, { method: "DELETE" });
      if (!r.ok) throw 0;
      showSnack("Deleted"); setConfirm(false); load(); onDataChange?.();
    } catch { showSnack("Delete failed", "error"); }
  };

  const openPromo = async (row) => {
    setPromoId(row.id); setPromoForm(pendingToCompleted(row)); setPromo(true);
    if (row.AMC_name) {
      setPromoLoading(true);
      try {
        const [pCount, bCount] = await Promise.all([
          fetchProductCount(row.AMC_name),
          fetchBoardingsCount(row.AMC_name),
        ]);
        setPromoForm(p => ({ ...p, products: pCount, boardings: bCount }));
      } catch { } finally { setPromoLoading(false); }
    }
  };

  const setPromoFld = (k, v) => setPromoForm(p => ({ ...p, [k]: v }));

  const savePromo = async () => {
    setPromoLoading(true);
    try {
      const a = await fetch(`${API}/empanelment/completed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promoForm),
      });
      if (!a.ok) throw new Error("Add failed");
      const d = await fetch(`${API}/empanelment/pending/${promoId}`, { method: "DELETE" });
      if (!d.ok) throw new Error("Delete failed");
      showSnack("✓ Moved to Completed!"); setPromo(false); load(); onDataChange?.();
    } catch (e) {
      showSnack(e.message || "Failed", "error");
    } finally {
      setPromoLoading(false);
    }
  };

  const renderCell = (col, row) => {
    if (col.key === "products") {
      const count = liveProducts.hasOwnProperty(row.AMC_name) ? liveProducts[row.AMC_name] : (row[col.key] ?? 0);
      return (
        <NumberBadge
          value={count} theme={theme}
          title={`View products for ${row.AMC_name}`}
          onClick={() => setProductsPopup(row.AMC_name)}
        />
      );
    }
    if (col.key === "boardings") {
      const count = liveBoarding.hasOwnProperty(row.AMC_name) ? liveBoarding[row.AMC_name] : (row[col.key] ?? 0);
      return (
        <NumberBadge
          value={count} theme={theme}
          title={`View boarded clients for ${row.AMC_name}`}
          onClick={() => setBoardingsPopup(row.AMC_name)}
        />
      );
    }
    if (col.type === "date") return fmtDate(row[col.key]);
    if (col.key === "AMC_name") return <Highlight text={row[col.key]} query={search} theme={theme} />;
    return row[col.key] ?? "—";
  };

  return (
    <div className={`mod-wrap${theme === "light" ? " theme-light" : ""}`}>
      <style>{EMP_CSS}</style>

      {productsPopup  && <ProductsPopup  amcName={productsPopup}  onClose={() => setProductsPopup(null)}  theme={theme} />}
      {boardingsPopup && <BoardingsPopup amcName={boardingsPopup} onClose={() => setBoardingsPopup(null)} theme={theme} />}

      <div className="emp-scroll-area">

        {/* ── Tabs ── */}
        <div className="mod-hdr">
          <div className="tabs-row">
            {TABS.map(t => (
              <button key={t.id} className={`tab-pill ${tab === t.id ? "tab-active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Search ── */}
        <SearchBar
          value={search} onChange={setSearch}
          placeholder={`Search AMC name in ${tab === "completed" ? "Completed" : "Pending"}…`}
          resultCount={filteredRows.length} totalCount={rows.length} theme={theme}
        />

        {/* ── Table title row ── */}
        <div className="tbl-hdr">
          <span className="tbl-title">{TABS.find(t => t.id === tab)?.label}</span>
          {!loading && (
            <span className="tbl-badge">
              {search.trim()
                ? <>{filteredRows.length}<span style={{ opacity:.55 }}> / {rows.length}</span></>
                : <>{rows.length} records</>}
            </span>
          )}
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="fd-spin"><div className="spinner" /></div>
        ) : (
          <div className="tbl-wrap">
            <table className="fd-tbl">
              <thead>
                <tr>
                  <th style={{ width:42 }}>#</th>
                  {cols.map(c => <th key={c.key}>{c.label}</th>)}
                  <th style={{ textAlign:"center", width: tab === "pending" ? 108 : 82 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td className="fd-empty" colSpan={cols.length + 2}>
                      {search.trim()
                        ? <>No AMCs match "<strong style={{ color:"#4F8EF7" }}>{search}</strong>"</>
                        : tab === "pending"
                          ? 'No records found. Click "Add Row" to get started.'
                          : "No records found."}
                    </td>
                  </tr>
                ) : filteredRows.map((row, i) => (
                  <tr key={row.id}>
                    <td className="fd-num">{i + 1}</td>
                    {cols.map(c => (
                      <td key={c.key} style={(c.key === "products" || c.key === "boardings") ? { paddingTop:6, paddingBottom:6 } : {}}>
                        {renderCell(c, row)}
                      </td>
                    ))}
                    <td>
                      <div className="act-cell">
                        <button className="ab ab-edit" title="Edit" onClick={() => openEdit(row)}><IcoEdit /></button>
                        {tab === "pending" && (
                          <button className="ab ab-promo" title="Move to Completed" onClick={() => openPromo(row)}><IcoMove /></button>
                        )}
                        <button className="ab ab-del" title="Delete" onClick={() => { setDelId(row.id); setConfirm(true); }}><IcoDel /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>{/* end emp-scroll-area */}

      {/* ── Add / Edit Dialog ── */}
      {dlg && (
        <div className="dlg-ov" onClick={e => e.target === e.currentTarget && setDlg(false)}>
          <div className="dlg-box">
            <div className="dlg-hdr">
              <div className="dlg-bar" style={{ background:"#4F8EF7" }} />
              <div className="dlg-ttl">{editRow ? "Edit Record" : "Add Record"}</div>
            </div>
            <div className="dlg-body">
              {cols.map(c => {
                const isAuto = (c.key === "products" || c.key === "boardings");
                return (
                  <div key={c.key}>
                    <Field col={c} value={form[c.key]} onChange={setFieldDebounced} disabled={isAuto} />
                    {c.key === "AMC_name" && amcFetching && (
                      <div style={{ fontSize:".67rem", color:"#4F8EF7", marginTop:3, display:"flex", alignItems:"center", gap:4 }}>
                        <span style={{ display:"inline-block", width:10, height:10, border:"2px solid rgba(79,142,247,0.3)", borderTopColor:"#4F8EF7", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
                        Fetching product &amp; boardings count…
                      </div>
                    )}
                    {isAuto && (
                      <div className="fld-note" style={{ color:"#4F8EF7" }}>
                        {c.key === "boardings" ? "✦ Auto-filled from customers_completed" : "✦ Auto-filled from Products table"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="dlg-foot">
              <button className="btn-cancel" onClick={() => setDlg(false)}>Cancel</button>
              <button className="btn-ok btn-primary" onClick={save}>{editRow ? "Update" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Promote Dialog ── */}
      {promo && (
        <div className="dlg-ov" onClick={e => e.target === e.currentTarget && setPromo(false)}>
          <div className="dlg-box">
            <div className="dlg-hdr">
              <div className="dlg-bar" style={{ background:"#34D399" }} />
              <div>
                <div className="dlg-ttl">Move to Empanelment Completed</div>
                <div className="dlg-sub">Orange = fill manually · Green = auto-filled</div>
              </div>
            </div>
            <div className="dlg-body">
              {COMPLETED_COLS.map(c => (
                <div key={c.key}>
                  <Field col={c} value={promoForm[c.key]} onChange={setPromoFld} highlight={MANUAL_KEYS.has(c.key)} disabled={AUTO_KEYS.has(c.key)} />
                  {(c.key === "products" || c.key === "boardings") && promoLoading && (
                    <div style={{ fontSize:".67rem", color:"#34D399", marginTop:3, display:"flex", alignItems:"center", gap:4 }}>
                      <span style={{ display:"inline-block", width:10, height:10, border:"2px solid rgba(52,211,153,0.3)", borderTopColor:"#34D399", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
                      {c.key === "boardings" ? "Fetching from customers_completed…" : "Fetching from products…"}
                    </div>
                  )}
                  {MANUAL_KEYS.has(c.key) && <div className="fld-note" style={{ color:"#f59e0b" }}>⚠ Fill manually</div>}
                  {AUTO_KEYS.has(c.key) && (
                    <div className="fld-note" style={{ color:"#34D399" }}>
                      {c.key === "boardings"
                        ? "✓ Auto-filled from customers_completed"
                        : c.key === "products"
                          ? "✓ Auto-filled from Products table"
                          : "✓ Auto-filled"}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="dlg-foot">
              <button className="btn-cancel" onClick={() => setPromo(false)} disabled={promoLoading}>Cancel</button>
              <button className="btn-ok btn-success" onClick={savePromo} disabled={promoLoading}>
                {promoLoading ? "Saving…" : "Save & Move"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {confirm && (
        <div className="dlg-ov" onClick={e => e.target === e.currentTarget && setConfirm(false)}>
          <div className="dlg-box" style={{
            maxWidth: 370,
            background: theme === "light" ? "rgba(7,9,30,0.96)" : undefined,
            border: theme === "light" ? "1px solid rgba(239,68,68,0.45)" : undefined,
          }}>
            <div className="dlg-hdr" style={{
              borderBottom: theme === "light" ? "1px solid rgba(239,68,68,0.2)" : undefined,
              background: theme === "light" ? "rgba(239,68,68,0.06)" : undefined,
            }}>
              <div className="dlg-bar" style={{ background:"#EF4444" }} />
              <div className="dlg-ttl" style={{ color:"#fff" }}>Confirm Delete</div>
            </div>
            <div className="dlg-body">
              <p style={{ margin:0, lineHeight:1.6, fontSize:".84rem", color: theme === "dark" ? "white" : "#000" }}>
                Are you sure you want to delete this gift city record?
              </p>
            </div>
            <div className="dlg-foot" style={{
              borderTop: theme === "light" ? "1px solid rgba(239,68,68,0.15)" : undefined,
            }}>
              <button className="btn-cancel" style={{ border:"1px solid rgba(239,68,68,0.3)", color:"rgba(220,235,255,0.75)" }} onClick={() => setConfirm(false)}>Cancel</button>
              <button className="btn-ok btn-danger" onClick={del}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {snack && <Snack {...snack} onClose={() => setSnack(null)} />}
    </div>
  );
}

const EMP_CSS = `
  @keyframes srIn  { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:none} }
  @keyframes spin  { to{transform:rotate(360deg)} }
  @keyframes dlgIn { from{opacity:0;transform:translateY(16px) scale(.97)} to{opacity:1;transform:none} }
  @keyframes fIn   { from{opacity:0} to{opacity:1} }

  .mod-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }

  .emp-scroll-area {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(79,142,247,0.4) transparent;
  }
  .emp-scroll-area::-webkit-scrollbar       { width: 5px; }
  .emp-scroll-area::-webkit-scrollbar-track { background: transparent; }
  .emp-scroll-area::-webkit-scrollbar-thumb { background: rgba(79,142,247,0.4); border-radius: 4px; }
  .emp-scroll-area::-webkit-scrollbar-thumb:hover { background: rgba(79,142,247,0.65); }
  .theme-light .emp-scroll-area { scrollbar-color: rgba(42,109,217,0.35) transparent; }
  .theme-light .emp-scroll-area::-webkit-scrollbar-thumb       { background: rgba(42,109,217,0.35); }
  .theme-light .emp-scroll-area::-webkit-scrollbar-thumb:hover { background: rgba(42,109,217,0.6); }

  .tbl-wrap {
    overflow-x: auto;
    overflow-y: visible;
    -webkit-overflow-scrolling: touch;
    width: 100%;
    box-sizing: border-box;
  }
  .tbl-wrap::-webkit-scrollbar        { height: 4px; }
  .tbl-wrap::-webkit-scrollbar-thumb  { background: rgba(79,142,247,0.3); border-radius: 4px; }

  .fd-tbl thead {
    position: sticky;
    top: 0;
    z-index: 10;
  }
  .fd-tbl thead tr {
    background: linear-gradient(180deg,
      rgba(15, 25, 70, 0.98) 0%,
      rgba(10, 18, 55, 0.98) 100%
    );
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow:
      0 1px 0 rgba(79,142,247,0.30),
      0 3px 14px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(79,142,247,0.12);
  }

  .theme-light .fd-tbl thead tr {
    background: linear-gradient(180deg,
      rgba(224, 236, 255, 0.99) 0%,
      rgba(210, 228, 255, 0.99) 100%
    ) !important;
    box-shadow:
      0 1px 0 rgba(42,109,217,0.25),
      0 3px 10px rgba(10,30,100,0.08),
      inset 0 1px 0 rgba(255,255,255,0.85) !important;
  }

  .mod-wrap input::placeholder { color: rgba(160,190,255,0.35); }
  .mod-wrap.theme-light input::placeholder { color: rgba(0,0,0,0.3); }

  .dlg-ov { position:fixed !important;inset:0 !important;background:rgba(0,0,10,0.6);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);display:flex !important;align-items:center !important;justify-content:center !important;z-index:99999 !important;padding:16px;box-sizing:border-box;overflow-y:auto;animation:fIn .18s ease; }
  .dlg-box { background:rgba(7,9,30,0.96);backdrop-filter:blur(44px) saturate(160%);border:1px solid rgba(79,142,247,0.45);border-radius:18px;box-shadow:0 8px 40px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.06);width:100%;max-width:min(480px,calc(100vw - 32px));max-height:calc(100vh - 40px);overflow-y:auto;animation:dlgIn .3s cubic-bezier(0.34,1.56,0.64,1);box-sizing:border-box; }
  .dlg-box::-webkit-scrollbar { width:4px; } .dlg-box::-webkit-scrollbar-thumb { background:rgba(79,142,247,0.25);border-radius:4px; }
  .theme-light .dlg-box { background:rgba(255,255,255,0.94) !important;border:1px solid rgba(10,30,100,0.2) !important;box-shadow:0 8px 40px rgba(10,30,100,0.15) !important; }
  .dlg-hdr { display:flex;align-items:center;gap:12px;padding:16px 20px 12px;border-bottom:1px solid rgba(79,142,247,0.18);background:rgba(79,142,247,0.04);border-radius:18px 18px 0 0; }
  .theme-light .dlg-hdr { border-bottom-color:rgba(10,30,100,0.12) !important;background:rgba(135,206,250,0.12) !important; }
  .dlg-bar { width:4px;height:22px;border-radius:2px;flex-shrink:0; }
  .dlg-ttl { font-weight:800;font-size:.95rem;color:#fff;letter-spacing:.01em;display:flex;align-items:center;gap:7px; }
  .dlg-sub { font-size:.72rem;color:rgba(180,210,255,0.55);margin-top:2px; }
  .theme-light .dlg-ttl { color:#111827 !important; }
  .theme-light .dlg-sub { color:rgba(0,0,0,0.5) !important; }
  .dlg-body { padding:16px 20px;display:flex;flex-direction:column;gap:12px;max-height:55vh;overflow-y:auto;background:transparent; }
  .theme-light .dlg-body { max-height:45vh !important; }
  .dlg-body::-webkit-scrollbar { width:4px; } .dlg-body::-webkit-scrollbar-thumb { background:rgba(79,142,247,0.2);border-radius:4px; }
  .dlg-foot { display:flex;justify-content:flex-end;gap:8px;padding:12px 20px;border-top:1px solid rgba(79,142,247,0.15);background:rgba(79,142,247,0.02);border-radius:0 0 18px 18px; }
  .theme-light .dlg-foot { border-top-color:rgba(10,30,100,0.12) !important;background:transparent !important; }

  .fld { display:flex;flex-direction:column;gap:5px; }
  .fld-lbl { font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:rgba(160,190,255,.55);font-family:var(--fh,'Orbitron',sans-serif); }
  .fld-inp { padding:9px 12px;border-radius:9px;border:1px solid rgba(79,142,247,.22);background:rgba(10,18,60,.6);color:rgba(220,235,255,.92);font-size:.84rem;font-family:var(--fb,'Exo 2',sans-serif);outline:none;transition:border-color .18s,box-shadow .18s;width:100%;box-sizing:border-box; }
  .fld-inp:focus { border-color:rgba(79,142,247,.6);box-shadow:0 0 0 3px rgba(79,142,247,.12); }
  .fld-inp.fld-hi { border-color:rgba(245,158,11,.4);background:rgba(245,158,11,.05); }
  .fld-inp.fld-hi:focus { border-color:rgba(245,158,11,.7);box-shadow:0 0 0 3px rgba(245,158,11,.12); }
  .fld-inp option { background:#0d1640;color:#fff; }
  .fld-note { font-size:.68rem;font-weight:600;margin-top:2px;padding-left:2px; }
  .theme-light .fld-lbl { color:rgba(0,0,0,0.65) !important; }
  .theme-light .fld-inp { background:rgba(255,255,255,0.7) !important;border:1px solid rgba(10,30,100,0.2) !important;color:#111827 !important; }
  .theme-light .fld-inp:focus { border-color:#2a6dd9 !important;box-shadow:0 0 0 3px rgba(42,109,217,0.12) !important; }
  .theme-light .fld-inp option { background:#fff !important;color:#111827 !important; }

  .btn-cancel { padding:8px 14px;border-radius:10px;border:1px solid rgba(79,142,247,0.28);background:none;color:rgba(180,210,255,0.75);font-size:.8rem;font-family:var(--fb,'Exo 2',sans-serif);font-weight:600;cursor:pointer;transition:all .2s; }
  .btn-cancel:hover { border-color:rgba(255,255,255,0.3);color:#fff;background:rgba(255,255,255,0.04); }
  .btn-cancel:disabled { opacity:.4;cursor:not-allowed; }
  .theme-light .btn-cancel { border:1px solid rgba(10,30,100,0.2) !important;color:rgba(0,0,0,0.65) !important; }
  .theme-light .btn-cancel:hover { border-color:rgba(10,30,100,0.4) !important;color:#000 !important; }
  .btn-ok { padding:8px 16px;border-radius:10px;border:none;color:#fff;font-size:.8rem;font-family:var(--fb,'Exo 2',sans-serif);font-weight:700;cursor:pointer;transition:all .25s cubic-bezier(0.34,1.56,0.64,1); }
  .btn-ok:hover { transform:translateY(-1px);filter:brightness(1.1); }
  .btn-ok:disabled { opacity:.6;cursor:not-allowed;transform:none; }
  .btn-primary { background:linear-gradient(135deg,#4F8EF7,#7B5FFF);box-shadow:0 4px 16px rgba(79,142,247,0.35); }
  .btn-success { background:linear-gradient(135deg,#34D399,#059669);box-shadow:0 4px 16px rgba(52,211,153,0.3); }
  .btn-danger  { background:linear-gradient(135deg,#EF4444,#DC2626);box-shadow:0 4px 16px rgba(239,68,68,0.3); }

  .chip { display:inline-flex;align-items:center;padding:3px 9px;border-radius:20px;font-size:.68rem;font-weight:700;white-space:nowrap; }
  .chip-yes { background:rgba(52,211,153,0.13);color:#34d399;border:1px solid rgba(52,211,153,0.28); }
  .chip-no  { background:rgba(248,113,113,0.13);color:#f87171;border:1px solid rgba(248,113,113,0.28); }

  .fd-spin { display:flex;justify-content:center;padding:40px; }
  .spinner { width:32px;height:32px;border:3px solid rgba(79,142,247,.15);border-top-color:#4F8EF7;border-radius:50%;animation:spin .7s linear infinite; }
  .theme-light .spinner { border-color:rgba(42,109,217,0.15);border-top-color:#2a6dd9; }
  .fd-empty { text-align:center;padding:32px 20px !important;color:rgba(200,220,255,.3);font-size:.82rem; }
  .theme-light .fd-empty { color:rgba(0,0,0,0.38); }

  .snack { position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:10px 22px;border-radius:10px;font-size:.82rem;font-weight:600;font-family:var(--fb,'Exo 2',sans-serif);z-index:99999;box-shadow:0 4px 20px rgba(0,0,0,.4);animation:dlgIn .2s ease;white-space:nowrap; }
  .snack-success { background:#065f46;color:#6ee7b7;border:1px solid #34D399; }
  .snack-error   { background:#7f1d1d;color:#fca5a5;border:1px solid #EF4444; }

  .fd-tbl { width:100%;border-collapse:collapse;font-size:.8rem;min-width:560px; }
  .fd-tbl th {
    padding:10px 14px;
    text-align:left;
    font-size:.68rem;
    font-weight:700;
    text-transform:uppercase;
    letter-spacing:.07em;
    color:rgba(120,175,255,0.9);
    font-family:var(--fh,'Orbitron',sans-serif);
    white-space:nowrap;
  }
  .fd-tbl td { padding:9px 14px;border-bottom:1px solid rgba(79,142,247,.07);color:rgba(200,220,255,.85);white-space:nowrap; }
  .fd-tbl tbody tr { transition:background .15s; }
  .fd-tbl tbody tr:hover { background:rgba(79,142,247,.06); }
  .fd-num { color:rgba(79,142,247,.4) !important;font-size:.72rem !important;width:42px; }

  .theme-light .fd-tbl th { color:rgba(30,65,150,0.85) !important; }
  .theme-light .fd-tbl td { color:#1e293b;border-bottom-color:rgba(10,30,100,0.09); }
  .theme-light .fd-tbl tbody tr:hover { background:rgba(42,109,217,0.05); }
  .theme-light .fd-num { color:rgba(0,0,0,0.3) !important; }

  .act-cell { display:flex;align-items:center;justify-content:center;gap:5px; }
  .ab { display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:7px;border:none;cursor:pointer;transition:all .15s; }
  .ab-edit  { background:rgba(79,142,247,.12);color:#4F8EF7; }  .ab-edit:hover  { background:rgba(79,142,247,.28); }
  .ab-del   { background:rgba(239,68,68,.1);color:#EF4444; }    .ab-del:hover   { background:rgba(239,68,68,.25); }
  .ab-promo { background:rgba(52,211,153,.1);color:#34D399; }   .ab-promo:hover { background:rgba(52,211,153,.25); }
  .theme-light .ab-edit  { background:rgba(42,109,217,0.1);color:#1a50b5; }  .theme-light .ab-edit:hover  { background:rgba(42,109,217,0.22); }
  .theme-light .ab-del   { background:rgba(180,50,50,0.1);color:#9a2020; }   .theme-light .ab-del:hover   { background:rgba(180,50,50,0.22); }
  .theme-light .ab-promo { background:rgba(15,120,85,0.1);color:#0a7a56; }   .theme-light .ab-promo:hover { background:rgba(15,120,85,0.22); }

  .mod-hdr { display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:12px 20px;border-bottom:1px solid rgba(79,142,247,.12);box-sizing:border-box;width:100%; }
  .theme-light .mod-hdr { border-bottom-color:rgba(10,30,100,0.12); }
  .tabs-row { display:flex;flex-wrap:wrap;gap:6px;flex:1 1 auto;min-width:0; }
  .tab-pill { padding:6px 16px;border-radius:20px;border:1px solid rgba(79,142,247,.25);background:transparent;color:rgba(200,220,255,.6);font-size:.78rem;font-family:var(--fb,'Exo 2',sans-serif);font-weight:600;cursor:pointer;transition:all .2s;white-space:nowrap; }
  .tab-pill:hover { border-color:rgba(79,142,247,.5);color:#fff; }
  .tab-pill.tab-active { background:rgba(79,142,247,.15);border-color:rgba(79,142,247,.55);color:#4F8EF7;box-shadow:0 0 12px rgba(79,142,247,.18); }
  .theme-light .tab-pill { color:rgba(0,0,0,0.55);border-color:rgba(10,30,100,0.2); }
  .theme-light .tab-pill:hover { color:#000;border-color:rgba(10,30,100,0.4); }
  .theme-light .tab-pill.tab-active { color:#1a50b5;background:rgba(42,109,217,0.1);border-color:rgba(42,109,217,0.4);box-shadow:none; }

  .tbl-hdr { display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 20px;box-sizing:border-box;width:100%; }
  .tbl-title { font-size:.78rem;font-weight:700;color:rgba(200,220,255,.5);text-transform:uppercase;letter-spacing:.06em;font-family:var(--fh,'Orbitron',sans-serif); }
  .theme-light .tbl-title { color:rgba(0,0,0,0.5); }
  .tbl-badge { font-size:.7rem;font-weight:700;padding:2px 10px;border-radius:20px;border:1px solid rgba(79,142,247,.22);color:#4F8EF7;background:rgba(79,142,247,.1);font-family:var(--fh,'Orbitron',sans-serif); }
  .theme-light .tbl-badge { color:#1a50b5;background:rgba(42,109,217,0.1);border-color:rgba(42,109,217,0.25); }

  @media(max-width:600px) {
    .mod-hdr { padding:10px 14px; }
    .tbl-hdr { padding:6px 14px; }
  }
`;