import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const PRODUCTS = [
'PORTA GARRAFA','PORTA GARRAFA LITRÃO','PORTA GARRAFA 600','PORTA GARRAFA 600 SEM ZÍPER','PORTA ÁGUA E ISOTÔNICO','APOIO ERGONÔMICO P/ TECLADO','BOLSA DE MÃO','BOLSA MEIA LUA','BARMAT','BARMAT GRANDE','BOLSA FEMININA','BOLSA TOALHA','CADEIRA DE PRAIA','CAPA CARRETILHA','CASE CELULAR','CHAVEIRO','CAPA MOLINETE','CANGA DE PRAIA','CANGA DE PRAIA G','CASE NOTEBOOK','CAPA P/ MALA GRANDE','CAPA P/ MALA MÉDIA','CAPA P/ MALA PEQUENA','CORRENTE PARA ÓCULOS','CASE TABLET','CARTEIRA FEMININA','COOLER TÉRMICO LATERAL','PORTA ESPUMANTE 975ML','ESTOJO','ESTEIRA DE PRAIA','LANCHEIRA','LENÇO','PORTA GARRAFA LONG NECK 355ML','PORTA GARRAFA LONG NECK CAMISA 355ML','LIXEIRA AUTOMOTIVA','PORTA LATA 350ML','PORTA LATA CAMISA 350ML','PORTA LATA 473ML','PORTA LATA PALITO 269ML','PORTA LATA PALITO 350ML','KIT LUVA DE FORNO','MARMITEIRA','MARMITEIRA IMPERMEÁVEL','MÁSCARA PROTETORA',
'MATEIRA','MATEIRA PEQUENA','MINI BAG GRANDE LATERAL','MINI BAG PEQUENA TRANSVERSAL','PORTA MOEDAS','MOCHILA INFANTIL','MOCHILA IMPERMEÁVEL','MOCHILA TÉRMICA','MOUSE PAD','MOUSE PAD EGONÔMICO','MOUSE PAD GAMER','MARCADOR DE PÁGINA E PORTA CANETAS','MOCHILA TRANSVERSAL','MUNHEQUEIRA','NECESSAIRE','NECESSAIRE GRANDE','PORTA CELULAR','POCHETE','PORTA COPOS','PROTETOR FACIAL','PORTA GALÃO 5L','PORTA ÓCULOS','PORTA SQUEEZE','PORTA UTILIDADES P/ CADEIRA','PORTA VINHO DUPLO','PORTA VINHO DUPLO C/ PORTA TAÇAS','PORTA VINHO SIMPLES','SAÍDA DE PRAIA CURTA','SAÍDA DE PRAIA LONGA','STRAP','SUPORTE COPO','TAG PARA MALA','COOLER TÉRMICO GRANDE','COOLER TÉRMICO PEQUENO','TOLHA DE BANHO','TOALHA C/ CAPUZ G','TOALHA C/ CAPUZ M','TOALHA ESPORTIVA 80X30','TOALHA MICROFIBRA','TOALHA DE ROSTO 40X30','TAPA OLHO','VISEIRA','VISEIRA TURBANTE','WINE BAG','WINE CASE DELUXE'
];
const COLORS=['LILÁS','VERDE PALMEIRAS','CELESTE','LARANJA','VERDE ÁGUA','MARROM','CREME','BRANCO','PRETO','ROYAL','MARINHO','VERMELHO','PINK','ROSA BEBÊ','VERDE','AMARELO','BEGE'];
const keyOf=(p,c)=>`${p}__${c}`;

