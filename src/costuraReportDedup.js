// Limpeza definitiva dos envios duplicados da Costura.
(function(){
  const KEY='workneo-costura-lotes-v2';
  const VERSION='costura-dedup-v2';
  const norm=s=>String(s??'').trim().toUpperCase();
  const read=()=>{try{const v=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(v)?v:[]}catch{return[]}};
  const cleanItems=items=>{
    const map=new Map();
    for(const x of (items||[])){
      if(!x?.product||Number(x.qty)<=0)continue;
      const product=String(x.product).trim();
      const color=String(x.color||'SEM COR').trim()||'SEM COR';
      const key=norm(product)+'|'+norm(color);
      const qty=Number(x.qty)||0;
      const old=map.get(key);
      if(!old) map.set(key,{...x,product,color,qty});
      else if(Number(old.qty)!==qty) old.qty+=qty;
      // mesma peça/cor com a mesma quantidade dentro do mesmo envio = cópia, não soma
    }
    return [...map.values()].sort((a,b)=>(norm(a.product)+'|'+norm(a.color)).localeCompare(norm(b.product)+'|'+norm(b.color)));
  };
  const lotKey=l=>[String(l?.date||'').trim(),norm(l?.costureira),String(l?.pedido||'').trim()].join('|');
  const fingerprint=l=>JSON.stringify(cleanItems(l?.items||[]).map(x=>[norm(x.product),norm(x.color),Number(x.qty)||0]));
  function repair(){
    const lots=read(); if(!lots.length)return false;
    const seen=new Set(), out=[]; let changed=false;
    for(const lot of lots){
      const items=cleanItems(lot.items||[]);
      const normalized={...lot,items};
      const key=lotKey(normalized)+'|'+fingerprint(normalized);
      if(seen.has(key)){changed=true;continue;}
      seen.add(key);
      if(JSON.stringify(items)!==JSON.stringify(lot.items||[]))changed=true;
      out.push(normalized);
    }
    if(changed){
      localStorage.setItem(KEY,JSON.stringify(out));
      localStorage.setItem(VERSION,'1');
      return true;
    }
    return false;
  }
  function visual(){
    const panel=document.getElementById('production-panel'),report=panel&&panel.querySelector('.report-onepage');
    const tbody=report&&report.querySelector('table.products tbody'); if(!tbody)return;
    const rows=[...tbody.querySelectorAll('tr')],groups=new Map();
    for(const tr of rows){const c=[...tr.children].map(td=>String(td.textContent||'').trim());if(c.length<5)continue;const k=[norm(c[0]),norm(c[2]),norm(c[3]),norm(c[4])].join('|');let g=groups.get(k);if(!g)groups.set(k,{c,qs:[]});g.qs.push(Number(c[1])||0)}
    if(groups.size===rows.length)return;
    tbody.innerHTML=[...groups.values()].map(g=>{const qs=[...new Set(g.qs)];const q=qs.length===1?qs[0]:g.qs.reduce((a,b)=>a+b,0);return `<tr><td>${g.c[0]}</td><td>${Number.isInteger(q)?q:q.toFixed(2)}</td><td>${g.c[2]}</td><td>${g.c[3]}</td><td class="order-number" data-costura-order="1">${g.c[4]}</td></tr>`}).join('');
  }
  const changed=repair();
  if(changed && !sessionStorage.getItem(VERSION+'-reloaded')){
    sessionStorage.setItem(VERSION+'-reloaded','1');
    location.reload();
    return;
  }
  function boot(){setInterval(visual,700);setTimeout(visual,300)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();