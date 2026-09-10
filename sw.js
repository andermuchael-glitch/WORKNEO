const CACHE = 'almoxarifado-v5';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('almoxarifado-') && key !== CACHE).map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Navegação e módulos do app: sempre tentam a versão publicada primeiro.
  // Isso evita que um atalho instalado fique preso em um index/JS antigo.
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request, { cache: 'no-store' });
      if (response.ok && event.request.destination !== 'document') {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
      }
      return response;
    } catch {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        return fetch('/WORKNEO/index.html', { cache: 'no-store' });
      }
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});
