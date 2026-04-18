import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
const API = import.meta.env.VITE_API_URL;

const COLS = [
  { key: "client_name",     label: "Client Name",    type: "text"   },
  { key: "esops_rsu",       label: "ESOPS/RSU",       type: "select", options: ["yes", "no"] },
  { key: "discussion_date", label: "Discussion Date", type: "date"   },
  { key: "next_action_date", label: "Next Action Date", type: "date" },
  { key: "next_action",     label: "Next Action",     type: "text"   },
];

const PENDING_COLS = [
  { key: "client_name",          label: "Client Name",           type: "text"   },
  { key: "amount_tobe_invested", label: "Amount to be Invested", type: "number" },
  { key: "amc_name",             label: "AMC Name",              type: "amc_autocomplete" },
  { key: "scheme",               label: "Scheme",                type: "scheme_dropdown"  },
  { key: "bank",                 label: "Bank",                  type: "select", options: ["gift", "savings", "both"] },
  { key: "submission_date",      label: "Submission Date",       type: "date"   },
  { key: "next_action_date",     label: "Next Action Date",      type: "date"   },
  { key: "status",               label: "Status",                type: "text"   },
];

const SHARE_AUTO_KEYS   = new Set(["client_name", "next_action_date"]);
const SHARE_MANUAL_KEYS = new Set(["amount_tobe_invested", "amc_name", "scheme", "bank", "submission_date", "status"]);

const toISODate = (val) => {
  if (!val) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const m = val.match(/^(\d{2})[-\/](\d{2})[-\/](\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(val);
  if (!isNaN(d)) return d.toISOString().slice(0, 10);
  return val;
};

const emptyRow = () => ({ client_name: "", esops_rsu: "no", discussion_date: "", next_action: "" });
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

const interestedToPending = (row) => ({
  client_name:          row.client_name || "",
  amount_tobe_invested: "",
  amc_name:             "",
  scheme:               "",
  bank:                 "savings",
  submission_date:      "",
  next_action_date:     toISODate(row.next_action_date) || "",
  status:               "",
});

/* ─── Icons ─── */
const IcoEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoDel    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoPlus   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>;
const IcoSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const IcoClear  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>;
const IcoShare  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><polyline points="16 6 12 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="2" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;

const ORANGE = "#E67E22";

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
        background: theme === "light" ? "rgba(42,109,217,0.2)" : "rgba(230,126,34,0.35)",
        color: theme === "light" ? "#1a50b5" : "#fff",
        borderRadius: 3,
        padding: "0 1px",
      }}>
        {str.slice(idx, idx + query.length)}
      </mark>
      {str.slice(idx + query.length)}
    </>
  );
}

/* ─── Search Bar ─── */
function SearchBar({ value, onChange, resultCount, totalCount, theme = "dark" }) {
  const inputRef = useRef(null);
  const isActive = value.length > 0;

  const accent       = theme === "light" ? "rgba(42,109,217,0.8)"            : "rgba(79,142,247,0.7)";
  const accentSolid  = theme === "light" ? "#2a6dd9"                         : "#4F8EF7";
  const borderIdle   = theme === "light" ? "rgba(0,0,0,0.2)"                 : "rgba(79,142,247,0.22)";
  const borderActive = theme === "light" ? "rgba(42,109,217,0.6)"            : "rgba(79,142,247,0.55)";
  const bgIdle       = theme === "light" ? "rgba(255,255,255,0.6)"           : "rgba(10,16,60,0.5)";
  const bgActive     = theme === "light" ? "rgba(42,109,217,0.07)"           : "rgba(79,142,247,0.08)";
  const shadowActive = theme === "light" ? "0 0 0 3px rgba(42,109,217,0.12)": "0 0 0 3px rgba(79,142,247,0.12)";
  const shadowFocus  = theme === "light" ? "0 0 0 3px rgba(42,109,217,0.15)": "0 0 0 3px rgba(79,142,247,0.15)";
  const clearBg      = theme === "light" ? "rgba(42,109,217,0.14)"           : "rgba(79,142,247,0.18)";
  const clearBgHov   = theme === "light" ? "rgba(42,109,217,0.28)"           : "rgba(79,142,247,0.35)";
  const clearColor   = theme === "light" ? "rgba(0,0,0,0.55)"               : "rgba(180,210,255,0.8)";
  const pillBg       = theme === "light" ? "rgba(42,109,217,0.12)"           : "rgba(79,142,247,0.12)";
  const pillBorder   = theme === "light" ? "rgba(42,109,217,0.28)"           : "rgba(79,142,247,0.28)";
  const pillColor    = accentSolid;
  const sectionBg    = theme === "light" ? "rgba(0,0,0,0.02)"               : "rgba(79,142,247,0.02)";
  const sectionBdr   = theme === "light" ? "1px solid rgba(0,0,0,0.1)"      : "1px solid rgba(79,142,247,0.12)";

  return (
    <div style={{ padding: "10px 20px 12px", borderBottom: sectionBdr, background: sectionBg, flexShrink: 0 }}>
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
            placeholder="Search client name or next action…"
            style={{
              width: "100%",
              padding: "8px 34px 8px 32px",
              borderRadius: 10,
              border: `1px solid ${isActive ? borderActive : borderIdle}`,
              background: isActive ? bgActive : bgIdle,
              color: theme === "light" ? "#111827" : "#fff",
              fontSize: ".82rem",
              fontFamily: "var(--fb,'Inter',sans-serif)",
              outline: "none",
              transition: "all .22s",
              boxShadow: isActive ? shadowActive : "none",
            }}
            onFocus={e => {
              e.target.style.borderColor = accent;
              e.target.style.boxShadow   = shadowFocus;
            }}
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
            background: resultCount > 0 ? pillBg : "rgba(248,113,113,0.12)",
            border: `1px solid ${resultCount > 0 ? pillBorder : "rgba(248,113,113,0.28)"}`,
            fontSize: ".7rem", fontWeight: 700,
            color: resultCount > 0 ? pillColor : (theme === "light" ? "#b02020" : "#F87171"),
            fontFamily: "var(--fh,'Inter',sans-serif)",
            animation: "srIn .18s ease",
            whiteSpace: "nowrap",
          }}>
            {resultCount > 0
              ? <><span style={{ opacity: .7 }}>↳</span> {resultCount} <span style={{ opacity: .55, fontWeight: 500 }}>of {totalCount}</span></>
              : <>No results</>
            }
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   Shared dropdown animation keyframes (injected once)
══════════════════════════════════════════════════════ */
const DROP_STYLE = `
  @keyframes dropIn {
    from { opacity:0; transform:translateY(-6px) scale(0.98); }
    to   { opacity:1; transform:none; }
  }
  @keyframes itemIn {
    from { opacity:0; transform:translateX(-4px); }
    to   { opacity:1; transform:none; }
  }
`;

