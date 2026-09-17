// Corrige duplicações gravadas dentro do próprio lote e mantém o pós-processamento visual.
(function(){
  const KEY='workneo-costura-lotes-v2';
  const norm=s=>String(s??'').trim().toUpperCase();
  const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  function repair(){
    const lots=read(); if(!lots.length)return;
    let changed=false;
    const fixed=lots.map(l=>{
      const map=new Map();
      for(const x of (l.items||[])){
        if(!x?.product||Number(x.qty)<=0)continue;
        const k=norm(x.product)+'|'+norm(x.color||'SEM COR');
        const q=Number(x.qty)||0;
        const old=map.get(k);
        // Duas linhas exatamente iguais dentro do mesmo envio são a mesma linha,
        // não duas quantidades a somar. Quantidades diferentes continuam somando.
        if(old){
          if(Number(old.qty)!==q)old.qty+=q;
          else changed=true;
        }else map.set(k,{...x,qty:q});
      }
      const items=[...map.values()];
      if(JSON.stringify(items)!==JSON.stringify(l.items||[]))changed=true;
      return {...l,items};
    });
    if(changed)localStorage.setItem(KEY,JSON.stringify(fixed));
    return changed;
  }
  repair();
  function visual(){
    const panel=document.getElementById('production-panel'),report=panel&&panel.querySelector('.report-onepage');
    const tbody=report&&report.querySelector('table.products tbody'); if(!tbody)return;
    const rows=[...tbody.querySelectorAll('tr')],groups=new Map();
    for(const tr of rows){const c=[...tr.children].map(td=>String(td.textContent||'').trim());if(c.length<5)continue;const k=[norm(c[0]),norm(c[2]),norm(c[3]),norm(c[4])].join('|');let g=groups.get(k);if(!g)groups.set(k,{c,qs:[]});g.qs.push(Number(c[1])||0)}
    if(groups.size===rows.length)return;
    tbody.innerHTML=[...groups.values()].map(g=>{const qs=[...new Set(g.qs)];const q=qs.length===1?qs[0]:g.qs.reduce((a,b)=>a+b,0);return `<tr><td>${g.c[0]}</td><td>${Number.isInteger(q)?q:q.toFixed(2)}</td><td>${g.c[2]}</td><td>${g.c[3]}</td><td class="order-number" data-costura-order="1">${g.c[4]}</td></tr>`}).join('');
  }
  function boot(){setInterval(()=>{if(repair()){} visual()},700);setTimeout(visual,400)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();