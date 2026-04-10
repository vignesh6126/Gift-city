import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

const API = import.meta.env.VITE_API_URL;

const COLS = [
  { key: "amc_name",           label: "AMC Name",          type: "text"   },
  { key: "product_name",       label: "Product Name",       type: "text"   },
  { key: "min_investment",     label: "Min Investment",     type: "text"   },
  { key: "onboarding_process", label: "Onboarding Process", type: "select", options: ["offline", "online"] },
  { key: "structure",          label: "Structure",          type: "select", options: [] },
  { key: "lock_in",            label: "Lock In",            type: "text"   },
];

const STRUCTURE_OPTIONS = {
  cat3:   ["outbound/cat-III", "inbound/cat-III"],
  retail: ["outbound/retail",  "inbound/retail"],
};

const emptyRow = (tab) => ({
  amc_name:           "",
  product_name:       "",
  min_investment:     "",
  onboarding_process: "offline",
  structure:          STRUCTURE_OPTIONS[tab][0],
  lock_in:            "",
});

const fmtAmount = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  const n = Number(val);
  if (isNaN(n)) return "—";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000)     return "$" + (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return "$" + n.toLocaleString("en-US");
};

const TABS = [
  { id: "cat3",   label: "Cat-III", match: (s) => s?.includes("cat-III") },
  { id: "retail", label: "Retail",  match: (s) => s?.includes("retail")  },
];

/* ── Icons ── */
const IcoEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoDel    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoPlus   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>;
const IcoSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const IcoClear  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>;
const IcoShare  = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2"/>
    <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

/* ── Highlight search match ── */
function Highlight({ text, query, theme = "dark" }) {
  if (!query || !text) return <>{text ?? "—"}</>;
  const str = String(text);
  const idx = str.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{str}</>;
  return (
    <>
      {str.slice(0, idx)}
      <mark style={{
        background: theme === "light" ? "rgba(15,158,110,0.2)" : "rgba(52,211,153,0.3)",
        color: theme === "light" ? "#065f46" : "#fff",
        borderRadius: 3, padding: "0 1px",
      }}>
        {str.slice(idx, idx + query.length)}
      </mark>
      {str.slice(idx + query.length)}
    </>
  );
}

