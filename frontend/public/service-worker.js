// Define a cache name
const CACHE_NAME = 'smarttour-jo-cache-v1';
// List the files to cache
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js', // Adjust this path if needed
  '/static/css/main.css', // Adjust this path if needed
  '/manifest.json',
  '/icons/icon-192x192.webp'
];

// Install the service worker and cache the files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});