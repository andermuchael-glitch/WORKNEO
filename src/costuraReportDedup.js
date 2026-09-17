// Corrige duplicações visuais no relatório consolidado da Costura.
// Regra: mesmo produto + cor + lote/data + pedido = uma única linha.
(function(){
  const norm=s=>String(s??'').trim().toUpperCase();
  const num=s=>Number(String(s??'').replace(/[^0-9.,-]/g,'').replace(/\.(?=.*\.)/g,'').replace(',','.'))||0;
  function patch(){
    const panel=document.getElementById('production-panel');
    const report=panel&&panel.querySelector('.report-onepage');
    const table=report&&report.querySelector('table.products');
    if(!table)return;
    const tbody=table.querySelector('tbody');
    if(!tbody)return;
    const rows=[...tbody.querySelectorAll('tr')].filter(r=>r.children.length>=5);
    if(!rows.length)return;
    const map=new Map();
    rows.forEach(r=>{
      const c=r.children;
      const product=(c[0].textContent||'').trim();
      const color=(c[2].textContent||'').trim();
      const date=(c[3].textContent||'').trim();
      const pedido=(c[4].textContent||'').trim();
      const key=[norm(product),norm(color),norm(date),norm(pedido)].join('|');
      const old=map.get(key);
      if(old){old.qty+=num(c[1].textContent);}
      else map.set(key,{product,color,date,pedido,qty:num(c[1].textContent)});
    });
    const out=[...map.values()];
    if(out.length===rows.length && !rows.some(r=>r.dataset.deduped==='1')){
      rows.forEach(r=>r.dataset.deduped='1');
      return;
    }
    tbody.innerHTML=out.map(x=>`<tr><td>${x.product.replace(/[&<>]/g,'')}</td><td>${Number.isInteger(x.qty)?x.qty:x.qty.toFixed(2)}</td><td>${x.color.replace(/[&<>]/g,'')}</td><td>${x.date.replace(/[&<>]/g,'')}</td><td class="order-number" data-costura-order="1">${x.pedido.replace(/[&<>]/g,'')}</td></tr>`).join('');
    const total=out.reduce((s,x)=>s+x.qty,0);
    const info=report.querySelectorAll('.report-info-value');
    if(info.length>=4)info[3].textContent=String(Number.isInteger(total)?total:total.toFixed(2));
    const metas=report.querySelectorAll('.report-meta');
    if(metas.length>=2){
      metas[1].innerHTML=metas[1].innerHTML.replace(/PEÇAS:\s*<b>[^<]*<\/b>/,'PEÇAS: <b>'+String(Number.isInteger(total)?total:total.toFixed(2))+'</b>');
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setInterval(patch,700));
  else setInterval(patch,700);
})();