function App(){
 const [dark,setDark]=useState(()=>localStorage.getItem('almox-theme')==='dark');
 const [lists,setLists]=useState(()=>JSON.parse(localStorage.getItem('almox-lists')||'[]'));
 const [current,setCurrent]=useState(()=>localStorage.getItem('almox-current')||'');
 const [product,setProduct]=useState(''); const [color,setColor]=useState('');
 const [qty,setQty]=useState(''); const [search,setSearch]=useState(''); const [view,setView]=useState('list');
 const [calcOpen,setCalcOpen]=useState(false); const [listModal,setListModal]=useState(false); const [listName,setListName]=useState('');
 useEffect(()=>{localStorage.setItem('almox-theme',dark?'dark':'light')},[dark]);
 useEffect(()=>{localStorage.setItem('almox-lists',JSON.stringify(lists))},[lists]);
 useEffect(()=>{localStorage.setItem('almox-current',current)},[current]);
 const active=lists.find(l=>l.id===current);
 const filtered=useMemo(()=>PRODUCTS.filter(p=>p.toLowerCase().includes(search.toLowerCase())),[search]);
 const items=active?.items||{};
 const total=Object.values(items).reduce((s,v)=>s+v.total,0);
 const productTotals=useMemo(()=>Object.values(items).reduce((a,v)=>{a[v.product]=(a[v.product]||0)+v.total;return a},{}),[items]);
 function newList(){const name=listName.trim()||`Lista ${lists.length+1}`; const id=crypto.randomUUID(); setLists(x=>[...x,{id,name,createdAt:new Date().toISOString(),items:{},history:[]}]); setCurrent(id); setListModal(false);setListName('');setView('list')}
 function addQty(value){if(!product||!color||!value||Number(value)<=0)return; const k=keyOf(product,color); const n=Number(value); setLists(ls=>ls.map(l=>l.id!==current?l:{...l,items:{...l.items,[k]:{product,color,total:(l.items[k]?.total||0)+n}},history:[...(l.history||[]),{product,color,qty:n,at:new Date().toISOString()}]})); setQty('');}
 function openCalc(p,c){setProduct(p);setColor(c);setQty('');setCalcOpen(true)}
 function csvExport(){ if(!active)return; const rows=[['Lista','Produto','Cor','Quantidade']];Object.values(active.items).forEach(v=>rows.push([active.name,v.product,v.color,v.total])); const blob=new Blob([rows.map(r=>r.join(';')).join('\n')],{type:'text/csv;charset=utf-8;'}); const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${active.name}.csv`;a.click();URL.revokeObjectURL(a.href)}
 function pdfPrint(){ if(!active)return; window.print() }
 return <div className={dark?'app dark':'app'}>
  <header><div><small>ALMOXARIFADO</small><h1>{active?.name||'Minhas listas'}</h1></div><button className="icon" onClick={()=>setDark(!dark)}>{dark?'☀️':'🌙'}</button></header>
  {!active ? <main className="home"><div className="hero"><div className="hero-icon">📦</div><h2>Controle de materiais</h2><p>Catálogo por produto e cor, lançamentos acumulados e listas independentes.</p><button className="primary big" onClick={()=>setListModal(true)}>＋ NOVA LISTA</button></div><section><div className="section-title"><h3>Listas salvas</h3><span>{lists.length}</span></div>{lists.map(l=><button key={l.id} className="list-card" onClick={()=>setCurrent(l.id)}><div><strong>{l.name}</strong><small>{Object.keys(l.items).length} combinações · {Object.values(l.items).reduce((s,v)=>s+v.total,0)} unidades</small></div><span>›</span></button>)}</section></main> : <>
   <nav className="tabs"><button className={view==='list'?'active':''} onClick={()=>setView('list')}>📋 Lista</button><button className={view==='summary'?'active':''} onClick={()=>setView('summary')}>📊 Resumo</button><button onClick={()=>setListModal(true)}>＋ Nova</button><button onClick={()=>setCurrent('')}>☰ Listas</button></nav>
   {view==='list' ? <main><div className="stats"><div><span>Total da lista</span><b>{total}</b><em>unidades</em></div><div><span>Produtos</span><b>{Object.keys(productTotals).length}</b><em>tipos</em></div></div>
    <div className="search"><span>🔎</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar produto..."/></div>
    <div className="quick"><button className="primary" onClick={()=>{setProduct('');setColor('');setCalcOpen(true)}}>＋ ADICIONAR ITEM</button><button onClick={csvExport}>⬇️ CSV</button><button onClick={pdfPrint}>📄 PDF</button></div>
    <section className="catalog">{(search?filtered:PRODUCTS).map(p=><ProductCard key={p} product={p} items={items} onAdd={openCalc}/>)}</section>
   </main> : <main><section className="summary"><h2>Resumo da lista</h2>{Object.entries(productTotals).sort().map(([p,t])=><div className="summary-product" key={p}><div><strong>{p}</strong><span>{t} unidades</span></div>{Object.values(items).filter(v=>v.product===p).map(v=><div className="summary-color" key={v.color}><span>● {v.color}</span><b>{v.total}</b></div>)}</div>)}</section></main>}
  </>}
  {calcOpen && <div className="modal"><div className="sheet"><button className="close" onClick={()=>setCalcOpen(false)}>×</button><small>LANÇAMENTO</small><h2>{product||'Escolher produto'}</h2>{product && <p className="selected">🎨 {color||'Escolha uma cor'}</p>}
   {!product ? <><div className="field"><label>Produto</label><input autoFocus value={product} onChange={e=>setProduct(e.target.value)} placeholder="Digite o produto"/></div><div className="suggestions">{PRODUCTS.filter(p=>!product||p.toLowerCase().includes(product.toLowerCase())).slice(0,8).map(p=><button key={p} onClick={()=>setProduct(p)}>{p}</button>)}</div></> : !color ? <div><label>Cor</label><div className="colors">{COLORS.map(c=><button key={c} onClick={()=>setColor(c)}>{c}</button>)}</div></div> : <><div className="current-total">Atual: <b>{items[keyOf(product,color)]?.total||0}</b></div><div className="calc-display">{qty||'0'}</div><div className="calc-grid">{['7','8','9','4','5','6','1','2','3','0','⌫'].map(k=><button key={k} onClick={()=>k==='⌫'?setQty(q=>q.slice(0,-1)):setQty(q=>q+k)}>{k}</button>)}</div><div className="calc-actions"><button className="secondary" onClick={()=>{setColor('');setQty('')}}>OUTRA COR</button><button className="primary" onClick={()=>{addQty(qty);setCalcOpen(false)}}>＋ ADICIONAR</button></div></>}
  </div></div>}
  {listModal && <div className="modal"><div className="sheet"><button className="close" onClick={()=>setListModal(false)}>×</button><small>NOVA LISTA</small><h2>Criar pedido/lista</h2><div className="field"><label>Nome da lista</label><input autoFocus value={listName} onChange={e=>setListName(e.target.value)} placeholder="Ex.: Pedido 025" onKeyDown={e=>e.key==='Enter'&&newList()}/></div><button className="primary big" onClick={newList}>CRIAR LISTA</button></div></div>}
  <footer>Almoxarifado · dados salvos neste dispositivo</footer>
 </div>
}
function ProductCard({product,items,onAdd}){const rows=Object.values(items).filter(v=>v.product===product);const total=rows.reduce((s,v)=>s+v.total,0);return <div className="product-card"><div className="product-head"><strong>{product}</strong><b>{total}</b></div>{rows.length?rows.map(r=><button className="color-row" key={r.color} onClick={()=>onAdd(product,r.color)}><span><i>●</i>{r.color}</span><b>{r.total}</b><span>＋</span></button>):<button className="empty-row" onClick={()=>onAdd(product,'')}>＋ adicionar cor</button>}</div>}

createRoot(document.getElementById('root')).render(<App/>);
