/// <reference lib="webworker" />
/* eslint-disable no-console */
// ScratchJr Reborn Service Worker (Offline PWA Cache)
var CACHE_NAME = 'scratchjr-pwa-v1.9.2';

var PRECACHE_URLS = [
  './',
  './index.html',
  './home.html',
  './editor.html',
  './gettingstarted.html',
  './manifest.webmanifest',
  './dist/app.bundle.js',
  './css/base.css',
  './css/start.css',
  './css/lobby.css',
  './css/editor.css',
  './css/librarymodal.css',
  './css/painteditor.css',
  './settings.json'
];

const sw = /** @type {any} */ (self);

self.addEventListener('install', function (/** @type {any} */ event) {
  sw.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS).catch(function (err) {
        console.warn('[SW] Pre-cache partial warning:', err);
      });
    })
  );
});

self.addEventListener('activate', function (/** @type {any} */ event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (name) { return name !== CACHE_NAME; })
          .map(function (name) { return caches.delete(name); })
      );
    }).then(function () {
      return sw.clients.claim();
    })
  );
});

// Network-First for HTML/JS/JSON (with offline fallback); Cache-First for static media
self.addEventListener('fetch', function (/** @type {any} */ event) {
  if (event.request.method !== 'GET') return;
  var url = event.request.url;
  if (!url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then(function (networkResponse) {
        if (networkResponse && networkResponse.status === 200) {
          var responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(function () {
        // When offline or server unreachable, serve from cache
        return caches.match(event.request).then(function (cached) {
          return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
        });
      })
  );
});
