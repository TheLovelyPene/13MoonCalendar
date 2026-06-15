// Service Worker KILL SWITCH — v4
// Clears ALL old caches and forces a clean reload

self.addEventListener('install', (event) => {
  console.log('[SW] Kill switch installing — clearing all caches...');
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((name) => {
        console.log('[SW] Deleting cache:', name);
        return caches.delete(name);
      }))
    )
  );
  // Take over immediately, don't wait
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Kill switch active — taking over all tabs...');
  event.waitUntil(self.clients.claim());
});

// Never cache anything — always go straight to network
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
