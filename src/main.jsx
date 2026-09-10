import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const PRODUCTS = [
'PORTA GARRAFA','PORTA GARRAFA LITRÃO','PORTA GARRAFA 600','PORTA GARRAFA 600 SEM ZÍPER','PORTA ÁGUA E ISOTÔNICO','APOIO ERGONÔMICO P/ TECLADO','BOLSA DE MÃO','BOLSA MEIA LUA','BARMAT','BARMAT GRANDE','BOLSA FEMININA','BOLSA TOALHA','CADEIRA DE PRAIA','CAPA CARRETILHA','CASE CELULAR','CHAVEIRO','CAPA MOLINETE','CANGA DE PRAIA','CANGA DE PRAIA G','CASE NOTEBOOK','CAPA P/ MALA GRANDE','CAPA P/ MALA MÉDIA','CAPA P/ MALA PEQUENA','CORRENTE PARA ÓCULOS','CASE TABLET','CARTEIRA FEMININA','COOLER TÉRMICO LATERAL','PORTA ESPUMANTE 975ML','ESTOJO','ESTEIRA DE PRAIA','LANCHEIRA','LENÇO','PORTA GARRAFA LONG NECK 355ML','PORTA GARRAFA LONG NECK CAMISA 355ML','LIXEIRA AUTOMOTIVA','PORTA LATA 350ML','PORTA LATA CAMISA 350ML','PORTA LATA 473ML','PORTA LATA PALITO 269ML','PORTA LATA PALITO 350ML','KIT LUVA DE FORNO','MARMITEIRA','MARMITEIRA IMPERMEÁVEL','MÁSCARA PROTETORA','MATEIRA','MATEIRA PEQUENA','MINI BAG GRANDE LATERAL','MINI BAG PEQUENA TRANSVERSAL','PORTA MOEDAS','MOCHILA INFANTIL','MOCHILA IMPERMEÁVEL','MOCHILA TÉRMICA','MOUSE PAD','MOUSE PAD EGONÔMICO','MOUSE PAD GAMER','MARCADOR DE PÁGINA E PORTA CANETAS','MOCHILA TRANSVERSAL','MUNHEQUEIRA','NECESSAIRE','NECESSAIRE GRANDE','PORTA CELULAR','POCHETE','PORTA COPOS','PROTETOR FACIAL','PORTA GALÃO 5L','PORTA ÓCULOS','PORTA SQUEEZE','PORTA UTILIDADES P/ CADEIRA','PORTA VINHO DUPLO','PORTA VINHO DUPLO C/ PORTA TAÇAS','PORTA VINHO SIMPLES','SAÍDA DE PRAIA CURTA','SAÍDA DE PRAIA LONGA','STRAP','SUPORTE COPO','TAG PARA MALA','COOLER TÉRMICO GRANDE','COOLER TÉRMICO PEQUENO','TOLHA DE BANHO','TOALHA C/ CAPUZ G','TOALHA C/ CAPUZ M','TOALHA ESPORTIVA 80X30','TOALHA MICROFIBRA','TOALHA DE ROSTO 40X30','TAPA OLHO','VISEIRA','VISEIRA TURBANTE','WINE BAG','WINE CASE DELUXE'
];
const COLORS=['LILÁS','VERDE PALMEIRAS','CELESTE','LARANJA','VERDE ÁGUA','MARROM','CREME','BRANCO','PRETO','ROYAL','MARINHO','VERMELHO','PINK','ROSA BEBÊ','VERDE','AMARELO','BEGE'];
const keyOf=(p,c)=>`${p}__${c}`;

function readJSON(key, fallback){try{const raw=localStorage.getItem(key);if(!raw)return fallback;const value=JSON.parse(raw);return value??fallback}catch{return fallback}}
function safeArray(key){const value=readJSON(key,[]);return Array.isArray(value)?value:[]}
function safeText(key){try{return localStorage.getItem(key)||''}catch{return ''}}
function normalizeLists(){return safeArray('almox-lists').filter(l=>l&&typeof l==='object').map((l,i)=>({...l,id:String(l.id||`${Date.now()}-${i}`),name:typeof l.name==='string'&&l.name.trim()?l.name:'Lista',items:l.items&&typeof l.items==='object'&&!Array.isArray(l.items)?l.items:{},history:Array.isArray(l.history)?l.history:[]}))}

function Login({onLogin}){
 const [user,setUser]=useState(''); const [pass,setPass]=useState(''); const [error,setError]=useState('');
 const account=readJSON('almox-account',null);
 function submit(e){e.preventDefault();const u=user.trim();if(!u||!pass){setError('Informe usuário e senha.');return}if(!account){try{localStorage.setItem('almox-account',JSON.stringify({user:u,pass}));localStorage.setItem('almox-session','1')}catch{}onLogin();return}if(account.user===u&&account.pass===pass){try{localStorage.setItem('almox-session','1')}catch{}onLogin()}else setError('Usuário ou senha incorretos.')}
 return <div className="login-screen"><div className="login-card"><div className="login-logo">📦</div><small>ALMOXARIFADO</small><h1>Acesso ao sistema</h1><p>{account?'Entre para continuar':'Primeiro acesso: crie seu usuário e senha.'}</p><form onSubmit={submit}><label>Usuário</label><input autoFocus value={user} onChange={e=>setUser(e.target.value)} placeholder="Digite seu usuário" autoComplete="username"/><label>Senha</label><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Digite sua senha" autoComplete={account?'current-password':'new-password'}/>{error&&<div className="login-error">{error}</div>}<button className="primary login-button">ENTRAR</button></form><span className="local-note">🔒 Acesso salvo somente neste dispositivo.</span></div></div>
}

