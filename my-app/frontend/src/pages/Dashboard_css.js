/* ============================================================
   DASHBOARD.JSX  — CSS PATCH  (replace the CSS const at bottom)
   Key changes:
   1. .root → height:100vh (not min-height) to lock page height
   2. .page-card → height:100%
   3. .content → min-height:0 so flex children can shrink
   4. .dashboard-bottom → align-items:stretch + flex:1 + min-height:0
   5. .amc-table-col → flex column + min-height:0 + overflow:hidden
   6. .side-cards-col → overflow-y:auto with themed scrollbar
   7. body → overflow:hidden to kill page scroll completely
   ============================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blue:#4F8EF7;--green:#34D399;--gold:#F59E0B;--purple:#A78BFA;--red:#F87171;
  --muted:rgba(180,200,255,0.6);--side-w:210px;--hdr-h:64px;
  --spring:cubic-bezier(0.34,1.56,0.64,1);--smooth:cubic-bezier(0.4,0,0.2,1);
  --fh:'Inter',sans-serif;--fb:'Inter',sans-serif;
}
html,body{margin:0;padding:0;height:100%;overflow:hidden}
body{font-family:var(--fb);background:transparent;color:#fff;padding:12px;box-sizing:border-box}
button{font-family:var(--fb)}

/* KEY: height:100vh locks the page — no page scroll */
.root{height:100vh;display:flex;align-items:stretch;background:transparent;box-sizing:border-box;overflow:hidden}
.page-card{display:flex;flex:1;min-width:0;gap:10px;align-items:stretch;border-radius:20px;border:1px solid rgba(79,142,247,0.35);box-shadow:0 0 40px rgba(30,60,180,0.25),0 0 80px rgba(10,20,80,0.4);padding:10px;background:transparent;overflow:hidden;width:100%;height:100%}

