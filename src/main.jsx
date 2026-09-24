import React,{useEffect,useMemo,useRef,useState}from'react';
import{createRoot}from'react-dom/client';
import{Capacitor}from'@capacitor/core';
import{Filesystem,Directory}from'@capacitor/filesystem';
import{FileOpener}from'@capacitor-community/file-opener';
import html2pdf from'html2pdf.js';
import{MATERIAL_RULES}from'./materialRules.js';
import{isSupabaseConfigured,supabase,loadCloudData,saveCloudData,subscribeToCloud,AUTH_REDIRECT_URL,ensureWorkspace,loadWorkspaceData,saveWorkspaceData,listWorkspaceMembers,addWorkspaceMember,setWorkspaceMemberRole,removeWorkspaceMember,subscribeToWorkspaceData}from'./supabaseClient.js';
import{createProductionShare,listProductionShares,revokeProductionShare,loadPublicProductionShare,filterProductionRows}from'./productionShare.js';
import'./styles.css';

const PRODUCTS=["PORTA GARRAFA LITRÃO","PORTA GARRAFA 600","PORTA GARRAFA 600 SEM ZÍPER","PORTA ÁGUA E ISOTÔNICO","BOLSA DE MÃO","BOLSA MEIA LUA","BARMAT","BARMAT GRANDE","LANCHEIRA","BOLSA FEMININA","CASE CELULAR","CASE NOTEBOOK","CORRENTE PARA ÓCULOS","CASE TABLET","CARTEIRA FEMININA","COOLER TÉRMICO LATERAL","PORTA ESPUMANTE 975ML","ESTOJO","PORTA GARRAFA LONG NECK 355ML","LIXEIRA AUTOMOTIVA","PORTA LATA 350ML","PORTA LATA 473ML","PORTA LATA PALITO 269ML","PORTA LATA PALITO 350ML","KIT LUVA DE FORNO","MÁSCARA PROTETORA","MATEIRA","MATEIRA PEQUENA","MINI BAG GRANDE LATERAL","PORTA MOEDAS","MOCHILA INFANTIL","MOCHILA TÉRMICA","MOUSE PAD","MOUSE PAD GAMER","MUNHEQUEIRA","NECESSAIRE","NECESSAIRE GRANDE","POCHETE","PORTA COPOS","PROTETOR FACIAL","PORTA ÓCULOS","PORTA SQUEEZE","PORTA VINHO DUPLO","PORTA VINHO DUPLO C/ PORTA TAÇAS","PORTA VINHO SIMPLES","MOCHILA TRANSVERSAL","MINI BAG PEQUENA TRANSVERSAL","TAG PARA MALA","COOLER TÉRMICO GRANDE","COOLER TÉRMICO PEQUENO","TAPA OLHO","VISEIRA","LATA CAMISA","LONG CAMISA","CANGA DE PRAIA","CANGA DE PRAIA G","MARMITEIRA IMPERMEÁVEL","MOCHILA IMPERMEÁVEL","VISEIRA TURBANTE","ESTEIRA DE PRAIA","WINE CASE DELUXE","WINE BAG"];
const COLORS=["PRETO","ROYAL","MARINHO","VERMELHO","PINK","ROSA BEBÊ","VERDE","AMARELO","LILÁS","VERDE PALMEIRAS","BRANCO","CELESTE","LARANJA","VERDE ÁGUA","MARROM","CREME","BEGE","AZUL BEBÊ","CINZA"];
const SEAMSTRESSES=["ELENI","MARA","SANDRA","MIRIAN","MARINA","ADRIANA","DONA JOSI","JAMINA","COSTURA INTERNA"];
const LISTS_KEY='workneo-clean-lists-v1',REPORTS_KEY='workneo-clean-sewing-reports-v1';
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toUpperCase();
const read=(k,f=[])=>{try{const v=JSON.parse(localStorage.getItem(k)||'null');return Array.isArray(v)?v:f}catch{return f}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const uid=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
const today=()=>new Date().toISOString().slice(0,10),n=v=>Math.max(0,Number(v)||0);
const fmt=v=>Number(v||0).toLocaleString('pt-BR',{maximumFractionDigits:2});
const fmtDate=v=>{if(!v)return'—';const[y,m,d]=String(v).split('-');return d&&m&&y?d+'/'+m+'/'+y:v};
const ruleMap=new Map(MATERIAL_RULES.map(([p,r])=>[norm(p),r]));
const MATERIAL_NAMES={fita_rigida:'FITA RÍGIDA',elastico:'ELÁSTICO',vies:'VIÉS',pompom:'POMPOM',elastico_rabo:'ELÁSTICO RABO DE GATO',cordas:'CORDAS POLIÉSTER',elastico_ff:'ELÁSTICO FF',gorgurao:'GORGURÃO',poliester:'POLIÉSTER',cadaraço:'CADARÇO',mosquetao:'MOSQUETÃO',fecho:'FECHO',passador:'PASSADOR',meia_argola:'MEIA ARGOLA',regulador:'REGULADOR FOCINHO DE PORCO',etiqueta:'ETIQUETA',velcro:'VELCRO',borracha_elastica:'BORRACHA ELÁSTICO',espuma:'ESPUMA',plastico_transparente:'PLÁSTICO TRANSPARENTE',forro_termico:'FORRO TÉRMICO',forro_impermeavel:'FORRO IMPERMEÁVEL',plastico_duro:'PLÁSTICO DURO',tela_bolso:'TELA DE BOLSO',forro_matelace:'FORRO MATELACÊ'};
const UNIT_KINDS=new Set(['mosquetao','fecho','passador','meia_argola','regulador','etiqueta','borracha_elastica','espuma','plastico_transparente','forro_termico','forro_impermeavel','plastico_duro','tela_bolso','forro_matelace']);
const HARDWARE=new Set(['mosquetao','fecho','passador','meia_argola','regulador']);
const NO_COLOR=new Set(['etiqueta','velcro','borracha_elastica','espuma','plastico_transparente','forro_termico','forro_impermeavel','plastico_duro','tela_bolso','forro_matelace']);
const BACKUP_VERSION='WORKNEO-BACKUP-1';
const backupPayload=(lists,reports)=>({format:BACKUP_VERSION,app:'WORKNEO',createdAt:new Date().toISOString(),data:{lists,reports}});
const downloadBackup=(lists,reports,setMessage)=>{try{const payload=JSON.stringify(backupPayload(lists,reports),null,2);const blob=new Blob([payload],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='WORKNEO-backup-'+today()+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);setMessage('Backup criado. Use este mesmo arquivo no PC ou no celular.')}catch(e){setMessage('Não foi possível criar o backup.')}};
const importBackup=(file,saveLists,saveReports,setMessage)=>{if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const payload=JSON.parse(String(reader.result||''));const data=payload?.data;if(payload?.app!=='WORKNEO'||payload?.format!==BACKUP_VERSION||!Array.isArray(data?.lists)||!Array.isArray(data?.reports))throw new Error('backup inválido');saveLists(data.lists);saveReports(data.reports);setMessage('Backup restaurado com sucesso. As listas e relatórios foram carregados.')}catch(e){setMessage('Arquivo de backup inválido ou incompatível com o WORKNEO.')}};reader.onerror=()=>setMessage('Não foi possível ler o arquivo.');reader.readAsText(file)};
const materialLabel=(kind,param,val)=>{if(kind==='linha')return{label:'LINHA — '+String(param).toUpperCase(),spec:'',unit:'M',raw:val,convert:false};if(kind==='ziper3'||kind==='ziper5')return{label:'ZÍPER Nº '+(kind==='ziper3'?'3':'5'),spec:param,unit:'UN',raw:val,convert:false};if(UNIT_KINDS.has(kind))return{label:MATERIAL_NAMES[kind]||kind.toUpperCase(),spec:param==='UNI'?'':param,unit:'UN',raw:val,convert:false};if(param==='largura')return null;return{label:MATERIAL_NAMES[kind]||kind.toUpperCase(),spec:param.toUpperCase()+' / PEÇA',unit:'M',raw:val,convert:true}};
const calculateMaterials=items=>{const out=[];for(const item of items){const rules=ruleMap.get(norm(item.product))||[];const pending={};for(const[kind,param,val]of rules){if(param==='largura'){pending[kind]=val;continue}const meta=materialLabel(kind,param,val);if(!meta)continue;const qty=n(item.qty)*n(val)/(meta.convert?100:1);let spec=meta.spec;if(pending[kind]!=null)spec='LARG. '+pending[kind]+' · '+spec;const color=UNIT_KINDS.has(kind)?(param||'SEM COR'):(HARDWARE.has(kind)?(param||'SEM COR'):(item.color||'SEM COR'));out.push({key:[meta.label,spec,meta.unit,color].join('|'),material:meta.label,spec,unit:meta.unit,color,qty});}}const map=new Map();for(const x of out){const old=map.get(x.key);if(old)old.qty+=x.qty;else map.set(x.key,{...x})}return[...map.values()].sort((a,b)=>a.material.localeCompare(b.material)||a.spec.localeCompare(b.spec)||a.color.localeCompare(b.color))};
const groupProducts=items=>{const m=new Map();for(const x of items){const k=norm(x.product);let g=m.get(k);if(!g){g={product:x.product,qty:0,colors:new Set(),orders:new Set()};m.set(k,g)}g.qty+=n(x.qty);if(x.color)g.colors.add(x.color);if(x.pedido)g.orders.add(x.pedido)}return[...m.values()].map(x=>({...x,colors:[...x.colors],orders:[...x.orders]})).sort((a,b)=>a.product.localeCompare(b.product))};
const materialRows=(materials,filter)=>materials.filter(x=>filter(x));
const matrixHtml=(materials,title)=>{const rows=materialRows(materials,x=>!NO_COLOR.has(norm(x.material).toLowerCase())&&!HARDWARE.has(norm(x.material).toLowerCase()));const colors=[...new Set(rows.map(x=>x.color).filter(Boolean))];if(!rows.length)return'<h3>'+title+'</h3><p>Nenhum material.</p>';const groups=new Map();for(const x of rows){const separateBySpec=/^ZÍPER Nº/i.test(x.material);const k=x.material+'|'+x.unit+(separateBySpec?'|'+x.spec:'');let g=groups.get(k);if(!g){g={material:x.material,unit:x.unit,specs:new Set()};groups.set(k,g)}if(x.spec)g.specs.add(x.spec)}const body=[...groups.values()].map(g=>{const vals=colors.map(c=>rows.filter(x=>x.material===g.material&&x.unit===g.unit&&x.color===c&&(!/^ZÍPER Nº/i.test(g.material)||x.spec===[...g.specs][0])).reduce((s,x)=>s+x.qty,0));const total=vals.reduce((s,v)=>s+v,0);const specs=[...g.specs].join(' · ');return'<tr><td>'+g.material+'</td><td>'+specs+(g.unit?' ('+g.unit+')':'')+'</td>'+vals.map(v=>'<td>'+fmt(v)+'</td>').join('')+'<td>'+fmt(total)+'</td></tr>'}).join('');return'<h3>'+title+'</h3><table><thead><tr><th>MATERIAL</th><th>ESPECIFICAÇÃO</th>'+colors.map(c=>'<th>'+c+'</th>').join('')+'<th>TOTAL</th></tr></thead><tbody>'+body+'</tbody></table>';};
const simpleMaterialHtml=(materials,title,fn)=>{const rows=materialRows(materials,fn);if(!rows.length)return'<h3>'+title+'</h3><p>Nenhum material.</p>';const map=new Map();for(const x of rows){const k=x.material+'|'+x.unit;let g=map.get(k);if(!g)g={material:x.material,unit:x.unit,specs:new Set(),qty:0};if(x.spec)g.specs.add(x.spec);g.qty+=x.qty;map.set(k,g)}const body=[...map.values()].map(g=>'<tr><td>'+g.material+'</td><td>'+[...g.specs].join(' · ')+'</td><td>'+fmt(g.qty)+' '+g.unit+'</td></tr>').join('');return'<h3>'+title+'</h3><table><thead><tr><th>MATERIAL</th><th>ESPECIFICAÇÃO</th><th>TOTAL</th></tr></thead><tbody>'+body+'</tbody></table>';};
function PublicShare({data,loading,error,filters,setFilters}){
 const reports=Array.isArray(data?.reports)?data.reports:[],lists=Array.isArray(data?.lists)?data.lists:[],share=data?.share||{};
 const products=useMemo(()=>[...new Set(reports.flatMap(r=>(r.items||[]).map(i=>i.product)))].sort(),[reports]);
 const costureiras=useMemo(()=>[...new Set(reports.map(r=>r.costureira).filter(Boolean))].sort(),[reports]);
 const rows=useMemo(()=>filterProductionRows(data,filters),[data,filters]);
 const total=rows.reduce((s,r)=>s+r.qty,0);
 const grouped=useMemo(()=>{const m=new Map();for(const r of rows){const k=r.date+'|'+r.product;const old=m.get(k);if(old)old.qty+=r.qty;else m.set(k,{date:r.date,product:r.product,qty:r.qty})}return[...m.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.product.localeCompare(b.product))},[rows]);
 const pendingProducts=useMemo(()=>{
   const original=new Map();
   for(const l of lists){
     if(filters.listId&&l.id!==filters.listId)continue;
     for(const i of (l.items||[])){
       if(filters.product&&i.product!==filters.product)continue;
       const key=i.product;
       original.set(key,(original.get(key)||0)+Number(i.qty||0));
     }
   }
   const sent=new Map();
   for(const r of rows)sent.set(r.product,(sent.get(r.product)||0)+r.qty);
   return [...original.entries()].map(([product,qty])=>({product,original:qty,sent:sent.get(product)||0,pending:Math.max(0,qty-(sent.get(product)||0))})).filter(x=>x.pending>0).sort((a,b)=>b.pending-a.pending||a.product.localeCompare(b.product));
 },[lists,rows,filters.listId,filters.product]);
 const pendingLists=useMemo(()=>{
   return lists.map(l=>{
     if(filters.listId&&l.id!==filters.listId)return null;
     const pendingItems=(l.items||[]).map(item=>{
       const original=Number(item.qty||0);
       const sent=rows.filter(r=>r.listId===l.id&&r.product===item.product).reduce((sum,r)=>sum+r.qty,0);
       return {...item,original,sent,pending:Math.max(0,original-sent)};
     }).filter(item=>item.pending>0);
     const pending=pendingItems.reduce((sum,item)=>sum+item.pending,0);
     const sentQty=(l.items||[]).reduce((sum,item)=>{
       const original=Number(item.qty||0);
       const sent=rows.filter(r=>r.listId===l.id&&r.product===item.product).reduce((s,r)=>s+r.qty,0);
       return sum+Math.min(original,sent);
     },0);
     return pending>0?{...l,pendingItems,pending,sentQty}:null;
   }).filter(Boolean);
 },[lists,rows,filters.listId]);
 const filteredReports=useMemo(()=>reports.filter(r=>{
   const date=String(r.date||'');
   const start=filters.startDate||'0000-01-01',end=filters.endDate||'9999-12-31';
   if(date<start||date>end)return false;
   if(filters.costureira&&r.costureira!==filters.costureira)return false;
   if(filters.listId&&r.listId!==filters.listId)return false;
   return true;
 }),[reports,filters]);
 const materialTotals=useMemo(()=>{
   const items=[];
   for(const r of filteredReports)for(const item of (r.items||[])){
     if(filters.product&&item.product!==filters.product)continue;
     items.push(item);
   }
   const mats=calculateMaterials(items),map=new Map();
   for(const m of mats){
     const key=m.material+'|'+m.spec+'|'+m.unit+'|'+m.color;
     const old=map.get(key);
     if(old)old.qty+=m.qty; else map.set(key,{...m,key});
   }
   return [...map.values()].sort((a,b)=>a.material.localeCompare(b.material)||a.spec.localeCompare(b.spec));
 },[filteredReports,filters.product]);
 if(loading&&!data)return <main className="page"><section className="panel"><div className="empty">Carregando acompanhamento...</div></section></main>;
 if(error&&!data)return <main className="page"><section className="panel"><div className="empty">{error}</div></section></main>;
 const scopeLabel=share.share_type==='list'?'Lista específica':share.share_type==='seamstress'?'Costureira específica':'Produção geral';
 const resetFilters=()=>setFilters({startDate:'',endDate:'',costureira:share.share_type==='seamstress'?(share.costureira||''):'',product:'',listId:share.share_type==='list'?(share.list_id||''):''});
 return <main className="page">
 <section className="panel"><div className="section-head"><div><h2>🔗 ACOMPANHAMENTO DE PRODUÇÃO</h2><p>{scopeLabel} · atualização automática</p></div><div className="status" style={{color:'#1769e0'}}>● ONLINE</div></div>
 <div className="form-grid"><label>DATA INICIAL<input type="date" min={share.start_date||undefined} max={share.end_date||undefined} value={filters.startDate} onChange={e=>setFilters({...filters,startDate:e.target.value})}/></label><label>DATA FINAL<input type="date" min={share.start_date||undefined} max={share.end_date||undefined} value={filters.endDate} onChange={e=>setFilters({...filters,endDate:e.target.value})}/></label><label>COSTUREIRA<select disabled={share.share_type==='seamstress'} value={filters.costureira} onChange={e=>setFilters({...filters,costureira:e.target.value})}><option value="">Todas</option>{costureiras.map(x=><option key={x}>{x}</option>)}</select></label><label>PRODUTO<select value={filters.product} onChange={e=>setFilters({...filters,product:e.target.value})}><option value="">Todos</option>{products.map(x=><option key={x}>{x}</option>)}</select></label><label>LISTA<select disabled={share.share_type==='list'} value={filters.listId} onChange={e=>setFilters({...filters,listId:e.target.value})}><option value="">Todas</option>{lists.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label></div>
 <div className="actions"><button className="primary" onClick={resetFilters}>🔄 LIMPAR FILTROS</button></div></section>
 <section className="summary-grid" style={{marginBottom:18}}><div className="summary-card"><span>PEÇAS ENVIADAS</span><b>{fmt(total)}</b><small>nos filtros atuais</small></div><div className="summary-card"><span>PRODUTOS</span><b>{new Set(rows.map(r=>r.product)).size}</b><small>produtos encontrados</small></div><div className="summary-card"><span>RELATÓRIOS</span><b>{filteredReports.length}</b><small>envios registrados</small></div><div className="summary-card"><span>MATERIAIS</span><b>{fmt(materialTotals.length)}</b><small>tipos calculados</small></div></section>

 <section className="panel"><div className="section-head"><div><h2>📦 ITENS ENVIADOS À COSTURA</h2><p>Detalhamento por data, produto, quantidade, cor, pedido e costureira.</p></div></div>{rows.length?<div className="table-wrap"><table><thead><tr><th>DATA</th><th>PRODUTO</th><th>QTD.</th><th>COR</th><th>Nº PEDIDO</th><th>COSTUREIRA</th><th>LISTA</th><th>LANÇADO POR</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}><td>{fmtDate(r.date)}</td><td>{r.product}</td><td>{fmt(r.qty)}</td><td>{r.color||'—'}</td><td>{r.pedido||'—'}</td><td>{r.costureira||'—'}</td><td>{r.listName||'—'}</td><td>{r.createdBy?.name||r.createdBy?.email||'—'}</td></tr>)}</tbody></table></div>:<div className="empty">Nenhum item enviado com estes filtros.</div>}</section>

 <section className="panel"><div className="section-head"><div><h2>📅 RESUMO POR PRODUTO E DIA DE ENVIO</h2><p>O dia é a data do envio do relatório à costureira.</p></div></div>{grouped.length?<div className="table-wrap"><table><thead><tr><th>DATA DE ENVIO</th><th>PRODUTO</th><th>QUANTIDADE</th></tr></thead><tbody>{grouped.map((r,i)=><tr key={i}><td>{fmtDate(r.date)}</td><td>{r.product}</td><td>{fmt(r.qty)}</td></tr>)}</tbody></table></div>:<div className="empty">Nenhuma produção encontrada.</div>}</section>

 <section className="panel"><div className="section-head"><div><h2>⏳ ITENS PENDENTES DE ENVIO</h2><p>Quantidade original das listas menos o que já foi enviado. Agrupado por produto.</p></div></div>{pendingProducts.length?<div className="table-wrap"><table><thead><tr><th>PRODUTO</th><th>LISTA(S)</th><th>ORIGINAL</th><th>ENVIADO</th><th>PENDENTE</th></tr></thead><tbody>{pendingProducts.map(x=><tr key={x.product}><td>{x.product}</td><td>{lists.filter(l=>(!filters.listId||l.id===filters.listId)&&(l.items||[]).some(i=>i.product===x.product)).map(l=>l.name).join(' · ')||'—'}</td><td>{fmt(x.original)}</td><td>{fmt(x.sent)}</td><td><b style={{color:'#d97706'}}>{fmt(x.pending)}</b></td></tr>)}</tbody></table></div>:<div className="empty">Nenhum item pendente dentro dos filtros atuais.</div>}</section>

 <section className="panel"><div className="section-head"><div><h2>📋 LISTAS AINDA NÃO ENVIADAS</h2><p>Lista completa e saldo de peças que ainda aguardam envio.</p></div></div>{pendingLists.length?<div className="table-wrap"><table><thead><tr><th>LISTA</th><th>PEÇAS PENDENTES</th><th>STATUS</th></tr></thead><tbody>{pendingLists.map(l=><tr key={l.id}><td>{l.name}</td><td>{fmt(l.pending)}</td><td><b style={{color:'#d97706'}}>{l.sentQty>0?'ENVIO PARCIAL':'AGUARDANDO ENVIO'}</b></td></tr>)}</tbody></table></div>:<div className="empty">Nenhuma lista pendente de envio.</div>}</section>

 <section className="panel"><div className="section-head"><div><h2>🧵 MATERIAIS ENVIADOS PARA A COSTURA</h2><p>Quantidades calculadas pela ficha técnica dos produtos enviados no período e filtros selecionados.</p></div></div>{materialTotals.length?<div className="table-wrap"><table><thead><tr><th>MATERIAL</th><th>ESPECIFICAÇÃO</th><th>COR</th><th>TOTAL</th></tr></thead><tbody>{materialTotals.map(m=><tr key={m.key}><td><b>{m.material}</b></td><td>{m.spec||'—'}</td><td>{m.color||'SEM COR'}</td><td>{fmt(m.qty)} {m.unit}</td></tr>)}</tbody></table></div>:<div className="empty">Nenhum material calculado para os filtros atuais.</div>}</section>

 <section className="panel"><div className="section-head"><div><h2>📄 RELATÓRIOS FEITOS</h2><p>Cada envio fica disponível para consulta, com produtos e materiais calculados.</p></div></div>{filteredReports.length?<div className="saved-list">{filteredReports.map(r=>{const q=(r.items||[]).reduce((s,x)=>s+n(x.qty),0);const rm=calculateMaterials(r.items||[]);return <article className="saved" key={r.id}><div><b>{r.costureira}</b><span>{r.listName} · {fmtDate(r.date)}</span><span>{fmt(q)} peças · {r.items?.length||0} itens</span></div><details><summary>👁 Visualizar relatório</summary><div className="table-wrap"><table><thead><tr><th>PRODUTO</th><th>QTD.</th><th>COR</th><th>PEDIDO</th></tr></thead><tbody>{(r.items||[]).map((x,i)=><tr key={i}><td>{x.product}</td><td>{fmt(x.qty)}</td><td>{x.color||'—'}</td><td>{x.pedido||'—'}</td><td>{x.createdBy?.name||x.createdBy?.email||'—'}</td></tr>)}</tbody></table></div><h3 style={{marginTop:16}}>Materiais deste relatório</h3><div className="table-wrap"><table><thead><tr><th>MATERIAL</th><th>ESPECIFICAÇÃO</th><th>TOTAL</th></tr></thead><tbody>{rm.map(m=><tr key={m.key}><td>{m.material}</td><td>{m.spec||'—'}</td><td>{fmt(m.qty)} {m.unit}</td></tr>)}</tbody></table></div></details></article>})}</div>:<div className="empty">Nenhum relatório encontrado.</div>}</section>

 <section className="panel"><div className="section-head"><div><h2>📊 RESUMO POR COSTUREIRA</h2><p>Peças enviadas nos filtros atuais.</p></div></div><div className="summary-grid">{costureiras.map(c=>{const q=rows.filter(r=>r.costureira===c).reduce((s,r)=>s+r.qty,0);return <div className="summary-card" key={c}><span>{c}</span><b>{fmt(q)}</b><small>peças</small></div>})}</div></section>
 </main>
}

