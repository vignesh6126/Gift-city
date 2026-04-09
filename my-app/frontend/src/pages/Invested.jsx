import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
const API = import.meta.env.VITE_API_URL;

const TABS = [
  { id: "completed", label: "Customers Completed" },
  { id: "pending", label: "Customers Pending" },
];
const COMPLETED_COLS = [
  { key: "client_name", label: "Client Name", type: "text" },
  { key: "first_investment", label: "First Investment", type: "date" },
  { key: "amount", label: "Amount", type: "number" },
  { key: "amc_name", label: "AMC Name", type: "text" },
  { key: "scheme", label: "Scheme", type: "text" },
  { key: "bank", label: "Bank", type: "select", options: ["gift", "savings", "both"] },
];
const PENDING_COLS = [
  { key: "client_name", label: "Client Name", type: "text" },
  { key: "amount_tobe_invested", label: "Amount to be Invested", type: "number" },
  { key: "amc_name", label: "AMC Name", type: "text" },
  { key: "scheme", label: "Scheme", type: "text" },
  { key: "bank", label: "Bank", type: "select", options: ["gift", "savings", "both"] },
  { key: "submission_date", label: "Submission Date", type: "date" },
  { key: "next_action_date", label: "Next Action Date", type: "date" },
  { key: "status", label: "Status", type: "text" },
];
const AUTO_KEYS = new Set(["client_name", "amount", "amc_name", "scheme", "bank"]);
const MANUAL_KEYS = new Set(["first_investment"]);

const p2c = (r) => ({ client_name: r.client_name || "", amount: r.amount_tobe_invested || "", amc_name: r.amc_name || "", scheme: r.scheme || "", bank: r.bank || "savings", first_investment: "" });
const emptyC = () => ({ client_name: "", first_investment: "", amount: "", scheme: "", amc_name: "", bank: "savings" });
const emptyP = () => ({ client_name: "", amount_tobe_invested: "", scheme: "", amc_name: "", bank: "savings", submission_date: "", next_action_date: "", status: "" });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

/* ─── Icons ─── */
const IcoEdit = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const IcoDel = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const IcoMove = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" /><circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" /><circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
const IcoPlus = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>;
const IcoSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
const IcoClear = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>;

const fmtAmount = (val) => {
  if (val === null || val === undefined || val === "") return "—";
  const n = Number(val);
  if (isNaN(n)) return "—";
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return "$" + n.toLocaleString("en-US");
};

/* ─────────────────────────────────────────────────────────────────
   Tooltip
   - theme="dark"  → dark navy background, blue border, light text
   - theme="light" → white background, blue border, dark text
   - Reacts instantly when parent re-renders with new theme prop.
   - Portal-based so it is never clipped by table overflow.
───────────────────────────────────────────────────────────────── */
function Tooltip({ text, theme = "dark", children }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos]         = useState({ x: 0, y: 0 });
  const ref = useRef(null);

  /* nothing to show → only apply ellipsis clipping */
  if (!text || text === "—") {
    return (
      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>
        {children}
      </span>
    );
  }

  const isDark = theme !== "light";

  /* ── per-theme design tokens ── */
  const bg     = isDark ? "rgba(8,12,45,0.97)"        : "rgba(255,255,255,0.98)";
  const border = isDark ? "rgba(100,181,246,0.45)"     : "rgba(42,109,217,0.4)";
  const color  = isDark ? "rgba(220,235,255,0.95)"     : "#111827";
  const shadow = isDark
    ? "0 10px 32px rgba(0,0,0,0.65), 0 0 0 1px rgba(100,181,246,0.1)"
    : "0 10px 32px rgba(10,30,100,0.2),  0 0 0 1px rgba(42,109,217,0.08)";
  const labelClr = isDark ? "rgba(100,181,246,0.8)"   : "#2a6dd9";

  const show = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    setPos({ x: e.clientX, y: rect ? rect.top : e.clientY });
    setVisible(true);
  };
  const hide = () => setVisible(false);
  const move = (e) => setPos(prev => ({ ...prev, x: e.clientX }));

  const safeLeft = typeof window !== "undefined"
    ? Math.min(pos.x + 14, window.innerWidth - 315)
    : pos.x + 14;

  return (
    <span
      ref={ref}
      style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%", cursor: "default" }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onMouseMove={move}
    >
      {children}

      {visible && createPortal(
        <div style={{
          position: "fixed",
          left: safeLeft,
          top: pos.y - 58,
          background: bg,
          border: `1px solid ${border}`,
          color,
          padding: "9px 14px 11px",
          borderRadius: 11,
          fontSize: ".78rem",
          fontFamily: "var(--fb,'Exo 2',sans-serif)",
          maxWidth: 300,
          wordBreak: "break-word",
          whiteSpace: "normal",
          lineHeight: 1.6,
          zIndex: 999999,
          pointerEvents: "none",
          boxShadow: shadow,
        }}>
          {/* "Full value" label */}
          <div style={{
            fontSize: ".63rem",
            color: labelClr,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: ".09em",
            marginBottom: 5,
            fontFamily: "var(--fh,'Orbitron',sans-serif)",
          }}>
            Full value
          </div>

          {text}

          {/* downward arrow */}
          <div style={{ position: "absolute", bottom: -7, left: 20, width: 12, height: 7, overflow: "hidden" }}>
            <div style={{
              width: 9, height: 9,
              background: bg,
              border: `1px solid ${border}`,
              transform: "rotate(45deg)",
              marginTop: -5, marginLeft: 1,
            }} />
          </div>
        </div>,
        document.body
      )}
    </span>
  );
}

