import { TECHNICAL_SHEETS, EXCLUDED_SEWING_PRODUCTS } from './productionData.js';

const ignored = new Set(EXCLUDED_SEWING_PRODUCTS.map((s) => String(s).trim().toUpperCase()));
const fmt = (n) => Number.isInteger(Number(n)) ? String(Number(n)) : Number(n).toFixed(2).replace(/\.00$/, '');
const norm = (s) => String(s || '').trim().toUpperCase();

const LABELS = {
  linhaZigM: 'LINHA — ZIG', linhaRetaM: 'LINHA — RETA',
  fitaRigida: 'FITA RÍGIDA', elastico: 'ELÁSTICO', vies: 'VIÉS', pompom: 'POMPOM',
  elasticoRaboDeGato: 'ELÁSTICO RABO DE GATO', cordasPoliester: 'CORDAS POLIÉSTER',
  elasticoFF: 'ELÁSTICO FF', gorgurao: 'GORGURÃO', poliester: 'POLIESTER', cadarco: 'CADARÇO',
  mosquetao: 'MOSQUETÃO', fecho: 'FECHO', passador: 'PASSADOR', meiaArgola: 'MEIA ARGOLA',
  reguladorFocinhoPorco: 'REGULADOR FOCINHO DE PORCO', etiqueta: 'ETIQUETA', velcro: 'VELCRO',
  borrachaElastico: 'BORRACHA ELÁSTICO', espuma: 'ESPUMA', plasticoTransparente: 'PLÁSTICO TRANSPARENTE',
  forroTermico: 'FORRO TÉRMICO', forroImpermeavel: 'FORRO IMPERMEÁVEL', plasticoDuro: 'PLÁSTICO DURO',
  telaBolso: 'TELA DE BOLSO', forroMatelace: 'FORRO MATELACÊ'
};

function activeList() {
  try {
    const lists = JSON.parse(localStorage.getItem('almox-lists') || '[]');
    const id = localStorage.getItem('almox-current') || '';
    return lists.find((l) => String(l?.id) === String(id)) || null;
  } catch (_) { return null; }
}

function calculate(list) {
  const grouped = new Map();
  const missing = new Set();
  const items = Object.values(list?.items || {}).filter((v) => v?.product && !ignored.has(norm(v.product)));

  function add(material, spec, color, qty, product) {
    const amount = Number(qty);
    if (!Number.isFinite(amount) || amount === 0) return;
    const key = [material, spec || '', color || ''].join('|');
    let row = grouped.get(key);
    if (!row) {
      row = { material, spec: spec || '', color: color || '', qty: 0, products: new Map() };
      grouped.set(key, row);
    }
    row.qty += amount;
    row.products.set(product, (row.products.get(product) || 0) + amount);
  }

  for (const item of items) {
    const sheet = TECHNICAL_SHEETS[item.product];
    const qty = Number(item.total) || 0;
    if (!sheet || Object.keys(sheet).length === 0) {
      missing.add(item.product);
      continue;
    }
    const productColor = item.color || 'SEM COR';
    if (sheet.linhaZigM != null) add('LINHA', 'ZIG', productColor, Number(sheet.linhaZigM) * qty, item.product);
    if (sheet.linhaRetaM != null) add('LINHA', 'RETA', productColor, Number(sheet.linhaRetaM) * qty, item.product);

    for (const [key, value] of Object.entries(sheet)) {
      if (key === 'linhaZigM' || key === 'linhaRetaM') continue;
      if (key.startsWith('ziper')) {
        add('ZÍPER', key.replace('ziper', ''), productColor, Number(value) * qty, item.product);
        continue;
      }
      if (['fitaRigida','elastico','vies','pompom','elasticoRaboDeGato','cordasPoliester','elasticoFF','gorgurao','poliester','cadarco'].includes(key)) {
        if (value && value.cmPeca != null) {
          const spec = value.largura != null ? `LARG. ${fmt(value.largura)}` : '';
          add(LABELS[key] || key.toUpperCase(), spec, productColor, Number(value.cmPeca) * qty, item.product);
        }
        continue;
      }
      if (['mosquetao','fecho','passador','meiaArgola'].includes(key)) {
        for (const [componentColor, count] of Object.entries(value || {})) {
          add(LABELS[key], '', componentColor, Number(count) * qty, item.product);
        }
        continue;
      }
      add(LABELS[key] || key.toUpperCase(), key === 'velcro' || key === 'espuma' ? 'CM/PEÇA' : 'UN/PEÇA', productColor, Number(value) * qty, item.product);
    }
  }

  const rows = [...grouped.values()].sort((a, b) => `${a.material}|${a.spec}|${a.color}`.localeCompare(`${b.material}|${b.spec}|${b.color}`));
  return { rows, missing: [...missing], items };
}

