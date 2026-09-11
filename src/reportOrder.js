/* WORKNEO — substitui ACABAMENTO por NÚMERO DO PEDIDO no relatório. */
(function(){
  const STYLE_ID='workneo-report-order-v1';
  const KEY_CANDIDATES=['pedido','numeroPedido','numero_pedido','nPedido','nrPedido','numeroDoPedido','orderNumber','order'];
  function esc(v){return String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));}
  function norm(v){return String(v??'').trim().toUpperCase();}
  function style(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .report-onepage .products th:nth-child(1),.report-onepage .products td:nth-child(1){width:45%!important}
      .report-onepage .products th:nth-child(2),.report-onepage .products td:nth-child(2){width:9%!important}
      .report-onepage .products th:nth-child(3),.report-onepage .products td:nth-child(3){width:18%!important}
      .report-onepage .products th:nth-child(4),.report-onepage .products td:nth-child(4){width:28%!important}
      .report-onepage .products td.order-number{font-weight:800;text-align:center}
    `;document.head.appendChild(s);
  }
  function activeList(){
    try{
      const lists=JSON.parse(localStorage.getItem('almox-lists')||'[]');
      const id=localStorage.getItem('almox-current')||'';
      return lists.find(l=>String(l?.id)===String(id))||null;
    }catch(_){return null;}
  }
  function readOrder(item){
    if(!item||typeof item!=='object')return '';
    for(const key of KEY_CANDIDATES){
      const value=item[key];
      if(value!==undefined&&value!==null&&String(value).trim())return String(value).trim();
    }
    return '';
  }
  function ordersFor(product,color){
    const list=activeList();
    const items=Object.values(list?.items||{}).filter(v=>norm(v?.product)===norm(product)&&norm(v?.color)===norm(color));
    const values=[...new Set(items.map(readOrder).filter(Boolean))];
    if(values.length)return values.join(' / ');
    const name=String(list?.name||'').trim();
    return name||'—';
  }
  function enhance(report){
    if(!report)return;
    const table=report.querySelector('table.products');
    if(!table)return;
    const head=table.querySelector('thead tr');
    if(head){
      const cells=head.children;
      if(cells.length>=4)cells[3].textContent='NÚMERO DO PEDIDO';
    }
    table.querySelectorAll('tbody tr').forEach(row=>{
      const cells=row.children;
      if(cells.length<4)return;
      const product=cells[0]?.textContent?.trim()||'';
      const color=cells[2]?.textContent?.trim()||'';
      const cell=cells[3];
      const value=ordersFor(product,color);
      cell.classList.add('order-number');
      if(cell.textContent.trim()!==value)cell.textContent=value;
    });
  }
  function boot(){
    style();
    let pending=false;
    const run=()=>{pending=false;document.querySelectorAll('.report-onepage').forEach(enhance);};
    run();
    const observer=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(run);});
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
