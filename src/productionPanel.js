import { TECHNICAL_SHEETS, EXCLUDED_SEWING_PRODUCTS } from './productionData.js';

const fmt = (n) => Number.isInteger(n) ? String(n) : Number(n.toFixed(3)).toString();
const norm = (s) => String(s || '').trim().toUpperCase();
const ignored = new Set(EXCLUDED_SEWING_PRODUCTS.map(norm));

const MATERIAL_LABELS = {
  linhaZigM:'LINHA — ZIG', linhaRetaM:'LINHA — RETA',
  vies:'VIÉS', fitaRigida:'FITA RÍGIDA', elastico:'ELÁSTICO', pompom:'POMPOM',
  elasticoRaboDeGato:'ELÁSTICO RABO DE GATO', cordasPoliester:'CORDAS POLIÉSTER', elasticoFF:'ELÁSTICO FF',
  gorgurao:'GORGURÃO', poliester:'POLIESTER', cadarco:'CADARÇO',
  mosquetao:'MOSQUETÃO', fecho:'FECHO', passador:'PASSADOR', meiaArgola:'MEIA ARGOLA',
  reguladorFocinhoPorco:'REGULADOR FOCINHO DE PORCO', etiqueta:'ETIQUETA', velcro:'VELCRO',
  borrachaElastico:'BORRACHA ELÁSTICO', espuma:'ESPUMA', plasticoTransparente:'PLÁSTICO TRANSPARENTE',
  forroTermico:'FORRO TÉRMICO', forroImpermeavel:'FORRO IMPERMEÁVEL', plasticoDuro:'PLÁSTICO DURO',
  telaBolso:'TELA DE BOLSO', forroMatelace:'FORRO MATELACÊ'
};

function getActive(){
  try{
    const lists=JSON.parse(localStorage.getItem('almox-lists')||'[]');
    const id=localStorage.getItem('almox-current')||'';
    return lists.find(l=>String(l?.id)===String(id)) || null;
  }catch{return null}
}

function calculate(active){
  const grouped=new Map();
  const missing=[];
  const items=Object.values(active?.items||{}).filter(v=>v&&v.product&&!ignored.has(norm(v.product)));
  const add=(material,spec,color,qty,product)=>{
    if(!qty || !Number.isFinite(Number(qty))) return;
    const key=[material,spec||'',color||''].join('|');
    const cur=grouped.get(key)||{material,spec:spec||'',color:color||'',qty:0,products:new Map()};
    cur.qty+=Number(qty);
    cur.products.set(product,(cur.products.get(product)||0)+Number(qty));
    grouped.set(key,cur);
  };
  for(const item of items){
    const sheet=TECHNICAL_SHEETS[item.product];
    const qty=Number(item.total)||0;
    if(!sheet){missing.push(item.product);continue;}
    if(!Object.keys(sheet).length){missing.push(item.product);continue;}
    const productColor=item.color||'SEM COR';
    if(sheet.linhaZigM!=null)add('LINHA','ZIG',productColor,sheet.linhaZigM*qty,item.product);
    if(sheet.linhaRetaM!=null)add('LINHA','RETA',productColor,sheet.linhaRetaM*qty,item.product);
    for(const [k,v] of Object.entries(sheet)){
      if(k==='linhaZigM'||k==='linhaRetaM') continue;
      if(k.startsWith('ziper')){const size=k.replace('ziper','');add('ZÍPER',size,productColor,Number(v)*qty,item.product);continue;}
      if(['fitaRigida','elastico','vies','pompom','elasticoRaboDeGato','cordasPoliester','elasticoFF','gorgurao','poliester','cadarco'].includes(k)){
        if(v&&v.cmPeca!=null)add(MATERIAL_LABELS[k],v.largura!=null?`LARG. ${fmt(v.largura)}`:'',productColor,Number(v.cmPeca)*qty,item.product);
        continue;
      }
      if(['mosquetao','fecho','passador','meiaArgola'].includes(k)){
        for(const [componentColor,count] of Object.entries(v||{})) add(MATERIAL_LABELS[k],'',componentColor,Number(count)*qty,item.product);
        continue;
      }
      const label=MATERIAL_LABELS[k]||k.toUpperCase();
      const unit = k==='velcro' || k==='espuma' ? 'CM/PEÇA' : 'UN/PEÇA';
      add(label,unit,productColor,Number(v)*qty,item.product);
    }
  }
  return {rows:[...grouped.values()].sort((a,b)=>a.material.localeCompare(b.material)||a.spec.localeCompare(b.spec)||a.color.localeCompare(b.color)),missing:[...new Set(missing)]};
}

