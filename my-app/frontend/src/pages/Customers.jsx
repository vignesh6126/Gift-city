import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

const API = import.meta.env.VITE_API_URL;

const COLS = [
  { key: "customer_name",     label: "Client Name",           type: "text"   },
  { key: "amount_invested",   label: "Amount Invested",       type: "text"   },
  { key: "esops_rsus_stocks", label: "ESOPS / RSUs / Stocks", type: "select", options: ["yes", "no"] },
  { key: "gift_city_ac",      label: "Gift City A/C",         type: "select", options: ["yes", "no"] },
];

const emptyRow = () => ({
  customer_name:     "",
  amount_invested:   "",
  esops_rsus_stocks: "no",
  gift_city_ac:      "no",
});

const GIFT_CITY_COLS = [
  { key: "customer_name", label: "Customer Name", type: "text" },
  { key: "bank_name",     label: "Bank Name",     type: "text" },
  { key: "delay_reason",  label: "Delay Reason",  type: "text" },
];

const PROSPECTS_COLS = [
  { key: "client_name",     label: "Client Name",     type: "text"   },
  { key: "esops_rsu",       label: "ESOPS/RSU",        type: "select", options: ["yes", "no"] },
  { key: "discussion_date", label: "Discussion Date",  type: "date"   },
    { key: "next_action_date", label: "Next Action Date", type: "date" },
  { key: "next_action",     label: "Next Action",      type: "text"   },
];

const toGiftCityInactive = (row) => ({
  customer_name: row.customer_name || "",
  bank_name:     "",
  delay_reason:  "",
});

const toProspects = (row) => ({
  client_name: row.customer_name || "",
  esops_rsu: row.esops_rsus_stocks === "yes" ? "yes" : "no",
  discussion_date: "",
  next_action_date: "", 
  next_action: "",
});

const GIFT_CITY_AUTO_KEYS = new Set(["customer_name"]);
const PROSPECTS_AUTO_KEYS = new Set(["client_name", "esops_rsu"]);

const fmtAmount = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  const n = Number(val);
  if (isNaN(n)) return "—";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000)     return "$" + (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return "$" + n.toLocaleString("en-US");
};

const IcoEdit     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoDel      = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoPlus     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>;
const IcoSearch   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const IcoClear    = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>;
const IcoTransfer = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoGift = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="8" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 8v13M3 12v7a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 8c-1.5 0-2.5-1-2.5-2s1-2 2.5-2c2 0 3.5 4 4 4H8zM16 8c1.5 0 2.5-1 2.5-2s-1-2-2.5-2c-2 0-3.5 4-4 4h4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoProspect = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const IcoChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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

