const KEY='workneo-costureiras-relatorio-v1';
function read(k,f){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch(_){return f}}
function availableFor(listId,product,color){
  const lists=read('almox-lists',[]), assignments=read(KEY,[]);
  const list=lists.find(l=>String(l?.id)===String(listId));
  const item=Object.values(list?.items||{}).find(x=>String(x?.product)===String(product)&&String(x?.color||'')===String(color||''));
  if(!item)return 0;
  const used=assignments.filter(a=>String(a?.listId||'')===String(listId)&&String(a?.product||'')===String(product)&&String(a?.color||'')===String(color||'')).reduce((s,a)=>s+Number(a?.qty||0),0);
  return Math.max(0,Number(item.total||0)-used);
}
function sync(){
  const list=document.querySelector('#csi-list'),product=document.querySelector('#csi-product'),color=document.querySelector('#csi-color');
  if(!list||!product||!color||!list.value)return;
  const lists=read('almox-lists',[]),l=lists.find(x=>String(x?.id)===String(list.value));
  if(!l)return;
  const items=Object.values(l.items||{}).filter(x=>x?.product&&Number(x.total)>0);
  const products=[...new Set(items.map(x=>String(x.product)))];
  [...product.options].forEach(o=>{
    if(!o.value)return;
    const rows=items.filter(x=>String(x.product)===String(o.value));
    const has=rows.some(x=>availableFor(l.id,x.product,x.color)>0);
    o.hidden=!has;
  });
  const currentProduct=product.value;if(!currentProduct)return;
  [...color.options].forEach(o=>{
    if(!o.value)return;
    const raw=o.value==='SEM COR'?'':o.value;
    o.hidden=availableFor(l.id,currentProduct,raw)<=0;
  });
  const currentColor=color.value;
  if(currentColor&&color.selectedOptions[0]?.hidden){color.value='';const q=document.querySelector('#csi-qty');if(q){q.value='';q.disabled=true}const s=document.querySelector('#csi-send');if(s)s.disabled=true;}
}
setInterval(sync,300);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync);else sync();