/* ─── Highlight matching text ─── */
function Highlight({ text, query, theme = "dark" }) {
  if (!query || !text) return <>{text ?? "—"}</>;
  const str = String(text);
  const idx = str.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{str}</>;
  const isDark = theme !== "light";
  return (
    <>
      {str.slice(0, idx)}
      <mark style={{
        background: isDark ? "rgba(100,181,246,0.35)" : "rgba(42,109,217,0.18)",
        color:      isDark ? "#fff"                   : "#1a50b5",
        borderRadius: 3, padding: "0 1px",
      }}>
        {str.slice(idx, idx + query.length)}
      </mark>
      {str.slice(idx + query.length)}
    </>
  );
}

/* ─── Search Bar ─── */
function SearchBar({ value, onChange, placeholder, resultCount, totalCount, theme = "dark" }) {
  const inputRef = useRef(null);
  const isActive = value.length > 0;
  const isDark   = theme !== "light";

  /* shorthand theme tokens */
  const accent     = isDark ? "100,181,246" : "42,109,217";
  const accentHex  = isDark ? "#64B5F6"    : "#2a6dd9";
  const inputBg    = isActive
    ? (isDark ? "rgba(100,181,246,0.08)" : "rgba(42,109,217,0.07)")
    : (isDark ? "rgba(10,16,60,0.5)"     : "rgba(255,255,255,0.6)");
  const inputBorder = isActive
    ? `1px solid rgba(${accent},0.55)`
    : `1px solid rgba(${isDark ? "100,181,246" : "0,0,0"},${isDark ? "0.22" : "0.2"})`;

  return (
    <div style={{
      padding: "10px 16px 12px",
      borderBottom: isDark ? "1px solid rgba(100,181,246,0.12)" : "1px solid rgba(0,0,0,0.1)",
      background:   isDark ? "rgba(100,181,246,0.02)"           : "rgba(0,0,0,0.02)",
      boxSizing: "border-box", width: "100%",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

        {/* ── input wrapper ── */}
        <div style={{ position: "relative", flex: "1 1 160px", minWidth: 0, maxWidth: 420 }}>
          <span style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            color: isActive ? accentHex : (isDark ? "rgba(160,190,255,0.4)" : "rgba(0,0,0,0.3)"),
            display: "flex", pointerEvents: "none", transition: "color .2s",
          }}>
            <IcoSearch />
          </span>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            style={{
              width: "100%", padding: "8px 34px 8px 32px",
              borderRadius: 10, border: inputBorder, background: inputBg,
              color: isDark ? "#fff" : "#111827",
              fontSize: ".82rem", fontFamily: "var(--fb,'Exo 2',sans-serif)",
              outline: "none", transition: "all .22s", boxSizing: "border-box",
              boxShadow: isActive ? `0 0 0 3px rgba(${accent},0.12)` : "none",
            }}
            onFocus={e => {
              e.target.style.borderColor = `rgba(${accent},0.7)`;
              e.target.style.boxShadow   = `0 0 0 3px rgba(${accent},0.15)`;
            }}
            onBlur={e => {
              e.target.style.borderColor = isActive ? `rgba(${accent},0.55)` : (isDark ? "rgba(100,181,246,0.22)" : "rgba(0,0,0,0.2)");
              e.target.style.boxShadow   = isActive ? `0 0 0 3px rgba(${accent},0.12)` : "none";
            }}
          />

          {isActive && (
            <button
              onClick={() => { onChange(""); inputRef.current?.focus(); }}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: `rgba(${accent},0.18)`, border: "none", borderRadius: "50%",
                width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: isDark ? "rgba(180,210,255,0.8)" : "rgba(0,0,0,0.55)",
                transition: "all .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `rgba(${accent},0.35)`; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = `rgba(${accent},0.18)`; e.currentTarget.style.color = isDark ? "rgba(180,210,255,0.8)" : "rgba(0,0,0,0.55)"; }}
            >
              <IcoClear />
            </button>
          )}
        </div>

        {/* ── result badge ── */}
        {isActive && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 12px", borderRadius: 20,
            background: resultCount > 0 ? `rgba(${accent},0.12)` : (isDark ? "rgba(248,113,113,0.12)" : "rgba(180,50,50,0.1)"),
            border: `1px solid ${resultCount > 0 ? `rgba(${accent},0.3)` : (isDark ? "rgba(248,113,113,0.28)" : "rgba(180,50,50,0.28)")}`,
            fontSize: ".7rem", fontWeight: 700,
            color: resultCount > 0 ? accentHex : (isDark ? "#F87171" : "#b02020"),
            fontFamily: "var(--fh,'Orbitron',sans-serif)",
            animation: "srIn .18s ease", whiteSpace: "nowrap", flexShrink: 0,
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

/* ─── Form Field ─── */
function Field({ col, value, onChange, highlight }) {
  const cls = `fld-inp${highlight ? " fld-hi" : ""}`;
  if (col.type === "select") return (
    <div className="fld">
      <label className="fld-lbl">{col.label}</label>
      <select className={cls} value={value || ""} onChange={e => onChange(col.key, e.target.value)}>
        <option value="">Select…</option>
        {col.options.map(o => <option key={o} value={o}>{o[0].toUpperCase() + o.slice(1)}</option>)}
      </select>
    </div>
  );
  return (
    <div className="fld">
      <label className="fld-lbl">{col.label}</label>
      <input
        className={cls}
        type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"}
        value={value || ""}
        onChange={e => onChange(col.key, e.target.value)}
      />
    </div>
  );
}

/* ─── Snackbar ─── */
function Snack({ msg, severity, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`snack snack-${severity}`}>{msg}</div>;
}

/* ═══════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════ */
export default function Invested({ inline = false, onDataChange, initialTab, theme = "dark" }) {
  const [tab, setTab]               = useState(initialTab || "completed");
  const [rows, setRows]             = useState([]);
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [dlg, setDlg]               = useState(false);
  const [editRow, setEditRow]       = useState(null);
  const [form, setForm]             = useState({});
  const [delId, setDelId]           = useState(null);
  const [confirm, setConfirm]       = useState(false);
  const [promo, setPromo]           = useState(false);
  const [promoId, setPromoId]       = useState(null);
  const [promoForm, setPromoForm]   = useState({});
  const [promoLoading, setPromoLoading] = useState(false);
  const [snack, setSnack]           = useState(null);

  useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);
  useEffect(() => { setSearch(""); }, [tab]);

  const cols   = tab === "completed" ? COMPLETED_COLS : PENDING_COLS;
  const isDark = theme !== "light";
  /* CSS class suffix passed to portal overlays */
  const themeClass = isDark ? "" : " theme-light";

  const showSnack = (msg, severity = "success") => setSnack({ msg, severity });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/invested/${tab}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Invested load error:", e);
      setSnack({ msg: `Failed to load: ${e.message}`, severity: "error" });
    } finally { setLoading(false); }
  }, [tab]);
  useEffect(() => { load(); }, [load]);

  const q            = search.trim().toLowerCase();
  const filteredRows = q
    ? rows.filter(r => (r.client_name || "").toLowerCase().includes(q) || (r.amc_name || "").toLowerCase().includes(q))
    : rows;

  const openAdd  = () => { setEditRow(null); setForm(tab === "completed" ? emptyC() : emptyP()); setDlg(true); };
  const openEdit = (row) => { setEditRow(row); setForm({ ...row }); setDlg(true); };
  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    const url = editRow ? `${API}/invested/${tab}/${editRow.id}` : `${API}/invested/${tab}`;
    try {
      const r = await fetch(url, { method: editRow ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!r.ok) throw 0;
      showSnack(editRow ? "Updated!" : "Added!"); setDlg(false); load(); onDataChange?.();
    } catch { showSnack("Save failed", "error"); }
  };

  const del = async () => {
    try {
      const r = await fetch(`${API}/invested/${tab}/${delId}`, { method: "DELETE" });
      if (!r.ok) throw 0;
      showSnack("Deleted"); setConfirm(false); load(); onDataChange?.();
    } catch { showSnack("Delete failed", "error"); }
  };

  const openPromo   = (row) => { setPromoId(row.id); setPromoForm(p2c(row)); setPromo(true); };
  const setPromoFld = (k, v) => setPromoForm(p => ({ ...p, [k]: v }));
  const savePromo   = async () => {
    setPromoLoading(true);
    try {
      const a = await fetch(`${API}/invested/move/${promoId}`, {
  method: "POST"
});
      if (!a.ok) throw new Error("Add failed");
      showSnack("✓ Moved to Completed!"); setPromo(false); load(); onDataChange?.();
    } catch (e) { showSnack(e.message || "Failed", "error"); } finally { setPromoLoading(false); }
  };

  /* ── render a single table cell — passes theme to Tooltip ── */
  const renderCell = (col, row) => {
    const raw = row[col.key];

    if (col.type === "date") return fmtDate(raw);

    if (col.key === "amount" || col.key === "amount_tobe_invested") {
      return (
        <span style={{ color: isDark ? "#64B5F6" : "#1a50b5", fontWeight: 700 }}>
          {fmtAmount(raw)}
        </span>
      );
    }

    if (col.key === "client_name" || col.key === "amc_name") {
      return (
        <Tooltip text={String(raw ?? "")} theme={theme}>
          <Highlight text={raw} query={search} theme={theme} />
        </Tooltip>
      );
    }

    return (
      <Tooltip text={String(raw ?? "")} theme={theme}>
        {raw ?? "—"}
      </Tooltip>
    );
  };

  /* ─── accent colour for Add Row button changes with theme ─── */
  const addBtnStyle = {
    background: isDark
      ? "linear-gradient(135deg,#64B5F6,#2979A0)"
      : "linear-gradient(135deg,#2a6dd9,#5a3fb5)",
    boxShadow: isDark
      ? "0 4px 14px rgba(100,181,246,.3)"
      : "0 4px 14px rgba(42,109,217,.35)",
  };

  return (
    <div className={`mod-wrap${themeClass}`}>
      <style>{INV_CSS + PORTAL_CSS}</style>

      {/* ── Top bar ── */}
      <div className="mod-hdr">
        <div className="tabs-row">
          {TABS.map(t => (
            <button key={t.id} className={`tab-pill${tab === t.id ? " tab-active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === "pending" && (
          <button className="add-btn" style={addBtnStyle} onClick={openAdd}>
            <IcoPlus /> Add Row
          </button>
        )}
      </div>

      {/* ── Search bar ── */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={`Search client or AMC name in ${tab === "completed" ? "Completed" : "Pending"}…`}
        resultCount={filteredRows.length}
        totalCount={rows.length}
        theme={theme}
      />

      {/* ── Table section header ── */}
      <div className="tbl-hdr">
        <span className="tbl-title">{TABS.find(t => t.id === tab)?.label}</span>
        {!loading && (
          <span className="tbl-badge">
            {search.trim()
              ? <>{filteredRows.length} <span style={{ opacity: .55 }}>/ {rows.length}</span></>
              : <>{rows.length} records</>
            }
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
                <th style={{ width: 42 }}>#</th>
                {cols.map(c => <th key={c.key}>{c.label}</th>)}
                <th style={{ textAlign: "center", width: tab === "pending" ? 108 : 82 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="fd-empty" colSpan={cols.length + 2}>
                    {search.trim()
                      ? <>No results for "<strong style={{ color: isDark ? "#64B5F6" : "#2a6dd9" }}>{search}</strong>"</>
                      : tab === "pending"
                        ? 'No records found. Click "Add Row" to get started.'
                        : "No records found."
                    }
                  </td>
                </tr>
              ) : filteredRows.map((row, i) => (
                <tr key={row.id}>
                  <td className="fd-num">{i + 1}</td>
                  {cols.map(c => <td key={c.key}>{renderCell(c, row)}</td>)}
                  <td>
                    <div className="act-cell">
                      <button className="ab ab-edit"  title="Edit"              onClick={() => openEdit(row)}><IcoEdit /></button>
                      {tab === "pending" && (
                        <button className="ab ab-promo" title="Move to Completed" onClick={() => openPromo(row)}><IcoMove /></button>
                      )}
                      <button className="ab ab-del"   title="Delete"            onClick={() => { setDelId(row.id); setConfirm(true); }}><IcoDel /></button>
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
        <div className={`dlg-ov${themeClass}`} onClick={e => e.target === e.currentTarget && setDlg(false)}>
          <div className="inv-dlg-box">
            <div className="inv-dlg-hdr">
              <div className="dlg-bar" style={{ background: isDark ? "#64B5F6" : "#2a6dd9" }} />
              <div className="inv-dlg-ttl">{editRow ? "Edit Record" : "Add Record"}</div>
            </div>
            <div className="inv-dlg-body">
              {cols.map(c => <Field key={c.key} col={c} value={form[c.key]} onChange={setField} />)}
            </div>
            <div className="inv-dlg-foot">
              <button className="inv-btn-cancel" onClick={() => setDlg(false)}>Cancel</button>
              <button className="inv-btn-ok inv-btn-primary" onClick={save}>{editRow ? "Update" : "Save"}</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Move to Completed Dialog ── */}
      {promo && createPortal(
        <div className={`dlg-ov${themeClass}`} onClick={e => e.target === e.currentTarget && setPromo(false)}>
          <div className="inv-dlg-box">
            <div className="inv-dlg-hdr">
              <div className="dlg-bar" style={{ background: "#34D399" }} />
              <div>
                <div className="inv-dlg-ttl">Move to Customers Completed</div>
                <div className="inv-dlg-sub">Orange fields require manual entry</div>
              </div>
            </div>
            <div className="inv-dlg-body">
              {COMPLETED_COLS.map(c => (
                <div key={c.key}>
                  <Field col={c} value={promoForm[c.key]} onChange={setPromoFld} highlight={MANUAL_KEYS.has(c.key)} />
                  {MANUAL_KEYS.has(c.key) && <div className="fld-note" style={{ color: "#f59e0b" }}>⚠ Fill manually</div>}
                  {AUTO_KEYS.has(c.key)   && <div className="fld-note" style={{ color: "#34D399" }}>✓ Auto-filled</div>}
                </div>
              ))}
            </div>
            <div className="inv-dlg-foot">
              <button className="inv-btn-cancel" onClick={() => setPromo(false)} disabled={promoLoading}>Cancel</button>
              <button className="inv-btn-ok inv-btn-success" onClick={savePromo} disabled={promoLoading}>
                {promoLoading ? "Saving…" : "Save & Move"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Confirm Delete Dialog ── */}
      {confirm && createPortal(
        <div className={`dlg-ov${themeClass}`} onClick={e => e.target === e.currentTarget && setConfirm(false)}>
          <div className="inv-dlg-box" style={{ maxWidth: 370 }}>
            <div className="inv-dlg-hdr">
              <div className="dlg-bar" style={{ background: "#EF4444" }} />
              <div className="inv-dlg-ttl">Confirm Delete</div>
            </div>
            <div className="inv-dlg-body">
              <p className="inv-dlg-p">Are you sure you want to delete this record? This action cannot be undone.</p>
            </div>
            <div className="inv-dlg-foot">
              <button className="inv-btn-cancel" onClick={() => setConfirm(false)}>Cancel</button>
              <button className="inv-btn-ok inv-btn-danger" onClick={del}>Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {snack && createPortal(<Snack {...snack} onClose={() => setSnack(null)} />, document.body)}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INV_CSS  —  DARK default + LIGHT overrides (.theme-light)
═══════════════════════════════════════════════════════════════ */
const INV_CSS = `
  @keyframes srIn  { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:none} }
  @keyframes dlgIn { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:none} }
  @keyframes spin  { to{transform:rotate(360deg)} }

  /* ── Wrapper ── */
  .mod-wrap {
    font-family:var(--fb,'Exo 2',sans-serif);
    color:rgba(200,220,255,.92);
    min-width:0; max-width:100%; width:100%;
    box-sizing:border-box; overflow:hidden; position:relative;
  }
  .mod-wrap input::placeholder { color:rgba(160,190,255,0.35); }
  /* LIGHT */
  .mod-wrap.theme-light { color:#111827; }
  .mod-wrap.theme-light input::placeholder { color:rgba(0,0,0,0.3); }

  /* ── Header bar ── */
  .mod-hdr {
    display:flex; flex-wrap:wrap; align-items:center; gap:8px;
    padding:12px 20px;
    border-bottom:1px solid rgba(100,181,246,.12);
    box-sizing:border-box; width:100%;
  }
  .theme-light .mod-hdr { border-bottom-color:rgba(10,30,100,0.12); }

  .tabs-row { display:flex; flex-wrap:wrap; gap:6px; flex:1 1 auto; min-width:0; }

  /* ── Tab pills — DARK ── */
  .tab-pill {
    padding:6px 16px; border-radius:20px;
    border:1px solid rgba(100,181,246,.25); background:transparent;
    color:rgba(200,220,255,.6);
    font-size:.78rem; font-family:var(--fb,'Exo 2',sans-serif); font-weight:600;
    cursor:pointer; transition:all .2s; white-space:nowrap; flex-shrink:0;
  }
  .tab-pill:hover { border-color:rgba(100,181,246,.5); color:#fff; }
  .tab-pill.tab-active {
    background:rgba(100,181,246,.15); border-color:rgba(100,181,246,.55);
    color:#64B5F6; box-shadow:0 0 12px rgba(100,181,246,.18);
  }
  /* ── Tab pills — LIGHT ── */
  .theme-light .tab-pill { color:rgba(0,0,0,0.55); border-color:rgba(10,30,100,0.2); }
  .theme-light .tab-pill:hover { color:#000; border-color:rgba(10,30,100,0.4); background:rgba(10,30,100,0.05); }
  .theme-light .tab-pill.tab-active {
    color:#1a50b5; background:rgba(42,109,217,0.1);
    border-color:rgba(42,109,217,0.4); box-shadow:none;
  }

  /* ── Add button ── */
  .add-btn {
    display:inline-flex; align-items:center; gap:6px; padding:7px 16px;
    border-radius:20px; border:none; color:#fff;
    font-size:.78rem; font-family:var(--fb,'Exo 2',sans-serif); font-weight:700;
    cursor:pointer; transition:opacity .2s,transform .15s; flex-shrink:0; white-space:nowrap;
  }
  .add-btn:hover { opacity:.88; transform:translateY(-1px); }

  /* ── Table header row ── */
  .tbl-hdr {
    display:flex; flex-wrap:wrap; align-items:center; gap:8px;
    padding:8px 20px; box-sizing:border-box; width:100%;
  }
  /* DARK */
  .tbl-title {
    font-size:.78rem; font-weight:700; color:rgba(200,220,255,.5);
    text-transform:uppercase; letter-spacing:.06em;
    font-family:var(--fh,'Orbitron',sans-serif);
  }
  /* LIGHT */
  .theme-light .tbl-title { color:rgba(0,0,0,0.5); }

  /* DARK */
  .tbl-badge {
    font-size:.7rem; font-weight:700; padding:2px 10px; border-radius:20px;
    border:1px solid rgba(100,181,246,.22);
    color:#64B5F6; background:rgba(100,181,246,.1);
    font-family:var(--fh,'Orbitron',sans-serif);
  }
  /* LIGHT */
  .theme-light .tbl-badge {
    color:#1a50b5; background:rgba(42,109,217,0.1); border-color:rgba(42,109,217,0.25);
  }

  /* ── Table wrapper ── */
  .tbl-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; width:100%; box-sizing:border-box; }
  .tbl-wrap::-webkit-scrollbar { height:5px; }
  .tbl-wrap::-webkit-scrollbar-track { background:rgba(100,181,246,.05); border-radius:4px; }
  .tbl-wrap::-webkit-scrollbar-thumb { background:rgba(100,181,246,.3); border-radius:4px; }
  .tbl-wrap::-webkit-scrollbar-thumb:hover { background:rgba(100,181,246,.55); }
  .theme-light .tbl-wrap::-webkit-scrollbar-track { background:rgba(42,109,217,0.05); }
  .theme-light .tbl-wrap::-webkit-scrollbar-thumb { background:rgba(42,109,217,0.25); }
  .theme-light .tbl-wrap::-webkit-scrollbar-thumb:hover { background:rgba(42,109,217,0.5); }

  /* ── Table — DARK ── */
  .fd-tbl { width:100%; min-width:560px; border-collapse:collapse; font-size:.8rem; table-layout:auto; }
  .fd-tbl thead tr { border-bottom:1px solid rgba(100,181,246,.15); }
  .theme-light .fd-tbl thead tr { border-bottom-color:rgba(10,30,100,0.18); }

  .fd-tbl th {
    padding:9px 14px; text-align:left; font-size:.68rem; font-weight:700;
    text-transform:uppercase; letter-spacing:.07em;
    color:rgba(100,181,246,.65);
    font-family:var(--fh,'Orbitron',sans-serif); white-space:nowrap;
  }
  .theme-light .fd-tbl th { color:rgba(0,0,0,0.48); }

  .fd-tbl td {
    padding:9px 14px;
    border-bottom:1px solid rgba(100,181,246,.07);
    color:rgba(200,220,255,.85);
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
    max-width:200px; position:relative;
  }
  .theme-light .fd-tbl td { color:#1e293b; border-bottom-color:rgba(10,30,100,0.09); }

  .fd-tbl tbody tr { transition:background .15s; }
  .fd-tbl tbody tr:hover { background:rgba(100,181,246,.06); }
  .theme-light .fd-tbl tbody tr:hover { background:rgba(42,109,217,0.05); }

  /* DARK row number */
  .fd-num { color:rgba(100,181,246,.4) !important; font-size:.72rem !important; width:42px; }
  /* LIGHT row number */
  .theme-light .fd-num { color:rgba(0,0,0,0.3) !important; }

  .fd-empty { text-align:center; padding:32px 20px !important; color:rgba(200,220,255,.3); font-size:.82rem; }
  .theme-light .fd-empty { color:rgba(0,0,0,0.38); }

  /* ── Spinner — DARK ── */
  .fd-spin { display:flex; justify-content:center; padding:40px; }
  .spinner {
    width:32px; height:32px;
    border:3px solid rgba(100,181,246,.15); border-top-color:#64B5F6;
    border-radius:50%; animation:spin .7s linear infinite;
  }
  /* LIGHT */
  .theme-light .spinner { border-color:rgba(42,109,217,0.15); border-top-color:#2a6dd9; }

  /* ── Action buttons — DARK ── */
  .act-cell { display:flex; align-items:center; justify-content:center; gap:5px; }
  .ab { display:inline-flex; align-items:center; justify-content:center; width:26px; height:26px; border-radius:7px; border:none; cursor:pointer; transition:all .15s; }
  .ab-edit  { background:rgba(100,181,246,.12); color:#64B5F6; }
  .ab-edit:hover  { background:rgba(100,181,246,.28); }
  .ab-del   { background:rgba(239,68,68,.1);   color:#EF4444; }
  .ab-del:hover   { background:rgba(239,68,68,.25); }
  .ab-promo { background:rgba(52,211,153,.1);  color:#34D399; }
  .ab-promo:hover { background:rgba(52,211,153,.25); }
  /* LIGHT */
  .theme-light .ab-edit  { background:rgba(42,109,217,0.1);  color:#1a50b5; }
  .theme-light .ab-edit:hover  { background:rgba(42,109,217,0.22); }
  .theme-light .ab-del   { background:rgba(180,50,50,0.1);   color:#9a2020; }
  .theme-light .ab-del:hover   { background:rgba(180,50,50,0.22); }
  .theme-light .ab-promo { background:rgba(15,120,85,0.1);   color:#0a7a56; }
  .theme-light .ab-promo:hover { background:rgba(15,120,85,0.22); }

  /* ── Form fields — DARK ── */
  .fld { display:flex; flex-direction:column; gap:5px; }
  .fld-lbl {
    font-size:.7rem; font-weight:600; text-transform:uppercase; letter-spacing:.06em;
    color:rgba(160,190,255,.55); font-family:var(--fh,'Orbitron',sans-serif);
  }
  .theme-light .fld-lbl { color:rgba(0,0,0,0.6); }
  .fld-inp {
    padding:9px 12px; border-radius:9px;
    border:1px solid rgba(100,181,246,.22);
    background:rgba(10,18,60,.6); color:rgba(220,235,255,.92);
    font-size:.84rem; font-family:var(--fb,'Exo 2',sans-serif);
    outline:none; transition:border-color .18s,box-shadow .18s; width:100%; box-sizing:border-box;
  }
  .fld-inp:focus { border-color:rgba(100,181,246,.6); box-shadow:0 0 0 3px rgba(100,181,246,.12); }
  .fld-inp.fld-hi { border-color:rgba(245,158,11,.4); background:rgba(245,158,11,.05); }
  .fld-inp.fld-hi:focus { border-color:rgba(245,158,11,.7); box-shadow:0 0 0 3px rgba(245,158,11,.12); }
  .fld-inp option { background:#0d1640; color:#fff; }
  .fld-note { font-size:.68rem; font-weight:600; margin-top:2px; padding-left:2px; }
  /* LIGHT */
  .theme-light .fld-inp { background:rgba(255,255,255,0.85); border:1px solid rgba(10,30,100,0.22); color:#111827; }
  .theme-light .fld-inp:focus { border-color:#2a6dd9; box-shadow:0 0 0 3px rgba(42,109,217,0.12); }
  .theme-light .fld-inp.fld-hi { border-color:rgba(201,124,8,0.5); background:rgba(245,158,11,0.06); }
  .theme-light .fld-inp option { background:#fff; color:#111827; }

  /* ── Snackbar ── */
  .snack {
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    padding:10px 22px; border-radius:10px; font-size:.82rem; font-weight:600;
    font-family:var(--fb,'Exo 2',sans-serif); z-index:99999;
    box-shadow:0 4px 20px rgba(0,0,0,.4); animation:dlgIn .2s ease; white-space:nowrap;
  }
  .snack-success { background:#065f46; color:#6ee7b7; border:1px solid #34D399; }
  .snack-error   { background:#7f1d1d; color:#fca5a5; border:1px solid #EF4444; }

  /* ── Responsive ── */
  @media (max-width:600px) { .mod-hdr { padding:10px 14px; } .tbl-hdr { padding:6px 14px; } }
  @media (max-width:480px) {
    .fd-tbl td,.fd-tbl th { font-size:0.72rem !important; padding:6px 8px !important; }
    .act-cell { flex-direction:column !important; gap:3px !important; }
    .tab-pill { font-size:0.72rem !important; padding:5px 10px !important; }
    .mod-hdr { padding:10px 12px; } .tbl-hdr { padding:6px 12px; }
  }
`;

/* ═══════════════════════════════════════════════════════════════
   PORTAL_CSS  —  Dialog / overlay styles injected via portals.
   DARK default + .theme-light overrides for every element.
═══════════════════════════════════════════════════════════════ */
const PORTAL_CSS = `
  @keyframes invDlgIn {
    from{opacity:0;transform:translateY(16px) scale(0.97)}
    to  {opacity:1;transform:none}
  }
  @keyframes fIn { from{opacity:0} to{opacity:1} }

  /* ── Overlay — DARK ── */
  .dlg-ov {
    position:fixed !important; inset:0 !important;
    background:rgba(0,0,10,0.6);
    backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
    display:flex !important; align-items:center !important;
    justify-content:center !important;
    z-index:99999 !important;
    padding:16px; box-sizing:border-box; overflow-y:auto;
    animation:fIn .18s ease;
  }
  /* ── Overlay — LIGHT ── */
  .dlg-ov.theme-light { background:rgba(10,20,80,0.25); }

  /* ── Dialog box — DARK ── */
  .inv-dlg-box {
    background:rgba(7,9,30,0.93);
    backdrop-filter:blur(44px) saturate(160%);
    border:1px solid rgba(79,142,247,0.45);
    border-radius:18px;
    box-shadow:0 8px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06);
    width:100%; max-width:min(460px,calc(100vw - 32px));
    max-height:calc(100vh - 40px); overflow-y:auto;
    animation:invDlgIn .3s cubic-bezier(0.34,1.56,0.64,1);
    box-sizing:border-box; font-family:'Inter',sans-serif;
  }
  .inv-dlg-box::-webkit-scrollbar { width:4px; }
  .inv-dlg-box::-webkit-scrollbar-thumb { background:rgba(79,142,247,0.25); border-radius:4px; }

  /* ── Dialog box — LIGHT ── */
  .theme-light .inv-dlg-box {
    background:rgba(255,255,255,0.97) !important;
    backdrop-filter:blur(40px) saturate(180%) !important;
    border:1px solid rgba(42,109,217,0.22) !important;
    box-shadow:0 8px 40px rgba(10,30,100,0.15), 0 0 0 1px rgba(42,109,217,0.07) !important;
  }
  .theme-light .inv-dlg-box::-webkit-scrollbar-thumb { background:rgba(42,109,217,0.2); }

  /* ── Header — DARK ── */
  .inv-dlg-hdr {
    display:flex; align-items:center; gap:12px;
    padding:16px 20px 12px;
    border-bottom:1px solid rgba(79,142,247,0.18);
    background:rgba(79,142,247,0.04);
    border-radius:18px 18px 0 0;
  }
  /* ── Header — LIGHT ── */
  .theme-light .inv-dlg-hdr {
    border-bottom-color:rgba(42,109,217,0.15) !important;
    background:rgba(42,109,217,0.06) !important;
  }

  .dlg-bar { width:4px; height:22px; border-radius:2px; flex-shrink:0; }

  /* ── Title — DARK ── */
  .inv-dlg-ttl { font-weight:800; font-size:.95rem; color:#fff; letter-spacing:.01em; }
  /* ── Title — LIGHT ── */
  .theme-light .inv-dlg-ttl { color:#111827 !important; }

  /* ── Sub — DARK ── */
  .inv-dlg-sub { font-size:.72rem; color:rgba(180,210,255,0.55); margin-top:2px; }
  /* ── Sub — LIGHT ── */
  .theme-light .inv-dlg-sub { color:rgba(0,0,0,0.5) !important; }

  /* ── Body — DARK ── */
  .inv-dlg-body {
    padding:16px 20px; display:flex; flex-direction:column; gap:12px;
    max-height:55vh; overflow-y:auto; background:transparent;
  }
  .inv-dlg-body::-webkit-scrollbar { width:4px; }
  .inv-dlg-body::-webkit-scrollbar-thumb { background:rgba(79,142,247,0.2); border-radius:4px; }
  .theme-light .inv-dlg-body::-webkit-scrollbar-thumb { background:rgba(42,109,217,0.2); }

  /* ── Fields — DARK ── */
  .inv-dlg-body .fld { display:flex; flex-direction:column; gap:6px; }
  .inv-dlg-body .fld-lbl {
    font-size:.67rem; font-weight:700; text-transform:uppercase; letter-spacing:.08em;
    color:rgba(180,210,255,0.75); font-family:'Inter',sans-serif;
  }
  .theme-light .inv-dlg-body .fld-lbl { color:rgba(0,0,0,0.65) !important; }

  .inv-dlg-body .fld-inp {
    width:100%; padding:9px 12px; border-radius:10px;
    background:rgba(255,255,255,0.04); border:1px solid rgba(79,142,247,0.3);
    color:#fff; font-size:.84rem; font-family:'Inter',sans-serif;
    outline:none; transition:border-color .2s,box-shadow .2s; box-sizing:border-box;
  }
  .inv-dlg-body .fld-inp:focus { border-color:#4F8EF7; box-shadow:0 0 0 3px rgba(79,142,247,0.16); }
  .inv-dlg-body .fld-inp option { background:#0c1638; color:#fff; }
  /* ── Fields — LIGHT ── */
  .theme-light .inv-dlg-body .fld-inp {
    background:rgba(255,255,255,0.78) !important;
    border:1px solid rgba(42,109,217,0.22) !important;
    color:#111827 !important;
  }
  .theme-light .inv-dlg-body .fld-inp:focus {
    border-color:#2a6dd9 !important;
    box-shadow:0 0 0 3px rgba(42,109,217,0.12) !important;
  }
  .theme-light .inv-dlg-body .fld-inp option { background:#fff !important; color:#111827 !important; }

  /* highlight field */
  .inv-dlg-body .fld-inp.fld-hi { border-color:#f59e0b !important; }
  .inv-dlg-body .fld-inp.fld-hi:focus { box-shadow:0 0 0 3px rgba(245,158,11,0.12) !important; }

  /* confirm paragraph */
  .inv-dlg-p { color:rgba(210,225,255,0.88); font-size:.84rem; line-height:1.6; margin:0; }
  .theme-light .inv-dlg-p { color:rgba(0,0,0,0.65) !important; }

  /* ── Footer — DARK ── */
  .inv-dlg-foot {
    display:flex; justify-content:flex-end; gap:8px;
    padding:12px 20px;
    border-top:1px solid rgba(79,142,247,0.15);
    background:rgba(79,142,247,0.02);
    border-radius:0 0 18px 18px;
  }
  /* ── Footer — LIGHT ── */
  .theme-light .inv-dlg-foot {
    border-top-color:rgba(42,109,217,0.14) !important;
    background:rgba(42,109,217,0.03) !important;
  }

  /* ── Cancel — DARK ── */
  .inv-btn-cancel {
    padding:8px 14px; border-radius:10px;
    border:1px solid rgba(79,142,247,0.28); background:none;
    color:rgba(180,210,255,0.75); font-size:.8rem;
    font-family:'Inter',sans-serif; font-weight:600; cursor:pointer; transition:all .2s;
  }
  .inv-btn-cancel:hover { border-color:rgba(255,255,255,0.3); color:#fff; background:rgba(255,255,255,0.04); }
  .inv-btn-cancel:disabled { opacity:.4; cursor:not-allowed; }
  /* ── Cancel — LIGHT ── */
  .theme-light .inv-btn-cancel {
    border:1px solid rgba(42,109,217,0.28) !important;
    color:rgba(0,0,0,0.6) !important;
  }
  .theme-light .inv-btn-cancel:hover {
    border-color:rgba(42,109,217,0.5) !important;
    color:#111827 !important; background:rgba(42,109,217,0.06) !important;
  }

  /* ── OK buttons ── */
  .inv-btn-ok {
    padding:8px 16px; border-radius:10px; border:none; color:#fff;
    font-size:.8rem; font-family:'Inter',sans-serif; font-weight:700;
    cursor:pointer; transition:all .25s cubic-bezier(0.34,1.56,0.64,1);
  }
  .inv-btn-ok:hover { transform:translateY(-1px); filter:brightness(1.1); }
  .inv-btn-ok:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  /* DARK gradients */
  .inv-btn-primary { background:linear-gradient(135deg,#4F8EF7,#7B5FFF); box-shadow:0 4px 16px rgba(79,142,247,0.35); }
  .inv-btn-success { background:linear-gradient(135deg,#34D399,#059669); box-shadow:0 4px 16px rgba(52,211,153,0.3); }
  .inv-btn-danger  { background:linear-gradient(135deg,#EF4444,#DC2626); box-shadow:0 4px 16px rgba(239,68,68,0.3); }
  /* LIGHT gradients */
  .theme-light .inv-btn-primary { background:linear-gradient(135deg,#2a6dd9,#5a3fb5) !important; box-shadow:0 4px 14px rgba(42,109,217,.35) !important; }
  .theme-light .inv-btn-success { background:linear-gradient(135deg,#0f9e6e,#057a52) !important; box-shadow:0 4px 14px rgba(15,158,110,.3) !important; }
  .theme-light .inv-btn-danger  { background:linear-gradient(135deg,#d14040,#a82424) !important; box-shadow:0 4px 14px rgba(180,50,50,.3) !important; }

  /* ── Responsive ── */
  @media (max-width:520px) {
    .inv-dlg-box { max-width:calc(100vw - 24px) !important; border-radius:18px 18px 0 0 !important; }
    .dlg-ov { align-items:flex-end !important; padding:0 !important; }
    .inv-dlg-hdr { padding:14px 16px 12px; }
    .inv-dlg-body { padding:16px; gap:11px; }
    .inv-dlg-foot { padding:12px 16px; }
    .inv-btn-ok,.inv-btn-cancel { padding:8px 14px; font-size:.78rem; }
  }
`;