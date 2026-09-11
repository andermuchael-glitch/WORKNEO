/* WORKNEO — impressão A4 retrato/paisagem. Correção: evita loop do MutationObserver. */
(function(){
  const STYLE_ID='workneo-print-orientation-style-v4';
  const P='workneo-print-portrait', L='workneo-print-landscape';
  const ORIENT='workneo-print-orientation';

  function style(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .report-filter{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:11px 12px;margin:0 0 12px;border:1px solid #e4e7ec;border-radius:14px;background:#f8fafc;box-shadow:0 2px 8px #1018280a}
      .report-filter label{font-size:12px;letter-spacing:.03em;color:#475467;font-weight:800}
      .report-select{min-width:180px;border:1px solid #d0d5dd;border-radius:10px;padding:9px 11px;background:#fff;color:#101828;font-weight:700}
      .print-orientation{display:inline-flex;align-items:center;gap:3px;padding:3px;border:1px solid #d0d5dd;border-radius:11px;background:#fff;margin-left:auto}
      .print-orientation-label{padding:0 5px 0 7px;font-size:11px;font-weight:900;color:#475467}
      .print-orientation button{border:0;border-radius:8px;padding:8px 10px;background:transparent;color:#344054;font-weight:800;cursor:pointer;font-size:11px}
      .print-orientation button.active{background:#1769e0;color:#fff;box-shadow:0 2px 5px #0002}
      .report-onepage{font-family:Arial,sans-serif;font-size:10px;line-height:1.18;color:#101828;background:#fff;border:1px solid #d9dee7;border-radius:14px;padding:14px;box-sizing:border-box;box-shadow:0 5px 18px #10182810}
      .report-onepage.preview-portrait{max-width:820px;margin:0 auto}.report-onepage.preview-landscape{max-width:1100px;margin:0 auto}
      @media(max-width:700px){.report-onepage{padding:10px;border-radius:10px;font-size:9px;box-shadow:none}.print-orientation{margin-left:0;width:100%;justify-content:space-between}.print-orientation-label{flex:1}}
      @media print{
        @page{size:A4 portrait;margin:7mm}
        html,body{margin:0!important;background:#fff!important}
        body.workneo-print-landscape @page{size:A4 landscape;margin:5mm}
        .report-onepage{border:0!important;border-radius:0!important;box-shadow:none!important;padding:0!important;font-size:8.7px;line-height:1.1;max-height:270mm;overflow:hidden}
        body.workneo-print-landscape .report-onepage{font-size:8.8px;max-height:190mm}
        body.workneo-print-portrait .report-onepage{font-size:8.7px;max-height:270mm}
      }
    `;
    document.head.appendChild(s);
  }

  function setOrientation(mode,save=true){
    mode=mode==='landscape'?'landscape':'portrait';
    const land=mode==='landscape';
    document.body.classList.toggle(L,land);
    document.body.classList.toggle(P,!land);
    if(save){try{localStorage.setItem(ORIENT,mode)}catch(_){}
    }
    const r=document.querySelector('.report-onepage');
    if(r){
      r.classList.toggle('preview-landscape',land);
      r.classList.toggle('preview-portrait',!land);
    }
    document.querySelectorAll('.print-orientation button').forEach(b=>{
      const active=b.dataset.orientation===mode;
      if(b.classList.contains('active')!==active)b.classList.toggle('active',active);
    });
    const pb=document.getElementById('prod-print');
    if(pb){
      const text=land?'🖨️ IMPRIMIR A4 · PAISAGEM':'🖨️ IMPRIMIR A4 · RETRATO';
      /* IMPORTANTE: não reatribuir textContent se já estiver correto.
         Isso evita disparar o MutationObserver em loop. */
      if(pb.textContent!==text)pb.textContent=text;
    }
  }

  function saved(){try{return localStorage.getItem(ORIENT)==='landscape'?'landscape':'portrait'}catch(_){return'portrait'}}

  function install(){
    style();
    const f=document.querySelector('.report-filter');
    const pb=document.getElementById('prod-print');
    if(!f||!pb)return;
    let c=f.querySelector('.print-orientation');
    if(!c){
      c=document.createElement('div');
      c.className='print-orientation';
      c.innerHTML='<span class="print-orientation-label">A4:</span><button type="button" data-orientation="portrait" title="A4 retrato">↕ Retrato</button><button type="button" data-orientation="landscape" title="A4 paisagem">↔ Paisagem</button>';
      f.insertBefore(c,pb);
      c.querySelectorAll('button').forEach(b=>b.onclick=()=>setOrientation(b.dataset.orientation));
    }
    setOrientation(saved(),false);
    const current=pb.dataset.printHandlerInstalled==='1';
    if(!current){
      pb.dataset.printHandlerInstalled='1';
      pb.onclick=()=>{setOrientation(document.body.classList.contains(L)?'landscape':'portrait');window.print()};
    }
  }

  function boot(){
    style();
    const observer=new MutationObserver(()=>{
      /* Agrupa as alterações do relatório e evita reentrância. */
      if(boot.pending)return;
      boot.pending=true;
      requestAnimationFrame(()=>{boot.pending=false;install()});
    });
    observer.observe(document.body,{childList:true,subtree:true});
    install();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
