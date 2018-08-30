self.cacheName = 'vanilla-pwa-static';
self.cacheVersion = 'v1';
self.cacheId = `${self.cacheName}-${self.cacheVersion}`;

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
  'components/info/element.js',
  'components/info/styles.css',
  'components/info/template.html',
];

self.runtimeCacheManifest = [
  /fonts\.gstatic\.com/,
];
