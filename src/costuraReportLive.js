import { TECHNICAL_SHEETS, EXCLUDED_SEWING_PRODUCTS } from './productionData.js';

// Relatório consolidado da Costura: todos os lotes enviados para a costureira.
// Cada lote é identificado pela DATA; o NÚMERO DO PEDIDO identifica o pedido.
// Materiais são somados, mas cada pedido permanece identificado na tabela.
(function(){
  const LOTS_KEY='workneo-costura-lotes-v2';
  const ignored=new Set(EXCLUDED_SEWING_PRODUCTS.map(s=>String(s).trim().toUpperCase()));
  const norm=s=>String(s||'').trim().toUpperCase();
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>{const x=Number(n);if(!Number.isFinite(x))return '0';return Number.isInteger(x)?String(x):x.toFixed(2).replace(/\.00$/,'')};
  const dateBR=s=>{const v=String(s||'');return v.includes('-')?v.split('-').reverse().join('/'):v};
  const LABELS={linhaZigM:'LINHA — ZIG',linhaRetaM:'LINHA — RETA',fitaRigida:'FITA RÍGIDA',elastico:'ELÁSTICO',vies:'VIÉS',pompom:'POMPOM',elasticoRaboDeGato:'ELÁSTICO RABO DE GATO',cordasPoliester:'CORDAS POLIÉSTER',elasticoFF:'ELÁSTICO FF',gorgurao:'GORGURÃO',poliester:'POLIÉSTER',cadarco:'CADARÇO',mosquetao:'MOSQUETÃO',fecho:'FECHO',passador:'PASSADOR',meiaArgola:'MEIA ARGOLA',reguladorFocinhoPorco:'REGULADOR FOCINHO DE PORCO',etiqueta:'ETIQUETA',velcro:'VELCRO',borrachaElastico:'BORRACHA',espuma:'ESPUMA',plasticoTransparente:'PLÁSTICO TRANSPARENTE',forroTermico:'FORRO TÉRMICO',forroImpermeavel:'FORRO IMPERMEÁVEL',plasticoDuro:'PLÁSTICO DURO',telaBolso:'TELA DE BOLSO',forroMatelace:'FORRO MATELACÊ'};
  const METER=new Set(['fitaRigida','elastico','vies','pompom','elasticoRaboDeGato','cordasPoliester','elasticoFF','gorgurao','poliester','cadarco']);
  const HARDWARE=new Set(['mosquetao','fecho','passador','meiaArgola']);
  const readLots=()=>{try{const x=JSON.parse(localStorage.getItem(LOTS_KEY)||'[]');return Array.isArray(x)?x:[]}catch(_){return[]}};
  const lotSignature=l=>JSON.stringify({date:String(l?.date||''),costureira:norm(l?.costureira),pedido:String(l?.pedido||'').trim(),listId:String(l?.listId||''),listName:String(l?.listName||''),items:(l?.items||[]).map(x=>({product:String(x?.product||''),color:String(x?.color||''),qty:Number(x?.qty)||0})).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))});
  const uniqueLots=lots=>{const seen=new Set();return lots.filter(l=>{const k=lotSignature(l);if(seen.has(k))return false;seen.add(k);return true})};
  const calculateItems=items=>{
    const grouped=new Map(),missing=new Set();
    const add=(material,spec,color,qty,product,unit='UN')=>{const amount=Number(qty);if(!Number.isFinite(amount)||amount===0)return;const key=[material,spec||'',color||'',unit].join('|');let r=grouped.get(key);if(!r){r={material,spec:spec||'',color:color||'',qty:0,unit,products:new Map()};grouped.set(key,r)}r.qty+=amount;r.products.set(product,(r.products.get(product)||0)+amount)};
    for(const item of items){const product=String(item.product||'').trim();if(!product||ignored.has(norm(product)))continue;const sheet=TECHNICAL_SHEETS[product],qty=Number(item.qty??item.total)||0;if(!sheet||!Object.keys(sheet).length){missing.add(product);continue}const color=item.color||'SEM COR';
      if(sheet.linhaZigM!=null)add('LINHA','ZIG',color,Number(sheet.linhaZigM)*qty,product,'M');
      if(sheet.linhaRetaM!=null)add('LINHA','RETA',color,Number(sheet.linhaRetaM)*qty,product,'M');
      for(const [key,value] of Object.entries(sheet)){
        if(key==='linhaZigM'||key==='linhaRetaM')continue;
        if(key.startsWith('ziper')){add('ZÍPER',key.replace('ziper',''),color,Number(value)*qty,product,'UN');continue}
        if(METER.has(key)){if(value&&value.cmPeca!=null){const spec=value.largura!=null?`LARG. ${fmt(value.largura)} · ${fmt(value.cmPeca)} CM/PEÇA`:`${fmt(value.cmPeca)} CM/PEÇA`;add(LABELS[key]||key.toUpperCase(),spec,color,(Number(value.cmPeca)*qty)/100,product,'M')}continue}
        if(HARDWARE.has(key)){for(const [c,n] of Object.entries(value||{}))add(LABELS[key],'',c,Number(n)*qty,product,'UN');continue}
        if(key==='etiqueta'){add('ETIQUETA','1 UN/PEÇA','',Number(value)*qty,product,'UN');continue}
        add(LABELS[key]||key.toUpperCase(),'UN/PEÇA',color,Number(value)*qty,product,'UN');
      }
    }
    return {rows:[...grouped.values()].sort((a,b)=>`${a.material}|${a.spec}|${a.color}`.localeCompare(`${b.material}|${b.spec}|${b.color}`)),missing:[...missing]};
  };
  const buildMatrix=rows=>{
    const hardware=rows.filter(r=>HARDWARE.has(Object.keys(LABELS).find(k=>LABELS[k]===r.material)||''));
    const general=rows.filter(r=>!r.color&&!hardware.includes(r));
    const colorRows=rows.filter(r=>r.color&&!hardware.includes(r));
    const colors=[...new Set(colorRows.map(r=>r.color).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    const map=new Map();
    for(const r of colorRows){const key=`${r.material}|${r.spec}|${r.unit}`;let g=map.get(key);if(!g){g={material:r.material,spec:r.spec,unit:r.unit,byColor:new Map()};map.set(key,g)}g.byColor.set(r.color,(g.byColor.get(r.color)||0)+r.qty)}
    return {colors,groups:[...map.values()],hardware,general};
  };
  const lotsFor=(lots,selected)=>{
    const filtered=selected&&selected!=='TODAS'?lots.filter(l=>norm(l.costureira)===norm(selected)):lots.slice();
    return uniqueLots(filtered).filter(l=>Array.isArray(l.items)&&l.items.some(i=>i&&i.product&&Number(i.qty)>0))
      .sort((a,b)=>String(a.date||a.createdAt).localeCompare(String(b.date||b.createdAt))||String(a.createdAt||'').localeCompare(String(b.createdAt||'')));
  };
  function patch(){
    const panel=document.getElementById('production-panel'),report=panel&&panel.querySelector('.report-onepage');if(!report)return;
    const sel=panel.querySelector('#report-seamstress'),selected=sel?sel.value:'TODAS',lots=lotsFor(readLots(),selected);if(!lots.length)return;
    const signature=lots.map(l=>lotSignature(l)).join('|')+'|'+selected;
    if(report.dataset.costuraLiveLots===signature)return;
    const items=lots.flatMap(l=>(l.items||[]).filter(x=>x&&x.product&&Number(x.qty)>0).map(x=>({...x,__lot:l})));
    const result=calculateItems(items),mx=buildMatrix(result.rows),totalPieces=items.reduce((s,x)=>s+(Number(x.qty)||0),0);
    const uniqueLists=[...new Set(lots.map(l=>l.listName).filter(Boolean))];
    const uniqueDates=[...new Set(lots.map(l=>dateBR(l.date)).filter(Boolean))];
    const uniqueOrders=[...new Set(lots.map(l=>String(l.pedido||'').trim()).filter(Boolean))];
    const metas=report.querySelectorAll('.report-meta');
    if(metas.length>=2){metas[0].innerHTML='COSTUREIRA: <b>'+esc(selected==='TODAS'?'TODAS AS COSTUREIRAS':(lots[0].costureira||selected||'—'))+'</b> · LISTAS: <b>'+esc(uniqueLists.join(' · ')||'—')+'</b>';metas[1].innerHTML='LOTES / DATAS: <b>'+esc(uniqueDates.join(' · ')||'—')+'</b> · PEDIDOS: <b>'+esc(uniqueOrders.join(' · ')||'—')+'</b><br>PEÇAS: <b>'+fmt(totalPieces)+'</b>'}
    const info=report.querySelectorAll('.report-info-value');if(info.length>=4){info[0].textContent=selected==='TODAS'?'TODAS AS COSTUREIRAS':(lots[0].costureira||selected||'—');info[1].textContent=uniqueLists.join(' · ')||'—';info[2].textContent=uniqueDates.join(' · ')||'—';info[3].textContent=fmt(totalPieces)}
    const products=report.querySelector('table.products');
    if(products){const thead=products.querySelector('thead tr'),tbody=products.querySelector('tbody');if(thead)thead.innerHTML='<th>PRODUTO</th><th>QTD.</th><th>COR</th><th>LOTE / DATA</th><th>NÚMERO DO PEDIDO</th>';if(tbody)tbody.innerHTML=items.length?items.map(x=>`<tr><td>${esc(x.product)}</td><td>${fmt(x.qty)}</td><td>${esc(x.color||'SEM COR')}</td><td>${esc(dateBR(x.__lot.date)||'—')}</td><td class="order-number" data-costura-order="1">${esc(x.__lot.pedido||'—')}</td></tr>`).join(''):'<tr><td colspan="5">Nenhum produto enviado.</td></tr>'}
    const matrix=report.querySelector('table.matrix');if(matrix){const head=matrix.querySelector('thead tr'),body=matrix.querySelector('tbody');if(head)head.innerHTML='<th>MATERIAL / ESPECIFICAÇÃO</th>'+mx.colors.map(c=>`<th>${esc(c)}</th>`).join('')+'<th>TOTAL</th>';if(body)body.innerHTML=mx.groups.length?mx.groups.map(g=>{const total=[...g.byColor.values()].reduce((s,v)=>s+v,0);return `<tr><td>${esc(g.material)}${g.spec?` — ${esc(g.spec)}`:''} <small>(${esc(g.unit)})</small></td>`+mx.colors.map(c=>`<td>${g.byColor.has(c)?fmt(g.byColor.get(c)):'—'}</td>`).join('')+`<td class="total">${fmt(total)}</td></tr>`}).join(''):`<tr><td colspan="${mx.colors.length+2}">Nenhum material por cor calculado.</td></tr>`}
    const two=report.querySelectorAll('.two-col');if(two.length>=1){const tables=two[0].querySelectorAll('table');if(tables[0])tables[0].querySelector('tbody').innerHTML=mx.hardware.length?mx.hardware.map(r=>`<tr><td>${esc(r.material)}${r.color?' · '+esc(r.color):''}</td><td>${fmt(r.qty)} ${esc(r.unit)}</td></tr>`).join(''):'<tr><td colspan="2">Nenhuma ferragem.</td></tr>';if(tables[1])tables[1].querySelector('tbody').innerHTML=mx.general.length?mx.general.map(r=>`<tr><td>${esc(r.material)}${r.spec?' — '+esc(r.spec):''}</td><td>${fmt(r.qty)} ${esc(r.unit)}</td></tr>`).join(''):'<tr><td colspan="2">Nenhum.</td></tr>'}
    const warn=report.querySelector('.warn');if(warn)warn.outerHTML=result.missing.length?`<div class="warn"><b>FICHAS TÉCNICAS INCOMPLETAS:</b> ${result.missing.map(esc).join(', ')}. Consumo não inventado.</div>`:'';
    report.dataset.costuraLiveLots=signature;
  }
  function boot(){setInterval(patch,700);setTimeout(patch,150)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();