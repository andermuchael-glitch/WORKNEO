const PERIOD_KEY = 'workneo-costureiras-relatorio-v1';
const EXCLUDED = new Set(['MÁSCARA PROTETORA','MOUSE PAD','MOUSE PAD GAMER','PORTA COPOS']);
const norm = (s) => String(s || '').trim().toUpperCase();
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = (n) => { const x = Number(n); if (!Number.isFinite(x)) return '0'; return Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/\.00$/, ''); };
const dateOnly = (iso) => { const d = new Date(iso); if (Number.isNaN(d.getTime())) return ''; return d.toISOString().slice(0,10); };

function readAssignments(){ try { const v=JSON.parse(localStorage.getItem(PERIOD_KEY)||'[]'); return Array.isArray(v)?v:[]; } catch(_) { return []; } }
function productionEntries(){
  return readAssignments().filter(a => a && a.product && !EXCLUDED.has(norm(a.product)) && Number(a.qty)>0 && dateOnly(a.createdAt));
}
function today(){ return new Date().toISOString().slice(0,10); }
function monthStart(){ const d=new Date(); d.setDate(1); return d.toISOString().slice(0,10); }
function addStyle(){
  if(document.getElementById('period-report-style')) return;
  const s=document.createElement('style'); s.id='period-report-style'; s.textContent=`
    .pr-wrap{font-family:Arial,sans-serif;color:#172033}.pr-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}.pr-head h2{margin:0;font-size:22px}.pr-kicker{font-size:11px;font-weight:900;color:#1769e0;letter-spacing:.5px;margin-bottom:4px}.pr-sub{margin:4px 0 0;color:#667085;font-size:12px}.pr-actions{display:flex;gap:8px;flex-wrap:wrap}.pr-btn{border:0;border-radius:11px;padding:10px 13px;font-weight:800;cursor:pointer;background:#1769e0;color:#fff}.pr-btn.secondary{background:#eef2f7;color:#172033}.pr-filters{display:grid;grid-template-columns:1fr 1fr auto;gap:10px;padding:14px;background:#f8fafc;border:1px solid #e2e7ef;border-radius:15px;margin-bottom:14px;align-items:end}.pr-field label{display:block;font-size:10px;font-weight:900;color:#667085;margin-bottom:5px}.pr-field input{width:100%;box-sizing:border-box;border:1px solid #cfd6e2;border-radius:10px;padding:10px;background:#fff;font-size:14px}.pr-stat{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px}.pr-stat-card{border:1px solid #e2e7ef;border-radius:14px;padding:13px 15px;background:#fff}.pr-stat-card span{display:block;font-size:10px;color:#667085;font-weight:900;text-transform:uppercase}.pr-stat-card b{display:block;font-size:25px;margin-top:3px}.pr-card{border:1px solid #e2e7ef;border-radius:15px;overflow:hidden;background:#fff}.pr-card h3{margin:0;padding:12px 14px;background:#f8fafc;font-size:14px}.pr-table{width:100%;border-collapse:collapse;table-layout:fixed}.pr-table th,.pr-table td{border-top:1px solid #edf0f4;padding:9px 12px;font-size:13px}.pr-table th{font-size:11px;color:#667085;text-align:left}.pr-table th:last-child,.pr-table td:last-child{text-align:right}.pr-total{font-weight:900;background:#f8fafc}.pr-empty{padding:30px;text-align:center;color:#667085}.pr-note{margin-top:10px;font-size:11px;color:#667085}.pr-print-title{display:none}
    @media(max-width:700px){.pr-head{display:block}.pr-actions{margin-top:10px}.pr-filters{grid-template-columns:1fr 1fr}.pr-filters .pr-btn{grid-column:1/-1}.pr-stat{grid-template-columns:1fr}.pr-table th,.pr-table td{padding:8px 7px}}
    @media print{body>*:not(#production-overlay){display:none!important}#production-overlay{display:block!important;position:static!important;background:#fff!important;padding:0!important}#production-panel{box-shadow:none!important;border-radius:0!important;min-height:0!important;max-width:none!important;overflow:visible!important}.prod-head,.prod-tabs,.prod-toolbar,.pr-actions,.pr-filters,.pr-note{display:none!important}.prod-body{padding:0!important}.pr-wrap{font-size:11px}.pr-print-title{display:block;border-bottom:2px solid #172033;padding-bottom:7px;margin-bottom:9px}.pr-print-title h1{font-size:19px;margin:0 0 3px}.pr-print-title p{margin:0;font-size:10px}.pr-stat-card{padding:10px}.pr-stat-card b{font-size:20px}.pr-table th,.pr-table td{padding:6px 7px}.pr-card h3{padding:8px}.pr-wrap{break-inside:avoid}}
  `; document.head.appendChild(s);
}
function renderPeriodReport(){
  const panel=document.getElementById('production-panel'); if(!panel) return;
  const body=panel.querySelector('.prod-body'); if(!body) return;
  addStyle();
  const entries=productionEntries();
  const minDate=entries.reduce((m,e)=>!m||dateOnly(e.createdAt)<m?dateOnly(e.createdAt):m,'');
  const maxDate=entries.reduce((m,e)=>!m||dateOnly(e.createdAt)>m?dateOnly(e.createdAt):m,'');
  const defaultFrom=monthStart(); const defaultTo=today();
  body.innerHTML=`<div class="pr-wrap">
    <div class="pr-head"><div><div class="pr-kicker">CONTROLE DE PRODUÇÃO</div><h2>RELATÓRIO DE PEÇAS POR PERÍODO</h2><p class="pr-sub">Totaliza produtos iguais independentemente da cor. Ex.: 100 Marinho + 250 Preto + 50 Vermelho + 25 Royal = <b>425 Porta Moedas</b>.</p></div><div class="pr-actions"><button class="pr-btn secondary" id="pr-back">← VOLTAR</button><button class="pr-btn" id="pr-print">🖨️ IMPRIMIR</button></div></div>
    <div class="pr-filters"><div class="pr-field"><label>DATA INICIAL</label><input id="pr-from" type="date" value="${defaultFrom}"></div><div class="pr-field"><label>DATA FINAL</label><input id="pr-to" type="date" value="${defaultTo}"></div><button class="pr-btn" id="pr-filter">APLICAR PERÍODO</button></div>
    <div id="pr-content"></div>
  </div>`;
  const from=body.querySelector('#pr-from'), to=body.querySelector('#pr-to');
  function draw(){
    let start=from.value||minDate||defaultFrom, end=to.value||maxDate||defaultTo;
    if(start>end){const t=start;start=end;end=t;from.value=start;to.value=end;}
    const filtered=entries.filter(e=>{const d=dateOnly(e.createdAt);return d>=start&&d<=end;});
    const map=new Map();
    filtered.forEach(e=>{const p=String(e.product).trim();map.set(p,(map.get(p)||0)+(Number(e.qty)||0));});
    const rows=[...map.entries()].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
    const total=rows.reduce((s,r)=>s+r[1],0);
    const uniqueDays=new Set(filtered.map(e=>dateOnly(e.createdAt))).size;
    const periodLabel=`${start.split('-').reverse().join('/')} a ${end.split('-').reverse().join('/')}`;
    let html=`<div class="pr-print-title"><h1>WORKNEO — RELATÓRIO DE PEÇAS PRODUZIDAS</h1><p>Período: ${esc(periodLabel)}</p></div>`;
    html+=`<div class="pr-stat"><div class="pr-stat-card"><span>Total de peças no período</span><b>${fmt(total)} UN</b></div><div class="pr-stat-card"><span>Produtos diferentes</span><b>${fmt(rows.length)}</b></div></div>`;
    html+=`<div class="pr-card"><h3>QUANTIDADE POR PRODUTO — CORES SOMADAS</h3>`;
    if(!rows.length) html+='<div class="pr-empty">Nenhuma produção registrada neste período.</div>';
    else { html+='<table class="pr-table"><thead><tr><th>PRODUTO</th><th>QUANTIDADE PRODUZIDA</th></tr></thead><tbody>';rows.forEach(([p,q])=>html+=`<tr><td><b>${esc(p)}</b></td><td><b>${fmt(q)} UN</b></td></tr>`);html+=`<tr class="pr-total"><td>TOTAL GERAL DO PERÍODO</td><td>${fmt(total)} UN</td></tr></tbody></table>`; }
    html+='</div><div class="pr-note">Período consultado: '+esc(periodLabel)+' · Dias com registros: '+fmt(uniqueDays)+'. A quantidade é consolidada por produto, sem separar as cores.</div>';
    body.querySelector('#pr-content').innerHTML=html;
  }
  body.querySelector('#pr-filter').onclick=draw;
  body.querySelector('#pr-print').onclick=()=>window.print();
  body.querySelector('#pr-back').onclick=()=>{const tab=panel.querySelector('.prod-tab[data-tab="producao"]')||panel.querySelector('.prod-tab[data-tab="materiais"]');if(tab)tab.click();};
  draw();
}
function install(){
  const panel=document.getElementById('production-panel'); if(!panel) return;
  const toolbar=panel.querySelector('.prod-toolbar'); if(!toolbar) return;
  if(toolbar.querySelector('#pr-period-button')) return;
  const b=document.createElement('button'); b.id='pr-period-button'; b.className='prod-action prod-secondary'; b.textContent='📈 PEÇAS POR PERÍODO'; b.title='Somar produtos iguais por período, ignorando as cores'; b.onclick=renderPeriodReport; toolbar.appendChild(b);
}
function boot(){ install(); new MutationObserver(()=>requestAnimationFrame(install)).observe(document.body,{childList:true,subtree:true}); }
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
