import React, { useState, useEffect, useCallback, useRef } from "react";

const API = import.meta.env.VITE_API_URL;

const COLS = [
  { key: "client_name",     label: "Client Name",    type: "text"   },
  { key: "esops_rsu",       label: "ESOPS/RSU",       type: "select", options: ["yes", "no"] },
  { key: "discussion_date", label: "Discussion Date", type: "date"   },
  { key: "next_action",     label: "Next Action",     type: "text"   },
];

const PENDING_COLS = [
  { key: "client_name",          label: "Client Name",           type: "text"   },
  { key: "amount_tobe_invested", label: "Amount to be Invested", type: "number" },
  { key: "amc_name",             label: "AMC Name",              type: "text"   },
  { key: "scheme",               label: "Scheme",                type: "text"   },
  { key: "bank",                 label: "Bank",                  type: "select", options: ["gift", "savings", "both"] },
  { key: "submission_date",      label: "Submission Date",       type: "date"   },
  { key: "status",               label: "Status",                type: "text"   },
];

const SHARE_AUTO_KEYS   = new Set(["client_name"]);
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
  const [shareSourceId, setShareSourceId] = useState(null); // tracks which interested row to delete

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

  /* ─── Add / Edit ─── */
  const openAdd  = () => { setEditRow(null); setForm(emptyRow()); setDlg(true); };
  const openEdit = (row) => { setEditRow(row); setForm({ ...row }); setDlg(true); };
  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    if (!form.client_name?.trim()) {
      showSnack("Client name is required", "error");
      return;
    }
    const payload = {
      ...form,
      client_name:     form.client_name?.trim() || "",
      esops_rsu:       form.esops_rsu || "no",
      discussion_date: toISODate(form.discussion_date) || null,
      next_action:     form.next_action?.trim() || "",
    };
    const url    = editRow ? `${API}/interested/${editRow.id}` : `${API}/interested`;
    const method = editRow ? "PUT" : "POST";
    setSaving(true);
    try {
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
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

  /* ─── Delete ─── */
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

  /* ─── Share → Customers Pending ─── */
  const openShare = (row) => {
    setShareSourceId(row.id);                // store the id separately — not in the form payload
    setShareForm(interestedToPending(row));
    setShareOpen(true);
  };
  const setShareFld = (k, v) => setShareForm(p => ({ ...p, [k]: v }));

  const saveShare = async () => {
    setShareSaving(true);
    try {
      // 1. Add to Customers Pending
      const postRes = await fetch(`${API}/invested/pending`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shareForm),
      });
      if (!postRes.ok) throw new Error(`Failed to add to Pending (HTTP ${postRes.status})`);

      // 2. Delete the source Interested record
      const delRes = await fetch(`${API}/interested/${shareSourceId}`, { method: "DELETE" });
      if (!delRes.ok) throw new Error(`Failed to remove from Interested (HTTP ${delRes.status})`);

      showSnack("✓ Sent to Customers Pending!");
      setShareOpen(false);
      load();
      onDataChange?.();
    } catch (e) {
      showSnack(e.message || "Failed", "error");
    } finally {
      setShareSaving(false);
    }
  };

  return (
    <div className={`mod-wrap${theme === "light" ? " theme-light" : ""}`}>
      <style>{`
        @keyframes srIn { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:none} }
        .mod-wrap input::placeholder { color: rgba(160,190,255,0.35); }
        .mod-wrap.theme-light input::placeholder { color: rgba(0,0,0,0.3); }
      `}</style>

      {/* ── Top bar ── */}
      <div className="mod-hdr">
        <span className="tbl-title" style={{ fontSize: ".9rem" }}>
          Prospects
          {!loading && (
            <span className="tbl-badge" style={{ marginLeft: 8, color: ORANGE, background: "rgba(230,126,34,.1)", borderColor: "rgba(230,126,34,.22)" }}>
              {search.trim()
                ? <>{filteredRows.length} <span style={{ opacity: .55 }}>/ {rows.length}</span></>
                : <>{rows.length} records</>
              }
            </span>
          )}
        </span>
        <button
          className="add-btn"
          style={{ background: `linear-gradient(135deg,${ORANGE},#ca6f1e)`, boxShadow: "0 4px 14px rgba(230,126,34,.3)" }}
          onClick={openAdd}
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

      {/* ── Table header ── */}
      <div className="tbl-hdr">
        <span className="tbl-title">All Prospects</span>
      </div>

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
                      <button
                        className="ab"
                        title="Send to Customers Pending"
                        style={{ color: "#34D399" }}
                        onClick={() => openShare(row)}
                      >
                        <IcoShare />
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

      {/* ── Add / Edit Dialog ── */}
      {dlg && (
        <div className="dlg-ov" onClick={e => e.target === e.currentTarget && setDlg(false)}>
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
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {confirm && (
        <div className="dlg-ov" onClick={e => e.target === e.currentTarget && setConfirm(false)}>
          <div className="dlg-box" style={{ maxWidth: 370 }}>
            <div className="dlg-hdr">
              <div className="dlg-bar" style={{ background: "#EF4444" }} />
              <div className="dlg-ttl">Confirm Delete</div>
            </div>
            <div className="dlg-body">
              <p style={{ color: "#000", fontSize: ".84rem", lineHeight: 1.6 }}>Are you sure? This cannot be undone.</p>
            </div>
            <div className="dlg-foot">
              <button className="btn-cancel" onClick={() => setConfirm(false)}>Cancel</button>
              <button className="btn-ok btn-danger" onClick={del}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Share → Customers Pending Dialog ── */}
      {shareOpen && (
        <div className="dlg-ov" onClick={e => e.target === e.currentTarget && setShareOpen(false)}>
          <div className="dlg-box">
            <div className="dlg-hdr">
              <div className="dlg-bar" style={{ background: "#34D399" }} />
              <div>
                <div className="dlg-ttl">Send to Customers Pending</div>
                <div className="dlg-sub">Green fields are auto-filled · Orange fields need manual entry</div>
              </div>
            </div>
            <div className="dlg-body">
              {PENDING_COLS.map(c => (
                <div key={c.key}>
                  <Field col={c} value={shareForm[c.key]} onChange={setShareFld} />
                  {SHARE_AUTO_KEYS.has(c.key) && (
                    <div className="fld-note" style={{ color: "#34D399" }}>✓ Auto-filled from prospect</div>
                  )}
                  {SHARE_MANUAL_KEYS.has(c.key) && (
                    <div className="fld-note" style={{ color: "#f59e0b" }}>⚠ Fill manually</div>
                  )}
                </div>
              ))}
            </div>
            <div className="dlg-foot">
              <button className="btn-cancel" onClick={() => setShareOpen(false)} disabled={shareSaving}>
                Cancel
              </button>
              <button className="btn-ok btn-success" onClick={saveShare} disabled={shareSaving}>
                {shareSaving ? "Saving…" : "Save & Send to Pending"}
              </button>
            </div>
          </div>
        </div>
      )}

      {snack && <Snack {...snack} onClose={() => setSnack(null)} />}
    </div>
  );
}