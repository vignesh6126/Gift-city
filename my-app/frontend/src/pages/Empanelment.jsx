import React, { useState, useEffect, useCallback, useRef } from "react";

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
const AUTO_KEYS   = new Set(["AMC_name", "products"]);
const MANUAL_KEYS = new Set(["Empanelment_date", "boardings"]);

const pendingToCompleted = (r) => ({ AMC_name: r.AMC_name||"", products: r.products||"", Empanelment_date:"", boardings:"" });
const emptyC = () => ({ AMC_name:"", products:"", Empanelment_date:"", boardings:"" });
const emptyP = () => ({ AMC_name:"", products:"", submission_date:"", status:"" });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "—";

/* ─── Icons ─── */
const IcoEdit = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoDel  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoMove = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2"/><circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const IcoPlus = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>;
const IcoSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const IcoClear = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>;

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
        borderRadius: 3,
        padding: "0 1px",
      }}>
        {str.slice(idx, idx + query.length)}
      </mark>
      {str.slice(idx + query.length)}
    </>
  );
}

function Field({ col, value, onChange, highlight }) {
  const cls = `fld-inp${highlight ? " fld-hi" : ""}`;
  if (col.type === "select") return (
    <div className="fld">
      <label className="fld-lbl">{col.label}</label>
      <select className={cls} value={value||""} onChange={e=>onChange(col.key,e.target.value)}>
        <option value="">Select…</option>
        {col.options.map(o=><option key={o} value={o}>{o[0].toUpperCase()+o.slice(1)}</option>)}
      </select>
    </div>
  );
  return (
    <div className="fld">
      <label className="fld-lbl">{col.label}</label>
      <input className={cls} type={col.type==="number"?"number":col.type==="date"?"date":"text"} value={value||""} onChange={e=>onChange(col.key,e.target.value)} />
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
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        flexWrap: "wrap",
      }}>
        {/* Input wrapper */}
        <div style={{
          position: "relative",
          flex: 1,
          minWidth: 200,
          maxWidth: 420,
        }}>
          {/* Search icon */}
          <span style={{
            position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            color: isActive ? (theme === "light" ? "#2a6dd9" : "#4F8EF7") : (theme === "light" ? "rgba(0,0,0,0.3)" : "rgba(160,190,255,0.4)"),
            display: "flex", pointerEvents: "none",
            transition: "color .2s",
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
                ? (theme === "light" ? "1px solid rgba(42,109,217,0.6)" : "1px solid rgba(79,142,247,0.55)")
                : (theme === "light" ? "1px solid rgba(0,0,0,0.2)" : "1px solid rgba(79,142,247,0.22)"),
              background: isActive
                ? (theme === "light" ? "rgba(42,109,217,0.07)" : "rgba(79,142,247,0.08)")
                : (theme === "light" ? "rgba(255,255,255,0.6)" : "rgba(10,16,60,0.5)"),
              color: theme === "light" ? "#111827" : "#fff",
              fontSize: ".82rem",
              fontFamily: "var(--fb,'Exo 2',sans-serif)",
              outline: "none",
              transition: "all .22s",
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

          {/* Clear button */}
          {isActive && (
            <button
              onClick={() => { onChange(""); inputRef.current?.focus(); }}
              style={{
                position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                background: theme === "light" ? "rgba(42,109,217,0.14)" : "rgba(79,142,247,0.18)", border: "none", borderRadius: "50%",
                width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: theme === "light" ? "rgba(0,0,0,0.55)" : "rgba(180,210,255,0.8)",
                transition: "all .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = theme === "light" ? "rgba(42,109,217,0.28)" : "rgba(79,142,247,0.35)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = theme === "light" ? "rgba(42,109,217,0.14)" : "rgba(79,142,247,0.18)"; e.currentTarget.style.color = theme === "light" ? "rgba(0,0,0,0.55)" : "rgba(180,210,255,0.8)"; }}
            >
              <IcoClear />
            </button>
          )}
        </div>

        {/* Result pill */}
        {isActive && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "4px 12px", borderRadius: 20,
            background: resultCount > 0 ? "rgba(79,142,247,0.12)" : "rgba(248,113,113,0.12)",
            border: `1px solid ${resultCount > 0 ? "rgba(79,142,247,0.28)" : "rgba(248,113,113,0.28)"}`,
            fontSize: ".7rem", fontWeight: 700,
            color: resultCount > 0 ? (theme === "light" ? "#2a6dd9" : "#4F8EF7") : (theme === "light" ? "#b02020" : "#F87171"),
            fontFamily: "var(--fh,'Orbitron',sans-serif)",
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

export default function Empanelment({ inline=false, onDataChange, initialTab, theme="dark" }) {
  const [tab,     setTab]     = useState(initialTab || "completed");
  const [rows,    setRows]    = useState([]);
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(false);
  const [dlg,     setDlg]     = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form,    setForm]    = useState({});
  const [delId,   setDelId]   = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [promo,   setPromo]   = useState(false);
  const [promoId, setPromoId] = useState(null);
  const [promoForm, setPromoForm] = useState({});
  const [promoLoading, setPromoLoading] = useState(false);
  const [snack,   setSnack]   = useState(null);

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  // Clear search whenever tab changes
  useEffect(() => { setSearch(""); }, [tab]);

  const cols = tab === "completed" ? COMPLETED_COLS : PENDING_COLS;

  const showSnack = (msg, severity = "success") => setSnack({ msg, severity });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/empanelment/${tab}`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Empanelment load error:", e);
      setSnack({ msg: `Failed to load: ${e.message}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  }, [tab]);
  useEffect(() => { load(); }, [load]);

  // ── Dynamic filter: match AMC_name (case-insensitive, partial)
  const filteredRows = search.trim()
    ? rows.filter(r =>
        (r.AMC_name || "").toLowerCase().includes(search.trim().toLowerCase())
      )
    : rows;

  const openAdd  = () => { setEditRow(null); setForm(tab==="completed"?emptyC():emptyP()); setDlg(true); };
  const openEdit = (row) => { setEditRow(row); setForm({...row}); setDlg(true); };
  const setField = (k,v) => setForm(p=>({...p,[k]:v}));

  const save = async () => {
    const url = editRow ? `${API}/empanelment/${tab}/${editRow.id}` : `${API}/empanelment/${tab}`;
    try {
      const r = await fetch(url,{method:editRow?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      if(!r.ok) throw 0;
      showSnack(editRow?"Updated!":"Added!"); setDlg(false); load(); onDataChange?.();
    } catch { showSnack("Save failed","error"); }
  };

  const del = async () => {
    try {
      const r = await fetch(`${API}/empanelment/${tab}/${delId}`,{method:"DELETE"});
      if(!r.ok) throw 0;
      showSnack("Deleted"); setConfirm(false); load(); onDataChange?.();
    } catch { showSnack("Delete failed","error"); }
  };

  const openPromo   = (row) => { setPromoId(row.id); setPromoForm(pendingToCompleted(row)); setPromo(true); };
  const setPromoFld = (k,v) => setPromoForm(p=>({...p,[k]:v}));
  const savePromo = async () => {
    setPromoLoading(true);
    try {
      const a = await fetch(`${API}/empanelment/completed`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(promoForm)});
      if(!a.ok) throw new Error("Add failed");
      const d = await fetch(`${API}/empanelment/pending/${promoId}`,{method:"DELETE"});
      if(!d.ok) throw new Error("Delete failed");
      showSnack("✓ Moved to Completed!"); setPromo(false); load(); onDataChange?.();
    } catch(e){ showSnack(e.message||"Failed","error"); } finally { setPromoLoading(false); }
  };

  return (
    <div className={`mod-wrap${theme === "light" ? " theme-light" : ""}`}>
      <style>{EMP_CSS}</style>

      {/* ── Top bar: tabs + add button ── */}
      <div className="mod-hdr">
        <div className="tabs-row">
          {TABS.map(t=>(
            <button key={t.id} className={`tab-pill ${tab===t.id?"tab-active":""}`} onClick={()=>setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        {tab==="pending" && (
          <button className="add-btn" style={{background:"linear-gradient(135deg,#4F8EF7,#7B5FFF)",boxShadow:"0 4px 14px rgba(79,142,247,.32)"}} onClick={openAdd}>
            <IcoPlus /> Add Row
          </button>
        )}
      </div>

      {/* ── Search bar (below tabs) ── */}
      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder={`Search AMC name in ${tab === "completed" ? "Completed" : "Pending"}…`}
        resultCount={filteredRows.length}
        totalCount={rows.length}
        theme={theme}
      />

      {/* ── Table header ── */}
      <div className="tbl-hdr">
        <span className="tbl-title">{TABS.find(t=>t.id===tab)?.label}</span>
        {!loading && (
          <span className="tbl-badge">
            {search.trim()
              ? <>{filteredRows.length} <span style={{ opacity: .55 }}>/ {rows.length}</span></>
              : <>{rows.length} records</>
            }
          </span>
        )}
      </div>

      {loading ? (
        <div className="fd-spin"><div className="spinner"/></div>
      ) : (
        <div className="tbl-wrap">
          <table className="fd-tbl">
            <thead><tr>
              <th style={{width:42}}>#</th>
              {cols.map(c=><th key={c.key}>{c.label}</th>)}
              <th style={{textAlign:"center",width:tab==="pending"?108:82}}>Actions</th>
            </tr></thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="fd-empty" colSpan={cols.length+2}>
                    {search.trim()
                      ? <>No AMCs match "<strong style={{color:"#4F8EF7"}}>{search}</strong>"</>
                      : tab==="pending"
                        ? 'No records found. Click "Add Row" to get started.'
                        : "No records found."
                    }
                  </td>
                </tr>
              ) : filteredRows.map((row,i)=>(
                <tr key={row.id}>
                  <td className="fd-num">{i+1}</td>
                  {cols.map(c=>(
                    <td key={c.key}>
                      {c.type === "date"
                        ? fmtDate(row[c.key])
                        : c.key === "AMC_name"
                          ? <Highlight text={row[c.key]} query={search} theme={theme} />
                          : row[c.key] ?? "—"
                      }
                    </td>
                  ))}
                  <td><div className="act-cell">
                    <button className="ab ab-edit" title="Edit" onClick={()=>openEdit(row)}><IcoEdit/></button>
                    {tab==="pending"&&<button className="ab ab-promo" title="Move to Completed" onClick={()=>openPromo(row)}><IcoMove/></button>}
                    <button className="ab ab-del" title="Delete" onClick={()=>{setDelId(row.id);setConfirm(true);}}><IcoDel/></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Dialogs (unchanged) ── */}
      {dlg&&<div className="dlg-ov" onClick={e=>e.target===e.currentTarget&&setDlg(false)}>
        <div className="dlg-box">
          <div className="dlg-hdr"><div className="dlg-bar" style={{background:"#4F8EF7"}}/><div className="dlg-ttl">{editRow?"Edit Record":"Add Record"}</div></div>
          <div className="dlg-body">{cols.map(c=><Field key={c.key} col={c} value={form[c.key]} onChange={setField}/>)}</div>
          <div className="dlg-foot">
            <button className="btn-cancel" onClick={()=>setDlg(false)}>Cancel</button>
            <button className="btn-ok btn-primary" onClick={save}>{editRow?"Update":"Save"}</button>
          </div>
        </div>
      </div>}

      {promo&&<div className="dlg-ov" onClick={e=>e.target===e.currentTarget&&setPromo(false)}>
        <div className="dlg-box">
          <div className="dlg-hdr">
            <div className="dlg-bar" style={{background:"#34D399"}}/>
            <div><div className="dlg-ttl">Move to Empanelment Completed</div><div className="dlg-sub">Orange fields require manual entry</div></div>
          </div>
          <div className="dlg-body">
            {COMPLETED_COLS.map(c=>(
              <div key={c.key}>
                <Field col={c} value={promoForm[c.key]} onChange={setPromoFld} highlight={MANUAL_KEYS.has(c.key)}/>
                {MANUAL_KEYS.has(c.key)&&<div className="fld-note" style={{color:"#f59e0b"}}>⚠ Fill manually</div>}
                {AUTO_KEYS.has(c.key)&&<div className="fld-note" style={{color:"#34D399"}}>✓ Auto-filled</div>}
              </div>
            ))}
          </div>
          <div className="dlg-foot">
            <button className="btn-cancel" onClick={()=>setPromo(false)} disabled={promoLoading}>Cancel</button>
            <button className="btn-ok btn-success" onClick={savePromo} disabled={promoLoading}>{promoLoading?"Saving…":"Save & Move"}</button>
          </div>
        </div>
      </div>}

      {confirm&&<div className="dlg-ov" onClick={e=>e.target===e.currentTarget&&setConfirm(false)}>
        <div className="dlg-box" style={{maxWidth:370}}>
          <div className="dlg-hdr"><div className="dlg-bar" style={{background:"#EF4444"}}/><div className="dlg-ttl">Confirm Delete</div></div>
          <div className="dlg-body"><p style={{color:"white",fontSize:".84rem",lineHeight:1.6}}>Are you sure you want to delete this record? This action cannot be undone.</p></div>
          <div className="dlg-foot">
            <button className="btn-cancel" onClick={()=>setConfirm(false)}>Cancel</button>
            <button className="btn-ok btn-danger" onClick={del}>Delete</button>
          </div>
        </div>
      </div>}

      {snack&&<Snack {...snack} onClose={()=>setSnack(null)}/>}
    </div>
  );
}

const EMP_CSS = `
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
  .theme-light .dlg-body {
    background: transparent !important;
    max-height: 45vh !important;
  }
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
  .theme-light .dlg-body p { color: #000 !important; }
`;