// Impressão segura do relatório de produção.
// Evita enviar o DOM inteiro do aplicativo ao mecanismo de impressão do navegador.
(function(){
  function safePrint(){
    const panel=document.getElementById('production-panel');
    const body=panel&&panel.querySelector('.prod-body');
    if(!body)return;
    const content=body.cloneNode(true);
    const filter=content.querySelector('.report-filter');
    if(filter)filter.remove();

    const iframe=document.createElement('iframe');
    iframe.setAttribute('aria-hidden','true');
    iframe.style.position='fixed';
    iframe.style.width='1px';
    iframe.style.height='1px';
    iframe.style.right='0';
    iframe.style.bottom='0';
    iframe.style.border='0';
    iframe.style.opacity='0';
    iframe.style.pointerEvents='none';
    document.body.appendChild(iframe);

    const doc=iframe.contentDocument;
    doc.open();
    doc.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>WORKNEO - Relatório</title><style>
      @page{size:A4 landscape;margin:5mm}
      *{box-sizing:border-box}
      html,body{margin:0;padding:0;background:#fff;color:#101828;font-family:Arial,sans-serif}
      .report-onepage{width:100%;font-size:8.4px;line-height:1.05;background:#fff}
      .report-title{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #172033;padding:1px 0 3px;margin-bottom:3px}
      .report-title h1{font-size:15px;margin:0 0 3px}
      .report-meta{font-size:8px}
      .report-section{font-weight:900;font-size:8.8px;padding:2.5px 4px;border-bottom:1px solid #172033}
      .report-onepage table{width:100%;border-collapse:collapse;table-layout:fixed;margin:0}
      .report-onepage th,.report-onepage td{border:1px solid #9aa4b2;padding:2px 3px;line-height:1.05;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      .report-onepage th{font-weight:900;background:#f4f6f8}
      .report-onepage .products th:nth-child(1),.report-onepage .products td:nth-child(1){width:50%;text-align:left}
      .report-onepage .products th:nth-child(2),.report-onepage .products td:nth-child(2){width:10%;text-align:right}
      .report-onepage .products th:nth-child(3),.report-onepage .products td:nth-child(3){width:18%;text-align:center}
      .report-onepage .products th:nth-child(4),.report-onepage .products td:nth-child(4){width:22%;text-align:center}
      .report-onepage .matrix th:first-child,.report-onepage .matrix td:first-child{width:31%;text-align:left}
      .report-onepage .matrix th,.report-onepage .matrix td{text-align:right}
      .report-onepage .matrix .total{font-weight:900}
      .report-onepage .two-col{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:3px}
      .warn{border:1px solid #d2a63b;background:#fff7e6;padding:4px 5px;margin-top:4px;font-size:7px}
      .foot{font-size:6.8px;margin-top:4px}
    </style></head><body>${content.innerHTML}</body></html>`);
    doc.close();

    const cleanup=()=>setTimeout(()=>iframe.remove(),500);
    iframe.onload=()=>{
      setTimeout(()=>{
        try{iframe.contentWindow.focus();iframe.contentWindow.print();}finally{cleanup();}
      },100);
    };
  }

  document.addEventListener('click',function(e){
    const target=e.target&&e.target.closest?e.target.closest('#prod-print'):null;
    if(!target)return;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation)e.stopImmediatePropagation();
    safePrint();
  },true);
})();