function SearchBar({ value, onChange, resultCount, totalCount, theme = "dark" }) {
  const inputRef = useRef(null);
  const isActive = value.length > 0;
  const accentSolid  = theme === "light" ? "#2a6dd9"                         : "#4F8EF7";
  const accent       = theme === "light" ? "rgba(42,109,217,0.8)"            : "rgba(79,142,247,0.7)";
  const borderIdle   = theme === "light" ? "rgba(0,0,0,0.2)"                 : "rgba(79,142,247,0.22)";
  const borderActive = theme === "light" ? "rgba(42,109,217,0.6)"            : "rgba(79,142,247,0.55)";
  const bgIdle       = theme === "light" ? "rgba(255,255,255,0.6)"           : "rgba(10,16,60,0.5)";
  const bgActive     = theme === "light" ? "rgba(42,109,217,0.07)"           : "rgba(79,142,247,0.08)";
  const shadowActive = theme === "light" ? "0 0 0 3px rgba(42,109,217,0.12)": "0 0 0 3px rgba(79,142,247,0.12)";
  const shadowFocus  = theme === "light" ? "0 0 0 3px rgba(42,109,217,0.15)": "0 0 0 3px rgba(79,142,247,0.15)";
  const clearBg      = theme === "light" ? "rgba(42,109,217,0.14)"           : "rgba(79,142,247,0.18)";
  const clearBgHov   = theme === "light" ? "rgba(42,109,217,0.28)"           : "rgba(79,142,247,0.35)";
  const clearColor   = theme === "light" ? "rgba(0,0,0,0.55)"                : "rgba(180,210,255,0.8)";
  const sectionBg    = theme === "light" ? "rgba(0,0,0,0.02)"                : "rgba(79,142,247,0.02)";
  const sectionBdr   = theme === "light" ? "1px solid rgba(0,0,0,0.1)"      : "1px solid rgba(79,142,247,0.12)";

  return (
    <div style={{ padding: "10px 20px 12px", borderBottom: sectionBdr, background: sectionBg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 420 }}>
          <span style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            color: isActive ? accentSolid : (theme === "light" ? "rgba(0,0,0,0.3)" : "rgba(160,190,255,0.4)"),
            display: "flex", pointerEvents: "none", transition: "color .2s",
          }}>
            <IcoSearch />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="Search by client name…"
            style={{
              width: "100%", padding: "8px 34px 8px 32px", borderRadius: 10,
              border: `1px solid ${isActive ? borderActive : borderIdle}`,
              background: isActive ? bgActive : bgIdle,
              color: theme === "light" ? "#111827" : "#fff",
              fontSize: ".82rem", fontFamily: "Inter,sans-serif",
              outline: "none", transition: "all .22s",
              boxShadow: isActive ? shadowActive : "none",
            }}
            onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = shadowFocus; }}
            onBlur={e => {
              e.target.style.borderColor = isActive ? borderActive : borderIdle;
              e.target.style.boxShadow   = isActive ? shadowActive : "none";
            }}
          />
          {isActive && (
            <button onClick={() => { onChange(""); inputRef.current?.focus(); }}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: clearBg, border: "none", borderRadius: "50%",
                width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: clearColor, transition: "all .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = clearBgHov; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = clearBg; e.currentTarget.style.color = clearColor; }}
            >
              <IcoClear />
            </button>
          )}
        </div>
        {isActive && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 12px", borderRadius: 20,
            background: resultCount > 0 ? (theme === "light" ? "rgba(42,109,217,0.12)" : "rgba(79,142,247,0.12)") : "rgba(248,113,113,0.12)",
            border: `1px solid ${resultCount > 0 ? (theme === "light" ? "rgba(42,109,217,0.28)" : "rgba(79,142,247,0.28)") : "rgba(248,113,113,0.28)"}`,
            fontSize: ".7rem", fontWeight: 700,
            color: resultCount > 0 ? accentSolid : (theme === "light" ? "#b02020" : "#F87171"),
            whiteSpace: "nowrap",
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

/* ── Custom Select (replaces native <select> for proper dark mode) ── */
function CustomSelect({ col, value, onChange, isDark, readOnly }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const display = value ? value[0].toUpperCase() + value.slice(1) : "Select…";

  const baseTrigger = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "9px 12px", borderRadius: 10,
    cursor: readOnly ? "not-allowed" : "pointer",
    fontSize: ".84rem", fontFamily: "Inter,sans-serif",
    transition: "all .2s", boxSizing: "border-box", width: "100%",
    border: isDark ? "1px solid rgba(79,142,247,0.3)" : "1px solid rgba(10,30,100,0.2)",
    background: readOnly
      ? (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.04)")
      : open
        ? (isDark ? "rgba(79,142,247,0.08)" : "#fff")
        : (isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)"),
    color: readOnly
      ? (isDark ? "rgba(180,210,255,0.5)" : "rgba(0,0,0,0.4)")
      : (isDark ? "#fff" : "#111827"),
    opacity: readOnly ? 0.6 : 1,
    ...(open && {
      borderColor: isDark ? "#4F8EF7" : "#2a6dd9",
      boxShadow: isDark
        ? "0 0 0 3px rgba(79,142,247,0.16)"
        : "0 0 0 3px rgba(42,109,217,0.12)",
    }),
  };

  const dropStyle = {
    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
    borderRadius: 10, overflow: "hidden", zIndex: 99999,
    background: isDark ? "rgba(10,15,50,0.97)" : "#fff",
    border: isDark
      ? "1px solid rgba(79,142,247,0.35)"
      : "1px solid rgba(10,30,100,0.18)",
    boxShadow: isDark
      ? "0 8px 30px rgba(0,0,0,0.45)"
      : "0 8px 24px rgba(10,30,100,0.12)",
    animation: "csDropIn .15s ease",
  };

  return (
    <div ref={wrapRef} style={{ position: "relative", userSelect: "none" }}>
      <style>{`
        @keyframes csDropIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
      <div
        style={baseTrigger}
        onClick={() => !readOnly && setOpen(o => !o)}
        onMouseEnter={e => {
          if (readOnly || open) return;
          e.currentTarget.style.borderColor = isDark ? "#4F8EF7" : "#2a6dd9";
          e.currentTarget.style.background  = isDark ? "rgba(79,142,247,0.08)" : "#fff";
        }}
        onMouseLeave={e => {
          if (open) return;
          e.currentTarget.style.borderColor = isDark ? "rgba(79,142,247,0.3)" : "rgba(10,30,100,0.2)";
          e.currentTarget.style.background  = isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)";
        }}
      >
        <span>{display}</span>
        <span style={{
          display: "flex", opacity: 0.55,
          transform: open ? "rotate(180deg)" : "none",
          transition: "transform .2s",
        }}>
          <IcoChevron />
        </span>
      </div>

      {open && (
        <div style={dropStyle}>
          {col.options.map(opt => {
            const selected = value === opt;
            const label = opt[0].toUpperCase() + opt.slice(1);
            return (
              <div
                key={opt}
                onClick={() => { onChange(col.key, opt); setOpen(false); }}
                style={{
                  padding: "9px 12px", fontSize: ".84rem",
                  fontFamily: "Inter,sans-serif", cursor: "pointer",
                  fontWeight: selected ? 700 : 400,
                  transition: "background .15s",
                  background: selected
                    ? (isDark ? "rgba(79,142,247,0.18)" : "rgba(42,109,217,0.09)")
                    : "transparent",
                  color: selected
                    ? (isDark ? "#fff" : "#1a50b5")
                    : (isDark ? "rgba(200,220,255,0.9)" : "#111827"),
                }}
                onMouseEnter={e => {
                  if (!selected) e.currentTarget.style.background = isDark
                    ? "rgba(79,142,247,0.1)" : "rgba(42,109,217,0.06)";
                }}
                onMouseLeave={e => {
                  if (!selected) e.currentTarget.style.background = "transparent";
                }}
              >
                {label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── CustField ── */
function CustField({ col, value, onChange, theme = "dark", readOnly = false }) {
  const isDark = theme === "dark";

  const labelStyle = {
    fontSize: ".67rem", fontWeight: 700, textTransform: "uppercase",
    letterSpacing: ".08em", fontFamily: "Inter,sans-serif",
    color: isDark ? "rgba(180,210,255,0.75)" : "rgba(0,0,0,0.65)",
  };
  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: isDark ? "1px solid rgba(79,142,247,0.3)" : "1px solid rgba(10,30,100,0.2)",
    background: readOnly
      ? (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.04)")
      : (isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)"),
    color: readOnly
      ? (isDark ? "rgba(180,210,255,0.5)" : "rgba(0,0,0,0.4)")
      : (isDark ? "#fff" : "#111827"),
    fontSize: ".84rem", fontFamily: "Inter,sans-serif",
    outline: "none", transition: "border-color .2s, box-shadow .2s",
    boxSizing: "border-box",
    cursor: readOnly ? "not-allowed" : "text",
  };

  const handleFocus = (e) => {
    if (readOnly) return;
    e.target.style.borderColor = isDark ? "#4F8EF7" : "#2a6dd9";
    e.target.style.boxShadow   = isDark ? "0 0 0 3px rgba(79,142,247,0.16)" : "0 0 0 3px rgba(42,109,217,0.12)";
    if (!isDark) e.target.style.background = "#fff";
  };
  const handleBlur = (e) => {
    e.target.style.borderColor = isDark ? "rgba(79,142,247,0.3)" : "rgba(10,30,100,0.2)";
    e.target.style.boxShadow   = "none";
    if (!isDark && !readOnly) e.target.style.background = "rgba(255,255,255,0.7)";
  };

  /* Select → custom component */
  if (col.type === "select") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={labelStyle}>{col.label}</label>
      <CustomSelect
        col={col}
        value={value}
        onChange={onChange}
        isDark={isDark}
        readOnly={readOnly}
      />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={labelStyle}>{col.label}</label>
      <input
        style={inputStyle}
        type={col.type === "date" ? "date" : "text"}
        value={value || ""}
        onChange={e => !readOnly && onChange(col.key, e.target.value)}
        readOnly={readOnly}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    </div>
  );
}

function Snack({ msg, severity, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  const isSuccess = severity === "success";
  return createPortal(
    <div style={{
      position: "fixed", bottom: 24, right: 22, zIndex: 999999,
      padding: "11px 18px", borderRadius: 12, fontSize: ".84rem", fontWeight: 600,
      fontFamily: "Inter,sans-serif", boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
      background: isSuccess
        ? "linear-gradient(135deg,#057a52,#0f9e6e)"
        : "linear-gradient(135deg,#a82424,#d14040)",
      color: "#fff",
    }}>
      {msg}
    </div>,
    document.body
  );
}

/* ── Transfer Popover ── */
function TransferPopover({ anchor, onSelect, onClose, theme = "dark" }) {
  const isDark = theme === "dark";
  const popRef = useRef(null);

  useEffect(() => {
    const handle = (e) => {
      if (popRef.current && !popRef.current.contains(e.target) && !anchor.contains(e.target))
        onClose();
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [anchor, onClose]);

  const rect = anchor.getBoundingClientRect();
  const top  = rect.bottom + window.scrollY + 6;
  const left = rect.left + window.scrollX - 80;

  const btnStyle = {
    display: "flex", alignItems: "center", gap: 8,
    width: "100%", padding: "9px 14px",
    background: "transparent", border: "none",
    color: isDark ? "rgba(200,220,255,0.85)" : "#111827",
    fontSize: ".8rem", fontFamily: "Inter,sans-serif", fontWeight: 600,
    cursor: "pointer", borderRadius: 8, transition: "all .15s",
    textAlign: "left",
  };

  return createPortal(
    <div ref={popRef} style={{
      position: "absolute", top, left,
      background: isDark ? "rgba(10,15,50,0.95)" : "rgba(255,255,255,0.98)",
      border: isDark ? "1px solid rgba(79,142,247,0.3)" : "1px solid rgba(10,30,100,0.15)",
      borderRadius: 12,
      boxShadow: isDark
        ? "0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)"
        : "0 8px 30px rgba(10,30,100,0.15)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      padding: "6px", zIndex: 999998, minWidth: 180,
      animation: "popIn .18s cubic-bezier(0.34,1.56,0.64,1)",
    }}>
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.96); }
          to   { opacity: 1; transform: none; }
        }
      `}</style>
      <div style={{
        fontSize: ".62rem", fontWeight: 800, textTransform: "uppercase",
        letterSpacing: ".1em",
        color: isDark ? "rgba(120,150,200,0.6)" : "rgba(0,0,0,0.4)",
        padding: "4px 14px 6px", fontFamily: "Inter,sans-serif",
      }}>
        Transfer to
      </div>
      <button
        style={btnStyle}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.12)"; e.currentTarget.style.color = "#F59E0B"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = isDark ? "rgba(200,220,255,0.85)" : "#111827"; }}
        onClick={() => onSelect("giftcity")}
      >
        <IcoGift /> Gift City Inactive
      </button>
      <button
        style={btnStyle}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(230,126,34,0.12)"; e.currentTarget.style.color = "#E67E22"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = isDark ? "rgba(200,220,255,0.85)" : "#111827"; }}
        onClick={() => onSelect("prospects")}
      >
        <IcoProspect /> Prospects
      </button>
    </div>,
    document.body
  );
}