/* ─── AMC Autocomplete Field ─── */
function AmcAutocomplete({ value, onChange, onAmcSelect, isDark }) {
  const [query, setQuery]      = useState(value || "");
  const [suggestions, setSugs] = useState([]);
  const [allAmcs, setAllAmcs]  = useState([]);
  const [open, setOpen]        = useState(false);
  const [focused, setFocused]  = useState(false);
  const wrapRef                = useRef(null);

  const accent        = isDark ? "#4F8EF7"                              : "#2a6dd9";
  const accentAlpha   = isDark ? "rgba(79,142,247,0.18)"               : "rgba(42,109,217,0.14)";
  const inputBg       = isDark ? "rgba(255,255,255,0.04)"              : "rgba(255,255,255,0.92)";
  const inputBgFocus  = isDark ? "rgba(79,142,247,0.07)"               : "rgba(42,109,217,0.04)";
  const inputBorder   = isDark ? "rgba(79,142,247,0.25)"               : "rgba(0,0,0,0.15)";
  const inputBdrFocus = accent;
  const inputColor    = isDark ? "#e8eeff"                             : "#111827";
  const iconColor     = isDark ? "rgba(79,142,247,0.55)"               : "rgba(42,109,217,0.45)";
  const iconColorFoc  = accent;
  const clearBg       = isDark ? "rgba(79,142,247,0.15)"               : "rgba(42,109,217,0.1)";
  const clearHov      = isDark ? "rgba(79,142,247,0.3)"                : "rgba(42,109,217,0.2)";
  const dropBg        = isDark ? "rgba(8,13,35,0.97)"                  : "rgba(255,255,255,0.98)";
  const dropBorder    = isDark ? "rgba(79,142,247,0.3)"                : "rgba(42,109,217,0.18)";
  const dropShadow    = isDark
    ? "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(79,142,247,0.12)"
    : "0 12px 40px rgba(42,109,217,0.15), 0 2px 8px rgba(0,0,0,0.08)";
  const headerBg      = isDark ? "rgba(79,142,247,0.06)"               : "rgba(42,109,217,0.04)";
  const headerBdr     = isDark ? "rgba(79,142,247,0.12)"               : "rgba(42,109,217,0.1)";
  const countBg       = isDark ? "rgba(79,142,247,0.15)"               : "rgba(42,109,217,0.1)";
  const countColor    = accent;
  const itemColor     = isDark ? "rgba(210,225,255,0.85)"              : "#1f2937";
  const itemDivider   = isDark ? "rgba(79,142,247,0.07)"               : "rgba(42,109,217,0.06)";
  const itemHoverBg   = isDark ? "rgba(79,142,247,0.1)"                : "rgba(42,109,217,0.06)";
  const itemHoverBdr  = isDark ? "rgba(79,142,247,0.3)"                : "rgba(42,109,217,0.25)";
  const dotColor      = isDark ? "rgba(79,142,247,0.5)"                : "rgba(42,109,217,0.4)";
  const markBg        = isDark ? "rgba(230,126,34,0.35)"               : "rgba(42,109,217,0.16)";
  const markColor     = isDark ? "#fbbf73"                             : "#1a50b5";
  const scrollThumb   = isDark ? "rgba(79,142,247,0.2)"                : "rgba(42,109,217,0.15)";

  useEffect(() => {
    (async () => {
      try {
        const r    = await fetch(`${API}/products`);
        const data = await r.json();
        const unique = [...new Map((data || []).map(p => [p.amc_name?.toLowerCase(), p.amc_name])).values()]
          .filter(Boolean).sort();
        setAllAmcs(unique);
      } catch {}
    })();
  }, []);

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    if (!query.trim()) { setSugs([]); setOpen(false); return; }
    const q = query.toLowerCase();
    const filtered = allAmcs.filter(a => a.toLowerCase().includes(q));
    setSugs(filtered);
    setOpen(filtered.length > 0);
  }, [query, allAmcs]);

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setOpen(false); setFocused(false); } };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (amc) => { setQuery(amc); setOpen(false); onChange("amc_name", amc); onAmcSelect?.(amc); };
  const handleChange = (e) => { const v = e.target.value; setQuery(v); onChange("amc_name", v); if (!v) onAmcSelect?.(""); };
  const isActive = focused || open;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <style>{DROP_STYLE}</style>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
          display: "flex", pointerEvents: "none",
          color: isActive ? iconColorFoc : iconColor, transition: "color .2s",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
        <input
          type="text" value={query} onChange={handleChange} placeholder="Search AMC name…"
          style={{
            width: "100%", padding: "9px 32px 9px 32px", borderRadius: 10,
            background: isActive ? inputBgFocus : inputBg,
            border: `1.5px solid ${isActive ? inputBdrFocus : inputBorder}`,
            color: inputColor, fontSize: ".84rem", fontFamily: "'Inter',sans-serif",
            outline: "none", transition: "all .2s", boxSizing: "border-box",
            boxShadow: isActive ? `0 0 0 3px ${accentAlpha}` : "none",
          }}
          onFocus={() => { setFocused(true); if (query.trim() && suggestions.length > 0) setOpen(true); }}
          onBlur={() => setFocused(false)}
        />
        {query && (
          <button
            onMouseDown={e => { e.preventDefault(); setQuery(""); onChange("amc_name", ""); onAmcSelect?.(""); setSugs([]); setOpen(false); }}
            style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              background: clearBg, border: "none", borderRadius: "50%",
              width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: inputColor, transition: "all .15s", padding: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = clearHov}
            onMouseLeave={e => e.currentTarget.style.background = clearBg}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 999999,
          background: dropBg, border: `1px solid ${dropBorder}`, borderRadius: 14,
          boxShadow: dropShadow, overflow: "hidden",
          animation: "dropIn .18s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "7px 12px", background: headerBg, borderBottom: `1px solid ${headerBdr}`,
          }}>
            <span style={{ fontSize: ".66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: isDark ? "rgba(180,210,255,0.5)" : "rgba(0,0,0,0.4)", fontFamily: "'Inter',sans-serif" }}>AMC Results</span>
            <span style={{ fontSize: ".66rem", fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: countBg, color: countColor, fontFamily: "'Inter',sans-serif" }}>{suggestions.length}</span>
          </div>
          <div style={{ maxHeight: 188, overflowY: "auto" }}>
            <style>{`.amc-drop-list::-webkit-scrollbar{width:4px}.amc-drop-list::-webkit-scrollbar-track{background:transparent}.amc-drop-list::-webkit-scrollbar-thumb{background:${scrollThumb};border-radius:4px}`}</style>
            <div className="amc-drop-list" style={{ maxHeight: 188, overflowY: "auto" }}>
              {suggestions.map((amc, i) => {
                const idx = amc.toLowerCase().indexOf(query.toLowerCase());
                return (
                  <div key={amc} onMouseDown={() => handleSelect(amc)}
                    style={{
                      padding: "9px 12px", display: "flex", alignItems: "center", gap: 9,
                      fontSize: ".84rem", fontFamily: "'Inter',sans-serif",
                      color: itemColor, cursor: "pointer",
                      borderBottom: i < suggestions.length - 1 ? `1px solid ${itemDivider}` : "none",
                      borderLeft: "2px solid transparent", transition: "all .13s",
                      animation: `itemIn .15s ease ${Math.min(i * 0.03, 0.15)}s both`,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = itemHoverBg; e.currentTarget.style.borderLeftColor = itemHoverBdr; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent"; }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
                    <span>
                      {idx === -1 ? amc : (
                        <>{amc.slice(0, idx)}<mark style={{ background: markBg, color: markColor, borderRadius: 3, padding: "0 2px", fontWeight: 700 }}>{amc.slice(idx, idx + query.length)}</mark>{amc.slice(idx + query.length)}</>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Scheme Search Autocomplete ─── */
function SchemeDropdown({ value, amcName, onChange, isDark }) {
  const [query, setQuery]       = useState(value || "");
  const [allProducts, setAllP]  = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen]         = useState(false);
  const [focused, setFocused]   = useState(false);
  const wrapRef                 = useRef(null);

  const accent        = isDark ? "#4F8EF7"                              : "#2a6dd9";
  const accentAlpha   = isDark ? "rgba(79,142,247,0.18)"               : "rgba(42,109,217,0.14)";
  const inputBg       = isDark ? "rgba(255,255,255,0.04)"              : "rgba(255,255,255,0.92)";
  const inputBgFocus  = isDark ? "rgba(79,142,247,0.07)"               : "rgba(42,109,217,0.04)";
  const inputBorder   = isDark ? "rgba(79,142,247,0.25)"               : "rgba(0,0,0,0.15)";
  const inputBdrFocus = accent;
  const inputColor    = isDark ? "#e8eeff"                             : "#111827";
  const disabledBg    = isDark ? "rgba(255,255,255,0.02)"              : "rgba(0,0,0,0.03)";
  const iconColor     = isDark ? "rgba(79,142,247,0.55)"               : "rgba(42,109,217,0.45)";
  const iconColorFoc  = accent;
  const clearBg       = isDark ? "rgba(79,142,247,0.15)"               : "rgba(42,109,217,0.1)";
  const clearHov      = isDark ? "rgba(79,142,247,0.3)"                : "rgba(42,109,217,0.2)";
  const dropBg        = isDark ? "rgba(8,13,35,0.97)"                  : "rgba(255,255,255,0.98)";
  const dropBorder    = isDark ? "rgba(79,142,247,0.3)"                : "rgba(42,109,217,0.18)";
  const dropShadow    = isDark
    ? "0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(79,142,247,0.12)"
    : "0 12px 40px rgba(42,109,217,0.15), 0 2px 8px rgba(0,0,0,0.08)";
  const headerBg      = isDark ? "rgba(79,142,247,0.06)"               : "rgba(42,109,217,0.04)";
  const headerBdr     = isDark ? "rgba(79,142,247,0.12)"               : "rgba(42,109,217,0.1)";
  const countBg       = isDark ? "rgba(79,142,247,0.15)"               : "rgba(42,109,217,0.1)";
  const countColor    = accent;
  const itemColor     = isDark ? "rgba(210,225,255,0.85)"              : "#1f2937";
  const itemDivider   = isDark ? "rgba(79,142,247,0.07)"               : "rgba(42,109,217,0.06)";
  const itemHoverBg   = isDark ? "rgba(79,142,247,0.1)"                : "rgba(42,109,217,0.06)";
  const itemHoverBdr  = isDark ? "rgba(79,142,247,0.3)"                : "rgba(42,109,217,0.25)";
  const itemSelBg     = isDark
    ? "linear-gradient(90deg,rgba(79,142,247,0.22),rgba(79,142,247,0.08))"
    : "linear-gradient(90deg,rgba(42,109,217,0.12),rgba(42,109,217,0.04))";
  const itemSelColor  = accent;
  const itemSelBdr    = isDark ? "rgba(79,142,247,0.55)"               : "rgba(42,109,217,0.45)";
  const checkBg       = isDark ? "rgba(79,142,247,0.2)"                : "rgba(42,109,217,0.12)";
  const checkColor    = accent;
  const markBg        = isDark ? "rgba(230,126,34,0.35)"               : "rgba(42,109,217,0.16)";
  const markColor     = isDark ? "#fbbf73"                             : "#1a50b5";
  const emptyColor    = isDark ? "rgba(160,190,255,0.4)"               : "rgba(0,0,0,0.35)";
  const chipBg        = isDark ? "rgba(255,255,255,0.06)"              : "rgba(0,0,0,0.05)";
  const chipColor     = isDark ? "rgba(180,210,255,0.55)"              : "rgba(0,0,0,0.45)";
  const scrollThumb   = isDark ? "rgba(79,142,247,0.2)"                : "rgba(42,109,217,0.15)";

  useEffect(() => {
    setQuery(""); onChange("scheme", ""); setAllP([]); setFiltered([]); setOpen(false);
    if (!amcName?.trim()) return;
    (async () => {
      try {
        const r    = await fetch(`${API}/products`);
        const data = await r.json();
        const prods = (data || []).filter(p => (p.amc_name || "").toLowerCase() === amcName.toLowerCase());
        setAllP(prods); setFiltered(prods);
      } catch { setAllP([]); setFiltered([]); }
    })();
  }, [amcName]);

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    if (!query.trim()) { setFiltered(allProducts); return; }
    const q = query.toLowerCase();
    setFiltered(allProducts.filter(p => p.product_name?.toLowerCase().includes(q)));
  }, [query, allProducts]);

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) { setOpen(false); setFocused(false); } };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const noAmc    = !amcName?.trim();
  const disabled = noAmc;
  const placeholder = noAmc ? "Select an AMC first…" : allProducts.length === 0 ? "No products for this AMC" : "Search scheme…";
  const handleSelect = (p) => { setQuery(p.product_name); onChange("scheme", p.product_name); setOpen(false); };
  const handleChange = (e) => { setQuery(e.target.value); onChange("scheme", e.target.value); setOpen(true); };
  const isActive = focused || open;

  const structureColor = (s) => {
    if (!s) return chipColor;
    if (s.includes("cat-III")) return isDark ? "#818cf8" : "#4f46e5";
    if (s.includes("retail"))  return isDark ? "#34d399" : "#059669";
    return chipColor;
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
          display: "flex", pointerEvents: "none",
          color: disabled ? (isDark ? "rgba(79,142,247,0.2)" : "rgba(0,0,0,0.2)") : (isActive ? iconColorFoc : iconColor),
          transition: "color .2s",
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
        <input
          type="text" value={query} onChange={handleChange} disabled={disabled} placeholder={placeholder}
          style={{
            width: "100%", padding: "9px 32px 9px 32px", borderRadius: 10,
            background: disabled ? disabledBg : (isActive ? inputBgFocus : inputBg),
            border: `1.5px solid ${isActive && !disabled ? inputBdrFocus : inputBorder}`,
            color: inputColor, fontSize: ".84rem", fontFamily: "'Inter',sans-serif",
            outline: "none", transition: "all .2s", boxSizing: "border-box",
            boxShadow: isActive && !disabled ? `0 0 0 3px ${accentAlpha}` : "none",
            cursor: disabled ? "not-allowed" : "text", opacity: disabled ? 0.45 : 1,
          }}
          onFocus={() => { if (disabled) return; setFocused(true); setOpen(true); }}
          onBlur={() => setFocused(false)}
        />
        {query && !disabled && (
          <button
            onMouseDown={e => { e.preventDefault(); setQuery(""); onChange("scheme", ""); setFiltered(allProducts); }}
            style={{
              position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
              background: clearBg, border: "none", borderRadius: "50%",
              width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: inputColor, transition: "all .15s", padding: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.background = clearHov}
            onMouseLeave={e => e.currentTarget.style.background = clearBg}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {open && !disabled && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 999999,
          background: dropBg, border: `1px solid ${dropBorder}`, borderRadius: 14,
          boxShadow: dropShadow, overflow: "hidden",
          animation: "dropIn .18s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "7px 12px", background: headerBg, borderBottom: `1px solid ${headerBdr}`,
          }}>
            <span style={{ fontSize: ".66rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", color: isDark ? "rgba(180,210,255,0.5)" : "rgba(0,0,0,0.4)", fontFamily: "'Inter',sans-serif" }}>Schemes</span>
            <span style={{ fontSize: ".66rem", fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: countBg, color: countColor, fontFamily: "'Inter',sans-serif" }}>{filtered.length}</span>
          </div>
          <div style={{ maxHeight: 210, overflowY: "auto" }}>
            <style>{`.scheme-drop-list::-webkit-scrollbar{width:4px}.scheme-drop-list::-webkit-scrollbar-track{background:transparent}.scheme-drop-list::-webkit-scrollbar-thumb{background:${scrollThumb};border-radius:4px}`}</style>
            <div className="scheme-drop-list" style={{ maxHeight: 210, overflowY: "auto" }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "16px 14px", display: "flex", alignItems: "center", gap: 8, fontSize: ".82rem", fontFamily: "'Inter',sans-serif", color: emptyColor }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ opacity: .5 }}><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                  No matching schemes found
                </div>
              ) : filtered.map((p, i) => {
                const isSelected = value === p.product_name;
                const idx = query.trim() ? p.product_name.toLowerCase().indexOf(query.toLowerCase()) : -1;
                const sColor = structureColor(p.structure);
                return (
                  <div key={p.id} onMouseDown={() => handleSelect(p)}
                    style={{
                      padding: "10px 12px", cursor: "pointer",
                      borderBottom: i < filtered.length - 1 ? `1px solid ${itemDivider}` : "none",
                      background: isSelected ? itemSelBg : "transparent",
                      borderLeft: `2px solid ${isSelected ? itemSelBdr : "transparent"}`,
                      transition: "all .13s", display: "flex", alignItems: "flex-start", gap: 10,
                      animation: `itemIn .15s ease ${Math.min(i * 0.03, 0.15)}s both`,
                    }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.background = itemHoverBg; e.currentTarget.style.borderLeftColor = itemHoverBdr; } }}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderLeftColor = "transparent"; } }}
                  >
                    <span style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                      background: isSelected ? checkBg : "transparent",
                      border: `1.5px solid ${isSelected ? checkColor : (isDark ? "rgba(79,142,247,0.2)" : "rgba(0,0,0,0.12)")}`,
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s",
                    }}>
                      {isSelected && <svg width="9" height="9" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke={checkColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: ".84rem", fontFamily: "'Inter',sans-serif", fontWeight: isSelected ? 700 : 500, color: isSelected ? itemSelColor : itemColor, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {idx === -1 || !query.trim() ? p.product_name : (
                          <>{p.product_name.slice(0, idx)}<mark style={{ background: markBg, color: markColor, borderRadius: 3, padding: "0 2px", fontWeight: 700 }}>{p.product_name.slice(idx, idx + query.length)}</mark>{p.product_name.slice(idx + query.length)}</>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 5, marginTop: 4, flexWrap: "wrap" }}>
                        {p.structure && <span style={{ fontSize: ".62rem", fontWeight: 700, padding: "1px 6px", borderRadius: 20, background: chipBg, color: sColor, border: `1px solid ${sColor}30`, fontFamily: "'Inter',sans-serif" }}>{p.structure}</span>}
                        {p.lock_in   && <span style={{ fontSize: ".62rem", fontWeight: 600, padding: "1px 6px", borderRadius: 20, background: chipBg, color: chipColor, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`, fontFamily: "'Inter',sans-serif" }}>🔒 {p.lock_in}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ col, value, onChange }) {
  if (col.type === "select") return (
    <div className="fld">
      <label className="fld-lbl">{col.label}</label>
      <select className="fld-inp" value={value || ""} onChange={e => onChange(col.key, e.target.value)}>
        <option value="">Select…</option>
        {col.options.map(o => <option key={o} value={o}>{o[0].toUpperCase() + o.slice(1)}</option>)}
      </select>
    </div>
  );
  return (
    <div className="fld">
      <label className="fld-lbl">{col.label}</label>
      <input
        className="fld-inp"
        type={col.type === "date" ? "date" : col.type === "number" ? "number" : "text"}
        value={col.type === "date" ? toISODate(value) : (value || "")}
        onChange={e => onChange(col.key, e.target.value)}
      />
    </div>
  );
}

function Snack({ msg, severity, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  return <div className={`snack snack-${severity}`}>{msg}</div>;
}

export default function Interested({ inline = false, onDataChange, theme = "dark" }) {
  const isDark = theme === "dark";
  const [rows,          setRows]          = useState([]);
  const [search,        setSearch]        = useState("");
  const [loading,       setLoading]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [dlg,           setDlg]           = useState(false);
  const [editRow,       setEditRow]       = useState(null);
  const [form,          setForm]          = useState({});
  const [delId,         setDelId]         = useState(null);
  const [confirm,       setConfirm]       = useState(false);
  const [snack,         setSnack]         = useState(null);
  const [shareOpen,     setShareOpen]     = useState(false);
  const [shareForm,     setShareForm]     = useState({});
  const [shareSaving,   setShareSaving]   = useState(false);
  const [shareSourceId, setShareSourceId] = useState(null);

  const showSnack = (msg, severity = "success") => setSnack({ msg, severity });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/interested`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setRows((await r.json()) ?? []);
    } catch (e) {
      showSnack(`Failed to load: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const q = search.trim().toLowerCase();
  const filteredRows = q
    ? rows.filter(r =>
        (r.client_name || "").toLowerCase().includes(q) ||
        (r.next_action || "").toLowerCase().includes(q)
      )
    : rows;

  const openAdd  = () => { setEditRow(null); setForm(emptyRow()); setDlg(true); };
  const openEdit = (row) => { setEditRow(row); setForm({ ...row }); setDlg(true); };
  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.client_name?.trim()) { showSnack("Client name is required", "error"); return; }
    const payload = {
      ...form,
      client_name:      form.client_name?.trim() || "",
      esops_rsu:        form.esops_rsu || "no",
      discussion_date:  toISODate(form.discussion_date) || null,
      next_action_date: toISODate(form.next_action_date) || null,
      next_action:      form.next_action?.trim() || "",
    };
    const url    = editRow ? `${API}/interested/${editRow.id}` : `${API}/interested`;
    const method = editRow ? "PUT" : "POST";
    setSaving(true);
    try {
      const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!r.ok) {
        let errMsg = `HTTP ${r.status}`;
        try { const b = await r.json(); errMsg = b.message || b.error || errMsg; } catch {}
        throw new Error(errMsg);
      }
      showSnack(editRow ? "Updated!" : "Added!");
      setDlg(false); load(); onDataChange?.();
    } catch (e) {
      showSnack(`Save failed: ${e.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    try {
      const r = await fetch(`${API}/interested/${delId}`, { method: "DELETE" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      showSnack("Deleted");
      setConfirm(false); load(); onDataChange?.();
    } catch (e) {
      showSnack(`Delete failed: ${e.message}`, "error");
    }
  };

  const openShare = (row) => { setShareSourceId(row.id); setShareForm(interestedToPending(row)); setShareOpen(true); };
  const setShareFld = (k, v) => setShareForm(p => ({ ...p, [k]: v }));
  const handleAmcSelect = (amc) => { setShareForm(p => ({ ...p, amc_name: amc, scheme: "" })); };

  const saveShare = async () => {
    setShareSaving(true);
    try {
      const payload = { ...shareForm, next_action_date: toISODate(shareForm.next_action_date) || null };
      const postRes = await fetch(`${API}/invested/pending`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!postRes.ok) throw new Error(`Failed to add to Pending (HTTP ${postRes.status})`);
      const delRes = await fetch(`${API}/interested/${shareSourceId}`, { method: "DELETE" });
      if (!delRes.ok) throw new Error(`Failed to remove from Interested (HTTP ${delRes.status})`);
      showSnack("✓ Sent to Customers Pending!");
      setShareOpen(false); load(); onDataChange?.();
    } catch (e) {
      showSnack(e.message || "Failed", "error");
    } finally {
      setShareSaving(false);
    }
  };

  const renderShareField = (col) => {
    if (col.type === "amc_autocomplete") return (
      <div key={col.key}>
        <div className="fld">
          <label className="fld-lbl">{col.label}</label>
          <AmcAutocomplete value={shareForm[col.key] || ""} onChange={setShareFld} onAmcSelect={handleAmcSelect} isDark={isDark} />
        </div>
        {SHARE_MANUAL_KEYS.has(col.key) && <div className="fld-note" style={{ color: "#f59e0b" }}>⚠ Search and select AMC</div>}
      </div>
    );
    if (col.type === "scheme_dropdown") return (
      <div key={col.key}>
        <div className="fld">
          <label className="fld-lbl">{col.label}</label>
          <SchemeDropdown value={shareForm[col.key] || ""} amcName={shareForm.amc_name || ""} onChange={setShareFld} isDark={isDark} />
        </div>
        {SHARE_MANUAL_KEYS.has(col.key) && <div className="fld-note" style={{ color: "#f59e0b" }}>⚠ Select scheme for chosen AMC</div>}
      </div>
    );
    return (
      <div key={col.key}>
        <Field col={col} value={shareForm[col.key]} onChange={setShareFld} />
        {SHARE_AUTO_KEYS.has(col.key)   && <div className="fld-note" style={{ color: "#34D399" }}>✓ Auto-filled from prospect</div>}
        {SHARE_MANUAL_KEYS.has(col.key) && <div className="fld-note" style={{ color: "#f59e0b" }}>⚠ Fill manually</div>}
      </div>
    );
  };

  return (
    <div className={`mod-wrap${theme === "light" ? " theme-light" : ""}`}>
      <style>{`
  @keyframes srIn  { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:none} }
  @keyframes dlgIn { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:none} }
  @keyframes spin  { to{transform:rotate(360deg)} }

  /* ══════════════════════════════════════════
     SCROLL FIX — same pattern as GiftCity
  ══════════════════════════════════════════ */
  .mod-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    width: 100%;
    min-width: 0;
  }
  .mod-wrap .tbl-wrap {
    flex: 1;
    min-height: 0;
    overflow-x: auto;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    width: 100%;
  }
  .mod-wrap .fd-spin { flex-shrink: 0; }

  /* Scrollbar — dark theme (orange accent for Prospects) */
  .mod-wrap .tbl-wrap::-webkit-scrollbar        { width: 4px; height: 4px; }
  .mod-wrap .tbl-wrap::-webkit-scrollbar-track  { background: rgba(230,126,34,0.04); }
  .mod-wrap .tbl-wrap::-webkit-scrollbar-thumb  { background: rgba(230,126,34,0.3); border-radius: 4px; }
  .mod-wrap .tbl-wrap::-webkit-scrollbar-thumb:hover { background: rgba(230,126,34,0.55); }

  /* Scrollbar — light theme */
  .mod-wrap.theme-light .tbl-wrap::-webkit-scrollbar-track  { background: rgba(42,109,217,0.04); }
  .mod-wrap.theme-light .tbl-wrap::-webkit-scrollbar-thumb  { background: rgba(42,109,217,0.25); }
  .mod-wrap.theme-light .tbl-wrap::-webkit-scrollbar-thumb:hover { background: rgba(42,109,217,0.45); }

  /* ══════════════════════════════════════════ */

  .mod-wrap input::placeholder { color: rgba(160,190,255,0.35); }
  .mod-wrap.theme-light input::placeholder { color: rgba(0,0,0,0.3); }

  .dlg-ov {
    position:fixed; inset:0;
    background:rgba(0,0,10,0.65);
    backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
    display:flex; align-items:center; justify-content:center;
    z-index:99999; padding:16px; box-sizing:border-box;
    overflow-y:auto; animation:dlgIn .2s ease;
  }
  .theme-light .dlg-ov { background:rgba(10,20,80,0.28); }

  .dlg-box {
    background:rgba(7,9,30,0.96);
    backdrop-filter:blur(44px) saturate(160%);
    border:1px solid rgba(79,142,247,0.4);
    border-radius:18px;
    box-shadow:0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06);
    width:100%; max-width:min(460px,calc(100vw - 32px));
    max-height:calc(100vh - 40px); overflow-y:auto;
    animation:dlgIn .3s cubic-bezier(0.34,1.56,0.64,1);
    box-sizing:border-box;
  }
  .dlg-box::-webkit-scrollbar { width:4px; }
  .dlg-box::-webkit-scrollbar-thumb { background:rgba(79,142,247,0.25); border-radius:4px; }
  .theme-light .dlg-box {
    background:rgba(255,255,255,0.97);
    border:1px solid rgba(42,109,217,0.22);
    box-shadow:0 8px 40px rgba(10,30,100,0.15);
  }

  .dlg-hdr {
    display:flex; align-items:center; gap:12px;
    padding:16px 20px 12px;
    border-bottom:1px solid rgba(79,142,247,0.18);
    background:rgba(79,142,247,0.04);
    border-radius:18px 18px 0 0;
  }
  .theme-light .dlg-hdr { border-bottom-color:rgba(42,109,217,0.15); background:rgba(42,109,217,0.06); }
  .dlg-bar { width:4px; height:22px; border-radius:2px; flex-shrink:0; }
  .dlg-ttl { font-weight:800; font-size:.95rem; color:#fff; letter-spacing:.01em; font-family:'Inter',sans-serif; }
  .theme-light .dlg-ttl { color:#111827; }
  .dlg-sub { font-size:.72rem; color:rgba(180,210,255,0.55); margin-top:3px; font-family:'Inter',sans-serif; }
  .theme-light .dlg-sub { color:rgba(0,0,0,0.5); }

  .dlg-body {
    padding:16px 20px; display:flex; flex-direction:column; gap:12px;
    max-height:58vh; overflow-y:auto; overflow-x:visible;
  }
  .dlg-body::-webkit-scrollbar { width:4px; }
  .dlg-body::-webkit-scrollbar-thumb { background:rgba(79,142,247,0.2); border-radius:4px; }

  .dlg-body .fld { display:flex; flex-direction:column; gap:5px; }
  .dlg-body .fld-lbl {
    font-size:.67rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em;
    color:rgba(180,210,255,0.75); font-family:'Inter',sans-serif;
  }
  .theme-light .dlg-body .fld-lbl { color:rgba(0,0,0,0.65); }
  .dlg-body .fld-inp {
    width:100%; padding:9px 12px; border-radius:10px;
    background:rgba(255,255,255,0.05); border:1px solid rgba(79,142,247,0.3);
    color:#fff; font-size:.84rem; font-family:'Inter',sans-serif;
    outline:none; transition:border-color .2s,box-shadow .2s; box-sizing:border-box;
  }
  .dlg-body .fld-inp:focus { border-color:#4F8EF7; box-shadow:0 0 0 3px rgba(79,142,247,0.16); }
  .dlg-body .fld-inp option { background:#0c1638; color:#fff; }
  .theme-light .dlg-body .fld-inp { background:rgba(255,255,255,0.85); border:1px solid rgba(42,109,217,0.22); color:#111827; }
  .theme-light .dlg-body .fld-inp:focus { border-color:#2a6dd9; box-shadow:0 0 0 3px rgba(42,109,217,0.12); }
  .theme-light .dlg-body .fld-inp option { background:#fff; color:#111827; }
  .dlg-body .fld-note { font-size:.68rem; font-weight:600; margin-top:2px; padding-left:2px; }

  .dlg-foot {
    display:flex; justify-content:flex-end; gap:8px;
    padding:12px 20px;
    border-top:1px solid rgba(79,142,247,0.15);
    background:rgba(79,142,247,0.02);
    border-radius:0 0 18px 18px;
  }
  .theme-light .dlg-foot { border-top-color:rgba(42,109,217,0.14); background:rgba(42,109,217,0.03); }

  .btn-cancel {
    padding:8px 14px; border-radius:10px;
    border:1px solid rgba(79,142,247,0.28); background:none;
    color:rgba(180,210,255,0.75); font-size:.8rem;
    font-family:'Inter',sans-serif; font-weight:600; cursor:pointer; transition:all .2s;
  }
  .btn-cancel:hover { border-color:rgba(255,255,255,0.3); color:#fff; background:rgba(255,255,255,0.04); }
  .btn-cancel:disabled { opacity:.4; cursor:not-allowed; }
  .theme-light .btn-cancel { border-color:rgba(42,109,217,0.28); color:rgba(0,0,0,0.6); }
  .theme-light .btn-cancel:hover { border-color:rgba(42,109,217,0.5); color:#111827; background:rgba(42,109,217,0.06); }

  .btn-ok {
    padding:8px 16px; border-radius:10px; border:none; color:#fff;
    font-size:.8rem; font-family:'Inter',sans-serif; font-weight:700;
    cursor:pointer; transition:all .25s cubic-bezier(0.34,1.56,0.64,1);
  }
  .btn-ok:hover { transform:translateY(-1px); filter:brightness(1.1); }
  .btn-ok:disabled { opacity:.6; cursor:not-allowed; transform:none; }
  .btn-danger  { background:linear-gradient(135deg,#EF4444,#DC2626); box-shadow:0 4px 16px rgba(239,68,68,0.3); }
  .btn-success { background:linear-gradient(135deg,#34D399,#059669); box-shadow:0 4px 16px rgba(52,211,153,0.3); }
  .theme-light .btn-danger  { background:linear-gradient(135deg,#d14040,#a82424) !important; }
  .theme-light .btn-success { background:linear-gradient(135deg,#0f9e6e,#057a52) !important; }

  .snack {
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    padding:10px 22px; border-radius:10px; font-size:.82rem; font-weight:600;
    font-family:'Inter',sans-serif; z-index:99999;
    box-shadow:0 4px 20px rgba(0,0,0,.4); animation:dlgIn .2s ease; white-space:nowrap;
  }
  .snack-success { background:#065f46; color:#6ee7b7; border:1px solid #34D399; }
  .snack-error   { background:#7f1d1d; color:#fca5a5; border:1px solid #EF4444; }

  @media (max-width:520px) {
    .dlg-box { border-radius:18px 18px 0 0 !important; }
    .dlg-ov  { align-items:flex-end !important; padding:0 !important; }
    .dlg-hdr { padding:14px 16px 12px; }
    .dlg-body { padding:14px 16px; gap:10px; }
    .dlg-foot { padding:12px 16px; }
  }
`}</style>

      {/* ── Top bar ── */}
      <div className="mod-hdr">
        <div className="tabs-row">
          <span className="tbl-title" style={{ fontSize: ".9rem", display: "flex", alignItems: "center", gap: 8 }}>
            Prospects
            {!loading && (
              <span className="tbl-badge" style={{ color: ORANGE, background: "rgba(230,126,34,.1)", borderColor: "rgba(230,126,34,.22)" }}>
                {search.trim()
                  ? <>{filteredRows.length} <span style={{ opacity: .55 }}>/ {rows.length}</span></>
                  : <>{rows.length} records</>
                }
              </span>
            )}
          </span>
        </div>
        <button
          className="add-btn"
          onClick={openAdd}
          style={{ background: `linear-gradient(135deg,${ORANGE},#ca6f1e)`, boxShadow: "0 4px 14px rgba(230,126,34,.3)" }}
        >
          <IcoPlus /> Add Row
        </button>
      </div>

      {/* ── Search bar ── */}
      <SearchBar
        value={search}
        onChange={setSearch}
        resultCount={filteredRows.length}
        totalCount={rows.length}
        theme={theme}
      />

      {/* ── Table title bar ── */}
      <div className="tbl-hdr">
        <span className="tbl-title">All Prospects</span>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="fd-spin"><div className="spinner" style={{ borderTopColor: ORANGE }} /></div>
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
                <tr>
                  <td className="fd-empty" colSpan={COLS.length + 2}>
                    {search.trim()
                      ? <>No results for "<strong style={{ color: ORANGE }}>{search}</strong>"</>
                      : 'No records found. Click "Add Row" to get started.'
                    }
                  </td>
                </tr>
              ) : filteredRows.map((row, i) => (
                <tr key={row.id}>
                  <td className="fd-num">{i + 1}</td>
                  {COLS.map(c => (
                    <td key={c.key}>
                      {c.key === "esops_rsu"
                        ? <span className={`chip chip-${row[c.key] === "yes" ? "yes" : "no"}`}>{row[c.key] === "yes" ? "Yes" : "No"}</span>
                        : c.type === "date"
                          ? fmtDate(row[c.key])
                          : (c.key === "client_name" || c.key === "next_action")
                            ? <Highlight text={row[c.key]} query={search} theme={theme} />
                            : row[c.key] ?? "—"
                      }
                    </td>
                  ))}
                  <td>
                    <div className="act-cell">
                      <button className="ab ab-edit" title="Edit" onClick={() => openEdit(row)}><IcoEdit /></button>
                      <button className="ab" title="Send to Customers Pending" style={{ color: "#34D399" }} onClick={() => openShare(row)}><IcoShare /></button>
                      <button className="ab ab-del" title="Delete" onClick={() => { setDelId(row.id); setConfirm(true); }}><IcoDel /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add / Edit Dialog ── */}
      {dlg && createPortal(
        <div className={`dlg-ov${theme === "light" ? " theme-light" : ""}`} onClick={e => e.target === e.currentTarget && setDlg(false)}>
          <div className="dlg-box">
            <div className="dlg-hdr">
              <div className="dlg-bar" style={{ background: ORANGE }} />
              <div className="dlg-ttl">{editRow ? "Edit Record" : "Add Record"}</div>
            </div>
            <div className="dlg-body">
              {COLS.map(c => <Field key={c.key} col={c} value={form[c.key]} onChange={setField} />)}
            </div>
            <div className="dlg-foot">
              <button className="btn-cancel" onClick={() => setDlg(false)} disabled={saving}>Cancel</button>
              <button
                className="btn-ok"
                style={{ background: `linear-gradient(135deg,${ORANGE},#ca6f1e)`, boxShadow: "0 4px 14px rgba(230,126,34,.3)", opacity: saving ? 0.7 : 1 }}
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saving…" : editRow ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Delete Confirm ── */}
      {confirm && createPortal(
        <div className={`dlg-ov${theme === "light" ? " theme-light" : ""}`} onClick={e => e.target === e.currentTarget && setConfirm(false)}>
          <div className="dlg-box" style={{ maxWidth: 370 }}>
            <div className="dlg-hdr">
              <div className="dlg-bar" style={{ background: "#EF4444" }} />
              <div className="dlg-ttl">Confirm Delete</div>
            </div>
            <div className="dlg-body">
              <p style={{ margin: 0, lineHeight: 1.6, fontSize: ".84rem", color: isDark ? "white" : "#000" }}>
                Are you sure you want to delete this prospects record?
              </p>
            </div>
            <div className="dlg-foot">
              <button className="btn-cancel" onClick={() => setConfirm(false)}>Cancel</button>
              <button className="btn-ok btn-danger" onClick={del}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Share → Customers Pending Dialog ── */}
      {shareOpen && createPortal(
        <div className={`dlg-ov${theme === "light" ? " theme-light" : ""}`} onClick={e => e.target === e.currentTarget && setShareOpen(false)}>
          <div className="dlg-box">
            <div className="dlg-hdr">
              <div className="dlg-bar" style={{ background: "#34D399" }} />
              <div>
                <div className="dlg-ttl">Send to Customers Pending</div>
                <div className="dlg-sub">Green fields are auto-filled · Orange fields need manual entry</div>
              </div>
            </div>
            <div className="dlg-body">
              {PENDING_COLS.map(col => renderShareField(col))}
            </div>
            <div className="dlg-foot">
              <button className="btn-cancel" onClick={() => setShareOpen(false)} disabled={shareSaving}>Cancel</button>
              <button className="btn-ok btn-success" onClick={saveShare} disabled={shareSaving}>
                {shareSaving ? "Saving…" : "Save & Send to Pending"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {snack && createPortal(<Snack {...snack} onClose={() => setSnack(null)} />, document.body)}
    </div>
  );
}