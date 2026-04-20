(function() {
    console.log("🔊 AUDIO SYSTEM GESTARTET");

    // 1. Pfad bestimmen
    const isSubApp = window.location.pathname.includes('/apps/');
    // Wir probieren beide Pfade, falls einer falsch ist
    const basePath = isSubApp ? '../assets/sounds/' : 'assets/sounds/'; // Relativ für index.html

    // 2. Sounds laden mit Fehlerprüfung
    const soundNames = ['click', 'shutter', 'success'];
    const audioStore = {};

    soundNames.forEach(name => {
        const fullPath = basePath + name + '.mp3';
        const audio = new Audio();
        
        // Event Listener VOR dem src setzen
        audio.addEventListener('canplaythrough', () => {
            console.log(`✅ Sound geladen: ${name}`);
        });

        audio.addEventListener('error', (e) => {
            console.error(`❌ FEHLER bei Sound ${name}:`, e);
            console.error(`Versuchter Pfad: ${fullPath}`);
            // Versuch: Absoluter Pfad als Fallback für Android
            // Prüfen, ob wir nicht schon den Fallback versucht haben, um Endlosschleifen zu vermeiden
            if (!audio.dataset.retried) {
                console.log("Versuche Fallback-Pfad (Absolut)...");
                audio.dataset.retried = "true";
                // Versuche es mit einem absoluten Pfad, falls der relative fehlschlug
                audio.src = '/assets/sounds/' + name + '.mp3';
                audio.load();
            }
        });

        audio.src = fullPath;
        audio.load();
        audioStore[name] = audio;
    });

    if (audioStore['click']) audioStore['click'].volume = 0.5;
    if (audioStore['shutter']) audioStore['shutter'].volume = 1.0;
    if (audioStore['success']) audioStore['success'].volume = 0.8;

    // 2.1 Pooling für Klick-Sound (Fix für "verschluckte" Sounds)
    // Wir erstellen 5 Kopien im Voraus, um Latenz zu vermeiden
    const clickPool = [];
    const POOL_SIZE = 5;
    let clickPoolIndex = 0;
    
    if (audioStore['click']) {
        for(let i=0; i<POOL_SIZE; i++) {
            const c = audioStore['click'].cloneNode();
            c.volume = audioStore['click'].volume;
            clickPool.push(c);
        }
    }

    // 3. Globale Play Funktion
    window.playSound = function(name) {
        // Optimierung: Klick-Sound aus Pool nehmen
        if (name === 'click' && clickPool.length > 0) {
            const sound = clickPool[clickPoolIndex];
            clickPoolIndex = (clickPoolIndex + 1) % clickPool.length;
            sound.currentTime = 0;
            sound.play().catch(() => {}); // Fehler ignorieren
            return;
        }

        const sound = audioStore[name];
        if (sound) {
            // console.log(`▶️ Spiele: ${name}`);
            const clone = sound.cloneNode();
            clone.volume = sound.volume;
            
            const promise = clone.play();
            if (promise !== undefined) {
                promise.catch(error => {
                    console.warn(`🚫 Autoplay blockiert oder Fehler bei ${name}:`, error);
                });
            }
            
            // Cleanup nach Abspielen
            clone.addEventListener('ended', () => {
                clone.remove();
            }, {once: true});
        } else {
            console.warn(`❓ Unbekannter Sound: ${name}`);
        }
    };

    // 4. Klick-Listener (Event Delegation für maximale Zuverlässigkeit)
    function initButtonSounds() {
        console.log("Init Button Sounds (Delegation Mode)");
        
        let lastTouchTime = 0;
        let touchStartX = 0;
        let touchStartY = 0;

        // Selektor für alle klickbaren Elemente
        const selector = 'button, a, .pad-item, .pad-btn, .color-btn, .fx-btn, .app-card, .bg-selector, [role="button"]';

        const getTarget = (e) => e.target.closest(selector);

        const triggerSound = (btn) => {
            if (btn.dataset.noSound) return;
            const txt = (btn.innerText || "").toUpperCase();
            // Diese Begriffe lösen eigene Sounds aus (z.B. Shutter), daher hier stumm
            const excludedTerms = ['FOTO', 'REC', 'DRUCKEN', 'WÜRFELN'];
            
            if (!excludedTerms.some(term => txt.includes(term))) {
                window.playSound('click');
            }
        };

        // Touch Start: Position merken
        document.addEventListener('touchstart', (e) => {
            const target = getTarget(e);
            if (!target) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, {passive: true});

        // Touch End: Prüfen ob es ein Tap war
        document.addEventListener('touchend', (e) => {
            const target = getTarget(e);
            if (!target) return;

            lastTouchTime = Date.now();
            
            const diffX = Math.abs(e.changedTouches[0].clientX - touchStartX);
            const diffY = Math.abs(e.changedTouches[0].clientY - touchStartY);
            
            // Toleranz erhöht auf 20px (für wackelige Kinderhände)
            if (diffX > 20 || diffY > 20) return;

            triggerSound(target);
        }, {passive: true});

        // Click: Fallback für Maus / Hybrid
        document.addEventListener('click', (e) => {
            const target = getTarget(e);
            if (!target) return;

            // Wenn kurz vorher ein Touch-Event war, ignorieren (doppelter Sound)
            if (Date.now() - lastTouchTime < 500) return;
            
            triggerSound(target);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initButtonSounds);
    } else {
        initButtonSounds();
    }
    
    // Nicht mehr nötig dank Delegation, aber als Platzhalter behalten
    window.refreshAudio = () => {};
})();
