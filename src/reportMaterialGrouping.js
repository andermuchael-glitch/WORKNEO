// WORKNEO — consolidação de materiais iguais no relatório
// A fita rígida é o mesmo material mesmo quando a ficha técnica usa comprimentos diferentes.
(function(){
  'use strict';
  const norm=s=>String(s||'').trim().toUpperCase();
  const num=s=>{
    const v=String(s||'').replace(/UN$/i,'').replace(/M$/i,'').replace(/\./g,'').replace(',','.').trim();
    const n=Number(v);
    return Number.isFinite(n)?n:0;
  };
  const fmt=n=>Number.isInteger(n)?String(n):Number(n.toFixed(2)).toString();

  function groupRigidTape(){
    const headings=[...document.querySelectorAll('h1,h2,h3,h4,div,p,strong')];
    const hasReport=headings.some(el=>norm(el.textContent).includes('RELATÓRIO DE MATERIAIS'));
    if(!hasReport) return;

    const tables=[...document.querySelectorAll('table')];
    for(const table of tables){
      if(table.dataset.rigidGrouped==='1') continue;
      const rows=[...table.querySelectorAll('tbody tr')];
      const rigid=rows.filter(row=>norm(row.cells[0]?.textContent).startsWith('FITA RÍGIDA'));
      if(rigid.length<2) continue;

      const first=rigid[0];
      const cells=[...first.cells];
      if(cells.length<2) continue;

      // Soma cada coluna de cor e o total. A primeira coluna vira uma única linha.
      for(let c=1;c<cells.length;c++){
        const total=rigid.reduce((sum,row)=>sum+num(row.cells[c]?.textContent),0);
        if(rowHasUnit(first.cells[c])) first.cells[c].textContent=fmt(total)+' M';
        else first.cells[c].textContent=fmt(total);
      }
      first.cells[0].textContent='FITA RÍGIDA (M)';
      rigid.slice(1).forEach(row=>row.remove());
      table.dataset.rigidGrouped='1';
    }
  }

  function rowHasUnit(cell){
    return /\bM\b/i.test(String(cell?.textContent||''));
  }

  // Sem MutationObserver: evita os travamentos que ocorreram ao montar o relatório.
  let lastRun=0;
  function run(){
    const now=Date.now();
    if(now-lastRun<500) return;
    lastRun=now;
    try{groupRigidTape()}catch(e){}
  }
  window.addEventListener('load',run);
  setInterval(run,700);
})();
