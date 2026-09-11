/* WORKNEO — número do pedido. Sem MutationObserver para evitar travamentos. */
(function(){
  const STYLE_ID='workneo-report-order-v2';
  const KEYS=['pedido','numeroPedido','numero_pedido','nPedido','nrPedido','numeroDoPedido','orderNumber','order'];
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=v=>String(v??'').trim().toUpperCase();
  function style(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent='.report-onepage .products th:nth-child(1),.report-onepage .products td:nth-child(1){width:45%!important}.report-onepage .products th:nth-child(2),.report-onepage .products td:nth-child(2){width:9%!important}.report-onepage .products th:nth-child(3),.report-onepage .products td:nth-child(3){width:18%!important}.report-onepage .products th:nth-child(4),.report-onepage .products td:nth-child(4){width:28%!important}.report-onepage .products td.order-number{font-weight:800;text-align:center}';document.head.appendChild(s)}
  function list(){try{const a=JSON.parse(localStorage.getItem('almox-lists')||'[]'),id=localStorage.getItem('almox-current')||'';return a.find(x=>String(x?.id)===String(id))||null}catch{return null}}
  function order(item){for(const k of KEYS){if(item?.[k]!=null&&String(item[k]).trim())return String(item[k]).trim()}return ''}
  function value(product,color){const l=list(),vals=[...new Set(Object.values(l?.items||{}).filter(x=>norm(x?.product)===norm(product)&&norm(x?.color)===norm(color)).map(order).filter(Boolean))];return vals.length?vals.join(' / '):String(l?.name||'—').trim()||'—'}
  function run(){style();document.querySelectorAll('.report-onepage').forEach(r=>{const t=r.querySelector('table.products');if(!t)return;const h=t.querySelector('thead tr');if(h?.children[3]&&h.children[3].textContent!=='NÚMERO DO PEDIDO')h.children[3].textContent='NÚMERO DO PEDIDO';t.querySelectorAll('tbody tr').forEach(row=>{if(row.children.length<4)return;const v=value(row.children[0].textContent,row.children[2].textContent),c=row.children[3];c.classList.add('order-number');if(c.textContent.trim()!==v)c.textContent=v})})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();setInterval(run,1000);
})();
