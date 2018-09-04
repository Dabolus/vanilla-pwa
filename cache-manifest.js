self.precacheManifest = [
  'index.html',
  'site.webmanifest',
  'components/base.js',
  'components/utils.js',
  'components/shared-styles.css',
  'components/shell/element.js',
  'components/shell/styles.css',
  'components/shell/template.html',
  'components/home/element.js',
  'components/home/styles.css',
  'components/home/template.html',
  'components/dynamic-data/element.js',
  'components/dynamic-data/styles.css',
  'components/dynamic-data/template.html',
  'components/background-sync/element.js',
  'components/background-sync/styles.css',
  'components/background-sync/template.html',
];

self.runtimeCacheManifest = [
  /placehold\.it/,
];

// Each of this entries should contain a capturing group that will be used as an object store on IDB
self.runtimeIDBCacheManifest = [
  /api\/(data)/,
];
