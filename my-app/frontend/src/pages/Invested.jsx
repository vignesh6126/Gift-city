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
  { key: "status", label: "Status", type: "text" },
];
const AUTO_KEYS = new Set(["client_name", "amount", "amc_name", "scheme", "bank"]);
const MANUAL_KEYS = new Set(["first_investment"]);

const p2c = (r) => ({ client_name: r.client_name || "", amount: r.amount_tobe_invested || "", amc_name: r.amc_name || "", scheme: r.scheme || "", bank: r.bank || "savings", first_investment: "" });
const emptyC = () => ({ client_name: "", first_investment: "", amount: "", scheme: "", amc_name: "", bank: "savings" });
const emptyP = () => ({ client_name: "", amount_tobe_invested: "", scheme: "", amc_name: "", bank: "savings", submission_date: "", status: "" });
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
        background: theme === "light" ? "rgba(42,109,217,0.2)" : "rgba(100,181,246,0.35)",
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
function SearchBar({ value, onChange, placeholder, resultCount, totalCount, theme = "dark" }) {
  const inputRef = useRef(null);
  const isActive = value.length > 0;

  return (
    <div style={{
      padding: "10px 16px 12px",
      borderBottom: theme === "light" ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(100,181,246,0.12)",
      background: theme === "light" ? "rgba(0,0,0,0.02)" : "rgba(100,181,246,0.02)",
      boxSizing: "border-box",
      width: "100%",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 160px", minWidth: 0, maxWidth: 420 }}>
          <span style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            color: isActive ? (theme === "light" ? "#2a6dd9" : "#64B5F6") : (theme === "light" ? "rgba(0,0,0,0.3)" : "rgba(160,190,255,0.4)"),
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
              width: "100%",
              padding: "8px 34px 8px 32px",
              borderRadius: 10,
              border: isActive
                ? (theme === "light" ? "1px solid rgba(42,109,217,0.6)" : "1px solid rgba(100,181,246,0.55)")
                : (theme === "light" ? "1px solid rgba(0,0,0,0.2)" : "1px solid rgba(100,181,246,0.22)"),
              background: isActive
                ? (theme === "light" ? "rgba(42,109,217,0.07)" : "rgba(100,181,246,0.08)")
                : (theme === "light" ? "rgba(255,255,255,0.6)" : "rgba(10,16,60,0.5)"),
              color: theme === "light" ? "#111827" : "#fff",
              fontSize: ".82rem",
              fontFamily: "var(--fb,'Exo 2',sans-serif)",
              outline: "none",
              transition: "all .22s",
              boxSizing: "border-box",
              boxShadow: isActive ? (theme === "light" ? "0 0 0 3px rgba(42,109,217,0.12)" : "0 0 0 3px rgba(100,181,246,0.12)") : "none",
            }}
            onFocus={e => {
              e.target.style.borderColor = theme === "light" ? "rgba(42,109,217,0.8)" : "rgba(100,181,246,0.7)";
              e.target.style.boxShadow = theme === "light" ? "0 0 0 3px rgba(42,109,217,0.15)" : "0 0 0 3px rgba(100,181,246,0.15)";
            }}
            onBlur={e => {
              e.target.style.borderColor = isActive ? (theme === "light" ? "rgba(42,109,217,0.6)" : "rgba(100,181,246,0.55)") : (theme === "light" ? "rgba(0,0,0,0.2)" : "rgba(100,181,246,0.22)");
              e.target.style.boxShadow = isActive ? (theme === "light" ? "0 0 0 3px rgba(42,109,217,0.12)" : "0 0 0 3px rgba(100,181,246,0.12)") : "none";
            }}
          />
          {isActive && (
            <button
              onClick={() => { onChange(""); inputRef.current?.focus(); }}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: theme === "light" ? "rgba(42,109,217,0.14)" : "rgba(100,181,246,0.18)", border: "none", borderRadius: "50%",
                width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: theme === "light" ? "rgba(0,0,0,0.55)" : "rgba(180,210,255,0.8)", transition: "all .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = theme === "light" ? "rgba(42,109,217,0.28)" : "rgba(100,181,246,0.35)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = theme === "light" ? "rgba(42,109,217,0.14)" : "rgba(100,181,246,0.18)"; e.currentTarget.style.color = theme === "light" ? "rgba(0,0,0,0.55)" : "rgba(180,210,255,0.8)"; }}
            >
              <IcoClear />
            </button>
          )}
        </div>
        {isActive && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 12px", borderRadius: 20,
            background: resultCount > 0 ? "rgba(100,181,246,0.12)" : "rgba(248,113,113,0.12)",
            border: `1px solid ${resultCount > 0 ? "rgba(100,181,246,0.28)" : "rgba(248,113,113,0.28)"}`,
            fontSize: ".7rem", fontWeight: 700,
            color: resultCount > 0 ? (theme === "light" ? "#2a6dd9" : "#64B5F6") : (theme === "light" ? "#b02020" : "#F87171"),
            fontFamily: "var(--fh,'Orbitron',sans-serif)",
            animation: "srIn .18s ease",
            whiteSpace: "nowrap",
            flexShrink: 0,
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
      <input className={cls} type={col.type === "number" ? "number" : col.type === "date" ? "date" : "text"} value={value || ""} onChange={e => onChange(col.key, e.target.value)} />
    </div>
  );
}

