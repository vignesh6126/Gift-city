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
  { key: "amc_name",             label: "AMC Name",              type: "text"   },
  { key: "scheme",               label: "Scheme",                type: "text"   },
  { key: "bank",                 label: "Bank",                  type: "select", options: ["gift", "savings", "both"] },
  { key: "submission_date",      label: "Submission Date",       type: "date"   },
  { key: "next_action_date",     label: "Next Action Date",      type: "date"   },  // ← ADD
  { key: "status",               label: "Status",                type: "text"   },
];

const SHARE_AUTO_KEYS   = new Set(["client_name", "next_action_date"]);          // ← add next_action_date
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
  next_action_date:     toISODate(row.next_action_date) || "",   // ← wrap with toISODate
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
      next_action_date: toISODate(form.next_action_date) || null,
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
      const payload = {
        ...shareForm,
        next_action_date: toISODate(shareForm.next_action_date) || null,  // ← normalize before send
      };
      const postRes = await fetch(`${API}/invested/pending`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),   // ← use payload, not shareForm
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
  @keyframes srIn  { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:none} }
  @keyframes dlgIn { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:none} }
  @keyframes spin  { to{transform:rotate(360deg)} }

  .mod-wrap input::placeholder { color: rgba(160,190,255,0.35); }
  .mod-wrap.theme-light input::placeholder { color: rgba(0,0,0,0.3); }

  /* ── Overlay ── */
  .dlg-ov {
    position:fixed; inset:0;
    background:rgba(0,0,10,0.65);
    backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
    display:flex; align-items:center; justify-content:center;
    z-index:99999; padding:16px; box-sizing:border-box;
    overflow-y:auto; animation:dlgIn .2s ease;
  }
  .theme-light .dlg-ov { background:rgba(10,20,80,0.28); }

  /* ── Dialog box ── */
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

  /* ── Dialog header ── */
  .dlg-hdr {
    display:flex; align-items:center; gap:12px;
    padding:16px 20px 12px;
    border-bottom:1px solid rgba(79,142,247,0.18);
    background:rgba(79,142,247,0.04);
    border-radius:18px 18px 0 0;
  }
  .theme-light .dlg-hdr {
    border-bottom-color:rgba(42,109,217,0.15);
    background:rgba(42,109,217,0.06);
  }
  .dlg-bar { width:4px; height:22px; border-radius:2px; flex-shrink:0; }
  .dlg-ttl { font-weight:800; font-size:.95rem; color:#fff; letter-spacing:.01em; font-family:'Inter',sans-serif; }
  .theme-light .dlg-ttl { color:#111827; }
  .dlg-sub { font-size:.72rem; color:rgba(180,210,255,0.55); margin-top:3px; font-family:'Inter',sans-serif; }
  .theme-light .dlg-sub { color:rgba(0,0,0,0.5); }

  /* ── Dialog body ── */
  .dlg-body {
    padding:16px 20px; display:flex; flex-direction:column; gap:12px;
    max-height:58vh; overflow-y:auto;
  }
  .dlg-body::-webkit-scrollbar { width:4px; }
  .dlg-body::-webkit-scrollbar-thumb { background:rgba(79,142,247,0.2); border-radius:4px; }

  /* ── Form fields inside dialog ── */
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
  .theme-light .dlg-body .fld-inp {
    background:rgba(255,255,255,0.85); border:1px solid rgba(42,109,217,0.22); color:#111827;
  }
  .theme-light .dlg-body .fld-inp:focus { border-color:#2a6dd9; box-shadow:0 0 0 3px rgba(42,109,217,0.12); }
  .theme-light .dlg-body .fld-inp option { background:#fff; color:#111827; }
  .dlg-body .fld-note { font-size:.68rem; font-weight:600; margin-top:2px; padding-left:2px; }

  /* ── Dialog footer ── */
  .dlg-foot {
    display:flex; justify-content:flex-end; gap:8px;
    padding:12px 20px;
    border-top:1px solid rgba(79,142,247,0.15);
    background:rgba(79,142,247,0.02);
    border-radius:0 0 18px 18px;
  }
  .theme-light .dlg-foot {
    border-top-color:rgba(42,109,217,0.14);
    background:rgba(42,109,217,0.03);
  }

  /* ── Buttons ── */
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

  /* ── Snackbar ── */
  .snack {
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%);
    padding:10px 22px; border-radius:10px; font-size:.82rem; font-weight:600;
    font-family:'Inter',sans-serif; z-index:99999;
    box-shadow:0 4px 20px rgba(0,0,0,.4); animation:dlgIn .2s ease; white-space:nowrap;
  }
  .snack-success { background:#065f46; color:#6ee7b7; border:1px solid #34D399; }
  .snack-error   { background:#7f1d1d; color:#fca5a5; border:1px solid #EF4444; }

  /* ── Responsive ── */
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
  </div>,
  document.body
)}

      {snack && createPortal(<Snack {...snack} onClose={() => setSnack(null)} />, document.body)}
    </div>
  );
}