(function(){
  const COSTURA_INTERNA='COSTURA INTERNA';
  const NEW_KEY='workneo-costura-lotes-v2';
  const LEGACY_KEY='workneo-costureiras-relatorio-v1';
  const EXCLUDED=new Set(['MÁSCARA PROTETORA','MOUSE PAD','MOUSE PAD GAMER','PORTA COPOS']);
  const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k)||'');return v??f}catch{return f}};
  const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  function migrateLegacy(){
    const legacy=read(LEGACY_KEY,[]); if(!Array.isArray(legacy)||!legacy.length)return;
    const current=read(NEW_KEY,[]); if(!Array.isArray(current))return;
    const existing=new Set(current.map(x=>String(x?.id||'')));
    const groups=new Map();
    legacy.forEach(x=>{
      if(!x||!x.product||!x.listId||!x.costureira)return;
      const created=String(x.createdAt||new Date().toISOString());
      const date=created.slice(0,10);
      const pedido=String(x.orderNumber||x.numeroPedido||x.pedido||'').trim()||'—';
      const seam=String(x.costureira).trim()||'—';
      const k=[String(x.listId),seam,pedido,date].join('|');
      if(!groups.has(k))groups.set(k,{id:'legacy-'+btoa(unescape(encodeURIComponent(k))).replace(/[^a-zA-Z0-9]/g,'').slice(0,70),date,costureira:seam,pedido,listId:String(x.listId),listName:String(x.listName||''),createdAt:created,items:[]});
      groups.get(k).items.push({product:String(x.product),color:String(x.color||'SEM COR'),qty:Number(x.qty||0)});
    });
    const additions=[...groups.values()].filter(x=>x.items.some(i=>i.qty>0)&&!existing.has(String(x.id)));
    if(additions.length)save(NEW_KEY,[...current,...additions]);
  }
  function addInternal(){
    document.querySelectorAll('select').forEach(sel=>{
      const options=[...sel.options];
      const seamSelect=sel.id==='cd-cost'||sel.id==='cd-r-cost'||options.some(o=>/escolha a costureira|costureira/i.test(String(o.textContent||'')));
      if(!seamSelect)return;
      if(!options.some(o=>String(o.value||o.textContent||'').trim().toUpperCase()===COSTURA_INTERNA)){
        const o=document.createElement('option');o.value=COSTURA_INTERNA;o.textContent=COSTURA_INTERNA;sel.appendChild(o);
      }
    });
  }
  migrateLegacy();
  function start(){addInternal();new MutationObserver(()=>addInternal()).observe(document.body,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
