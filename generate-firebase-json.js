const pushManifest = require('./push-manifest.json');
const { writeFileSync } = require('fs');
const { resolve } = require('path');

const firebaseJson = {
  hosting: {
    public: '.',
    ignore: [
      'firebase.json',
      '**/.*',
      '**/node_modules/**',
    ],
    rewrites: [
      {
        source: '**',
        destination: '/index.html',
      },
    ],
    headers: [
      {
        source: '**/sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache',
          },
        ],
      },
      ...Object.entries(pushManifest)
        .map(([path, deps]) => ({
          source: path,
          headers: [{
            key: 'Link',
            value:
              Object
                .entries(deps)
                .reduce((str, [depPath, { type }]) => `${str},</${depPath}>;rel=preload;as=${type}`, '')
                .substring(1),
          }],
        })),
    ],
  },
};

writeFileSync(
  resolve(__dirname, 'firebase.json'),
  JSON.stringify(firebaseJson, null, 2),
);
