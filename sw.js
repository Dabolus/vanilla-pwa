self.staticCacheName = 'vanilla-pwa-static';
self.staticCacheVersion = 'v1';
self.staticCacheId = `${self.staticCacheName}-${self.staticCacheVersion}`;
self.runtimeCacheName = 'vanilla-pwa-runtime';
self.importScripts('./cache-manifest.js', './db-helpers.js');

self.openOrFocus = (url) =>
  clients.matchAll({
    type: 'window',
  }).then((clientsList) => {
    for (const client of clientsList) {
      if ((url === '*' && client.url.startsWith('/')) || url === client.url) {
        return client.focus();
      }
    }
    return clients.openWindow(url === '*' ? '/' : url);
  });

// Event fired when the SW is installed
self.addEventListener('install', (event) => {
  // When the SW is installed, add to the cache all the URLs
  // specified in the precache manifest.
  event.waitUntil(
    caches.open(self.staticCacheId)
      .then((cache) => cache.addAll(self.precacheManifest)),
  );
});

// Event fired when the SW is activated
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
            cacheName.startsWith(self.staticCacheName) && cacheName !== self.staticCacheId,
          ).map((cacheName) =>
            caches.delete(cacheName),
          ),
        ),
      ),
      self.openDB(),
    ]),
  );
});

// Event fired when the website tries to fetch something
self.addEventListener('fetch', (event) => {
  // For some reason, DevTools opening will trigger these o-i-c requests.
  // We will just ignore them to avoid showing errors in console.
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return Promise.resolve();
  }

  // Don't cache anything that isn't a GET request
  if (event.request.method !== 'GET') {
    return event.respondWith(fetch(event.request));
  }

  // IDB CACHE
  // This part of the SW will cache data coming from our backend.
  // Any sort of document-type data is perfect for being added to IDB,
  // especially if it already features an ID.
  // As this data is most probably subject to change, we are going to use
  // a "stale while revalidate" approach. This means that we are going
  // to first check if the data is in IDB, but if we find it, we are
  // going to make a web request anyway. If it is successful, we are
  // going to replace the old data in IDB with the new one.
  // This means that the final user might incur in older data, but
  // the problem is easily fixable by, for example, posting a message
  // to the frontend, telling it that the data has been updated,
  // so that it can display the new ones as soon as they are available.
  const idbCacheRegex = self.runtimeIDBCacheManifest.find((regex) => regex.test(event.request.url));
  if (idbCacheRegex) {
    const [, store] = idbCacheRegex.exec(event.request.url);
    return event.respondWith(
      self.getAllFromDB(store)
        .then((data) => {
          // Even if we already saved the data in idb,
          // we start a new request so that the data can
          // be updated in background. In this way, we will
          // see the updated data next time we open up the PWA
          const reqPromise = fetch(event.request)
            .then((res) => {
              // The response cannot be used anymore after being consumed,
              // so we have to clone it
              const clonedRes = res.clone();
              // Put the data into IDB, then return the cloned response
              return res.json()
                .then(({ data }) => self.putIntoDB(store, data))
                .then(() => clonedRes);
            })
            .then(res => res.json())
            .then((res) => {
              self.putIntoDB(store, res.data);
              return new Response(JSON.stringify(res));
            });
          // If we got data from IDB, respond with it
          if (data && Object.keys(Array.isArray(data) ? data : [data]).length > 0) {
            return new Response(JSON.stringify({
              success: true,
              data,
            }));
          }
          // Otherwise, just return the fetch request that will cache the data into IDB
          return reqPromise;
        }),
    );
  }

  // RUNTIME CACHE
  // This part of the SW will generate a runtime cache for
  // files/blobs. This is meant to be used for assets like fonts
  // or images that are only known at runtime and not during our SW
  // installation.
  // For example, in our case it will be used to dynamically cache
  // the images coming from our mock backend. Of course we cannot
  // know them until they come from the BE, but we know their base URL,
  // so we are going to add them to the static cache dynamically.
  // The approach used is a "cache first" approach. This means that
  // if we have the data in the cache, we won't be doing any fetch at all.

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
      caches.open(self.runtimeCacheName)
        .then((cache) => cache.put(event.request.url, clone));
    });
  }
  event.respondWith(promise);
});

// Event fired when the website posts a message to the Service Worker
self.addEventListener('message', (event) => {
  switch (event.data.action) {
    case 'update':
      // Skip the waiting phase and immediately replace the old Service Worker
      self.skipWaiting();
      break;
  }
});

// Event fired when a new background sync is registered by the website
self.addEventListener('sync', (event) => {
  switch (event.tag) {
    case 'fetch':
      event.waitUntil(
        self.getAllFromDB('fetch-queue')
          .then((queue) => Promise.all(queue.map((reqParams) =>
            fetch(reqParams.url, reqParams)
              .then((res) => res.json())
              .then((res) => res.success || Promise.reject(res))
              .then(() => self.removeFromDB('fetch-queue', reqParams.id))))),
      );
      break;
  }
});

// Event fired when a push message is sent to the Service Worker via the Web Push protocol
self.addEventListener('push', (event) => {
  // We will parse the data received via Web Push and show it
  // to the user in the form of a push notification
  const data = event.data.json();
  // We will have a default icon and badge, but the server might decide
  // to send different data, so we allow it to override them
  event.waitUntil(self.registration.showNotification(data.title, {
    icon: '/images/icons/android-chrome-512x512.png',
    badge: '/images/icons/mstile-70x70.png',
    ...data,
  }));
});

// Event fired when the user clicks a notification
self.addEventListener('notificationclick', (event) => {
  // First of all, close the notification
  event.notification.close();
  // The notification has an action tag associated with it.
  // We will be doing something according to it.
  switch (event.action) {
    // The user clicked on "dismiss", so just do nothing
    case 'dismiss':
      break;
    // The user wants to open (or focus) the background sync page
    case 'open-background-sync-page':
      event.waitUntil(self.openOrFocus('/background-sync'));
      break;
    // In any other case (i.e. simple click on the notification),
    // open or focus any available page of our application
    default:
      event.waitUntil(self.openOrFocus('*'));
      break;
  }
});
