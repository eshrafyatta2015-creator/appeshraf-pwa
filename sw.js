'use strict';

const CACHE = 'appeshraf-pwa-v2';
const SHELL = [
  './',
  'index.html',
  'app.js',
  'styles.css',
  'manifest.webmanifest',
  'icons/icon-180.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-512-maskable.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function networkFirst(req) {
  return fetch(req)
    .then((resp) => {
      if (resp && resp.ok) {
        const copy = resp.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy));
      }
      return resp;
    })
    .catch(() => caches.match(req));
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    event.respondWith(networkFirst(req));
    return;
  }

  const isCsv = (url.hostname === 'docs.google.com' && url.pathname.indexOf('/export') !== -1)
    || url.hostname.endsWith('googleusercontent.com');
  if (isCsv) {
    event.respondWith(networkFirst(req));
  }
});
