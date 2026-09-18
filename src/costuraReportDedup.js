// Reconstrucao segura do relatorio de costura a partir do historico real das baixas.
(function(){
  const KEY='workneo-costura-lotes-v2';
  const VERSION='costura-history-v6';
  const norm=s=>String(s??'').trim().toUpperCase();
  const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'');return Array.isArray(v)?v:f}catch{return f}};
  const allLists=()=>{
    const src=[...read('almox-lists',[]),...read('workneo-listas-arquivadas-v1',[])];
    const map=new Map();
    for(const list of src){
      const id=String(list?.id||'');
      if(!id)continue;
      // A mesma lista pode existir no ativo e no arquivado; o historico deve ser lido uma vez.
      if(!map.has(id))map.set(id,list);
    }
    return [...map.values()];
  };
  function rebuild(){
    const groups=new Map(),events=new Set();
    for(const list of allLists()){
      for(const h of (Array.isArray(list.history)?list.history:[])){
        if(String(h.type||'').toLowerCase()!=='costura'||!h.product||!h.costureira)continue;
        const qty=Math.abs(Number(h.qty)||0);if(qty<=0)continue;
        const at=String(h.at||''),date=at.slice(0,10),pedido=String(h.pedido||'').trim(),color=String(h.color||'SEM COR').trim()||'SEM COR';
        // A mesma baixa pode ter sido gravada repetidamente no historico por versões anteriores.\n        // Para a reconstrução, a combinação lista/data/costureira/pedido/produto/cor/quantidade\n        // identifica uma baixa; cópias idênticas não podem multiplicar o estoque enviado.\n        const eventKey=[String(list.id||''),date,norm(h.costureira),pedido,norm(h.product),norm(color),qty].join('|');
        if(events.has(eventKey))continue;
        events.add(eventKey);
        const key=[String(list.id||''),date,norm(h.costureira),pedido].join('|');
        let g=groups.get(key);
        if(!g)g={id:'history-'+groups.size,date,costureira:String(h.costureira).trim(),pedido,listId:String(list.id||''),listName:String(list.name||''),createdAt:at,items:[]};
        const old=g.items.find(x=>norm(x.product)===norm(h.product)&&norm(x.color)===norm(color));
        if(old)old.qty+=qty;else g.items.push({product:String(h.product).trim(),color,qty});
        groups.set(key,g);
      }
    }
    const rebuilt=[...groups.values()].filter(x=>x.items.length);
    if(!rebuilt.length)return false;
    const before=JSON.stringify(read(KEY,[]));
    const after=JSON.stringify(rebuilt);
    localStorage.setItem(VERSION,'1');
    if(before===after)return false;
    localStorage.setItem(KEY,after);
    return true;
  }
  const changed=rebuild();
  if(changed&&!sessionStorage.getItem(VERSION+'-reloaded')){
    sessionStorage.setItem(VERSION+'-reloaded','1');
    location.reload();
  }
})();