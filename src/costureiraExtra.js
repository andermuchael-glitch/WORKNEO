// Adiciona modalidades extras à lista de costureiras sem alterar o fluxo existente.
(function(){
  const EXTRAS=['COSTURA INTERNA'];
  function addExtras(){
    document.querySelectorAll('select').forEach(function(sel){
      const hasCostureira=Array.from(sel.options).some(function(o){
        return /costureira|escolha a costureira|costura interna/i.test(String(o.textContent||''));
      });
      if(!hasCostureira)return;
      EXTRAS.forEach(function(name){
        const exists=Array.from(sel.options).some(function(o){
          return String(o.value||o.textContent||'').trim().toUpperCase()===name;
        });
        if(!exists){
          const opt=document.createElement('option');
          opt.value=name;
          opt.textContent=name;
          sel.appendChild(opt);
        }
      });
    });
  }
  function start(){
    addExtras();
    new MutationObserver(addExtras).observe(document.body,{childList:true,subtree:true});
    setInterval(addExtras,500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
