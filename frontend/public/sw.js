// Service Worker for 13 Moons Calendar PWA
// v3 — never cache index.html (it changes every deploy), always fetch fresh

const CACHE_NAME = '13-moons-v3';

// Only cache truly static assets that have content hashes in their filenames
// Do NOT include index.html here — it changes on every deploy
const STATIC_ASSETS = [
  '/manifest.json',
  '/moon-icon.png',
];

// Install: cache only the static assets (NOT index.html)
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v3...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Take over immediately
  self.skipWaiting();
});

// Activate: delete ALL old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v3...');
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Clearing old cache:', name);
            return caches.delete(name);
          })
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy:
// - Navigation (HTML pages): ALWAYS network, never cache
// - JS/CSS assets: cache-first (they have content hashes so they never change)
// - Everything else: network first, fall back to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // HTML / navigation: always go to network, never serve from cache
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request).catch(() => {
        // Only use cache as last resort when completely offline
        return caches.match('/index.html');
      })
    );
    return;
  }

  // Hashed JS/CSS assets: cache-first (safe because filenames change with content)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Everything else: network first
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
