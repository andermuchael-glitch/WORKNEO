// Keeps the fixed production shortcut from covering buttons inside the launch modal.
// Uses a lightweight timer instead of MutationObserver so it cannot create DOM-observer loops.
(function(){
  function sync(){
    const button=document.getElementById('production-launch');
    if(!button)return;
    const launchModal=!!document.querySelector('.modal');
    const productionOverlay=document.getElementById('production-overlay');
    const productionOpen=!!productionOverlay && getComputedStyle(productionOverlay).display!=='none';
    button.style.display=(launchModal||productionOpen)?'none':'';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync);
  else sync();
  window.setInterval(sync,500);
})();
