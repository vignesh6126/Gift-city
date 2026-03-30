import React, { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL;

const TABS = [
  { id: "completed", label: "Customers Completed" },
  { id: "pending",   label: "Customers Pending"   },
];
const COMPLETED_COLS = [
  { key:"client_name",      label:"Client Name",      type:"text"   },
  { key:"first_investment", label:"First Investment",  type:"date"   },
  { key:"amount",           label:"Amount",            type:"number" },
  { key:"amc_name",         label:"AMC Name",          type:"text"   },
  { key:"scheme",           label:"Scheme",            type:"text"   },
  { key:"bank",             label:"Bank",              type:"select", options:["gift","savings","both"] },
];
const PENDING_COLS = [
  { key:"client_name",          label:"Client Name",           type:"text"   },
  { key:"amount_tobe_invested", label:"Amount to be Invested", type:"number" },
  { key:"amc_name",             label:"AMC Name",              type:"text"   },
  { key:"scheme",               label:"Scheme",                type:"text"   },
  { key:"bank",                 label:"Bank",                  type:"select", options:["gift","savings","both"] },
  { key:"submission_date",      label:"Submission Date",       type:"date"   },
  { key:"status",               label:"Status",                type:"text"   },
];
const AUTO_KEYS   = new Set(["client_name","amount","amc_name","scheme","bank"]);
const MANUAL_KEYS = new Set(["first_investment"]);

const p2c = (r) => ({ client_name:r.client_name||"", amount:r.amount_tobe_invested||"", amc_name:r.amc_name||"", scheme:r.scheme||"", bank:r.bank||"savings", first_investment:"" });
const emptyC = () => ({ client_name:"", first_investment:"", amount:"", scheme:"", amc_name:"", bank:"savings" });
const emptyP = () => ({ client_name:"", amount_tobe_invested:"", scheme:"", amc_name:"", bank:"savings", submission_date:"", status:"" });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "—";

const IcoEdit = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoDel  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoMove = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2"/><circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2"/><circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
const IcoPlus = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>;

function Field({ col, value, onChange, highlight }) {
  const cls = `fld-inp${highlight?" fld-hi":""}`;
  if (col.type==="select") return (
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
      <input className={cls} type={col.type==="number"?"number":col.type==="date"?"date":"text"} value={value||""} onChange={e=>onChange(col.key,e.target.value)}/>
    </div>
  );
}

function Snack({ msg, severity, onClose }) {
  useEffect(()=>{ const t=setTimeout(onClose,3000); return ()=>clearTimeout(t); },[]);
  return <div className={`snack snack-${severity}`}>{msg}</div>;
}

export default function Invested({ inline=false, onDataChange }) {
  const [tab,         setTab]         = useState("completed");
  const [rows,        setRows]        = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [dlg,         setDlg]         = useState(false);
  const [editRow,     setEditRow]     = useState(null);
  const [form,        setForm]        = useState({});
  const [delId,       setDelId]       = useState(null);
  const [confirm,     setConfirm]     = useState(false);
  const [promo,       setPromo]       = useState(false);
  const [promoId,     setPromoId]     = useState(null);
  const [promoForm,   setPromoForm]   = useState({});
  const [promoLoading,setPromoLoading]= useState(false);
  const [snack,       setSnack]       = useState(null);

  const cols = tab==="completed"?COMPLETED_COLS:PENDING_COLS;

  const load = useCallback(async()=>{
    setLoading(true);
    try { const r=await fetch(`${API}/invested/${tab}`); setRows(await r.json()??[]); }
    catch { showSnack("Failed to load","error"); } finally { setLoading(false); }
  },[tab]);
  useEffect(()=>{load();},[load]);

  const showSnack = (msg,severity="success") => setSnack({msg,severity});
  const openAdd  = () => { setEditRow(null); setForm(tab==="completed"?emptyC():emptyP()); setDlg(true); };
  const openEdit = (row) => { setEditRow(row); setForm({...row}); setDlg(true); };
  const setField = (k,v) => setForm(p=>({...p,[k]:v}));

  const save = async () => {
    const url = editRow?`${API}/invested/${tab}/${editRow.id}`:`${API}/invested/${tab}`;
    try {
      const r=await fetch(url,{method:editRow?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      if(!r.ok) throw 0;
      showSnack(editRow?"Updated!":"Added!"); setDlg(false); load(); onDataChange?.();
    } catch { showSnack("Save failed","error"); }
  };

  const del = async () => {
    try {
      const r=await fetch(`${API}/invested/${tab}/${delId}`,{method:"DELETE"});
      if(!r.ok) throw 0;
      showSnack("Deleted"); setConfirm(false); load(); onDataChange?.();
    } catch { showSnack("Delete failed","error"); }
  };

  const openPromo  = (row) => { setPromoId(row.id); setPromoForm(p2c(row)); setPromo(true); };
  const setPromoFld = (k,v) => setPromoForm(p=>({...p,[k]:v}));
  const savePromo = async () => {
    setPromoLoading(true);
    try {
      const a=await fetch(`${API}/invested/completed`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(promoForm)});
      if(!a.ok) throw new Error("Add failed");
      const d=await fetch(`${API}/invested/pending/${promoId}`,{method:"DELETE"});
      if(!d.ok) throw new Error("Delete failed");
      showSnack("✓ Moved to Completed!"); setPromo(false); load(); onDataChange?.();
    } catch(e){ showSnack(e.message||"Failed","error"); } finally { setPromoLoading(false); }
  };

  return (
    <div className="mod-wrap">
      <div className="mod-hdr">
        <div className="tabs-row">
          {TABS.map(t=>(
            <button key={t.id} className={`tab-pill ${tab===t.id?"tab-active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
        </div>
        {tab==="pending"&&(
          <button className="add-btn" style={{background:"linear-gradient(135deg,#64B5F6,#2979A0)",boxShadow:"0 4px 14px rgba(100,181,246,.3)"}} onClick={openAdd}>
            <IcoPlus/> Add Row
          </button>
        )}
      </div>

      <div className="tbl-hdr">
        <span className="tbl-title">{TABS.find(t=>t.id===tab)?.label}</span>
        {!loading&&<span className="tbl-badge" style={{color:"#64B5F6",background:"rgba(100,181,246,.1)",borderColor:"rgba(100,181,246,.22)"}}>{rows.length} records</span>}
      </div>

      {loading ? <div className="fd-spin"><div className="spinner" style={{borderTopColor:"#64B5F6"}}/></div> : (
        <div className="tbl-wrap">
          <table className="fd-tbl">
            <thead><tr>
              <th style={{width:42}}>#</th>
              {cols.map(c=><th key={c.key}>{c.label}</th>)}
              <th style={{textAlign:"center",width:tab==="pending"?108:82}}>Actions</th>
            </tr></thead>
            <tbody>
              {rows.length===0
                ?<tr><td className="fd-empty" colSpan={cols.length+2}>No records found.{tab==="pending"&&' Click "Add Row" to get started.'}</td></tr>
                :rows.map((row,i)=>(
                  <tr key={row.id}>
                    <td className="fd-num">{i+1}</td>
                    {cols.map(c=><td key={c.key}>{c.type==="date"?fmtDate(row[c.key]):row[c.key]??"—"}</td>)}
                    <td><div className="act-cell">
                      <button className="ab ab-edit" title="Edit" onClick={()=>openEdit(row)}><IcoEdit/></button>
                      {tab==="pending"&&<button className="ab ab-promo" title="Move to Completed" onClick={()=>openPromo(row)}><IcoMove/></button>}
                      <button className="ab ab-del" title="Delete" onClick={()=>{setDelId(row.id);setConfirm(true);}}><IcoDel/></button>
                    </div></td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {dlg&&<div className="dlg-ov" onClick={e=>e.target===e.currentTarget&&setDlg(false)}>
        <div className="dlg-box">
          <div className="dlg-hdr"><div className="dlg-bar" style={{background:"#64B5F6"}}/><div className="dlg-ttl">{editRow?"Edit Record":"Add Record"}</div></div>
          <div className="dlg-body">{cols.map(c=><Field key={c.key} col={c} value={form[c.key]} onChange={setField}/>)}</div>
          <div className="dlg-foot">
            <button className="btn-cancel" onClick={()=>setDlg(false)}>Cancel</button>
            <button className="btn-ok" style={{background:"linear-gradient(135deg,#64B5F6,#2979A0)",boxShadow:"0 4px 14px rgba(100,181,246,.3)"}} onClick={save}>{editRow?"Update":"Save"}</button>
          </div>
        </div>
      </div>}

      {promo&&<div className="dlg-ov" onClick={e=>e.target===e.currentTarget&&setPromo(false)}>
        <div className="dlg-box">
          <div className="dlg-hdr">
            <div className="dlg-bar" style={{background:"#34D399"}}/>
            <div><div className="dlg-ttl">Move to Customers Completed</div><div className="dlg-sub">Orange fields require manual entry</div></div>
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
          <div className="dlg-body"><p style={{color:"rgba(155,180,255,.7)",fontSize:".84rem",lineHeight:1.6}}>Are you sure? This cannot be undone.</p></div>
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