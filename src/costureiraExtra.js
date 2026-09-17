// Ajustes extras da costura sem alterar o fluxo principal.
(function(){
  const EXTRAS=['COSTURA INTERNA'];
  const EXCLUDED=new Set(['MÁSCARA PROTETORA','MOUSE PAD','MOUSE PAD GAMER','PORTA COPOS']);
  let repairing=false;

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

  function hasAvailableItems(){
    try{
      const id=localStorage.getItem('almox-current')||'';
      const lists=JSON.parse(localStorage.getItem('almox-lists')||'[]');
      const list=Array.isArray(lists)?lists.find(function(l){return String(l&&l.id)===String(id)}):null;
      if(!list||!list.items||typeof list.items!=='object')return false;
      return Object.values(list.items).some(function(x){
        return x&&x.product&&!EXCLUDED.has(String(x.product).trim().toUpperCase())&&Number(x.total||0)>0;
      });
    }catch{return false}
  }

  function repairEmptySend(){
    const overlay=document.getElementById('costura-dispatch-overlay');
    if(!overlay||repairing||!hasAvailableItems())return;
    const rows=overlay.querySelectorAll('.cd-row');
    const review=overlay.querySelector('#cd-review');
    const title=Array.from(overlay.querySelectorAll('h3')).some(function(h){
      return /ITENS DISPONÍVEIS NA SEPARAÇÃO/i.test(String(h.textContent||''));
    });
    if(title&&review&&!rows.length){
      repairing=true;
      const close=overlay.querySelector('#cd-close');
      const main=document.getElementById('cd-send-main');
      if(close)close.click();
      setTimeout(function(){
        repairing=false;
        if(main)main.click();
      },80);
    }
  }

  function start(){
    addExtras();
    repairEmptySend();
    new MutationObserver(function(){
      addExtras();
      repairEmptySend();
    }).observe(document.body,{childList:true,subtree:true});
    setInterval(function(){addExtras();repairEmptySend()},700);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();