function addStyle() {
  if (document.getElementById('production-style')) return;
  const style = document.createElement('style');
  style.id = 'production-style';
  style.textContent = `
    #production-launch{position:fixed;right:16px;bottom:18px;z-index:9990;border:0;border-radius:16px;padding:13px 17px;background:#1769e0;color:#fff;font-weight:800;box-shadow:0 8px 25px #0003;cursor:pointer}
    #production-overlay{display:none;position:fixed;inset:0;z-index:10000;background:#0008;overflow:auto;padding:18px;box-sizing:border-box}
    #production-panel{max-width:1100px;margin:0 auto;background:#fff;color:#172033;border-radius:22px;min-height:calc(100vh - 36px);box-shadow:0 20px 60px #0005;overflow:hidden}
    .prod-head{padding:20px 22px;border-bottom:1px solid #e7ebf1;display:flex;align-items:center;justify-content:space-between;gap:12px;position:sticky;top:0;background:#fff;z-index:2}
    .prod-head small{color:#667085;font-weight:800}.prod-head h2{margin:3px 0 0;font-size:24px}.prod-close{border:0;background:#eef2f7;border-radius:12px;font-size:22px;width:42px;height:42px}
    .prod-tabs{display:flex;gap:8px;padding:12px 18px;border-bottom:1px solid #e7ebf1;overflow:auto}.prod-tab{border:0;background:#eef2f7;border-radius:12px;padding:11px 15px;font-weight:800;white-space:nowrap}.prod-tab.active{background:#1769e0;color:#fff}
    .prod-body{padding:18px}.prod-toolbar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:15px}.prod-action{border:0;border-radius:12px;padding:12px 15px;font-weight:800;background:#1769e0;color:#fff}.prod-secondary{background:#eef2f7;color:#172033}
    .prod-card{border:1px solid #e2e7ef;border-radius:16px;margin:10px 0;overflow:hidden}.prod-card h3{margin:0;padding:14px 15px;background:#f8fafc;font-size:15px}
    .prod-table{width:100%;border-collapse:collapse}.prod-table th,.prod-table td{text-align:left;padding:10px 12px;border-top:1px solid #edf0f4;font-size:13px}.prod-table th{font-size:12px;color:#667085}.prod-table td:last-child,.prod-table th:last-child{text-align:right}
    .prod-note{padding:12px 14px;background:#fff7e6;border:1px solid #f0d59b;border-radius:12px;margin:10px 0;color:#6b4d00}.prod-empty{padding:30px;text-align:center;color:#667085}.prod-product{display:flex;justify-content:space-between;padding:11px 0;border-bottom:1px solid #edf0f4}
    .prod-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px}.prod-stat{padding:15px;border:1px solid #e2e7ef;border-radius:16px;background:#f8fafc}.prod-stat span{display:block;color:#667085;font-size:13px}.prod-stat b{display:block;font-size:25px;margin-top:3px}
    .prod-print-title{display:none}
    @media(max-width:700px){.prod-stats{grid-template-columns:1fr 1fr}.prod-body{padding:12px}.prod-head{padding:15px}.prod-table th,.prod-table td{padding:8px;font-size:12px}}
    @media print{body>*:not(#production-overlay){display:none!important}#production-overlay{display:block!important;position:static;padding:0;background:#fff}#production-panel{box-shadow:none;border-radius:0;min-height:0;max-width:none}.prod-head,.prod-tabs,.prod-toolbar,.prod-note{display:none!important}.prod-body{padding:0}.prod-print-title{display:block;text-align:center;margin-bottom:16px}.prod-card{break-inside:avoid}}
  `;
  document.head.appendChild(style);
}

