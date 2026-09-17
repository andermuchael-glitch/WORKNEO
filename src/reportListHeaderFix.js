// Remove números de pedido do campo LISTA no cabeçalho do relatório.
// Os pedidos continuam visíveis na tabela de produtos e no campo PEDIDOS.
(function(){
  const clean=s=>String(s??'').trim().replace(/^\d+\s*(?:[-–—:]\s*)?/,'').trim();
  const patch=()=>{
    const panel=document.getElementById('production-panel');
    const report=panel&&panel.querySelector('.report-onepage');
    if(!report)return;
    const values=report.querySelectorAll('.report-info-value');
    if(values.length>=2){
      const source=String(values[1].textContent||'');
      const names=source.split('·').map(clean).filter(Boolean);
      values[1].textContent=[...new Set(names)].join(' · ')||'—';
    }
    const metas=report.querySelectorAll('.report-meta');
    if(metas.length>=1){
      const node=metas[0];
      node.querySelectorAll('b').forEach(b=>{
        const text=String(b.textContent||'').trim();
        const names=text.split('·').map(clean).filter(Boolean);
        b.textContent=[...new Set(names)].join(' · ')||'—';
      });
    }
  };
  const boot=()=>{patch();setInterval(patch,700)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
