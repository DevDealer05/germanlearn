// =============================================================================
// SERVICE WORKER — Offline-Fähigkeit & Safari-Redirect-Fix (v3)
// =============================================================================

const CACHE_NAME = 'deutsch-lernen-v3';
const ASSETS = [
  'index.html',
  'betreuer.html',
  'css/style.css',
  'js/lessons.js',
  'js/audio.js',
  'js/progress.js',
  'js/app.js',
  'js/supabase-client.js',
  'manifest.json'
];

// Helper to strip Safari/WebKit internal redirect flags
// Prevents: "Safari cannot open the page. Error: Response served by service worker has redirections"
function cleanResponse(response) {
  if (!response || !response.redirected) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}

// Install: Cache all core assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Add assets individually so one failure does not abort the whole cache
      return Promise.allSettled(
        ASSETS.map(url =>
          fetch(url, { cache: 'no-cache' })
            .then(res => {
              if (res.ok) return cache.put(url, cleanResponse(res));
            })
            .catch(() => {})
        )
      );
    })
  );
});

// Activate: Purge old/corrupted caches from previous versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strategy depending on request type
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Bypass external APIs, Supabase cloud, Google APIs
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('jsdelivr.net') ||
    url.pathname.startsWith('/api/')
  ) {
    return; // Normal network handling
  }

  // 2. Navigation requests (HTML pages)
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(networkRes => {
          return cleanResponse(networkRes);
        })
        .catch(async () => {
          // Offline fallback
          const isBetreuer = url.pathname.includes('betreuer');
          const fallbackPath = isBetreuer ? 'betreuer.html' : 'index.html';
          const cached = await caches.match(fallbackPath);
          return cleanResponse(cached) || cleanResponse(await caches.match('index.html'));
        })
    );
    return;
  }

  // 3. Static assets: Cache-first with network fallback
  event.respondWith(
    caches.match(req).then(cachedRes => {
      if (cachedRes) {
        return cleanResponse(cachedRes);
      }
      return fetch(req).then(networkRes => {
        if (networkRes && networkRes.ok && req.method === 'GET') {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(req, cleanResponse(clone)).catch(() => {});
          });
        }
        return cleanResponse(networkRes);
      });
    }).catch(async () => {
      // If asset fetch fails completely, return fallback for html if applicable
      if (req.headers.get('accept')?.includes('text/html')) {
        const cached = await caches.match('index.html');
        return cleanResponse(cached);
      }
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    })
  );
});
