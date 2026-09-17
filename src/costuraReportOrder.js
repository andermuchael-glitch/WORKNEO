/* WORKNEO — garante Nº do pedido nos relatórios de costura. */
(function(){
  const KEY='workneo-costura-lotes-v2';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch(_){return[]}};
  function style(){if(document.getElementById('costura-report-order-style'))return;const s=document.createElement('style');s.id='costura-report-order-style';s.textContent=`
    .cd-order-info{display:inline-flex;align-items:center;gap:8px;border:1px solid #cbd5e1;border-radius:10px;background:#f8fafc;padding:7px 11px;margin:0 0 8px;font-size:12px;font-weight:800}.cd-order-info span{color:#1769e0}.cd-order-info b{font-size:14px}
    @media print{.cd-order-info{display:flex!important;border:1px solid #7b8794!important;margin:0 0 7px!important;padding:5px 8px!important;font-size:9px!important}.cd-order-info b{font-size:11px!important}}
  `;document.head.appendChild(s)}
  function add(){
    style();
    const reports=document.querySelectorAll('.cd-report');
    reports.forEach(r=>{
      if(r.querySelector('.cd-order-info'))return;
      const lots=read();
      const text=(r.innerText||'').replace(/\s+/g,' ');
      const found=[...new Set(lots.map(l=>String(l?.pedido||'').trim()).filter(Boolean).filter(p=>text.includes(p)))];
      if(!found.length)return;
      const box=document.createElement('div');box.className='cd-order-info';box.innerHTML='<span>Nº DO PEDIDO:</span><b>'+found.map(esc).join(' · ')+'</b>';
      const h=r.querySelector('h1');if(h)h.after(box);else r.prepend(box);
    });
  }
  function boot(){add();new MutationObserver(()=>requestAnimationFrame(add)).observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
