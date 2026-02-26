// Service Worker for RCCG City of Joy - Ministry Intelligence Platform
// Cache versioning: increment version to bust old caches on deploy
const CACHE_NAME = 'cojf-v1';

// Critical routes to pre-cache during install
const PRECACHE_URLS = [
  '/',
  '/about',
  '/sermons',
  '/events',
  '/giving',
  '/prayers',
  '/testimonies',
  '/devotionals',
];

// API routes that benefit from caching (GET only)
const CACHEABLE_API_ROUTES = [
  '/api/sermons',
  '/api/events',
  '/api/devotionals',
];

// ─── Install Event ─────────────────────────────────────────────────────────────
// Pre-cache critical static assets so the app shell loads offline.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  // Activate the new SW immediately instead of waiting for old tabs to close
  self.skipWaiting();
});

// ─── Activate Event ────────────────────────────────────────────────────────────
// Remove outdated caches from previous versions.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ─── Fetch Strategies ──────────────────────────────────────────────────────────

/**
 * Network-first: try network, fall back to cache.
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    // Only cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cachedResponse = await caches.match(request);
    return cachedResponse || null;
  }
}

/**
 * Cache-first: try cache, fall back to network and update cache.
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return null;
  }
}

/**
 * Network-only: always go to network, no caching.
 */
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch {
    return null;
  }
}

/**
 * Generate a simple offline fallback page when navigation fails.
 */
function offlineFallbackResponse() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Offline - City of Joy</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f8fafc;
      color: #1e293b;
      padding: 1.5rem;
    }
    .container {
      text-align: center;
      max-width: 420px;
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.5rem;
      color: #1e3a8a;
      margin-bottom: 0.5rem;
    }
    p {
      color: #64748b;
      margin-bottom: 1.5rem;
      line-height: 1.6;
    }
    button {
      background: #1e3a8a;
      color: #fff;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    button:hover { background: #1e40af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">&#128247;</div>
    <h1>You're Offline</h1>
    <p>
      It looks like you've lost your internet connection.
      Some features may still work offline. Please check your
      connection and try again.
    </p>
    <button onclick="window.location.reload()">Try Again</button>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

/**
 * Determine if a URL path matches any cacheable API route.
 */
function isCacheableApiRoute(pathname) {
  return CACHEABLE_API_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}

/**
 * Check if the request is for a static asset.
 */
function isStaticAsset(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  // Match common static asset extensions
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|avif)$/i.test(pathname);
}

// ─── Main Fetch Handler ────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests: network-first with offline fallback page
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request).then((response) => {
        return response || offlineFallbackResponse();
      })
    );
    return;
  }

  // API requests
  if (url.pathname.startsWith('/api/')) {
    // Cacheable API routes (GET only): network-first with cache fallback
    if (request.method === 'GET' && isCacheableApiRoute(url.pathname)) {
      event.respondWith(
        networkFirst(request).then((response) => {
          return response || new Response(
            JSON.stringify({ error: 'Offline', message: 'This data is not available offline.' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
      );
      return;
    }
    // All other API requests: network-only
    event.respondWith(
      networkOnly(request).then((response) => {
        return response || new Response(
          JSON.stringify({ error: 'Offline', message: 'This action requires an internet connection.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Static assets: cache-first with network fallback
  if (isStaticAsset(request)) {
    event.respondWith(
      cacheFirst(request).then((response) => {
        return response || new Response('', { status: 404 });
      })
    );
    return;
  }

  // Everything else: network-first
  event.respondWith(
    networkFirst(request).then((response) => {
      return response || new Response('', { status: 404 });
    })
  );
});
