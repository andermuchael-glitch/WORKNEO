/* WORKNEO — visual do relatório + impressão A4 retrato/paisagem.
   Módulo aditivo: não altera a Aba 1 nem a lógica de cálculo. */
(function(){
  const STYLE_ID='workneo-print-orientation-style-v3';
  const P='workneo-print-portrait', L='workneo-print-landscape';
  function style(){if(document.getElementById(STYLE_ID))return;const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
    .report-filter{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:11px 12px;margin:0 0 12px;border:1px solid #e4e7ec;border-radius:14px;background:#f8fafc;box-shadow:0 2px 8px #1018280a}
    .report-filter label{font-size:12px;letter-spacing:.03em;color:#475467;font-weight:800}
    .report-select{min-width:180px;border:1px solid #d0d5dd;border-radius:10px;padding:9px 11px;background:#fff;color:#101828;font-weight:700}
    .print-orientation{display:inline-flex;align-items:center;gap:3px;padding:3px;border:1px solid #d0d5dd;border-radius:11px;background:#fff;margin-left:auto}
    .print-orientation-label{padding:0 5px 0 7px;font-size:11px;font-weight:900;color:#475467}
    .print-orientation button{border:0;border-radius:8px;padding:8px 10px;background:transparent;color:#344054;font-weight:800;cursor:pointer;font-size:11px}
    .print-orientation button.active{background:#172033;color:#fff;box-shadow:0 2px 5px #0002}
    .report-onepage{font-family:Arial,sans-serif;font-size:10px;line-height:1.18;color:#101828;background:#fff;border:1px solid #d9dee7;border-radius:14px;padding:14px;box-sizing:border-box;box-shadow:0 5px 18px #10182810}
    .report-title{display:flex;justify-content:space-between;align-items:center;gap:20px;border:0;border-bottom:3px solid #172033;padding:0 0 10px;margin:0 0 9px}
    .report-title h1{font-size:19px;letter-spacing:-.02em;margin:0 0 5px;color:#101828}
    .report-meta{font-size:9.5px;color:#667085;line-height:1.35}.report-meta b{color:#101828}
    .report-section{font-weight:900;font-size:10.5px;letter-spacing:.02em;color:#fff;background:#172033;border:0;border-radius:7px 7px 0 0;padding:6px 8px;margin-top:9px}
    .report-onepage table{width:100%;border-collapse:separate;border-spacing:0;table-layout:fixed;margin:0;border:1px solid #d9dee7;border-top:0;border-radius:0 0 7px 7px;overflow:hidden}
    .report-onepage th,.report-onepage td{border:0;border-bottom:1px solid #eaecf0;padding:5px 6px;line-height:1.15;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
    .report-onepage tr:last-child td{border-bottom:0}.report-onepage th{font-size:8.5px;font-weight:900;color:#475467;background:#f2f4f7;text-transform:uppercase}.report-onepage tbody tr:nth-child(even) td{background:#fafbfc}
    .report-onepage .products th:nth-child(1),.report-onepage .products td:nth-child(1){width:47%;text-align:left;font-weight:700}.report-onepage .products th:nth-child(2),.report-onepage .products td:nth-child(2){width:11%;text-align:center;font-weight:800}.report-onepage .products th:nth-child(3),.report-onepage .products td:nth-child(3){width:20%;text-align:center;font-weight:800}.report-onepage .products th:nth-child(4),.report-onepage .products td:nth-child(4){width:22%;text-align:center}
    .report-onepage .matrix th:first-child,.report-onepage .matrix td:first-child{width:32%;text-align:left}.report-onepage .matrix th,.report-onepage .matrix td{text-align:center}.report-onepage .matrix td:first-child{font-weight:700;color:#344054}.report-onepage .matrix td:last-child,.report-onepage .matrix th:last-child{font-weight:900;text-align:right}.report-onepage .matrix .total{font-weight:900}
    .report-onepage .subsection{font-weight:900;font-size:9.5px;color:#344054;padding:6px 6px 4px;border-bottom:2px solid #172033;margin-top:8px}.report-onepage .two-col{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:8px}.report-onepage .two-col table{border-top:1px solid #d9dee7;border-radius:7px}.report-onepage .two-col .subsection+table th,.report-onepage .two-col .subsection+table td{padding:5px 6px}
    .report-onepage .foot{font-size:7.5px;color:#667085;margin-top:8px;padding-top:5px;border-top:1px solid #eaecf0}.report-onepage .warn{border:1px solid #f2c94c;background:#fffaeb;color:#7a5b00;padding:6px 8px;margin-top:7px;border-radius:7px;font-size:8.5px}
    .report-onepage.preview-portrait{max-width:820px;margin:0 auto}.report-onepage.preview-landscape{max-width:1100px;margin:0 auto}
    @media(max-width:700px){.report-onepage{padding:10px;border-radius:10px;font-size:9px;box-shadow:none}.report-title{align-items:flex-start;flex-direction:column;gap:5px}.report-title h1{font-size:16px}.print-orientation{margin-left:0;width:100%;justify-content:space-between}.print-orientation-label{flex:1}.report-onepage .two-col{grid-template-columns:1fr}.report-onepage th,.report-onepage td{padding:5px 4px}}
    @media print{
      @page{size:A4 portrait;margin:7mm}
      .report-onepage{border:0!important;border-radius:0!important;box-shadow:none!important;padding:0!important;font-size:8.7px;line-height:1.1;max-height:270mm;overflow:hidden}
      body.workneo-print-landscape .report-onepage{font-size:8.8px;max-height:190mm}
      .report-title{padding:0 0 6px;margin-bottom:5px;border-bottom:2px solid #172033}.report-title h1{font-size:15px}.report-meta{font-size:8px}.report-section{font-size:8.8px;padding:4px 6px;margin-top:5px}.report-onepage th,.report-onepage td{padding:3px 4px}.report-onepage th{font-size:7.5px}.report-onepage .two-col{gap:6px;margin-top:5px}.report-onepage .subsection{font-size:8.5px;padding:4px 4px 3px;margin-top:5px}.report-onepage .foot{font-size:6.6px;margin-top:5px}.report-onepage .warn{font-size:7.5px;padding:4px 5px;margin-top:4px}
      body.workneo-print-portrait .report-onepage .matrix th:first-child,body.workneo-print-portrait .report-onepage .matrix td:first-child{width:36%}
      body.workneo-print-portrait .report-onepage .matrix th,body.workneo-print-portrait .report-onepage .matrix td{font-size:7.8px}
      body.workneo-print-landscape .report-onepage .matrix th,body.workneo-print-landscape .report-onepage .matrix td{font-size:8px}
    }
  `;document.head.appendChild(s)}
  function orientation(v){const land=v==='landscape';document.body.classList.toggle(L,land);document.body.classList.toggle(P,!land);try{localStorage.setItem('workneo-print-orientation',land?'landscape':'portrait')}catch(_){ }const r=document.querySelector('.report-onepage');if(r){r.classList.toggle('preview-landscape',land);r.classList.toggle('preview-portrait',!land)}document.querySelectorAll('.print-orientation button').forEach(b=>b.classList.toggle('active',b.dataset.orientation===(land?'landscape':'portrait')));const pb=document.getElementById('prod-print');if(pb)pb.textContent=land?'🖨️ IMPRIMIR A4 · PAISAGEM':'🖨️ IMPRIMIR A4 · RETRATO'}
  function saved(){try{return localStorage.getItem('workneo-print-orientation')==='landscape'?'landscape':'portrait'}catch(_){return'portrait'}}
  function install(){style();const f=document.querySelector('.report-filter'),pb=document.getElementById('prod-print');if(!f||!pb)return;let c=f.querySelector('.print-orientation');if(!c){c=document.createElement('div');c.className='print-orientation';c.innerHTML='<span class="print-orientation-label">A4:</span><button type="button" data-orientation="portrait" title="A4 retrato">↕ Retrato</button><button type="button" data-orientation="landscape" title="A4 paisagem">↔ Paisagem</button>';f.insertBefore(c,pb);c.querySelectorAll('button').forEach(b=>b.onclick=()=>orientation(b.dataset.orientation))}const o=saved();orientation(o);pb.onclick=()=>{orientation(document.body.classList.contains(L)?'landscape':'portrait');window.print()}}
  function boot(){style();install();new MutationObserver(install).observe(document.body,{childList:true,subtree:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
