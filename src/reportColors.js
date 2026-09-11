// WORKNEO — visual de cores no relatório/PDF
(function(){
  'use strict';
  const COLORS={
    'PRETO':{bg:'#20242b',fg:'#fff',border:'#11151b'},
    'MARINHO':{bg:'#17365d',fg:'#fff',border:'#102844'},
    'ROYAL':{bg:'#2867d8',fg:'#fff',border:'#174da8'},
    'VERMELHO':{bg:'#d92f3f',fg:'#fff',border:'#a91d2b'},
    'PINK':{bg:'#e83e8c',fg:'#fff',border:'#b52269'},
    'ROSA BEBÊ':{bg:'#f7c8d9',fg:'#3b2430',border:'#e6a7bf'},
    'ROSA':{bg:'#f3a9c0',fg:'#3b2430',border:'#d985a1'},
    'VERDE':{bg:'#45a96b',fg:'#fff',border:'#2f7e4d'},
    'AMARELO':{bg:'#f4cf3d',fg:'#292300',border:'#c6a719'},
    'LILÁS':{bg:'#b89ad9',fg:'#241b31',border:'#9676b8'},
    'VERDE PALMEIRAS':{bg:'#25834d',fg:'#fff',border:'#176036'},
    'BRANCO':{bg:'#fff',fg:'#172033',border:'#b9c2cf'},
    'CELESTE':{bg:'#9ed8f0',fg:'#163247',border:'#75b9d5'},
    'LARANJA':{bg:'#f28c28',fg:'#fff',border:'#c96a0f'},
    'VERDE ÁGUA':{bg:'#72d4c0',fg:'#12352f',border:'#4db39f'},
    'MARROM':{bg:'#8a5a3b',fg:'#fff',border:'#67412b'},
    'CREME':{bg:'#f2e1b3',fg:'#3a301e',border:'#d6c28d'}
  };
  const norm=s=>String(s||'').trim().toUpperCase().replace(/\s+/g,' ');
  function styleColorCell(cell,name){
    const c=COLORS[norm(name)]; if(!c||cell.dataset.workneoColor==='1') return;
    cell.dataset.workneoColor='1';
    cell.style.background=c.bg; cell.style.color=c.fg; cell.style.fontWeight='800';
    cell.style.borderColor=c.border; cell.style.textAlign='center';
    cell.style.printColorAdjust='exact'; cell.style.webkitPrintColorAdjust='exact';
    cell.style.boxShadow='inset 0 0 0 1px rgba(255,255,255,.10)';
  }
  function run(){
    try{
      const tables=[...document.querySelectorAll('table')];
      tables.forEach(table=>{
        const rows=[...table.rows]; if(!rows.length) return;
        // Cabeçalhos da matriz de materiais: pinta apenas as colunas de cores.
        const head=rows.find(r=>[...r.cells].some(c=>norm(c.textContent)==='TOTAL'));
        if(head){
          [...head.cells].forEach(cell=>{
            const n=norm(cell.textContent);
            if(COLORS[n]) styleColorCell(cell,n);
          });
        }
        // Coluna COR da tabela de produtos.
        rows.forEach(row=>{
          [...row.cells].forEach(cell=>{
            const n=norm(cell.textContent);
            if(COLORS[n]) styleColorCell(cell,n);
          });
        });
      });
      // Pequena legenda visual quando houver mais de uma cor no relatório.
      const report=[...document.querySelectorAll('h1,h2,h3,h4,div,p,strong')].find(e=>norm(e.textContent).includes('RELATÓRIO DE MATERIAIS'));
      if(report && !document.querySelector('.workneo-color-key')){
        const used=[...document.querySelectorAll('table td,table th')].map(c=>norm(c.textContent)).filter(n=>COLORS[n]);
        const unique=[...new Set(used)];
        if(unique.length>1){
          const key=document.createElement('div'); key.className='workneo-color-key';
          key.style.cssText='display:flex;flex-wrap:wrap;gap:4px;margin:5px 0 7px;font:700 7px Arial,sans-serif;';
          unique.forEach(n=>{
            const c=COLORS[n], item=document.createElement('span');
            item.textContent=n; item.style.cssText='padding:3px 6px;border-radius:8px;border:1px solid '+c.border+';background:'+c.bg+';color:'+c.fg+';print-color-adjust:exact;-webkit-print-color-adjust:exact;';
            key.appendChild(item);
          });
          report.parentNode.insertBefore(key,report.nextSibling);
        }
      }
    }catch(e){}
  }
  window.addEventListener('load',()=>setTimeout(run,300));
  setInterval(run,1000);
})();
