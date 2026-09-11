// WORKNEO — consolidação de materiais iguais no relatório
(function(){
  'use strict';
  const norm=s=>String(s||'').trim().toUpperCase();
  const num=s=>{
    let v=String(s||'').replace(/UN$/i,'').replace(/M$/i,'').trim();
    // O relatório usa ponto como separador decimal (ex.: 36.40).
    if(v.includes(',')&&!v.includes('.')) v=v.replace(',','.');
    const n=Number(v.replace(/[^0-9.-]/g,''));
    return Number.isFinite(n)?n:0;
  };
  const fmt=n=>Number.isInteger(n)?String(n):Number(n.toFixed(2)).toString();

  function groupRigidTape(){
    const hasReport=[...document.querySelectorAll('h1,h2,h3,h4,div,p,strong')]
      .some(el=>norm(el.textContent).includes('RELATÓRIO DE MATERIAIS'));
    if(!hasReport)return;

    for(const table of document.querySelectorAll('table')){
      if(table.dataset.rigidGrouped==='1')continue;
      const rows=[...table.querySelectorAll('tbody tr')];
      const rigid=rows.filter(row=>norm(row.cells[0]?.textContent).startsWith('FITA RÍGIDA'));
      if(rigid.length<2)continue;
      const first=rigid[0];
      if(first.cells.length<2)continue;

      // Todos os comprimentos de fita rígida são o mesmo material.
      // Soma por coluna de COR e mantém a coluna TOTAL.
      for(let c=1;c<first.cells.length;c++){
        const total=rigid.reduce((sum,row)=>sum+num(row.cells[c]?.textContent),0);
        first.cells[c].textContent=fmt(total);
      }
      first.cells[0].textContent='FITA RÍGIDA (M)';
      rigid.slice(1).forEach(row=>row.remove());
      table.dataset.rigidGrouped='1';
    }
  }

  // Execução leve e sem MutationObserver para não reintroduzir travamentos.
  let last=0;
  function run(){
    const now=Date.now();
    if(now-last<500)return;
    last=now;
    try{groupRigidTape()}catch(_){ }
  }
  window.addEventListener('load',run);
  setInterval(run,700);
})();
