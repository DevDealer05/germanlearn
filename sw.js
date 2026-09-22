// =============================================================================
// SERVICE WORKER — Offline-Fähigkeit
// =============================================================================

const CACHE_NAME = 'deutsch-lernen-v2';
const ASSETS = [
  './',
  './index.html',
  './betreuer.html',
  './css/style.css',
  './js/lessons.js',
  './js/audio.js',
  './js/progress.js',
  './js/app.js',
  './js/supabase-client.js',
  './manifest.json'
];

// Install: Cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: Network-first for APIs/Supabase, Cache-first for assets
self.addEventListener('fetch', event => {
  const url = event.request.url;
  if (url.includes('/api/') || url.includes('supabase.co')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('./index.html'))
  );
});