function Snack({ msg, severity, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`snack snack-${severity}`}>{msg}</div>;
}

export default function Invested({ inline = false, onDataChange, initialTab, theme = "dark" }) {
  const [tab, setTab] = useState(initialTab || "completed");
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [dlg, setDlg] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState({});
  const [delId, setDelId] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [promo, setPromo] = useState(false);
  const [promoId, setPromoId] = useState(null);
  const [promoForm, setPromoForm] = useState({});
  const [promoLoading, setPromoLoading] = useState(false);
  const [snack, setSnack] = useState(null);

  useEffect(() => { if (initialTab) setTab(initialTab); }, [initialTab]);
  useEffect(() => { setSearch(""); }, [tab]);

  const cols = tab === "completed" ? COMPLETED_COLS : PENDING_COLS;
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
    } finally {
      setLoading(false);
    }
  }, [tab]);
  useEffect(() => { load(); }, [load]);

  const q = search.trim().toLowerCase();
  const filteredRows = q
    ? rows.filter(r => (r.client_name || "").toLowerCase().includes(q) || (r.amc_name || "").toLowerCase().includes(q))
    : rows;

  const openAdd = () => { setEditRow(null); setForm(tab === "completed" ? emptyC() : emptyP()); setDlg(true); };
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

  const openPromo = (row) => { setPromoId(row.id); setPromoForm(p2c(row)); setPromo(true); };
  const setPromoFld = (k, v) => setPromoForm(p => ({ ...p, [k]: v }));
  const savePromo = async () => {
    setPromoLoading(true);
    try {
      const a = await fetch(`${API}/invested/completed`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(promoForm) });
      if (!a.ok) throw new Error("Add failed");
      const d = await fetch(`${API}/invested/pending/${promoId}`, { method: "DELETE" });
      if (!d.ok) throw new Error("Delete failed");
      showSnack("✓ Moved to Completed!"); setPromo(false); load(); onDataChange?.();
    } catch (e) { showSnack(e.message || "Failed", "error"); } finally { setPromoLoading(false); }
  };

  return (
    <div className={`mod-wrap${theme === "light" ? " theme-light" : ""}`}>
      {/* ── INV_CSS: full base styles + responsive (mirrors EMP_CSS pattern) ── */}
      <style>{INV_CSS + PORTAL_CSS}</style>

      {/* ── Top bar ── */}
      <div className="mod-hdr">
        <div className="tabs-row">
          {TABS.map(t => (
            <button key={t.id} className={`tab-pill ${tab === t.id ? "tab-active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === "pending" && (
          <button className="add-btn" style={{ background: "linear-gradient(135deg,#64B5F6,#2979A0)", boxShadow: "0 4px 14px rgba(100,181,246,.3)" }} onClick={openAdd}>
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
          <span className="tbl-badge" style={{ color: "#64B5F6", background: "rgba(100,181,246,.1)", borderColor: "rgba(100,181,246,.22)" }}>
            {search.trim()
              ? <>{filteredRows.length} <span style={{ opacity: .55 }}>/ {rows.length}</span></>
              : <>{rows.length} records</>
            }
          </span>
        )}
      </div>

      {loading ? (
        <div className="fd-spin"><div className="spinner" style={{ borderTopColor: "#64B5F6" }} /></div>
      ) : (
        <div className="tbl-wrap">
          <table className="fd-tbl">
            <thead><tr>
              <th style={{ width: 42 }}>#</th>
              {cols.map(c => <th key={c.key}>{c.label}</th>)}
              <th style={{ textAlign: "center", width: tab === "pending" ? 108 : 82 }}>Actions</th>
            </tr></thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="fd-empty" colSpan={cols.length + 2}>
                    {search.trim()
                      ? <>No results for "<strong style={{ color: "#64B5F6" }}>{search}</strong>"</>
                      : tab === "pending"
                        ? 'No records found. Click "Add Row" to get started.'
                        : "No records found."
                    }
                  </td>
                </tr>
              ) : filteredRows.map((row, i) => (
                <tr key={row.id}>
                  <td className="fd-num">{i + 1}</td>
                  {cols.map(c => (
                    <td key={c.key}>
                      {c.type === "date"
                        ? fmtDate(row[c.key])
                        : (c.key === "amount" || c.key === "amount_tobe_invested")
                          ? <span style={{ color: "#64B5F6", fontWeight: 700 }}>{fmtAmount(row[c.key])}</span>
                          : (c.key === "client_name" || c.key === "amc_name")
                            ? <Highlight text={row[c.key]} query={search} />
                            : row[c.key] ?? "—"
                      }
                    </td>
                  ))}
                  <td><div className="act-cell">
                    <button className="ab ab-edit" title="Edit" onClick={() => openEdit(row)}><IcoEdit /></button>
                    {tab === "pending" && <button className="ab ab-promo" title="Move to Completed" onClick={() => openPromo(row)}><IcoMove /></button>}
                    <button className="ab ab-del" title="Delete" onClick={() => { setDelId(row.id); setConfirm(true); }}><IcoDel /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Add / Edit Dialog ── */}
      {dlg && createPortal(
        <div className={`dlg-ov${theme === "light" ? " theme-light" : ""}`} onClick={e => e.target === e.currentTarget && setDlg(false)}>
          <div className="inv-dlg-box">
            <div className="inv-dlg-hdr">
              <div className="dlg-bar" style={{ background: "#64B5F6" }} />
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
        <div className={`dlg-ov${theme === "light" ? " theme-light" : ""}`} onClick={e => e.target === e.currentTarget && setPromo(false)}>
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
                  {AUTO_KEYS.has(c.key) && <div className="fld-note" style={{ color: "#34D399" }}>✓ Auto-filled</div>}
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
        <div className={`dlg-ov${theme === "light" ? " theme-light" : ""}`} onClick={e => e.target === e.currentTarget && setConfirm(false)}>
          <div className="inv-dlg-box" style={{ maxWidth: 370 }}>
            <div className="inv-dlg-hdr">
              <div className="dlg-bar" style={{ background: "#EF4444" }} />
              <div className="inv-dlg-ttl">Confirm Delete</div>
            </div>
            <div className="inv-dlg-body">
              <p className="inv-dlg-p">
                Are you sure you want to delete this record? This action cannot be undone.
              </p>
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

/* ─────────────────────────────────────────────────────────────────────────
   INV_CSS  —  Full base styles + responsive overrides.

   ROOT CAUSE FIX: The original Invested.jsx <style> tag only contained
   responsive tweaks. All the structural classes used by dialogs and forms
   (.dlg-ov, .dlg-box, .dlg-hdr, .dlg-bar, .dlg-ttl, .dlg-sub, .dlg-body,
   .dlg-foot, .fld, .fld-lbl, .fld-inp, .fld-hi, .fld-note, .btn-cancel,
   .btn-ok, .btn-success, .btn-danger, .btn-primary, .snack, .ab, .act-cell,
   .fd-tbl, .fd-num, .fd-empty, .fd-spin, .spinner, .tab-pill, .add-btn,
   .tbl-title, .tbl-badge) were only defined in EMP_CSS inside Empanelment.jsx
   and injected by that component's <style> tag. When the Clients page renders
   Invested.jsx standalone (without Empanelment on the same page), none of
   those styles exist, so dialogs appear as raw unstyled HTML.

   Solution: define all required base styles here, mirroring EMP_CSS but
   using the Clients blue (#64B5F6) accent colour instead of the Empanelment
   indigo (#4F8EF7).
───────────────────────────────────────────────────────────────────────── */
const INV_CSS = `
  @keyframes srIn {
    from { opacity:0; transform:translateX(-6px); }
    to   { opacity:1; transform:none; }
  }
  @keyframes dlgIn {
    from { opacity:0; transform:translateY(18px) scale(.97); }
    to   { opacity:1; transform:none; }
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Wrapper ── */
  .mod-wrap {
    font-family: var(--fb,'Exo 2',sans-serif);
    color: rgba(200,220,255,.92);
    min-width: 0;
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
  }
  .mod-wrap input::placeholder { color: rgba(160,190,255,0.35); }
  .mod-wrap.theme-light { color: #111827; }
  .mod-wrap.theme-light input::placeholder { color: rgba(0,0,0,0.3); }

  /* ── Header bar ── */
  .mod-hdr {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    border-bottom: 1px solid rgba(100,181,246,.12);
    box-sizing: border-box;
    width: 100%;
  }
  .theme-light .mod-hdr { border-bottom-color: rgba(10,30,100,0.12); }

  .tabs-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    flex: 1 1 auto;
    min-width: 0;
  }

  /* ── Tab pills ── */
  .tab-pill {
    padding: 6px 16px;
    border-radius: 20px;
    border: 1px solid rgba(100,181,246,.25);
    background: transparent;
    color: rgba(200,220,255,.6);
    font-size: .78rem;
    font-family: var(--fb,'Exo 2',sans-serif);
    font-weight: 600;
    cursor: pointer;
    transition: all .2s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .tab-pill:hover { border-color: rgba(100,181,246,.5); color: #fff; }
  .tab-pill.tab-active {
    background: rgba(100,181,246,.15);
    border-color: rgba(100,181,246,.55);
    color: #64B5F6;
    box-shadow: 0 0 12px rgba(100,181,246,.18);
  }
  .theme-light .tab-pill { color: rgba(0,0,0,0.55); border-color: rgba(10,30,100,0.2); }
  .theme-light .tab-pill:hover { color: #000; border-color: rgba(10,30,100,0.4); background: rgba(10,30,100,0.05); }
  .theme-light .tab-pill.tab-active { color: #1a50b5; background: rgba(42,109,217,0.1); border-color: rgba(42,109,217,0.4); box-shadow: none; }

  /* ── Add button ── */
  .add-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 16px;
    border-radius: 20px;
    border: none;
    color: #fff;
    font-size: .78rem;
    font-family: var(--fb,'Exo 2',sans-serif);
    font-weight: 700;
    cursor: pointer;
    transition: opacity .2s, transform .15s;
    flex-shrink: 0;
    white-space: nowrap;
  }
  .add-btn:hover { opacity: .88; transform: translateY(-1px); }

  /* ── Table section header ── */
  .tbl-hdr {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 8px 20px;
    box-sizing: border-box;
    width: 100%;
  }
  .tbl-title {
    font-size: .78rem;
    font-weight: 700;
    color: rgba(200,220,255,.5);
    text-transform: uppercase;
    letter-spacing: .06em;
    font-family: var(--fh,'Orbitron',sans-serif);
  }
  .theme-light .tbl-title { color: #000; }
  .tbl-badge {
    font-size: .7rem;
    font-weight: 700;
    padding: 2px 10px;
    border-radius: 20px;
    border: 1px solid rgba(100,181,246,.22);
    color: #64B5F6;
    background: rgba(100,181,246,.1);
    font-family: var(--fh,'Orbitron',sans-serif);
  }
  .theme-light .tbl-badge { color: #1a50b5; background: rgba(42,109,217,0.1); border-color: rgba(42,109,217,0.25); }

  /* ── Table ── */
  .tbl-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    width: 100%;
    box-sizing: border-box;
  }
  .tbl-wrap::-webkit-scrollbar { height: 5px; }
  .tbl-wrap::-webkit-scrollbar-track { background: rgba(100,181,246,.05); border-radius: 4px; }
  .tbl-wrap::-webkit-scrollbar-thumb { background: rgba(100,181,246,.3); border-radius: 4px; }
  .tbl-wrap::-webkit-scrollbar-thumb:hover { background: rgba(100,181,246,.55); }

  .fd-tbl {
    width: 100%;
    min-width: 560px;
    border-collapse: collapse;
    font-size: .8rem;
    table-layout: auto;
  }
  .fd-tbl thead tr { border-bottom: 1px solid rgba(100,181,246,.15); }
  .theme-light .fd-tbl thead tr { border-bottom-color: rgba(10,30,100,0.2); }
  .fd-tbl th {
    padding: 9px 14px;
    text-align: left;
    font-size: .68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .07em;
    color: rgba(100,181,246,.65);
    font-family: var(--fh,'Orbitron',sans-serif);
    white-space: nowrap;
  }
  .theme-light .fd-tbl th { color: rgba(0,0,0,0.55); }
  .fd-tbl td {
    padding: 9px 14px;
    border-bottom: 1px solid rgba(100,181,246,.07);
    color: rgba(200,220,255,.85);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }
  .theme-light .fd-tbl td { color: #1e293b; border-bottom-color: rgba(10,30,100,0.1); }
  .fd-tbl tbody tr { transition: background .15s; }
  .fd-tbl tbody tr:hover { background: rgba(100,181,246,.06); }
  .theme-light .fd-tbl tbody tr:hover { background: rgba(10,30,100,0.05); }
  .fd-num { color: rgba(100,181,246,.4) !important; font-size: .72rem !important; width: 42px; }
  .theme-light .fd-num { color: rgba(0,0,0,0.35) !important; }
  .fd-empty {
    text-align: center;
    padding: 32px 20px !important;
    color: rgba(200,220,255,.3);
    font-size: .82rem;
  }
  .theme-light .fd-empty { color: rgba(0,0,0,0.38); }

  /* ── Spinner ── */
  .fd-spin { display: flex; justify-content: center; padding: 40px; }
  .spinner {
    width: 32px; height: 32px;
    border: 3px solid rgba(100,181,246,.15);
    border-top-color: #64B5F6;
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  .theme-light .spinner { border-color: rgba(42,109,217,0.15); border-top-color: #2a6dd9; }

  /* ── Action buttons ── */
  .act-cell { display: flex; align-items: center; justify-content: center; gap: 5px; }
  .ab {
    display: inline-flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; border-radius: 7px; border: none;
    cursor: pointer; transition: all .15s;
  }
  .ab-edit  { background: rgba(100,181,246,.12); color: #64B5F6; }
  .ab-edit:hover  { background: rgba(100,181,246,.28); }
  .ab-del   { background: rgba(239,68,68,.1);   color: #EF4444; }
  .ab-del:hover   { background: rgba(239,68,68,.25); }
  .ab-promo { background: rgba(52,211,153,.1);  color: #34D399; }
  .ab-promo:hover { background: rgba(52,211,153,.25); }
  .theme-light .ab-edit  { background: rgba(42,109,217,0.1); color: #1a50b5; }
  .theme-light .ab-edit:hover  { background: rgba(42,109,217,0.22); }
  .theme-light .ab-del   { background: rgba(180,50,50,0.1); color: #9a2020; }
  .theme-light .ab-del:hover   { background: rgba(180,50,50,0.22); }
  .theme-light .ab-promo { background: rgba(15,120,85,0.1); color: #0a7a56; }
  .theme-light .ab-promo:hover { background: rgba(15,120,85,0.22); }

  /* ════════════════════════════════════════
     DIALOG OVERLAY — fixed, full-viewport
  ════════════════════════════════════════ */
  .dlg-ov {
    position: fixed;
    inset: 0;
    background: rgba(2,6,30,.65);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 16px;
    box-sizing: border-box;
    overflow-y: auto;
  }
  .theme-light .dlg-ov {
    background: rgba(0,20,80,0.35);
  }

  /* ── Dialog box ── */
  .dlg-box {
    background: rgba(8,14,50,.96);
    border: 1px solid rgba(100,181,246,.25);
    border-radius: 18px;
    box-shadow: 0 24px 60px rgba(0,8,40,.7), 0 0 0 1px rgba(100,181,246,.1);
    width: 100%;
    max-width: min(460px, calc(100vw - 32px));
    max-height: calc(100vh - 32px);
    overflow-y: auto;
    animation: dlgIn .22s ease;
    box-sizing: border-box;
    flex-shrink: 0;
  }
  .dlg-box::-webkit-scrollbar { width: 4px; }
  .dlg-box::-webkit-scrollbar-thumb { background: rgba(100,181,246,.25); border-radius: 4px; }

  /* Light theme dialog box */
  .theme-light .dlg-box {
    background: rgba(255,255,255,0.97) !important;
    border: 1px solid rgba(10,30,100,0.22) !important;
    box-shadow: 0 24px 60px rgba(10,30,100,0.2), 0 0 0 1px rgba(42,109,217,0.08) !important;
  }

  /* ── Dialog header ── */
  .dlg-hdr {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 20px 14px;
    border-bottom: 1px solid rgba(100,181,246,.12);
    background: rgba(100,181,246,.05);
    border-radius: 18px 18px 0 0;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .theme-light .dlg-hdr {
    background: rgba(135,206,250,0.2) !important;
    border-bottom-color: rgba(10,30,100,0.12) !important;
  }
  .dlg-bar { width: 4px; height: 28px; border-radius: 4px; flex-shrink: 0; }
  .dlg-ttl {
    font-size: .92rem;
    font-weight: 700;
    color: rgba(220,235,255,.95);
    font-family: var(--fh,'Orbitron',sans-serif);
    letter-spacing: .03em;
  }
  .theme-light .dlg-ttl { color: #111827 !important; }
  .dlg-sub {
    font-size: .72rem;
    color: rgba(160,190,255,.5);
    margin-top: 2px;
  }
  .theme-light .dlg-sub { color: rgba(0,0,0,0.5) !important; }

  /* ── Dialog body ── */
  .dlg-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ── Dialog footer ── */
  .dlg-foot {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 14px 20px;
    border-top: 1px solid rgba(100,181,246,.1);
    background: rgba(100,181,246,.02);
    border-radius: 0 0 18px 18px;
    position: sticky;
    bottom: 0;
    z-index: 1;
  }
  .theme-light .dlg-foot {
    border-top-color: rgba(10,30,100,0.12) !important;
    background: rgba(135,206,250,0.08) !important;
  }

  /* ── Form fields ── */
  .fld { display: flex; flex-direction: column; gap: 5px; }
  .fld-lbl {
    font-size: .7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: rgba(160,190,255,.55);
    font-family: var(--fh,'Orbitron',sans-serif);
  }
  .theme-light .fld-lbl { color: rgba(0,0,0,0.6) !important; }
  .fld-inp {
    padding: 9px 12px;
    border-radius: 9px;
    border: 1px solid rgba(100,181,246,.22);
    background: rgba(10,18,60,.6);
    color: rgba(220,235,255,.92);
    font-size: .84rem;
    font-family: var(--fb,'Exo 2',sans-serif);
    outline: none;
    transition: border-color .18s, box-shadow .18s;
    width: 100%;
    box-sizing: border-box;
  }
  .fld-inp:focus {
    border-color: rgba(100,181,246,.6);
    box-shadow: 0 0 0 3px rgba(100,181,246,.12);
  }
  .fld-inp.fld-hi {
    border-color: rgba(245,158,11,.4);
    background: rgba(245,158,11,.05);
  }
  .fld-inp.fld-hi:focus {
    border-color: rgba(245,158,11,.7);
    box-shadow: 0 0 0 3px rgba(245,158,11,.12);
  }
  .fld-inp option { background: #0d1640; color: #fff; }
  .fld-note { font-size: .68rem; font-weight: 600; margin-top: 2px; padding-left: 2px; }

  /* Light theme field inputs */
  .theme-light .fld-inp {
    background: rgba(255,255,255,0.85) !important;
    border: 1px solid rgba(10,30,100,0.22) !important;
    color: #111827 !important;
  }
  .theme-light .fld-inp:focus {
    border-color: #2a6dd9 !important;
    box-shadow: 0 0 0 3px rgba(42,109,217,0.12) !important;
  }
  .theme-light .fld-inp.fld-hi {
    border-color: rgba(201,124,8,0.5) !important;
    background: rgba(245,158,11,0.06) !important;
  }
  .theme-light .fld-inp option { background: #fff !important; color: #111827 !important; }

  /* ── Buttons ── */
  .btn-cancel {
    padding: 8px 18px;
    border-radius: 9px;
    border: 1px solid rgba(100,181,246,.2);
    background: transparent;
    color: rgba(200,220,255,.6);
    font-size: .82rem;
    font-family: var(--fb,'Exo 2',sans-serif);
    cursor: pointer;
    transition: all .15s;
  }
  .btn-cancel:hover { border-color: rgba(100,181,246,.4); color: #fff; }
  .btn-cancel:disabled { opacity: .4; cursor: not-allowed; }
  .theme-light .btn-cancel {
    border-color: rgba(10,30,100,0.22) !important;
    color: rgba(0,0,0,0.6) !important;
  }
  .theme-light .btn-cancel:hover { border-color: rgba(10,30,100,0.45) !important; color: #000 !important; }

  .btn-ok {
    padding: 8px 22px;
    border-radius: 9px;
    border: none;
    color: #fff;
    font-size: .82rem;
    font-family: var(--fb,'Exo 2',sans-serif);
    font-weight: 700;
    cursor: pointer;
    transition: opacity .2s, transform .15s;
  }
  .btn-ok:hover { opacity: .88; transform: translateY(-1px); }
  .btn-ok:disabled { opacity: .45; cursor: not-allowed; transform: none; }

  .btn-primary { background: linear-gradient(135deg,#64B5F6,#2979A0); box-shadow: 0 4px 14px rgba(100,181,246,.3); }
  .btn-success { background: linear-gradient(135deg,#34D399,#059669); box-shadow: 0 4px 14px rgba(52,211,153,.3); }
  .btn-danger  { background: linear-gradient(135deg,#EF4444,#b91c1c); box-shadow: 0 4px 14px rgba(239,68,68,.3); }
  .theme-light .btn-primary { background: linear-gradient(135deg,#2a6dd9,#5a3fb5); box-shadow: 0 4px 14px rgba(42,109,217,.35); }
  .theme-light .btn-success { background: linear-gradient(135deg,#0f9e6e,#057a52); box-shadow: 0 4px 14px rgba(15,158,110,.3); }
  .theme-light .btn-danger  { background: linear-gradient(135deg,#d14040,#a82424); box-shadow: 0 4px 14px rgba(180,50,50,.3); }

  /* ── Confirm delete body text ── */
  .dlg-body p { color: rgba(155,180,255,.7); font-size: .84rem; line-height: 1.6; }
  .theme-light .dlg-body p { color: rgba(0,0,0,0.6) !important; }

  /* ── Snackbar ── */
  .snack {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    padding: 10px 22px;
    border-radius: 10px;
    font-size: .82rem;
    font-weight: 600;
    font-family: var(--fb,'Exo 2',sans-serif);
    z-index: 99999;
    box-shadow: 0 4px 20px rgba(0,0,0,.4);
    animation: dlgIn .2s ease;
    white-space: nowrap;
  }
  .snack-success { background: #065f46; color: #6ee7b7; border: 1px solid #34D399; }
  .snack-error   { background: #7f1d1d; color: #fca5a5; border: 1px solid #EF4444; }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .dlg-box {
      max-width: calc(100vw - 24px) !important;
      border-radius: 16px !important;
      margin: auto;
    }
    .dlg-ov { padding: 12px; align-items: center; }
    .dlg-body { padding: 16px; gap: 12px; }
    .dlg-hdr { padding: 14px 16px 12px; }
    .dlg-foot { padding: 12px 16px; }
    .btn-ok, .btn-cancel { padding: 8px 14px; font-size: .78rem; }
  }
  @media (max-width: 480px) {
    .fd-tbl td, .fd-tbl th { font-size: 0.72rem !important; padding: 6px 8px !important; }
    .act-cell { flex-direction: column !important; gap: 3px !important; }
    .tab-pill { font-size: 0.72rem !important; padding: 5px 10px !important; }
    .mod-hdr { padding: 10px 12px; }
    .tbl-hdr { padding: 6px 12px; }
  }
`;

const PORTAL_CSS = `
  @keyframes invDlgIn {
    from { opacity:0; transform: translateY(16px) scale(0.97); }
    to   { opacity:1; transform: none; }
  }

  /* ── Overlay ── */
  .dlg-ov {
    position: fixed !important;
    inset: 0 !important;
    background: rgba(0,0,10,0.55);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    z-index: 99999 !important;
    padding: 16px;
    box-sizing: border-box;
    overflow-y: auto;
    animation: fIn .18s ease;
  }
  @keyframes fIn { from{opacity:0} to{opacity:1} }

  .theme-light.dlg-ov {
    background: rgba(0,20,80,0.35) !important;
  }

  /* ── Dialog box — DARK (default) ── */
  .inv-dlg-box {
    background: rgba(7,9,30,0.85);
    backdrop-filter: blur(44px) saturate(160%);
    border: 1px solid rgba(79,142,247,0.52);
    border-radius: 18px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.09);
    width: 100%;
    max-width: min(460px, calc(100vw - 32px));
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    animation: invDlgIn .32s cubic-bezier(0.34,1.56,0.64,1);
    box-sizing: border-box;
    font-family: 'Inter', sans-serif;
  }
  .inv-dlg-box::-webkit-scrollbar { width: 4px; }
  .inv-dlg-box::-webkit-scrollbar-thumb { background: rgba(79,142,247,0.25); border-radius: 4px; }

  /* ── Dialog box — LIGHT ── */
  .theme-light .inv-dlg-box {
    background: rgba(255,255,255,0.82) !important;
    backdrop-filter: blur(40px) saturate(180%) !important;
    border: 1px solid rgba(10,30,100,0.2) !important;
    box-shadow: 0 8px 40px rgba(10,30,100,0.15) !important;
  }

  /* ── Header — DARK ── */
  .inv-dlg-hdr {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px 12px;
    border-bottom: 1px solid rgba(79,142,247,0.18);
    background: transparent;
    border-radius: 18px 18px 0 0;
  }
  /* ── Header — LIGHT ── */
  .theme-light .inv-dlg-hdr {
    border-bottom: 1px solid rgba(10,30,100,0.12) !important;
    background: rgba(135,206,250,0.15) !important;
  }

  .dlg-bar { width: 4px; height: 22px; border-radius: 2px; flex-shrink: 0; }

  /* ── Title — DARK ── */
  .inv-dlg-ttl {
    font-weight: 800;
    font-size: .95rem;
    color: #fff;
    letter-spacing: .01em;
  }
  /* ── Title — LIGHT ── */
  .theme-light .inv-dlg-ttl { color: #111827 !important; }

  .inv-dlg-sub { font-size: .67px; color: rgba(180,210,255,0.55); margin-top: 2px; }
  .theme-light .inv-dlg-sub { color: rgba(0,0,0,0.5) !important; }

  /* ── Body — DARK ── */
  .inv-dlg-body {
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: 55vh;
    overflow-y: auto;
    background: transparent;
  }

  /* ── Fields inside portal — DARK ── */
  .inv-dlg-body .fld { display: flex; flex-direction: column; gap: 6px; }
  .inv-dlg-body .fld-lbl {
    font-size: .67rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: rgba(180,210,255,0.75);
    font-family: 'Inter', sans-serif;
  }
  .theme-light .inv-dlg-body .fld-lbl { color: rgba(0,0,0,0.65) !important; }

  .inv-dlg-body .fld-inp {
    width: 100%;
    padding: 9px 12px;
    border-radius: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(79,142,247,0.3);
    color: #fff;
    font-size: .84rem;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    box-sizing: border-box;
  }
  .inv-dlg-body .fld-inp:focus {
    border-color: #4F8EF7;
    box-shadow: 0 0 0 3px rgba(79,142,247,0.16);
  }
  .inv-dlg-body .fld-inp option { background: #0c1638; color: #fff; }

  /* ── Fields — LIGHT ── */
  .theme-light .inv-dlg-body .fld-inp {
    background: rgba(255,255,255,0.7) !important;
    border: 1px solid rgba(10,30,100,0.2) !important;
    color: #111827 !important;
  }
  .theme-light .inv-dlg-body .fld-inp:focus {
    border-color: #2a6dd9 !important;
    box-shadow: 0 0 0 3px rgba(42,109,217,0.12) !important;
  }
  .theme-light .inv-dlg-body .fld-inp option { background: #fff !important; color: #111827 !important; }

  /* ── Highlight field ── */
  .inv-dlg-body .fld-inp.fld-hi { border-color: #f59e0b !important; }
  .inv-dlg-body .fld-inp.fld-hi:focus { box-shadow: 0 0 0 3px rgba(245,158,11,0.12) !important; }

  /* ── Confirm text ── */
  .inv-dlg-p { color: white; font-size: .84rem; line-height: 1.6; margin: 0; }
  .theme-light .inv-dlg-p { color: #000 !important; }

  /* ── Footer — DARK ── */
  .inv-dlg-foot {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 20px;
    border-top: 1px solid rgba(79,142,247,0.15);
    background: transparent;
    border-radius: 0 0 18px 18px;
  }
  /* ── Footer — LIGHT ── */
  .theme-light .inv-dlg-foot {
    border-top: 1px solid rgba(10,30,100,0.12) !important;
    background: transparent !important;
  }

  /* ── Cancel button — DARK ── */
  .inv-btn-cancel {
    padding: 8px 14px;
    border-radius: 10px;
    border: 1px solid rgba(79,142,247,0.25);
    background: none;
    color: rgba(180,210,255,0.7);
    font-size: .8rem;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    cursor: pointer;
    transition: all .2s;
  }
  .inv-btn-cancel:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
  .inv-btn-cancel:disabled { opacity: .4; cursor: not-allowed; }

  /* ── Cancel — LIGHT ── */
  .theme-light .inv-btn-cancel {
    border: 1px solid rgba(10,30,100,0.2) !important;
    color: rgba(0,0,0,0.65) !important;
  }
  .theme-light .inv-btn-cancel:hover { border-color: rgba(10,30,100,0.4) !important; color: #000 !important; }

  /* ── OK buttons ── */
  .inv-btn-ok {
    padding: 8px 16px;
    border-radius: 10px;
    border: none;
    color: #fff;
    font-size: .8rem;
    font-family: 'Inter', sans-serif;
    font-weight: 700;
    cursor: pointer;
    transition: all .25s cubic-bezier(0.34,1.56,0.64,1);
  }
  .inv-btn-ok:hover { transform: translateY(-1px); filter: brightness(1.12); }
  .inv-btn-ok:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  .inv-btn-primary { background: linear-gradient(135deg,#4F8EF7,#7B5FFF); box-shadow: 0 4px 16px rgba(79,142,247,0.35); }
  .inv-btn-success { background: linear-gradient(135deg,#34D399,#059669); box-shadow: 0 4px 16px rgba(52,211,153,0.3); }
  .inv-btn-danger  { background: linear-gradient(135deg,#EF4444,#DC2626); box-shadow: 0 4px 16px rgba(239,68,68,0.3); }

  /* ── Responsive ── */
  @media (max-width: 520px) {
    .inv-dlg-box { max-width: calc(100vw - 24px) !important; border-radius: 18px 18px 0 0 !important; }
    .dlg-ov { align-items: flex-end !important; padding: 0 !important; }
    .inv-dlg-hdr { padding: 14px 16px 12px; }
    .inv-dlg-body { padding: 16px; gap: 11px; }
    .inv-dlg-foot { padding: 12px 16px; }
    .inv-btn-ok, .inv-btn-cancel { padding: 8px 14px; font-size: .78rem; }
  }
`;