function render(tab) {
  const overlay = document.getElementById('production-overlay');
  if (!overlay) return;
  const panel = document.getElementById('production-panel');
  const list = activeList();
  const result = calculate(list);
  const products = new Map();
  result.items.forEach((item) => products.set(item.product, (products.get(item.product) || 0) + Number(item.total || 0)));
  const total = result.items.reduce((sum, item) => sum + Number(item.total || 0), 0);
  let html = '';

  if (tab === 'producao') {
    html += `<div class="prod-stats"><div class="prod-stat"><span>LISTA</span><b>${list?.name || 'Nenhuma'}</b></div><div class="prod-stat"><span>UNIDADES</span><b>${fmt(total)}</b></div><div class="prod-stat"><span>PRODUTOS</span><b>${products.size}</b></div></div>`;
    html += `<div class="prod-card"><h3>ITENS ENVIADOS PARA PRODUÇÃO</h3><div style="padding:10px 15px">`;
    if (products.size) [...products].sort().forEach(([name, qty]) => { html += `<div class="prod-product"><span>${name}</span><b>${fmt(qty)}</b></div>`; });
    else html += '<div class="prod-empty">A Aba 1 ainda não possui itens nesta lista.</div>';
    html += '</div></div>';
  } else if (tab === 'relatorio') {
    html += `<div class="prod-print-title"><h1>RELATÓRIO DE SEPARAÇÃO DE MATERIAIS</h1><div>${list?.name || 'Lista'} · ${new Date().toLocaleDateString('pt-BR')}</div></div>`;
    html += `<div class="prod-toolbar"><button class="prod-action" id="prod-print">🖨️ IMPRIMIR</button><button class="prod-action prod-secondary" id="prod-refresh">↻ ATUALIZAR</button></div>`;
    if (!result.rows.length) html += '<div class="prod-empty">Não há consumo calculado para esta lista.</div>';
    result.rows.forEach((row) => {
      html += `<div class="prod-card"><h3>${row.material}${row.spec ? ` — ${row.spec}` : ''}${row.color ? ` · ${row.color}` : ''}</h3><table class="prod-table"><thead><tr><th>PRODUTO</th><th>QTD.</th></tr></thead><tbody>`;
      [...row.products].sort().forEach(([product, qty]) => { html += `<tr><td>${product}</td><td>${fmt(qty)}</td></tr>`; });
      html += `<tr><th>TOTAL</th><th>${fmt(row.qty)}</th></tr></tbody></table></div>`;
    });
  } else {
    html += `<div class="prod-toolbar"><button class="prod-action" id="prod-report">📄 VER RELATÓRIO COMPLETO</button><button class="prod-action prod-secondary" id="prod-refresh">↻ ATUALIZAR</button></div>`;
    if (result.missing.length) html += `<div class="prod-note"><b>ATENÇÃO:</b> ${result.missing.join(', ')} não possui ficha técnica completa. O sistema não inventará consumo.</div>`;
    if (!result.rows.length) html += '<div class="prod-empty">Nenhum material calculado. Lance itens na Aba 1 para gerar o consumo.</div>';
    else {
      html += '<div class="prod-card"><h3>RESUMO AGRUPADO — MATERIAL × ESPECIFICAÇÃO × COR</h3><table class="prod-table"><thead><tr><th>MATERIAL</th><th>ESPECIFICAÇÃO</th><th>COR</th><th>TOTAL</th></tr></thead><tbody>';
      result.rows.forEach((row) => { html += `<tr><td>${row.material}</td><td>${row.spec || '—'}</td><td>${row.color || '—'}</td><td><b>${fmt(row.qty)}</b></td></tr>`; });
      html += '</tbody></table></div>';
    }
  }

  panel.querySelector('.prod-body').innerHTML = html;
  panel.querySelectorAll('.prod-tab').forEach((button) => button.classList.toggle('active', button.dataset.tab === tab));
  const refresh = panel.querySelector('#prod-refresh');
  if (refresh) refresh.onclick = () => render(tab);
  const report = panel.querySelector('#prod-report');
  if (report) report.onclick = () => render('relatorio');
  const print = panel.querySelector('#prod-print');
  if (print) print.onclick = () => window.print();
}

function mount() {
  if (document.getElementById('production-launch')) return;
  addStyle();
  const button = document.createElement('button');
  button.id = 'production-launch';
  button.textContent = '🏭 PRODUÇÃO';
  button.onclick = () => {
    const overlay = document.getElementById('production-overlay');
    overlay.style.display = 'block';
    render('materiais');
  };
  document.body.appendChild(button);

  const overlay = document.createElement('div');
  overlay.id = 'production-overlay';
  overlay.innerHTML = `<div id="production-panel"><div class="prod-head"><div><small>WORKNEO · PRODUÇÃO</small><h2>Planejamento e separação de materiais</h2></div><button class="prod-close" id="prod-close">×</button></div><div class="prod-tabs"><button class="prod-tab active" data-tab="materiais">📦 Materiais</button><button class="prod-tab" data-tab="producao">🏭 Produção</button><button class="prod-tab" data-tab="relatorio">📄 Relatório</button></div><div class="prod-body"></div></div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#prod-close').onclick = () => { overlay.style.display = 'none'; };
  overlay.addEventListener('click', (event) => { if (event.target === overlay) overlay.style.display = 'none'; });
  overlay.querySelectorAll('.prod-tab').forEach((tabButton) => { tabButton.onclick = () => render(tabButton.dataset.tab); });
}

window.addEventListener('DOMContentLoaded', mount);
setTimeout(mount, 500);
