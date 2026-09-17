// Correção definitiva da origem do relatório de costura.
// O histórico é gravado no momento da baixa e representa a quantidade realmente enviada.
(function(){
  const KEY='workneo-costura-lotes-v2';
  const VERSION='costura-history-v3';
  const norm=s=>String(s??'').trim().toUpperCase();
  const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'');return Array.isArray(v)?v:f}catch{return f}};
  const allLists=()=>[...read('almox-lists',[]),...read('almox-archived-lists-v1',[])];
  function rebuild(){
    const groups=new Map(),events=new Set();
    for(const list of allLists()){
      for(const h of (Array.isArray(list.history)?list.history:[])){
        if(String(h.type||'').toLowerCase()!=='costura'||!h.product||!h.costureira)continue;
        const qty=Math.abs(Number(h.qty)||0);if(qty<=0)continue;
        const at=String(h.at||''),date=at.slice(0,10),pedido=String(h.pedido||'').trim(),color=String(h.color||'SEM COR').trim()||'SEM COR';
        const eventKey=[String(list.id||''),at,norm(h.costureira),pedido,norm(h.product),norm(color),qty].join('|');
        if(events.has(eventKey))continue;events.add(eventKey);
        const key=[String(list.id||''),date,norm(h.costureira),pedido].join('|');
        let g=groups.get(key);
        if(!g)g={id:'history-'+groups.size+'-'+Date.now(),date,costureira:String(h.costureira).trim(),pedido,listId:String(list.id||''),listName:String(list.name||''),createdAt:at,items:[]};
        const old=g.items.find(x=>norm(x.product)===norm(h.product)&&norm(x.color)===norm(color));
        if(old)old.qty+=qty;else g.items.push({product:String(h.product).trim(),color,qty});
        groups.set(key,g);
      }
    }
    const rebuilt=[...groups.values()].filter(x=>x.items.length);
    if(!rebuilt.length)return false;
    const before=JSON.stringify(read(KEY,[]));
    const after=JSON.stringify(rebuilt);
    if(before===after)return false;
    localStorage.setItem(KEY,after);
    localStorage.setItem(VERSION,'1');
    return true;
  }
  const changed=rebuild();
  if(changed&&!sessionStorage.getItem(VERSION+'-reloaded')){
    sessionStorage.setItem(VERSION+'-reloaded','1');
    location.reload();
  }
})();