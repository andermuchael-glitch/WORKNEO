// Corrige um caso de estado antigo do módulo de costura:
// quando a lista muda, o rascunho anterior pode ficar vazio e ocultar os itens.
(function(){
  function repair(){
    const overlay=document.getElementById('costura-dispatch-overlay');
    if(!overlay)return;
    const rows=overlay.querySelectorAll('.cd-row');
    const card=Array.from(overlay.querySelectorAll('.cd-card')).find(x=>/ITENS DISPONÍVEIS NA SEPARAÇÃO/i.test(x.textContent||''));
    const clear=overlay.querySelector('#cd-none');
    if(card&&clear&&!rows.length){
      clear.click();
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',repair);else repair();
  new MutationObserver(repair).observe(document.body,{childList:true,subtree:true});
  setInterval(repair,500);
})();
