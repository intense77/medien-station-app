/**
 * common.js
 * Zentrale Logik für Navigation, Idle-Timer und Modals.
 * Wird in allen HTML-Dateien eingebunden.
 */

(function() {
    // Sicherer Zugriff auf Plugins (verhindert Absturz, wenn cordova.js fehlt)
    const SplashScreen = (window.Capacitor && window.Capacitor.Plugins) ? window.Capacitor.Plugins.SplashScreen : null;
    const IDLE_TIMEOUT = 600000; // 10 Minuten
    let idleTimer;

    // Hilfsfunktion: Sind wir in einer App oder auf dem Hub?
    const isSubApp = window.location.pathname.includes('/apps/');

    // --- 0. Cleanup Funktion (Speicher freigeben) ---
    window.cleanupSessionFiles = function() {
        // Nur ausführen, wenn wir auf dem Gerät sind (Cordova File Plugin)
        if (!window.resolveLocalFileSystemURL || !window.cordova || !window.cordova.file) return;
        
        const files = ['track1.aac', 'track2.aac']; // Rec App Dateien
        for(let i=0; i<12; i++) files.push(`pad_${i}.aac`); // Sound App Dateien
        
        // Mögliche Speicherorte auf Android durchsuchen
        const dirs = [cordova.file.dataDirectory, cordova.file.externalDataDirectory, cordova.file.tempDirectory];
        
        files.forEach(filename => {
            dirs.forEach(dir => {
                if(!dir) return;
                window.resolveLocalFileSystemURL(dir + filename, (entry) => {
                    entry.remove(() => console.log(`🗑️ Gelöscht: ${filename}`), () => {});
                }, () => {}); // Fehler ignorieren (Datei existiert nicht)
            });
        });

        // Alte Druck-Dateien aufräumen (älter als 1 Stunde)
        const cacheDirs = [cordova.file.cacheDirectory, cordova.file.externalCacheDirectory];
        const now = Date.now();
        const ONE_HOUR = 60 * 60 * 1000;

        cacheDirs.forEach(dir => {
            if(!dir) return;
            window.resolveLocalFileSystemURL(dir, (dirEntry) => {
                const reader = dirEntry.createReader();
                reader.readEntries((entries) => {
                    entries.forEach(entry => {
                        // Prüfen ob es eine unserer Druckdateien ist
                        if (entry.isFile && entry.name.startsWith('print_') && entry.name.endsWith('.jpg')) {
                            // Zeitstempel aus Namen extrahieren: print_167..._123.jpg
                            const parts = entry.name.split('_');
                            if (parts[1] && (now - parseInt(parts[1])) > ONE_HOUR) {
                                entry.remove(() => console.log("Alten Druck gelöscht"), () => {});
                            }
                        }
                    });
                }, () => {});
            }, () => {});
        });
    };

    // --- 1. Navigation ---
    window.goHome = function() {
        if (window.playSound) window.playSound('click');
        document.body.classList.add('fade-out');
        
        // GLOBALER KILLSWITCH: Hardware sofort freigeben (Kameras & Mikrofone)
        try {
            document.querySelectorAll('video, audio').forEach(el => {
                if (el.srcObject && typeof el.srcObject.getTracks === 'function') {
                    el.srcObject.getTracks().forEach(t => t.stop());
                }
            });
        } catch(e) {}

        setTimeout(() => {
            // Aufräumen beim Verlassen einer App
            if (isSubApp) {
                try { window.cleanupSessionFiles(); } catch(e) { console.warn("Cleanup Fehler:", e); }
            }
            // Parameter skip_splash verhindert, dass der Splashscreen erneut angezeigt wird
            window.location.href = isSubApp ? '../index.html?skip_splash=1' : 'index.html?skip_splash=1';
        }, 300);
    };

    // --- 2. Info Modal ---
    window.toggleInfo = function() {
        window.resetIdleTimer();
        if (window.playSound) window.playSound('click');
        
        const modal = document.getElementById('info-modal');
        if (modal) {
            if (modal.classList.contains('hidden')) {
                modal.classList.remove('hidden');
                modal.classList.add('flex');
            } else {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        }
    };

    // --- 3. Idle Timer ---
    window.resetIdleTimer = function() {
        clearTimeout(idleTimer);
        
        idleTimer = setTimeout(() => {
            // Prüfen, ob die App gerade beschäftigt ist (z.B. Aufnahme läuft)
            // Wir suchen nach typischen Indikatoren für Aktivität
            const isBusy = document.querySelector('.rec-active, #countdown:not(.hidden), #saving-overlay:not(.hidden), #preview-overlay:not(.hidden)');
            
            if (isBusy) {
                console.log("Idle Timer: App ist beschäftigt, Reset.");
                window.resetIdleTimer(); // Timer neu starten
                return;
            }

            console.log("Idle Timer: Zeit abgelaufen.");
            
            if (isSubApp) {
                // In einer App: Zurück zum Hub
                try { window.cleanupSessionFiles(); } catch(e) {}
                window.location.href = '../index.html';
            } else {
                // Auf dem Hub: Alles zurücksetzen
                const modals = document.querySelectorAll('#admin-modal, #info-modal, #qr-modal');
                modals.forEach(m => {
                    m.classList.add('hidden');
                    m.classList.remove('flex', 'modal-visible');
                });
                
                const missionText = document.getElementById('mission-text');
                if(missionText) missionText.innerText = "Wähle eine App! 👉";
            }
        }, IDLE_TIMEOUT);
    };

    // --- 5. Wake Lock (Bildschirm wach halten) ---
    let wakeLock = null;
    async function requestWakeLock() {
        if ('wakeLock' in navigator && !wakeLock) {
            try {
                wakeLock = await navigator.wakeLock.request('screen');
                wakeLock.addEventListener('release', () => { wakeLock = null; });
                console.log('💡 Screen Wake Lock aktiv');
            } catch (err) {
                console.warn('Wake Lock Fehler:', err);
            }
        }
    }

    // --- 4. Initialisierung ---
    function initCommon() {
        // --- Globaler Sound-Debouncer (Entprellung für Klicks) ---
        if (window.playSound) {
            const originalPlay = window.playSound;
            let lastClickTime = 0;
            window.playSound = function(id) {
                const now = Date.now();
                if (id === 'click' && now - lastClickTime < 100) return; // 100ms Entprellung!
                if (id === 'click') lastClickTime = now;
                originalPlay(id);
            };
        }

        // Event Listener für Benutzeraktivität
        const events = ['mousedown', 'touchstart', 'scroll', 'keydown', 'input', 'pointerdown'];
        events.forEach(evt => {
            document.addEventListener(evt, () => window.resetIdleTimer(), {passive: true});
        });
        
        // Global Hardening: Kontextmenü überall deaktivieren
        document.addEventListener('contextmenu', event => event.preventDefault());
        
        // Wake Lock Logik
        requestWakeLock();
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
                // FIX: Kamera neu starten, wenn sie nach dem Drucken (App-Wechsel) eingefroren ist
                document.querySelectorAll('video').forEach(v => {
                    if (v.srcObject && v.paused) {
                        console.log("🔄 Re-Activating Camera...");
                        v.play().catch(e => console.warn("Resume failed", e));
                    }
                });
            }
        });
        document.addEventListener('click', requestWakeLock, {once: true}); // Fallback bei erster Interaktion
        
        // --- 6. Service Worker Registration (PWA) ---
        if ('serviceWorker' in navigator) {
            const swPath = isSubApp ? '../sw.js' : 'sw.js';
            
            let refreshing = false;
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                if (!refreshing) {
                    refreshing = true;
                    window.location.reload();
                }
            });

            navigator.serviceWorker.register(swPath)
                .then(() => console.log('✅ Service Worker registriert'))
                .catch(err => console.warn('❌ Service Worker Fehler:', err));
        }

        // Timer starten
        window.resetIdleTimer();

        // Splashscreen Management (Web & Native)
        const webSplash = document.getElementById('web-splash');
        
        // Prüfen, ob wir skippen (Klasse auf HTML Element gesetzt durch Inline-Script)
        if (document.documentElement.classList.contains('skip-splash')) {
            // Sofort aufräumen
            if(webSplash) webSplash.remove();
        } 
        else if (webSplash) {
            // Splash läuft: Native Splash weg
            try { if(SplashScreen) SplashScreen.hide(); } catch(e) {}
            
            // Merken, dass die App gestartet wurde
            try { sessionStorage.setItem('app_started', 'true'); } catch(e) {}

            // Nach 5 Sekunden: Splash ausblenden, Inhalt einblenden
            setTimeout(() => {
                webSplash.classList.add('opacity-0', 'pointer-events-none');
                document.body.classList.add('splash-done'); // Macht #main-grid sichtbar
                setTimeout(() => webSplash.remove(), 700);
            }, 5000); // 5 Sekunden anzeigen
        } else {
            // Normaler Fall (oder Rückkehr zum Menü): Native Splash sanft ausblenden
            try {
                setTimeout(() => { if(SplashScreen) SplashScreen.hide({ fadeDuration: 300, autoHide: true }); }, 200);
            } catch (e) {}
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCommon);
    } else {
        initCommon();
    }

})();
