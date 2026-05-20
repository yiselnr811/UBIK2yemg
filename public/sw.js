/* UBIK2 YEMG — Lightweight Service Worker
 * Strategies:
 *  - Static assets (_next/static, /logo.png, /favicon.svg, /manifest.webmanifest): cache-first
 *  - Cloudinary images (res.cloudinary.com): cache-first with 30-day expiry
 *  - API GET requests (/api/products, /api/categories, /api/settings, /api/stats):
 *      network-first with cache fallback (offline support for browsing)
 *  - Product detail HTML (/product/[id]): network-first with cache fallback
 *  - Other navigation requests: network-first
 *
 * Designed to be tiny and friendly to Cuban networks (intermittent, 2G/3G).
 */
const VERSION = 'v1';
const STATIC_CACHE = `ubik2-static-${VERSION}`;
const RUNTIME_CACHE = `ubik2-runtime-${VERSION}`;
const IMG_CACHE = `ubik2-images-${VERSION}`;
const API_CACHE = `ubik2-api-${VERSION}`;
const MAX_API_AGE_MS = 5 * 60 * 1000;     // serve cached API for 5 minutes when offline
const MAX_IMG_ENTRIES = 200;               // cap image cache

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(['/manifest.webmanifest', '/favicon.svg', '/logo.png']).catch(() => null)
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k.includes(VERSION) ? null : caches.delete(k))))
    ).then(() => self.clients.claim())
  );
});

async function trimCache(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    if (requests.length > maxEntries) {
      for (let i = 0; i < requests.length - maxEntries; i++) {
        await cache.delete(requests[i]);
      }
    }
  } catch {}
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isCloudinary = url.hostname === 'res.cloudinary.com';
  const isUnsplash = url.hostname === 'images.unsplash.com';

  // === Cloudinary / Unsplash images: cache-first ===
  if (isCloudinary || isUnsplash) {
    event.respondWith(
      caches.open(IMG_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const resp = await fetch(req, { mode: 'cors', credentials: 'omit' });
          if (resp && resp.status === 200) {
            cache.put(req, resp.clone());
            trimCache(IMG_CACHE, MAX_IMG_ENTRIES);
          }
          return resp;
        } catch {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  if (!sameOrigin) return;

  // === Static Next.js assets: cache-first ===
  if (url.pathname.startsWith('/_next/static/') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.png') || url.pathname.endsWith('.webmanifest')) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((resp) => {
          if (resp && resp.status === 200) {
            const clone = resp.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, clone));
          }
          return resp;
        }).catch(() => cached);
      })
    );
    return;
  }

  // === API GET requests: network-first with cache fallback (offline-friendly) ===
  if (url.pathname.startsWith('/api/')) {
    // Skip auth & write-side endpoints to avoid stale critical data
    if (url.pathname.startsWith('/api/auth/') || url.pathname.startsWith('/api/admin/') || url.pathname.startsWith('/api/my/')) return;
    event.respondWith(
      fetch(req).then((resp) => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(API_CACHE).then((c) => {
            // Attach timestamp via custom header in cached response (clone is once-use)
            const headers = new Headers(clone.headers);
            headers.set('x-ubik-cached-at', String(Date.now()));
            clone.blob().then((body) => {
              c.put(req, new Response(body, { status: clone.status, statusText: clone.statusText, headers }));
            });
          });
        }
        return resp;
      }).catch(async () => {
        // Offline → try cache
        const cache = await caches.open(API_CACHE);
        const cached = await cache.match(req);
        if (cached) {
          const ts = Number(cached.headers.get('x-ubik-cached-at') || 0);
          if (Date.now() - ts < MAX_API_AGE_MS) return cached;
        }
        return new Response(JSON.stringify({ error: 'Sin conexión', offline: true }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      })
    );
    return;
  }

  // === Navigation / HTML pages (product detail, home): network-first with cache fallback ===
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith(
      fetch(req).then((resp) => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(RUNTIME_CACHE).then((c) => c.put(req, clone));
        }
        return resp;
      }).catch(async () => {
        const cached = await caches.match(req);
        return cached || caches.match('/');
      })
    );
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
