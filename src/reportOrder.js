/* WORKNEO — número do pedido. Não interfere no relatório consolidado novo. */
(function(){
  const STYLE_ID='workneo-report-order-v3';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function style(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent='.report-onepage .products th:nth-child(1),.report-onepage .products td:nth-child(1){width:38%!important}.report-onepage .products th:nth-child(2),.report-onepage .products td:nth-child(2){width:8%!important}.report-onepage .products th:nth-child(3),.report-onepage .products td:nth-child(3){width:16%!important}.report-onepage .products th:nth-child(4),.report-onepage .products td:nth-child(4){width:18%!important}.report-onepage .products th:nth-child(5),.report-onepage .products td:nth-child(5){width:20%!important}.report-onepage .products td.order-number{font-weight:800;text-align:center}';document.head.appendChild(s)}
  function run(){
    style();
    document.querySelectorAll('.report-onepage .products').forEach(t=>{
      const h=t.querySelector('thead tr');
      // O relatório consolidado da Costura possui 5 colunas e já traz lote/data + pedido.
      if(h&&h.children.length>=5){h.children[3].textContent='LOTE / DATA';h.children[4].textContent='NÚMERO DO PEDIDO';return}
      // Relatórios antigos com 4 colunas mantêm apenas o cabeçalho original.
      if(h&&h.children[3])h.children[3].textContent='NÚMERO DO PEDIDO';
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  setInterval(run,1000);
})();