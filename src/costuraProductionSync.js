// Sincroniza os envios novos da Costura com o relatório da aba Produção.
// Mantém compatibilidade com o relatório antigo sem alterar as listas ou os lotes.
(function(){
  const LOTS_KEY='workneo-costura-lotes-v2';
  const REPORT_KEY='workneo-costureiras-relatorio-v1';
  function read(key){try{const x=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(x)?x:[]}catch(_){return[]}}
  function sync(){
    const lots=read(LOTS_KEY);
    if(!lots.length)return;
    const old=read(REPORT_KEY);
    const map=new Map(old.map(x=>[String(x.id),x]));
    lots.forEach(l=>{
      (l.items||[]).forEach((item,idx)=>{
        const id='dispatch:'+String(l.id)+':'+idx;
        if(!map.has(id)) map.set(id,{id,product:item.product,color:item.color||'',qty:Number(item.qty)||0,costureira:l.costureira||'',listId:l.listId||'',listName:l.listName||'',pedido:l.pedido||'',date:l.date||'',createdAt:l.createdAt||new Date().toISOString()});
      });
    });
    localStorage.setItem(REPORT_KEY,JSON.stringify([...map.values()]));
  }
  try{sync();window.addEventListener('storage',e=>{if(e.key===LOTS_KEY)sync()});}catch(_){ }
})();