/* ── Search bar ── */
function SearchBar({ value, onChange, tabLabel, resultCount, totalCount, theme = "dark" }) {
  const inputRef = useRef(null);
  const isActive = value.length > 0;
  const isLight  = theme === "light";

  const accent       = isLight ? "rgba(15,158,110,0.8)"            : "rgba(52,211,153,0.7)";
  const accentSolid  = isLight ? "#0f9e6e"                         : "#34D399";
  const borderIdle   = isLight ? "rgba(0,0,0,0.2)"                 : "rgba(52,211,153,0.22)";
  const borderActive = isLight ? "rgba(15,158,110,0.6)"            : "rgba(52,211,153,0.55)";
  const bgIdle       = isLight ? "rgba(255,255,255,0.6)"           : "rgba(10,16,60,0.5)";
  const bgActive     = isLight ? "rgba(15,158,110,0.07)"           : "rgba(52,211,153,0.08)";
  const shadowActive = isLight ? "0 0 0 3px rgba(15,158,110,0.12)" : "0 0 0 3px rgba(52,211,153,0.12)";
  const shadowFocus  = isLight ? "0 0 0 3px rgba(15,158,110,0.15)" : "0 0 0 3px rgba(52,211,153,0.15)";
  const clearBg      = isLight ? "rgba(15,158,110,0.14)"           : "rgba(52,211,153,0.18)";
  const clearBgHov   = isLight ? "rgba(15,158,110,0.28)"           : "rgba(52,211,153,0.35)";
  const clearColor   = isLight ? "rgba(0,0,0,0.55)"                : "rgba(180,210,255,0.8)";
  const sectionBg    = isLight ? "rgba(0,0,0,0.02)"                : "rgba(52,211,153,0.02)";
  const sectionBdr   = isLight ? "1px solid rgba(0,0,0,0.1)"       : "1px solid rgba(52,211,153,0.12)";

  return (
    <div style={{ padding: "10px 20px 12px", borderBottom: sectionBdr, background: sectionBg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 420 }}>
          <span style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            color: isActive ? accentSolid : (isLight ? "rgba(0,0,0,0.3)" : "rgba(160,190,255,0.4)"),
            display: "flex", pointerEvents: "none", transition: "color .2s",
          }}>
            <IcoSearch />
          </span>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={`Search AMC or product name in ${tabLabel}…`}
            style={{
              width: "100%", padding: "8px 34px 8px 32px", borderRadius: 10,
              border: `1px solid ${isActive ? borderActive : borderIdle}`,
              background: isActive ? bgActive : bgIdle,
              color: isLight ? "#111827" : "#fff",
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
            <button
              onClick={() => { onChange(""); inputRef.current?.focus(); }}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: clearBg, border: "none", borderRadius: "50%",
                width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: clearColor, transition: "all .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = clearBgHov; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = clearBg;    e.currentTarget.style.color = clearColor; }}
            >
              <IcoClear />
            </button>
          )}
        </div>
        {isActive && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 12px", borderRadius: 20,
            background: resultCount > 0
              ? (isLight ? "rgba(15,158,110,0.12)" : "rgba(52,211,153,0.12)")
              : "rgba(248,113,113,0.12)",
            border: `1px solid ${resultCount > 0
              ? (isLight ? "rgba(15,158,110,0.28)" : "rgba(52,211,153,0.28)")
              : "rgba(248,113,113,0.28)"}`,
            fontSize: ".7rem", fontWeight: 700,
            color: resultCount > 0 ? accentSolid : (isLight ? "#b02020" : "#F87171"),
            animation: "srIn .18s ease", whiteSpace: "nowrap",
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

/* ── Toast notification via portal ── */
function Snack({ msg, severity, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return createPortal(
    <div style={{
      position: "fixed", bottom: 24, right: 22, zIndex: 999999,
      padding: "11px 18px", borderRadius: 12,
      fontSize: ".84rem", fontWeight: 600, fontFamily: "Inter,sans-serif",
      boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
      background: severity === "success"
        ? "linear-gradient(135deg,#057a52,#0f9e6e)"
        : "linear-gradient(135deg,#a82424,#d14040)",
      color: "#fff",
    }}>
      {msg}
    </div>,
    document.body
  );
}

/* ── Chips ── */
const onboardingChip = (val) => {
  if (val === "online")  return <span className="chip chip-yes">Online</span>;
  if (val === "offline") return <span className="chip chip-no">Offline</span>;
  return <span>—</span>;
};

const structureChip = (val) => {
  const map = {
    "outbound/cat-III": { bg: "rgba(79,142,247,0.13)",  color: "#4F8EF7", border: "rgba(79,142,247,0.28)"  },
    "inbound/cat-III":  { bg: "rgba(167,139,250,0.13)", color: "#a78bfa", border: "rgba(167,139,250,0.28)" },
    "outbound/retail":  { bg: "rgba(245,158,11,0.13)",  color: "#f59e0b", border: "rgba(245,158,11,0.28)"  },
    "inbound/retail":   { bg: "rgba(52,211,153,0.13)",  color: "#34d399", border: "rgba(52,211,153,0.28)"  },
  };
  const s = map[val] || { bg: "rgba(255,255,255,0.07)", color: "#fff", border: "rgba(255,255,255,0.15)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 20,
      fontSize: ".71rem", fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {val ?? "—"}
    </span>
  );
};

/* ── Custom Select Dropdown ── */
function CustomSelect({ options, value, onChange, isDark }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const accentC  = isDark ? "#34D399"                          : "#0f9e6e";
  const border   = isDark ? "rgba(52,211,153,0.28)"            : "rgba(10,30,100,0.18)";
  const bg       = isDark ? "rgba(255,255,255,0.04)"           : "rgba(255,255,255,0.7)";
  const color    = isDark ? "#fff"                             : "#111827";
  const dropBg   = isDark ? "#0b1120"                          : "#fff";
  const hoverBg  = isDark ? "rgba(52,211,153,0.10)"           : "rgba(15,158,110,0.07)";
  const activeBg = isDark ? "rgba(52,211,153,0.18)"           : "rgba(15,158,110,0.14)";
  const dropBdr  = isDark ? "rgba(52,211,153,0.35)"           : "rgba(10,30,100,0.18)";
  const shadow   = isDark ? "0 16px 40px rgba(0,0,0,0.7)"     : "0 8px 24px rgba(0,0,0,0.12)";
  const focusShadow = isDark
    ? "0 0 0 3px rgba(52,211,153,0.15)"
    : "0 0 0 3px rgba(15,158,110,0.1)";

  return (
    <div ref={ref} style={{ position: "relative", userSelect: "none" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "9px 12px",
          borderRadius: open ? "10px 10px 0 0" : 10,
          border: `1px solid ${open ? accentC : border}`,
          background: bg, color,
          fontSize: ".84rem", fontFamily: "Inter,sans-serif",
          cursor: "pointer",
          boxShadow: open ? focusShadow : "none",
          transition: "all .2s",
        }}
      >
        <span>{value || "Select…"}</span>
        <svg
          width="11" height="11" viewBox="0 0 24 24" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .22s", opacity: .55, flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 99999,
          background: dropBg,
          border: `1px solid ${dropBdr}`,
          borderTop: "none",
          borderRadius: "0 0 10px 10px",
          overflow: "hidden",
          boxShadow: shadow,
        }}>
          {options.map((o) => {
            const isSelected = o === value;
            return (
              <div
                key={o}
                onClick={() => { onChange(o); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 13px",
                  fontSize: ".84rem", fontFamily: "Inter,sans-serif",
                  color: isSelected ? accentC : color,
                  background: isSelected ? activeBg : "transparent",
                  fontWeight: isSelected ? 700 : 400,
                  cursor: "pointer",
                  transition: "background .15s",
                  borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"}`,
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = hoverBg; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
              >
                <span style={{ width: 14, flexShrink: 0, display: "flex", alignItems: "center" }}>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <polyline points="20 6 9 17 4 12" stroke={accentC} strokeWidth="2.5"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                {o.charAt(0).toUpperCase() + o.slice(1)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   Share to Empanelment Pending Dialog
══════════════════════════════════════════ */
function ShareToPendingDialog({ row, allRows, onClose, onSaved, theme = "dark" }) {
  const isDark = theme === "dark";

  // Count how many products share the same amc_name (including this one)
  const productCount = allRows.filter(
    r => (r.amc_name || "").toLowerCase() === (row.amc_name || "").toLowerCase()
  ).length;

  const [form, setForm] = useState({
    AMC_name:        row.amc_name || "",
    products:        productCount,
    submission_date: "",
    status:          "",
  });
  const [saving, setSaving] = useState(false);
  const [snack,  setSnack]  = useState(null);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.AMC_name.trim()) { setSnack({ msg: "AMC Name is required", severity: "error" }); return; }
    setSaving(true);
    try {
      // ── Duplicate check: fetch existing pending rows and compare AMC_name ──
      const checkRes  = await fetch(`${API}/empanelment/pending`);
      const existing  = checkRes.ok ? await checkRes.json() : [];
      const duplicate = (Array.isArray(existing) ? existing : []).some(
        e => (e.AMC_name || "").toLowerCase().trim() === form.AMC_name.toLowerCase().trim()
      );
      if (duplicate) {
        setSnack({ msg: `"${form.AMC_name}" already exists in Empanelment Pending`, severity: "error" });
        setSaving(false);
        return;
      }

      const r = await fetch(`${API}/empanelment/pending`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw new Error("Save failed");
      onSaved?.();
      onClose();
    } catch (e) {
      setSnack({ msg: e.message || "Save failed", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  /* Theme tokens */
  const overlayBg  = isDark ? "rgba(0,0,10,0.65)"         : "rgba(0,20,80,0.38)";
  const boxBg      = isDark ? "rgba(7,9,30,0.92)"          : "rgba(255,255,255,0.95)";
  const boxBorder  = isDark ? "rgba(245,158,11,0.5)"       : "rgba(245,158,11,0.35)";
  const boxShadow  = isDark ? "0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)"
                            : "0 8px 40px rgba(10,30,100,0.18)";
  const hdrBg      = isDark ? "rgba(245,158,11,0.06)"      : "rgba(245,158,11,0.07)";
  const hdrBorder  = isDark ? "rgba(245,158,11,0.18)"      : "rgba(245,158,11,0.2)";
  const titleColor = isDark ? "#fff"                        : "#111827";
  const subColor   = isDark ? "rgba(180,210,255,0.5)"      : "rgba(0,0,0,0.45)";
  const ftBorder   = isDark ? "rgba(245,158,11,0.14)"      : "rgba(245,158,11,0.18)";
  const ftBg       = isDark ? "rgba(245,158,11,0.03)"      : "transparent";

  const labelSt = {
    fontSize: ".67rem", fontWeight: 700, textTransform: "uppercase",
    letterSpacing: ".08em", fontFamily: "Inter,sans-serif",
    color: isDark ? "rgba(180,210,255,0.75)" : "rgba(0,0,0,0.6)",
  };
  const inputSt = {
    width: "100%", padding: "9px 12px", borderRadius: 10, outline: "none",
    border: isDark ? "1px solid rgba(245,158,11,0.3)" : "1px solid rgba(10,30,100,0.18)",
    background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
    color: isDark ? "#fff" : "#111827",
    fontSize: ".84rem", fontFamily: "Inter,sans-serif",
    transition: "border-color .2s, box-shadow .2s", boxSizing: "border-box",
  };
  const disabledInputSt = {
    ...inputSt,
    opacity: 0.65, cursor: "not-allowed",
    background: isDark ? "rgba(245,158,11,0.06)" : "rgba(245,158,11,0.07)",
    border: isDark ? "1px solid rgba(245,158,11,0.2)" : "1px solid rgba(245,158,11,0.25)",
    color: isDark ? "#f59e0b" : "#92610a",
    fontWeight: 700,
  };
  const onFocus = (e) => {
    e.target.style.borderColor = isDark ? "#f59e0b" : "#d97706";
    e.target.style.boxShadow   = "0 0 0 3px rgba(245,158,11,0.15)";
  };
  const onBlur = (e) => {
    e.target.style.borderColor = isDark ? "rgba(245,158,11,0.3)" : "rgba(10,30,100,0.18)";
    e.target.style.boxShadow   = "none";
  };

  const btnCancel = {
    padding: "8px 14px", borderRadius: 10, cursor: "pointer",
    border: isDark ? "1px solid rgba(245,158,11,0.28)" : "1px solid rgba(10,30,100,0.18)",
    background: "transparent",
    color: isDark ? "rgba(180,210,255,0.7)" : "rgba(0,0,0,0.6)",
    fontSize: ".8rem", fontFamily: "Inter,sans-serif", fontWeight: 600, transition: "all .2s",
  };
  const btnSave = {
    padding: "8px 18px", borderRadius: 10, border: "none", cursor: saving ? "not-allowed" : "pointer",
    color: "#fff", fontSize: ".8rem", fontFamily: "Inter,sans-serif", fontWeight: 700,
    background: "linear-gradient(135deg,#f59e0b,#d97706)",
    boxShadow: "0 4px 16px rgba(245,158,11,0.35)", transition: "all .2s",
    opacity: saving ? 0.7 : 1,
  };

  /* Field definitions */
  const PENDING_FIELDS = [
    { key: "AMC_name",        label: "AMC Name",       auto: true,  note: "✦ Auto-filled from product" },
    { key: "products",        label: "Products Count",  auto: true,  note: "✦ Auto-counted from products table" },
    { key: "submission_date", label: "Submission Date", auto: false, type: "date" },
    { key: "status",          label: "Status",          auto: false },
  ];

  return createPortal(
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 999999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, boxSizing: "border-box",
        background: overlayBg,
        backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <style>{`
        @keyframes shareDlgIn {
          from { opacity:0; transform:translateY(18px) scale(0.96); }
          to   { opacity:1; transform:none; }
        }
      `}</style>
      <div style={{
        width: "100%", maxWidth: "min(460px, calc(100vw - 32px))",
        maxHeight: "calc(100vh - 40px)", overflowY: "auto",
        borderRadius: 18, boxSizing: "border-box",
        fontFamily: "Inter,sans-serif",
        animation: "shareDlgIn .32s cubic-bezier(0.34,1.56,0.64,1)",
        background: boxBg,
        border: `1px solid ${boxBorder}`,
        boxShadow: boxShadow,
        backdropFilter: "blur(44px) saturate(160%)",
        WebkitBackdropFilter: "blur(44px) saturate(160%)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 20px 12px",
          borderRadius: "18px 18px 0 0",
          borderBottom: `1px solid ${hdrBorder}`,
          background: hdrBg,
        }}>
          <div style={{ width: 4, height: 22, borderRadius: 2, background: "#f59e0b", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: ".95rem", fontWeight: 800, color: titleColor, display: "flex", alignItems: "center", gap: 7 }}>
              <IcoShare />
              Send to Empanelment Pending
            </div>
            <div style={{ fontSize: ".67rem", marginTop: 3, color: subColor }}>
              Orange = fill manually · Yellow = auto-filled from product
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {PENDING_FIELDS.map(f => (
            <div key={f.key} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={labelSt}>{f.label}</label>
              <input
                style={f.auto ? disabledInputSt : inputSt}
                type={f.type === "date" ? "date" : "text"}
                value={form[f.key] ?? ""}
                onChange={e => !f.auto && setField(f.key, e.target.value)}
                onFocus={f.auto ? undefined : onFocus}
                onBlur={f.auto ? undefined : onBlur}
                readOnly={f.auto}
                disabled={f.auto}
              />
              <div style={{
                fontSize: ".67rem", fontWeight: 600, paddingLeft: 2,
                color: f.auto
                  ? (isDark ? "#f59e0b" : "#92610a")
                  : (isDark ? "rgba(245,158,11,0.65)" : "rgba(180,100,0,0.7)"),
              }}>
                {f.auto ? f.note : "⚠ Fill manually"}
              </div>
            </div>
          ))}

          {/* Product preview card */}
          <div style={{
            padding: "10px 14px", borderRadius: 10,
            border: isDark ? "1px solid rgba(245,158,11,0.2)" : "1px solid rgba(245,158,11,0.25)",
            background: isDark ? "rgba(245,158,11,0.05)" : "rgba(245,158,11,0.06)",
            display: "flex", flexDirection: "column", gap: 5,
          }}>
            <div style={{ fontSize: ".67rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", color: isDark ? "#f59e0b" : "#92610a" }}>
              Product being shared
            </div>
            <div style={{ fontSize: ".82rem", fontWeight: 600, color: isDark ? "rgba(255,255,255,0.85)" : "#111827" }}>
              {row.product_name || "—"}
            </div>
            <div style={{ fontSize: ".75rem", color: isDark ? "rgba(200,220,255,0.55)" : "rgba(0,0,0,0.5)" }}>
              {row.structure || "—"} · {fmtAmount(row.min_investment)} · {row.lock_in || "No lock-in"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: "flex", justifyContent: "flex-end", gap: 8,
          padding: "12px 20px", borderRadius: "0 0 18px 18px",
          borderTop: `1px solid ${ftBorder}`,
          background: ftBg,
        }}>
          <button
            style={btnCancel}
            onClick={onClose}
            onMouseEnter={e => { e.currentTarget.style.color = isDark ? "#fff" : "#000"; e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(10,30,100,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = isDark ? "rgba(180,210,255,0.7)" : "rgba(0,0,0,0.6)"; e.currentTarget.style.borderColor = isDark ? "rgba(245,158,11,0.28)" : "rgba(10,30,100,0.18)"; }}
          >
            Cancel
          </button>
          <button
            style={btnSave}
            onClick={save}
            disabled={saving}
            onMouseEnter={e => { if (!saving) { e.currentTarget.style.filter = "brightness(1.12)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
            onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }}
          >
            {saving ? "Saving…" : "Save to Pending"}
          </button>
        </div>
      </div>

      {snack && <Snack {...snack} onClose={() => setSnack(null)} />}
    </div>,
    document.body
  );
}

/* ════════════════════════════════════════
   Main Component
════════════════════════════════════════ */
export default function Products({ inline = false, onDataChange, theme = "dark" }) {
  const isDark = theme === "dark";

  const [rows,      setRows]      = useState([]);
  const [search,    setSearch]    = useState("");
  const [loading,   setLoading]   = useState(false);
  const [tab,       setTab]       = useState("cat3");
  const [dlg,       setDlg]       = useState(false);
  const [editRow,   setEditRow]   = useState(null);
  const [form,      setForm]      = useState({});
  const [delId,     setDelId]     = useState(null);
  const [confirm,   setConfirm]   = useState(false);
  const [shareRow,  setShareRow]  = useState(null);   // row being shared to pending
  const [snack,     setSnack]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try   { const r = await fetch(`${API}/products`); setRows((await r.json()) ?? []); }
    catch { showSnack("Failed to load", "error"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSearch(""); }, [tab]);

  const showSnack = (msg, sev = "success") => setSnack({ msg, severity: sev });
  const openAdd   = () => { setEditRow(null); setForm(emptyRow(tab)); setDlg(true); };
  const openEdit  = (row) => { setEditRow(row); setForm({ ...row }); setDlg(true); };
  const setField  = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    const url    = editRow ? `${API}/products/${editRow.id}` : `${API}/products`;
    const method = editRow ? "PUT" : "POST";
    try {
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw 0;
      showSnack(editRow ? "Updated!" : "Added!"); setDlg(false); load(); onDataChange?.();
    } catch { showSnack("Save failed", "error"); }
  };

  const del = async () => {
    try {
      const r = await fetch(`${API}/products/${delId}`, { method: "DELETE" });
      if (!r.ok) throw 0;
      showSnack("Deleted"); setConfirm(false); load(); onDataChange?.();
    } catch { showSnack("Delete failed", "error"); }
  };

  const activeTab   = TABS.find(t => t.id === tab);
  const tabFiltered = rows.filter(r => activeTab.match(r.structure));
  const cat3Count   = rows.filter(r => r.structure?.includes("cat-III")).length;
  const retailCount = rows.filter(r => r.structure?.includes("retail")).length;

  const filteredRows = search.trim()
    ? tabFiltered.filter(r => {
        const q = search.trim().toLowerCase();
        return (r.amc_name || "").toLowerCase().includes(q) ||
               (r.product_name || "").toLowerCase().includes(q);
      })
    : tabFiltered;

  const colsForTab = COLS.map(c =>
    c.key === "structure" ? { ...c, options: STRUCTURE_OPTIONS[tab] } : c
  );

  /* Dialog styles */
  const dlgOverlay = {
    position: "fixed", inset: 0, zIndex: 99999,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 16, boxSizing: "border-box",
    background: isDark ? "rgba(0,0,10,0.6)" : "rgba(0,20,80,0.38)",
    backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
  };
  const dlgBox = {
    width: "100%", maxWidth: "min(460px, calc(100vw - 32px))",
    maxHeight: "calc(100vh - 40px)", overflowY: "auto",
    borderRadius: 18, boxSizing: "border-box",
    fontFamily: "Inter,sans-serif",
    animation: "prodDlgIn .32s cubic-bezier(0.34,1.56,0.64,1)",
    background: isDark ? "rgba(7,9,30,0.88)" : "rgba(255,255,255,0.9)",
    border: isDark ? "1px solid rgba(52,211,153,0.45)" : "1px solid rgba(10,30,100,0.15)",
    boxShadow: isDark
      ? "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07)"
      : "0 8px 40px rgba(10,30,100,0.18)",
    backdropFilter: isDark ? "blur(44px) saturate(160%)" : "blur(40px) saturate(180%)",
    WebkitBackdropFilter: isDark ? "blur(44px) saturate(160%)" : "blur(40px) saturate(180%)",
  };
  const dlgHeader = {
    display: "flex", alignItems: "center", gap: 12,
    padding: "16px 20px 12px", borderRadius: "18px 18px 0 0",
    borderBottom: isDark ? "1px solid rgba(52,211,153,0.15)" : "1px solid rgba(10,30,100,0.1)",
    background: isDark ? "transparent" : "rgba(52,211,153,0.05)",
  };
  const dlgBody = {
    padding: "16px 20px",
    display: "flex", flexDirection: "column", gap: 12,
    maxHeight: "55vh", overflowY: "auto",
    overflowX: "visible",
  };
  const dlgFooter = {
    display: "flex", justifyContent: "flex-end", gap: 8,
    padding: "12px 20px", borderRadius: "0 0 18px 18px",
    borderTop: isDark ? "1px solid rgba(52,211,153,0.12)" : "1px solid rgba(10,30,100,0.08)",
  };
  const dlgTitle = { fontSize: ".95rem", fontWeight: 800, color: isDark ? "#fff" : "#111827" };
  const dlgSub   = { fontSize: ".67rem", marginTop: 2, color: isDark ? "rgba(180,210,255,0.5)" : "rgba(0,0,0,0.45)" };

  const btnCancel = {
    padding: "8px 14px", borderRadius: 10, cursor: "pointer",
    border: isDark ? "1px solid rgba(52,211,153,0.25)" : "1px solid rgba(10,30,100,0.18)",
    background: "transparent",
    color: isDark ? "rgba(180,210,255,0.7)" : "rgba(0,0,0,0.6)",
    fontSize: ".8rem", fontFamily: "Inter,sans-serif", fontWeight: 600, transition: "all .2s",
  };
  const btnSave = {
    padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer", color: "#fff",
    fontSize: ".8rem", fontFamily: "Inter,sans-serif", fontWeight: 700,
    background: "linear-gradient(135deg,#34D399,#059669)",
    boxShadow: "0 4px 16px rgba(52,211,153,0.35)", transition: "all .2s",
  };
  const btnDelete = {
    padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer", color: "#fff",
    fontSize: ".8rem", fontFamily: "Inter,sans-serif", fontWeight: 700,
    background: "linear-gradient(135deg,#EF4444,#DC2626)",
    boxShadow: "0 4px 16px rgba(239,68,68,0.3)", transition: "all .2s",
  };

  const ProdField = ({ col, value, onChange }) => {
    const labelSt = {
      fontSize: ".67rem", fontWeight: 700, textTransform: "uppercase",
      letterSpacing: ".08em", fontFamily: "Inter,sans-serif",
      color: isDark ? "rgba(180,210,255,0.75)" : "rgba(0,0,0,0.6)",
    };
    const inputSt = {
      width: "100%", padding: "9px 12px", borderRadius: 10, outline: "none",
      border: isDark ? "1px solid rgba(52,211,153,0.28)" : "1px solid rgba(10,30,100,0.18)",
      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
      color: isDark ? "#fff" : "#111827",
      fontSize: ".84rem", fontFamily: "Inter,sans-serif",
      transition: "border-color .2s, box-shadow .2s", boxSizing: "border-box",
    };
    const onFocus = (e) => {
      e.target.style.borderColor = isDark ? "#34D399" : "#0f9e6e";
      e.target.style.boxShadow   = isDark ? "0 0 0 3px rgba(52,211,153,0.15)" : "0 0 0 3px rgba(15,158,110,0.1)";
      if (!isDark) e.target.style.background = "#fff";
    };
    const onBlur = (e) => {
      e.target.style.borderColor = isDark ? "rgba(52,211,153,0.28)" : "rgba(10,30,100,0.18)";
      e.target.style.boxShadow   = "none";
      if (!isDark) e.target.style.background = "rgba(255,255,255,0.7)";
    };
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <label style={labelSt}>{col.label}</label>
        {col.type === "select" ? (
          <CustomSelect
            options={col.options}
            value={value || ""}
            onChange={(v) => onChange(col.key, v)}
            isDark={isDark}
          />
        ) : (
          <input style={inputSt} type="text" value={value || ""}
            onChange={e => onChange(col.key, e.target.value)}
            onFocus={onFocus} onBlur={onBlur} />
        )}
      </div>
    );
  };

  const renderPortalDialog = (title, sub, barColor, bodyContent, onClose, footerContent) =>
    createPortal(
      <div style={dlgOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={dlgBox}>
          <div style={dlgHeader}>
            <div style={{ width: 4, height: 22, borderRadius: 2, background: barColor, flexShrink: 0 }} />
            <div>
              <div style={dlgTitle}>{title}</div>
              {sub && <div style={dlgSub}>{sub}</div>}
            </div>
          </div>
          <div style={dlgBody}>{bodyContent}</div>
          <div style={dlgFooter}>{footerContent}</div>
        </div>
      </div>,
      document.body
    );

  return (
    <div className={`mod-wrap${isDark ? "" : " theme-light"}`}>
      <style>{`
        @keyframes prodDlgIn {
          from { opacity:0; transform:translateY(18px) scale(0.96); }
          to   { opacity:1; transform:none; }
        }
        @keyframes srIn {
          from { opacity:0; transform:translateX(-6px); }
          to   { opacity:1; transform:none; }
        }
        .mod-wrap { max-width:100%; overflow:hidden; }
        .mod-wrap input::placeholder { color:rgba(160,190,255,0.35); }
        .mod-wrap.theme-light input::placeholder { color:rgba(0,0,0,0.28); }

        .prod-tbl-wrap {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .prod-tbl {
          width: 100%;
          min-width: 780px;
          border-collapse: collapse;
          table-layout: fixed;
        }
        .prod-tbl th:nth-child(1) { width: 42px; }
        .prod-tbl th:nth-child(2) { width: 14%;  }
        .prod-tbl th:nth-child(3) { width: 24%;  }
        .prod-tbl th:nth-child(4) { width: 11%;  }
        .prod-tbl th:nth-child(5) { width: 14%;  }
        .prod-tbl th:nth-child(6) { width: 17%;  }
        .prod-tbl th:nth-child(7) { width: 10%;  }
        .prod-tbl th:nth-child(8) { width: 108px; }
        .prod-tbl td,
        .prod-tbl th {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .prod-tbl td:nth-child(3) {
          white-space: normal;
          word-break: break-word;
        }

        /* share action button */
        .ab-share {
          background: rgba(245,158,11,0.12);
          color: #f59e0b;
        }
        .ab-share:hover {
          background: rgba(245,158,11,0.28);
        }
        .theme-light .ab-share {
          background: rgba(180,100,0,0.1);
          color: #92610a;
        }
        .theme-light .ab-share:hover {
          background: rgba(180,100,0,0.22);
        }
      `}</style>

      {/* ── Header ── */}
      <div className="mod-hdr">
        <div className="tabs-row">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab-pill ${tab === t.id ? "tab-active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              <span style={{
                marginLeft: 7, fontSize: ".63rem", fontWeight: 800,
                background: tab === t.id ? "rgba(255,255,255,0.15)" : "rgba(79,142,247,0.15)",
                padding: "1px 7px", borderRadius: 20,
              }}>
                {t.id === "cat3" ? cat3Count : retailCount}
              </span>
            </button>
          ))}
        </div>
        <button
          className="add-btn"
          style={{
            background: "linear-gradient(135deg,#34D399,#059669)",
            boxShadow: "0 4px 14px rgba(52,211,153,.32)",
          }}
          onClick={openAdd}
        >
          <IcoPlus /> Add Product
        </button>
      </div>

      {/* ── Search bar ── */}
      <SearchBar
        value={search}
        onChange={setSearch}
        tabLabel={activeTab.label}
        resultCount={filteredRows.length}
        totalCount={tabFiltered.length}
        theme={theme}
      />

      {/* ── Table title ── */}
      <div className="tbl-hdr">
        <span className="tbl-title">{activeTab.label} Products</span>
        {!loading && (
          <span className="tbl-badge">
            {search.trim()
              ? <>{filteredRows.length} <span style={{ opacity: .55 }}>/ {tabFiltered.length}</span></>
              : <>{tabFiltered.length} records</>}
          </span>
        )}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="fd-spin"><div className="spinner" /></div>
      ) : (
        <div className="prod-tbl-wrap">
          <table className="prod-tbl fd-tbl">
            <thead>
              <tr>
                <th style={{ width: 42 }}>#</th>
                {COLS.map(c => <th key={c.key}>{c.label}</th>)}
                <th style={{ textAlign: "center", width: 108 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="fd-empty" colSpan={COLS.length + 2}>
                    {search.trim()
                      ? <>No products match "<strong style={{ color: "#34D399" }}>{search}</strong>"</>
                      : `No ${activeTab.label} products yet. Click "Add Product" to get started.`}
                  </td>
                </tr>
              ) : filteredRows.map((row, i) => (
                <tr key={row.id}>
                  <td className="fd-num">{i + 1}</td>
                  <td><Highlight text={row.amc_name}     query={search} theme={theme} /></td>
                  <td><Highlight text={row.product_name} query={search} theme={theme} /></td>
                  <td>
                    <span style={{ color: "#34D399", fontWeight: 700 }}>
                      {fmtAmount(row.min_investment)}
                    </span>
                  </td>
                  <td>{onboardingChip(row.onboarding_process)}</td>
                  <td>{structureChip(row.structure)}</td>
                  <td>{row.lock_in ?? "—"}</td>
                  <td>
                    <div className="act-cell">
                      <button className="ab ab-edit" title="Edit"
                        onClick={() => openEdit(row)}>
                        <IcoEdit />
                      </button>
                      <button
                        className="ab ab-share"
                        title="Send to Empanelment Pending"
                        onClick={() => setShareRow(row)}
                      >
                        <IcoShare />
                      </button>
                      <button className="ab ab-del" title="Delete"
                        onClick={() => { setDelId(row.id); setConfirm(true); }}>
                        <IcoDel />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Share to Pending Dialog ── */}
      {shareRow && (
        <ShareToPendingDialog
          row={shareRow}
          allRows={rows}
          onClose={() => setShareRow(null)}
          onSaved={() => { showSnack("✓ Added to Empanelment Pending!"); onDataChange?.(); }}
          theme={theme}
        />
      )}

      {/* ADD / EDIT DIALOG */}
      {dlg && renderPortalDialog(
        editRow ? "Edit Product" : "Add Product",
        "Fill in the product details below",
        "#34D399",
        colsForTab.map(c => (
          <ProdField key={c.key} col={c} value={form[c.key]} onChange={setField} />
        )),
        () => setDlg(false),
        <>
          <button
            style={btnCancel}
            onClick={() => setDlg(false)}
            onMouseEnter={e => {
              e.currentTarget.style.color       = isDark ? "#fff" : "#000";
              e.currentTarget.style.borderColor = isDark ? "rgba(255,255,255,0.3)" : "rgba(10,30,100,0.4)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color       = isDark ? "rgba(180,210,255,0.7)" : "rgba(0,0,0,0.6)";
              e.currentTarget.style.borderColor = isDark ? "rgba(52,211,153,0.25)" : "rgba(10,30,100,0.18)";
            }}
          >
            Cancel
          </button>
          <button
            style={btnSave}
            onClick={save}
            onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.12)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.filter = "none";             e.currentTarget.style.transform = "none"; }}
          >
            {editRow ? "Update" : "Save"}
          </button>
        </>
      )}

      {/* CONFIRM DELETE */}
      {confirm && renderPortalDialog(
        "Confirm Delete",
        "This action cannot be undone",
        "#EF4444",
        <p style={{
          margin: 0, lineHeight: 1.6, fontSize: ".84rem",
          color: isDark ? "white" : "#000",
        }}>
          Are you sure you want to delete this product record?
        </p>,
        () => setConfirm(false),
        <>
          <button
            style={btnCancel}
            onClick={() => setConfirm(false)}
            onMouseEnter={e => { e.currentTarget.style.color = isDark ? "#fff" : "#000"; }}
            onMouseLeave={e => { e.currentTarget.style.color = isDark ? "rgba(180,210,255,0.7)" : "rgba(0,0,0,0.6)"; }}
          >
            Cancel
          </button>
          <button
            style={btnDelete}
            onClick={del}
            onMouseEnter={e => { e.currentTarget.style.filter = "brightness(1.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.filter = "none"; }}
          >
            Delete
          </button>
        </>
      )}

      {snack && <Snack {...snack} onClose={() => setSnack(null)} />}
    </div>
  );
}