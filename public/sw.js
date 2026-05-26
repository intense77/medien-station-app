const CACHE_NAME = 'medien-station-v211';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/common.js',
    './js/audio.js',
    './js/print.js',
    './js/selfie_segmentation.js',
    './models/selfie_segmentation.wasm',
    './models/selfie_segmentation_solution_simd_wasm_bin.js',
    './models/selfie_segmentation_solution_simd_wasm_bin.wasm',
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
// Installation: Dateien cachen (Mit Cache-Busting, um Coolify/Nginx HTTP Caches zu durchbrechen!)
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Zwingt den neuen SW sofort aktiv zu werden
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            let successCount = 0;
            let offlineCount = 0;
            return Promise.all(ASSETS.map(async (url) => {
                try {
                    // 'reload' zwingt den Browser strikt ins Netzwerk, um HTTP-Caches zu umgehen
                    const response = await fetch(new Request(url, { cache: 'reload' }));
                    if (response.ok) {
                        await cache.put(url, response);
                        successCount++;
                    } else {
                        console.warn('Datei nicht gefunden (wird ignoriert):', url);
                    }
                } catch (err) {
                    offlineCount++;
                }
            })).then(() => {
                // Wenn keine Datei geladen wurde und Netzwerkfehler auftraten -> Abbruch!
                if (offlineCount > 0 && successCount === 0) {
                    throw new Error('Gerät ist offline. Update abgebrochen, alter Cache bleibt erhalten.');
                }
            });
        })
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

// Fetch: ERST Cache, dann Netzwerk (Cache-First für rasend schnellen Offline-Start!)
self.addEventListener('fetch', (event) => {
    // Ignoriere POST requests oder chrome-extension schemes
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request, { ignoreSearch: true })
        .then((cachedResponse) => {
            // 1. Treffer im Cache? SOFORT zurückgeben (Rasend schnell, ohne Timeout Wartezeit!)
            if (cachedResponse) {
                return cachedResponse;
            }
            // 2. Nicht im Cache? Dann aus dem Netz laden und für die Zukunft cachen
            return fetch(event.request).then((networkResponse) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        })
    );
});