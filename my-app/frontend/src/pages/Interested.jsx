import React, { useState, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL;

const COLS = [
  { key:"client_name",      label:"Client Name",      type:"text"   },
  { key:"esops_rsu",        label:"ESOPS/RSU",         type:"select", options:["yes","no"] },
  { key:"discussion_date",  label:"Discussion Date",   type:"date"   },
  { key:"next_action",      label:"Next Action",       type:"text"   },
];
const emptyRow = () => ({ client_name:"", esops_rsu:"no", discussion_date:"", next_action:"" });
const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "—";

const IcoEdit = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoDel  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const IcoPlus = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>;

function Field({ col, value, onChange }) {
  if (col.type==="select") return (
    <div className="fld">
      <label className="fld-lbl">{col.label}</label>
      <select className="fld-inp" value={value||""} onChange={e=>onChange(col.key,e.target.value)}>
        <option value="">Select…</option>
        {col.options.map(o=><option key={o} value={o}>{o[0].toUpperCase()+o.slice(1)}</option>)}
      </select>
    </div>
  );
  return (
    <div className="fld">
      <label className="fld-lbl">{col.label}</label>
      <input className="fld-inp" type={col.type==="date"?"date":"text"} value={value||""} onChange={e=>onChange(col.key,e.target.value)}/>
    </div>
  );
}

function Snack({ msg, severity, onClose }) {
  useEffect(()=>{ const t=setTimeout(onClose,3000); return ()=>clearTimeout(t); },[]);
  return <div className={`snack snack-${severity}`}>{msg}</div>;
}

export default function Interested({ inline=false, onDataChange }) {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [dlg,     setDlg]     = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form,    setForm]    = useState({});
  const [delId,   setDelId]   = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [snack,   setSnack]   = useState(null);

  const load = useCallback(async()=>{
    setLoading(true);
    try { const r=await fetch(`${API}/interested`); setRows(await r.json()??[]); }
    catch { showSnack("Failed to load","error"); } finally { setLoading(false); }
  },[]);
  useEffect(()=>{load();},[load]);

  const showSnack = (msg,severity="success") => setSnack({msg,severity});
  const openAdd  = () => { setEditRow(null); setForm(emptyRow()); setDlg(true); };
  const openEdit = (row) => { setEditRow(row); setForm({...row}); setDlg(true); };
  const setField = (k,v) => setForm(p=>({...p,[k]:v}));

  const save = async () => {
    const url = editRow?`${API}/interested/${editRow.id}`:`${API}/interested`;
    try {
      const r=await fetch(url,{method:editRow?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      if(!r.ok) throw 0;
      showSnack(editRow?"Updated!":"Added!"); setDlg(false); load(); onDataChange?.();
    } catch { showSnack("Save failed","error"); }
  };

  const del = async () => {
    try {
      const r=await fetch(`${API}/interested/${delId}`,{method:"DELETE"});
      if(!r.ok) throw 0;
      showSnack("Deleted"); setConfirm(false); load(); onDataChange?.();
    } catch { showSnack("Delete failed","error"); }
  };

  const ORANGE = "#E67E22";

  return (
    <div className="mod-wrap">
      <div className="mod-hdr">
        <span className="tbl-title" style={{fontSize:".9rem"}}>
          Prospects
          {!loading&&<span className="tbl-badge" style={{marginLeft:8,color:ORANGE,background:"rgba(230,126,34,.1)",borderColor:"rgba(230,126,34,.22)"}}>{rows.length} records</span>}
        </span>
        <button className="add-btn" style={{background:`linear-gradient(135deg,${ORANGE},#ca6f1e)`,boxShadow:"0 4px 14px rgba(230,126,34,.3)"}} onClick={openAdd}>
          <IcoPlus/> Add Row
        </button>
      </div>

      <div className="tbl-hdr">
        <span className="tbl-title">All Prospects</span>
      </div>

      {loading ? <div className="fd-spin"><div className="spinner" style={{borderTopColor:ORANGE}}/></div> : (
        <div className="tbl-wrap">
          <table className="fd-tbl">
            <thead><tr>
              <th style={{width:42}}>#</th>
              {COLS.map(c=><th key={c.key}>{c.label}</th>)}
              <th style={{textAlign:"center",width:82}}>Actions</th>
            </tr></thead>
            <tbody>
              {rows.length===0
                ?<tr><td className="fd-empty" colSpan={COLS.length+2}>No records found. Click "Add Row" to get started.</td></tr>
                :rows.map((row,i)=>(
                  <tr key={row.id}>
                    <td className="fd-num">{i+1}</td>
                    {COLS.map(c=>(
                      <td key={c.key}>
                        {c.key==="esops_rsu"
                          ?<span className={`chip chip-${row[c.key]==="yes"?"yes":"no"}`}>{row[c.key]==="yes"?"Yes":"No"}</span>
                          :c.type==="date"?fmtDate(row[c.key]):row[c.key]??"—"
                        }
                      </td>
                    ))}
                    <td><div className="act-cell">
                      <button className="ab ab-edit" title="Edit" onClick={()=>openEdit(row)}><IcoEdit/></button>
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
          <div className="dlg-hdr"><div className="dlg-bar" style={{background:ORANGE}}/><div className="dlg-ttl">{editRow?"Edit Record":"Add Record"}</div></div>
          <div className="dlg-body">{COLS.map(c=><Field key={c.key} col={c} value={form[c.key]} onChange={setField}/>)}</div>
          <div className="dlg-foot">
            <button className="btn-cancel" onClick={()=>setDlg(false)}>Cancel</button>
            <button className="btn-ok" style={{background:`linear-gradient(135deg,${ORANGE},#ca6f1e)`,boxShadow:"0 4px 14px rgba(230,126,34,.3)"}} onClick={save}>{editRow?"Update":"Save"}</button>
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