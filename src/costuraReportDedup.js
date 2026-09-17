// Pós-processador visual do relatório de costura.
// Não recalcula o relatório nem lê outra fonte: apenas remove linhas idênticas
// que eventualmente sejam renderizadas novamente por módulos antigos.
(function(){
  const norm=s=>String(s??'').trim().toUpperCase();
  const num=s=>{const v=Number(String(s??'').replace(',','.'));return Number.isFinite(v)?v:0};
  const fmt=n=>Number.isInteger(n)?String(n):n.toFixed(2).replace(/\.00$/,'');
  function patch(){
    const panel=document.getElementById('production-panel');
    const report=panel&&panel.querySelector('.report-onepage');
    if(!report)return;
    const table=report.querySelector('table.products');
    if(!table)return;
    const tbody=table.querySelector('tbody');
    if(!tbody)return;
    const rows=[...tbody.querySelectorAll('tr')];
    const groups=new Map();
    for(const tr of rows){
      const c=[...tr.children].map(td=>String(td.textContent||'').trim());
      if(c.length<5)continue;
      const key=[norm(c[0]),norm(c[2]),norm(c[3]),norm(c[4])].join('|');
      let g=groups.get(key);
      if(!g)groups.set(key,g={tr,values:c,qtys:[]});
      g.qtys.push(num(c[1]));
    }
    if(groups.size===rows.length)return;
    const out=[];
    for(const g of groups.values()){
      // Linhas completamente idênticas representam o mesmo envio gravado duas vezes.
      // Se houver quantidades diferentes para o mesmo produto/cor/data/pedido,
      // elas são envios distintos e devem ser somadas.
      const distinct=[...new Set(g.qtys.map(v=>String(v)))];
      const qty=distinct.length===1?g.qtys[0]:g.qtys.reduce((a,b)=>a+b,0);
      const cells=g.values;
      out.push(`<tr><td>${cells[0]}</td><td>${fmt(qty)}</td><td>${cells[2]}</td><td>${cells[3]}</td><td class="order-number" data-costura-order="1">${cells[4]}</td></tr>`);
    }
    tbody.innerHTML=out.join('');
  }
  function boot(){setInterval(patch,700);setTimeout(patch,300)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();