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
    function enforceCameraRestrictionInSubApp() {
        try {
            if (!isSubApp) return false;
            if (typeof window.isCameraRestricted !== 'function' || typeof window.isCameraApp !== 'function') return false;
            if (!window.isCameraRestricted() || !window.isCameraApp(window.location.pathname)) return false;

            // Blockiere getUserMedia für Video in dieser Sitzung als zusätzliche Schutzschicht
            if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
                const origGUM = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
                navigator.mediaDevices.getUserMedia = function(constraints) {
                    if (constraints && constraints.video) {
                        return Promise.reject(new DOMException('Kamera-Datenschutz ist aktiv', 'NotAllowedError'));
                    }
                    return origGUM(constraints);
                };
            }

            // Laufende Video-Streams sofort stoppen
            document.querySelectorAll('video').forEach(el => {
                if (el.srcObject && typeof el.srcObject.getTracks === 'function') {
                    el.srcObject.getTracks().forEach(t => t.stop());
                }
            });

            let lockOverlay = document.getElementById('camera-restricted-lock-overlay');
            if (!lockOverlay) {
                lockOverlay = document.createElement('div');
                lockOverlay.id = 'camera-restricted-lock-overlay';
                lockOverlay.style.cssText = 'position: fixed; inset: 0; z-index: 9999999; background: rgba(15, 23, 42, 0.98); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; text-align: center; color: white;';
                lockOverlay.innerHTML = `
                    <div style="max-width: 440px; background: #1e293b; border: 4px solid #f43f5e; border-radius: 2rem; padding: 32px; box-shadow: 0 25px 50px rgba(0,0,0,0.7);">
                        <div style="font-size: 64px; margin-bottom: 12px;">🔒</div>
                        <h2 style="font-size: 26px; font-weight: 900; margin-bottom: 12px;">Kamera macht gerade Pause</h2>
                        <p style="font-size: 16px; color: #cbd5e1; font-weight: 700; margin-bottom: 24px; line-height: 1.5;">Der Foto-Datenschutz ist aktiv. Probier doch stattdessen Musik, Mikro oder Pixel Art aus!</p>
                        <button onclick="window.goHome()" style="width: 100%; background: #facc15; color: #0f172a; font-weight: 900; font-size: 18px; padding: 14px 20px; border-radius: 14px; border: none; border-bottom: 6px solid #ca8a04; cursor: pointer;">
                            🏠 ZURÜCK ZUM HAUPTMENÜ
                        </button>
                    </div>
                `;
                document.body.appendChild(lockOverlay);
            }
            return true;
        } catch(e) {
            return false;
        }
    }

    function initCommon() {
        try {
            // Kamera-Datenschutz auch bei Direktaufruf / Zurück-Navigation in Sub-Apps durchsetzen
            enforceCameraRestrictionInSubApp();

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

        // --- 6. Service Worker Registration (PWA, nur im Hauptmenü) ---
        if (!isSubApp && 'serviceWorker' in navigator) {
            const swPath = 'sw.js';
            
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
            navigator.serviceWorker.register(swPath, { scope: './', updateViaCache: 'none' })
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

        // In-App Sprachauswahl initialisieren
        if (typeof window.initAppLanguageSwitcher === 'function') {
            try { window.initAppLanguageSwitcher(); } catch(e) {}
        }

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
        } catch(err) {
            console.warn('[MedienStation] initCommon caught error:', err);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            try { initCommon(); } catch(e) { console.warn('initCommon error:', e); }
        });
    } else {
        try { initCommon(); } catch(e) { console.warn('initCommon error:', e); }
    }

    // --- 8. Mehrsprachigkeit & Vorlese-Funktion (Text-to-Speech) für Kinder ---
    window.LANGUAGES = {
        de: { code: 'de-DE', voicePrefix: 'de', flag: '🇩🇪', name: 'Deutsch', label: 'DE', hello: 'Hallo!' },
        en: { code: 'en-US', voicePrefix: 'en', flag: '🇬🇧', name: 'English', label: 'EN', hello: 'Hello!' },
        uk: { code: 'uk-UA', voicePrefix: 'uk', flag: '🇺🇦', name: 'Українська', label: 'UK', hello: 'Привіт!' },
        tr: { code: 'tr-TR', voicePrefix: 'tr', flag: '🇹🇷', name: 'Türkçe', label: 'TR', hello: 'Merhaba!' },
        ar: { code: 'ar-SA', voicePrefix: 'ar', flag: '🇸🇾', name: 'العربية', label: 'AR', hello: 'مرحباً!' }
    };

    window.getLanguage = function() {
        try {
            return localStorage.getItem('medienstation_language') || 'de';
        } catch(e) {
            return 'de';
        }
    };

    window.setLanguage = function(lang, announce = false) {
        if (!window.LANGUAGES[lang]) lang = 'de';
        try {
            localStorage.setItem('medienstation_language', lang);
        } catch(e) {}

        // UI-Aktualisierung
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const bLang = btn.getAttribute('data-lang');
            if (bLang === lang) {
                btn.classList.add('bg-amber-400', 'text-slate-950', 'shadow-sm', 'scale-105');
                btn.classList.remove('text-slate-300', 'hover:text-white', 'hover:bg-slate-700/60');
            } else {
                btn.classList.remove('bg-amber-400', 'text-slate-950', 'shadow-sm', 'scale-105');
                btn.classList.add('text-slate-300', 'hover:text-white', 'hover:bg-slate-700/60');
            }
        });

        // App-Pills aktualisieren
        const langConfig = window.LANGUAGES[lang];
        document.querySelectorAll('.app-lang-pill').forEach(pill => {
            pill.innerHTML = `<span>${langConfig.flag}</span><span class="text-[10px] sm:text-xs font-black">${langConfig.label}</span>`;
            pill.title = `Sprache: ${langConfig.name} (Tippen zum Wechseln)`;
        });

        window.dispatchEvent(new CustomEvent('medienstation-language-changed', { detail: { lang } }));

        if (announce) {
            if (window.playSound) window.playSound('click');
            window.speakText(langConfig.hello);
        }
    };

    window.MedienStation_i18n = {
        app_pixel: {
            de: "Anleitung für das Pixel Labor. Pixel sind kleine bunte Quadrate, aus denen jedes digitale Bild besteht! Malen: Wähle eine Farbe aus und tippe oder wische über das Gitter. Radieren: Nimm den Schwamm oder drücke auf Zurück. Fertig? Speichere dein Bild für die Galerie oder drucke es aus.",
            en: "Instructions for Pixel Art. Pixels are small colorful squares that make up every digital picture! Drawing: Choose a color and tap or swipe over the grid. Erase: Use the sponge or press Undo. Finished? Save your artwork for the gallery or print it out.",
            uk: "Інструкція для Піксель-Арт. Пікселі — це маленькі кольорові квадратики, з яких складається кожне цифрове зображення! Малювання: Обери колір і торкайся або веди пальцем по сітці. Гумка: Візьми губку або натисни Назад. Готово? Збережи малюнок для галереї або роздрукуй.",
            tr: "Piksel Laboratuvarı rehberi. Pikseller, her dijital resmin oluştuğu minik renkli karelerdir! Çizim: Bir renk seç ve ızgaraya dokun ya da parmağını kaydır. Silme: Süngeri seç veya Geri tuşuna bas. Bitti mi? Resmini galeriye kaydet veya yazdır.",
            ar: "تعليمات مختبر البكسل. البكسلات هي مربعات ملونة صغيرة يتكون منها كل رسم رقمي! الرسم: اختر لوناً والمس الشبكة أو مرر إصبعك عليها. المسح: استخدم الإسفنجة أو اضغط زر تراجع. انتهيت؟ احفظ عملك في المعرض أو اطبعه."
        },
        app_sound: {
            de: "Anleitung für das Musik Labor. Wähle zuerst den Modus. Aufnehmen: Tippe auf einen roten REC Button, dann auf ein Pad. Schleife: Tippe auf LOOP, dann auf ein Pad, damit es sich wiederholt. Spielen: Tippe einfach auf die Pads, um Musik zu machen.",
            en: "Instructions for Music Lab. Choose a mode first. Record: Tap a red REC button, then tap a pad. Loop: Tap LOOP, then tap a pad to repeat it. Play: Just tap the pads to make music.",
            uk: "Інструкція для Музичної Лабораторії. Спочатку обери режим. Запис: Натисни червону кнопку REC, потім на пад. Петля: Натисни LOOP, потім на пад для повторення. Гра: Просто торкайся падів, щоб створювати музику.",
            tr: "Müzik Laboratuvarı rehberi. Önce modu seç. Kayıt: Kırmızı REC düğmesine, ardından bir pede dokun. Döngü: LOOP'a, sonra tekrarlaması için pede dokun. Çal: Müzik yapmak için pedlere dokun.",
            ar: "تعليمات مختبر الموسيقى. اختر الوضع أولاً. التسجيل: اضغط على زر التسجيل الأحمر ثم على أي وسادة. التكرار: اضغط على التكرار ثم على وسادة لتتكرر. العزف: المس الوسادات لعزف الموسيقى."
        },
        app_comic: {
            de: "Anleitung für das Comic Studio. Fotografieren: Drücke auf den blauen Kamera-Button in jedem Bildrahmen, um ein Foto zu machen. Texten: Tippe auf den Text in der Blase, um ihn zu ändern. Schiebe die Blase mit dem kleinen blauen Griff. Fertig: Wenn deine Geschichte fertig ist, kannst du sie speichern oder ausdrucken.",
            en: "Instructions for Comic Studio. Photos: Tap the blue camera button in each frame to take a photo. Text: Tap the text in the speech bubble to edit it. Drag the bubble with the blue handle. Finished: When your story is ready, you can save or print it.",
            uk: "Інструкція для Комікс Студії. Фото: Натисни синю кнопку камери в кожному кадрі, щоб зробити знімок. Текст: Торкнися тексту в бульбашці, щоб змінити його. Перетягуй бульбашку за ручку. Готово: Коли історія готова, збережи її або роздрукуй.",
            tr: "Çizgi Roman Stüdyosu rehberi. Fotoğraf: Fotoğraf çekmek için her çerçevedeki mavi kamera düğmesine bas. Metin: Değiştirmek için konuşma balonundaki yazıya dokun. Balonu mavi koldan sürükle. Bitti mi: Hikayen bitince kaydedebilir veya yazdırabilirsin.",
            ar: "تعليمات استوديو القصص المصورة. الصور: اضغط زر الكاميرا الأزرق في كل إطار لالتقاط صورة. النص: اضغط على الكلام في الفقاعة لتعديله، وحركها بالمقبض الأزرق. انتهيت: احفظ قصتك أو اطبعها."
        },
        app_magic: {
            de: "Anleitung für Zauber Selfie. Wähle links einen Hintergrund. Drücke unten auf ZAUBERN. Stell dich vor die Kamera, und schwupps bist du in einer anderen Welt!",
            en: "Instructions for Magic Selfie. Choose a background on the left. Tap MAGIC below. Stand in front of the camera, and presto, you are in another world!",
            uk: "Інструкція для Чарівного Селфі. Обери фон ліворуч. Натисни ЧАКЛУВАТИ внизу. Стань перед камерою — і вмить опинишся в іншому світі!",
            tr: "Sihirli Özçekim rehberi. Soldan bir arka plan seç. Alttaki SİHİR düğmesine bas. Kameranın önüne geç ve bir anda başka bir dünyadasın!",
            ar: "تعليمات السيلفي السحري. اختر خلفية من اليسار. اضغط زر السحر في الأسفل. قف أمام الكاميرا، وفجأة ستصبح في عالم آخر!"
        },
        app_news: {
            de: "Anleitung für das Nachrichten Studio. Schlagzeile: Tippe auf den Text im Bild, um ihn zu ändern. Laufschrift: Tippe auf den gelben Balken für einen eigenen Ticker.",
            en: "Instructions for News Studio. Headline: Tap the text on screen to change it. News ticker: Tap the yellow banner for your own ticker message.",
            uk: "Інструкція для Студії Новин. Заголовок: Торкнися тексту на екрані, щоб змінити його. Рухомий рядок: Натисни на жовту смугу для власного повідомлення.",
            tr: "Haber Stüdyosu rehberi. Manşet: Değiştirmek için ekrandaki metne dokun. Kayan yazı: Kendi haber bandını yazmak için sarı çubuğa dokun.",
            ar: "تعليمات استوديو الأخبار. العنوان: اضغط على النص لتغييره. الشريط الإخباري: اضغط على الشريط الأصفر لكتابة خبرك الخاص."
        },
        app_gif: {
            de: "Anleitung für den Video Loop. Erstens: Wähle links einen Filter. Zweitens: Drücke unten auf ACTION. Drittens: Nach der Aufnahme kannst du rechts das Tempo ändern. Viertens: Mit dem runden Pfeil wechselst du die Kamera.",
            en: "Instructions for Video Loop. First: Choose a filter on the left. Second: Tap ACTION below. Third: After recording, change speed on the right. Fourth: Tap the circle arrow to switch cameras.",
            uk: "Інструкція для Відео-Петлі. Перше: Обери фільтр ліворуч. Друге: Натисни СТАРТ унизу. Третє: Після запису обери швидкість праворуч. Четверте: Кругла стрілка перемикає камеру.",
            tr: "Video Döngüsü rehberi. Birinci: Soldan bir filtre seç. İkinci: Alttaki EYLEM düğmesine bas. Üçüncü: Çekimden sonra sağdan hızı ayarla. Dördüncü: Dairesel okla kamerayı değiştir.",
            ar: "تعليمات حلقة الفيديو. أولاً: اختر مؤثراً من اليسار. ثانياً: اضغط زر الحركة في الأسفل. ثالثاً: بعد التسجيل يمكنك تغيير السرعة من اليمين. رابعاً: السهم الدائري لتبديل الكاميرا."
        },
        app_rec: {
            de: "Anleitung für den Stimmenwandler. Nimm links oder rechts etwas auf. Drücke auf Stopp. Jetzt passiert Magie! Wähle das Monster oder die Maus. Hör es dir an!",
            en: "Instructions for Voice Changer. Record on the left or right. Tap Stop. Now magic happens! Choose the monster or the mouse. Listen to it!",
            uk: "Інструкція для Зміни Голосу. Запиши звук ліворуч або праворуч. Натисни Стоп. Тепер починається магія! Обери монстра або мишку і послухай!",
            tr: "Ses Değiştirici rehberi. Solda veya sağda kayıt yap. Dura bas. Şimdi sihir zamanı! Canavarı veya fareyi seç. Dinle ve eğlen!",
            ar: "تعليمات مغير الصوت. سجل صوتك في اليمين أو اليسار. اضغط إيقاف. والآن يبدأ السحر! اختر صوت الوحش أو الفأر واستمع إليه!"
        },
        app_stopmotion: {
            de: "Willkommen im Trickfilm Studio! Hier bist du die Film-Regisseurin oder der Film-Regisseur und erweckst deine Spielzeuge und Knetfiguren zum Leben! Wie das geht? Ein Film entsteht, wenn du viele Fotos machst und die Figuren dazwischen immer ein kleines Stückchen weiterbewegst. Erstens: Baue deine Figuren auf. Zweitens: Knipse ein Foto mit dem großen roten Knopf. Drittens: Bewege deine Figur ein winziges Stück. Das Geisterbild hilft dir dabei! Viertens: Knipse wieder ein Foto und wiederhole das ganz oft. Fünftens: Nimm Stimmen oder lustige Geräusche mit dem Mikrofon auf. Und sechstens: Tippe auf Film Abspielen und staune, wie sich alles wie durch Zauberei bewegt! Du kannst deinen Film auch als echtes Daumenkino ausdrucken.",
            en: "Welcome to the Stop Motion Studio! Here you are the movie director and bring your toys and clay figures to life! How does it work? A movie happens when you take lots of pictures and move your characters a tiny bit in between. First: Set up your figures. Second: Snap a photo with the big red button. Third: Move your figure a tiny bit. The ghost image guides you! Fourth: Snap another photo and repeat many times. Fifth: Record voices or funny sounds with the microphone. And sixth: Tap Play Movie and watch everything move like magic! You can also print your movie as a real flipbook.",
            uk: "Ласкаво просимо до Мульт-Студії! Тут ти справжній режисер і можеш оживити свої іграшки чи пластилін! Як це працює? Мультфільм виходить, коли робиш багато фото і потроху рухаєш фігурки між ними. Перше: Розстав фігурки. Друге: Зроби знімок великою червоною кнопкою. Третє: Посунь фігурку на крихітку. Примарний кадр допоможе тобі! Четверте: Зроби наступний знімок і повтори багато разів. П'яте: Запиши голос або кумедні звуки на мікрофон. І шосте: Натисни Відтворити і дивись, як усе оживає як за помахом чарівної палички! Ти також можеш роздрукувати свій мультик як книжечку-фліпбук.",
            tr: "Çizgi Film Stüdyosuna hoş geldin! Burada yönetmen sensin ve oyuncaklarını canlandırabilirsin! Nasıl mı? Çok sayıda fotoğraf çekip aralarda figürleri minik adımlarla hareket ettirerek bir film oluşur. Birinci: Figürlerini yerleştir. İkinci: Büyük kırmızı düğmeyle fotoğraf çek. Üçüncü: Figürünü azıcık hareket ettir. Hayalet görüntü sana yardım eder! Dördüncü: Tekrar çek ve bunu bolca tekrarla. Beşinci: Mikrofonla sesler kaydet. Ve altıncı: Filmi Oynata bas ve her şeyin sihir gibi hareket etmesini izle! Filmini hareketli kitapçık olarak da yazdırabilirsin.",
            ar: "أهلاً بك في استوديو أفلام الكرتون! هنا أنت المخرج السينمائي وستبعث الحياة في ألعابك ومجسمات الصلصال! كيف يتم ذلك؟ ينشأ الفيلم عند التقاط العديد من الصور مع تحريك المجسمات قليلاً بين كل لقطة. أولاً: رتب ألعابك. ثانياً: التقط صورة بالزر الأحمر الكبير. ثالثاً: حرك المجسم مسافة صغيرة جداً، وستساعدك الصورة الشفافة! رابعاً: التقط صورة أخرى وكرر ذلك مرات عديدة. خامساً: سجل أصواتاً مرحة بالميكروفون. سادساً: اضغط تشغيل الفيلم وشاهد كيف تتحرك الأشياء بالسحر! يمكنك أيضاً طباعة الفيلم كدفتر متحرك."
        },
        app_info: {
            de: "Info. Medienpädagogische Station für Kitas und Grundschulen. Die Apps: Musik Labor, Mikro Check, Video Loop, Zauber Selfie, Pixel Art, Nachrichten Studio, Comic Story und Trickfilm Studio.",
            en: "Info. Media education station for kindergartens and elementary schools. The apps: Music Lab, Voice Lab, Video Loop, Magic Selfie, Pixel Art, News Studio, Comic Story, and Stop Motion Studio.",
            uk: "Інформація. Медіаосвітня станція для дитячих садків та початкових шкіл. Додатки: Музична Лабораторія, Мікро Чек, Відео-Петля, Чарівне Селфі, Піксель Арт, Студія Новин, Комікс та Мульт-Студія.",
            tr: "Bilgi. Anaokulları ve ilkokullar için medya eğitim istasyonu. Uygulamalar: Müzik Laboratuvarı, Mikrofon Kontrol, Video Döngüsü, Sihirli Özçekim, Piksel Sanatı, Haber Stüdyosu, Çizgi Roman ve Çizgi Film Stüdyosu.",
            ar: "معلومات. محطة التربية الإعلامية لرياض الأطفال والمدارس الابتدائية. التطبيقات: مختبر الموسيقى، فحص الميكروفون، حلقة الفيديو، السيلفي السحري، فن البكسل، استوديو الأخبار، القصص المصورة واستوديو الرسوم المتحركة."
        },
        print_prompt: {
            de: "Gleich geht es los. Wähle im nächsten Menü euren Drucker oder eure Druck-App aus.",
            en: "Here we go! Choose your printer or print app in the next menu.",
            uk: "Зараз розпочнемо! У наступному меню обери свій принтер або додаток для друку.",
            tr: "Hemen başlıyor! Bir sonraki menüden yazıcınızı veya yazdırma uygulamanızı seçin.",
            ar: "سنبدأ الآن! اختر طابعتك أو تطبيق الطباعة من القائمة التالية."
        },
        cam_pause: {
            de: "Hoppla! Die Kamera macht gerade Pause! Bitte frag eine Fachkraft.",
            en: "Oops! The camera is taking a break. Please ask an educator.",
            uk: "Ой! Камера зараз відпочиває. Будь ласка, звернись до вихователя.",
            tr: "Hoppala! Kamera şu an dinleniyor. Lütfen bir öğretmene danışın.",
            ar: "عفواً! الكاميرا في استراحة مؤقتة. يرجى سؤال المعلم."
        },
        mission_badge: {
            de: "🎯 DEINE MISSION",
            en: "🎯 YOUR MISSION",
            uk: "🎯 ТВОЯ МІСІЯ",
            tr: "🎯 GÖREVİN",
            ar: "🎯 مهمتك"
        },
        mission_btn: {
            de: "🎲 NEUE MISSION WÜRFELN",
            en: "🎲 ROLL NEW MISSION",
            uk: "🎲 НОВА МІСІЯ",
            tr: "🎲 YENİ GÖREV",
            ar: "🎲 مهمة جديدة"
        },
        mission_default: {
            de: "Wähle eine App! 👉",
            en: "Choose an app! 👉",
            uk: "Обери додаток! 👉",
            tr: "Bir uygulama seç! 👉",
            ar: "اختر تطبيقاً! 👉"
        }
    };

    window.MISSIONS_I18N = [
        { de: "Erstelle ein Geräusch: Kälte ❄️", en: "Make a sound: Cold ❄️", uk: "Створи звук: Холод ❄️", tr: "Bir ses üret: Soğuk ❄️", ar: "اصنع صوتاً: البرد ❄️" },
        { de: "Comic: Streit ums Brot 🥪", en: "Comic: Fight over bread 🥪", uk: "Комікс: Суперечка за хліб 🥪", tr: "Çizgi roman: Ekmek kavgası 🥪", ar: "قصة مصورة: نزاع على الخبز 🥪" },
        { de: "Zauber Selfie: Auf dem Mond 🚀", en: "Magic Selfie: On the moon 🚀", uk: "Чарівне Селфі: На місяці 🚀", tr: "Sihirli Özçekim: Ayda 🚀", ar: "سيلفي سحري: على سطح القمر 🚀" },
        { de: "Werbung: Unsichtbare Socken 🧦", en: "Commercial: Invisible socks 🧦", uk: "Реклама: Невидимі шкарпетки 🧦", tr: "Reklam: Görünmez çoraplar 🧦", ar: "إعلان: الجوارب الخفية 🧦" },
        { de: "Video Loop: Hallo ohne Worte 👋", en: "Video Loop: Hello without words 👋", uk: "Відео-Петля: Привіт без слів 👋", tr: "Video Döngüsü: Sözsüz merhaba 👋", ar: "حلقة فيديو: مرحباً بدون كلمات 👋" },
        { de: "Witz in 3 Bildern 🤡", en: "A joke in 3 pictures 🤡", uk: "Жарт у 3 картинках 🤡", tr: "3 resimde bir fıkra 🤡", ar: "نكتة في 3 صور 🤡" },
        { de: "Zauber Selfie: Fliegen ✨", en: "Magic Selfie: Flying ✨", uk: "Чарівне Селфі: Політ ✨", tr: "Sihirli Özçekim: Uçmak ✨", ar: "سيلفي سحري: الطيران ✨" },
        { de: "Elefant mit Schluckauf 🐘", en: "Elephant with hiccups 🐘", uk: "Слон із гикавкою 🐘", tr: "Hıçkıran fil 🐘", ar: "فيل يعاني من الحازوقة 🐘" },
        { de: "Pixel-Monster Haustier 👾", en: "Pixel monster pet 👾", uk: "Піксельний монстрик-улюбленець 👾", tr: "Piksel canavar evcil hayvan 👾", ar: "وحش بكسل أليف 👾" },
        { de: "Nachrichten: Ufo gelandet 👽", en: "News: UFO landed 👽", uk: "Новини: НЛО приземлилося 👽", tr: "Haberler: UFO indi 👽", ar: "أخبار: هبوط طبق طائر 👽" },
        { de: "Such etwas Rotes & mach ein Foto 🔴", en: "Find something red & snap a photo 🔴", uk: "Знайди щось червоне та сфотографуй 🔴", tr: "Kırmızı bir şey bul ve fotoğraf çek 🔴", ar: "ابحث عن شيء أحمر والتقط صورة 🔴" },
        { de: "Erzähle einen Witz ins Mikro 🎤", en: "Tell a joke into the microphone 🎤", uk: "Розкажи жарт у мікрофон 🎤", tr: "Mikrofona bir fıkra anlat 🎤", ar: "أخبر نكتة في الميكروفون 🎤" },
        { de: "Zeichne dein Lieblingstier 🎨", en: "Draw your favorite animal 🎨", uk: "Намалюй улюблену тварину 🎨", tr: "En sevdiğin hayvanı çiz 🎨", ar: "ارسم حيوانك المفضل 🎨" },
        { de: "Mache ein gruseliges Gesicht 🧟", en: "Make a scary face 🧟", uk: "Зроби страшне обличчя 🧟", tr: "Korkunç bir yüz ifadesi yap 🧟", ar: "اصنع وجهاً مخيفاً 🧟" },
        { de: "Interviewe jemanden 🎤", en: "Interview someone 🎤", uk: "Візьми в когось інтерв'ю 🎤", tr: "Biriyle röportaj yap 🎤", ar: "أجرِ مقابلة مع شخص ما 🎤" },
        { de: "Erfinde einen Robotertanz 🤖", en: "Invent a robot dance 🤖", uk: "Придумай танець робота 🤖", tr: "Bir robot dansı uydur 🤖", ar: "اخترع رقصة رجل آلي 🤖" },
        { de: "Mach ein Geräusch wie ein Auto 🚗", en: "Make a sound like a car 🚗", uk: "Зроби звук як автомобіль 🚗", tr: "Araba gibi bir ses çıkar 🚗", ar: "اصنع صوتاً مثل السيارة 🚗" },
        { de: "Pixel-Bild: Ein Traumhaus 🏠", en: "Pixel Art: A dream house 🏠", uk: "Піксель-Арт: Будинок мрії 🏠", tr: "Piksel resmi: Hayalindeki ev 🏠", ar: "رسم بكسل: منزل الأحلام 🏠" },
        { de: "Comic: Ein Tag am Strand 🏖️", en: "Comic: A day at the beach 🏖️", uk: "Комікс: День на пляжі 🏖️", tr: "Çizgi roman: Sahilde bir gün 🏖️", ar: "قصة مصورة: يوم على الشاطئ 🏖️" },
        { de: "Nachrichten: Es regnet Süßigkeiten 🍬", en: "News: It's raining candy 🍬", uk: "Новини: Дощ із солодощів 🍬", tr: "Haberler: Şeker yağıyor 🍬", ar: "أخبار: السماء تمطر حلوى 🍬" }
    ];

    window.t = function(textOrKey, targetLang) {
        if (!textOrKey) return '';
        const lang = targetLang || window.getLanguage();
        if (lang === 'de' && !window.MedienStation_i18n[textOrKey]) {
            return textOrKey;
        }

        // 1. Direkter Key
        if (window.MedienStation_i18n[textOrKey] && window.MedienStation_i18n[textOrKey][lang]) {
            return window.MedienStation_i18n[textOrKey][lang];
        }

        // 2. Signatur-Erkennung bei deutschen Texten
        const str = String(textOrKey).trim();
        if (str.startsWith('Anleitung für das Pixel Labor') || str.startsWith('Pixel Labor')) {
            return window.MedienStation_i18n.app_pixel[lang] || textOrKey;
        }
        if (str.startsWith('Anleitung für das Musik Labor') || str.startsWith('Musik Labor')) {
            return window.MedienStation_i18n.app_sound[lang] || textOrKey;
        }
        if (str.startsWith('Anleitung für das Comic Studio') || str.startsWith('Comic Studio')) {
            return window.MedienStation_i18n.app_comic[lang] || textOrKey;
        }
        if (str.startsWith('Anleitung für Zauber Selfie') || str.startsWith('Zauber Selfie')) {
            return window.MedienStation_i18n.app_magic[lang] || textOrKey;
        }
        if (str.startsWith('Anleitung für das Nachrichten Studio') || str.startsWith('Nachrichten Studio')) {
            return window.MedienStation_i18n.app_news[lang] || textOrKey;
        }
        if (str.startsWith('Anleitung für den Video Loop') || str.startsWith('Video Loop')) {
            return window.MedienStation_i18n.app_gif[lang] || textOrKey;
        }
        if (str.startsWith('Anleitung für den Stimmenwandler') || str.startsWith('Stimmenwandler') || str.startsWith('Mikro Check')) {
            return window.MedienStation_i18n.app_rec[lang] || textOrKey;
        }
        if (str.startsWith('Willkommen im Trickfilm Studio') || str.startsWith('Trickfilm Studio')) {
            return window.MedienStation_i18n.app_stopmotion[lang] || textOrKey;
        }
        if (str.startsWith('Info. Medienpädagogische Station') || str.startsWith('Info.')) {
            return window.MedienStation_i18n.app_info[lang] || textOrKey;
        }
        if (str.startsWith('Gleich geht es los')) {
            return window.MedienStation_i18n.print_prompt[lang] || textOrKey;
        }
        if (str.includes('Kamera macht gerade Pause') || str.includes('Kamera macht Pause')) {
            return window.MedienStation_i18n.cam_pause[lang] || textOrKey;
        }
        if (str.startsWith('Wähle eine App')) {
            return window.MedienStation_i18n.mission_default[lang] || textOrKey;
        }

        // 3. Missions-Matching
        const missionMatch = window.MISSIONS_I18N.find(m => {
            return m.de === str || str.includes(m.de.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim());
        });
        if (missionMatch && missionMatch[lang]) {
            return missionMatch[lang];
        }

        return textOrKey;
    };

    window.speakText = function(text, eventOrBtn) {
        let btn = null;
        if (eventOrBtn) {
            if (eventOrBtn.stopPropagation) {
                eventOrBtn.stopPropagation();
                btn = eventOrBtn.currentTarget || eventOrBtn.target;
            } else if (eventOrBtn.nodeType) {
                btn = eventOrBtn;
            }
        }
        if (window.resetIdleTimer) window.resetIdleTimer();
        if (window.triggerHapticFeedback) window.triggerHapticFeedback([30]);
        
        const mult = (typeof window.getVolumeMultiplier === 'function') ? window.getVolumeMultiplier() : 1.0;
        if (mult <= 0.0) return; // Stumm / Ruhezeit aktiv

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            if (window.speechSynthesis.resume) window.speechSynthesis.resume(); // Android Warteschlange aufwecken
            
            const currentLang = window.getLanguage();
            const langConfig = window.LANGUAGES[currentLang] || window.LANGUAGES.de;
            const translatedText = window.t(text, currentLang);

            // Emojis filtern, damit sie nicht laut vorgelesen werden ("Lächelndes Gesicht mit Schweißperle...")
            const cleanText = String(translatedText).replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
            
            try {
                // Globale Referenz, damit der Garbage Collector die Sprachausgabe nicht abbricht
                window.currentUtterance = new SpeechSynthesisUtterance(cleanText);
                window.currentUtterance.volume = Math.max(0, Math.min(1, mult));
                window.currentUtterance.lang = langConfig.code;
                
                // Sprachspezifische Geschwindigkeit & Tonhöhe
                if (currentLang === 'uk' || currentLang === 'ar') {
                    window.currentUtterance.rate = 0.88;
                    window.currentUtterance.pitch = 1.05;
                } else {
                    window.currentUtterance.rate = 0.9;
                    window.currentUtterance.pitch = 1.1;
                }

                // Passende Stimme auswählen, falls im Browser vorhanden
                const voices = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
                if (voices && voices.length > 0) {
                    const match = voices.find(v => v.lang && (v.lang.toLowerCase() === langConfig.code.toLowerCase() || v.lang.toLowerCase().startsWith(langConfig.voicePrefix)));
                    if (match) window.currentUtterance.voice = match;
                }

                if (btn) btn.classList.add('animate-pulse');

                window.currentUtterance.onend = () => { if (btn) btn.classList.remove('animate-pulse'); };
                window.currentUtterance.onerror = () => { if (btn) btn.classList.remove('animate-pulse'); };
                
                // Synchron im Klick-Event ausführen
                window.speechSynthesis.speak(window.currentUtterance);
            } catch (err) {
                console.error("Fehler beim Vorlesen:", err);
                if (btn) btn.classList.remove('animate-pulse');
            }
        }
    };

    window.initAppLanguageSwitcher = function() {
        // Falls wir auf index.html sind, übernimmt das Hauptmenü
        if (document.getElementById('main-lang-bar')) return;
        
        const speakBtns = document.querySelectorAll('button[title*="Vorlesen"], button[title*="vorlesen"]');
        if (!speakBtns || speakBtns.length === 0) return;

        speakBtns.forEach(speakBtn => {
            if (speakBtn.parentElement && speakBtn.parentElement.querySelector('.app-lang-pill-wrap')) return;

            const currentLang = window.getLanguage();
            const langConfig = window.LANGUAGES[currentLang] || window.LANGUAGES.de;

            const wrap = document.createElement('div');
            wrap.className = 'app-lang-pill-wrap relative inline-flex items-center shrink-0 mr-2 sm:mr-3';
            if (speakBtn.classList.contains('ml-auto')) {
                speakBtn.classList.remove('ml-auto');
                wrap.classList.add('ml-auto');
            }

            const pill = document.createElement('button');
            pill.type = 'button';
            pill.className = 'app-lang-pill bg-slate-800/90 hover:bg-slate-700 text-white font-black text-xs sm:text-sm px-2.5 sm:px-3 py-1.5 rounded-full border border-slate-500 shadow-md flex items-center gap-1 active:scale-95 transition-all cursor-pointer';
            pill.innerHTML = `<span>${langConfig.flag}</span><span class="text-[10px] sm:text-xs font-black">${langConfig.label}</span>`;
            pill.title = `Sprache: ${langConfig.name} (Tippen zum Wechseln)`;

            const popover = document.createElement('div');
            popover.className = 'app-lang-popover hidden absolute top-full right-0 mt-2 bg-slate-900/95 backdrop-blur-md border border-slate-600 rounded-2xl p-1.5 shadow-2xl flex flex-col gap-1 z-[999999] min-w-[130px]';

            Object.keys(window.LANGUAGES).forEach(lKey => {
                const l = window.LANGUAGES[lKey];
                const opt = document.createElement('button');
                opt.type = 'button';
                opt.className = `flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black text-left transition-all cursor-pointer ${lKey === currentLang ? 'bg-amber-400 text-slate-950' : 'text-slate-200 hover:bg-slate-800'}`;
                opt.innerHTML = `<span class="text-base">${l.flag}</span> <span>${l.name}</span>`;
                opt.onclick = (e) => {
                    e.stopPropagation();
                    window.setLanguage(lKey, false);
                    popover.classList.add('hidden');
                    popover.querySelectorAll('button').forEach(b => {
                        b.className = 'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black text-left transition-all cursor-pointer text-slate-200 hover:bg-slate-800';
                    });
                    opt.className = 'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black text-left transition-all cursor-pointer bg-amber-400 text-slate-950';
                    // Sofort in der neuen Sprache vorlesen
                    speakBtn.click();
                };
                popover.appendChild(opt);
            });

            pill.onclick = (e) => {
                e.stopPropagation();
                popover.classList.toggle('hidden');
            };

            document.addEventListener('click', () => {
                if (!popover.classList.contains('hidden')) popover.classList.add('hidden');
            });

            wrap.appendChild(pill);
            wrap.appendChild(popover);

            speakBtn.parentNode.insertBefore(wrap, speakBtn);
        });
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

    // --- 12. Direkte, Ausfallsichere IndexedDB Storage Engine für Meisterwerke (DSGVO-konform, Offline-PWA) ---
    const DB_NAME = 'MedienStationDB_v5';
    const DB_VERSION = 1; // Saubere v1 ohne Schema-Konflikte
    const STORE_NAME = 'meisterwerke';
    const MAX_GALLERY_ITEMS = 40;

    let dbPromise = null;
    function getDB() {
        if (dbPromise) return dbPromise;
        dbPromise = new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                return reject(new Error('IndexedDB not supported'));
            }
            let req;
            try {
                req = window.indexedDB.open(DB_NAME, DB_VERSION);
            } catch(e) {
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
                    return reject(new Error('ObjectStore meisterwerke missing'));
                }
                resolve(db);
            };

            req.onblocked = () => {
                console.warn('[MedienStation] DB open blocked (waiting for older connection to close)...');
            };

            req.onerror = (e) => {
                reject((e.target ? e.target.error : e) || new Error('IDB open failed'));
            };
        }).catch(err => {
            dbPromise = null;
            throw err;
        });
        return dbPromise;
    }

    // Speichern in Synchron-Storage + IndexedDB (DSGVO-konform & Quota-Safe)
    window.saveToMeisterwerke = async function(item) {
        if (!item) return item;
        const dataUri = item.dataUrl || item.data || item.url;
        if (!dataUri) return item;

        item.id = item.id || ('mw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
        item.timestamp = item.timestamp || Date.now();
        item.type = item.type || 'image';
        item.appName = item.appName || 'KUNSTWERK';
        item.dataUrl = dataUri;

        // 1. SOFORTIGE SYNCHRONE SICHERUNG (< 1 ms) in localStorage & sessionStorage vor jedem await (schützt vor Navigation-Abort beim Verlassen der App)
        const updateSyncStorage = (currentItem) => {
            try {
                let list = [];
                const raw = localStorage.getItem(MEISTER_KEY);
                if (raw) { try { list = JSON.parse(raw); } catch(e) { list = []; } }
                if (!Array.isArray(list)) list = [];

                list = list.filter(it => it && it.id !== currentItem.id && it.dataUrl !== currentItem.dataUrl);
                list.unshift(currentItem);
                if (list.length > MAX_GALLERY_ITEMS) list = list.slice(0, MAX_GALLERY_ITEMS);

                let jsonStr = JSON.stringify(list);
                try {
                    localStorage.setItem(MEISTER_KEY, jsonStr);
                } catch(e) {
                    // Falls Quota in localStorage überschritten wird: Ältere Items im localStorage kürzen
                    while (list.length > 1) {
                        list.pop();
                        try {
                            jsonStr = JSON.stringify(list);
                            localStorage.setItem(MEISTER_KEY, jsonStr);
                            break;
                        } catch(e2) {}
                    }
                }
                try { sessionStorage.setItem(MEISTER_KEY, jsonStr); } catch(e) {}
            } catch(lErr) {
                console.warn('[MedienStation] Sync save warning:', lErr);
            }
        };

        // Sofort ausführen noch vor Bild-Komprimierung oder IndexedDB Async-Operationen
        updateSyncStorage(item);

        // 2. Bild schnell komprimieren (für sparsamen Speicherverbrauch)
        try {
            if (item.type === 'image' || (item.dataUrl && item.dataUrl.startsWith('data:image'))) {
                if (item.dataUrl.length > 80000) {
                    const compressed = await compressImageDataUrlFast(item.dataUrl, 800, 0.75);
                    if (compressed && compressed !== item.dataUrl) {
                        item.dataUrl = compressed;
                        // Synchronen Storage mit komprimierter Version aktualisieren
                        updateSyncStorage(item);
                    }
                }
            }
        } catch (cErr) {
            console.warn('[MedienStation] Komprimierungswarnung:', cErr);
        }

        // 3. Dauerhaft in IndexedDB schreiben
        try {
            const dbTimeout = new Promise((_, rej) => setTimeout(() => rej(new Error('IDB Timeout')), 8000));
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
            console.warn('[MedienStation] IndexedDB save warning (Sync-Storage Backup geschützt):', e);
        }

        try {
            window.dispatchEvent(new CustomEvent('meisterwerke-updated', { detail: item }));
        } catch(evErr) {}

        if (window.triggerHapticFeedback) window.triggerHapticFeedback([30, 50, 30]);
        try { if (window.playSound) window.playSound('success'); } catch(e) {}
        if (window.showCustomAlert) {
            window.showCustomAlert('🎨 In Galerie gespeichert!');
        }
        if (window.triggerCelebration) window.triggerCelebration();
        return item;
    };

    // --- Kindgerechtes / Fachkraft Toast-Alert-System ---
    window.showCustomAlert = function(msg, icon = 'ℹ️') {
        try {
            let box = document.getElementById('custom-alert-box');
            if (!box) {
                box = document.createElement('div');
                box.id = 'custom-alert-box';
                box.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 99999999; max-width: 90%; background-color: #1e293b; border: 2px solid #3b82f6; box-shadow: 0 10px 35px rgba(0,0,0,0.85); border-radius: 1rem; padding: 12px 20px; color: white; display: flex; align-items: center; gap: 12px; pointer-events: none; transition: all 0.3s ease; opacity: 0;';
                document.body.appendChild(box);
            }
            box.innerHTML = `<span style="font-size: 26px; line-height: 1;">${icon}</span><span style="font-weight: 800; font-size: 15px;">${msg}</span>`;
            box.style.opacity = '1';
            box.style.transform = 'translateX(-50%) translateY(0)';
            clearTimeout(box._timer);
            box._timer = setTimeout(() => {
                box.style.opacity = '0';
                box.style.transform = 'translateX(-50%) translateY(-20px)';
            }, 3200);
        } catch(e) {
            console.log('[Alert]', msg);
        }
    };

    // --- Haptisches Feedback (Vibration) für Mobilgeräte & Tablets ---
    window.triggerHapticFeedback = function(pattern) {
        try {
            if ('vibrate' in navigator) {
                navigator.vibrate(pattern || [40]);
            }
        } catch(e) {}
    };

    // --- Kindgerechtes Kamera-Fehler & Berechtigungs-Overlay ---
    window.handleCamError = function(err, containerOrVideoEl, retryFn) {
        console.warn('[MedienStation] Kamera-Fehler:', err);
        let target = null;
        if (typeof containerOrVideoEl === 'string') {
            target = document.getElementById(containerOrVideoEl);
        } else {
            target = containerOrVideoEl;
        }
        if (!target) return;

        const parent = target.parentElement || target;
        let overlay = parent.querySelector('.cam-error-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'cam-error-overlay absolute inset-0 bg-slate-900/95 z-50 flex flex-col items-center justify-center p-6 text-center text-white rounded-2xl select-none';
            parent.style.position = 'relative';
            parent.appendChild(overlay);
        }

        const isDenied = err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
        const title = isDenied ? 'Kamera ist blockiert! 🔒' : 'Kamera nicht gefunden! 📷';
        const msg = isDenied 
            ? 'Bitte erlaube den Kamera-Zugriff in den Einstellungen deines Browsers oder Geräts.' 
            : 'Bitte überprüfe, ob eine Kamera angeschlossen oder in den System-Einstellungen aktiviert ist.';

        overlay.innerHTML = `
            <div class="text-6xl mb-3 animate-bounce">📷</div>
            <h3 class="text-xl md:text-2xl font-black text-amber-400 mb-2">${title}</h3>
            <p class="text-sm md:text-base font-bold text-slate-300 max-w-sm mb-6">${msg}</p>
            <button class="retry-cam-btn bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-full text-base shadow-xl active:scale-95 transition cursor-pointer">
                🔄 Erneut versuchen
            </button>
        `;

        const btn = overlay.querySelector('.retry-cam-btn');
        if (btn) {
            btn.onclick = (e) => {
                e.stopPropagation();
                if (window.triggerHapticFeedback) window.triggerHapticFeedback([40]);
                overlay.remove();
                if (typeof retryFn === 'function') retryFn();
            };
        }
    };

    // Lesen aus IndexedDB + Backups + Auto-Migration
    window.getMeisterwerke = async function(callback) {
        let items = [];
        let itemMap = new Map();

        const addItemsToMap = (itemList) => {
            if (!itemList) return;
            let array = [];
            if (Array.isArray(itemList)) {
                array = itemList;
            } else if (typeof itemList === 'object' && itemList !== null) {
                array = Object.values(itemList);
            } else if (typeof itemList === 'string') {
                try {
                    const parsed = JSON.parse(itemList);
                    if (Array.isArray(parsed)) array = parsed;
                    else if (typeof parsed === 'object' && parsed !== null) array = Object.values(parsed);
                } catch(e) {
                    if (itemList.startsWith('data:')) {
                        array = [itemList];
                    }
                }
            }

            array.forEach(it => {
                let obj = null;
                if (typeof it === 'string') {
                    if (it.startsWith('data:')) {
                        obj = {
                            id: 'mw_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
                            dataUrl: it,
                            appName: 'KUNSTWERK',
                            type: it.startsWith('data:audio') ? 'audio' : (it.startsWith('data:video') ? 'video' : 'image'),
                            timestamp: Date.now()
                        };
                    }
                } else if (it && typeof it === 'object') {
                    obj = Object.assign({}, it);
                }

                if (obj && typeof obj === 'object') {
                    const dataUri = typeof obj.dataUrl === 'string' ? obj.dataUrl : 
                                   (typeof obj.data === 'string' ? obj.data : 
                                   (typeof obj.url === 'string' ? obj.url : 
                                   (typeof obj.image === 'string' ? obj.image : 
                                   (typeof obj.src === 'string' ? obj.src : 
                                   (typeof obj.img === 'string' ? obj.img : 
                                   (typeof obj.file === 'string' ? obj.file : 
                                   (typeof obj.base64 === 'string' ? obj.base64 : 
                                   (typeof obj.audioUrl === 'string' ? obj.audioUrl : 
                                   (typeof obj.videoUrl === 'string' ? obj.videoUrl : '')))))))));

                    if (dataUri && dataUri.length > 0) {
                        obj.dataUrl = dataUri;
                        if (!obj.id || typeof obj.id !== 'string') {
                            obj.id = 'mw_' + (obj.timestamp || Date.now()) + '_' + Math.random().toString(36).substr(2, 6);
                        }
                        if (typeof obj.appName !== 'string') obj.appName = 'KUNSTWERK';
                        if (typeof obj.type !== 'string') {
                            obj.type = dataUri.startsWith('data:audio') ? 'audio' : (dataUri.startsWith('data:video') ? 'video' : 'image');
                        }
                        if (typeof obj.timestamp !== 'number') obj.timestamp = Date.now();

                        // Key für Deduplizierung: id -> (appName + timestamp) -> dataUrl
                        const key = obj.id || (obj.appName && obj.timestamp ? `${obj.appName}_${obj.timestamp}` : dataUri);
                        if (!itemMap.has(key)) {
                            itemMap.set(key, obj);
                        }
                    }
                }
            });
        };

        // 1. ZUERST SOFORT (< 1 ms) aus localStorage & sessionStorage lesen
        try {
            const raw = localStorage.getItem(MEISTER_KEY);
            if (raw) {
                const list = JSON.parse(raw);
                addItemsToMap(list);
            }
        } catch(err) {}

        try {
            const rawS = sessionStorage.getItem(MEISTER_KEY);
            if (rawS) {
                const listS = JSON.parse(rawS);
                addItemsToMap(listS);
            }
        } catch(err) {}

        // 2. Aus IndexedDB MedienStationDB_v5 lesen
        let idbSuccess = false;
        try {
            const dbTimeout = new Promise((_, rej) => setTimeout(() => rej(new Error('IDB get Timeout')), 3000));
            const db = await Promise.race([getDB(), dbTimeout]);

            const idbItems = await new Promise((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const req = store.getAll();
                req.onsuccess = (e) => resolve(e.target.result || []);
                req.onerror = () => reject(req.error || new Error('store.getAll failed'));
            });

            addItemsToMap(idbItems);
            idbSuccess = true;
        } catch(e) {
            console.warn('[MedienStation] IndexedDB read warning:', e);
        }

        // 3. Sichere Migration aus älteren DBs falls vorhanden (nur wenn sie wirklich existieren)
        try {
            if (window.indexedDB && typeof window.indexedDB.databases === 'function') {
                const existingDBs = await window.indexedDB.databases().catch(() => []);
                const existingNames = (existingDBs || []).map(d => d.name);
                const legacyToCheck = ['MedienStationDB_v4', 'MedienStationDB_v3', 'MedienStationDB'].filter(n => existingNames.includes(n));
                
                for (const legName of legacyToCheck) {
                    try {
                        const legItems = await new Promise((resolve) => {
                            const t = setTimeout(() => resolve([]), 300);
                            const req = window.indexedDB.open(legName);
                            req.onerror = () => { clearTimeout(t); resolve([]); };
                            req.onsuccess = (ev) => {
                                clearTimeout(t);
                                const ldb = ev.target.result;
                                if (!ldb.objectStoreNames || !ldb.objectStoreNames.contains(STORE_NAME)) {
                                    ldb.close();
                                    return resolve([]);
                                }
                                try {
                                    const tx = ldb.transaction(STORE_NAME, 'readonly');
                                    const gReq = tx.objectStore(STORE_NAME).getAll();
                                    gReq.onsuccess = (ge) => { ldb.close(); resolve(ge.target.result || []); };
                                    gReq.onerror = () => { ldb.close(); resolve([]); };
                                } catch(te) { ldb.close(); resolve([]); }
                            };
                        });
                        if (Array.isArray(legItems) && legItems.length > 0) {
                            addItemsToMap(legItems);
                        }
                    } catch(le) {}
                }
            }
        } catch(migErr) {}

        items = Array.from(itemMap.values());
        items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // Falls IndexedDB erreichbar war, ungespeicherte Items im Hintergrund nach IndexedDB schreiben
        if (idbSuccess && items.length > 0) {
            setTimeout(async () => {
                try {
                    const db = await getDB();
                    const tx = db.transaction(STORE_NAME, 'readwrite');
                    const store = tx.objectStore(STORE_NAME);
                    items.forEach(it => { if (it.id) store.put(it); });
                } catch(e) {}
            }, 300);
        }

        if (typeof callback === 'function') callback(items);
        return items;
    };

    // Persistent Storage Anforderung beim Start
    window.requestPersistentStorage = async function() {
        try {
            if (navigator.storage && navigator.storage.persist) {
                const isPersisted = await navigator.storage.persisted();
                if (!isPersisted) {
                    const result = await navigator.storage.persist();
                    console.log(`[MedienStation] Persistent storage result: ${result}`);
                }
            }
        } catch(e) {
            console.warn('[MedienStation] Persistent storage request error:', e);
        }
    };
    window.requestPersistentStorage();

    // Einzellöschung eines Meisterwerks
    window.deleteMeisterwerk = async function(id, onComplete) {
        if (!id) return;
        try {
            const raw = localStorage.getItem(MEISTER_KEY);
            if (raw) {
                let list = JSON.parse(raw);
                if (Array.isArray(list)) {
                    list = list.filter(it => it && it.id !== id);
                    localStorage.setItem(MEISTER_KEY, JSON.stringify(list));
                }
            }
        } catch(e) {}

        try {
            const rawS = sessionStorage.getItem(MEISTER_KEY);
            if (rawS) {
                let listS = JSON.parse(rawS);
                if (Array.isArray(listS)) {
                    listS = listS.filter(it => it && it.id !== id);
                    sessionStorage.setItem(MEISTER_KEY, JSON.stringify(listS));
                }
            }
        } catch(e) {}

        try {
            const dbTimeout = new Promise((_, rej) => setTimeout(() => rej(new Error('IDB delete Timeout')), 1000));
            const db = await Promise.race([getDB(), dbTimeout]);
            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).delete(id);
            await new Promise((res) => { tx.oncomplete = res; tx.onerror = res; });
            console.log(`[MedienStation] Meisterwerk ${id} gelöscht.`);
        } catch(e) {
            console.warn('[MedienStation] deleteMeisterwerk error:', e);
        }

        if (typeof window.renderMeisterwerkeGrid === 'function') {
            window.renderMeisterwerkeGrid();
        }
        if (typeof onComplete === 'function') onComplete();
    };

    // Legacy-Datenbanken bereinigen, damit gelöschte Werke nicht über Migration zurückkehren
    async function clearLegacyDatabases() {
        try {
            if (!window.indexedDB) return;
            const legacyNames = ['MedienStationDB_v4', 'MedienStationDB_v3', 'MedienStationDB'];
            await Promise.all(legacyNames.map(name => new Promise((resolve) => {
                try {
                    const req = window.indexedDB.deleteDatabase(name);
                    req.onsuccess = resolve;
                    req.onerror = resolve;
                    req.onblocked = resolve;
                } catch(e) { resolve(); }
            })));
        } catch(e) {}
    }

    // Löschen aller Meisterwerke (Galerie leeren)
    window.clearMeisterwerke = async function(onComplete) {
        try { localStorage.removeItem(MEISTER_KEY); } catch(e) {}
        try { sessionStorage.removeItem(MEISTER_KEY); } catch(e) {}

        try {
            const dbTimeout = new Promise((_, rej) => setTimeout(() => rej(new Error('IDB clear Timeout')), 1000));
            const db = await Promise.race([getDB(), dbTimeout]);

            const tx = db.transaction(STORE_NAME, 'readwrite');
            tx.objectStore(STORE_NAME).clear();
            await new Promise((res) => { tx.oncomplete = res; tx.onerror = res; });
            await clearLegacyDatabases();
            console.log('[MedienStation] Galerie geleert.');
        } catch(e) {
            console.warn('[MedienStation] clearMeisterwerke error:', e);
        }
        if (typeof onComplete === 'function') onComplete();
    };

    // Sicheres Drucken eines Meisterwerks nach ID (verhindert riesige Base64 Attribute in HTML)
    window.printMeisterwerk = async function(id) {
        if (!id) return;
        try {
            const items = await window.getMeisterwerke();
            const item = items.find(it => it.id === id);
            if (item && item.dataUrl && window.printImage) {
                window.printImage(item.dataUrl, item.appName);
            }
        } catch(e) {
            console.warn('[MedienStation] printMeisterwerk error:', e);
        }
    };

    // Drucken eines Meisterwerks als DIN A4 Kita-Portfolio-Bogen
    window.printMeisterwerkPortfolio = async function(id) {
        if (!id) return;
        try {
            const items = await window.getMeisterwerke();
            const item = items.find(it => it.id === id);
            if (item && item.dataUrl && window.printPortfolioSheet) {
                window.printPortfolioSheet(item.dataUrl, {
                    appName: item.appName || item.type || 'Meisterwerk',
                    date: item.date || item.timestamp,
                    id: item.id
                });
            } else if (item && item.dataUrl && window.printImage) {
                window.printImage(item.dataUrl, item.appName);
            }
        } catch(e) {
            console.warn('[MedienStation] printMeisterwerkPortfolio error:', e);
        }
    };

    // Fullscreen Lightbox / Großansicht für ein Meisterwerk
    window.viewMeisterwerkDetail = async function(id) {
        const items = await window.getMeisterwerke();
        const item = items.find(it => it.id === id);
        if (!item) return;

        let modal = document.getElementById('meisterwerk-lightbox-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'meisterwerk-lightbox-modal';
            modal.className = 'fixed inset-0 z-[100000] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-between p-4 md:p-8';
            document.body.appendChild(modal);
        }

        const typeLower = (item.type || '').toLowerCase();
        const dataUrl = typeof item.dataUrl === 'string' ? item.dataUrl : '';
        const isVideo = typeLower === 'video' || dataUrl.startsWith('data:video/') || dataUrl.endsWith('.mp4');
        const isAudio = typeLower === 'audio' || dataUrl.startsWith('data:audio/') || dataUrl.endsWith('.mp3') || dataUrl.endsWith('.wav');
        const isImage = !isVideo && !isAudio;
        const appName = item.appName || 'KUNSTWERK';
        const safeId = String(item.id || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const safeAppName = String(appName).replace(/</g, '&lt;').replace(/>/g, '&gt;');

        modal.innerHTML = `
            <div class="w-full max-w-4xl flex items-center justify-between text-white mb-2">
                <span class="text-lg md:text-2xl font-black text-amber-400 uppercase tracking-wider">${safeAppName}</span>
                <button onclick="document.getElementById('meisterwerk-lightbox-modal').style.display='none'" class="bg-slate-800 hover:bg-slate-700 text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold border border-slate-600 active:scale-95 cursor-pointer">
                    ✕
                </button>
            </div>
            <div class="flex-1 w-full max-w-4xl flex items-center justify-center overflow-hidden my-4 relative">
                ${isImage ? `<img src="${dataUrl}" class="max-w-full max-h-[72vh] object-contain rounded-2xl shadow-2xl border-2 border-slate-700">` : ''}
                ${isVideo ? `<video src="${dataUrl}" controls autoplay playsinline class="max-w-full max-h-[72vh] rounded-2xl shadow-2xl"></video>` : ''}
                ${isAudio ? `
                    <div class="flex flex-col items-center justify-center gap-6 bg-slate-800/90 border-2 border-slate-700 rounded-3xl p-8 md:p-12 shadow-2xl">
                        <span class="text-7xl animate-bounce">🎙️</span>
                        <audio src="${dataUrl}" controls autoplay class="w-64 md:w-96 h-12"></audio>
                    </div>
                ` : ''}
            </div>
            <div class="w-full max-w-4xl flex items-center justify-center gap-3 md:gap-4 pt-2 flex-wrap">
                ${isImage && window.printImage ? `
                    <button onclick="window.printMeisterwerk('${safeId}');" class="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-5 rounded-full shadow-xl border-2 border-blue-400 active:scale-95 transition flex items-center gap-2 text-sm md:text-base cursor-pointer">
                        🖨️ Foto drucken
                    </button>
                    <button onclick="window.printMeisterwerkPortfolio('${safeId}');" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-full shadow-xl border-2 border-emerald-400 active:scale-95 transition flex items-center gap-2 text-sm md:text-base cursor-pointer">
                        📄 Portfolio-Bogen (A4)
                    </button>
                ` : ''}
                <button onclick="window.showConfirm('Dieses Kunstwerk löschen?', () => { window.deleteMeisterwerk('${safeId}'); document.getElementById('meisterwerk-lightbox-modal').style.display='none'; }, '🗑️')" class="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-5 rounded-full shadow-xl border-2 border-red-400 active:scale-95 transition flex items-center gap-2 text-sm md:text-base cursor-pointer">
                    🗑️ Werk löschen
                </button>
            </div>
        `;
        modal.style.display = 'flex';

        // Master-Lautstärke auf Audio/Video in der Lightbox anwenden
        const mult = (typeof window.getVolumeMultiplier === 'function') ? window.getVolumeMultiplier() : 1.0;
        modal.querySelectorAll('audio, video').forEach(mediaEl => {
            mediaEl.volume = Math.max(0, Math.min(1, mult));
            mediaEl.muted = (mult <= 0.0);
        });
    };

    window.renderMeisterwerkeGrid = async function() {
        const grid = document.getElementById('meisterwerke-grid');
        const footer = document.getElementById('meisterwerke-footer');
        if (!grid) return;

        try {
            const rawItems = await window.getMeisterwerke();
            const items = Array.isArray(rawItems) ? rawItems.filter(it => {
                if (!it || typeof it !== 'object') return false;
                const uri = it.dataUrl || it.data || it.url || it.image || it.src;
                if (typeof uri === 'string' && uri.length > 0) {
                    it.dataUrl = uri;
                    return true;
                }
                return false;
            }) : [];

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
                const fallbackLogo = isSubApp ? '../assets/logo.png' : 'assets/logo.png';
                grid.innerHTML = items.map((it) => {
                    try {
                        const typeLower = (it.type || '').toLowerCase();
                        const dataUrl = typeof it.dataUrl === 'string' ? it.dataUrl : '';
                        if (!dataUrl) return '';

                        const isVideo = typeLower === 'video' || dataUrl.startsWith('data:video/') || dataUrl.endsWith('.mp4');
                        const isAudio = typeLower === 'audio' || dataUrl.startsWith('data:audio/') || dataUrl.endsWith('.mp3') || dataUrl.endsWith('.wav');
                        const isImage = !isVideo && !isAudio;
                        const appName = typeof it.appName === 'string' ? it.appName : 'KUNSTWERK';
                        const safeId = String(it.id || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                        const safeAppName = String(appName).replace(/</g, '&lt;').replace(/>/g, '&gt;');

                        return `
                        <div class="bg-slate-700/80 border-2 border-slate-600 rounded-2xl p-3 flex flex-col items-center justify-between shadow-lg overflow-hidden group hover:border-amber-400 transition-all relative">
                            <div class="w-full h-36 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center relative mb-2 group/media cursor-pointer" onclick="window.viewMeisterwerkDetail('${safeId}')">
                                ${isImage ? `<img src="${dataUrl}" class="w-full h-full object-contain hover:scale-105 transition-transform" alt="${safeAppName}" onerror="this.onerror=null; this.src='${fallbackLogo}';">` : ''}
                                ${isVideo ? `<video src="${dataUrl}" controls playsinline class="w-full h-full object-contain" onclick="event.stopPropagation()"></video>` : ''}
                                ${isAudio ? `
                                    <div class="flex flex-col items-center justify-center gap-2" onclick="event.stopPropagation()">
                                        <span class="text-5xl">🎙️</span>
                                        <audio src="${dataUrl}" controls class="w-[90%] max-w-[200px] h-8"></audio>
                                    </div>
                                ` : ''}
                                <button onclick="event.stopPropagation(); window.showConfirm('Dieses Kunstwerk löschen?', () => window.deleteMeisterwerk('${safeId}'), '🗑️')" class="absolute top-1.5 right-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg text-sm transition active:scale-95 cursor-pointer z-10" title="Werk löschen">
                                    🗑️
                                </button>
                            </div>
                            <div class="w-full flex items-center justify-between gap-1.5">
                                <span class="text-xs font-bold text-amber-400 uppercase tracking-wider truncate">${safeAppName}</span>
                                ${isImage && window.printImage ? `
                                    <div class="flex items-center gap-1 shrink-0">
                                        <button onclick="event.stopPropagation(); window.printMeisterwerk('${safeId}')" class="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1 px-2 rounded-lg shadow border border-blue-400 active:scale-95 transition flex items-center gap-1 cursor-pointer" title="Foto drucken">
                                            🖨️
                                        </button>
                                        <button onclick="event.stopPropagation(); window.printMeisterwerkPortfolio('${safeId}')" class="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold py-1 px-2 rounded-lg shadow border border-emerald-400 active:scale-95 transition flex items-center gap-1 cursor-pointer" title="DIN A4 Portfolio-Bogen drucken">
                                            📄
                                        </button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                        `;
                    } catch(itErr) {
                        console.warn('[MedienStation] Fehler beim Rendern eines Meisterwerks:', itErr);
                        return '';
                    }
                }).filter(Boolean).join('');

                if (footer) footer.style.display = 'flex';

                // Master-Lautstärke auf Audio/Video-Elemente im Galerie-Grid anwenden
                const mult = (typeof window.getVolumeMultiplier === 'function') ? window.getVolumeMultiplier() : 1.0;
                grid.querySelectorAll('audio, video').forEach(mediaEl => {
                    mediaEl.volume = Math.max(0, Math.min(1, mult));
                    mediaEl.muted = (mult <= 0.0);
                });
            }
            window.updateGalleryInfoText();
        } catch(err) {
            console.warn('[MedienStation] renderMeisterwerkeGrid error:', err);
        }
    };

    window.updateGalleryInfoText = async function() {
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

            // Storage estimate
            if (navigator.storage && navigator.storage.estimate) {
                try {
                    const est = await navigator.storage.estimate();
                    if (est && est.usage) {
                        const mbUsed = (est.usage / (1024 * 1024)).toFixed(1);
                        shortMsg += ` • 💾 ca. ${mbUsed} MB belegt`;
                    }
                } catch(stErr) {}
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

        // Master-Lautstärke auf Audio/Video in der Lightbox anwenden
        const mult = (typeof window.getVolumeMultiplier === 'function') ? window.getVolumeMultiplier() : 1.0;
        modal.querySelectorAll('audio, video').forEach(mediaEl => {
            mediaEl.volume = Math.max(0, Math.min(1, mult));
            mediaEl.muted = (mult <= 0.0);
        });
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
    const VOLUME_KEY = 'medienstation_volume_level';
    const CAMERA_RESTRICT_KEY = 'medienstation_camera_restricted';

    // Lautstärkeregelung für Fachkräfte (Normal, Flüster-Modus, Stumm/Ruhezeit)
    window.getVolumeLevel = function() {
        return localStorage.getItem(VOLUME_KEY) || 'normal';
    };

    window.setVolumeLevel = function(level) {
        const valid = ['normal', 'quiet', 'mute'];
        const val = valid.includes(level) ? level : 'normal';
        localStorage.setItem(VOLUME_KEY, val);
        return val;
    };

    window.getVolumeMultiplier = function() {
        const lvl = window.getVolumeLevel();
        if (lvl === 'mute') return 0.0;
        if (lvl === 'quiet') return 0.35;
        return 1.0;
    };

    // Foto-/Kamera-Apps für Freispiel pausieren (Kinderschutz ohne Fotoerlaubnis)
    window.isCameraRestricted = function() {
        return localStorage.getItem(CAMERA_RESTRICT_KEY) === 'true';
    };

    window.setCameraRestricted = function(restricted) {
        localStorage.setItem(CAMERA_RESTRICT_KEY, restricted ? 'true' : 'false');
        if (typeof window.applyCameraRestrictionsUI === 'function') {
            window.applyCameraRestrictionsUI();
        }
        return window.isCameraRestricted();
    };

    window.isCameraApp = function(urlOrPath) {
        if (!urlOrPath) return false;
        const cameraApps = ['magic.html', 'gif.html', 'news.html', 'comic.html', 'stopmotion.html'];
        return cameraApps.some(app => urlOrPath.includes(app));
    };

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

            // Wenn noch kein Datum gesetzt war: Heute als Start setzen ohne Löschung!
            if (!lastDate) {
                localStorage.setItem(DATE_KEY, today);
                return;
            }

            if (lastDate !== today) {
                // Strenger DSGVO-Tages-Reset: Alle Werke von vorherigen Tagen (< heute 00:00:00 lokal) vollständig löschen
                const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
                const allItems = await window.getMeisterwerke();
                const itemsToKeep = allItems.filter(it => (it && typeof it.timestamp === 'number' && it.timestamp >= startOfToday));

                try {
                    const db = await getDB();
                    const tx = db.transaction(STORE_NAME, 'readwrite');
                    const store = tx.objectStore(STORE_NAME);
                    store.clear();
                    itemsToKeep.forEach(it => { if (it && it.id) store.put(it); });
                    await new Promise((res) => { tx.oncomplete = res; tx.onerror = res; });
                    await clearLegacyDatabases();
                } catch(dbErr) {}

                try {
                    if (itemsToKeep.length === 0) {
                        localStorage.removeItem(MEISTER_KEY);
                        sessionStorage.removeItem(MEISTER_KEY);
                    } else {
                        localStorage.setItem(MEISTER_KEY, JSON.stringify(itemsToKeep));
                        sessionStorage.setItem(MEISTER_KEY, JSON.stringify(itemsToKeep));
                    }
                } catch(lsErr) {}

                localStorage.setItem(DATE_KEY, today);
                console.log(`[MedienStation] Strenger Tages-Reset durchgeführt. ${allItems.length - itemsToKeep.length} Werke vom Vortag gelöscht.`);
            }
        } catch(e) {
            console.warn('[MedienStation] Fehler beim täglichen Galerie-Reset:', e);
        }
    };

    // --- 14. ZIP-Sammel-Export für alle Meisterwerke (Fotos, Videos, Comics, Audio) ---
    window.exportAllMeisterwerkeZip = async function() {
        try {
            // Falls JSZip noch nicht geladen ist: Dynamisch nachladen
            if (typeof JSZip === 'undefined') {
                try {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = isSubApp ? '../js/jszip.min.js' : 'js/jszip.min.js';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                } catch(loadErr) {
                    if (window.showCustomAlert) window.showCustomAlert('ZIP-Bibliothek konnte nicht geladen werden.', '❌');
                    return;
                }
            }

            // Lade-Modal anzeigen (z-index: 99999999 garantiert über ALLEM)
            let modal = document.getElementById('zip-export-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'zip-export-modal';
                document.body.appendChild(modal);
            }
            modal.style.cssText = 'position: fixed; inset: 0; z-index: 99999999; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 16px;';

            modal.innerHTML = `
                <div class="bg-slate-800 border-4 border-blue-500 rounded-[2.5rem] max-w-md w-full p-8 shadow-2xl text-center text-white relative">
                    <button onclick="document.getElementById('zip-export-modal').style.display='none'" class="absolute top-4 right-5 text-2xl text-slate-400 hover:text-white font-black cursor-pointer">✕</button>
                    <div class="text-6xl mb-4 animate-bounce" id="zip-modal-icon">📦</div>
                    <h2 class="text-2xl font-black mb-2" id="zip-modal-title">ZIP-Datei wird erstellt...</h2>
                    <p class="text-slate-300 text-sm font-bold mb-4" id="zip-modal-desc">Bilder und Töne werden verpackt. Bitte einen Moment gedulden.</p>
                    <div id="zip-modal-actions" class="flex flex-col gap-3">
                        <div class="w-full bg-slate-900 rounded-full h-5 overflow-hidden border border-slate-700 p-0.5 relative">
                            <div id="zip-progress-bar" class="bg-gradient-to-r from-blue-500 to-emerald-400 h-full w-0 transition-all duration-150 rounded-full"></div>
                        </div>
                        <span id="zip-progress-percent" class="text-xs font-mono font-bold text-amber-400">0%</span>
                    </div>
                </div>
            `;
            modal.style.display = 'flex';

            const items = await window.getMeisterwerke();
            if (!items || items.length === 0) {
                document.getElementById('zip-modal-icon').innerText = '🎨';
                document.getElementById('zip-modal-title').innerText = 'Galerie ist leer';
                document.getElementById('zip-modal-desc').innerText = 'Es gibt aktuell keine Meisterwerke zum Exportieren.';
                document.getElementById('zip-modal-actions').innerHTML = `
                    <button onclick="document.getElementById('zip-export-modal').style.display='none'" class="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 rounded-xl cursor-pointer">
                        SCHLIESSEN
                    </button>
                `;
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

                let dataUri = typeof item.dataUrl === 'string' ? item.dataUrl : (typeof item.data === 'string' ? item.data : '');
                if (!dataUri) return;

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
                const parts = dataUri.split(',');
                if (parts.length > 1) {
                    folder.file(fileName, parts[1], { base64: true });
                }
            });

            // Metadaten / Übersichtstext beilegen
            const metaInfo = `MedienStation - Gesammelte Meisterwerke\nDatum: ${dateStr}\nAnzahl Werke: ${items.length}\n\n` +
                items.map((it, idx) => `${idx + 1}. [${it.type || 'werk'}] ${it.title || 'Werk'} (${it.appName || ''})`).join('\n');
            folder.file('Uebersicht.txt', metaInfo);

            // Live-Fortschritt bei der ZIP-Generierung (0 bis 100%)
            const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
                const percent = Math.round(metadata.percent || 0);
                const progressBar = document.getElementById('zip-progress-bar');
                const progressText = document.getElementById('zip-progress-percent');
                if (progressBar) progressBar.style.width = percent + '%';
                if (progressText) progressText.innerText = `${percent}%`;
            });

            const zipFileName = `MedienStation_Meisterwerke_${dateStr}.zip`;
            let zipFile = null;
            try {
                zipFile = new File([content], zipFileName, { type: 'application/zip' });
            } catch(fErr) {
                zipFile = content;
            }

            const blobUrl = URL.createObjectURL(content);

            // Modal aktualisieren: Bereit zum Speichern
            document.getElementById('zip-modal-icon').innerText = '✅';
            document.getElementById('zip-modal-title').innerText = `${items.length} Werke bereit!`;
            document.getElementById('zip-modal-desc').innerText = `ZIP-Datei "${zipFileName}" ist gepackt.`;

            const actionsEl = document.getElementById('zip-modal-actions');
            actionsEl.innerHTML = `
                <a id="zip-download-link" href="${blobUrl}" download="${zipFileName}" target="_blank" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-4 rounded-2xl text-base sm:text-lg shadow-xl active:scale-95 transition border-b-4 border-emerald-800 flex items-center justify-center gap-2 cursor-pointer no-underline text-center">
                    <span>📥</span> <span>JETZT AUF TABLET SPEICHERN</span>
                </a>
                ${(navigator.canShare && zipFile instanceof File) ? `
                <button id="zip-share-btn" class="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition">
                    <span>📤</span> <span>Teilen / Per App senden</span>
                </button>
                ` : ''}
                <button onclick="document.getElementById('zip-export-modal').style.display='none'" class="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-2.5 rounded-xl text-sm transition cursor-pointer">
                    ✕ Schließen
                </button>
            `;

            // Klick-Feedback & Feier-Effekt beim Antippen des Download-Links
            const dlLink = document.getElementById('zip-download-link');
            if (dlLink) {
                dlLink.addEventListener('click', () => {
                    if (window.playSound) window.playSound('success');
                    if (window.triggerConfetti) window.triggerConfetti();
                    if (window.showCustomAlert) window.showCustomAlert('📥 Download wurde gestartet!');
                });
            }

            const shareBtn = document.getElementById('zip-share-btn');
            if (shareBtn) {
                shareBtn.addEventListener('click', async () => {
                    if (window.playSound) window.playSound('click');
                    try {
                        await navigator.share({
                            files: [zipFile],
                            title: 'MedienStation Meisterwerke',
                            text: `Gesammelte Kunstwerke (${items.length} Dateien)`
                        });
                        if (window.triggerConfetti) window.triggerConfetti();
                    } catch(shErr) {
                        if (shErr && shErr.name !== 'AbortError') {
                            console.warn('Share error:', shErr);
                        }
                    }
                });
            }

        } catch (err) {
            console.error('[MedienStation] Fehler beim ZIP-Export:', err);
            const modal = document.getElementById('zip-export-modal');
            if (modal) {
                document.getElementById('zip-modal-icon').innerText = '❌';
                document.getElementById('zip-modal-title').innerText = 'Fehler beim Packen';
                document.getElementById('zip-modal-desc').innerText = err.message || 'Die ZIP-Datei konnte nicht erstellt werden.';
                document.getElementById('zip-modal-actions').innerHTML = `
                    <button onclick="document.getElementById('zip-export-modal').style.display='none'" class="w-full bg-red-600 text-white font-bold py-3 rounded-xl cursor-pointer">
                        SCHLIESSEN
                    </button>
                `;
            }
        }
    };

    // --- 16. Eigene Kita-Hintergründe für Zauber Selfie (100% lokal, Offline-PWA) ---
    const CUSTOM_BG_KEY = 'medienstation_custom_backgrounds';
    const MAX_CUSTOM_BGS = 3;

    window.getCustomBackgrounds = function() {
        try {
            const raw = localStorage.getItem(CUSTOM_BG_KEY);
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list)) return list.slice(0, MAX_CUSTOM_BGS);
            }
        } catch(e) {
            console.warn('[MedienStation] Error reading custom backgrounds:', e);
        }
        return [];
    };

    window.compressImageToDataUrl = function(fileOrDataUrl, maxWidth = 1280, maxHeight = 720, quality = 0.82) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                let w = img.naturalWidth || img.width;
                let h = img.naturalHeight || img.height;
                const ratio = Math.min(maxWidth / w, maxHeight / h, 1);
                const targetW = Math.round(w * ratio);
                const targetH = Math.round(h * ratio);

                const canvas = document.createElement('canvas');
                canvas.width = targetW;
                canvas.height = targetH;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, targetW, targetH);
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                img.onload = null;
                img.onerror = null;
                resolve(dataUrl);
            };
            img.onerror = (e) => reject(e);

            if (typeof fileOrDataUrl === 'string') {
                img.src = fileOrDataUrl;
            } else if (fileOrDataUrl instanceof Blob || fileOrDataUrl instanceof File) {
                const reader = new FileReader();
                reader.onload = (re) => { img.src = re.target.result; };
                reader.onerror = (re) => reject(re);
                reader.readAsDataURL(fileOrDataUrl);
            } else {
                reject(new Error('Ungültiges Bild'));
            }
        });
    };

    window.saveCustomBackground = async function(fileOrDataUrl, name = '') {
        try {
            const compressedDataUrl = await window.compressImageToDataUrl(fileOrDataUrl, 1280, 720, 0.82);
            const current = window.getCustomBackgrounds();
            const id = 'custom_' + Date.now();
            const cleanName = (name || '').trim() || ('Kita ' + (current.length + 1));
            const newItem = {
                id: id,
                name: cleanName,
                dataUrl: compressedDataUrl,
                timestamp: Date.now()
            };

            if (current.length >= MAX_CUSTOM_BGS) {
                current.shift(); // Ältestes ersetzen, maximal 3
            }
            current.push(newItem);
            localStorage.setItem(CUSTOM_BG_KEY, JSON.stringify(current));
            return newItem;
        } catch(e) {
            console.error('[MedienStation] saveCustomBackground error:', e);
            throw e;
        }
    };

    window.deleteCustomBackground = function(id) {
        try {
            const current = window.getCustomBackgrounds().filter(it => it.id !== id);
            localStorage.setItem(CUSTOM_BG_KEY, JSON.stringify(current));
            return true;
        } catch(e) {
            console.warn('[MedienStation] deleteCustomBackground error:', e);
            return false;
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

