/**
 * common.js
 * Zentrale Logik für Navigation, Idle-Timer und Modals.
 * Wird in allen HTML-Dateien eingebunden.
 */

(function() {
    // Sicherer Zugriff auf Plugins (verhindert Absturz, wenn cordova.js fehlt)
    const SplashScreen = (window.Capacitor && window.Capacitor.Plugins) ? window.Capacitor.Plugins.SplashScreen : null;
    const IDLE_WARNING_TIME = 9 * 60 * 1000; // 9 Minuten
    const IDLE_RESET_TIME = 60 * 1000; // 1 Minute Vorwarnung
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
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                }
            }
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
                if (isSubApp) {
                    window.goHome();
                } else {
                    const modals = document.querySelectorAll('#admin-modal, #info-modal, #qr-modal');
                    modals.forEach(m => {
                        m.classList.add('hidden');
                        m.classList.remove('flex', 'modal-visible');
                    });
                    const missionText = document.getElementById('mission-text');
                    if(missionText) missionText.innerText = "Wähle eine App! 👉";
                }
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

            // Normale Registrierung (Der "Network-First" Service Worker kümmert sich ab jetzt sicher um Updates)
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

    // --- 8. Vorlese-Funktion (Text-to-Speech) für Kinder ---
    window.speakText = function(text, event) {
        if (event) event.stopPropagation();
        window.resetIdleTimer();
        
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Laufende Sprache abbrechen
            
            // Emojis filtern, damit sie nicht laut vorgelesen werden ("Lächelndes Gesicht mit Schweißperle...")
            const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
            
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'de-DE';
            utterance.rate = 0.9; // Etwas langsamer für Kinder
            utterance.pitch = 1.2; // Etwas hellere, freundlichere Stimme
            window.speechSynthesis.speak(utterance);
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
})();