function App(){
const[tab,setTab]=useState('listas'),[lists,setLists]=useState(()=>read(LISTS_KEY)),[reports,setReports]=useState(()=>read(REPORTS_KEY));
const[session,setSession]=useState(null),[workspace,setWorkspace]=useState(null),[teamMembers,setTeamMembers]=useState([]),[teamEmail,setTeamEmail]=useState(''),[teamName,setTeamName]=useState(''),[authLoading,setAuthLoading]=useState(isSupabaseConfigured),[authMode,setAuthMode]=useState('login'),[authEmail,setAuthEmail]=useState(''),[authPassword,setAuthPassword]=useState(''),[authBusy,setAuthBusy]=useState(false),[syncStatus,setSyncStatus]=useState(isSupabaseConfigured?'aguardando login':'local');
const shareToken=useMemo(()=>new URLSearchParams(window.location.search).get('acompanhamento')||'',[]);
const[publicShare,setPublicShare]=useState(null),[publicShareLoading,setPublicShareLoading]=useState(Boolean(shareToken)),[publicShareError,setPublicShareError]=useState('');
const[publicFilters,setPublicFilters]=useState({startDate:'',endDate:'',costureira:'',product:'',listId:''});
const[shareType,setShareType]=useState('general'),[shareListId,setShareListId]=useState(''),[shareCostureira,setShareCostureira]=useState(''),[shareStartDate,setShareStartDate]=useState(''),[shareEndDate,setShareEndDate]=useState(''),[shareLinks,setShareLinks]=useState([]),[shareBusy,setShareBusy]=useState(false);
const cloudReadyRef=useRef(false),skipNextSyncRef=useRef(false),syncTimerRef=useRef(null),lastCloudUpdateRef=useRef('');
const[selectedListId,setSelectedListId]=useState(''),[listName,setListName]=useState(''),[item,setItem]=useState({product:'',qty:'',color:'',pedido:''});
const[reportListId,setReportListId]=useState(''),[costureira,setCostureira]=useState(''),[reportDate,setReportDate]=useState(today()),[sendQty,setSendQty]=useState({}),[message,setMessage]=useState('');
const currentList=lists.find(x=>x.id===selectedListId)||null,reportList=lists.find(x=>x.id===reportListId)||null;
const saveLists=v=>{setLists(v);write(LISTS_KEY,v)},saveReports=v=>{setReports(v);write(REPORTS_KEY,v)};

useEffect(()=>{
  if(!isSupabaseConfigured||!supabase){
    setAuthLoading(false);
    return;
  }
  let alive=true;
  supabase.auth.getSession().then(({data,error})=>{
    if(!alive)return;
    if(error) setMessage?.(''); 
    setSession(data?.session||null);
    setAuthLoading(false);
  });
  const{data:{subscription}}=supabase.auth.onAuthStateChange((_event,nextSession)=>{
    if(alive) setSession(nextSession);
  });
  return()=>{alive=false;subscription.unsubscribe()};
},[]);

useEffect(()=>{
  if(!shareToken||!isSupabaseConfigured||!supabase)return;
  let alive=true;
  const load=async()=>{try{const data=await loadPublicProductionShare(shareToken);if(alive){setPublicShare(data);setPublicShareError('');setPublicShareLoading(false)}}catch(error){console.error(error);if(alive){setPublicShareError(error?.message||'Link inválido ou desativado.');setPublicShareLoading(false)}}};
  load();const timer=setInterval(load,5000);return()=>{alive=false;clearInterval(timer)};
},[shareToken]);

useEffect(()=>{
  if(!session?.user?.id||!isSupabaseConfigured||shareToken)return;
  listProductionShares().then(setShareLinks).catch(error=>console.error(error));
},[session,shareToken]);

useEffect(()=>{
  if(!session?.user?.id||!isSupabaseConfigured||!supabase)return;
  let alive=true;
  setWorkspace(null);
  setTeamMembers([]);
  cloudReadyRef.current=false;
  setSyncStatus('sincronizando');
  ensureWorkspace().then(async ws=>{
    if(!alive)return;
    setWorkspace(ws);
    const members=await listWorkspaceMembers(ws.workspace_id);
    if(alive)setTeamMembers(members);
  }).catch(error=>{
    console.error(error);
    if(alive){
      setSyncStatus('offline');
      setMessage(error?.message||'Não foi possível preparar a equipe compartilhada.');
    }
  });
  return()=>{alive=false};
},[session]);

useEffect(()=>{
  if(!workspace?.workspace_id||!isSupabaseConfigured)return;
  let alive=true;
  cloudReadyRef.current=false;
  setSyncStatus('sincronizando');
  loadWorkspaceData(workspace.workspace_id).then(data=>{
    if(!alive)return;
    skipNextSyncRef.current=true;
    lastCloudUpdateRef.current=data?.updated_at||'';
    const cloudLists=Array.isArray(data?.lists)?data.lists:[];
    const cloudReports=Array.isArray(data?.reports)?data.reports:[];
    setLists(cloudLists);write(LISTS_KEY,cloudLists);
    setReports(cloudReports);write(REPORTS_KEY,cloudReports);
    setSyncStatus('sincronizado');
    cloudReadyRef.current=true;
  }).catch(error=>{
    console.error(error);
    if(alive){
      cloudReadyRef.current=true;
      setSyncStatus('offline');
      setMessage(error?.message||'Não foi possível carregar os dados compartilhados.');
    }
  });
  return()=>{alive=false;cloudReadyRef.current=false};
},[workspace?.workspace_id]);

useEffect(()=>{
  if(!workspace?.workspace_id||!cloudReadyRef.current||!isSupabaseConfigured)return;
  if(skipNextSyncRef.current){
    skipNextSyncRef.current=false;
    return;
  }
  clearTimeout(syncTimerRef.current);
  setSyncStatus('salvando...');
  syncTimerRef.current=setTimeout(async()=>{
    try{
      const saved=await saveWorkspaceData(workspace.workspace_id,lists,reports);
      lastCloudUpdateRef.current=saved?.updated_at||'';
      setSyncStatus('sincronizado');
    }catch(error){
      console.error(error);
      setSyncStatus('offline');
      setMessage(error?.message||'A alteração não pôde ser sincronizada.');
    }
  },650);
  return()=>clearTimeout(syncTimerRef.current);
},[lists,reports,workspace?.workspace_id]);

useEffect(()=>{
  if(!workspace?.owner_user_id||!isSupabaseConfigured)return;
  return subscribeToWorkspaceData(workspace.workspace_id,payload=>{
    if(!payload)return;
    if(payload.updated_at&&payload.updated_at===lastCloudUpdateRef.current)return;
    skipNextSyncRef.current=true;
    lastCloudUpdateRef.current=payload.updated_at||'';
    const cloudLists=Array.isArray(payload.lists)?payload.lists:[];
    const cloudReports=Array.isArray(payload.reports)?payload.reports:[];
    setLists(cloudLists);write(LISTS_KEY,cloudLists);
    setReports(cloudReports);write(REPORTS_KEY,cloudReports);
    setSyncStatus('sincronizado');
  },status=>{
    if(status==='SUBSCRIBED')setSyncStatus('sincronizado');
  });
},[workspace?.owner_user_id]);


const handleAuth=async e=>{
  e.preventDefault();
  if(!supabase||!authEmail.trim()||authPassword.length<6){
    setMessage('Informe um e-mail e uma senha com pelo menos 6 caracteres.');
    return;
  }
  setAuthBusy(true);
  try{
    if(authMode==='signup'){
      const{data,error}=await supabase.auth.signUp({email:authEmail.trim(),password:authPassword,options:{emailRedirectTo:AUTH_REDIRECT_URL}});
      if(error)throw error;
      if(data.session)setMessage('Conta criada e conectada.');
      else setMessage('Conta criada. Verifique o e-mail para confirmar o acesso.');
    }else{
      const{error}=await supabase.auth.signInWithPassword({email:authEmail.trim(),password:authPassword});
      if(error)throw error;
      setMessage('Login realizado. Sincronizando seus dados...');
    }
  }catch(error){
    console.error(error);
    setMessage(error?.message||'Não foi possível concluir o login.');
  }finally{setAuthBusy(false)}
};

const resetPassword=async()=>{
  if(!supabase||!authEmail.trim()){setMessage('Informe seu e-mail para recuperar a senha.');return}
  setAuthBusy(true);
  try{
    const{error}=await supabase.auth.resetPasswordForEmail(authEmail.trim(),{redirectTo:AUTH_REDIRECT_URL});
    if(error)throw error;
    setMessage('Se o e-mail estiver cadastrado, o link de recuperação será enviado.');
  }catch(error){setMessage(error?.message||'Não foi possível enviar a recuperação.')}finally{setAuthBusy(false)}
};

const createShareLink=async()=>{
  if(!supabase||!session){setMessage('Faça login para criar um link.');return}
  if(shareType==='list'&&!shareListId){setMessage('Escolha a lista do acompanhamento.');return}
  if(shareType==='seamstress'&&!shareCostureira){setMessage('Escolha a costureira do acompanhamento.');return}
  if(shareStartDate&&shareEndDate&&shareStartDate>shareEndDate){setMessage('A data inicial não pode ser maior que a final.');return}
  setShareBusy(true);
  try{const created=await createProductionShare({shareType,listId:shareListId,costureira:shareCostureira,startDate:shareStartDate,endDate:shareEndDate});setShareLinks(await listProductionShares());const url=AUTH_REDIRECT_URL+'?acompanhamento='+created.token;try{await navigator.clipboard.writeText(url);setMessage('Link criado e copiado.')}catch{setMessage('Link criado. Copie o endereço abaixo.')}}catch(error){console.error(error);setMessage(error?.message||'Não foi possível criar o link.')}finally{setShareBusy(false)}
};
const revokeShareLink=async id=>{try{await revokeProductionShare(id);setShareLinks(await listProductionShares());setMessage('Link desativado.')}catch(error){setMessage(error?.message||'Não foi possível desativar o link.')}};
const logout=async()=>{
  if(supabase)await supabase.auth.signOut();
  setSession(null);
  setSyncStatus(isSupabaseConfigured?'aguardando login':'local');
};
const actor=()=>({userId:session?.user?.id||'',email:session?.user?.email||'',name:workspace?.display_name||session?.user?.email||'Usuário'});
const createList=()=>{if(!workspace){setMessage('A equipe ainda está sincronizando.');return}const name=listName.trim()||'Lista '+new Date().toLocaleDateString('pt-BR'),a=actor(),l={id:uid(),name,createdAt:new Date().toISOString(),createdBy:a,items:[]},v=[...lists,l];saveLists(v);setSelectedListId(l.id);setReportListId(l.id);setListName('');setMessage('Lista criada por '+a.name+'.')};
const addItem=()=>{if(!selectedListId||!item.product||n(item.qty)<=0){setMessage('Escolha a lista, o produto e uma quantidade maior que zero.');return}const a=actor();saveLists(lists.map(l=>l.id!==selectedListId?l:{...l,items:[...l.items,{id:uid(),product:item.product,qty:n(item.qty),color:item.color||'SEM COR',pedido:String(item.pedido||'').trim(),createdBy:a}]}));setItem({product:'',qty:'',color:'',pedido:''});setMessage('Item lançado por '+a.name+'.')};
const removeItem=id=>{if(workspace?.role!=='admin'){setMessage('Somente o administrador pode excluir itens.');return}saveLists(lists.map(l=>l.id!==selectedListId?l:{...l,items:l.items.filter(x=>x.id!==id)}))};
const generateReport=()=>{if(!reportList){setMessage('Escolha uma lista no Relatório.');return}if(!costureira){setMessage('Escolha a costureira.');return}const selected=reportList.items.filter(x=>n(x.qty)>0).map(x=>{const q=Math.min(n(sendQty[x.id]),n(x.qty));return q>0?{...x,qty:q}:null}).filter(Boolean);if(!selected.length){setMessage('Informe pelo menos uma quantidade para enviar.');return}const a=actor(),grouped=groupProducts(selected),materials=calculateMaterials(selected),r={id:uid(),listId:reportList.id,listName:reportList.name,date:reportDate||today(),costureira,createdAt:new Date().toISOString(),createdBy:a,items:selected,groupedProducts:grouped,materials};saveReports([r,...reports]);const used=new Map(selected.map(x=>[x.id,x.qty]));saveLists(lists.map(l=>l.id!==reportList.id?l:{...l,items:l.items.map(x=>{const q=n(used.get(x.id));return q?{...x,qty:n(x.qty)-q}:x})}));setSendQty({});setMessage('Relatório salvo por '+a.name+': '+fmt(selected.reduce((s,x)=>s+x.qty,0))+' peças e '+fmt(materials.length)+' materiais calculados.');setTab('relatorios')};
const totalReport=reportList?reportList.items.reduce((s,x)=>s+Math.min(n(sendQty[x.id]),n(x.qty)),0):0;
const totals=useMemo(()=>{const m={};for(const r of reports)m[r.costureira]=(m[r.costureira]||0)+r.items.reduce((s,x)=>s+n(x.qty),0);return m},[reports]);
const printReport=async(r,mode='completo')=>{const grouped=r.groupedProducts||groupProducts(r.items||[]),materials=r.materials||calculateMaterials(r.items||[]);const productsHtml='<h2>1. PRODUTOS AGRUPADOS NO ENVIO</h2><table><thead><tr><th>PRODUTO</th><th>QUANTIDADE</th><th>CORES</th><th>Nº PEDIDOS</th></tr></thead><tbody>'+grouped.map(x=>'<tr><td>'+x.product+'</td><td>'+fmt(x.qty)+'</td><td>'+x.colors.join(', ')+'</td><td>'+x.orders.join(', ')||'—'+'</td></tr>').join('')+'</tbody></table><div class="total">TOTAL DE PEÇAS: '+fmt((r.items||[]).reduce((s,x)=>s+n(x.qty),0))+'</div>';const materialsHtml='<h2>2. MATERIAIS PARA COSTURA</h2>'+matrixHtml(materials,'MATERIAIS POR COR')+simpleMaterialHtml(materials,'FERRAGENS E REGULADORES',x=>HARDWARE.has(norm(x.material).toLowerCase()))+simpleMaterialHtml(materials,'MATERIAIS SEM COR',x=>NO_COLOR.has(norm(x.material).toLowerCase()));const html='<!doctype html><html><head><meta charset="utf-8"><title>WORKNEO · Relatório</title><style>@page{size:A4 landscape;margin:12mm}body{font-family:Arial,sans-serif;color:#172033;font-size:11px;background:#fff;padding-top:54px}.report-actions{position:fixed;top:0;left:0;right:0;z-index:9999;display:flex;justify-content:flex-end;gap:8px;padding:9px 12px;background:#14213d;box-shadow:0 2px 8px #0002}.report-actions button{border:0;border-radius:7px;padding:9px 14px;font-weight:800;font-size:12px;cursor:pointer}.close-report{background:#fff;color:#14213d}h1{font-size:21px;margin:0 0 4px;color:#14213d;border-bottom:4px solid #1769e0;padding-bottom:8px}h2{font-size:14px;margin:20px 0 7px;color:#1769e0;background:#eef5ff;border-left:5px solid #1769e0;padding:7px 9px;border-radius:4px}h3{font-size:12px;margin:14px 0 6px;color:#14213d}.meta{display:grid;grid-template-columns:repeat(4,1fr);gap:8px 14px;margin:12px 0 16px}.meta div{border:1px solid #d7e1ef;background:#f7faff;border-radius:6px;padding:7px 9px}.meta b{color:#1769e0;font-size:9px;letter-spacing:.04em}table{width:100%;border-collapse:separate;border-spacing:0;margin:5px 0 12px;border:1px solid #cfd9e7;border-radius:6px;overflow:hidden}th,td{border-right:1px solid #dbe3ed;border-bottom:1px solid #dbe3ed;padding:6px 7px;text-align:left}th{background:#14213d;color:#fff;font-size:9px;letter-spacing:.03em}tr:nth-child(even) td{background:#f7faff}tr:last-child td{border-bottom:0}th:last-child,td:last-child{border-right:0}td:nth-child(n+2){text-align:center}.total{font-weight:800;font-size:13px;margin:7px 0;padding:8px 10px;background:#eaf3ff;border-radius:6px;color:#14213d}.note{font-size:9px;color:#64748b;margin-top:15px;border-top:1px solid #dbe3ed;padding-top:8px}.print-only{display:block}</style></head><body><div class="report-actions"><button class="close-report" onclick="try{window.close()}catch(e){};setTimeout(function(){if(!window.closed){history.back()}},150)">✕ FECHAR RELATÓRIO</button></div><h1>WORKNEO · RELATÓRIO DE MATERIAIS PARA COSTURA</h1><div class="meta"><div><b>COSTUREIRA</b><br>'+r.costureira+'</div><div><b>LISTA</b><br>'+r.listName+'</div><div><b>DATA DA SEPARAÇÃO</b><br>'+fmtDate(r.date)+'</div><div><b>QUANTIDADE DE PEÇAS</b><br>'+fmt((r.items||[]).reduce((s,x)=>s+n(x.qty),0))+'</div></div>'+(mode==='pecas'?productsHtml:mode==='materiais'?materialsHtml:productsHtml+materialsHtml)+'<div class="note">Materiais calculados exclusivamente a partir das fichas técnicas da planilha FICHA SEPARAÇÃO 2026. A cor não encontrada na ficha usa a mesma regra técnica do produto, pois o processo de fabricação permanece o mesmo.</div></body></html>';if(Capacitor.isNativePlatform()){try{setMessage('Gerando PDF...');const holder=document.createElement('div');const parsed=new DOMParser().parseFromString(html,'text/html');const style=document.createElement('style');style.textContent=Array.from(parsed.querySelectorAll('style')).map(x=>x.textContent).join('\\n');holder.appendChild(style);const content=document.createElement('div');content.innerHTML=parsed.body.innerHTML;holder.appendChild(content);holder.style.position='fixed';holder.style.left='-100000px';holder.style.top='0';holder.style.width='277mm';holder.style.background='#fff';document.body.appendChild(holder);const blob=await html2pdf().set({margin:[8,8,8,8],filename:'WORKNEO-relatorio.pdf',image:{type:'jpeg',quality:.96},html2canvas:{scale:2,useCORS:true,backgroundColor:'#fff'},jsPDF:{unit:'mm',format:'a4',orientation:'landscape'}}).from(content).outputPdf('blob');holder.remove();const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]);reader.onerror=reject;reader.readAsDataURL(blob)});const fileName='WORKNEO-relatorio-'+Date.now()+'.pdf';const written=await Filesystem.writeFile({path:fileName,data:base64,directory:Directory.Cache});const uri=(await Filesystem.getUri({directory:Directory.Cache,path:fileName})).uri;await FileOpener.open({filePath:uri,contentType:'application/pdf',openWithDefault:false});setMessage('PDF pronto. Escolha o aplicativo para abrir.')}catch(e){console.error(e);setMessage('Não foi possível abrir o PDF.');}}else{const w=window.open('','_blank');if(!w){setMessage('Permita pop-ups para imprimir.');return}w.document.write(html);w.document.close();w.focus();setTimeout(()=>w.print(),250)}};
const deleteReport=id=>{if(workspace?.role!=='admin'){setMessage('Somente o administrador pode excluir relatórios.');return}if(confirm('Apagar este relatório salvo?'))saveReports(reports.filter(r=>r.id!==id))};
const refreshTeam=async()=>{if(!workspace?.workspace_id)return;try{setTeamMembers(await listWorkspaceMembers(workspace.workspace_id))}catch(error){setMessage(error?.message||'Não foi possível carregar a equipe.')}};
const addTeamMember=async()=>{if(workspace?.role!=='admin'){setMessage('Somente o administrador pode adicionar colaboradores.');return}if(!teamEmail.trim()){setMessage('Informe o e-mail do colaborador.');return}try{await addWorkspaceMember(workspace.workspace_id,teamEmail.trim(),teamName.trim());setTeamEmail('');setTeamName('');await refreshTeam();setMessage('Colaborador adicionado à equipe.')}catch(error){setMessage(error?.message||'Não foi possível adicionar o colaborador.')}};
const changeTeamRole=async(userId,role)=>{try{await setWorkspaceMemberRole(workspace.workspace_id,userId,role);await refreshTeam();setMessage('Função atualizada.')}catch(error){setMessage(error?.message||'Não foi possível alterar a função.')}};
const removeTeamMember=async(userId)=>{if(!confirm('Remover este colaborador da equipe?'))return;try{await removeWorkspaceMember(workspace.workspace_id,userId);await refreshTeam();setMessage('Colaborador removido da equipe.')}catch(error){setMessage(error?.message||'Não foi possível remover o colaborador.')}};
return <div className="app"><header className="top"><div><div className="brand">WORKNEO</div><div className="subtitle">Lista → Relatório → Materiais → Costura</div></div><div className="top-actions"><div className="status">{isSupabaseConfigured?(session?'☁ '+(session.user.email||'conta conectada'):'☁ login necessário'):'☁ nuvem não configurada'}</div><div className="status">● {syncStatus}</div><button className="backup-btn" onClick={()=>downloadBackup(lists,reports,setMessage)}>⬇ BACKUP</button><label className="backup-btn backup-import">⬆ RESTAURAR<input type="file" accept=".json,application/json" onChange={e=>{importBackup(e.target.files?.[0],saveLists,saveReports,setMessage);e.target.value=''}}/></label>{session&&<button className="backup-btn" onClick={logout}>SAIR</button>}</div></header>
{shareToken?<PublicShare data={publicShare} loading={publicShareLoading} error={publicShareError} filters={publicFilters} setFilters={setPublicFilters}/>:<>{isSupabaseConfigured&&!authLoading&&!session?<section className="auth-panel"><div className="auth-card"><div className="auth-logo">WORKNEO</div><h2>{authMode==='signup'?'Criar conta':'Entrar no WORKNEO'}</h2><p>Use a mesma conta no computador e no Android para manter listas e relatórios sincronizados na nuvem.</p><form onSubmit={handleAuth}><input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="Seu e-mail" autoComplete="email"/><input type="password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} placeholder="Senha" autoComplete={authMode==='signup'?'new-password':'current-password'}/><button className="primary" disabled={authBusy}>{authBusy?'AGUARDE...':authMode==='signup'?'CRIAR CONTA':'ENTRAR'}</button></form><div className="auth-links">{authMode==='login'?<><button onClick={()=>setAuthMode('signup')}>Criar nova conta</button><button onClick={resetPassword}>Esqueci minha senha</button></>:<button onClick={()=>setAuthMode('login')}>Já tenho uma conta</button>}</div><div className="auth-note">O backup JSON continua disponível como cópia independente.</div></div></section>:null}
{!isSupabaseConfigured||session?<nav className="tabs"><button className={tab==='listas'?'active':''} onClick={()=>setTab('listas')}>📋 LISTAS</button><button className={tab==='relatorios'?'active':''} onClick={()=>setTab('relatorios')}>📄 RELATÓRIOS</button>{session&&<button className={tab==='equipe'?'active':''} onClick={()=>{setTab('equipe');refreshTeam()}}>👥 EQUIPE</button>}</nav>:null}
{isSupabaseConfigured&&authLoading?<div className="auth-loading">Carregando sessão...</div>:null}
{message&&<div className="message" onClick={()=>setMessage('')}>{message}</div>}
{(!isSupabaseConfigured||session)&&tab==='listas'&&<main className="page"><section className="panel"><div className="section-head"><div><h2>LISTA DE SEPARAÇÃO</h2><p>A lista recebe os produtos do pedido. O cálculo de materiais acontece somente no Relatório.</p></div></div><div className="create-row"><input value={listName} onChange={e=>setListName(e.target.value)} placeholder="Nome da lista (ex.: 11207 espaço luz)"/><button onClick={createList}>+ NOVA LISTA</button></div><div className="list-grid">{lists.length===0?<div className="empty">Nenhuma lista criada.</div>:lists.map(l=><button key={l.id} className={'list-card '+(selectedListId===l.id?'selected':'')} onClick={()=>{setSelectedListId(l.id);setReportListId(l.id)}}><b>{l.name}</b><span>{l.items.length} linhas · {fmt(l.items.reduce((s,x)=>s+n(x.qty),0))} peças</span></button>)}</div></section>
{currentList&&<section className="panel"><div className="section-head"><div><h2>{currentList.name}</h2><p>PRODUTO · QUANT. · COR · Nº PEDIDO</p></div><div className="big-number">{fmt(currentList.items.reduce((s,x)=>s+n(x.qty),0))}<small>peças</small></div></div><div className="form-grid"><label>PRODUTO<select value={item.product} onChange={e=>setItem({...item,product:e.target.value})}><option value="">Selecione...</option>{PRODUCTS.map(p=><option key={p}>{p}</option>)}</select></label><label>QUANTIDADE<input type="number" min="1" value={item.qty} onChange={e=>setItem({...item,qty:e.target.value})}/></label><label>COR<select value={item.color} onChange={e=>setItem({...item,color:e.target.value})}><option value="">Selecione...</option>{COLORS.map(c=><option key={c}>{c}</option>)}</select></label><label>Nº PEDIDO<input value={item.pedido} onChange={e=>setItem({...item,pedido:e.target.value})} placeholder="Ex.: 11207"/></label></div><button className="primary" onClick={addItem}>+ ADICIONAR À LISTA</button><div className="table-wrap"><table><thead><tr><th>PRODUTO</th><th>QUANT.</th><th>COR</th><th>Nº PEDIDO</th><th></th></tr></thead><tbody>{currentList.items.filter(x=>n(x.qty)>0).length?currentList.items.filter(x=>n(x.qty)>0).map(x=><tr key={x.id}><td>{x.product}</td><td>{x.qty}</td><td>{x.color}</td><td>{x.pedido||'—'}</td><td>{x.createdBy?.name||x.createdBy?.email?<small>{x.createdBy?.name||x.createdBy?.email}</small>:null} {workspace?.role==='admin'&&<button className="danger" onClick={()=>removeItem(x.id)}>Excluir</button>}</td></tr>):<tr><td colSpan="5" className="empty">Esta lista ainda não possui itens.</td></tr>}</tbody></table></div></section>}</main>}
{(!isSupabaseConfigured||session)&&tab==='relatorios'&&<main className="page"><section className="panel"><div className="section-head"><div><h2>GERAR RELATÓRIO A PARTIR DA LISTA</h2><p>Escolha a lista, a costureira e o envio. A ficha técnica calcula automaticamente zíperes, etiquetas, fitas, linhas e demais materiais.</p></div></div><div className="form-grid"><label>LISTA<select value={reportListId} onChange={e=>{setReportListId(e.target.value);setSendQty({})}}><option value="">Selecione a lista...</option>{lists.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></label><label>COSTUREIRA<select value={costureira} onChange={e=>setCostureira(e.target.value)}><option value="">Selecione...</option>{SEAMSTRESSES.map(s=><option key={s}>{s}</option>)}</select></label><label>DATA DO ENVIO<input type="date" value={reportDate} onChange={e=>setReportDate(e.target.value)}/></label></div>{reportList?<><div className="hint">Você pode misturar cores e números de pedido. Na hora do relatório, produtos iguais são agrupados; a ficha técnica é aplicada por produto. Uma cor nova continua usando a mesma ficha do produto.</div><div className="table-wrap"><table><thead><tr><th>ENVIAR</th><th>PRODUTO</th><th>DISPONÍVEL</th><th>QTD. ENVIO</th><th>COR</th><th>Nº PEDIDO</th><th>LANÇADO POR</th></tr></thead><tbody>{reportList.items.filter(x=>n(x.qty)>0).length?reportList.items.filter(x=>n(x.qty)>0).map(x=><tr key={x.id}><td><input className="check" type="checkbox" checked={n(sendQty[x.id])>0} onChange={e=>setSendQty({...sendQty,[x.id]:e.target.checked?x.qty:0})}/></td><td>{x.product}</td><td>{x.qty}</td><td><input className="qty" type="number" min="0" max={x.qty} value={sendQty[x.id]??0} onChange={e=>setSendQty({...sendQty,[x.id]:Math.min(n(e.target.value),x.qty)})}/></td><td>{x.color}</td><td>{x.pedido||'—'}</td><td>{x.createdBy?.name||x.createdBy?.email||'—'}</td></tr>):<tr><td colSpan="7" className="empty">A lista está sem saldo para envio.</td></tr>}</tbody></table></div><div className="report-total">QUANTIDADE DE PEÇAS: <b>{fmt(totalReport)}</b></div><button className="primary large" onClick={generateReport}>📄 GERAR E SALVAR RELATÓRIO</button></>:<div className="empty">Escolha uma lista para carregar os itens.</div>}</section>
<section className="panel"><div className="section-head"><div><h2>🔗 LINK DE ACOMPANHAMENTO DA PRODUÇÃO</h2><p>Crie um link somente para leitura. O visitante poderá filtrar por período, costureira, produto e lista. Atualização automática.</p></div></div><div className="form-grid"><label>TIPO<select value={shareType} onChange={e=>setShareType(e.target.value)}><option value="general">Produção geral</option><option value="list">Uma lista</option><option value="seamstress">Uma costureira</option></select></label><label>LISTA<select disabled={shareType!=='list'} value={shareListId} onChange={e=>setShareListId(e.target.value)}><option value="">Selecione...</option>{lists.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select></label><label>COSTUREIRA<select disabled={shareType!=='seamstress'} value={shareCostureira} onChange={e=>setShareCostureira(e.target.value)}><option value="">Selecione...</option>{SEAMSTRESSES.map(s=><option key={s}>{s}</option>)}</select></label><label>DATA INICIAL<input type="date" value={shareStartDate} onChange={e=>setShareStartDate(e.target.value)}/></label><label>DATA FINAL<input type="date" value={shareEndDate} onChange={e=>setShareEndDate(e.target.value)}/></label></div><button className="primary large" disabled={shareBusy} onClick={createShareLink}>🔗 {shareBusy?'CRIANDO...':'CRIAR LINK DE ACOMPANHAMENTO'}</button><div className="saved-list" style={{marginTop:16}}>{shareLinks.length===0?<div className="empty">Nenhum link criado.</div>:shareLinks.map(s=><article className="saved" key={s.id}><div><b>{s.share_type==='general'?'Produção geral':s.share_type==='list'?'Lista específica':'Costureira específica'}</b><span>{s.start_date||'início'} → {s.end_date||'sem fim'}{s.costureira?' · '+s.costureira:''}</span><span>{AUTH_REDIRECT_URL+'?acompanhamento='+s.token}</span></div><div className="actions"><button onClick={()=>navigator.clipboard?.writeText(AUTH_REDIRECT_URL+'?acompanhamento='+s.token)}>📋 COPIAR</button>{s.active&&<button className="danger" onClick={()=>revokeShareLink(s.id)}>DESATIVAR</button>}</div></article>)}</div></section><section className="panel"><div className="section-head"><div><h2>SOMATÓRIA POR COSTUREIRA</h2><p>A soma considera todos os relatórios já salvos, sem duplicar o mesmo envio.</p></div></div><div className="summary-grid">{SEAMSTRESSES.map(s=><div className="summary-card" key={s}><span>{s}</span><b>{fmt(totals[s]||0)}</b><small>peças enviadas</small></div>)}</div></section>
<section className="panel"><div className="section-head"><div><h2>RELATÓRIOS SALVOS</h2><p>Cada envio permanece individual e pode gerar os dois relatórios.</p></div></div>{reports.length===0?<div className="empty">Nenhum relatório salvo.</div>:<div className="saved-list">{reports.map(r=><article className="saved" key={r.id}><div><b>{r.costureira}</b><span>{r.listName} · {fmtDate(r.date)}</span><span>Lançado por: <b>{r.createdBy?.name||r.createdBy?.email||'Usuário anterior'}</b> · {fmt(r.items.reduce((s,x)=>s+n(x.qty),0))} peças · {r.groupedProducts?.length||groupProducts(r.items).length} produtos agrupados</span></div><div className="actions"><button onClick={()=>printReport(r,'pecas')}>📦 PEÇAS AGRUPADAS</button><button onClick={()=>printReport(r,'materiais')}>🧵 MATERIAIS</button><button className="primary" onClick={()=>printReport(r,'completo')}>📄 COMPLETO</button>{workspace?.role==='admin'&&<button className="danger" onClick={()=>deleteReport(r.id)}>Excluir</button>}</div><details><summary>Ver produtos enviados</summary><div className="table-wrap"><table><thead><tr><th>PRODUTO</th><th>QTD.</th><th>COR</th><th>Nº PEDIDO</th></tr></thead><tbody>{r.items.map((x,i)=><tr key={i}><td>{x.product}</td><td>{x.qty}</td><td>{x.color}</td><td>{x.pedido||'—'}</td></tr>)}</tbody></table></div></details></article>)}</div>}</section></main>}
{(!isSupabaseConfigured||session)&&tab==='equipe'&&<main className="page"><section className="panel"><div className="section-head"><div><h2>👥 EQUIPE DO WORKNEO</h2><p>Todos os colaboradores desta equipe trabalham na mesma lista e nos mesmos relatórios.</p></div><div className="status">● {workspace?.role==='admin'?'ADMINISTRADOR':'COLABORADOR'}</div></div><div className="hint"><b>{workspace?.workspace_name||'Equipe WORKNEO'}</b><br/>Seu acesso: {workspace?.role==='admin'?'Administrador — pode adicionar/remover colaboradores e excluir itens e relatórios.':'Colaborador — pode lançar e produzir, mas não pode excluir.'}</div>{workspace?.role==='admin'&&<><h3>Adicionar colaborador</h3><div className="create-row"><input type="email" value={teamEmail} onChange={e=>setTeamEmail(e.target.value)} placeholder="E-mail já cadastrado no WORKNEO"/><input value={teamName} onChange={e=>setTeamName(e.target.value)} placeholder="Nome do colaborador"/><button className="primary" onClick={addTeamMember}>+ ADICIONAR</button></div><div className="hint">O colaborador precisa primeiro criar a própria conta no WORKNEO. Depois o administrador adiciona o e-mail aqui.</div></>}<div className="saved-list" style={{marginTop:16}}>{teamMembers.length?teamMembers.map(m=><article className="saved" key={m.user_id}><div><b>{m.display_name||m.email}</b><span>{m.email}</span><span>{m.user_id===session?.user?.id?'Você · ':''}{m.role==='admin'?'ADMINISTRADOR':'COLABORADOR'}</span></div>{workspace?.role==='admin'&&m.user_id!==workspace?.owner_user_id&&<div className="actions"><button onClick={()=>changeTeamRole(m.user_id,m.role==='admin'?'member':'admin')}>{m.role==='admin'?'TORNAR COLABORADOR':'TORNAR ADMIN'}</button><button className="danger" onClick={()=>removeTeamMember(m.user_id)}>REMOVER</button></div>}</article>):<div className="empty">Nenhum colaborador cadastrado.</div>}</div></section></main>}
</>}<footer>WORKNEO · ficha técnica baseada na FICHA SEPARAÇÃO 2026 · cálculo no relatório</footer></div>}
class PublicShareErrorBoundary extends React.Component{
 constructor(props){super(props);this.state={error:null}}
 static getDerivedStateFromError(error){return{error}}
 componentDidCatch(error,info){console.error('WORKNEO acompanhamento render:',error,info)}
 render(){
   if(this.state.error)return <main className="page"><section className="panel"><div className="empty"><h2>ERRO NO ACOMPANHAMENTO</h2><p>{this.state.error?.message||'Erro inesperado ao carregar a página.'}</p><button className="primary" onClick={()=>window.location.reload()}>🔄 RECARREGAR</button></div></section></main>;
   return this.props.children;
 }
}
function PublicShareEntry(){
 const token=new URLSearchParams(window.location.search).get('acompanhamento')||'';
 const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const [filters,setFilters]=useState({startDate:'',endDate:'',costureira:'',product:'',listId:''});
 useEffect(()=>{
   if(!token){setError('Link de acompanhamento não informado.');setLoading(false);return}
   if(!isSupabaseConfigured||!supabase){setError('O acompanhamento online não está configurado neste ambiente.');setLoading(false);return}
   let alive=true;
   const load=async()=>{
     try{
       const result=await loadPublicProductionShare(token);
       if(!alive)return;
       setData(result);setError('');
     }catch(e){
       console.error('WORKNEO acompanhamento:',e);
       if(alive)setError(e?.message||'Não foi possível carregar este acompanhamento.');
     }finally{
       if(alive)setLoading(false);
     }
   };
   load();
   const timer=setInterval(load,5000);
   return()=>{alive=false;clearInterval(timer)};
 },[token]);
 return <PublicShare data={data} loading={loading} error={error} filters={filters} setFilters={setFilters}/>;
}
const hasPublicShare=new URLSearchParams(window.location.search).has('acompanhamento');
createRoot(document.getElementById('root')).render(hasPublicShare?<PublicShareErrorBoundary><PublicShareEntry/></PublicShareErrorBoundary>:<App/>);