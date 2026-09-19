const CACHE_NAME = 'medien-station-v7.9.6-v327';
const CORE_ASSETS = [
    './',
    './index.html',
    './entdecker_karten.html',
    './css/style.css',
    './js/common.js',
    './js/audio.js',
    './js/jszip.min.js',
    './js/print.js',
    './apps/comic.html',
    './apps/sound.html',
    './apps/rec.html',
    './apps/gif.html',
    './apps/magic.html',
    './apps/pixel.html',
    './apps/news.html',
    './apps/stopmotion.html',
    './apps/galerie.html',
    './apps/info.html',
    './manifest.json',
    './assets/logo.png',
    './assets/apple-touch-icon.png'
];

const MEDIA_ASSETS = [
    './js/selfie_segmentation.js',
    './models/selfie_segmentation.binarypb',
    './models/selfie_segmentation.tflite',
    './models/selfie_segmentation_landscape.tflite',
    './models/selfie_segmentation_solution_simd_wasm_bin.js',
    './models/selfie_segmentation_solution_simd_wasm_bin.wasm',
    './models/selfie_segmentation_solution_wasm_bin.js',
    './models/selfie_segmentation_solution_wasm_bin.wasm',
    './assets/qr.png',
    './assets/news.jpg',
    './assets/ozean.jpg',
    './assets/weltraum.jpg',
    './assets/paris.jpg',
    './assets/dschungel.jpg',
    './assets/unterwasser.jpg',
    './assets/wolken.jpg',
    './assets/schloss.jpg',
    './assets/dino.jpg',
    './assets/stadion.jpg',
    './assets/sounds/click.mp3',
    './assets/sounds/shutter.mp3',
    './assets/sounds/success.mp3',
    './assets/sounds/FALSCH.mp3',
    './assets/sounds/RICHTIG.mp3',
    './assets/sounds/brick.mp3',
    './assets/sounds/fail.mp3',
    './assets/sounds/paddle.mp3',
    './assets/sounds/wall.mp3',
    './assets/icons/icon-48.webp',
    './assets/icons/icon-72.webp',
    './assets/icons/icon-96.webp',
    './assets/icons/icon-128.webp',
    './assets/icons/icon-192.webp',
    './assets/icons/icon-256.webp',
    './assets/icons/icon-512.webp',
    './cordova.js',
    './cordova_plugins.js',
    './plugins/cordova-plugin-printer/www/printer.js',
    './plugins/cordova-plugin-x-socialsharing/www/SocialSharing.js',
    './plugins/es6-promise-plugin/www/promise.js'
];

// --- Broadcast Nachrichten an offene App ---
async function broadcastProgress(msg) {
    try {
        const clients = await self.clients.matchAll({ includeUncontrolled: true });
        for (const client of clients) {
            client.postMessage(msg);
        }
    } catch (e) {
        console.warn('Broadcast failed', e);
    }
}

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('install', (event) => {
    // Sofort aktivieren ohne auf vorherigen Tab-Schluss zu warten
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            const total = CORE_ASSETS.length + MEDIA_ASSETS.length;
            let count = 0;
            
            await broadcastProgress({ type: 'CACHE_START', total });
            
            // 1. Zuerst sofort die unverzichtbaren Kern-Assets (HTML, CSS, JS) cachen (< 2s)
            for (const url of CORE_ASSETS) {
                try {
                    const fetchUrl = url + (url.includes('?') ? '&' : '?') + 'cb=' + Date.now();
                    const response = await fetch(fetchUrl, { cache: 'no-cache' });
                    if (response && response.ok) {
                        await cache.put(new Request(url), response.clone());
                        if (response.redirected) {
                            const cleanRedirectUrl = response.url.split('?cb=')[0].split('&cb=')[0];
                            await cache.put(new Request(cleanRedirectUrl), response.clone());
                        }
                    }
                } catch (err) {
                    console.warn('[SW] Core-Asset konnte nicht geladen werden:', url, err);
                }
                count++;
                await broadcastProgress({ type: 'CACHE_PROGRESS', count, total, url });
            }

            // 2. Anschließend im Hintergrund alle Medien-Assets (Sounds, Bilder, KI-Modelle) für 100% Offline-Betrieb cachen
            for (const url of MEDIA_ASSETS) {
                try {
                    const fetchUrl = url + (url.includes('?') ? '&' : '?') + 'cb=' + Date.now();
                    const response = await fetch(fetchUrl, { cache: 'no-cache' });
                    if (response && response.ok) {
                        await cache.put(new Request(url), response.clone());
                    }
                } catch (err) {
                    console.warn('[SW] Medien-Asset wird bei erstem Offline-Aufruf nachgeladen:', url);
                }
                count++;
                await broadcastProgress({ type: 'CACHE_PROGRESS', count, total, url });
            }
            
            await broadcastProgress({ type: 'CACHE_DONE' });
        })
    );
});

// Activate: Alte Caches löschen und Kontrolle sofort übernehmen
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(), // Sofortige Kontrolle über alle offenen Fenster
            caches.keys().then((keys) => Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('🧹 Lösche alten Cache:', key);
                        return caches.delete(key);
                    }
                })
            ))
        ]).then(() => {
            return self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
                clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
            });
        })
    );
});

// Fetch Listener: Network-First für HTML, JS & CSS, Cache-First für schwere Medien (Bilder, MP3s, WASM)
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

    const url = new URL(event.request.url);
    const acceptHeader = event.request.headers.get('accept') || '';
    const isNavigation = event.request.mode === 'navigate' || acceptHeader.includes('text/html');
    const isCodeFile = url.pathname.endsWith('.js') || url.pathname.endsWith('.css');

    if (isNavigation || isCodeFile) {
        // Network-First für HTML, JS und CSS: Immer den neuesten Stand laden wenn online! Fallback auf Cache (offline)
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        const clone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return networkResponse;
                })
                .catch(() => {
                    return caches.match(event.request, { ignoreSearch: true });
                })
        );
    } else {
        // Cache-First für statische Medien (Bilder, MP3s, WASM-Modelle)
        event.respondWith(
            caches.match(event.request, { ignoreSearch: true })
                .then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    return fetch(event.request).then((networkResponse) => {
                        if (networkResponse && networkResponse.ok) {
                            const clone = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                        }
                        return networkResponse;
                    }).catch(() => {
                        console.warn('Offline: Ressource fehlen:', event.request.url);
                        return new Response('Offline', { status: 503 });
                    });
                })
        );
    }
});