/* ── Main Component ── */
export default function Customers({ inline = false, onDataChange, theme = "dark" }) {
  const isDark = theme === "dark";
  const [rows,    setRows]    = useState([]);
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(false);
  const [dlg,     setDlg]     = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form,    setForm]    = useState({});
  const [delId,   setDelId]   = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [snack,   setSnack]   = useState(null);

  const [popoverAnchor, setPopoverAnchor] = useState(null);
  const [popoverRow,    setPopoverRow]    = useState(null);

  const [transferType,   setTransferType]   = useState(null);
  const [transferForm,   setTransferForm]   = useState({});
  const [transferSaving, setTransferSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch(`${API}/customers`); setRows((await r.json()) ?? []); }
    catch { showSnack("Failed to load", "error"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const filteredRows = search.trim()
    ? rows.filter(r => (r.customer_name || "").toLowerCase().includes(search.trim().toLowerCase()))
    : rows;

  const showSnack = (msg, severity = "success") => setSnack({ msg, severity });
  const openAdd   = () => { setEditRow(null); setForm(emptyRow()); setDlg(true); };
  const openEdit  = (row) => { setEditRow(row); setForm({ ...row }); setDlg(true); };
  const setField  = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    const url    = editRow ? `${API}/customers/${editRow.id}` : `${API}/customers`;
    const method = editRow ? "PUT" : "POST";
    try {
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw 0;
      showSnack(editRow ? "Updated!" : "Added!"); setDlg(false); load(); onDataChange?.();
    } catch { showSnack("Save failed", "error"); }
  };

  const del = async () => {
    try {
      const r = await fetch(`${API}/customers/${delId}`, { method: "DELETE" });
      if (!r.ok) throw 0;
      showSnack("Deleted"); setConfirm(false); load(); onDataChange?.();
    } catch { showSnack("Delete failed", "error"); }
  };

  const openTransferPopover = (e, row) => {
    e.stopPropagation();
    setPopoverRow(row);
    setPopoverAnchor(e.currentTarget);
  };

  const handleTransferSelect = (type) => {
    setPopoverAnchor(null);
    setTransferType(type);
    setTransferForm(type === "giftcity" ? toGiftCityInactive(popoverRow) : toProspects(popoverRow));
  };

  const setTransferField = (k, v) => setTransferForm(p => ({ ...p, [k]: v }));

  const saveTransfer = async () => {
  setTransferSaving(true);
  try {
    const url = transferType === "giftcity"
      ? `${API}/gift-city/inactive`
      : `${API}/interested`;

    let payload = transferForm;

    // ✅ FIX FOR PROSPECTS
    if (transferType === "prospects") {
      payload = {
        ...transferForm,
        discussion_date: transferForm.discussion_date || null,
        next_action_date: transferForm.next_action_date || null,
        next_action: transferForm.next_action || "",
      };
    }

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) throw new Error(`HTTP ${r.status}`);

    showSnack("✓ Added to Prospects!");

    // ✅ CLOSE + REFRESH
    setTransferType(null);
    load(); // refresh customers
    onDataChange?.();

  } catch (e) {
    showSnack(e.message || "Transfer failed", "error");
  } finally {
    setTransferSaving(false);
  }
};
  /* ── Shared dialog styles ── */
  const ovStyle = {
    position: "fixed", inset: 0,
    background: isDark ? "rgba(0,0,10,0.55)" : "rgba(0,20,80,0.35)",
    backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 99999, padding: 16, boxSizing: "border-box",
  };
  const boxStyle = {
    background: isDark ? "rgba(7,9,30,0.85)" : "rgba(255,255,255,0.82)",
    backdropFilter: isDark ? "blur(44px) saturate(160%)" : "blur(40px) saturate(180%)",
    WebkitBackdropFilter: isDark ? "blur(44px) saturate(160%)" : "blur(40px) saturate(180%)",
    border: isDark ? "1px solid rgba(79,142,247,0.52)" : "1px solid rgba(10,30,100,0.2)",
    borderRadius: 18,
    boxShadow: isDark
      ? "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.09)"
      : "0 8px 40px rgba(10,30,100,0.15)",
    width: "100%", maxWidth: "min(460px, calc(100vw - 32px))",
    maxHeight: "calc(100vh - 40px)", overflowY: "auto",
    boxSizing: "border-box", fontFamily: "Inter,sans-serif",
    animation: "custDlgIn .32s cubic-bezier(0.34,1.56,0.64,1)",
  };
  const hdrStyle = {
    display: "flex", alignItems: "center", gap: 12,
    padding: "16px 20px 12px",
    borderBottom: isDark ? "1px solid rgba(79,142,247,0.18)" : "1px solid rgba(10,30,100,0.12)",
    background: isDark ? "transparent" : "rgba(135,206,250,0.15)",
    borderRadius: "18px 18px 0 0",
  };
  const bodyStyle = {
    padding: "16px 20px", display: "flex", flexDirection: "column",
    gap: 12, maxHeight: "55vh", overflowY: "auto", background: "transparent",
  };
  const footStyle = {
    display: "flex", justifyContent: "flex-end", gap: 8,
    padding: "12px 20px",
    borderTop: isDark ? "1px solid rgba(79,142,247,0.15)" : "1px solid rgba(10,30,100,0.12)",
    background: "transparent", borderRadius: "0 0 18px 18px",
  };
  const ttlStyle    = { fontSize: ".95rem", fontWeight: 800, color: isDark ? "#fff" : "#111827" };
  const subStyle    = { fontSize: ".67rem", color: isDark ? "rgba(180,210,255,0.55)" : "rgba(0,0,0,0.5)", marginTop: 2 };
  const cancelStyle = {
    padding: "8px 14px", borderRadius: 10,
    border: isDark ? "1px solid rgba(79,142,247,0.25)" : "1px solid rgba(10,30,100,0.2)",
    background: "none",
    color: isDark ? "rgba(180,210,255,0.7)" : "rgba(0,0,0,0.65)",
    fontSize: ".8rem", fontFamily: "Inter,sans-serif", fontWeight: 600, cursor: "pointer",
    transition: "all .2s",
  };
  const primaryStyle = {
    padding: "8px 16px", borderRadius: 10, border: "none", color: "#fff",
    fontSize: ".8rem", fontFamily: "Inter,sans-serif", fontWeight: 700, cursor: "pointer",
    background: "linear-gradient(135deg,#4F8EF7,#7B5FFF)",
    boxShadow: "0 4px 16px rgba(79,142,247,0.35)",
    transition: "all .25s cubic-bezier(0.34,1.56,0.64,1)",
  };
  const dangerStyle = {
    ...primaryStyle,
    background: "linear-gradient(135deg,#EF4444,#DC2626)",
    boxShadow: "0 4px 16px rgba(239,68,68,0.3)",
  };

  const renderDialog = (title, sub, barColor, body, onClose, footerBtns) =>
    createPortal(
      <div style={ovStyle} onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={boxStyle}>
          <div style={hdrStyle}>
            <div style={{ width: 4, height: 22, borderRadius: 2, background: barColor, flexShrink: 0 }} />
            <div>
              <div style={ttlStyle}>{title}</div>
              {sub && <div style={subStyle}>{sub}</div>}
            </div>
          </div>
          <div style={bodyStyle}>{body}</div>
          <div style={footStyle}>{footerBtns}</div>
        </div>
      </div>,
      document.body
    );

  const transferCols     = transferType === "giftcity" ? GIFT_CITY_COLS : PROSPECTS_COLS;
  const transferAutoKeys = transferType === "giftcity" ? GIFT_CITY_AUTO_KEYS : PROSPECTS_AUTO_KEYS;
  const transferColor    = transferType === "giftcity" ? "#F59E0B" : "#E67E22";
  const transferTitle    = transferType === "giftcity" ? "Add to Gift City Inactive" : "Add to Prospects";
  const transferSub      = "✅ Auto-filled  ·  ✏️ Fill manually";

  return (
    <div className={`mod-wrap${isDark ? "" : " theme-light"}`}>
      <style>{`
        @keyframes custDlgIn {
          from { opacity:0; transform:translateY(16px) scale(0.97); }
          to   { opacity:1; transform:none; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="mod-hdr">
        <span className="tbl-title" style={{ fontSize: "1rem" }}>Customers</span>
        <button className="add-btn"
          style={{ background: "linear-gradient(135deg,#4F8EF7,#7B5FFF)", boxShadow: "0 4px 14px rgba(79,142,247,.32)" }}
          onClick={openAdd}>
          <IcoPlus /> Add Customer
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} resultCount={filteredRows.length} totalCount={rows.length} theme={theme} />

      <div className="tbl-hdr">
        <span className="tbl-title">All Customers</span>
        {!loading && (
          <span className="tbl-badge">
            {search.trim()
              ? <>{filteredRows.length} <span style={{ opacity: .55 }}>/ {rows.length}</span></>
              : <>{rows.length} records</>}
          </span>
        )}
      </div>

      {loading ? (
        <div className="fd-spin"><div className="spinner" /></div>
      ) : (
        <div className="tbl-wrap">
          <table className="fd-tbl">
            <thead>
              <tr>
                <th style={{ width: 42 }}>#</th>
                {COLS.map(c => <th key={c.key}>{c.label}</th>)}
                <th style={{ textAlign: "center", width: 110 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr><td className="fd-empty" colSpan={COLS.length + 2}>
                  {search.trim()
                    ? <>No customers match "<strong style={{ color: "#4F8EF7" }}>{search}</strong>"</>
                    : 'No customers yet. Click "Add Customer" to get started.'}
                </td></tr>
              ) : filteredRows.map((row, i) => (
                <tr key={row.id}>
                  <td className="fd-num">{i + 1}</td>
                  <td><Highlight text={row.customer_name} query={search} theme={theme} /></td>
                  <td><span style={{ color: "#4F8EF7", fontWeight: 700 }}>{fmtAmount(row.amount_invested)}</span></td>
                  <td><span className={`chip chip-${row.esops_rsus_stocks === "yes" ? "yes" : "no"}`}>{row.esops_rsus_stocks === "yes" ? "Yes" : "No"}</span></td>
                  <td><span className={`chip chip-${row.gift_city_ac === "yes" ? "yes" : "no"}`}>{row.gift_city_ac === "yes" ? "Yes" : "No"}</span></td>
                  <td>
                    <div className="act-cell">
                      <button className="ab ab-edit" title="Edit" onClick={() => openEdit(row)}><IcoEdit /></button>
                      <button
                        className="ab"
                        title="Transfer to…"
                        style={{
                          color: "#10B981", background: "rgba(16,185,129,0.10)",
                          border: "1px solid rgba(16,185,129,0.2)", borderRadius: 7,
                          width: 26, height: 26, display: "flex", alignItems: "center",
                          justifyContent: "center", cursor: "pointer", transition: "all .15s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.22)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(16,185,129,0.10)"; }}
                        onClick={e => openTransferPopover(e, row)}
                      >
                        <IcoTransfer />
                      </button>
                      <button className="ab ab-del" title="Delete" onClick={() => { setDelId(row.id); setConfirm(true); }}><IcoDel /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Transfer Popover ── */}
      {popoverAnchor && (
        <TransferPopover
          anchor={popoverAnchor}
          onSelect={handleTransferSelect}
          onClose={() => setPopoverAnchor(null)}
          theme={theme}
        />
      )}

      {/* ── Transfer Dialog ── */}
      {transferType && renderDialog(
        transferTitle, transferSub, transferColor,
        <>
          {transferCols.map(c => {
            const isAuto = transferAutoKeys.has(c.key);
            return (
              <div key={c.key}>
                <CustField col={c} value={transferForm[c.key]} onChange={setTransferField} theme={theme} readOnly={isAuto} />
                {isAuto ? (
                  <div style={{ fontSize: ".67rem", marginTop: 3, marginLeft: 2, color: "#10B981", fontWeight: 600 }}>✅ Auto-filled</div>
                ) : (
                  <div style={{ fontSize: ".67rem", marginTop: 3, marginLeft: 2, color: transferColor, fontWeight: 600 }}>✏️ Fill manually</div>
                )}
              </div>
            );
          })}
        </>,
        () => setTransferType(null),
        <>
          <button style={cancelStyle} onClick={() => setTransferType(null)} disabled={transferSaving}
            onMouseEnter={e => { e.currentTarget.style.color = isDark ? "#fff" : "#000"; e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(10,30,100,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = isDark ? "rgba(180,210,255,0.7)" : "rgba(0,0,0,0.65)"; e.currentTarget.style.borderColor = isDark ? "rgba(79,142,247,0.25)" : "rgba(10,30,100,0.2)"; }}>
            Cancel
          </button>
          <button
            style={{
              ...primaryStyle,
              background: `linear-gradient(135deg,${transferColor},${transferType === "giftcity" ? "#d97706" : "#ca6f1e"})`,
              boxShadow: `0 4px 16px ${transferType === "giftcity" ? "rgba(245,158,11,0.35)" : "rgba(230,126,34,0.35)"}`,
              opacity: transferSaving ? 0.7 : 1,
            }}
            onClick={saveTransfer}
            disabled={transferSaving}
            onMouseEnter={e => { if (!transferSaving) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.filter = "brightness(1.12)"; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.filter = "none"; }}
          >
            {transferSaving ? "Transferring…" : "Transfer"}
          </button>
        </>
      )}

      {/* ── Add / Edit Dialog ── */}
      {dlg && renderDialog(
        editRow ? "Edit Customer" : "Add Customer",
        "Fill in the customer details below",
        "#4F8EF7",
        COLS.map(c => <CustField key={c.key} col={c} value={form[c.key]} onChange={setField} theme={theme} />),
        () => setDlg(false),
        <>
          <button style={cancelStyle} onClick={() => setDlg(false)}
            onMouseEnter={e => { e.currentTarget.style.color = isDark ? "#fff" : "#000"; e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(10,30,100,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = isDark ? "rgba(180,210,255,0.7)" : "rgba(0,0,0,0.65)"; e.currentTarget.style.borderColor = isDark ? "rgba(79,142,247,0.25)" : "rgba(10,30,100,0.2)"; }}>
            Cancel
          </button>
          <button style={primaryStyle} onClick={save}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.filter = "brightness(1.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.filter = "none"; }}>
            {editRow ? "Update" : "Save"}
          </button>
        </>
      )}

      {/* ── Confirm Delete ── */}
      {confirm && renderDialog(
        "Confirm Delete", "This action cannot be undone", "#EF4444",
        <p style={{ color: theme === "dark" ? "white" : "#000", fontSize: ".84rem", lineHeight: 1.6, margin: 0 }}>
          Are you sure you want to delete this customer record?
        </p>,
        () => setConfirm(false),
        <>
          <button style={cancelStyle} onClick={() => setConfirm(false)}
            onMouseEnter={e => { e.currentTarget.style.color = isDark ? "#fff" : "#000"; }}
            onMouseLeave={e => { e.currentTarget.style.color = isDark ? "rgba(180,210,255,0.7)" : "rgba(0,0,0,0.65)"; }}>
            Cancel
          </button>
          <button style={dangerStyle} onClick={del}
            onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}>
            Delete
          </button>
        </>
      )}

      {snack && <Snack {...snack} onClose={() => setSnack(null)} />}
    </div>
  );
}