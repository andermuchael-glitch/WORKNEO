const KEY = 'workneo-costureiras-relatorio-v1';
const norm = (s) => String(s || '').trim().toUpperCase();
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = (n) => Number.isInteger(Number(n)) ? String(Number(n)) : Number(n).toFixed(2).replace(/\.00$/, '');

function listAtual() {
  try {
    const lists = JSON.parse(localStorage.getItem('almox-lists') || '[]');
    const id = localStorage.getItem('almox-current') || '';
    return lists.find((l) => String(l?.id) === String(id)) || null;
  } catch (_) { return null; }
}
function assignments() { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (_) { return []; } }
function save(v) { localStorage.setItem(KEY, JSON.stringify(v)); }
function addStyle() {
  if (document.getElementById('costureira-selector-style')) return;
  const s = document.createElement('style'); s.id = 'costureira-selector-style';
  s.textContent = `
    .cs-form{display:grid;grid-template-columns:1.5fr 1fr .8fr 1.3fr auto;gap:10px;padding:16px;background:#f8fafc;border:1px solid #e2e7ef;border-radius:16px;margin-bottom:14px;align-items:end}
    .cs-field label{display:block;font-size:11px;font-weight:800;color:#667085;margin:0 0 5px}.cs-field select,.cs-field input{width:100%;box-sizing:border-box;border:1px solid #cfd6e2;border-radius:11px;background:#fff;padding:12px;font-size:14px;color:#172033}
    .cs-available{font-size:11px;color:#667085;margin-top:5px}.cs-send{border:0;border-radius:12px;padding:12px 14px;background:#14804a;color:#fff;font-weight:800;cursor:pointer;min-height:44px}.cs-send:disabled{opacity:.5;cursor:not-allowed}
    .cs-list{border:1px solid #e2e7ef;border-radius:16px;overflow:hidden}.cs-list h3{margin:0;padding:14px 15px;background:#f8fafc;font-size:15px}.cs-row{display:grid;grid-template-columns:1.5fr 1fr .7fr 1fr auto;gap:8px;padding:11px 12px;border-top:1px solid #edf0f4;align-items:center;font-size:13px}.cs-badge{display:inline-block;padding:4px 8px;border-radius:999px;background:#eef2f7;font-size:11px;font-weight:800}.cs-remove{border:0;border-radius:9px;padding:8px 10px;background:#d92d20;color:#fff;font-weight:800}.cs-actions{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px}.cs-action{border:0;border-radius:12px;padding:12px 15px;font-weight:800;background:#1769e0;color:#fff}.cs-secondary{background:#eef2f7;color:#172033}.cs-note{padding:12px 14px;background:#eef6ff;border:1px solid #c9defc;border-radius:12px;margin-bottom:14px;color:#174a8b;font-size:13px}
    @media(max-width:700px){.cs-form{grid-template-columns:1fr 1fr}.cs-form .cs-field:first-child{grid-column:1/-1}.cs-form .cs-send{grid-column:1/-1}.cs-row{grid-template-columns:1fr 1fr}.cs-row .cs-remove{grid-column:1/-1}}
  `; document.head.appendChild(s);
}
function items() {
  const list = listAtual();
  return Object.values(list?.items || {}).filter((v) => v?.product && Number(v.total) > 0);
}
function render() {
  const panel = document.getElementById('production-panel');
  if (!panel) return;
  addStyle();
  const body = panel.querySelector('.prod-body');
  if (!body) return;
  const list = listAtual();
  const rows = items();
  const productNames = [...new Set(rows.map((x) => x.product))].sort((a,b) => String(a).localeCompare(String(b)));
  const saved = assignments().filter((a) => String(a.listId || '') === String(list?.id || ''));
  body.innerHTML = `<div class="cs-note"><b>ABA COSTUREIRAS — SEM ALTERAR A ABA 1.</b> Escolha aqui o produto e a cor que já foram lançados na Aba 1, informe a quantidade e a costureira. O envio cria apenas uma distribuição para o relatório.</div>
    <div class="cs-actions"><button class="cs-action" id="cs-view-report">📑 VER RELATÓRIO DAS COSTUREIRAS</button><button class="cs-action cs-secondary" id="cs-clear">🗑️ LIMPAR ENVIADOS</button></div>
    <div class="cs-form">
      <div class="cs-field"><label>PRODUTO</label><select id="cs-product"><option value="">Selecione o produto</option>${productNames.map((p) => `<option value="${esc(p)}">${esc(p)}</option>`).join('')}</select></div>
      <div class="cs-field"><label>COR</label><select id="cs-color" disabled><option value="">Selecione a cor</option></select></div>
      <div class="cs-field"><label>QUANTIDADE</label><input id="cs-qty" type="number" min="1" step="1" placeholder="0" disabled><div class="cs-available" id="cs-available">Disponível: —</div></div>
      <div class="cs-field"><label>COSTUREIRA</label><input id="cs-seamstress" type="text" list="cs-seamstress-list" placeholder="Nome da costureira"><datalist id="cs-seamstress-list"></datalist></div>
      <button class="cs-send" id="cs-send" disabled>➜ ENVIAR PARA RELATÓRIO</button>
    </div>
    <div class="cs-list"><h3>ITENS JÁ ENVIADOS PARA COSTURA</h3><div id="cs-assigned"></div></div>`;

  const product = body.querySelector('#cs-product'); const color = body.querySelector('#cs-color'); const qty = body.querySelector('#cs-qty'); const name = body.querySelector('#cs-seamstress'); const send = body.querySelector('#cs-send'); const available = body.querySelector('#cs-available');
  function matching() { return rows.find((r) => String(r.product) === String(product.value) && String(r.color || '') === String(color.value || '')); }
  function assignedQty(p, c) { return saved.filter((a) => String(a.product) === String(p) && String(a.color || '') === String(c || '')).reduce((s,a) => s + Number(a.qty || 0), 0); }
  function refreshColors() {
    const colors = [...new Set(rows.filter((r) => String(r.product) === String(product.value)).map((r) => r.color || 'SEM COR'))].sort();
    color.innerHTML = '<option value="">Selecione a cor</option>' + colors.map((c) => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
    color.disabled = !product.value; qty.disabled = true; qty.value = ''; send.disabled = true; available.textContent = 'Disponível: —';
  }
  function refreshQty() {
    const row = matching(); const total = Number(row?.total || 0); const used = row ? assignedQty(row.product, row.color) : 0; const avail = Math.max(0, total - used);
    qty.disabled = !row || avail <= 0; qty.max = String(avail); qty.value = ''; available.textContent = `Disponível: ${fmt(avail)} UN (da Aba 1)`; send.disabled = !row || avail <= 0 || !String(name.value).trim();
  }
  product.onchange = refreshColors; color.onchange = refreshQty; name.oninput = refreshQty; qty.oninput = () => { const row=matching(); const avail=row ? Math.max(0, Number(row.total)-assignedQty(row.product,row.color)) : 0; send.disabled=!row||Number(qty.value)<1||Number(qty.value)>avail||!String(name.value).trim(); };
  send.onclick = () => {
    const row = matching(); const q = Number(qty.value); const seam = String(name.value || '').trim(); const avail = row ? Math.max(0, Number(row.total)-assignedQty(row.product,row.color)) : 0;
    if (!row || !seam || !Number.isInteger(q) || q < 1 || q > avail) { alert('Confira produto, cor, quantidade e costureira.'); return; }
    const all = assignments(); all.push({id:`${Date.now()}-${Math.random().toString(16).slice(2)}`,product:row.product,color:row.color || '',qty:q,costureira:seam,listId:list?.id || '',listName:list?.name || '',createdAt:new Date().toISOString()}); save(all); render();
  };
  body.querySelector('#cs-view-report').onclick = () => { const tab=panel.querySelector('.prod-tab[data-tab="relatorio-costureiras"]'); if(tab) tab.click(); };
  body.querySelector('#cs-clear').onclick = () => { if(confirm('Limpar os itens enviados desta lista para o relatório das costureiras?')) { save(assignments().filter((a) => String(a.listId || '') !== String(list?.id || ''))); render(); } };
  const assigned = body.querySelector('#cs-assigned');
  function drawAssigned() {
    const current=assignments().filter((a) => String(a.listId || '') === String(list?.id || ''));
    const names=[...new Set(current.map((a)=>a.costureira))].sort();
    const dl=body.querySelector('#cs-seamstress-list'); dl.innerHTML=names.map(n=>`<option value="${esc(n)}"></option>`).join('');
    if (!current.length) { assigned.innerHTML='<div class="prod-empty">Nenhum item enviado ainda.</div>'; return; }
    assigned.innerHTML=current.map((a,i)=>`<div class="cs-row"><div><b>${esc(a.product)}</b></div><div><span class="cs-badge">${esc(a.color || 'SEM COR')}</span></div><div><b>${fmt(a.qty)} UN</b></div><div><span class="cs-badge">${esc(a.costureira)}</span></div><button class="cs-remove" data-i="${i}">REMOVER</button></div>`).join('');
    assigned.querySelectorAll('[data-i]').forEach((b)=>b.onclick=()=>{const all=assignments();const currentNow=all.filter((a)=>String(a.listId||'')===String(list?.id||''));const target=currentNow[Number(b.dataset.i)];const idx=all.findIndex((a)=>a.id===target?.id);if(idx>=0){all.splice(idx,1);save(all);render();}});
  }
  drawAssigned();
}
function hook() {
  const tabs = document.querySelectorAll('.prod-tab[data-tab="costureiras"]');
  tabs.forEach((tab) => { if (tab.dataset.csHooked) return; tab.dataset.csHooked='1'; tab.addEventListener('click', () => setTimeout(render, 0)); });
}
addStyle();
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else hook();
new MutationObserver(hook).observe(document.body, {childList:true,subtree:true});
