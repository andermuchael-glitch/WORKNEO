/* WORKNEO — cabeçalho profissional do relatório. Seguro para MutationObserver. */
(function(){
  const STYLE_ID='workneo-report-header-v1';
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function style(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');s.id=STYLE_ID;s.textContent=`
      .report-title{display:grid;grid-template-columns:1fr 1.55fr 1fr;align-items:center;gap:18px;border:0!important;border-bottom:3px solid #1769e0!important;padding:2px 2px 11px!important;margin:0 0 9px!important;min-height:62px}
      .report-brand{display:flex;align-items:center;gap:9px;min-width:0}.report-brand-mark{width:42px;height:42px;border-radius:12px;background:linear-gradient(145deg,#0d4f91,#1769e0);position:relative;flex:0 0 42px;box-shadow:0 5px 12px #1769e033}.report-brand-mark:before{content:'';position:absolute;left:9px;right:9px;bottom:8px;height:21px;border:3px solid #fff;border-radius:4px 4px 8px 8px}.report-brand-mark:after{content:'';position:absolute;left:13px;top:7px;width:14px;height:13px;border:3px solid #fff;border-bottom:0;border-radius:9px 9px 0 0}
      .report-brand-name{font-size:21px;line-height:1;font-weight:950;letter-spacing:-.04em;color:#101828}.report-brand-name span{color:#1769e0}.report-brand-sub{font-size:6.5px;letter-spacing:.16em;font-weight:800;color:#667085;margin-top:4px;white-space:nowrap}
      .report-heading{text-align:center}.report-heading h1{font-size:20px;line-height:1.05;letter-spacing:-.025em;margin:0;color:#102a4c;font-weight:950;text-transform:uppercase}.report-kicker{font-size:8px;letter-spacing:.28em;font-weight:900;color:#1769e0;margin-top:5px}.report-slogan{font-size:7.5px;color:#667085;margin-top:5px}
      .report-header-badge{justify-self:end;text-align:left;border:1px solid #cbdbea;background:#f0f6fc;border-radius:12px;padding:9px 11px;min-width:125px;box-sizing:border-box}.report-header-badge b{display:block;font-size:9px;color:#1769e0;letter-spacing:.04em}.report-header-badge span{display:block;font-size:7.5px;color:#475467;margin-top:4px;line-height:1.35}
      .report-info-grid{display:grid;grid-template-columns:1.15fr 1.35fr 1fr .9fr;gap:7px;margin:0 0 10px}.report-info-card{border:1px solid #d6e0ea;border-radius:10px;background:linear-gradient(180deg,#f8fbfe,#eef5fb);padding:8px 10px;min-height:43px;box-sizing:border-box}.report-info-label{font-size:7px;font-weight:900;letter-spacing:.08em;color:#1769e0;text-transform:uppercase;margin-bottom:3px}.report-info-value{font-size:10.5px;font-weight:900;color:#172033;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.report-info-value.qty{font-size:16px;color:#0d4f91}
      @media(max-width:700px){.report-title{grid-template-columns:1fr!important;gap:7px;min-height:0;text-align:center}.report-brand{justify-content:center}.report-header-badge{justify-self:center}.report-info-grid{grid-template-columns:1fr 1fr}.report-info-card{min-width:0}}
      @media print{.report-title{padding:0 0 6px!important;margin-bottom:5px!important;min-height:50px}.report-brand-mark{width:34px;height:34px;flex-basis:34px;border-radius:9px}.report-brand-name{font-size:17px}.report-brand-sub{font-size:5.5px}.report-heading h1{font-size:15px}.report-kicker{font-size:6.5px}.report-slogan{font-size:6.2px}.report-header-badge{padding:6px 8px;min-width:100px}.report-header-badge b{font-size:7.5px}.report-header-badge span{font-size:6.3px}.report-info-grid{gap:5px;margin-bottom:6px}.report-info-card{padding:6px 8px;min-height:34px}.report-info-label{font-size:6px}.report-info-value{font-size:8.5px}.report-info-value.qty{font-size:13px}}
    `;document.head.appendChild(s);
  }
  function enhance(report){
    if(!report||report.dataset.workneoHeader==='1')return;
    const title=report.querySelector('.report-title');if(!title)return;
    const metas=report.querySelectorAll('.report-meta');
    let cost='TODAS AS COSTUREIRAS',list='—',date=new Date().toLocaleDateString('pt-BR'),qty='0';
    if(metas[0]){const t=metas[0].innerText.replace(/\s+/g,' ');const m=t.match(/COSTUREIRA:\s*(.*?)\s*·\s*LISTA:\s*(.*)$/i);if(m){cost=m[1].trim();list=m[2].trim();}}
    if(metas[1]){const t=metas[1].innerText.replace(/\s+/g,' ');const d=t.match(/DATA:\s*(.*?)\s+PEÇAS:/i);const q=t.match(/PEÇAS:\s*(.*)$/i);if(d)date=d[1].trim();if(q)qty=q[1].trim();}
    title.innerHTML=`<div class="report-brand"><div class="report-brand-mark" aria-hidden="true"></div><div><div class="report-brand-name">WORK<span>NEO</span></div><div class="report-brand-sub">SOLUÇÕES EM PRODUÇÃO</div></div></div><div class="report-heading"><h1>RELATÓRIO DE MATERIAIS</h1><div class="report-kicker">PARA COSTURA</div><div class="report-slogan">Organização, precisão e controle da produção</div></div><div class="report-header-badge"><b>CONTROLE DE PRODUÇÃO</b><span>Materiais calculados<br>por ficha técnica</span></div>`;
    const info=document.createElement('div');info.className='report-info-grid';info.innerHTML=`<div class="report-info-card"><div class="report-info-label">Costureira</div><div class="report-info-value">${escapeHtml(cost)}</div></div><div class="report-info-card"><div class="report-info-label">Lista</div><div class="report-info-value">${escapeHtml(list)}</div></div><div class="report-info-card"><div class="report-info-label">Data da separação</div><div class="report-info-value">${escapeHtml(date)}</div></div><div class="report-info-card"><div class="report-info-label">Quantidade de peças</div><div class="report-info-value qty">${escapeHtml(qty)}</div></div>`;
    title.after(info);report.dataset.workneoHeader='1';
  }
  function run(){
    style();
    const reports=document.querySelectorAll('.report-onepage');
    reports.forEach(enhance);
  }
  function boot(){
    run();
    let pending=false;
    const observer=new MutationObserver(()=>{if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;run()})});
    observer.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
