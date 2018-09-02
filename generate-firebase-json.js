const pushManifest = require('./push-manifest.json');
const { writeFileSync } = require('fs');
const { resolve } = require('path');

const firebaseJson = {
  hosting: {
    public: '.',
    ignore: [
      'firebase.json',
      'generate-firebase-json.js',
      'README.md',
      '**/.*',
      '**/node_modules/**/*',
      '**/functions/**/*',
    ],
    rewrites: [
      {
        source: '/api/**',
        function: 'api',
      },
      {
        source: '**',
        destination: '/index.html',
      },
    ],
    headers: [
      {
        source: '/api/**',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache',
          },
        ],
      },
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
      {
        source: '**',
        headers: [
          {
            key: 'Cache-Control',
            value: 'private, max-age=1209600',
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
  `${JSON.stringify(firebaseJson, null, 2)}\n`,
);
