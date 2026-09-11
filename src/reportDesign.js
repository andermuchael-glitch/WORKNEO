(function(){
  const STYLE_ID='workneo-report-design-v2';
  function inject(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style'); s.id=STYLE_ID;
    s.textContent=`
      .report-filter{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;margin:0 0 12px;border:1px solid #e4e7ec;border-radius:14px;background:#f8fafc}
      .report-filter label{font-size:12px;letter-spacing:.03em;color:#475467}
      .report-select{min-width:180px;border:1px solid #d0d5dd;border-radius:10px;padding:9px 11px;background:#fff;color:#101828;font-weight:700}
      .report-orientation{display:flex;align-items:center;gap:4px;padding:3px;border:1px solid #d0d5dd;border-radius:11px;background:#fff;margin-left:auto}
      .report-orientation button{border:0;border-radius:8px;padding:8px 11px;background:transparent;color:#475467;font-weight:800;font-size:11px;cursor:pointer}
      .report-orientation button.active{background:#172033;color:#fff;box-shadow:0 2px 5px #0002}
      .report-onepage{font-family:Arial,sans-serif;font-size:10px;line-height:1.18;color:#101828;background:#fff;border:1px solid #d9dee7;border-radius:14px;padding:14px;box-sizing:border-box;box-shadow:0 5px 18px #10182810}
      .report-title{display:flex;justify-content:space-between;align-items:center;gap:20px;border:0;border-bottom:3px solid #172033;padding:0 0 10px;margin:0 0 9px}
      .report-title h1{font-size:19px;letter-spacing:-.02em;margin:0 0 5px;color:#101828}
      .report-meta{font-size:9.5px;color:#667085;line-height:1.35}
      .report-meta b{color:#101828}
      .report-section{font-weight:900;font-size:10.5px;letter-spacing:.02em;color:#fff;background:#172033;border:0;border-radius:7px 7px 0 0;padding:6px 8px;margin-top:9px}
      .report-onepage table{width:100%;border-collapse:separate;border-spacing:0;table-layout:fixed;margin:0;border:1px solid #d9dee7;border-top:0;border-radius:0 0 7px 7px;overflow:hidden}
      .report-onepage th,.report-onepage td{border:0;border-bottom:1px solid #eaecf0;padding:5px 6px;line-height:1.15;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      .report-onepage tr:last-child td{border-bottom:0}
      .report-onepage th{font-size:8.5px;font-weight:900;color:#475467;background:#f2f4f7;text-transform:uppercase}
      .report-onepage tbody tr:nth-child(even) td{background:#fafbfc}
      .report-onepage .products th:nth-child(1),.report-onepage .products td:nth-child(1){width:47%;text-align:left;font-weight:700}
      .report-onepage .products th:nth-child(2),.report-onepage .products td:nth-child(2){width:11%;text-align:center;font-weight:800}
      .report-onepage .products th:nth-child(3),.report-onepage .products td:nth-child(3){width:20%;text-align:center}
      .report-onepage .products th:nth-child(4),.report-onepage .products td:nth-child(4){width:22%;text-align:center}
      .report-onepage .matrix th:first-child,.report-onepage .matrix td:first-child{width:32%;text-align:left}
      .report-onepage .matrix th,.report-onepage .matrix td{text-align:center}
      .report-onepage .matrix td:first-child{font-weight:700;color:#344054}
      .report-onepage .matrix td:last-child,.report-onepage .matrix th:last-child{font-weight:900;text-align:right}
      .report-onepage .matrix .total{font-weight:900}
      .report-onepage .subsection{font-weight:900;font-size:9.5px;color:#344054;padding:6px 6px 4px;border-bottom:2px solid #172033;margin-top:8px}
      .report-onepage .two-col{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:8px}
      .report-onepage .two-col table{border-top:1px solid #d9dee7;border-radius:7px}
      .report-onepage .two-col .subsection+table th,.report-onepage .two-col .subsection+table td{padding:5px 6px}
      .report-onepage .foot{font-size:7.5px;color:#667085;margin-top:8px;padding-top:5px;border-top:1px solid #eaecf0}
      .report-onepage .warn{border:1px solid #f2c94c;background:#fffaeb;color:#7a5b00;padding:6px 8px;margin-top:7px;border-radius:7px;font-size:8.5px}
      .report-onepage .products td:nth-child(3){font-weight:800}
      .report-onepage .products td:nth-child(3)::first-letter{font-weight:900}
      body.workneo-print-portrait .report-onepage{max-width:100%;}
      body.workneo-print-landscape .report-onepage{max-width:100%;}
      @media(max-width:700px){
        .report-onepage{padding:10px;border-radius:10px;font-size:9px;box-shadow:none}
        .report-title{align-items:flex-start;flex-direction:column;gap:5px}
        .report-title h1{font-size:16px}
        .report-orientation{margin-left:0}
        .report-onepage .two-col{grid-template-columns:1fr}
        .report-onepage th,.report-onepage td{padding:5px 4px}
      }
      @media print{
        @page{size:A4 portrait;margin:7mm}
        html,body{margin:0!important;background:#fff!important}
        body.workneo-print-landscape @page{size:A4 landscape;margin:5mm}
        body.workneo-print-portrait @page{size:A4 portrait;margin:7mm}
        .report-onepage{border:0!important;border-radius:0!important;box-shadow:none!important;padding:0!important;font-size:9px;line-height:1.1;max-height:270mm;overflow:hidden}
        body.workneo-print-landscape .report-onepage{font-size:8.8px;max-height:190mm}
        body.workneo-print-portrait .report-onepage{font-size:8.7px;max-height:270mm}
        .report-title{padding:0 0 6px;margin-bottom:5px;border-bottom:2px solid #172033}
        .report-title h1{font-size:15px}
        .report-meta{font-size:8px}
        .report-section{font-size:8.8px;padding:4px 6px;margin-top:5px}
        .report-onepage th,.report-onepage td{padding:3px 4px}
        .report-onepage th{font-size:7.5px}
        .report-onepage .two-col{gap:6px;margin-top:5px}
        .report-onepage .subsection{font-size:8.5px;padding:4px 4px 3px;margin-top:5px}
        .report-onepage .foot{font-size:6.6px;margin-top:5px}
        .report-onepage .warn{font-size:7.5px;padding:4px 5px;margin-top:4px}
      }
    `;
    document.head.appendChild(s);
  }
  function enhance(){
    inject();
    const filter=document.querySelector('.report-filter');
    const report=document.querySelector('.report-onepage');
    if(!filter||!report) return;
    if(!document.getElementById('report-orientation')){
      const wrap=document.createElement('div'); wrap.className='report-orientation'; wrap.id='report-orientation';
      wrap.innerHTML='<button type="button" data-orientation="portrait">↕ RETRATO</button><button type="button" data-orientation="landscape">↔ PAISAGEM</button>';
      filter.appendChild(wrap);
      wrap.querySelectorAll('button').forEach(btn=>btn.onclick=()=>setOrientation(btn.dataset.orientation));
    }
    const saved=localStorage.getItem('workneo-print-orientation')||'portrait';
    setOrientation(saved,false);
  }
  function setOrientation(mode,save=true){
    mode=mode==='landscape'?'landscape':'portrait';
    document.body.classList.toggle('workneo-print-landscape',mode==='landscape');
    document.body.classList.toggle('workneo-print-portrait',mode==='portrait');
    const box=document.getElementById('report-orientation');
    if(box) box.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.orientation===mode));
    if(save) localStorage.setItem('workneo-print-orientation',mode);
    const print=document.getElementById('prod-print');
    if(print) print.textContent=mode==='landscape'?'🖨️ IMPRIMIR A4 · PAISAGEM':'🖨️ IMPRIMIR A4 · RETRATO';
  }
  const observer=new MutationObserver(()=>enhance());
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>{observer.observe(document.body,{childList:true,subtree:true});enhance();});
  else {observer.observe(document.body,{childList:true,subtree:true});enhance();}
})();
