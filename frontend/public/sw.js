self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  // Simple pass-through for now to satisfy PWA criteria
  e.respondWith(fetch(e.request));
});
