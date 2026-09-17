import { TECHNICAL_SHEETS, EXCLUDED_SEWING_PRODUCTS } from './productionData.js';

// Correção final do relatório consolidado da Costura.
// Remove cópias idênticas do mesmo envio, consolida por DATA + COSTUREIRA + PEDIDO
// e mantém cada pedido identificável dentro do mesmo relatório.
(function(){
  const LOTS_KEY='workneo-costura-lotes-v2';
  const ignored=new Set(EXCLUDED_SEWING_PRODUCTS.map(s=>String(s).trim().toUpperCase()));
  const norm=s=>String(s??'').trim().toUpperCase();
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>{const x=Number(n);if(!Number.isFinite(x))return '0';return Number.isInteger(x)?String(x):x.toFixed(2).replace(/\.00$/,'')};
  const dateBR=s=>{const v=String(s||'');return v.includes('-')?v.split('-').reverse().join('/'):v};
  const LABELS={linhaZigM:'LINHA — ZIG',linhaRetaM:'LINHA — RETA',fitaRigida:'FITA RÍGIDA',elastico:'ELÁSTICO',vies:'VIÉS',pompom:'POMPOM',elasticoRaboDeGato:'ELÁSTICO RABO DE GATO',cordasPoliester:'CORDAS POLIÉSTER',elasticoFF:'ELÁSTICO FF',gorgurao:'GORGURÃO',poliester:'POLIÉSTER',cadarco:'CADARÇO',mosquetao:'MOSQUETÃO',fecho:'FECHO',passador:'PASSADOR',meiaArgola:'MEIA ARGOLA',reguladorFocinhoPorco:'REGULADOR FOCINHO DE PORCO',etiqueta:'ETIQUETA',velcro:'VELCRO',borrachaElastico:'BORRACHA',espuma:'ESPUMA',plasticoTransparente:'PLÁSTICO TRANSPARENTE',forroTermico:'FORRO TÉRMICO',forroImpermeavel:'FORRO IMPERMEÁVEL',plasticoDuro:'PLÁSTICO DURO',telaBolso:'TELA DE BOLSO',forroMatelace:'FORRO MATELACÊ'};
  const METER=new Set(['fitaRigida','elastico','vies','pompom','elasticoRaboDeGato','cordasPoliester','elasticoFF','gorgurao','poliester','cadarco']);
  const HARDWARE=new Set(['mosquetao','fecho','passador','meiaArgola']);
  const readLots=()=>{try{const x=JSON.parse(localStorage.getItem(LOTS_KEY)||'[]');return Array.isArray(x)?x:[]}catch(_){return[]}};
  const lotKey=l=>[String(l?.date||''),norm(l?.costureira),String(l?.pedido||'').trim()].join('|');
  const exactKey=l=>JSON.stringify({date:String(l?.date||''),costureira:norm(l?.costureira),pedido:String(l?.pedido||'').trim(),listId:String(l?.listId||''),listName:String(l?.listName||''),items:(l?.items||[]).map(x=>({product:String(x?.product||''),color:String(x?.color||''),qty:Number(x?.qty)||0}))});
  function cleanLots(lots,selected){
    const seen=new Set(),unique=[];
    for(const l of lots){if(selected!=='TODAS'&&norm(l?.costureira)!==norm(selected))continue;const k=exactKey(l);if(seen.has(k))continue;seen.add(k);unique.push(l)}
    const grouped=new Map();
    for(const l of unique){const k=lotKey(l);let g=grouped.get(k);if(!g){g={...l,items:[]};grouped.set(k,g)}for(const x of (l.items||[])){if(!x?.product||Number(x.qty)<=0)continue;const ik=norm(x.product)+'|'+norm(x.color||'SEM COR');const old=g.items.find(y=>norm(y.product)+'|'+norm(y.color||'SEM COR')===ik);if(old)old.qty=Number(old.qty||0)+Number(x.qty||0);else g.items.push({...x,qty:Number(x.qty)||0})}}
    return [...grouped.values()].filter(l=>l.items.length).sort((a,b)=>String(a.date||'').localeCompare(String(b.date||''))||String(a.pedido||'').localeCompare(String(b.pedido||'')));
  }
  function calculate(items){
    const grouped=new Map(),missing=new Set();
    const add=(material,spec,color,qty,unit='UN')=>{const amount=Number(qty);if(!Number.isFinite(amount)||amount===0)return;const key=[material,spec||'',color||'',unit].join('|');let r=grouped.get(key);if(!r){r={material,spec:spec||'',color:color||'',qty:0,unit};grouped.set(key,r)}r.qty+=amount};
    for(const item of items){const product=String(item.product||'').trim();if(!product||ignored.has(norm(product)))continue;const sheet=TECHNICAL_SHEETS[product],qty=Number(item.qty)||0;if(!sheet||!Object.keys(sheet).length){missing.add(product);continue}const color=item.color||'SEM COR';
      if(sheet.linhaZigM!=null)add('LINHA','ZIG',color,Number(sheet.linhaZigM)*qty,'M');
      if(sheet.linhaRetaM!=null)add('LINHA','RETA',color,Number(sheet.linhaRetaM)*qty,'M');
      for(const [key,value] of Object.entries(sheet)){
        if(key==='linhaZigM'||key==='linhaRetaM')continue;
        if(key.startsWith('ziper')){add('ZÍPER',key.replace('ziper',''),color,Number(value)*qty,'UN');continue}
        if(METER.has(key)){if(value&&value.cmPeca!=null){const spec=value.largura!=null?`LARG. ${fmt(value.largura)} · ${fmt(value.cmPeca)} CM/PEÇA`:`${fmt(value.cmPeca)} CM/PEÇA`;add(LABELS[key]||key.toUpperCase(),spec,color,(Number(value.cmPeca)*qty)/100,'M')}continue}
        if(HARDWARE.has(key)){for(const [c,n] of Object.entries(value||{}))add(LABELS[key],'',c,Number(n)*qty,'UN');continue}
        if(key==='etiqueta'){add('ETIQUETA','1 UN/PEÇA','',Number(value)*qty,'UN');continue}
        add(LABELS[key]||key.toUpperCase(),'UN/PEÇA',color,Number(value)*qty,'UN');
      }
    }
    return {rows:[...grouped.values()].sort((a,b)=>`${a.material}|${a.spec}|${a.color}`.localeCompare(`${b.material}|${b.spec}|${b.color}`)),missing:[...missing]};
  }
  function matrix(rows){
    const hardware=rows.filter(r=>HARDWARE.has(Object.keys(LABELS).find(k=>LABELS[k]===r.material)||''));
    const general=rows.filter(r=>!r.color&&!hardware.includes(r));
    const colorRows=rows.filter(r=>r.color&&!hardware.includes(r));
    const colors=[...new Set(colorRows.map(r=>r.color).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    const map=new Map();
    for(const r of colorRows){const k=`${r.material}|${r.spec}|${r.unit}`;let g=map.get(k);if(!g){g={material:r.material,spec:r.spec,unit:r.unit,byColor:new Map()};map.set(k,g)}g.byColor.set(r.color,(g.byColor.get(r.color)||0)+r.qty)}
    return {colors,groups:[...map.values()],hardware,general};
  }
  function patch(){
    const panel=document.getElementById('production-panel'),report=panel&&panel.querySelector('.report-onepage');if(!report)return;
    const sel=panel.querySelector('#report-seamstress'),selected=sel?sel.value:'TODAS';
    const lots=cleanLots(readLots(),selected);if(!lots.length)return;
    const items=lots.flatMap(l=>(l.items||[]).filter(x=>x&&x.product&&Number(x.qty)>0).map(x=>({...x,__lot:l})));
    const result=calculate(items),mx=matrix(result.rows),total=items.reduce((s,x)=>s+(Number(x.qty)||0),0);
    const lists=[...new Set(lots.map(l=>l.listName).filter(Boolean))],dates=[...new Set(lots.map(l=>dateBR(l.date)).filter(Boolean))],orders=[...new Set(lots.map(l=>String(l.pedido||'').trim()).filter(Boolean))];
    const info=report.querySelectorAll('.report-info-value');
    if(info.length>=4){info[0].textContent=selected==='TODAS'?'TODAS AS COSTUREIRAS':(lots[0].costureira||selected||'—');info[1].textContent=lists.join(' · ')||'—';info[2].textContent=dates.join(' · ')||'—';info[3].textContent=fmt(total)}
    const metas=report.querySelectorAll('.report-meta');
    if(metas.length>=2){metas[0].innerHTML='COSTUREIRA: <b>'+esc(selected==='TODAS'?'TODAS AS COSTUREIRAS':(lots[0].costureira||selected||'—'))+'</b> · LISTAS: <b>'+esc(lists.join(' · ')||'—')+'</b>';metas[1].innerHTML='LOTES / DATAS: <b>'+esc(dates.join(' · ')||'—')+'</b> · PEDIDOS: <b>'+esc(orders.join(' · ')||'—')+'</b><br>PEÇAS: <b>'+fmt(total)+'</b>'}
    const products=report.querySelector('table.products');
    if(products){const h=products.querySelector('thead tr'),b=products.querySelector('tbody');if(h)h.innerHTML='<th>PRODUTO</th><th>QTD.</th><th>COR</th><th>LOTE / DATA</th><th>NÚMERO DO PEDIDO</th>';const pm=new Map();for(const x of items){const k=[norm(x.product),norm(x.color||'SEM COR'),String(x.__lot.date||''),String(x.__lot.pedido||'').trim()].join('|');const old=pm.get(k);if(old)old.qty+=Number(x.qty)||0;else pm.set(k,{product:x.product,color:x.color||'SEM COR',date:x.__lot.date,pedido:x.__lot.pedido,qty:Number(x.qty)||0})}const out=[...pm.values()];if(b)b.innerHTML=out.map(x=>`<tr><td>${esc(x.product)}</td><td>${fmt(x.qty)}</td><td>${esc(x.color)}</td><td>${esc(dateBR(x.date)||'—')}</td><td class="order-number" data-costura-order="1">${esc(x.pedido||'—')}</td></tr>`).join('')}
    const table=report.querySelector('table.matrix');if(table){const h=table.querySelector('thead tr'),b=table.querySelector('tbody');if(h)h.innerHTML='<th>MATERIAL / ESPECIFICAÇÃO</th>'+mx.colors.map(c=>`<th>${esc(c)}</th>`).join('')+'<th>TOTAL</th>';if(b)b.innerHTML=mx.groups.length?mx.groups.map(g=>{const t=[...g.byColor.values()].reduce((s,v)=>s+v,0);return `<tr><td>${esc(g.material)}${g.spec?` — ${esc(g.spec)}`:''} <small>(${esc(g.unit)})</small></td>`+mx.colors.map(c=>`<td>${g.byColor.has(c)?fmt(g.byColor.get(c)):'—'}</td>`).join('')+`<td class="total">${fmt(t)}</td></tr>`}).join(''):`<tr><td colspan="${mx.colors.length+2}">Nenhum material por cor calculado.</td></tr>`}
    const two=report.querySelectorAll('.two-col');if(two.length){const ts=two[0].querySelectorAll('table');if(ts[0])ts[0].querySelector('tbody').innerHTML=mx.hardware.length?mx.hardware.map(r=>`<tr><td>${esc(r.material)}${r.color?' · '+esc(r.color):''}</td><td>${fmt(r.qty)} ${esc(r.unit)}</td></tr>`).join(''):'<tr><td colspan="2">Nenhuma ferragem.</td></tr>';if(ts[1])ts[1].querySelector('tbody').innerHTML=mx.general.length?mx.general.map(r=>`<tr><td>${esc(r.material)}${r.spec?' — '+esc(r.spec):''}</td><td>${fmt(r.qty)} ${esc(r.unit)}</td></tr>`).join(''):'<tr><td colspan="2">Nenhum.</td></tr>'}
    const warn=report.querySelector('.warn');if(warn)warn.outerHTML=result.missing.length?`<div class="warn"><b>FICHAS TÉCNICAS INCOMPLETAS:</b> ${result.missing.map(esc).join(', ')}. Consumo não inventado.</div>`:'';
  }
  function boot(){setInterval(patch,700);setTimeout(patch,250)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
