function textOf(el){return String(el?.textContent||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toUpperCase();}
function openNewCostura(tab){
  if(typeof window.workneoOpenCostura==='function'){window.workneoOpenCostura(tab);return true;}
  const b=document.getElementById('cd-send-main');
  if(b){b.click();const run=()=>{const t=document.querySelector(`#costura-dispatch-overlay .cd-tab[data-tab="${tab}"]`);if(t)t.click()};setTimeout(run,0);return true}
  return false;
}
function guard(e){
  const el=e.target?.closest?.('button');
  if(!el)return;
  const t=textOf(el);
  const oldCostureiras=el.classList.contains('prod-tab') && t.includes('COSTUREIRAS');
  const oldGenerate=t.includes('GERAR RELATORIO') || t.includes('GERAR RELATÓRIO');
  if(oldCostureiras || oldGenerate){
    e.preventDefault();
    e.stopImmediatePropagation();
    openNewCostura(oldGenerate?'relatorios':'enviar');
  }
}
function boot(){document.addEventListener('click',guard,true);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
