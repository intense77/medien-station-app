const CACHE_NAME = 'medien-station-v191';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/common.js',
    './js/audio.js',
    './js/print.js',
    './js/selfie_segmentation.js',
    './assets/logo.png',
    './assets/qr.png',
    './assets/sounds/click.mp3',
    './assets/sounds/shutter.mp3',
    './assets/sounds/success.mp3',
    './assets/weltraum.jpg',
    './assets/paris.jpg',
    './assets/dschungel.jpg',
    './assets/unterwasser.jpg',
    './assets/wolken.jpg',
    './assets/schloss.jpg',
    './assets/dino.jpg',
    './assets/stadion.jpg',
    './manifest.json',
    './apps/comic.html',
    './apps/sound.html',
    './apps/rec.html',
    './apps/gif.html',
    './apps/magic.html',
    './apps/pixel.html',
    './apps/news.html'
];

// Installation: Dateien cachen
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Zwingt den neuen SW sofort aktiv zu werden
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(ASSETS))
    );
});

// Activate: Alte Caches löschen und Kontrolle übernehmen
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(), // Sofortige Kontrolle über offene Seiten
            caches.keys().then((keys) => Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            ))
        ])
    );
});

// Fetch: ERST Netzwerk, dann Cache (Network-First für perfekte Updates!)
self.addEventListener('fetch', (event) => {
    // Ignoriere POST requests oder chrome-extension schemes
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
        .then((networkResponse) => {
            // Erfolgreich aus dem Netz geladen -> In den Cache legen für Offline-Nutzung
            return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            });
        })
        .catch(() => {
            // Offline? Dann aus dem Cache laden!
            return caches.match(event.request, { ignoreSearch: true });
        })
    );
});