const COSTUREIRAS=['ELENI','MARA','SANDRA','MIRIAN','MARINA','ADRIANA','DONA JOSI','JAMINA','COSTURA INTERNA'];
const KEY='workneo-costura-lotes-v2';
const EXCLUDED=new Set(['MÁSCARA PROTETORA','MOUSE PAD','MOUSE PAD GAMER','PORTA COPOS']);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number.isInteger(Number(n))?String(Number(n)):Number(n||0).toFixed(2).replace(/\.00$/,'');
const readJSON=(k,f)=>{try{const x=JSON.parse(localStorage.getItem(k)||'');return x??f}catch{return f}};
const readLists=()=>{const x=readJSON('almox-lists',[]);return Array.isArray(x)?x:[]};
const activeList=()=>{const id=localStorage.getItem('almox-current')||'';return readLists().find(l=>String(l?.id)===String(id))||null};
const readLots=()=>{const x=readJSON(KEY,[]);return Array.isArray(x)?x:[]};
const saveLots=x=>localStorage.setItem(KEY,JSON.stringify(x));
const keyOf=(p,c)=>`${p}__${c}`;
const sentFor=listId=>{const m=new Map();readLots().filter(l=>String(l.listId)===String(listId)).forEach(l=>(l.items||[]).forEach(x=>{const k=keyOf(x.product,x.color||'SEM COR');m.set(k,(m.get(k)||0)+Number(x.qty||0))}));return m};
const sourceItems=list=>{const sent=sentFor(list?.id);return Object.values(list?.items||{}).filter(x=>x?.product&&!EXCLUDED.has(String(x.product).trim().toUpperCase())).map(x=>{const color=x.color||'SEM COR',original=Number(x.total)||0,used=Number(sent.get(keyOf(x.product,color))||0),qty=Math.max(0,original-used);return {...x,color,qty}}).filter(x=>x.qty>0).map(x=>({product:x.product,color:x.color,qty:x.qty}));};
const orderOf=list=>{const m=String(list?.name||'').match(/(?:pedido|ped\.?|#)\s*([A-Z0-9-]+)/i);return m?m[1]:String(list?.name||'—')};
function style(){if(document.getElementById('costura-dispatch-style'))return;const s=document.createElement('style');s.id='costura-dispatch-style';s.textContent=`
.cd-btn{border:0;border-radius:12px;padding:11px 14px;font-weight:800;cursor:pointer}.cd-send{background:#7c3aed;color:#fff}.cd-archive{background:#eef2f7;color:#172033}.cd-overlay{position:fixed;inset:0;z-index:12000;background:#0008;overflow:auto;padding:16px;box-sizing:border-box}.cd-panel{max-width:1100px;margin:0 auto;background:#fff;color:#172033;border-radius:20px;min-height:calc(100vh - 32px);box-shadow:0 20px 60px #0006;overflow:hidden}.cd-head{display:flex;justify-content:space-between;align-items:center;padding:18px 20px;border-bottom:1px solid #e5e7eb;position:sticky;top:0;background:#fff;z-index:2}.cd-head h2{margin:2px 0;font-size:22px}.cd-close{border:0;border-radius:10px;background:#eef2f7;font-size:22px;width:40px;height:40px;cursor:pointer}.cd-tabs{display:flex;gap:8px;padding:10px 14px;border-bottom:1px solid #e5e7eb;overflow:auto}.cd-tab{border:0;border-radius:10px;background:#eef2f7;padding:10px 13px;font-weight:800;white-space:nowrap;cursor:pointer}.cd-tab.active{background:#1769e0;color:#fff}.cd-body{padding:16px}.cd-card{border:1px solid #e1e5eb;border-radius:15px;overflow:hidden;margin-bottom:12px}.cd-card h3{margin:0;padding:13px 15px;background:#f8fafc;font-size:14px}.cd-row{display:grid;grid-template-columns:32px minmax(180px,1fr) 150px 100px;gap:8px;align-items:center;padding:10px 12px;border-top:1px solid #edf0f4}.cd-row input,.cd-field input,.cd-field select{box-sizing:border-box;width:100%;border:1px solid #cfd5dd;border-radius:9px;padding:9px;background:#fff}.cd-toolbar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.cd-primary{background:#1769e0;color:#fff}.cd-success{background:#14804a;color:#fff}.cd-muted{background:#eef2f7;color:#172033}.cd-summary{background:#f8fafc;border:1px solid #e2e7ef;border-radius:12px;padding:12px;margin:12px 0}.cd-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.cd-field label{display:block;font-size:12px;font-weight:800;margin-bottom:5px}.cd-batch{border:1px solid #e1e5eb;border-radius:14px;margin:10px 0;overflow:hidden}.cd-batch-head{display:flex;justify-content:space-between;gap:10px;padding:12px 14px;background:#f8fafc;flex-wrap:wrap}.cd-batch-body{padding:10px 14px}.cd-item{display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px solid #edf0f4}.cd-item:last-child{border-bottom:0}.cd-badge{display:inline-block;padding:4px 8px;border-radius:999px;background:#eef2f7;font-size:11px;font-weight:800}.cd-empty{text-align:center;padding:28px;color:#667085}.cd-report{font-family:Arial,sans-serif;background:#fff;color:#101828}.cd-report h1{font-size:20px;margin:0 0 6px}.cd-report table{width:100%;border-collapse:collapse;margin-top:10px}.cd-report th,.cd-report td{border:1px solid #9aa4b2;padding:6px;text-align:left}.cd-report th{background:#f2f4f7}.cd-print{float:right}@media(max-width:700px){.cd-grid{grid-template-columns:1fr}.cd-row{grid-template-columns:30px 1fr 95px}.cd-body{padding:10px}}@page{size:A4 landscape;margin:8mm}@media print{body>*:not(#costura-dispatch-overlay){display:none!important}#costura-dispatch-overlay{display:block!important;position:static;padding:0;background:#fff}.cd-panel{box-shadow:none;border-radius:0;min-height:0;max-width:none}.cd-head,.cd-tabs,.cd-toolbar,.cd-print,.cd-actions{display:none!important}.cd-body{padding:0}.cd-report{font-size:10px}}`;document.head.appendChild(s)}
function openOverlay(tab='enviar'){style();let o=document.getElementById('costura-dispatch-overlay');if(!o){o=document.createElement('div');o.id='costura-dispatch-overlay';o.className='cd-overlay';o.innerHTML='<div class="cd-panel"><div class="cd-head"><div><small>WORKNEO · COSTURA</small><h2>Envios para costura</h2></div><button class="cd-close" id="cd-close">×</button></div><div class="cd-tabs"><button class="cd-tab" data-tab="enviar">➜ Enviar para costura</button><button class="cd-tab" data-tab="arquivados">🗂️ Arquivados</button><button class="cd-tab" data-tab="relatorios">📄 Relatórios</button></div><div class="cd-body"></div></div>';document.body.appendChild(o);o.querySelector('#cd-close').onclick=()=>o.remove();o.addEventListener('click',e=>{if(e.target===o)o.remove()});o.querySelectorAll('.cd-tab').forEach(b=>b.onclick=()=>renderTab(b.dataset.tab));}renderTab(tab)}
let draft=[],draftListId='',confirming=false;
function renderTab(tab){const o=document.getElementById('costura-dispatch-overlay');if(!o)return;o.querySelectorAll('.cd-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));if(tab==='enviar')renderSend(o);else if(tab==='arquivados')renderArchived(o);else renderReports(o)}
function renderSend(o){const list=activeList(),items=sourceItems(list),body=o.querySelector('.cd-body'),currentId=String(list?.id||'');if(currentId!==draftListId){draft=[];draftListId=currentId}if(!items.length){draft=[];body.innerHTML='<div class="cd-empty">Nenhum item disponível para envio à costura nesta lista.</div>';return}if(!draft.length)draft=items.map(x=>({...x,key:keyOf(x.product,x.color),selected:false,sendQty:x.qty}));draft=draft.filter(x=>items.some(y=>y.key===keyOf(x.product,x.color))).map(x=>{const y=items.find(z=>z.key===x.key);return {...x,qty:y.qty,sendQty:Math.min(Number(x.sendQty)||y.qty,y.qty)}});if(!draft.length)draft=items.map(x=>({...x,key:keyOf(x.product,x.color),selected:false,sendQty:x.qty}));body.innerHTML='<div class="cd-summary"><b>Pedido:</b> '+esc(orderOf(list))+' · <b>Lista:</b> '+esc(list?.name||'—')+'<br><small>Selecione vários itens. A quantidade é preenchida com o disponível e pode ser reduzida para envio parcial.</small></div><div class="cd-grid"><div class="cd-field"><label>COSTUREIRA</label><select id="cd-cost"><option value="">Escolha a costureira</option>'+COSTUREIRAS.map(n=>`<option>${n}</option>`).join('')+'</select></div><div class="cd-field"><label>NÚMERO DO PEDIDO</label><input id="cd-order" value="${esc(orderOf(list))}"></div><div class="cd-field"><label>DATA DO ENVIO</label><input id="cd-date" type="date" value="${new Date().toISOString().slice(0,10)}"></div></div><div class="cd-card"><h3>ITENS DISPONÍVEIS NA SEPARAÇÃO</h3>'+draft.map((x,i)=>`<div class="cd-row"><input type="checkbox" data-sel="${i}" ${x.selected?'checked':''}><div><b>${esc(x.product)}</b><br><span class="cd-badge">${esc(x.color)}</span> <span class="cd-badge">Disponível: ${fmt(x.qty)}</span></div><input type="number" min="1" max="${x.qty}" data-qty="${i}" value="${x.sendQty}"><span>UN</span></div>`).join('')+'</div><div class="cd-toolbar"><button class="cd-btn cd-primary" id="cd-review">CONTINUAR PARA CONFIRMAÇÃO</button><button class="cd-btn cd-muted" id="cd-all">SELECIONAR TUDO</button><button class="cd-btn cd-muted" id="cd-none">LIMPAR SELEÇÃO</button></div>';
const cost=o.querySelector('#cd-cost'),order=o.querySelector('#cd-order'),date=o.querySelector('#cd-date');o.querySelectorAll('[data-sel]').forEach(el=>el.onchange=()=>draft[Number(el.dataset.sel)].selected=el.checked);o.querySelectorAll('[data-qty]').forEach(el=>el.oninput=()=>draft[Number(el.dataset.qty)].sendQty=Math.max(0,Math.min(Number(el.value)||0,draft[Number(el.dataset.qty)].qty)));o.querySelector('#cd-all').onclick=()=>{draft.forEach(x=>x.selected=true);renderSend(o)};o.querySelector('#cd-none').onclick=()=>{draft.forEach(x=>x.selected=false);renderSend(o)};o.querySelector('#cd-review').onclick=()=>{const chosen=draft.filter(x=>x.selected&&Number(x.sendQty)>0);if(!cost.value||!order.value.trim()||!date.value||!chosen.length){alert('Escolha a costureira, informe o pedido e selecione pelo menos um item.');return}renderConfirm(o,{costureira:cost.value,pedido:order.value.trim(),date:date.value,items:chosen.map(x=>({product:x.product,color:x.color,qty:Number(x.sendQty)})),listId:list?.id||'',listName:list?.name||''})};}
function printPreDispatchReport(data){
  const rows=(data.items||[]).map(x=>'<tr><td>'+esc(x.product)+'</td><td>'+esc(x.color)+'</td><td>'+fmt(x.qty)+'</td></tr>').join('');
  const total=(data.items||[]).reduce((sum,x)=>sum+Number(x.qty||0),0);
  const html='<!doctype html><html><head><meta charset="utf-8"><title>Relatório para costura</title><style>@page{size:A4 portrait;margin:12mm}body{font-family:Arial,sans-serif;color:#101828;margin:0;font-size:12px}h1{font-size:20px;margin:0 0 8px}h2{font-size:14px;margin:18px 0 6px;border-bottom:2px solid #172033;padding-bottom:5px}.meta{border:1px solid #d0d5dd;border-radius:8px;padding:10px;margin:10px 0 16px}.meta b{display:inline-block;margin-right:18px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #98a2b3;padding:7px;text-align:left}th{background:#f2f4f7}td:last-child,th:last-child{text-align:right}.total{margin-top:10px;text-align:right;font-size:14px;font-weight:800}.foot{margin-top:18px;font-size:9px;color:#667085}</style></head><body><h1>WORKNEO · RELATÓRIO PARA COSTURA</h1><div class="meta"><b>COSTUREIRA:</b> '+esc(data.costureira)+'<b>Nº DO PEDIDO:</b> '+esc(data.pedido)+'<b>DATA:</b> '+esc(String(data.date||'').split('-').reverse().join('/'))+'<br><b>LISTA:</b> '+esc(data.listName||'—')+'</div><h2>ITENS QUE SERÃO ENVIADOS</h2><table><thead><tr><th>PRODUTO</th><th>COR</th><th>QUANTIDADE</th></tr></thead><tbody>'+rows+'</tbody></table><div class="total">TOTAL: '+fmt(total)+' PEÇAS</div><div class="foot">Este relatório é uma prévia do envio. Ele é gerado antes da confirmação e não altera as quantidades da lista.</div></body></html>';
  const frame=document.createElement('iframe');
  frame.style.position='fixed';frame.style.width='1px';frame.style.height='1px';frame.style.border='0';frame.style.opacity='0';frame.style.pointerEvents='none';
  document.body.appendChild(frame);
  const doc=frame.contentDocument||frame.contentWindow.document;doc.open();doc.write(html);doc.close();
  setTimeout(()=>{try{frame.contentWindow.focus();frame.contentWindow.print()}finally{setTimeout(()=>frame.remove(),800)}},120);
}

function showPreDispatchReport(o,data){
  const body=o.querySelector('.cd-body'),total=(data.items||[]).reduce((s,x)=>s+Number(x.qty||0),0);
  body.innerHTML='<div class="cd-report"><div class="cd-toolbar"><button class="cd-btn cd-muted" id="cd-report-back">← VOLTAR</button><button class="cd-btn cd-primary" id="cd-report-print">🖨️ IMPRIMIR / GERAR PDF</button></div><h1>WORKNEO · RELATÓRIO PARA COSTURA</h1><div class="cd-summary"><b>COSTUREIRA:</b> '+esc(data.costureira)+' · <b>Nº DO PEDIDO:</b> '+esc(data.pedido)+' · <b>DATA:</b> '+esc(String(data.date||'').split('-').reverse().join('/'))+'<br><b>LISTA:</b> '+esc(data.listName||'—')+' · <b>TOTAL:</b> '+fmt(total)+' PEÇAS</div><table><thead><tr><th>PRODUTO</th><th>COR</th><th>QUANTIDADE</th></tr></thead><tbody>'+(data.items||[]).map(x=>'<tr><td>'+esc(x.product)+'</td><td>'+esc(x.color)+'</td><td>'+fmt(x.qty)+'</td></tr>').join('')+'</tbody></table><div class="cd-summary"><b>PRÉVIA:</b> este relatório mostra exatamente os itens selecionados para o envio. Nenhuma quantidade foi baixada ainda.</div></div>';
  o.querySelector('#cd-report-back').onclick=()=>renderConfirm(o,data);
  o.querySelector('#cd-report-print').onclick=()=>printPreDispatchReport(data);
}

function renderConfirm(o,data){
  const body=o.querySelector('.cd-body'),total=data.items.reduce((s,x)=>s+x.qty,0);
  body.innerHTML='<div class="cd-summary"><b>CONFIRMAÇÃO DO ENVIO</b><br>Costureira: <b>'+esc(data.costureira)+'</b> · Pedido: <b>'+esc(data.pedido)+'</b> · Data: <b>'+esc(data.date.split('-').reverse().join('/'))+'</b><br>Total: <b>'+fmt(total)+' peças</b></div><div class="cd-card"><h3>VOCÊ ESTÁ ENVIANDO</h3>'+data.items.map(x=>'<div class="cd-item"><span><b>'+esc(x.product)+'</b> · '+esc(x.color)+'</span><b>'+fmt(x.qty)+'</b></div>').join('')+'</div><div class="cd-toolbar"><button class="cd-btn cd-primary" id="cd-preview-report">📄 GERAR RELATÓRIO DO ENVIO</button><button class="cd-btn cd-success" id="cd-confirm">✓ CONFIRMAR E ARQUIVAR ENVIO</button><button class="cd-btn cd-muted" id="cd-back">← VOLTAR</button></div>';
  o.querySelector('#cd-preview-report').onclick=()=>showPreDispatchReport(o,data);
  o.querySelector('#cd-back').onclick=()=>{draft=[];renderSend(o)};
  o.querySelector('#cd-confirm').onclick=()=>confirmDispatch(o,data);
}
function confirmDispatch(o,data){
  if(confirming)return;
  confirming=true;
  const btn=o.querySelector('#cd-confirm');
  if(btn){btn.disabled=true;btn.textContent='PROCESSANDO...';}
  try{
    const listId=String(data.listId||'');
    const lists=readLists();
    const list=lists.find(l=>String(l?.id||'')===listId);
    if(!list)throw new Error('Lista não encontrada.');
    const currentItems=list.items&&typeof list.items==='object'&&!Array.isArray(list.items)?list.items:{};
    const requested=(data.items||[]).map(x=>({...x,qty:Number(x.qty)||0})).filter(x=>x.product&&x.qty>0);
    if(!requested.length)throw new Error('Nenhum item selecionado.');
    for(const x of requested){
      const k=keyOf(x.product,x.color||'SEM COR');
      const available=Number(currentItems?.[k]?.total)||0;
      if(x.qty>available)throw new Error('Quantidade maior que a disponível para '+x.product+' · '+(x.color||'SEM COR')+'.');
    }
    const lots=readLots();
    const signature=JSON.stringify({
      date:String(data.date||''),
      costureira:String(data.costureira||'').trim().toUpperCase(),
      pedido:String(data.pedido||'').trim().toUpperCase(),
      listId,
      items:requested.map(x=>[String(x.product).trim().toUpperCase(),String(x.color||'SEM COR').trim().toUpperCase(),Number(x.qty)||0]).sort()
    });
    const duplicate=lots.some(l=>JSON.stringify({
      date:String(l?.date||''),
      costureira:String(l?.costureira||'').trim().toUpperCase(),
      pedido:String(l?.pedido||'').trim().toUpperCase(),
      listId:String(l?.listId||''),
      items:(l?.items||[]).map(x=>[String(x.product).trim().toUpperCase(),String(x.color||'SEM COR').trim().toUpperCase(),Number(x.qty)||0]).sort()
    })===signature);
    if(duplicate)throw new Error('Este envio já foi registrado. Não foi criado outro lançamento.');
    const now=new Date().toISOString();
    const lot={
      id:String(Date.now())+'-'+Math.random().toString(16).slice(2),
      date:String(data.date||''),
      costureira:String(data.costureira||'').trim(),
      pedido:String(data.pedido||'').trim(),
      listId,
      listName:String(data.listName||list.name||''),
      createdAt:now,
      items:requested
    };
    const updatedItems={...currentItems};
    const history=Array.isArray(list.history)?[...list.history]:[];
    for(const x of requested){
      const k=keyOf(x.product,x.color||'SEM COR');
      const old=updatedItems[k]||{};
      const next=Math.max(0,(Number(old.total)||0)-x.qty);
      if(next<=0)delete updatedItems[k];
      else updatedItems[k]={...old,total:next};
      history.push({type:'costura',product:x.product,color:x.color||'SEM COR',qty:-x.qty,at:now,costureira:lot.costureira,pedido:lot.pedido,date:lot.date});
    }
    const updatedLists=lists.map(l=>String(l?.id||'')===listId?{...l,items:updatedItems,history}:l);
    saveLots([...lots,lot]);
    localStorage.setItem('almox-lists',JSON.stringify(updatedLists));
    draft=[];
    confirming=false;
    alert('Envio arquivado com sucesso. As quantidades enviadas foram retiradas da separação.');
    o.remove();
    location.reload();
  }catch(err){
    confirming=false;
    if(btn){btn.disabled=false;btn.textContent='✓ CONFIRMAR E ARQUIVAR ENVIO';}
    alert(err?.message||'Não foi possível concluir o envio para a costura.');
  }
}
function renderArchived(o){const lots=readLots().sort((a,b)=>String(b.date).localeCompare(String(a.date)));const body=o.querySelector('.cd-body');if(!lots.length){body.innerHTML='<div class="cd-empty">Nenhum envio arquivado.</div>';return}body.innerHTML='<div class="cd-toolbar"><button class="cd-btn cd-muted" id="cd-refresh">↻ ATUALIZAR</button></div>'+lots.map((l,i)=>`<div class="cd-batch"><div class="cd-batch-head"><div><b>${esc(l.date.split('-').reverse().join('/'))}</b> · <span class="cd-badge">${esc(l.costureira)}</span> · Pedido <b>${esc(l.pedido)}</b><br><small>Origem: ${esc(l.listName||'—')}</small></div><div class="cd-actions"><button class="cd-btn cd-primary" data-report="${i}">📄 RELATÓRIO</button></div></div><div class="cd-batch-body">${(l.items||[]).map(x=>`<div class="cd-item"><span>${esc(x.product)} · ${esc(x.color)}</span><b>${fmt(x.qty)}</b></div>`).join('')}</div></div>`).join('');o.querySelector('#cd-refresh').onclick=()=>renderArchived(o);o.querySelectorAll('[data-report]').forEach(b=>b.onclick=()=>showBatchReport(o,lots[Number(b.dataset.report)]))}
function openPrintDialog(){window.focus();setTimeout(()=>window.print(),80)}
function reportHTML(lots,mode,costureira,month){let data=lots.filter(l=>!costureira||l.costureira===costureira);if(month)data=data.filter(l=>String(l.date).slice(0,7)===month);if(mode==='month'){const m=new Map();data.forEach(l=>(l.items||[]).forEach(x=>{const k=keyOf(x.product,x.color);m.set(k,(m.get(k)||0)+Number(x.qty||0))}));return '<div class="cd-report"><button class="cd-btn cd-primary cd-print" onclick="openPrintDialog()">🖨️ ESCOLHER IMPRESSÃO</button><h1>WORKNEO · RELATÓRIO MENSAL DE COSTURA</h1><div>Costureira: <b>'+esc(costureira||'TODAS')+'</b> · Período: <b>'+esc(month||'TODOS')+'</b> · Envios: <b>'+data.length+'</b></div><table><thead><tr><th>PRODUTO</th><th>COR</th><th>QUANTIDADE AGRUPADA</th></tr></thead><tbody>'+([...m.entries()].sort()).map(([k,q])=>{const [p,c]=k.split('__');return `<tr><td>${esc(p)}</td><td>${esc(c)}</td><td>${fmt(q)}</td></tr>`}).join('')+'</tbody></table></div>'}return data.map(l=>`<div class="cd-report"><button class="cd-btn cd-primary cd-print" onclick="openPrintDialog()">🖨️ ESCOLHER IMPRESSÃO</button><h1>WORKNEO · ENVIO PARA COSTURA</h1><div>Data: <b>${esc(l.date.split('-').reverse().join('/'))}</b> · Costureira: <b>${esc(l.costureira)}</b> · Nº DO PEDIDO: <b>${esc(l.pedido)}</b></div><table><thead><tr><th>PRODUTO</th><th>COR</th><th>QUANTIDADE</th></tr></thead><tbody>${(l.items||[]).map(x=>`<tr><td>${esc(x.product)}</td><td>${esc(x.color)}</td><td>${fmt(x.qty)}</td></tr>`).join('')}</tbody></table></div>`).join('')}
function showBatchReport(o,lot){const body=o.querySelector('.cd-body');body.innerHTML='<div class="cd-toolbar"><button class="cd-btn cd-muted" id="cd-back-report">← VOLTAR</button></div>'+reportHTML([lot],'batch');o.querySelector('#cd-back-report').onclick=()=>renderArchived(o)}
function renderReports(o){const lots=readLots(),now=new Date().toISOString().slice(0,7),body=o.querySelector('.cd-body');body.innerHTML='<div class="cd-card"><h3>CONSULTA POR PERÍODO</h3><div class="cd-grid" style="padding:12px"><div class="cd-field"><label>COSTUREIRA</label><select id="cd-r-cost"><option value="">TODAS</option>'+COSTUREIRAS.map(n=>`<option>${n}</option>`).join('')+'</select></div><div class="cd-field"><label>MÊS</label><input id="cd-r-month" type="month" value="'+now+'"></div><div class="cd-field"><label>RELATÓRIO</label><select id="cd-r-mode"><option value="month">Mensal agrupado por item</option><option value="batch">Envios individuais</option></select></div></div></div><div class="cd-toolbar"><button class="cd-btn cd-primary" id="cd-generate">GERAR RELATÓRIO</button></div><div id="cd-report-result"></div>';o.querySelector('#cd-generate').onclick=()=>{const c=o.querySelector('#cd-r-cost').value,m=o.querySelector('#cd-r-month').value,mode=o.querySelector('#cd-r-mode').value;o.querySelector('#cd-report-result').innerHTML=reportHTML(lots,mode,c,m)}}
function mountButton(){if(document.getElementById('cd-send-main'))return;const quick=document.querySelector('.quick');if(!quick)return;const b=document.createElement('button');b.id='cd-send-main';b.className='cd-btn cd-send';b.textContent='➜ ENVIAR PARA COSTURA';b.onclick=()=>{draft=[];draftListId='';openOverlay('enviar')};quick.appendChild(b);const a=document.createElement('button');a.id='cd-archive-main';a.className='cd-btn cd-archive';a.textContent='🗂️ ARQUIVADOS DA COSTURA';a.onclick=()=>openOverlay('arquivados');quick.appendChild(a)}
function watch(){style();mountButton();new MutationObserver(()=>mountButton()).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();