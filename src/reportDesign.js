/* WORKNEO — design profissional do relatório A4.
   Módulo aditivo: preserva os cálculos e a Aba 1. */
(function(){
  const STYLE_ID='workneo-report-design-v3';
  const ORIENT='workneo-print-orientation';

  function inject(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');s.id=STYLE_ID;
    s.textContent=`
      .report-filter{display:flex;align-items:center;gap:10px;flex-wrap:wrap;padding:10px 12px;margin:0 0 12px;border:1px solid #e4e7ec;border-radius:14px;background:#f8fafc}
      .report-filter label{font-size:12px;letter-spacing:.03em;color:#475467;font-weight:800}
      .report-select{min-width:180px;border:1px solid #d0d5dd;border-radius:10px;padding:9px 11px;background:#fff;color:#101828;font-weight:700}
      .report-orientation{display:flex;align-items:center;gap:4px;padding:3px;border:1px solid #d0d5dd;border-radius:11px;background:#fff;margin-left:auto}
      .report-orientation button{border:0;border-radius:8px;padding:8px 11px;background:transparent;color:#475467;font-weight:800;font-size:11px;cursor:pointer}
      .report-orientation button.active{background:#1769e0;color:#fff;box-shadow:0 2px 5px #0002}

      .report-onepage{font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:1.18;color:#101828;background:#fff;border:1px solid #d9dee7;border-radius:16px;padding:15px;box-sizing:border-box;box-shadow:0 8px 24px #10182812}
      .report-title{display:grid;grid-template-columns:1fr 1.55fr 1fr;align-items:center;gap:18px;border:0;border-bottom:3px solid #1769e0;padding:2px 2px 11px;margin:0 0 9px;min-height:62px}
      .report-brand{display:flex;align-items:center;gap:9px;min-width:0}
      .report-brand-mark{width:42px;height:42px;border-radius:12px;background:linear-gradient(145deg,#0d4f91,#1769e0);position:relative;flex:0 0 42px;box-shadow:0 5px 12px #1769e033}
      .report-brand-mark:before{content:'';position:absolute;left:9px;right:9px;bottom:8px;height:21px;border:3px solid #fff;border-radius:4px 4px 8px 8px}
      .report-brand-mark:after{content:'';position:absolute;left:13px;top:7px;width:14px;height:13px;border:3px solid #fff;border-bottom:0;border-radius:9px 9px 0 0}
      .report-brand-name{font-size:21px;line-height:1;font-weight:950;letter-spacing:-.04em;color:#101828}
      .report-brand-name span{color:#1769e0}
      .report-brand-sub{font-size:6.5px;letter-spacing:.16em;font-weight:800;color:#667085;margin-top:4px;white-space:nowrap}
      .report-heading{text-align:center}
      .report-heading h1{font-size:20px;line-height:1.05;letter-spacing:-.025em;margin:0;color:#102a4c;font-weight:950;text-transform:uppercase}
      .report-heading .report-kicker{font-size:8px;letter-spacing:.28em;font-weight:900;color:#1769e0;margin-top:5px}
      .report-heading .report-slogan{font-size:7.5px;color:#667085;margin-top:5px}
      .report-header-badge{justify-self:end;text-align:left;border:1px solid #cbdbea;background:#f0f6fc;border-radius:12px;padding:9px 11px;min-width:125px;box-sizing:border-box}
      .report-header-badge b{display:block;font-size:9px;color:#1769e0;letter-spacing:.04em}
      .report-header-badge span{display:block;font-size:7.5px;color:#475467;margin-top:4px;line-height:1.35}

      .report-info-grid{display:grid;grid-template-columns:1.15fr 1.35fr 1fr .9fr;gap:7px;margin:0 0 10px}
      .report-info-card{border:1px solid #d6e0ea;border-radius:10px;background:linear-gradient(180deg,#f8fbfe,#eef5fb);padding:8px 10px;min-height:43px;box-sizing:border-box}
      .report-info-label{font-size:7px;font-weight:900;letter-spacing:.08em;color:#1769e0;text-transform:uppercase;margin-bottom:3px}
      .report-info-value{font-size:10.5px;font-weight:900;color:#172033;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .report-info-value.qty{font-size:16px;color:#0d4f91}

      .report-section{font-weight:950;font-size:10.5px;letter-spacing:.025em;color:#fff;background:linear-gradient(90deg,#0d4f91,#1769e0);border:0;border-radius:8px 8px 0 0;padding:7px 9px;margin-top:9px}
      .report-onepage table{width:100%;border-collapse:separate;border-spacing:0;table-layout:fixed;margin:0;border:1px solid #d5dce5;border-top:0;border-radius:0 0 8px 8px;overflow:hidden}
      .report-onepage th,.report-onepage td{border:0;border-bottom:1px solid #e7ebf0;padding:5px 6px;line-height:1.15;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
      .report-onepage tr:last-child td{border-bottom:0}
      .report-onepage th{font-size:8.5px;font-weight:950;color:#30415a;background:#eaf1f7;text-transform:uppercase}
      .report-onepage tbody tr:nth-child(even) td{background:#f9fbfd}
      .report-onepage .products th:nth-child(1),.report-onepage .products td:nth-child(1){width:47%;text-align:left;font-weight:700}
      .report-onepage .products th:nth-child(2),.report-onepage .products td:nth-child(2){width:11%;text-align:center;font-weight:900}
      .report-onepage .products th:nth-child(3),.report-onepage .products td:nth-child(3){width:20%;text-align:center;font-weight:800}
      .report-onepage .products th:nth-child(4),.report-onepage .products td:nth-child(4){width:22%;text-align:center}
      .report-onepage .matrix th:first-child,.report-onepage .matrix td:first-child{width:32%;text-align:left}
      .report-onepage .matrix th,.report-onepage .matrix td{text-align:center}
      .report-onepage .matrix td:first-child{font-weight:800;color:#344054}
      .report-onepage .matrix td:last-child,.report-onepage .matrix th:last-child{font-weight:950;text-align:right;background:#f1f6fb}
      .report-onepage .matrix .total{font-weight:950}
      .report-onepage .subsection{font-weight:950;font-size:9.5px;color:#fff;background:#1769e0;padding:6px 7px;border-radius:7px 7px 0 0;margin-top:8px}
      .report-onepage .two-col{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:0}
      .report-onepage .two-col table{border-top:1px solid #d5dce5;border-radius:0 0 7px 7px}
      .report-onepage .two-col .subsection+table th,.report-onepage .two-col .subsection+table td{padding:5px 6px}
      .report-onepage .foot{font-size:7.5px;color:#667085;margin-top:9px;padding:8px 10px;border:1px solid #d9e6f2;border-radius:8px;background:#f5f9fc}
      .report-onepage .warn{border:1px solid #f2c94c;background:#fffaeb;color:#7a5b00;padding:6px 8px;margin-top:7px;border-radius:7px;font-size:8.5px}

      @media(max-width:700px){
        .report-onepage{padding:10px;border-radius:10px;font-size:9px;box-shadow:none}
        .report-title{grid-template-columns:1fr;gap:7px;min-height:0;text-align:center}
        .report-brand{justify-content:center}.report-heading{text-align:center}.report-header-badge{justify-self:center}
        .report-info-grid{grid-template-columns:1fr 1fr}.report-info-card{min-width:0}
        .report-orientation{margin-left:0}
        .report-onepage .two-col{grid-template-columns:1fr}
        .report-onepage th,.report-onepage td{padding:5px 4px}
      }

      @media print{
        @page{size:A4 portrait;margin:7mm}
        html,body{margin:0!important;background:#fff!important}
        .report-onepage{border:0!important;border-radius:0!important;box-shadow:none!important;padding:0!important;font-size:9px;line-height:1.1;max-height:270mm;overflow:hidden}
        body.workneo-print-landscape .report-onepage{font-size:8.8px;max-height:190mm}
        body.workneo-print-portrait .report-onepage{font-size:8.7px;max-height:270mm}
        .report-title{padding:0 0 6px;margin-bottom:5px;min-height:50px;border-bottom:2px solid #1769e0}
        .report-brand-mark{width:34px;height:34px;flex-basis:34px;border-radius:9px}.report-brand-name{font-size:17px}.report-brand-sub{font-size:5.5px}
        .report-heading h1{font-size:15px}.report-heading .report-kicker{font-size:6.5px}.report-heading .report-slogan{font-size:6.2px}
        .report-header-badge{padding:6px 8px;min-width:100px}.report-header-badge b{font-size:7.5px}.report-header-badge span{font-size:6.3px}
        .report-info-grid{gap:5px;margin-bottom:6px}.report-info-card{padding:6px 8px;min-height:34px}.report-info-label{font-size:6px}.report-info-value{font-size:8.5px}.report-info-value.qty{font-size:13px}
        .report-section{font-size:8.8px;padding:4px 6px;margin-top:5px}
        .report-onepage th,.report-onepage td{padding:3px 4px}.report-onepage th{font-size:7.5px}
        .report-onepage .two-col{gap:6px;margin-top:5px}.report-onepage .subsection{font-size:8.5px;padding:4px 5px;margin-top:0}
        .report-onepage .foot{font-size:6.6px;margin-top:5px;padding:5px 7px}.report-onepage .warn{font-size:7.5px;padding:4px 5px;margin-top:4px}
      }
      @media print and (min-width:900px){body.workneo-print-landscape .report-title{grid-template-columns:1fr 1.7fr 1fr}}
    `;
    document.head.appendChild(s);
  }

  function textParts(report){
    const meta=report.querySelector('.report-meta');
    const first=report.querySelector('.report-title > div:first-child');
    let cost='TODAS AS COSTUREIRAS',list='—',date=new Date().toLocaleDateString('pt-BR'),qty='0';
    if(meta){
      const t=meta.innerText.replace(/\s+/g,' ').trim();
      const m=t.match(/COSTUREIRA:\s*(.*?)\s*·\s*LISTA:\s*(.*?)(?:\s+DATA:|$)/i);if(m){cost=m[1].trim();list=m[2].trim();}
      const d=t.match(/DATA:\s*(.*?)(?:\s+PEÇAS:|$)/i);if(d)date=d[1].trim();
      const q=t.match(/PEÇAS:\s*(.*)$/i);if(q)qty=q[1].trim();
    }
    if(first){const h=first.querySelector('h1');if(h)h.style.display='none';}
    return {cost,list,date,qty};
  }

  function enhanceHeader(report){
    if(report.dataset.workneoHeader==='1') return;
    const p=textParts(report);
    const title=report.querySelector('.report-title');if(!title)return;
    title.innerHTML=`
      <div class="report-brand">
        <div class="report-brand-mark" aria-hidden="true"></div>
        <div><div class="report-brand-name">WORK<span>NEO</span></div><div class="report-brand-sub">SOLUÇÕES EM PRODUÇÃO</div></div>
      </div>
      <div class="report-heading"><h1>RELATÓRIO DE MATERIAIS</h1><div class="report-kicker">PARA COSTURA</div><div class="report-slogan">Organização hoje. Grandes resultados sempre.</div></div>
      <div class="report-header-badge"><b>CONTROLE DE PRODUÇÃO</b><span>Materiais calculados<br>por ficha técnica</span></div>`;

    const info=document.createElement('div');info.className='report-info-grid';
    info.innerHTML=`
      <div class="report-info-card"><div class="report-info-label">Costureira</div><div class="report-info-value">${escapeHtml(p.cost)}</div></div>
      <div class="report-info-card"><div class="report-info-label">Lista</div><div class="report-info-value">${escapeHtml(p.list)}</div></div>
      <div class="report-info-card"><div class="report-info-label">Data da separação</div><div class="report-info-value">${escapeHtml(p.date)}</div></div>
      <div class="report-info-card"><div class="report-info-label">Quantidade de peças</div><div class="report-info-value qty">${escapeHtml(p.qty)}</div></div>`;
    title.after(info);
    report.dataset.workneoHeader='1';
  }

  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function setOrientation(mode,save=true){
    mode=mode==='landscape'?'landscape':'portrait';
    document.body.classList.toggle('workneo-print-landscape',mode==='landscape');
    document.body.classList.toggle('workneo-print-portrait',mode==='portrait');
    if(save){try{localStorage.setItem(ORIENT,mode)}catch(_) {}}
    const box=document.getElementById('report-orientation');
    if(box)box.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.orientation===mode));
    const print=document.getElementById('prod-print');
    if(print)print.textContent=mode==='landscape'?'🖨️ IMPRIMIR A4 · PAISAGEM':'🖨️ IMPRIMIR A4 · RETRATO';
  }

  function enhance(){
    inject();
    const filter=document.querySelector('.report-filter');
    const report=document.querySelector('.report-onepage');
    if(!filter||!report)return;
    enhanceHeader(report);
    if(!document.getElementById('report-orientation')){
      const wrap=document.createElement('div');wrap.className='report-orientation';wrap.id='report-orientation';
      wrap.innerHTML='<button type="button" data-orientation="portrait">↕ RETRATO</button><button type="button" data-orientation="landscape">↔ PAISAGEM</button>';
      filter.appendChild(wrap);
      wrap.querySelectorAll('button').forEach(btn=>btn.onclick=()=>setOrientation(btn.dataset.orientation));
    }
    let saved='portrait';try{saved=localStorage.getItem(ORIENT)||'portrait'}catch(_){}
    setOrientation(saved,false);
  }

  const observer=new MutationObserver(()=>enhance());
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{observer.observe(document.body,{childList:true,subtree:true});enhance();});
  else{observer.observe(document.body,{childList:true,subtree:true});enhance();}
})();
