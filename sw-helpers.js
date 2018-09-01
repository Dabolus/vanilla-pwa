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