function App(){
 const [logged,setLogged]=useState(()=>safeText('almox-session')==='1');
 const [dark,setDark]=useState(()=>safeText('almox-theme')==='dark');
 const [lists,setLists]=useState(()=>normalizeLists());
 const [current,setCurrent]=useState(()=>safeText('almox-current'));
 const [product,setProduct]=useState(''); const [productSearch,setProductSearch]=useState(''); const [color,setColor]=useState(''); const [qty,setQty]=useState(''); const [search,setSearch]=useState(''); const [view,setView]=useState('list');
 const [calcOpen,setCalcOpen]=useState(false); const [listModal,setListModal]=useState(false); const [listName,setListName]=useState('');
 useEffect(()=>{try{localStorage.setItem('almox-theme',dark?'dark':'light')}catch{}},[dark]);
 useEffect(()=>{try{localStorage.setItem('almox-lists',JSON.stringify(lists))}catch{}},[lists]);
 useEffect(()=>{try{localStorage.setItem('almox-current',current)}catch{}},[current]);
 if(!logged)return <Login onLogin={()=>setLogged(true)}/>;
 const active=lists.find(l=>l&&l.id===current);
 const items=active?.items&&typeof active.items==='object'&&!Array.isArray(active.items)?active.items:{};
 const total=Object.values(items).reduce((s,v)=>s+(Number(v?.total)||0),0);
 const productTotals=useMemo(()=>Object.values(items).reduce((a,v)=>{if(v?.product)a[v.product]=(a[v.product]||0)+(Number(v.total)||0);return a},{}),[items]);
 const selectedProducts=useMemo(()=>PRODUCTS.filter(p=>Object.values(items).some(v=>v?.product===p)),[items]);
 const filteredSelected=useMemo(()=>selectedProducts.filter(p=>p.toLowerCase().includes(search.toLowerCase())),[selectedProducts,search]);
 const productOptions=useMemo(()=>PRODUCTS.filter(p=>p.toLowerCase().includes(productSearch.trim().toLowerCase())),[productSearch]);
 function newList(){const name=listName.trim()||`Lista ${lists.length+1}`;const id=globalThis.crypto?.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`;setLists(x=>[...x,{id,name,createdAt:new Date().toISOString(),items:{},history:[]}]);setCurrent(id);setListModal(false);setListName('');setView('list')}
 function addQty(value){if(!product||!color||!value||Number(value)<=0)return;const k=keyOf(product,color);const n=Number(value);setLists(ls=>ls.map(l=>l&&l.id===current?{...l,items:{...(l.items&&typeof l.items==='object'&&!Array.isArray(l.items)?l.items:{}),[k]:{product,color,total:(Number(l.items?.[k]?.total)||0)+n}},history:[...(Array.isArray(l.history)?l.history:[]),{product,color,qty:n,at:new Date().toISOString()}]}:l));setQty('')}
 function openCalc(p='',c=''){setProduct(p);setProductSearch('');setColor(c);setQty('');setCalcOpen(true)}
 function chooseProduct(p){setProduct(p);setProductSearch('');setColor('')}
 function csvExport(){if(!active)return;const rows=[['Lista','Produto','Cor','Quantidade']];Object.values(items).forEach(v=>rows.push([active.name,v.product,v.color,v.total]));const blob=new Blob([rows.map(r=>r.join(';')).join('\n')],{type:'text/csv;charset=utf-8;'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${active.name}.csv`;a.click();URL.revokeObjectURL(a.href)}
 function pdfPrint(){if(active)window.print()}
 function logout(){try{localStorage.removeItem('almox-session')}catch{}setLogged(false)}
 return <div className={dark?'app dark':'app'}>
  <header><div><small>ALMOXARIFADO</small><h1>{active?.name||'Minhas listas'}</h1></div><div className="header-actions"><button className="icon" onClick={()=>setDark(!dark)}>{dark?'☀️':'🌙'}</button><button className="logout" onClick={logout}>Sair</button></div></header>
  {!active?<main className="home"><div className="hero"><div className="hero-icon">📦</div><h2>Controle de materiais</h2><p>Escolha uma lista e adicione somente os produtos necessários.</p><button className="primary big" onClick={()=>setListModal(true)}>＋ NOVA LISTA</button></div><section><div className="section-title"><h3>Listas salvas</h3><span>{lists.length}</span></div>{lists.map(l=><button key={l.id} className="list-card" onClick={()=>setCurrent(l.id)}><div><strong>{l.name}</strong><small>{Object.keys(l.items||{}).length} combinações · {Object.values(l.items||{}).reduce((s,v)=>s+(Number(v?.total)||0),0)} unidades</small></div><span>›</span></button>)}</section></main>:<>
   <nav className="tabs"><button className={view==='list'?'active':''} onClick={()=>setView('list')}>📋 Lista</button><button className={view==='summary'?'active':''} onClick={()=>setView('summary')}>📊 Resumo</button><button onClick={()=>setListModal(true)}>＋ Nova</button><button onClick={()=>setCurrent('')}>☰ Listas</button></nav>
   {view==='list'?<main><div className="stats"><div><span>Total da lista</span><b>{total}</b><em>unidades</em></div><div><span>Produtos</span><b>{selectedProducts.length}</b><em>selecionados</em></div></div>
    <div className="search"><span>🔎</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar nos produtos escolhidos..."/></div>
    <div className="quick"><button className="primary" onClick={()=>openCalc()}>＋ ADICIONAR ITEM</button><button onClick={csvExport}>⬇️ CSV</button><button onClick={pdfPrint}>📄 PDF</button></div>
    {selectedProducts.length===0?<div className="empty-catalog"><div>📋</div><h2>Nenhum item adicionado</h2><p>Os produtos ficam ocultos até você escolher um.</p><button className="primary big" onClick={()=>openCalc()}>＋ ESCOLHER PRODUTO</button></div>:<section className="catalog">{filteredSelected.map(p=><ProductCard key={p} product={p} items={items} onAdd={openCalc}/>)}</section>}
   </main>:<main><section className="summary"><h2>Resumo da lista</h2>{Object.entries(productTotals).sort().map(([p,t])=><div className="summary-product" key={p}><div><strong>{p}</strong><span>{t} unidades</span></div>{Object.values(items).filter(v=>v.product===p).map(v=><div className="summary-color" key={v.color}><span>● {v.color}</span><b>{v.total}</b></div>)}</div>)}</section></main>}
  </>}
  {calcOpen&&<div className="modal"><div className="sheet"><button className="close" onClick={()=>setCalcOpen(false)}>×</button><small>LANÇAMENTO</small><h2>{product||'Escolher produto'}</h2>
   {!product?<><div className="field"><label>Produto</label><input autoFocus value={productSearch} onChange={e=>setProductSearch(e.target.value)} placeholder="Digite o nome ou uma letra" autoComplete="off"/><div className="suggestions">{productOptions.map(p=><button type="button" key={p} onClick={()=>chooseProduct(p)}>{p}</button>)}{productOptions.length===0&&<div className="no-results">Nenhum produto encontrado.</div>}</div></div></>:!color?<div><p className="selected">🎨 Escolha uma cor para {product}</p><div className="colors">{COLORS.map(c=><button type="button" key={c} onClick={()=>setColor(c)}>{c}</button>)}</div></div>:<><p className="selected">🎨 {color}</p><div className="current-total">Atual: <b>{items[keyOf(product,color)]?.total||0}</b></div><div className="calc-display">{qty||'0'}</div><div className="calc-grid">{['7','8','9','4','5','6','1','2','3','0','⌫'].map(k=><button type="button" key={k} onClick={()=>k==='⌫'?setQty(q=>q.slice(0,-1)):setQty(q=>q+k)}>{k}</button>)}</div><div className="calc-actions"><button type="button" className="secondary" onClick={()=>{setColor('');setQty('')}}>OUTRA COR</button><button type="button" className="primary" onClick={()=>{addQty(qty);setCalcOpen(false)}}>＋ ADICIONAR</button></div></>}
  </div></div>}
  {listModal&&<div className="modal"><div className="sheet"><button className="close" onClick={()=>setListModal(false)}>×</button><small>NOVA LISTA</small><h2>Criar pedido/lista</h2><div className="field"><label>Nome da lista</label><input autoFocus value={listName} onChange={e=>setListName(e.target.value)} placeholder="Ex.: Pedido 025" onKeyDown={e=>e.key==='Enter'&&newList()}/></div><button className="primary big" onClick={newList}>CRIAR LISTA</button></div></div>}
  <footer>Almoxarifado · dados salvos neste dispositivo</footer>
 </div>
}
function ProductCard({product,items,onAdd}){const rows=Object.values(items).filter(v=>v?.product===product);const total=rows.reduce((s,v)=>s+(Number(v?.total)||0),0);return <div className="product-card"><div className="product-head"><strong>{product}</strong><b>{total}</b></div>{rows.map(r=><button className="color-row" key={r.color} onClick={()=>onAdd(product,r.color)}><span><i>●</i>{r.color}</span><b>{r.total}</b><span>＋</span></button>)}<button className="empty-row" onClick={()=>onAdd(product,'')}>＋ adicionar outra cor</button></div>}

createRoot(document.getElementById('root')).render(<App/>);
