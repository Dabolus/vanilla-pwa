self.idbName = 'vanilla-pwa-db';
self.idbVersion = 1;
self.cacheName = 'vanilla-pwa-static';
self.cacheVersion = 'v1';
self.cacheId = `${self.cacheName}-${self.cacheVersion}`;
self.importScripts('./cache-manifest.js');

self.openDB = () =>
  new Promise((resolve, reject) => {
    const openDbReq = indexedDB.open(self.idbName, self.idbVersion);
    openDbReq.onupgradeneeded = ({ oldVersion }) => {
      const db = openDbReq.result;
      switch (oldVersion) {
        // 0 = the DB has not been touched yet
        case 0:
          db.createObjectStore('data', { keyPath: 'id' });
      }
    };
    openDbReq.onsuccess = () => resolve(openDbReq.result);
    openDbReq.onerror = reject;
  });


self.putIntoIDB = (objectStore, objs) =>
  Promise.all((Array.isArray(objs) ? objs : [objs]).map(obj =>
    self.openDB()
      .then(db => new Promise((resolve, reject) => {
          const req =
            db.transaction(objectStore, 'readwrite')
              .objectStore(objectStore)
              .put(obj);
          req.onsuccess = () => resolve(req.result);
          req.onerror = reject;
        }),
      )));

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
      self.openDB(),
    ]),
  );
});

self.addEventListener('fetch', (event) => {
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
  if (self.runtimeIDBCacheManifest.some((regex) => regex.test(event.request.url))) {
    return event.respondWith(
      self.openDB()
        .then((db) => new Promise((resolve, reject) => {
          const req = db.transaction('data').objectStore('data').getAll();
          req.onsuccess = () => resolve(req.result);
          req.onerror = reject;
        }))
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
                .then((reqObjs) => self.putIntoIDB('data', reqObjs))
                .then(() => clonedRes);
            })
            .then(res => res.json())
            .then(reqObjs => {
              self.putIntoIDB('data', reqObjs);
              return new Response(JSON.stringify(reqObjs));
            });
          // If we got data from IDB, respond with it
          if (data && Object.keys(Array.isArray(data) ? data : [data]).length > 0) {
            return new Response(JSON.stringify(data));
          }
          // Otherwise, just return the fetch request that will cache the data into IDB
          return reqPromise;
        }),
    );
  }

  // STATIC CACHE
  // This part of the SW will generate a runtime static cache for
  // static assets. This is meant to be used for assets like fonts
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
  if (self.runtimeStaticCacheManifest.some((regex) => regex.test(event.request.url))) {
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
