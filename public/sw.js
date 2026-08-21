const CACHE_NAME = 'mailcleaner-v2';
const BASE = '/mailcleaner-app';

// Risorse da pre-cachare all'installazione
const PRECACHE_ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.webmanifest',
];

// Install: pre-cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// Activate: rimuovi vecchie cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first per assets JS/CSS (aggiornamenti immediati),
// cache-first per navigazione (offline support su iPhone)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora richieste non GET e origini esterne (es. Google Fonts)
  if (request.method !== 'GET' || url.origin !== location.origin) return;

  // Per navigazione → cache-first con fallback a index.html (SPA)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(BASE + '/index.html'))
    );
    return;
  }

  // Per assets statici (JS, CSS, immagini) → network-first con cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
