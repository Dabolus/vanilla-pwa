self.dbName = 'vanilla-pwa-db';
self.dbVersion = 1;

// Opens the DB, adding the necessary object stores if needed.
// Returns a promise that resolves with the DB if everything goes well.
self.openDB = () =>
  new Promise((resolve, reject) => {
    const openDbReq = indexedDB.open(self.dbName, self.dbVersion);
    openDbReq.onupgradeneeded = ({ oldVersion }) => {
      const db = openDbReq.result;
      switch (oldVersion) {
        // 0 = the DB has not been touched yet
        case 0:
          db.createObjectStore('data', { keyPath: 'id' });
          db.createObjectStore('fetch-queue', {
            keyPath: 'id',
            autoIncrement: true,
          });
      }
    };
    openDbReq.onsuccess = () => resolve(openDbReq.result);
    openDbReq.onerror = reject;
  });

// Adds an object or an array of objects to the specified object store.
// Returns a promise with the result of the transaction if everything goes well.
self.putIntoDB = (objectStore, objs) =>
  Promise.all((Array.isArray(objs) ? objs : [objs]).map(obj =>
    self.openDB()
      .then((db) => new Promise((resolve, reject) => {
          const req =
            db.transaction(objectStore, 'readwrite')
              .objectStore(objectStore)
              .put(obj);
          req.onsuccess = () => resolve(req.result);
          req.onerror = reject;
        }),
      )));

// Given an ID or an array of IDs, removes all the objects matching that ID(s) from the specified object store.
// Returns a promise with the result of the transaction if everything goes well.
self.removeFromDB = (objectStore, ids) =>
  Promise.all((Array.isArray(ids) ? ids : [ids]).map(id =>
    self.openDB()
      .then((db) => new Promise((resolve, reject) => {
          const req =
            db.transaction(objectStore, 'readwrite')
              .objectStore(objectStore)
              .delete(id);
          req.onsuccess = () => resolve(req.result);
          req.onerror = reject;
        }),
      )));

// Gets all the objects contained in the specified object store.
// Returns a promise that resolves to the array of objects if everything goes well.
self.getAllFromDB = (objectStore) =>
  self.openDB()
    .then((db) => new Promise((resolve, reject) => {
      const req = db.transaction(objectStore).objectStore(objectStore).getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = reject;
    }));
