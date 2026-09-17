// Faz o relatório da Produção refletir imediatamente os lotes enviados pela nova tela de Costura.
(function(){
  const LOTS_KEY='workneo-costura-lotes-v2';
  const read=()=>{try{const x=JSON.parse(localStorage.getItem(LOTS_KEY)||'[]');return Array.isArray(x)?x:[]}catch(_){return[]}};
  const norm=s=>String(s||'').trim().toUpperCase();
  function patch(){
    const panel=document.getElementById('production-panel');
    const report=panel&&panel.querySelector('.report-onepage');
    if(!report)return;
    const sel=panel.querySelector('#report-seamstress');
    const chosen=sel?sel.value:'TODAS';
    let lots=read();
    if(chosen&&chosen!=='TODAS')lots=lots.filter(l=>norm(l.costureira)===norm(chosen));
    if(!lots.length)return;
    lots.sort((a,b)=>String(b.createdAt||b.date).localeCompare(String(a.createdAt||a.date)));
    const latest=lots[0];
    const metas=report.querySelectorAll('.report-meta');
    if(metas.length>=2){
      metas[0].innerHTML='COSTUREIRA: <b>'+String(chosen==='TODAS'?'TODAS AS COSTUREIRAS':chosen)+'</b> · LISTA: <b>'+String(latest.listName||'—').replace(/[&<>"']/g,'')+'</b>';
      const total=lots.reduce((s,l)=>s+(l.items||[]).reduce((a,x)=>a+(Number(x.qty)||0),0),0);
      const d=String(latest.date||'').split('-').reverse().join('/');
      metas[1].innerHTML='DATA: <b>'+d+'</b><br>PEÇAS: <b>'+total+'</b>';
    }
    const orders=new Map();
    lots.forEach(l=>(l.items||[]).forEach(x=>orders.set(norm(x.product)+'|'+norm(x.color),l.pedido||'—')));
    report.querySelectorAll('table.products tbody tr').forEach(tr=>{
      const cells=tr.querySelectorAll('td');if(cells.length<4)return;
      const product=norm(cells[0].textContent),color=norm(cells[2].textContent);
      const pedido=orders.get(product+'|'+color);
      if(pedido)cells[3].textContent=pedido;
    });
  }
  function observe(){
    const panel=document.getElementById('production-panel');if(!panel||panel.dataset.costuraLiveObserver)return;
    panel.dataset.costuraLiveObserver='1';
    const body=panel.querySelector('.prod-body');
    if(body){new MutationObserver(()=>setTimeout(patch,0)).observe(body,{childList:true,subtree:true});}
    setTimeout(patch,100);
  }
  const boot=()=>{observe();setInterval(observe,1000)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
