import React, { useState, useEffect, useCallback, useRef } from "react";

const API = import.meta.env.VITE_API_URL;

const COLS = [
  { key: "amc_name", label: "AMC Name", type: "text" },
  { key: "product_name", label: "Product Name", type: "text" },
  { key: "min_investment", label: "Min Investment", type: "text" },
  { key: "onboarding_process", label: "Onboarding Process", type: "select", options: ["offline", "online"] },
  { key: "structure", label: "Structure", type: "select", options: [] },
  { key: "lock_in", label: "Lock In", type: "text" },
];

const STRUCTURE_OPTIONS = {
  cat3: ["outbound/cat-III", "inbound/cat-III"],
  retail: ["outbound/retail", "inbound/retail"],
};

const emptyRow = (tab) => ({
  amc_name: "",
  product_name: "",
  min_investment: "",
  onboarding_process: "offline",
  structure: STRUCTURE_OPTIONS[tab][0],
  lock_in: "",
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
  { id: "cat3", label: "Cat-III", match: (s) => s?.includes("cat-III") },
  { id: "retail", label: "Retail", match: (s) => s?.includes("retail") },
];

const IcoEdit = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const IcoDel = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
const IcoPlus = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>;
const IcoSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
const IcoClear = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>;

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

function SearchBar({ value, onChange, tabLabel, resultCount, totalCount, theme = "dark" }) {
  const inputRef = useRef(null);
  const isActive = value.length > 0;

  const accentSolid = theme === "light" ? "#0f9e6e" : "#34D399";
  const accent = theme === "light" ? "rgba(15,158,110,0.8)" : "rgba(52,211,153,0.7)";
  const borderIdle = theme === "light" ? "rgba(0,0,0,0.2)" : "rgba(52,211,153,0.22)";
  const borderActive = theme === "light" ? "rgba(15,158,110,0.6)" : "rgba(52,211,153,0.55)";
  const bgIdle = theme === "light" ? "rgba(255,255,255,0.6)" : "rgba(10,16,60,0.5)";
  const bgActive = theme === "light" ? "rgba(15,158,110,0.07)" : "rgba(52,211,153,0.08)";
  const shadowActive = theme === "light" ? "0 0 0 3px rgba(15,158,110,0.12)" : "0 0 0 3px rgba(52,211,153,0.12)";
  const shadowFocus = theme === "light" ? "0 0 0 3px rgba(15,158,110,0.15)" : "0 0 0 3px rgba(52,211,153,0.15)";
  const clearBg = theme === "light" ? "rgba(15,158,110,0.14)" : "rgba(52,211,153,0.18)";
  const clearBgHov = theme === "light" ? "rgba(15,158,110,0.28)" : "rgba(52,211,153,0.35)";
  const clearColor = theme === "light" ? "rgba(0,0,0,0.55)" : "rgba(180,210,255,0.8)";
  const pillBg = theme === "light" ? "rgba(15,158,110,0.12)" : "rgba(52,211,153,0.12)";
  const pillBorder = theme === "light" ? "rgba(15,158,110,0.28)" : "rgba(52,211,153,0.28)";
  const sectionBg = theme === "light" ? "rgba(0,0,0,0.02)" : "rgba(52,211,153,0.02)";
  const sectionBdr = theme === "light" ? "1px solid rgba(0,0,0,0.1)" : "1px solid rgba(52,211,153,0.12)";

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
            placeholder={`Search AMC or product name in ${tabLabel}…`}
            style={{
              width: "100%", padding: "8px 34px 8px 32px", borderRadius: 10,
              border: `1px solid ${isActive ? borderActive : borderIdle}`,
              background: isActive ? bgActive : bgIdle,
              color: theme === "light" ? "#111827" : "#fff",
              fontSize: ".82rem", fontFamily: "var(--fb,'Inter',sans-serif)",
              outline: "none", transition: "all .22s",
              boxShadow: isActive ? shadowActive : "none",
            }}
            onFocus={e => { e.target.style.borderColor = accent; e.target.style.boxShadow = shadowFocus; }}
            onBlur={e => {
              e.target.style.borderColor = isActive ? borderActive : borderIdle;
              e.target.style.boxShadow = isActive ? shadowActive : "none";
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
            background: resultCount > 0 ? pillBg : "rgba(248,113,113,0.12)",
            border: `1px solid ${resultCount > 0 ? pillBorder : "rgba(248,113,113,0.28)"}`,
            fontSize: ".7rem", fontWeight: 700,
            color: resultCount > 0 ? accentSolid : (theme === "light" ? "#b02020" : "#F87171"),
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

function Field({ col, value, onChange }) {
  if (col.type === "select") return (
    <div className="fld">
      <label className="fld-lbl">{col.label}</label>
      <select className="fld-inp" value={value || ""} onChange={e => onChange(col.key, e.target.value)}>
        <option value="">Select…</option>
        {col.options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
      </select>
    </div>
  );
  return (
    <div className="fld">
      <label className="fld-lbl">{col.label}</label>
      <input className="fld-inp" type="text" value={value || ""} onChange={e => onChange(col.key, e.target.value)} />
    </div>
  );
}

function Snack({ msg, severity, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return <div className={`snack snack-${severity}`}>{msg}</div>;
}

const onboardingChip = (val) => {
  if (val === "online") return <span className="chip chip-yes">Online</span>;
  if (val === "offline") return <span className="chip chip-no">Offline</span>;
  return <span>—</span>;
};

const structureChip = (val) => {
  const colorMap = {
    "outbound/cat-III": { bg: "rgba(79,142,247,0.13)", color: "#4F8EF7", border: "rgba(79,142,247,0.28)" },
    "inbound/cat-III": { bg: "rgba(167,139,250,0.13)", color: "#a78bfa", border: "rgba(167,139,250,0.28)" },
    "outbound/retail": { bg: "rgba(245,158,11,0.13)", color: "#f59e0b", border: "rgba(245,158,11,0.28)" },
    "inbound/retail": { bg: "rgba(52,211,153,0.13)", color: "#34d399", border: "rgba(52,211,153,0.28)" },
  };
  const s = colorMap[val] || { bg: "rgba(255,255,255,0.07)", color: "#fff", border: "rgba(255,255,255,0.15)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: ".71rem", fontWeight: 700, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {val ?? "—"}
    </span>
  );
};

export default function Products({ inline = false, onDataChange, theme = "dark" }) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("cat3");
  const [dlg, setDlg] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState({});
  const [delId, setDelId] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [snack, setSnack] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await fetch(`${API}/products`); setRows((await r.json()) ?? []); }
    catch { showSnack("Failed to load", "error"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setSearch(""); }, [tab]);

  const showSnack = (msg, severity = "success") => setSnack({ msg, severity });
  const openAdd = () => { setEditRow(null); setForm(emptyRow(tab)); setDlg(true); };
  const openEdit = (row) => { setEditRow(row); setForm({ ...row }); setDlg(true); };
  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    const url = editRow ? `${API}/products/${editRow.id}` : `${API}/products`;
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

  const activeTab = TABS.find(t => t.id === tab);
  const tabFiltered = rows.filter(r => activeTab.match(r.structure));
  const cat3Count = rows.filter(r => r.structure?.includes("cat-III")).length;
  const retailCount = rows.filter(r => r.structure?.includes("retail")).length;

  const filteredRows = search.trim()
    ? tabFiltered.filter(r => {
      const q = search.trim().toLowerCase();
      return (
        (r.amc_name || "").toLowerCase().includes(q) ||
        (r.product_name || "").toLowerCase().includes(q)
      );
    })
    : tabFiltered;

  const colsForTab = COLS.map(c =>
    c.key === "structure" ? { ...c, options: STRUCTURE_OPTIONS[tab] } : c
  );

  return (
    <div className={`mod-wrap${theme === "light" ? " theme-light" : ""}`}>
      <style>{PROD_CSS}</style>

      <div className="mod-hdr">
        <div className="tabs-row">
          {TABS.map(t => (
            <button key={t.id} className={`tab-pill ${tab === t.id ? "tab-active" : ""}`} onClick={() => setTab(t.id)}>
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
        <button className="add-btn"
          style={{ background: "linear-gradient(135deg,#34D399,#059669)", boxShadow: "0 4px 14px rgba(52,211,153,.32)" }}
          onClick={openAdd}>
          <IcoPlus /> Add Product
        </button>
      </div>

      <SearchBar
        value={search}
        onChange={setSearch}
        tabLabel={activeTab.label}
        resultCount={filteredRows.length}
        totalCount={tabFiltered.length}
        theme={theme}
      />

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
                  <td><Highlight text={row.amc_name} query={search} theme={theme} /></td>
                  <td><Highlight text={row.product_name} query={search} theme={theme} /></td>
                  <td>
                    <span style={{ color: "#34D399", fontWeight: 700 }}>{fmtAmount(row.min_investment)}</span>
                  </td>
                  <td>{onboardingChip(row.onboarding_process)}</td>
                  <td>{structureChip(row.structure)}</td>
                  <td>{row.lock_in ?? "—"}</td>
                  <td>
                    <div className="act-cell">
                      <button className="ab ab-edit" title="Edit" onClick={() => openEdit(row)}><IcoEdit /></button>
                      <button className="ab ab-del" title="Delete" onClick={() => { setDelId(row.id); setConfirm(true); }}><IcoDel /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dlg && (
        <div className="dlg-ov" onClick={e => e.target === e.currentTarget && setDlg(false)}>
          <div className="dlg-box">
            <div className="dlg-hdr">
              <div className="dlg-bar" style={{ background: "#34D399" }} />
              <div><div className="dlg-ttl">{editRow ? "Edit Product" : "Add Product"}</div><div className="dlg-sub">Fill in the product details below</div></div>
            </div>
            <div className="dlg-body">{colsForTab.map(c => <Field key={c.key} col={c} value={form[c.key]} onChange={setField} />)}</div>
            <div className="dlg-foot">
              <button className="btn-cancel" onClick={() => setDlg(false)}>Cancel</button>
              <button className="btn-ok btn-success" onClick={save}>{editRow ? "Update" : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {confirm && (
        <div className="dlg-ov" onClick={e => e.target === e.currentTarget && setConfirm(false)}>
          <div className="dlg-box" style={{ maxWidth: 370 }}>
            <div className="dlg-hdr">
              <div className="dlg-bar" style={{ background: "#EF4444" }} />
              <div><div className="dlg-ttl">Confirm Delete</div><div className="dlg-sub">This action cannot be undone</div></div>
            </div>
            <div className="dlg-body"><p style={{ color: "rgba(155,180,255,.7)", fontSize: ".84rem", lineHeight: 1.6 }}>Are you sure you want to delete this product record?</p></div>
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

const PROD_CSS = `
  @keyframes srIn {
    from { opacity:0; transform:translateX(-6px); }
    to   { opacity:1; transform:none; }
  }
  .mod-wrap input::placeholder { color: rgba(160,190,255,0.35); }
  .mod-wrap.theme-light input::placeholder { color: rgba(0,0,0,0.3); }

  .theme-light .dlg-box {
    background: rgba(255,255,255,0.82) !important;
    backdrop-filter: blur(40px) saturate(180%);
    border: 1px solid rgba(10,30,100,0.2) !important;
    box-shadow: 0 8px 40px rgba(10,30,100,0.15) !important;
  }
  .theme-light .dlg-hdr {
    border-bottom: 1px solid rgba(10,30,100,0.12) !important;
    background: rgba(135,206,250,0.15) !important;
  }
  .theme-light .dlg-ttl { color: #111827 !important; }
  .theme-light .dlg-sub { color: rgba(0,0,0,0.5) !important; }
  .theme-light .dlg-body { background: transparent !important; }
  .theme-light .dlg-foot {
    border-top: 1px solid rgba(10,30,100,0.12) !important;
    background: transparent !important;
  }
  .theme-light .fld-lbl { color: rgba(0,0,0,0.65) !important; }
  .theme-light .fld-inp {
    background: rgba(255,255,255,0.7) !important;
    border: 1px solid rgba(10,30,100,0.2) !important;
    color: #111827 !important;
  }
  .theme-light .fld-inp:focus {
    border-color: #2a6dd9 !important;
    box-shadow: 0 0 0 3px rgba(42,109,217,0.12) !important;
  }
  .theme-light .fld-inp option {
    background: #fff !important;
    color: #111827 !important;
  }
  .theme-light .btn-cancel {
    border: 1px solid rgba(10,30,100,0.2) !important;
    color: rgba(0,0,0,0.65) !important;
  }
  .theme-light .btn-cancel:hover {
    border-color: rgba(10,30,100,0.4) !important;
    color: #000 !important;
  }
  .theme-light .dlg-body p { color: rgba(0,0,0,0.6) !important; }
`;