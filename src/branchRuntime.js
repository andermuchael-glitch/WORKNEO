// Fallback only for a raw/source GitHub Pages deployment where the JSX entry is not Vite-transpiled.
// The normal Vite build mounts first, so this remains dormant there.
(function(){
  function bootFallback(){
    const root=document.getElementById('root');
    if(!root || !root.querySelector('.boot')) return;
    if(window.__WORKNEO_BRANCH_FALLBACK__) return;
    window.__WORKNEO_BRANCH_FALLBACK__=true;

    function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});}
    function loadCss(){if(document.getElementById('workneo-source-css'))return;const l=document.createElement('link');l.id='workneo-source-css';l.rel='stylesheet';l.href='./src/styles.css';document.head.appendChild(l);}
    Promise.all([
      load('https://unpkg.com/react@18.3.1/umd/react.production.min.js'),
      load('https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js'),
      load('https://unpkg.com/@babel/standalone@7.26.9/babel.min.js')
    ]).then(()=>{
      loadCss();
      return fetch('./src/main.jsx?source-fallback=16',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('main.jsx não encontrado');return r.text();});
    }).then(src=>{
      src=src.replace(/^import React, \{ useEffect, useMemo, useState \} from 'react';\s*/m,'const {useEffect,useMemo,useState}=React;\n')
           .replace(/^import \{ createRoot \} from 'react-dom\/client';\s*/m,'const {createRoot}=ReactDOM;\n')
           .replace(/^import ['"]\.\/styles\.css['"];\s*/m,'');
      const out=Babel.transform(src,{presets:['react'],sourceType:'script'}).code;
      new Function('React','ReactDOM',out)(window.React,window.ReactDOM);
    }).catch(()=>{
      window.__WORKNEO_BRANCH_FALLBACK__=false;
    });
  }
  setTimeout(bootFallback,1200);
})();
