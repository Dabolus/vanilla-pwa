self.cacheName = 'vanilla-pwa-static';
self.cacheVersion = 'v1';
self.cacheId = `${self.cacheName}-${self.cacheVersion}`;
self.importScripts('./cache-manifest.js');

self.addEventListener('install', (event) => {
  // When the SW is installed, add to the cache all the URLs
  // specified in the precache manifest.
  event.waitUntil(
    caches.open(self.cacheId)
      .then((cache) => cache.addAll(self.precacheManifest)),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // When the SW is activated, claim any currently available client
      self.clients.claim(),
      // Check if there is an older version
      // of our application cache and delete it.
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.filter((cacheName) =>
            cacheName.startsWith(self.cacheName) && cacheName !== self.cacheId,
          ).map((cacheName) =>
            caches.delete(cacheName),
          ),
        ),
      ),
    ]),
  );
});

self.addEventListener('fetch', (event) => {
  // Don't cache anything that isn't a GET request
  if (event.request.method !== 'GET') {
    return event.respondWith(fetch(event.request));
  }
  // Try to check if the request has been cached,
  // otherwise fetch it.
  const promise = caches.match(event.request)
    .then((response) => response || fetch(event.request));
  // If the URL is one of those who need to be cached at runtime,
  // clone the response and insert it into the cache.
  if (self.runtimeCacheManifest.some((regex) => regex.test(event.request.url))) {
    promise.then((fetchRes) => {
      const clone = fetchRes.clone();
      if (!clone) {
        return;
      }
      caches.open(self.cacheId)
        .then((cache) => cache.put(event.request.url, clone));
    });
  }
  event.respondWith(promise);
});

self.addEventListener('message', (event) => {
  switch (event.data.action) {
    case 'update':
      // Skip the waiting phase and immediately replace the old Service Worker
      self.skipWaiting();
      break;
  }
});