function style(){
 if(document.getElementById('production-style'))return;
 const s=document.createElement('style');s.id='production-style';s.textContent=`
 #production-launch{position:fixed;right:16px;bottom:18px;z-index:9990;border:0;border-radius:16px;padding:13px 17px;background:#1769e0;color:#fff;font-weight:800;box-shadow:0 8px 25px #0003;cursor:pointer}
 #production-overlay{display:none;position:fixed;inset:0;z-index:10000;background:#0008;overflow:auto;padding:18px;box-sizing:border-box}
 #production-panel{max-width:1100px;margin:0 auto;background:#fff;color:#172033;border-radius:22px;min-height:calc(100vh - 36px);box-shadow:0 20px 60px #0005;overflow:hidden}
 .prod-head{padding:20px 22px;border-bottom:1px solid #e7ebf1;display:flex;align-items:center;justify-content:space-between;gap:12px;position:sticky;top:0;background:#fff;z-index:2}
 .prod-head small{color:#667085;font-weight:800}.prod-head h2{margin:3px 0 0;font-size:24px}.prod-close{border:0;background:#eef2f7;border-radius:12px;font-size:22px;width:42px;height:42px;cursor:pointer}
 .prod-tabs{display:flex;gap:8px;padding:12px 18px;border-bottom:1px solid #e7ebf1;overflow:auto}.prod-tab{border:0;background:#eef2f7;border-radius:12px;padding:11px 15px;font-weight:800;white-space:nowrap;cursor:pointer}.prod-tab.active{background:#1769e0;color:#fff}
 .prod-body{padding:18px}.prod-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px}.prod-stat{padding:15px;border:1px solid #e2e7ef;border-radius:16px;background:#f8fafc}.prod-stat span{display:block;color:#667085;font-size:13px}.prod-stat b{display:block;font-size:25px;margin-top:3px}.prod-card{border:1px solid #e2e7ef;border-radius:16px;margin:10px 0;overflow:hidden}.prod-card h3{margin:0;padding:14px 15px;background:#f8fafc;font-size:15px}.prod-table{width:100%;border-collapse:collapse}.prod-table th,.prod-table td{text-align:left;padding:10px 12px;border-top:1px solid #edf0f4;font-size:13px}.prod-table th{font-size:12px;color:#667085}.prod-table td:last-child,.prod-table th:last-child{text-align:right}.prod-action{border:0;border-radius:12px;padding:12px 15px;font-weight:800;cursor:pointer;background:#1769e0;color:#fff}.prod-secondary{background:#eef2f7;color:#172033}.prod-toolbar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:15px}.prod-note{padding:12px 14px;background:#fff7e6;border:1px solid #f0d59b;border-radius:12px;margin:10px 0;color:#6b4d00}.prod-ok{padding:12px 14px;background:#edf9f0;border:1px solid #b8dfc0;border-radius:12px;margin:10px 0}.prod-empty{padding:30px;text-align:center;color:#667085}.prod-product{display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid #edf0f4}.prod-product:last-child{border-bottom:0}.prod-muted{color:#667085}.prod-print-title{display:none}
 .app.dark ~ #production-overlay{color:#eef2f7}.app.dark ~ #production-overlay #production-panel{background:#18202d;color:#eef2f7}.app.dark ~ #production-overlay .prod-head{background:#18202d;border-color:#2b3442}.app.dark ~ #production-overlay .prod-card,.app.dark ~ #production-overlay .prod-stat{border-color:#2b3442;background:#202938}.app.dark ~ #production-overlay .prod-card h3,.app.dark ~ #production-overlay .prod-stat{background:#202938}.app.dark ~ #production-overlay .prod-table th,.app.dark ~ #production-overlay .prod-table td{border-color:#2b3442}.app.dark ~ #production-overlay .prod-tabs{border-color:#2b3442}
 @media(max-width:700px){.prod-stats{grid-template-columns:1fr 1fr}.prod-body{padding:12px}.prod-head{padding:15px}.prod-table{font-size:12px}.prod-table th,.prod-table td{padding:8px}.prod-table th:nth-child(4),.prod-table td:nth-child(4){display:none}}
 @media print{body>*:not(#production-overlay){display:none!important}#production-overlay{display:block!important;position:static;padding:0;background:#fff}#production-panel{box-shadow:none;border-radius:0;min-height:0;max-width:none}.prod-head,.prod-tabs,.prod-toolbar,.prod-note,.prod-ok{display:none!important}.prod-body{padding:0}.prod-print-title{display:block;text-align:center;margin-bottom:16px}.prod-card{break-inside:avoid}.prod-launch{display:none!important}}
 `;document.head.appendChild(s);
}

