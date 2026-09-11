(() => {
  const LISTS_KEY = 'almox-lists';
  const CURRENT_KEY = 'almox-current';
  const norm = (v) => String(v ?? '').trim();
  const esc = (v) => String(v ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const keyOf = (p,c) => `${p}__${c}`;

  function readLists(){
    try { const v = JSON.parse(localStorage.getItem(LISTS_KEY) || '[]'); return Array.isArray(v) ? v : []; }
    catch { return []; }
  }
  function currentList(){
    const id = norm(localStorage.getItem(CURRENT_KEY));
    return readLists().find(l => String(l?.id) === id) || null;
  }
  function itemsOf(list){
    return Object.values(list?.items || {}).filter(v => v?.product && Number(v.total) > 0);
  }

  function saveOrder(product, color, orderNumber){
    const lists = readLists();
    const id = norm(localStorage.getItem(CURRENT_KEY));
    let changed = false;
    const next = lists.map(list => {
      if(String(list?.id) !== id) return list;
      const items = {...(list.items || {})};
      const k = keyOf(product, color);
      const old = items[k] || {product, color, total:0};
      const value = norm(orderNumber);
      items[k] = {...old, product, color, orderNumber:value};
      changed = true;
      return {...list, items};
    });
    if(changed) localStorage.setItem(LISTS_KEY, JSON.stringify(next));
  }

  function addStyle(){
    if(document.getElementById('order-number-style')) return;
    const s=document.createElement('style');
    s.id='order-number-style';
    s.textContent=`
      .order-manager{border:1px solid #dfe5ee;border-radius:16px;overflow:hidden;background:#fff;margin-top:12px}
      .order-manager-head{padding:14px 16px;background:#f5f8fc;font-weight:900;color:#172033}
      .order-manager-row{display:grid;grid-template-columns:minmax(180px,1fr) 120px 130px;gap:10px;align-items:center;padding:10px 14px;border-top:1px solid #edf0f4}
      .order-manager-product{font-weight:800}.order-manager-color{font-size:12px;color:#667085}
      .order-number-input{width:100%;box-sizing:border-box;border:1px solid #cbd3df;border-radius:10px;padding:10px 11px;font-size:14px;font-weight:700}
      .order-manager-save{border:0;border-radius:10px;padding:10px 12px;background:#1769e0;color:#fff;font-weight:800;cursor:pointer}
      .order-saved{font-size:11px;color:#14804a;font-weight:800;min-height:15px}
      @media(max-width:700px){.order-manager-row{grid-template-columns:1fr 110px}.order-manager-save{grid-column:2}.order-manager-product{grid-column:1/-1}}
    `;
    document.head.appendChild(s);
  }

  function getProductionBody(){ return document.querySelector('#production-panel .prod-body'); }

  function renderManager(){
    addStyle();
    const panel=document.querySelector('#production-panel');
    const body=getProductionBody();
    const list=currentList();
    if(!panel || !body || !list) return;
    const items=itemsOf(list);
    body.innerHTML=`
      <div class="prod-toolbar">
        <button class="prod-action prod-secondary" id="order-manager-back">← VOLTAR</button>
      </div>
      <div class="prod-note"><b>NÚMERO DO PEDIDO:</b> informe o pedido correspondente a cada produto/cor. Um mesmo lote pode reunir itens de pedidos diferentes.</div>
      <div class="order-manager">
        <div class="order-manager-head">📋 ITENS DA LISTA — NÚMERO DO PEDIDO</div>
        ${items.length ? items.map((item,i)=>`
          <div class="order-manager-row" data-order-row="${i}">
            <div><div class="order-manager-product">${esc(item.product)}</div><div class="order-manager-color">COR: ${esc(item.color || 'SEM COR')} · QTD: ${esc(item.total)}</div></div>
            <input class="order-number-input" data-order-input="${i}" value="${esc(item.orderNumber || '')}" inputmode="numeric" placeholder="Nº pedido">
            <button class="order-manager-save" data-order-save="${i}">SALVAR</button>
            <div class="order-saved" data-order-status="${i}"></div>
          </div>`).join('') : '<div class="prod-empty">Nenhum item lançado nesta lista.</div>'}
      </div>`;

    panel.querySelector('#order-manager-back')?.addEventListener('click',()=>{
      const tab=[...panel.querySelectorAll('.prod-tab')].find(b=>/Materiais/i.test(b.textContent));
      if(tab) tab.click();
    });
    items.forEach((item,i)=>{
      const input=panel.querySelector(`[data-order-input="${i}"]`);
      const save=panel.querySelector(`[data-order-save="${i}"]`);
      const status=panel.querySelector(`[data-order-status="${i}"]`);
      save?.addEventListener('click',()=>{
        saveOrder(item.product,item.color,input?.value||'');
        if(status) status.textContent='✓ SALVO';
      });
      input?.addEventListener('keydown',e=>{if(e.key==='Enter')save?.click()});
    });
  }

  function installButton(){
    const body=getProductionBody();
    if(!body || body.querySelector('#order-numbers-button')) return;
    const toolbar=body.querySelector('.prod-toolbar');
    if(!toolbar) return;
    const btn=document.createElement('button');
    btn.id='order-numbers-button';
    btn.className='prod-action prod-secondary';
    btn.textContent='📌 NÚMEROS DOS PEDIDOS';
    btn.addEventListener('click',renderManager);
    toolbar.appendChild(btn);
  }

  function patchReport(){
    const report=document.querySelector('.report-onepage');
    if(!report) return;
    const list=currentList();
    if(!list) return;
    const map=new Map(itemsOf(list).map(v=>[keyOf(v.product,v.color),norm(v.orderNumber)]));
    const table=report.querySelector('table.products');
    if(!table) return;
    const head=table.querySelector('thead tr');
    const cells=head?.children;
    if(cells && cells.length>=4) cells[3].textContent='NÚMERO DO PEDIDO';
    [...table.querySelectorAll('tbody tr')].forEach(tr=>{
      const td=tr.children;
      if(!td || td.length<4) return;
      const product=norm(td[0].textContent);
      const color=norm(td[2].textContent);
      const order=map.get(keyOf(product,color)) || '';
      td[3].textContent=order || '—';
    });
  }

  function boot(){
    addStyle();
    const observer=new MutationObserver(()=>{
      installButton();
      patchReport();
    });
    observer.observe(document.body,{childList:true,subtree:true});
    installButton();
    patchReport();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
