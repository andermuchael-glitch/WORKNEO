// Adiciona modalidades de costura à lista de costureiras sem alterar o fluxo existente.
(function(){
  const EXTRAS=['COSTURA INTERNA'];
  function addExtras(){
    document.querySelectorAll('select').forEach(function(sel){
      const hasCostureira=Array.from(sel.options).some(function(o){return /costureira|costura interna/i.test(String(o.textContent||''))});
      if(!hasCostureira)return;
      EXTRAS.forEach(function(name){
        if(!Array.from(sel.options).some(function(o){return String(o.value||o.textContent||'').trim().toUpperCase()===name})){
          const opt=document.createElement('option'); opt.value=name; opt.textContent=name; sel.appendChild(opt);
        }
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addExtras);else addExtras();
  const root=document.getElementById('root')||document.body;
  new MutationObserver(addExtras).observe(root,{childList:true,subtree:true});
})();
