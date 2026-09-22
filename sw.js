const CACHE = 'almoxarifado-v8';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys
        .filter(key => key.startsWith('almoxarifado-') && key !== CACHE)
        .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(event.request, { cache: 'no-store' });

      // Keep static application resources available for offline use,
      // while always preferring the network when it is available.
      if (response.ok && event.request.destination !== 'document') {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
      }

      return response;
    } catch {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        const offlineShell = await caches.match('./index.html');
        if (offlineShell) return offlineShell;

        try {
          return await fetch('./index.html', { cache: 'no-store' });
        } catch {
          return new Response('Aplicativo indisponível offline.', {
            status: 503,
            statusText: 'Offline'
          });
        }
      }

      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});