.side{width:var(--side-w);flex-shrink:0;background:transparent;border:1px solid rgba(79,142,247,0.35);border-radius:20px;box-shadow:0 0 30px rgba(30,60,180,0.2);display:flex;flex-direction:column;z-index:300;transition:transform .4s var(--spring);position:relative;overflow:hidden}
.side-overlay{position:fixed;inset:0;z-index:299;background:rgba(0,0,0,0.65);backdrop-filter:blur(4px)}
.side-logo{padding:20px 14px 18px;border-bottom:1px solid rgba(79,142,247,0.2);flex-shrink:0}
.logo-box{border:1.5px solid rgba(79,142,247,0.72);border-radius:12px;padding:14px 12px;display:flex;flex-direction:column;align-items:center;background:rgba(79,142,247,0.06);box-shadow:0 0 32px rgba(79,142,247,0.22),inset 0 1px 0 rgba(255,255,255,0.07)}
.logo-words{display:flex;flex-direction:column;align-items:center;width:100%;gap:3px}
.logo-main{font-weight:700;font-size:.85rem;color:#fff;letter-spacing:.1em;text-align:center;line-height:1.3;word-break:break-word;text-shadow:0 0 22px rgba(79,142,247,0.65)}
.logo-est{font-size:.63rem;color:rgba(160,190,255,0.65);letter-spacing:.16em;text-align:center;text-transform:uppercase;margin-top:2px}
.side-nav{flex:1;padding:18px 10px;display:flex;flex-direction:column;gap:2px;overflow-y:auto;min-height:0}
.nav-btn{width:100%;display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:10px;border:1px solid transparent;background:transparent;cursor:pointer;color:rgba(200,220,255,0.75);font-size:.88rem;font-weight:500;transition:all .22s var(--smooth);text-align:left;letter-spacing:.01em}
.nav-btn:hover{color:#fff;background:rgba(79,142,247,0.1);border-color:rgba(79,142,247,0.22)}
.nav-active{color:#fff!important;background:linear-gradient(90deg,rgba(79,142,247,0.38),rgba(79,142,247,0.15))!important;border-color:rgba(79,142,247,0.5)!important;box-shadow:0 0 18px rgba(79,142,247,0.2);position:relative}
.nav-active::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;border-radius:0 2px 2px 0;background:linear-gradient(180deg,var(--blue),var(--purple));box-shadow:0 0 8px var(--blue)}
.nav-ico{display:flex;align-items:center;flex-shrink:0}
.nav-lbl{font-weight:500;font-size:.72rem;letter-spacing:.04em}
.logout-card{margin:8px 0 16px;padding:6px;border-radius:12px;border:1px solid rgba(79,142,247,0.25);background:rgba(79,142,247,0.05);transition:transform .28s var(--spring),box-shadow .28s;flex-shrink:0}
.logout-card:hover{transform:scale(1.06) translateY(-3px);box-shadow:0 10px 30px rgba(79,142,247,0.3)}
.logout-nav{width:100%;margin-bottom:0}
.logout-nav:hover{color:#fff!important;background:transparent!important;border-color:transparent!important}

.main{flex:1;min-width:0;display:flex;flex-direction:column;position:relative;z-index:1;background:transparent;border-radius:20px;overflow:hidden;min-height:0}
.topbar{height:var(--hdr-h);display:flex;align-items:center;padding:0 12px;gap:8px;background:transparent;z-index:200;min-width:0;overflow:hidden;flex-shrink:0}
.menu-btn{display:none;background:none;border:none;color:#fff;cursor:pointer;padding:5px;border-radius:7px;flex-shrink:0}
.topbar-title{flex:1;min-width:0;font-weight:700;font-size:1.1rem;color:#fff;letter-spacing:.08em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-chip{display:flex;align-items:center;gap:8px;padding:4px 12px 4px 4px;background:rgba(12,20,65,0.5);border:1px solid rgba(79,142,247,0.45);border-radius:40px;backdrop-filter:blur(14px);flex-shrink:0}
.user-av{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#2050c8,#6622bb);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;color:#fff;box-shadow:0 0 14px rgba(79,142,247,0.5)}
.user-name{font-size:.8rem;font-weight:600;color:#fff;letter-spacing:.02em;white-space:nowrap}

/* KEY: content must have min-height:0 and no bottom padding that breaks flex */
.content{flex:1;padding:0 12px 12px;display:flex;flex-direction:column;gap:14px;min-width:0;overflow:hidden;min-height:0}
.stats-card{border:1px solid rgba(79,142,247,0.32);border-radius:20px;padding:12px;background:transparent;width:100%;box-sizing:border-box;flex-shrink:0}
.stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;width:100%}
.sc{position:relative;overflow:hidden;border-radius:14px;border:1px solid rgba(79,142,247,0.45);padding:10px 12px;transition:transform .35s var(--spring),box-shadow .35s;cursor:default;box-shadow:0 0 14px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.05);min-width:0}
.sc:hover{transform:translateY(-4px) scale(1.015)}
.sc-body{position:relative;z-index:1;display:flex;align-items:center;gap:8px;min-width:0}
.sc-icon{width:36px;height:36px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:var(--accent);border:1.5px solid rgba(255,255,255,0.12)}
.sc-text{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}
.sc-label{font-size:.5rem;font-weight:700;letter-spacing:.05em;color:rgba(220,235,255,0.95);white-space:normal;word-break:break-word;text-transform:uppercase;line-height:1.3}
.sc-ratio{display:flex;align-items:baseline;gap:2px;flex-wrap:wrap}
.sc-big{font-size:1.55rem;font-weight:800;line-height:1;color:#fff}
.sc-slash{font-size:.85rem;color:rgba(220,235,255,0.7)}
.sc-tot{font-size:.85rem;color:rgba(220,235,255,0.8)}
.sc-single{font-size:1.75rem;font-weight:800;line-height:1;color:#fff}
.sc-sub{font-size:.55rem;color:var(--accent);margin-top:2px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sc-skel{height:24px;width:60px;border-radius:6px;background:rgba(255,255,255,0.07);animation:sk 1.4s infinite}
@keyframes sk{0%,100%{opacity:.4}50%{opacity:.8}}

/* KEY: dashboard-bottom stretches to fill remaining space */
.dashboard-bottom{display:flex;gap:12px;align-items:stretch;min-width:0;flex:1;min-height:0;overflow:hidden}

/* KEY: amc-table-col must be a flex column with min-height:0 */
.amc-table-col{flex:1;min-width:0;min-height:0;display:flex;flex-direction:column;overflow:hidden}

/* KEY: side-cards-col scrolls internally with themed scrollbar */
.side-cards-col{
  display:flex;flex-direction:column;gap:12px;
  width:190px;flex-shrink:0;
  overflow-y:auto;
  max-height:100%;
  scrollbar-width:thin;
  scrollbar-color:rgba(167,139,250,0.4) transparent;
  padding-right:2px;
}
.side-cards-col::-webkit-scrollbar{width:3px}
.side-cards-col::-webkit-scrollbar-track{background:transparent}
.side-cards-col::-webkit-scrollbar-thumb{background:rgba(167,139,250,0.4);border-radius:3px}
.side-cards-col::-webkit-scrollbar-thumb:hover{background:rgba(167,139,250,0.65)}

.side-card{border-radius:16px;border:1px solid rgba(79,142,247,0.28);padding:14px 12px 12px;display:flex;flex-direction:column;background:rgba(8,12,48,0.45);backdrop-filter:blur(8px);animation:pIn .38s var(--spring) both;transition:transform .28s var(--spring),box-shadow .28s;position:relative;overflow:hidden;flex-shrink:0}
.side-card-red{border-color:rgba(248,113,113,0.28);box-shadow:0 0 24px rgba(248,113,113,0.07)}
.side-card-purple{border-color:rgba(167,139,250,0.28);box-shadow:0 0 24px rgba(167,139,250,0.07)}
.side-card:hover{transform:translateY(-3px) scale(1.01)}
.side-card-header{display:flex;align-items:center;gap:8px;margin-bottom:10px}
.side-card-icon-wrap{width:26px;height:26px;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.side-card-icon-red{background:rgba(248,113,113,0.16);color:#F87171;border:1px solid rgba(248,113,113,0.28)}
.side-card-icon-purple{background:rgba(167,139,250,0.16);color:#A78BFA;border:1px solid rgba(167,139,250,0.28)}
.side-card-label{font-size:.48rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(200,220,255,0.75);line-height:1.2;flex:1;min-width:0}
.side-card-count{font-size:1.35rem;font-weight:800;line-height:1;margin-left:auto;flex-shrink:0}
.side-card-divider{height:1px;background:rgba(79,142,247,0.14);margin:0 0 9px}
.side-card-rows{display:flex;flex-direction:column;gap:6px}
.side-card-row{display:flex;align-items:center;gap:6px;font-size:.71rem}
.side-card-row-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0}
.side-card-row-lbl{color:rgba(180,210,255,0.65);flex:1;font-weight:500;font-size:.68rem;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.side-card-row-val{font-weight:800;font-size:.76rem;flex-shrink:0}
.pending-nav-row{border-radius:7px;padding:3px 5px;margin:0 -5px;transition:background .18s,transform .15s}
.pending-nav-row:hover{background:rgba(79,142,247,0.1);transform:translateX(2px)}
.module-panel{background:rgba(8,12,45,0.32);border:1px solid rgba(79,142,247,0.28);border-radius:18px;overflow:hidden;backdrop-filter:blur(4px);box-shadow:0 0 0 1px rgba(79,142,247,0.08),0 8px 40px rgba(0,0,60,0.35);animation:pIn .38s var(--spring) both;min-width:0;width:100%;flex:1;min-height:0}
@keyframes pIn{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}
.mod-wrap{min-height:200px;width:100%;min-width:0}
.mod-hdr{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;padding:12px 16px;border-bottom:1px solid rgba(79,142,247,0.15)}
.tabs-row{display:flex;gap:6px;flex-wrap:wrap}
.tab-pill{padding:6px 16px;border-radius:50px;border:1px solid rgba(79,142,247,0.28);background:rgba(10,14,60,0.6);color:rgba(180,210,255,0.68);backdrop-filter:blur(8px);font-size:.8rem;font-weight:600;cursor:pointer;font-family:var(--fh);transition:all .28s var(--spring);white-space:nowrap}
.tab-pill:hover{color:#fff;border-color:rgba(79,142,247,0.5);background:rgba(79,142,247,0.1)}
.tab-active{background:linear-gradient(90deg,rgba(79,142,247,0.38),rgba(79,142,247,0.15))!important;color:#fff!important;border-color:rgba(79,142,247,0.5)!important;box-shadow:0 0 18px rgba(79,142,247,0.2);transform:translateY(-1px)}
.tbl-hdr{display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid rgba(79,142,247,0.15);flex-wrap:wrap}
.tbl-title{font-weight:700;font-size:.95rem;color:#fff;letter-spacing:.06em}
.tbl-badge{padding:3px 10px;border-radius:20px;font-size:.65rem;font-weight:700;background:rgba(79,142,247,0.14);color:var(--blue);border:1px solid rgba(79,142,247,0.28)}
.tbl-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;width:100%}
.tbl-wrap::-webkit-scrollbar{height:4px}
.tbl-wrap::-webkit-scrollbar-track{background:rgba(79,142,247,0.04)}
.tbl-wrap::-webkit-scrollbar-thumb{background:rgba(79,142,247,0.3);border-radius:4px}
.fd-tbl{width:100%;border-collapse:collapse;font-size:.83rem;min-width:600px}
.fd-tbl thead tr{background:rgba(20,35,110,0.28)}
.fd-tbl th{padding:11px 14px;text-align:left;font-size:.66rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(180,210,255,0.65);border-bottom:1px solid rgba(79,142,247,0.22);white-space:nowrap}
.fd-tbl tbody tr{background:transparent;transition:background .18s;animation:rIn .32s ease both}
.fd-tbl tbody tr:nth-child(even){background:rgba(79,142,247,0.04)}
.fd-tbl tbody tr:nth-child(1){animation-delay:.03s}.fd-tbl tbody tr:nth-child(2){animation-delay:.06s}.fd-tbl tbody tr:nth-child(3){animation-delay:.09s}.fd-tbl tbody tr:nth-child(4){animation-delay:.12s}.fd-tbl tbody tr:nth-child(5){animation-delay:.15s}
@keyframes rIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
.fd-tbl tbody tr:hover{background:rgba(79,142,247,0.08)!important}
.fd-tbl tbody tr:last-child td{border-bottom:none}
.fd-tbl td{padding:8px 14px;color:#e8f0ff;border-bottom:1px solid rgba(79,142,247,0.1);vertical-align:middle;white-space:nowrap;background:transparent;font-size:.84rem}
.fd-num{color:rgba(160,190,255,0.5);font-size:.74rem}
.fd-empty{text-align:center;padding:48px 20px!important;color:var(--muted);font-style:italic;font-size:.84rem}
.act-cell{display:flex;gap:5px;align-items:center;justify-content:center}
.ab{width:28px;height:28px;border-radius:8px;border:1px solid transparent;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:all .22s var(--spring);flex-shrink:0}
.ab:hover{transform:scale(1.15) translateY(-2px)}
.ab-del{background:rgba(239,68,68,0.2);color:#ef4444;border-color:rgba(239,68,68,0.28)}.ab-del:hover{background:#ef4444;color:#fff;box-shadow:0 4px 14px rgba(239,68,68,0.5)}
.ab-edit{background:rgba(79,142,247,0.2);color:#4F8EF7;border-color:rgba(79,142,247,0.3)}.ab-edit:hover{background:#4F8EF7;color:#fff;box-shadow:0 4px 14px rgba(79,142,247,0.5)}
.ab-dl{background:rgba(20,184,166,0.18);color:#2dd4bf;border-color:rgba(20,184,166,0.26)}.ab-dl:hover{background:#14b8a6;color:#fff}
.ab-promo{background:rgba(245,158,11,0.18);color:#f59e0b;border-color:rgba(245,158,11,0.26)}.ab-promo:hover{background:#f59e0b;color:#fff}
.ab-view{background:rgba(167,139,250,0.18);color:#a78bfa;border-color:rgba(167,139,250,0.26)}.ab-view:hover{background:#a78bfa;color:#fff}
.add-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:10px;border:none;cursor:pointer;color:#fff;font-size:.78rem;font-weight:700;transition:all .28s var(--spring);white-space:nowrap;flex-shrink:0}
.add-btn:hover{transform:translateY(-2px);filter:brightness(1.12)}
.chip{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:.71rem;font-weight:700}
.chip-yes{background:rgba(52,211,153,0.13);color:var(--green);border:1px solid rgba(52,211,153,0.24)}
.chip-no{background:rgba(248,113,113,0.1);color:var(--red);border:1px solid rgba(248,113,113,0.2)}
.fd-spin{display:flex;justify-content:center;align-items:center;padding:56px;flex-shrink:0}
.spinner{width:28px;height:28px;border-radius:50%;border:3px solid rgba(79,142,247,0.18);border-top-color:var(--blue);animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.dlg-ov{position:fixed;inset:0;z-index:1000;background:rgba(0,0,10,0.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;animation:fIn .18s ease;box-sizing:border-box}
@keyframes fIn{from{opacity:0}to{opacity:1}}
.dlg-box{background:rgba(7,9,30,0.85);backdrop-filter:blur(44px) saturate(160%);border:1px solid rgba(79,142,247,0.52);border-radius:18px;width:100%;max-width:min(450px,calc(100vw - 32px));overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.09);animation:dPop .32s var(--spring);box-sizing:border-box}
@keyframes dPop{from{opacity:0;transform:scale(.88) translateY(22px)}to{opacity:1;transform:none}}
.dlg-hdr{padding:16px 20px 12px;border-bottom:1px solid rgba(79,142,247,0.18);display:flex;align-items:center;gap:11px;background:transparent}
.dlg-bar{width:4px;height:22px;border-radius:2px;flex-shrink:0}
.dlg-ttl{font-weight:700;font-size:.95rem;color:#fff}
.dlg-sub{font-size:.67rem;color:var(--muted);margin-top:2px}
.dlg-body{padding:16px 20px;display:flex;flex-direction:column;gap:12px;max-height:55vh;overflow-y:auto;background:transparent}
.dlg-foot{padding:12px 20px;border-top:1px solid rgba(79,142,247,0.15);display:flex;justify-content:flex-end;gap:8px;background:transparent}
.fld{display:flex;flex-direction:column;gap:6px}
.fld-lbl{font-size:.67rem;font-weight:600;color:rgba(180,210,255,0.75);letter-spacing:.08em;text-transform:uppercase}
.fld-inp{width:100%;padding:9px 12px;border-radius:10px;background:rgba(255,255,255,0.04);border:1px solid rgba(79,142,247,0.3);color:#fff;font-size:.84rem;font-family:var(--fb);transition:border-color .2s,box-shadow .2s;outline:none;box-sizing:border-box}
.fld-inp:focus{border-color:var(--blue);box-shadow:0 0 0 3px rgba(79,142,247,0.16)}
.fld-inp option{background:#0c1638}
.fld-hi{border-color:#f59e0b!important}
.fld-note{font-size:.66rem;margin-top:2px}
.btn-cancel{padding:8px 14px;border-radius:10px;border:1px solid rgba(79,142,247,0.25);background:none;color:rgba(180,210,255,0.7);cursor:pointer;font-size:.8rem;font-weight:600;transition:all .2s}
.btn-cancel:hover{border-color:rgba(255,255,255,0.25);color:#fff}
.btn-ok{padding:8px 16px;border-radius:10px;border:none;cursor:pointer;color:#fff;font-size:.8rem;font-weight:700;transition:all .25s var(--spring)}
.btn-ok:hover{transform:translateY(-1px);filter:brightness(1.12)}
.btn-ok:disabled{opacity:.6;cursor:not-allowed}
.btn-primary{background:linear-gradient(135deg,#4F8EF7,#7B5FFF);box-shadow:0 4px 16px rgba(79,142,247,0.35)}
.btn-success{background:linear-gradient(135deg,#34D399,#059669);box-shadow:0 4px 16px rgba(52,211,153,0.3)}
.btn-danger{background:linear-gradient(135deg,#EF4444,#DC2626);box-shadow:0 4px 16px rgba(239,68,68,0.3)}
.snack{position:fixed;bottom:22px;right:22px;z-index:2000;padding:11px 18px;border-radius:12px;font-size:.84rem;font-weight:600;box-shadow:0 8px 30px rgba(0,0,0,0.45);animation:snkIn .32s var(--spring)}
@keyframes snkIn{from{opacity:0;transform:translateY(16px) scale(.9)}to{opacity:1;transform:none}}
.snack-success{background:linear-gradient(135deg,#059669,#34D399);color:#fff}
.snack-error{background:linear-gradient(135deg,#DC2626,#EF4444);color:#fff}
.theme-toggle-wrap{display:flex;align-items:center;gap:6px;flex-shrink:0}
.theme-toggle-ico{font-size:.85rem;line-height:1;user-select:none;pointer-events:none;opacity:.8}
.theme-switch{position:relative;width:42px;height:23px;cursor:pointer;flex-shrink:0}
.theme-switch input{opacity:0;width:0;height:0;position:absolute}
.theme-switch-track{position:absolute;inset:0;border-radius:99px;background:rgba(30,60,180,0.4);border:1px solid rgba(80,140,230,0.5);transition:background .3s;box-shadow:inset 0 1px 3px rgba(0,0,0,0.35)}
.theme-switch-thumb{position:absolute;top:3px;left:3px;width:15px;height:15px;border-radius:50%;background:linear-gradient(135deg,#7eb3ff,#fff);box-shadow:0 1px 6px rgba(0,0,0,0.45);transition:transform .3s var(--spring)}
.theme-switch input:checked ~ .theme-switch-thumb{transform:translateX(19px)}
@media(max-width:1024px){.stats-row{grid-template-columns:repeat(2,1fr)}}
@media(max-width:768px){
  .root{padding:6px;height:100dvh}.page-card{padding:6px;gap:6px}
  .side{position:fixed;top:6px;left:6px;bottom:6px;border-radius:20px;transform:translateX(calc(-100% - 20px));background:rgba(5,8,28,0.97);backdrop-filter:blur(20px)}
  .side-open{transform:translateX(0)}.menu-btn{display:flex}
  .stats-row{grid-template-columns:repeat(2,1fr);gap:8px}
  .content{padding:0 8px 10px}.topbar{padding:0 8px;gap:6px}.topbar-title{font-size:.95rem}
  .user-name{display:none}.dashboard-bottom{flex-direction:column;overflow-y:auto}
  .side-cards-col{width:100%;flex-direction:row;overflow-y:visible;max-height:none}
  .side-card{flex:1}.module-panel{border-radius:14px}
}
@media(max-width:520px){
  .stats-row{grid-template-columns:1fr 1fr;gap:6px}.sc{padding:8px 10px}
  .sc-big{font-size:1.3rem}.sc-single{font-size:1.5rem}.sc-label{font-size:.48rem}.sc-icon{width:30px;height:30px}
  .fd-tbl th,.fd-tbl td{padding:8px 10px;font-size:.76rem}.topbar-title{font-size:.85rem}
}
@media(max-width:400px){
  .stats-row{grid-template-columns:1fr}.side-cards-col{flex-direction:column}
  .dlg-box{border-radius:18px 18px 0 0;max-width:100%}.dlg-ov{align-items:flex-end;padding:0}
}
`;