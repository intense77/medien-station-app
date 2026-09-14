---
name: pwa-autoupdate
description: Implement robust PWA Service Worker auto-update management, Network-First code caching, and automatic build-time versioning across web projects.
---

# Robust PWA Service Worker Auto-Update Pattern

Dieser Skill beschreibt die bewährte Architektur für **100% zuverlässige PWA-Auto-Updates** auf Tablets, Kiosksystemen, Smartphones und Desktop-Browsern – bei **gleichzeitiger 100% Offline-Lauffähigkeit**.

---

## Kernprobleme bei Standard-PWAs & Die Lösung

| Problem bei Standard-PWAs | Die Lösung in diesem Muster |
| :--- | :--- |
| **Old Cache Trap**: Benutzer sehen wochenlang alte Versionen | **Network-First für Code**: HTML, JS & CSS laden online immer frisch vom Server |
| **HTTP-Cache blockiert `sw.js`**: Nginx/Apache cacht den SW | `updateViaCache: 'none'` beim Registrieren zwingt Byte-Prüfung |
| **SW wartet auf Tab-Schließen**: Neues Update greift erst nach Schließen | `skipWaiting()` + `clients.claim()` + `controllerchange` Auto-Reload |
| **Manuelle Versionsnummer vergessen**: SW merkt Code-Änderung nicht | **Build-Time Timestamp / Hash Injection** in `sw.js` |

---

## 1. Das Service Worker Template (`sw.js`)

```javascript
// Automatisch beim Build durch Timestamp/Hash ersetzt:
const CACHE_NAME = 'app-v__BUILD_TIME__';

const HEAVY_ASSETS = [
    './assets/icons/icon-512.png',
    './assets/sounds/success.mp3',
    './models/ai-model.wasm'
];

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // Caching von großen Medien-Assets
            await cache.addAll(HEAVY_ASSETS).catch(err => console.warn('Asset Cache Warnung:', err));
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then((keys) => Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            ))
        ])
    );
});

// STRATEGIE-SPLIT: Network-First für Logik & Layout, Cache-First für Medien
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

    const url = new URL(event.request.url);
    const acceptHeader = event.request.headers.get('accept') || '';
    
    const isNavigation = event.request.mode === 'navigate' || acceptHeader.includes('text/html');
    const isCodeFile = url.pathname.endsWith('.js') || url.pathname.endsWith('.css');

    if (isNavigation || isCodeFile) {
        // Network-First: Online sofort die neueste Version laden, offline auf den Cache zurückgreifen
        event.respondWith(
            fetch(event.request)
                .then((networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        const clone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return networkResponse;
                })
                .catch(() => caches.match(event.request, { ignoreSearch: true }))
        );
    } else {
        // Cache-First: Bilder, MP3s, Schriftarten & WASM-Modelle aus dem Cache servieren
        event.respondWith(
            caches.match(event.request, { ignoreSearch: true })
                .then((cached) => cached || fetch(event.request).then((res) => {
                    if (res && res.ok) {
                        const clone = res.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return res;
                }))
        );
    }
});
```

---

## 2. Das Client-Registrierungs-Script (`pwa-client.js`)

```javascript
if ('serviceWorker' in navigator) {
    let refreshing = false;

    // Auto-Reload sobald der neue Service Worker die Kontrolle übernimmt
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
            refreshing = true;
            window.location.reload();
        }
    });

    // updateViaCache: 'none' MUSS gesetzt sein!
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' })
        .then((registration) => {
            if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }

            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                }
            });

            // Aktiven Update-Check erzwingen
            registration.update();
        })
        .catch((err) => console.warn('PWA Reg Fehler:', err));
}
```

---

## 3. Automatisches Build-Time Version Bumping (z. B. Vite/Node)

Füge ein Skript in `package.json` ein (oder ein kleines Node.js-Build-Skript), das bei jedem Build oder Commit `__BUILD_TIME__` in `sw.js` automatisch durch den aktuellen Zeitstempel `Date.now()` oder den Git Commit Hash ersetzt.
