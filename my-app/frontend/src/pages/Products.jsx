import React, { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL;

/* ─── DB columns exactly as in `desc products` ─── */
const COLS = [
  { key: "product_name",       label: "Product Name",       type: "text"   },
  { key: "min_investment",     label: "Min Investment",     type: "text"   },
  { key: "onboarding_process", label: "Onboarding Process", type: "select", options: ["offline", "online"] },
  { key: "structure",          label: "Structure",          type: "select", options: ["outbound/cat-III", "inbound/cat-III", "outbound/retail", "inbound/retail"] },
  { key: "lock_in",            label: "Lock In",            type: "text"   },
  { key: "amc_name",           label: "AMC Name",           type: "text"   },
];

const emptyRow = () => ({
  product_name:       "",
  min_investment:     "",
  onboarding_process: "offline",
  structure:          "outbound/cat-III",
  lock_in:            "",
  amc_name:           "",
});

/* ─── Icons ─── */
const IcoEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoDel = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IcoPlus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

/* ─── Dialog field ─── */
function Field({ col, value, onChange }) {
  if (col.type === "select") return (
    <div className="fld">
      <label className="fld-lbl">{col.label}</label>
      <select className="fld-inp" value={value || ""} onChange={e => onChange(col.key, e.target.value)}>
        <option value="">Select…</option>
        {col.options.map(o => (
          <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
        ))}
      </select>
    </div>
  );
  return (
    <div className="fld">
      <label className="fld-lbl">{col.label}</label>
      <input
        className="fld-inp"
        type="text"
        value={value || ""}
        onChange={e => onChange(col.key, e.target.value)}
      />
    </div>
  );
}

/* ─── Snackbar ─── */
function Snack({ msg, severity, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []);
  return <div className={`snack snack-${severity}`}>{msg}</div>;
}

/* ─── Onboarding chip colors ─── */
const onboardingChip = (val) => {
  if (val === "online")  return <span className="chip chip-yes">Online</span>;
  if (val === "offline") return <span className="chip chip-no">Offline</span>;
  return <span>—</span>;
};

/* ─── Structure chip ─── */
const structureChip = (val) => {
  const colorMap = {
    "outbound/cat-III": { bg: "rgba(79,142,247,0.13)",  color: "#4F8EF7", border: "rgba(79,142,247,0.28)"  },
    "inbound/cat-III":  { bg: "rgba(167,139,250,0.13)", color: "#a78bfa", border: "rgba(167,139,250,0.28)" },
    "outbound/retail":  { bg: "rgba(245,158,11,0.13)",  color: "#f59e0b", border: "rgba(245,158,11,0.28)"  },
    "inbound/retail":   { bg: "rgba(52,211,153,0.13)",  color: "#34d399", border: "rgba(52,211,153,0.28)"  },
  };
  const s = colorMap[val] || { bg: "rgba(255,255,255,0.07)", color: "#fff", border: "rgba(255,255,255,0.15)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 20,
      fontSize: ".71rem", fontWeight: 700,
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
    }}>
      {val ?? "—"}
    </span>
  );
};

/* ─── Main component ─── */
export default function Products({ inline = false, onDataChange }) {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [dlg,     setDlg]     = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form,    setForm]    = useState({});
  const [delId,   setDelId]   = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [snack,   setSnack]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/products`);
      setRows((await r.json()) ?? []);
    } catch {
      showSnack("Failed to load", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const showSnack = (msg, severity = "success") => setSnack({ msg, severity });
  const openAdd   = () => { setEditRow(null); setForm(emptyRow()); setDlg(true); };
  const openEdit  = (row) => { setEditRow(row); setForm({ ...row }); setDlg(true); };
  const setField  = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    const url    = editRow ? `${API}/products/${editRow.id}` : `${API}/products`;
    const method = editRow ? "PUT" : "POST";
    try {
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) throw 0;
      showSnack(editRow ? "Updated!" : "Added!");
      setDlg(false);
      load();
      onDataChange?.();
    } catch {
      showSnack("Save failed", "error");
    }
  };

  const del = async () => {
    try {
      const r = await fetch(`${API}/products/${delId}`, { method: "DELETE" });
      if (!r.ok) throw 0;
      showSnack("Deleted");
      setConfirm(false);
      load();
      onDataChange?.();
    } catch {
      showSnack("Delete failed", "error");
    }
  };

  return (
    <div className="mod-wrap">

      {/* ── Header ── */}
      <div className="mod-hdr">
        <span className="tbl-title" style={{ fontSize: "1rem" }}>Products</span>
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

      {/* ── Table header with count ── */}
      <div className="tbl-hdr">
        <span className="tbl-title">All Products</span>
        {!loading && <span className="tbl-badge">{rows.length} records</span>}
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
                {COLS.map(c => <th key={c.key}>{c.label}</th>)}
                <th style={{ textAlign: "center", width: 90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="fd-empty" colSpan={COLS.length + 2}>
                    No products yet. Click "Add Product" to get started.
                  </td>
                </tr>
              ) : rows.map((row, i) => (
                <tr key={row.id}>
                  <td className="fd-num">{i + 1}</td>

                  {/* product_name */}
                  <td>{row.product_name ?? "—"}</td>

                  {/* min_investment */}
                  <td style={{ fontFamily: "monospace" }}>
                    {row.min_investment != null ? `₹${Number(row.min_investment).toLocaleString("en-IN")}` : "—"}
                  </td>

                  {/* onboarding_process — chip */}
                  <td>{onboardingChip(row.onboarding_process)}</td>

                  {/* structure — colored chip */}
                  <td>{structureChip(row.structure)}</td>

                  {/* lock_in */}
                  <td>{row.lock_in ?? "—"}</td>

                  {/* amc_name */}
                  <td>{row.amc_name ?? "—"}</td>

                  {/* Actions */}
                  <td>
                    <div className="act-cell">
                      <button className="ab ab-edit" title="Edit"   onClick={() => openEdit(row)}><IcoEdit /></button>
                      <button className="ab ab-del"  title="Delete" onClick={() => { setDelId(row.id); setConfirm(true); }}><IcoDel /></button>
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
              <div className="dlg-bar" style={{ background: "#34D399" }} />
              <div>
                <div className="dlg-ttl">{editRow ? "Edit Product" : "Add Product"}</div>
                <div className="dlg-sub">Fill in the product details below</div>
              </div>
            </div>
            <div className="dlg-body">
              {COLS.map(c => (
                <Field key={c.key} col={c} value={form[c.key]} onChange={setField} />
              ))}
            </div>
            <div className="dlg-foot">
              <button className="btn-cancel" onClick={() => setDlg(false)}>Cancel</button>
              <button className="btn-ok btn-success" onClick={save}>
                {editRow ? "Update" : "Save"}
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
              <div>
                <div className="dlg-ttl">Confirm Delete</div>
                <div className="dlg-sub">This action cannot be undone</div>
              </div>
            </div>
            <div className="dlg-body">
              <p style={{ color: "rgba(155,180,255,.7)", fontSize: ".84rem", lineHeight: 1.6 }}>
                Are you sure you want to delete this product record?
              </p>
            </div>
            <div className="dlg-foot">
              <button className="btn-cancel" onClick={() => setConfirm(false)}>Cancel</button>
              <button className="btn-ok btn-danger" onClick={del}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {snack && <Snack {...snack} onClose={() => setSnack(null)} />}
    </div>
  );
}