/**
 * common.js
 * Zentrale Logik für Navigation, Idle-Timer und Modals.
 * Wird in allen HTML-Dateien eingebunden.
 */

(function() {
    // Sicherer Zugriff auf Plugins (verhindert Absturz, wenn cordova.js fehlt)
    const SplashScreen = (window.Capacitor && window.Capacitor.Plugins) ? window.Capacitor.Plugins.SplashScreen : null;
    const IDLE_WARNING_TIME = 5 * 60 * 1000; // 5 Minuten Inaktivität bis Warnung
    const IDLE_RESET_TIME = 15 * 1000; // 15 Sekunden Zeit zum Reagieren (dann wird aufgeräumt)
    let idleWarningTimer, idleResetTimer;

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
    let lastInfoToggle = 0;
    window.openInfo = function(event) {
        if (event) {
            try { event.stopPropagation(); } catch(e) {}
        }
        const now = Date.now();
        if (now - lastInfoToggle < 400) return;
        lastInfoToggle = now;

        window.resetIdleTimer();
        if (window.playSound) window.playSound('click');
        
        const modal = document.getElementById('info-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    };

    window.closeInfo = function(event) {
        if (event) {
            try { event.stopPropagation(); } catch(e) {}
        }
        const modal = document.getElementById('info-modal');
        if (modal) {
            if (window.playSound) window.playSound('click');
            modal.classList.add('hidden');
            modal.style.display = 'none';
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        }
    };

    window.toggleInfo = function(event) {
        const modal = document.getElementById('info-modal');
        if (!modal) return;
        const isHidden = modal.style.display === 'none' || modal.classList.contains('hidden');
        if (isHidden) {
            window.openInfo(event);
        } else {
            window.closeInfo(event);
        }
    };

    // --- 3. Idle Timer ---
    function createIdleWarningModal() {
        let modal = document.getElementById('idle-warning-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'idle-warning-modal';
            modal.className = 'hidden fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md items-center justify-center p-4 transition-opacity duration-300 opacity-0';
            modal.innerHTML = `
                <div class="bg-slate-800 border-4 border-yellow-400 rounded-[3rem] max-w-lg w-full p-10 shadow-2xl text-center transform scale-90 transition-transform duration-300" id="idle-warning-content">
                    <div class="text-8xl mb-6 animate-bounce">👾</div>
                    <h2 class="text-4xl font-black text-white mb-4">Bist du noch da?</h2>
                    <p class="text-xl text-slate-300 mb-8 font-bold">Das Aufräum-Monster räumt gleich auf...</p>
                    <button class="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl text-2xl shadow-xl active:scale-95 transition border-b-8 border-yellow-700 active:border-b-0 active:translate-y-2 pointer-events-auto">
                        👋 WEITERMACHEN!
                    </button>
                </div>
            `;
            document.body.appendChild(modal);

            modal.addEventListener('click', (e) => {
                if (window.playSound) window.playSound('click');
                window.hideIdleWarning();
                window.resetIdleTimer();
            });
        }
        return modal;
    }

    window.hideIdleWarning = function() {
        const modal = document.getElementById('idle-warning-modal');
        if (modal && !modal.classList.contains('hidden')) {
            modal.classList.add('opacity-0');
            const content = document.getElementById('idle-warning-content');
            if (content) {
                content.classList.remove('scale-100');
                content.classList.add('scale-90');
            }
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }, 300);
        }
    };

    window.showIdleWarning = function() {
        const modal = createIdleWarningModal();
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            const content = document.getElementById('idle-warning-content');
            if (content) {
                content.classList.remove('scale-90');
                content.classList.add('scale-100');
            }
        }, 10);
    };

    window.resetIdleTimer = function() {
        clearTimeout(idleWarningTimer);
        clearTimeout(idleResetTimer);
        
        window.hideIdleWarning();
        
        idleWarningTimer = setTimeout(() => {
            const isBusy = document.querySelector('.rec-active, #countdown:not(.hidden), #saving-overlay:not(.hidden), #preview-overlay:not(.hidden)');
            
            if (isBusy) {
                window.resetIdleTimer(); // Timer neu starten
                return;
            }

            window.showIdleWarning();

            idleResetTimer = setTimeout(() => {
                window.hideIdleWarning();
                try { window.cleanupSessionFiles(); } catch(e) {}
                if (isSubApp) window.goHome();
            }, IDLE_RESET_TIME);
        }, IDLE_WARNING_TIME);
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
        // Automatische Bereinigung temporärer Dateien bei jedem Anwendungsstart
        try { window.cleanupSessionFiles(); } catch(e) {}

        // Globaler Hardware- & MediaStream Cleanup bei Anwendungsverlassen
        const stopHardwareStreams = () => {
            try {
                document.querySelectorAll('video, audio').forEach(el => {
                    if (el.srcObject && typeof el.srcObject.getTracks === 'function') {
                        el.srcObject.getTracks().forEach(t => t.stop());
                    }
                });
            } catch(e) {}
            if ('speechSynthesis' in window) {
                try { window.speechSynthesis.cancel(); } catch(e) {}
            }
        };
        window.addEventListener('pagehide', stopHardwareStreams);
        window.addEventListener('beforeunload', stopHardwareStreams);

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
        
        // --- KIOSK HARDENING: Android Back-Button abfangen ---
        document.addEventListener('deviceready', () => {
            document.addEventListener('backbutton', (e) => {
                e.preventDefault();
                // Wenn wir in einer App sind, sicher zum Menü zurückkehren
                if (isSubApp) window.goHome();
                // Im Hauptmenü passiert einfach gar nichts (App schließt sich nicht)
            }, false);
        });

        // --- 11. TTS WARM-UP ---
        if ('speechSynthesis' in window) {
            // Einmaliger Aufruf weckt die Engine im Hintergrund auf
            window.speechSynthesis.getVoices();
        }

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

            // --- NEU: Helper-Funktion für Ladebalken ---
            function getUpdateOverlay() {
                let overlay = document.getElementById('update-progress-overlay');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'update-progress-overlay';
                    // ZENTRIERT statt unten am Rand, damit er nicht abgeschnitten wird!
                    overlay.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 border-4 border-blue-500 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[999999] w-[90%] max-w-md transition-opacity duration-300 opacity-0 hidden flex flex-col';
                    overlay.innerHTML = `
                        <div class="flex justify-between items-center mb-4">
                            <span id="update-progress-title" class="text-white font-black text-lg md:text-2xl">🚀 Update lädt...</span>
                            <span id="update-progress-text" class="text-blue-400 font-mono text-sm md:text-base font-bold bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">Start...</span>
                        </div>
                        <div class="w-full bg-slate-900 rounded-full h-6 md:h-8 overflow-hidden border-2 border-slate-700 shadow-inner">
                            <div id="update-progress-bar" class="bg-blue-500 h-full rounded-full" style="width: 0%; transition: width 0.1s linear;"></div>
                        </div>
                        <p class="text-slate-400 text-sm mt-5 text-center font-bold leading-tight">Bitte die App geöffnet lassen und kurz warten.</p>
                    `;
                    document.body.appendChild(overlay);
                }
                return {
                    overlay: overlay,
                    bar: document.getElementById('update-progress-bar'),
                    txt: document.getElementById('update-progress-text'),
                    title: document.getElementById('update-progress-title')
                };
            }

            navigator.serviceWorker.addEventListener('message', (event) => {
                const data = event.data;
                if (data && data.type === 'SW_UPDATED') {
                    console.log('🔄 Neuer SW aktiv, reloading...');
                    setTimeout(() => window.location.reload(), 300);
                    return;
                }
                if (!['CACHE_START', 'CACHE_PROGRESS', 'CACHE_DONE', 'CACHE_ERROR'].includes(data.type)) return;

                const ui = getUpdateOverlay();

                if (data.type === 'CACHE_START' || data.type === 'CACHE_PROGRESS') {
                    ui.overlay.classList.remove('hidden');
                    setTimeout(() => ui.overlay.classList.remove('opacity-0'), 10);
                    
                    if (data.type === 'CACHE_PROGRESS') {
                        // Nummer sicher auf 0-100% begrenzen
                        const percent = Math.max(0, Math.min(100, Math.round((data.count / data.total) * 100)));
                        ui.bar.style.width = percent + '%';
                        ui.txt.innerText = `${data.count} / ${data.total}`;
                    }
                } else if (data.type === 'CACHE_DONE') {
                    ui.title.innerText = "✅ Update erfolgreich!";
                    ui.txt.innerText = "100%";
                    ui.bar.style.width = '100%';
                    ui.bar.classList.replace('bg-blue-500', 'bg-green-500');
                    ui.overlay.classList.replace('border-blue-500', 'border-green-500');
                    ui.txt.classList.replace('text-blue-400', 'text-green-400');
                    
                    // Normalerweise greift hier ohnehin kurz danach "window.location.reload()" aus dem controllerchange
                    setTimeout(() => {
                        ui.overlay.classList.add('opacity-0');
                        setTimeout(() => ui.overlay.classList.add('hidden'), 300);
                    }, 4000);
                } else if (data.type === 'CACHE_ERROR') {
                    ui.title.innerText = "❌ Fehler (Offline?)";
                    ui.bar.classList.replace('bg-blue-500', 'bg-red-500');
                    ui.overlay.classList.replace('border-blue-500', 'border-red-500');
                    ui.txt.classList.replace('text-blue-400', 'text-red-400');
                    
                    setTimeout(() => {
                        ui.overlay.classList.add('opacity-0');
                        setTimeout(() => ui.overlay.classList.add('hidden'), 300);
                    }, 5000);
                }
            });

            // updateViaCache: 'none' MUSS gesetzt sein, sonst cacht Nginx den Service Worker selbst ewig!
            navigator.serviceWorker.register(swPath, { scope: isSubApp ? '../' : './', updateViaCache: 'none' })
                .then((registration) => {
                    console.log('✅ Service Worker registriert');
                    
                    // Falls bereits ein wartender SW bereitsteht (z.B. vom vorherigen Hintergrund-Download)
                    if (registration.waiting) {
                        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                    }

                    // Fallback: Zeige Overlay SOFORT, sobald der Browser eine neue Version entdeckt hat
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                                }
                            });
                        }

                        const ui = getUpdateOverlay();
                        ui.overlay.classList.remove('hidden');
                        setTimeout(() => ui.overlay.classList.remove('opacity-0'), 10);
                        
                        // SICHERHEITSNETZ: Overlay nach 30 Sekunden automatisch ausblenden,
                        // falls die SW-Installation hängt oder scheitert
                        setTimeout(() => {
                            if (ui.overlay && !ui.overlay.classList.contains('hidden')) {
                                console.warn('⚠️ Update-Overlay Timeout – blende aus.');
                                ui.overlay.classList.add('opacity-0');
                                setTimeout(() => ui.overlay.classList.add('hidden'), 300);
                            }
                        }, 30000);
                    });
                    
                    registration.update(); // Zwingt den Browser im Hintergrund nach Updates zu suchen!
                })
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

    // --- 8. Vorlese-Funktion (Text-to-Speech) für Kinder ---
    window.speakText = function(text, event) {
        if (event) event.stopPropagation();
        window.resetIdleTimer();
        
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            if (window.speechSynthesis.resume) window.speechSynthesis.resume(); // Android Warteschlange aufwecken
            
            // Emojis filtern, damit sie nicht laut vorgelesen werden ("Lächelndes Gesicht mit Schweißperle...")
            const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
            
            try {
                // Globale Referenz, damit der Garbage Collector die Sprachausgabe nicht abbricht
                window.currentUtterance = new SpeechSynthesisUtterance(cleanText);
                
                window.currentUtterance.lang = 'de-DE';
                window.currentUtterance.rate = 0.9;
                window.currentUtterance.pitch = 1.2;
                
                // WICHTIG: KEIN setTimeout! Muss synchron im Klick-Event passieren (User Gesture)
                window.speechSynthesis.speak(window.currentUtterance);
            } catch (err) {
                console.error("Fehler beim Vorlesen:", err);
            }
        }
    };

    // --- 7. Konfetti Effekt ---
    window.triggerConfetti = function() {
        if (window.playSound) window.playSound('success');
        const colors = ['#facc15', '#ef4444', '#3b82f6', '#22c55e', '#a855f7'];
        const numConfetti = 80;
        const container = document.createElement('div');
        container.className = 'fixed inset-0 pointer-events-none z-[999999] overflow-hidden';
        document.body.appendChild(container);

        for (let i = 0; i < numConfetti; i++) {
            const conf = document.createElement('div');
            const color = colors[Math.floor(Math.random() * colors.length)];
            conf.className = 'absolute w-3 h-4 rounded-sm shadow-sm';
            conf.style.backgroundColor = color;
            conf.style.left = Math.random() * 100 + 'vw';
            conf.style.top = '-20px';
            
            const duration = Math.random() * 2 + 2; 
            const delay = Math.random() * 0.5;
            const xMovement = (Math.random() - 0.5) * 300; 
            const rot = Math.random() * 360;
            const rotSpeed = (Math.random() - 0.5) * 720;
            
            conf.animate([
                { transform: `translate3d(0,0,0) rotate(${rot}deg)`, opacity: 1 },
                { transform: `translate3d(${xMovement}px, 100vh, 0) rotate(${rot + rotSpeed}deg)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                delay: delay * 1000,
                easing: 'cubic-bezier(.37,0,.63,1)',
                fill: 'forwards'
            });
            container.appendChild(conf);
        }
        setTimeout(() => container.remove(), 5000);
    };

    // --- 9. Kinderfreundliche Fehlermeldungen ---
    window.showError = function(message, icon = "🙊") {
        let modal = document.getElementById('error-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'error-modal';
            modal.className = 'hidden fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm items-center justify-center p-4 transition-opacity duration-300 opacity-0';
            modal.innerHTML = `
                <div class="bg-slate-800 border-4 border-red-500 rounded-[3rem] max-w-md w-full p-8 shadow-2xl text-center transform scale-90 transition-transform duration-300" id="error-modal-content">
                    <div class="text-6xl md:text-8xl mb-4 animate-bounce" id="error-modal-icon">🙊</div>
                    <h2 class="text-2xl md:text-4xl font-black text-white mb-4">Hoppla!</h2>
                    <p class="text-lg md:text-xl text-slate-300 mb-8 font-bold" id="error-modal-text">Ein Fehler ist aufgetreten.</p>
                    <button onclick="window.hideError()" class="w-full bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl text-xl shadow-xl active:scale-95 transition border-b-8 border-red-800 active:border-b-0 active:translate-y-2 pointer-events-auto flex items-center justify-center gap-2">
                        <span class="text-2xl">👍</span> ALLES KLAR
                    </button>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        document.getElementById('error-modal-icon').innerText = icon;
        document.getElementById('error-modal-text').innerText = message;
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Fehler für das Kind vorlesen
        if (window.speakText) window.speakText("Hoppla! " + message);

        setTimeout(() => {
            modal.classList.remove('opacity-0');
            const content = document.getElementById('error-modal-content');
            if (content) {
                content.classList.remove('scale-90');
                content.classList.add('scale-100');
            }
        }, 10);
    };

    window.hideError = function() {
        if (window.playSound) window.playSound('click');
        const modal = document.getElementById('error-modal');
        if (modal && !modal.classList.contains('hidden')) {
            modal.classList.add('opacity-0');
            const content = document.getElementById('error-modal-content');
            if (content) {
                content.classList.remove('scale-100');
                content.classList.add('scale-90');
            }
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }, 300);
        }
    };

    // --- 9b. Kinderfreundlicher Bestätigungs-Dialog (Ersatz für natives confirm()) ---
    window.showConfirm = function(message, onConfirm, icon = "🤔") {
        let modal = document.getElementById('confirm-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'confirm-modal';
            modal.className = 'hidden fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm items-center justify-center p-4 transition-opacity duration-300 opacity-0';
            modal.innerHTML = `
                <div class="bg-slate-800 border-4 border-yellow-500 rounded-[3rem] max-w-md w-full p-8 shadow-2xl text-center transform scale-90 transition-transform duration-300" id="confirm-modal-content">
                    <div class="text-6xl md:text-8xl mb-4" id="confirm-modal-icon">🤔</div>
                    <h2 class="text-2xl md:text-4xl font-black text-white mb-4">Moment!</h2>
                    <p class="text-lg md:text-xl text-slate-300 mb-8 font-bold" id="confirm-modal-text"></p>
                    <div class="flex gap-4">
                        <button id="confirm-modal-cancel" class="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-black py-4 rounded-xl text-xl shadow-xl active:scale-95 transition border-b-8 border-slate-800 active:border-b-0 active:translate-y-2 pointer-events-auto flex items-center justify-center gap-2">
                            <span class="text-2xl">✋</span> NEIN
                        </button>
                        <button id="confirm-modal-ok" class="flex-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black py-4 rounded-xl text-xl shadow-xl active:scale-95 transition border-b-8 border-yellow-700 active:border-b-0 active:translate-y-2 pointer-events-auto flex items-center justify-center gap-2">
                            <span class="text-2xl">👍</span> JA
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        document.getElementById('confirm-modal-icon').innerText = icon;
        document.getElementById('confirm-modal-text').innerText = message;

        const hideConfirm = () => {
            if (window.playSound) window.playSound('click');
            modal.classList.add('opacity-0');
            const content = document.getElementById('confirm-modal-content');
            if (content) {
                content.classList.remove('scale-100');
                content.classList.add('scale-90');
            }
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }, 300);
        };

        const okBtn = document.getElementById('confirm-modal-ok');
        const cancelBtn = document.getElementById('confirm-modal-cancel');

        // Alte Listener entfernen (via Klonen)
        const newOk = okBtn.cloneNode(true);
        const newCancel = cancelBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOk, okBtn);
        cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

        newOk.addEventListener('click', () => { hideConfirm(); if (onConfirm) onConfirm(); });
        newCancel.addEventListener('click', () => { hideConfirm(); });

        modal.classList.remove('hidden');
        modal.classList.add('flex');

        setTimeout(() => {
            modal.classList.remove('opacity-0');
            const content = document.getElementById('confirm-modal-content');
            if (content) {
                content.classList.remove('scale-90');
                content.classList.add('scale-100');
            }
        }, 10);
    };

    // --- 9c. Kinderfreundlicher Hinweis-Dialog (Ersatz für natives alert()) ---
    window.showAlert = function(message, icon = "💡") {
        if (window.showError) {
            window.showError(message, icon);
        }
    };

    // --- 10. Magic Sparkles (Visuelles Touch-Feedback) ---
    document.addEventListener('pointerdown', (e) => {
        // Nicht auslösen bei Textfeldern, um beim Tippen nicht zu stören
        if (e.target.tagName === 'INPUT' || e.target.isContentEditable) return;

        const colors = ['#facc15', '#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#ffffff'];
        for (let i = 0; i < 3; i++) {
            const sparkle = document.createElement('div');
            sparkle.innerHTML = '✨';
            sparkle.className = 'fixed pointer-events-none z-[999998]';
            sparkle.style.left = e.clientX + 'px';
            sparkle.style.top = e.clientY + 'px';
            sparkle.style.color = colors[Math.floor(Math.random() * colors.length)];
            sparkle.style.fontSize = (Math.random() * 10 + 15) + 'px';
            document.body.appendChild(sparkle);

            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 30 + 15;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;

            const anim = sparkle.animate([
                { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
                { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1.5)`, opacity: 1, offset: 0.5 },
                { transform: `translate(calc(-50% + ${tx*1.5}px), calc(-50% + ${ty*1.5}px)) scale(0)`, opacity: 0 }
            ], { duration: 600 + Math.random() * 300, easing: 'cubic-bezier(0,.9,.57,1)' });
            anim.onfinish = () => sparkle.remove();
        }
    }, {passive: true});

    // --- 11. Belohnungseffekt (Konfetti Explosion) ---
    window.triggerCelebration = function() {
        if (window.playSound) window.playSound('success');

        let canvas = document.getElementById('celebration-canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'celebration-canvas';
            canvas.style.position = 'fixed';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100vw';
            canvas.style.height = '100vh';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '999999';
            document.body.appendChild(canvas);
        }
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#facc15', '#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#f97316'];
        const particles = [];
        const count = 80;

        for (let i = 0; i < count; i++) {
            particles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 200,
                y: canvas.height * 0.4 + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 18,
                vy: Math.random() * -18 - 4,
                size: Math.random() * 12 + 8,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.2,
                gravity: 0.45
            });
        }

        const startTime = performance.now();
        function animate(now) {
            const elapsed = now - startTime;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let active = false;
            const alpha = Math.max(0, 1 - elapsed / 2600);

            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += p.gravity;
                p.rotation += p.vRot;

                if (alpha > 0) {
                    active = true;
                    ctx.save();
                    ctx.globalAlpha = alpha;
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                    ctx.restore();
                }
            }

            if (active && elapsed < 2700) {
                requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
        requestAnimationFrame(animate);
    };

    // --- 12. Lokale Sitzungs-Galerie ("Meisterwerke") ---
    const MEISTER_KEY = 'medienstation_meisterwerke';

    // Hilfsfunktion: Bilder schnell auf max 800px JPEG komprimieren (~35KB, verhindert Quota-Fehler in localStorage & WebViews)
    function compressImageDataUrlFast(dataUrl, maxDim = 800, quality = 0.75) {
        return new Promise((resolve) => {
            if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
                return resolve(dataUrl);
            }
            if (dataUrl.startsWith('data:image/gif') || dataUrl.startsWith('data:image/svg')) {
                return resolve(dataUrl);
            }
            // Notbremse: Max 300ms Warten auf Mobilgeräten
            const timer = setTimeout(() => resolve(dataUrl), 300);

            const img = new Image();
            img.onload = () => {
                clearTimeout(timer);
                try {
                    let width = img.width || 800;
                    let height = img.height || 600;
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.fillStyle = '#ffffff'; // Weißer Hintergrund für transparente PNGs
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressed = canvas.toDataURL('image/jpeg', quality);
                    resolve((compressed && compressed.length < dataUrl.length) ? compressed : dataUrl);
                } catch(e) {
                    resolve(dataUrl);
                }
            };
            img.onerror = () => {
                clearTimeout(timer);
                resolve(dataUrl);
            };
            img.src = dataUrl;
        });
    }

    // --- 12. Direkte, Deadlock-Freie IndexedDB Storage Engine für Meisterwerke (DSGVO-konform, Offline-PWA) ---
    const DB_NAME = 'MedienStationDB_v4'; // DB-Name zur Umgehung alter blockierter Verbindungen
    const DB_VERSION = 1;
    const STORE_NAME = 'meisterwerke';
    const MAX_GALLERY_ITEMS = 40;

    let dbPromise = null;
    function getDB() {
        if (dbPromise) return dbPromise;
        dbPromise = new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                dbPromise = null;
                return reject(new Error('IndexedDB not supported'));
            }
            let req;
            try {
                req = window.indexedDB.open(DB_NAME, DB_VERSION);
            } catch(e) {
                dbPromise = null;
                return reject(e);
            }

            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };

            req.onsuccess = (e) => {
                const db = e.target.result;

                db.onversionchange = () => {
                    db.close();
                    dbPromise = null;
                };

                db.onerror = () => {
                    dbPromise = null;
                };

                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.close();
                    dbPromise = null;
                    return reject(new Error('ObjectStore meisterwerke missing'));
                }
                resolve(db);
            };

            req.onblocked = () => {
                console.warn('[MedienStation] DB open blocked');
                dbPromise = null;
                reject(new Error('DB open blocked'));
            };

            req.onerror = (e) => {
                dbPromise = null;
                reject((e.target ? e.target.error : e) || new Error('IDB open failed'));
            };
        });
        return dbPromise;
    }

    // Speichern in Synchron-Storage + IndexedDB (DSGVO-konform & Quota-Safe)
    window.saveToMeisterwerke = async function(item) {
        if (!item || !item.dataUrl) return item;

        item.id = item.id || (Date.now() + '_' + Math.random().toString(36).substr(2, 6));
        item.timestamp = item.timestamp || Date.now();
        item.type = item.type || 'image';
        item.appName = item.appName || 'KUNSTWERK';

        // 1. ZUERST Bild auf ~35KB komprimieren (verhindert QuotaExceededError in localStorage & WebViews)
        try {
            if (item.type === 'image' || (item.dataUrl && item.dataUrl.startsWith('data:image'))) {
                if (item.dataUrl.length > 80000) {
                    item.dataUrl = await compressImageDataUrlFast(item.dataUrl, 800, 0.75);
                }
            }
        } catch (cErr) {
            console.warn('[MedienStation] Komprimierungswarnung:', cErr);
        }

        // 2. SOFORTIGE SYNCHRONE SPEICHERUNG in localStorage & sessionStorage (< 2 ms)
        try {
            let list = [];
            const raw = localStorage.getItem(MEISTER_KEY);
            if (raw) { try { list = JSON.parse(raw); } catch(e) { list = []; } }
            if (!Array.isArray(list)) list = [];

            list = list.filter(it => it && it.id !== item.id && it.dataUrl !== item.dataUrl);
            list.unshift(item);
            if (list.length > MAX_GALLERY_ITEMS) list = list.slice(0, MAX_GALLERY_ITEMS);

            const jsonStr = JSON.stringify(list);
            try { localStorage.setItem(MEISTER_KEY, jsonStr); } catch(e) { console.warn('localStorage save warning:', e); }
            try { sessionStorage.setItem(MEISTER_KEY, jsonStr); } catch(e) { console.warn('sessionStorage save warning:', e); }
        } catch(lErr) {
            console.warn('[MedienStation] Sync save error:', lErr);
        }

        // 3. Dauerhaft in IndexedDB speichern
        try {
            const dbTimeout = new Promise((_, rej) => setTimeout(() => rej(new Error('IDB Timeout')), 1000));
            const db = await Promise.race([getDB(), dbTimeout]);

            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.put(item);
            await new Promise((resolve, reject) => {
                tx.oncomplete = resolve;
                tx.onerror = () => reject(tx.error || new Error('IDB put failed'));
            });

            // Ältere Einträge jenseits MAX_GALLERY_ITEMS bereinigen
            try {
                const pruneTx = db.transaction(STORE_NAME, 'readwrite');
                const pruneStore = pruneTx.objectStore(STORE_NAME);
                pruneStore.getAll().onsuccess = (e) => {
                    const all = e.target.result || [];
                    if (all.length > MAX_GALLERY_ITEMS) {
                        all.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
                        const excess = all.length - MAX_GALLERY_ITEMS;
                        for (let i = 0; i < excess; i++) {
                            pruneStore.delete(all[i].id);
                        }
                    }
                };
            } catch(pErr) {}

        } catch(e) {
            console.warn('[MedienStation] IndexedDB save warning:', e);
        }

        if (window.showCustomAlert) {
            window.showCustomAlert('🎨 In Galerie gespeichert!');
        }
        if (window.triggerCelebration) window.triggerCelebration();
        return item;
    };

    // Lesen aus IndexedDB + Backups
    window.getMeisterwerke = async function(callback) {
        let items = [];
        let itemMap = new Map();

        // 1. Aus IndexedDB lesen (mit 800ms Timeout-Sicherung)
        try {
            const dbTimeout = new Promise((_, rej) => setTimeout(() => rej(new Error('IDB get Timeout')), 800));
            const db = await Promise.race([getDB(), dbTimeout]);

            const idbItems = await new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.getAll();
                req.onsuccess = (e) => resolve(e.target.result || []);
                req.onerror = () => reject(req.error || new Error('store.getAll failed'));
            });

            if (Array.isArray(idbItems)) {
                idbItems.forEach(it => {
                    if (it && typeof it === 'object' && it.dataUrl) {
                        itemMap.set(it.id || it.dataUrl, it);
                    }
                });
            }
        } catch(e) {
            console.warn('[MedienStation] IndexedDB read warning:', e);
        }

        // 2. Aus localStorage ergänzen
        try {
            const raw = localStorage.getItem(MEISTER_KEY);
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list)) {
                    list.forEach(it => {
                        if (it && typeof it === 'object' && it.dataUrl) {
                            const key = it.id || it.dataUrl;
                            if (!itemMap.has(key)) itemMap.set(key, it);
                        }
                    });
                }
            }
        } catch(err) {}

        // 3. Aus sessionStorage ergänzen
        try {
            const rawS = sessionStorage.getItem(MEISTER_KEY);
            if (rawS) {
                const listS = JSON.parse(rawS);
                if (Array.isArray(listS)) {
                    listS.forEach(it => {
                        if (it && typeof it === 'object' && it.dataUrl) {
                            const key = it.id || it.dataUrl;
                            if (!itemMap.has(key)) itemMap.set(key, it);
                        }
                    });
                }
            }
        } catch(err) {}

        items = Array.from(itemMap.values());
        items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        if (typeof callback === 'function') callback(items);
        return items;
    };

    // Löschen aus IndexedDB + Backups
    window.clearMeisterwerke = async function(onComplete) {
        try { localStorage.removeItem(MEISTER_KEY); } catch(e) {}
        try { sessionStorage.removeItem(MEISTER_KEY); } catch(e) {}

        try {
            const dbTimeout = new Promise((_, rej) => setTimeout(() => rej(new Error('IDB clear Timeout')), 800));
            const db = await Promise.race([getDB(), dbTimeout]);

            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).clear();
            await new Promise((res) => { tx.oncomplete = res; tx.onerror = res; });
            console.log('[MedienStation] Galerie geleert.');
        } catch(e) {
            console.warn('[MedienStation] clearMeisterwerke error:', e);
        }
        if (typeof onComplete === 'function') onComplete();
    };

    window.renderMeisterwerkeGrid = async function() {
        const grid = document.getElementById('meisterwerke-grid');
        const footer = document.getElementById('meisterwerke-footer');
        if (!grid) return;

        try {
            const rawItems = await window.getMeisterwerke();
            const items = Array.isArray(rawItems) ? rawItems.filter(it => it && typeof it === 'object' && it.dataUrl) : [];

            if (items.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full text-center py-16 text-slate-400 select-none">
                        <div class="text-7xl mb-4">🎨</div>
                        <h3 class="text-2xl md:text-3xl font-black text-white mb-2">Noch keine Kunstwerke!</h3>
                        <p class="text-base md:text-lg font-bold max-w-md mx-auto mb-6">Nutze die Apps (z.B. Pixel, Comic oder Mikro), um Bilder oder Sounds zu erstellen. Sie erscheinen automatisch hier!</p>
                        <button onclick="window.renderMeisterwerkeGrid()" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-full text-sm shadow-xl active:scale-95 transition">
                            🔄 Galerie aktualisieren
                        </button>
                    </div>
                `;
                if (footer) footer.style.display = 'none';
            } else {
                grid.innerHTML = items.map((it) => {
                    const typeLower = (it.type || '').toLowerCase();
                    const dataUrl = it.dataUrl || '';
                    const isVideo = typeLower === 'video' || dataUrl.startsWith('data:video/') || dataUrl.endsWith('.mp4');
                    const isAudio = typeLower === 'audio' || dataUrl.startsWith('data:audio/') || dataUrl.endsWith('.mp3') || dataUrl.endsWith('.wav');
                    const isImage = !isVideo && !isAudio;
                    const appName = it.appName || 'KUNSTWERK';

                    return `
                    <div class="bg-slate-700/80 border-2 border-slate-600 rounded-2xl p-3 flex flex-col items-center justify-between shadow-lg overflow-hidden group hover:border-amber-400 transition-all">
                        <div class="w-full h-36 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center relative mb-2">
                            ${isImage ? `<img src="${dataUrl}" class="w-full h-full object-contain" alt="${appName}" onerror="this.onerror=null; this.src='../assets/logo.png';">` : ''}
                            ${isVideo ? `<video src="${dataUrl}" controls playsinline class="w-full h-full object-contain"></video>` : ''}
                            ${isAudio ? `
                                <div class="flex flex-col items-center justify-center gap-2">
                                    <span class="text-5xl">🎙️</span>
                                    <audio src="${dataUrl}" controls class="w-[90%] max-w-[200px] h-8"></audio>
                                </div>
                            ` : ''}
                        </div>
                        <div class="w-full flex items-center justify-between gap-2">
                            <span class="text-xs font-bold text-amber-400 uppercase tracking-wider truncate">${appName}</span>
                            ${isImage && window.printImage ? `
                                <button onclick="event.stopPropagation(); window.printImage('${dataUrl}')" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded-lg shadow border border-blue-400 active:scale-95 transition flex items-center gap-1 shrink-0 cursor-pointer">
                                    🖨️ Drucken
                                </button>
                            ` : ''}
                        </div>
                    </div>
                `;
                }).join('');
                if (footer) footer.style.display = 'flex';
            }
            window.updateGalleryInfoText();
        } catch(err) {
            console.warn('[MedienStation] renderMeisterwerkeGrid error:', err);
        }
    };

    window.updateGalleryInfoText = function() {
        try {
            const status = window.getStorageResetMode ? window.getStorageResetMode() : { mode: 'daily' };
            let resetHtml = '<span class="text-amber-400 font-extrabold">Datenschutz & Reset:</span> Alle Kunstwerke werden jede Nacht um 00:00 Uhr automatisch gelöscht (DSGVO-konform).';
            let shortMsg = '100% lokal im Browser gespeichert (IndexedDB) • Täglicher Auto-Reset um 00:00 Uhr';

            if (status.mode === 'project_7d') {
                resetHtml = `<span class="text-amber-400 font-extrabold">Datenschutz & Speicher:</span> 🟡 Projekt-Modus aktiv: Werke bleiben für laufende Projekte noch ca. ${status.pauseDaysRemaining} Tag(e) über Nacht erhalten.`;
                shortMsg = `100% lokal gespeichert (IndexedDB) • 🟡 Projekt-Modus aktiv (noch ${status.pauseDaysRemaining} Tage)`;
            } else if (status.mode === 'never') {
                resetHtml = '<span class="text-amber-400 font-extrabold">Datenschutz & Speicher:</span> ⚪ Dauerhafter Speicher aktiv: Werke bleiben im lokalen Speicher, bis sie manuell gelöscht werden.';
                shortMsg = '100% lokal gespeichert (IndexedDB) • ⚪ Dauerhafter Speicher (kein Auto-Reset)';
            }

            const resetEl = document.getElementById('meisterwerke-reset-info');
            if (resetEl) {
                resetEl.innerHTML = resetHtml;
            }
            const modalInfoEl = document.getElementById('meisterwerke-modal-info');
            if (modalInfoEl) {
                modalInfoEl.textContent = shortMsg;
            }
        } catch(e) {
            console.warn('updateGalleryInfoText error:', e);
        }
    };

    let lastMeisterwerkeToggle = 0;
    window.openMeisterwerke = function(event) {
        if (event) {
            try { event.stopPropagation(); } catch(e) {}
        }
        const now = Date.now();
        if (now - lastMeisterwerkeToggle < 400) return;
        lastMeisterwerkeToggle = now;

        try { window.resetIdleTimer(); } catch(e) {}
        try { if (window.playSound) window.playSound('click'); } catch(e) {}

        const modal = document.getElementById('meisterwerke-modal');
        if (!modal) {
            console.warn('[Galerie] meisterwerke-modal nicht gefunden!');
            return;
        }

        try { window.renderMeisterwerkeGrid(); } catch(e) { console.warn('renderMeisterwerkeGrid error:', e); }
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    };

    window.closeMeisterwerke = function(event) {
        if (event) {
            try { event.stopPropagation(); } catch(e) {}
        }
        const modal = document.getElementById('meisterwerke-modal');
        if (!modal) return;
        try { if (window.playSound) window.playSound('click'); } catch(e) {}
        modal.classList.add('hidden');
        modal.style.display = 'none';
    };

    window.toggleMeisterwerke = function(event) {
        const modal = document.getElementById('meisterwerke-modal');
        if (!modal) return;
        const isHidden = modal.style.display === 'none' || modal.classList.contains('hidden');
        if (isHidden) {
            window.openMeisterwerke(event);
        } else {
            window.closeMeisterwerke(event);
        }
    };

    // --- 13. Fachkraft-Einstellungen & Automatischer Reset (Datenschutz & DSGVO) ---
    const DATE_KEY = 'medienstation_last_active_date';
    const RESET_MODE_KEY = 'medienstation_reset_mode';
    const RESET_PAUSE_UNTIL_KEY = 'medienstation_reset_pause_until';
    const PIN_KEY = 'medienstation_admin_pin';

    window.getAdminPin = function() {
        return localStorage.getItem(PIN_KEY) || '1234';
    };

    window.setAdminPin = function(newPin) {
        if (!newPin || newPin.trim().length < 4) return false;
        localStorage.setItem(PIN_KEY, newPin.trim());
        return true;
    };

    window.getStorageResetMode = function() {
        let mode = localStorage.getItem(RESET_MODE_KEY) || 'daily';
        let pauseUntil = localStorage.getItem(RESET_PAUSE_UNTIL_KEY);
        let pauseDaysRemaining = 0;

        if (mode === 'project_7d' && pauseUntil) {
            const msRemaining = parseInt(pauseUntil, 10) - Date.now();
            if (msRemaining <= 0) {
                mode = 'daily';
                localStorage.setItem(RESET_MODE_KEY, 'daily');
                localStorage.removeItem(RESET_PAUSE_UNTIL_KEY);
            } else {
                pauseDaysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
            }
        }

        return {
            mode: mode,
            pauseUntil: pauseUntil ? parseInt(pauseUntil, 10) : null,
            pauseDaysRemaining: pauseDaysRemaining
        };
    };

    window.setStorageResetMode = function(mode) {
        if (mode === 'project_7d') {
            const pauseUntil = Date.now() + (7 * 24 * 60 * 60 * 1000);
            localStorage.setItem(RESET_MODE_KEY, 'project_7d');
            localStorage.setItem(RESET_PAUSE_UNTIL_KEY, pauseUntil.toString());
        } else if (mode === 'never') {
            localStorage.setItem(RESET_MODE_KEY, 'never');
            localStorage.removeItem(RESET_PAUSE_UNTIL_KEY);
        } else {
            localStorage.setItem(RESET_MODE_KEY, 'daily');
            localStorage.removeItem(RESET_PAUSE_UNTIL_KEY);
        }
        return window.getStorageResetMode();
    };

    window.checkDailyGalleryCleanup = async function() {
        try {
            const storageStatus = window.getStorageResetMode();
            
            if (storageStatus.mode === 'project_7d' || storageStatus.mode === 'never') {
                return;
            }

            // Lokales Datum (YYYY-MM-DD) im aktuellen Zeitzonen-Kontext bestimmen
            const now = new Date();
            const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
            const lastDate = localStorage.getItem(DATE_KEY);

            if (lastDate && lastDate !== today) {
                await window.clearMeisterwerke();
                console.log(`[MedienStation] Automatischer täglicher Galerie-Reset durchgeführt (${lastDate} -> ${today}).`);
            }
            localStorage.setItem(DATE_KEY, today);
        } catch(e) {
            console.warn('[MedienStation] Fehler beim täglichen Galerie-Reset:', e);
        }
    };

    // --- 14. ZIP-Sammel-Export für alle Meisterwerke (Fotos, Videos, Comics, Audio) ---
    window.exportAllMeisterwerkeZip = async function() {
        try {
            if (typeof JSZip === 'undefined') {
                if (window.showCustomAlert) {
                    window.showCustomAlert('ZIP-Bibliothek wird geladen... Bitte einen Moment warten.');
                }
                return;
            }

            const items = await window.getMeisterwerke();
            if (!items || items.length === 0) {
                if (window.showCustomAlert) {
                    window.showCustomAlert('Die Galerie ist aktuell leer. Es gibt keine Werke zum Herunterladen.');
                } else {
                    alert('Die Galerie ist aktuell leer.');
                }
                return;
            }

            const zip = new JSZip();
            const dateStr = new Date().toISOString().slice(0, 10);
            const folderName = `MedienStation_${dateStr}`;
            const folder = zip.folder(folderName);

            items.forEach((item, index) => {
                const num = String(index + 1).padStart(2, '0');
                const rawType = (item.type || 'werk').toLowerCase().replace(/[^a-z0-9]/g, '_');
                const safeDate = (item.date || 'datum').replace(/[:. ]/g, '-');
                
                let dataUri = item.dataUrl || item.data || '';
                let ext = 'png';

                if (dataUri.startsWith('data:image/jpeg')) ext = 'jpg';
                else if (dataUri.startsWith('data:image/webp')) ext = 'webp';
                else if (dataUri.startsWith('data:image/png')) ext = 'png';
                else if (dataUri.startsWith('data:video/webm')) ext = 'webm';
                else if (dataUri.startsWith('data:video/mp4')) ext = 'mp4';
                else if (dataUri.startsWith('data:audio/webm')) ext = 'webm';
                else if (dataUri.startsWith('data:audio/wav')) ext = 'wav';
                else if (dataUri.startsWith('data:audio/mp3') || dataUri.startsWith('data:audio/mpeg')) ext = 'mp3';

                const fileName = `${num}_${rawType}_${safeDate}.${ext}`;
                const base64Data = dataUri.split(',')[1];
                if (base64Data) {
                    folder.file(fileName, base64Data, { base64: true });
                }
            });

            // Metadaten / Übersichtstext beilegen
            const metaInfo = `MedienStation - Gesammelte Meisterwerke\nDatum: ${dateStr}\nAnzahl Werke: ${items.length}\n\n` +
                items.map((it, idx) => `${idx + 1}. [${it.type}] ${it.title || 'Werk'} (${it.appName || ''})`).join('\n');
            folder.file('Uebersicht.txt', metaInfo);

            const content = await zip.generateAsync({ type: 'blob' });
            const downloadUrl = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `MedienStation_Meisterwerke_${dateStr}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 2000);

            if (window.showCustomAlert) {
                window.showCustomAlert(`✅ ${items.length} Meisterwerke erfolgreich als ZIP heruntergeladen!`);
            }
        } catch (err) {
            console.error('[MedienStation] Fehler beim ZIP-Export:', err);
            if (window.showCustomAlert) {
                window.showCustomAlert('Fehler beim Erstellen der ZIP-Datei: ' + err.message);
            }
        }
    };

    // Sofort beim Start ausführen
    window.checkDailyGalleryCleanup();

    // Bei Sichtbarkeitswechsel (z. B. Tablet aufgeweckt) erneut prüfen
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            window.checkDailyGalleryCleanup();
        }
    });
})();

