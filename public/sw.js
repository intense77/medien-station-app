const CACHE_NAME = 'medien-station-v243';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/common.js',
    './js/tailwind.js',
    './js/audio.js',
    './js/print.js',
    './js/selfie_segmentation.js',
    './models/selfie_segmentation.wasm',
    './models/selfie_segmentation_solution_simd_wasm_bin.js',
    './models/selfie_segmentation_solution_simd_wasm_bin.wasm',
    './models/selfie_segmentation_solution_wasm_bin.js',
    './models/selfie_segmentation_solution_wasm_bin.wasm',
    './models/selfie_segmentation.binarypb',
    './models/selfie_segmentation_landscape.binarypb',
    './models/selfie_segmentation.tflite',
    './models/selfie_segmentation_landscape.tflite',
    './assets/logo.png',
    './assets/apple-touch-icon.png',
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
    './apps/news.html',
    './js/comic.js',
    './js/sound.js',
    './js/rec.js',
    './js/gif.js',
    './js/magic.js',
    './js/pixel.js',
    './js/news.js',
    './cordova.js',
    './cordova_plugins.js',
    './plugins/cordova-plugin-printer/www/printer.js',
    './plugins/cordova-plugin-x-socialsharing/www/SocialSharing.js',
    './plugins/es6-promise-plugin/www/promise.js',
    './plugins/cordova-plugin-file/www/DirectoryEntry.js',
    './plugins/cordova-plugin-file/www/DirectoryReader.js',
    './plugins/cordova-plugin-file/www/Entry.js',
    './plugins/cordova-plugin-file/www/File.js',
    './plugins/cordova-plugin-file/www/FileEntry.js',
    './plugins/cordova-plugin-file/www/FileError.js',
    './plugins/cordova-plugin-file/www/FileReader.js',
    './plugins/cordova-plugin-file/www/FileSystem.js',
    './plugins/cordova-plugin-file/www/FileUploadOptions.js',
    './plugins/cordova-plugin-file/www/FileUploadResult.js',
    './plugins/cordova-plugin-file/www/FileWriter.js',
    './plugins/cordova-plugin-file/www/Flags.js',
    './plugins/cordova-plugin-file/www/LocalFileSystem.js',
    './plugins/cordova-plugin-media/www/Media.js',
    './plugins/cordova-plugin-media/www/MediaError.js',
    './plugins/cordova-plugin-file/www/Metadata.js',
    './plugins/cordova-plugin-file/www/ProgressEvent.js',
    './plugins/cordova-plugin-file/www/requestFileSystem.js',
    './plugins/cordova-plugin-file/www/fileSystems.js',
    './plugins/cordova-plugin-file/www/browser/isChrome.js',
    './plugins/cordova-plugin-file/www/fileSystems-roots.js',
    './plugins/cordova-plugin-file/www/fileSystemPaths.js',
    './plugins/cordova-plugin-file/www/android/Entry.js',
    './plugins/cordova-plugin-file/www/android/FileSystem.js',
    './plugins/cordova-plugin-file/www/resolveLocalFileSystemURI.js'
];

// --- NEU: Sende Nachrichten an die offene App (für den Ladebalken) ---
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

self.addEventListener('install', (event) => {
    self.skipWaiting(); // Zwingt den neuen SW sofort aktiv zu werden
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // WICHTIG: Sequentieller Download!
            const total = ASSETS.length;
            let count = 0;
            
            await broadcastProgress({ type: 'CACHE_START', total });
            
            for (const url of ASSETS) {
                try {
                    let response;
                    // Retry-Schleife mit 15-Sekunden-Timeout, falls eine Datei hängt
                    for (let attempt = 1; attempt <= 2; attempt++) {
                        try {
                            const fetchUrl = url + (url.includes('?') ? '&' : '?') + 'cb=' + Date.now();
                            response = await new Promise((resolve, reject) => {
                                const timer = setTimeout(() => reject(new Error('Timeout')), 15000);
                                fetch(fetchUrl).then(res => { clearTimeout(timer); resolve(res); }).catch(e => { clearTimeout(timer); reject(e); });
                            });
                            break; // Erfolgreich, Schleife abbrechen
                        } catch (e) {
                            if (attempt === 2) throw new Error('Download hängt bei: ' + url);
                            console.warn('Hänger erkannt, Retry für:', url);
                        }
                    }
                    
                    if (response.ok) {
                        // Wichtig: Unter der *Original-URL* im Cache ablegen, nicht mit ?cb=
                        await cache.put(new Request(url), response.clone());
                        // Falls Coolify/Nginx eine URL weiterleitet (z.B. Dateiendung ändert)
                        if (response.redirected) {
                            const cleanRedirectUrl = response.url.split('?cb=')[0].split('&cb=')[0];
                            await cache.put(new Request(cleanRedirectUrl), response.clone());
                        }
                    } else {
                        console.warn('HTTP Fehler beim Cachen (wird ignoriert):', url, response.status);
                        // Bei Server-Überlastung brechen wir hart ab, damit kein "Schweizer Käse"-Cache entsteht
                        if (response.status === 429 || response.status >= 500) {
                            throw new Error('Server überlastet bei ' + url);
                        }
                    }
                } catch (err) {
                    console.error('Netzwerkfehler beim Cachen von:', url, err);
                    await broadcastProgress({ type: 'CACHE_ERROR', message: err.message });
                    throw err; 
                }
                count++;
                await broadcastProgress({ type: 'CACHE_PROGRESS', count, total, url });
            }
            
            await broadcastProgress({ type: 'CACHE_DONE' });
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
            }).catch(() => {
                console.warn('Offline: Konnte nicht geladen werden', event.request.url);
                return new Response('Offline, resource missing', { status: 503, statusText: 'Service Unavailable' });
            });
        })
    );
});