function render(tab='materiais'){
 const overlay=document.getElementById('production-overlay'); if(!overlay)return;
 const panel=overlay.querySelector('#production-panel'); const active=getActive();
 const result=calculate(active||{items:{}});
 const items=Object.values(active?.items||{}).filter(v=>v&&v.product&&!ignored.has(norm(v.product)));
 const total=items.reduce((s,v)=>s+(Number(v.total)||0),0);
 const products=new Map();items.forEach(v=>products.set(v.product,(products.get(v.product)||0)+Number(v.total||0)));
 let body='';
 if(tab==='producao'){
   body=`<div class="prod-stats"><div class="prod-stat"><span>LISTA</span><b>${active?.name||'Nenhuma'}</b></div><div class="prod-stat"><span>UNIDADES</span><b>${fmt(total)}</b></div><div class="prod-stat"><span>PRODUTOS</span><b>${products.size}</b></div></div><div class="prod-card"><h3>ITENS ENVIADOS PARA PRODUÇÃO</h3>${items.length?'<div style="padding:10px 15px">'+[...products].sort().map(([p,q])=>`<div class="prod-product"><span>${p}</span><b>${fmt(q)}</b></div>`).join('')+'</div>':'<div class="prod-empty">A Aba 1 ainda não possui itens nesta lista.</div>'}</div>`;
 } else if(tab==='relatorio'){
   body=`<div class="prod-print-title"><h1>RELATÓRIO DE SEPARAÇÃO DE MATERIAIS</h1><div>${active?.name||'Lista'} · ${new Date().toLocaleDateString('pt-BR')}</div></div><div class="prod-toolbar"><button class="prod-action" id="prod-print">🖨️ IMPRIMIR RELATÓRIO</button><button class="prod-action prod-secondary" id="prod-refresh">↻ ATUALIZAR</button></div>${result.rows.length?result.rows.map(r=>`<div class="prod-card"><h3>${r.material}${r.spec?` — ${r.spec}`:''} ${r.color?`· ${r.color}`:''}</h3><table class="prod-table"><thead><tr><th>PRODUTO</th><th>COR</th><th>QTD.</th><th>PARCIAL</th></tr></thead><tbody>${[...r.products].sort().map(([p,q])=>`<tr><td>${p}</td><td>${items.find(x=>x.product===p)?.color||r.color||'—'}</td><td>${fmt(q)}</td><td>${fmt(q)}</td></tr>`).join('')}</tbody><tfoot><tr><th colspan="2">TOTAL</th><th colspan="2">${fmt(r.qty)}</th></tr></tfoot></table></div>`).join(''):'<div class="prod-empty">Não há consumo calculado para esta lista.</div>'}`;
 } else {
   body=`<div class="prod-toolbar"><button class="prod-action" id="prod-report">📄 VER RELATÓRIO COMPLETO</button><button class="prod-action prod-secondary" id="prod-refresh">↻ ATUALIZAR</button></div>${result.missing.length?`<div class="prod-note"><b>ATENÇÃO:</b> ${result.missing.join(', ')} ${result.missing.length===1?'não possui':'não possuem'} ficha técnica completa na base importada. O sistema não vai inventar consumo para esses itens.</div>`:''}${result.rows.length?'<div class="prod-card"><h3>RESUMO AGRUPADO — MATERIAL × ESPECIFICAÇÃO × COR</h3><table class="prod-table"><thead><tr><th>MATERIAL</th><th>ESPECIFICAÇÃO</th><th>COR</th><th>TOTAL</th></tr></thead><tbody>'+result.rows.map(r=>`<tr><td>${r.material}</td><td>${r.spec||'—'}</td><td>${r.color||'—'}</td><td><b>${fmt(r.qty)}</b></td></tr>`).join('')+'</tbody></table></div>':'<div class="prod-empty">Nenhum material calculado. Lance itens na Aba 1 para gerar o consumo.</div>'}`;
 }
 panel.querySelector('.prod-body').innerHTML=body;
 panel.querySelectorAll('.prod-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 const refresh=panel.querySelector('#prod-refresh'); if(refresh)refresh.onclick=()=>render(tab);
 const report=panel.querySelector('#prod-report'); if(report)report.onclick=()=>render('relatorio');
 const print=panel.querySelector('#prod-print'); if(print)print.onclick=()=>window.print();
}

function mount(){
 if(document.getElementById('production-launch'))return;
 style();
 const btn=document.createElement('button');btn.id='production-launch';btn.textContent='🏭 PRODUÇÃO';btn.onclick=()=>{document.getElementById('production-overlay').style.display='block';render('materiais')};document.body.appendChild(btn);
 const overlay=document.createElement('div');overlay.id='production-overlay';overlay.innerHTML=`<div id="production-panel"><div class="prod-head"><div><small>WORKNEO · PRODUÇÃO</small><h2>Planejamento e separação de materiais</h2></div><button class="prod-close" id="prod-close">×</button></div><div class="prod-tabs"><button class="prod-tab active" data-tab="materiais">📦 Materiais</button><button class="prod-tab" data-tab="producao">🏭 Produção</button><button class="prod-tab" data-tab="relatorio">📄 Relatório</button></div><div class="prod-body"></div></div>`;document.body.appendChild(overlay);
 overlay.querySelector('#prod-close').onclick=()=>overlay.style.display='none';
 overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.style.display='none'});
 overlay.querySelectorAll('.prod-tab').forEach(b=>b.onclick=()=>render(b.dataset.tab));
}
window.addEventListener('DOMContentLoaded',mount);setTimeout(mount,500);
`;
document.head.appendChild(s);
}

function gate(){
 const b=document.getElementById('production-launch');
 if(b)b.style.display=localStorage.getItem('almox-session')==='1'?'block':'none';
}
window.addEventListener('storage',gate);setInterval(gate,1000);
