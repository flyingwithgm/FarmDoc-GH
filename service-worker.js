// service-worker.js
const CACHE_NAME = 'farmdoc-gh-v1.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    // Add crop data files
    '/src/diseases/oil_palm.json',
    '/src/diseases/cocoa.json',
    '/src/diseases/maize.json',
    '/src/diseases/cassava.json',
    '/src/diseases/yam.json',
    '/src/diseases/plantain.json',
    '/src/diseases/tomato.json',
    '/src/diseases/rice.json',
    '/src/diseases/cowpea.json',
    '/src/diseases/pepper.json',
    '/src/diseases/cashew.json',
    '/src/diseases/mango.json',
    '/src/diseases/pineapple.json',
    '/src/diseases/sorghum.json',
    '/src/diseases/groundnut.json',
    '/src/diseases/okra.json',
    '/src/diseases/garden_egg.json',
    '/src/diseases/coconut.json',
    '/src/diseases/sweet_potato.json',
    '/src/diseases/beans.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
