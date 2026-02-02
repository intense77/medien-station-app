(function() {
    console.log("🔊 AUDIO SYSTEM GESTARTET");

    // 1. Pfad bestimmen
    const isSubApp = window.location.pathname.includes('/apps/');
    // Wir probieren beide Pfade, falls einer falsch ist
    const basePath = isSubApp ? '../assets/sounds/' : 'assets/sounds/';

    // 2. Sounds laden mit Fehlerprüfung
    const soundNames = ['click', 'shutter', 'success'];
    const audioStore = {};

    soundNames.forEach(name => {
        const fullPath = basePath + name + '.mp3';
        const audio = new Audio();
        
        // Event Listener VOR dem src setzen
        audio.addEventListener('canplaythrough', () => {
            console.log(`✅ Sound geladen: ${name} (${fullPath})`);
        });

        audio.addEventListener('error', (e) => {
            console.error(`❌ FEHLER bei Sound ${name}:`, e);
            console.error(`Versuchter Pfad: ${fullPath}`);
            // Versuch: Absoluter Pfad als Fallback für Android
            if (!audio.src.startsWith('http') && !audio.src.startsWith('file')) {
                console.log("Versuche Fallback-Pfad...");
            }
        });

        audio.src = fullPath;
        audio.load();
        audioStore[name] = audio;
    });

    audioStore['click'].volume = 0.5;
    audioStore['shutter'].volume = 1.0;
    audioStore['success'].volume = 0.8;

    // 3. Globale Play Funktion
    window.playSound = function(name) {
        const sound = audioStore[name];
        if (sound) {
            console.log(`▶️ Spiele: ${name}`);
            const clone = sound.cloneNode();
            clone.volume = sound.volume;
            
            const promise = clone.play();
            if (promise !== undefined) {
                promise.then(() => {
                    console.log(`🔊 ${name} abgespielt!`);
                }).catch(error => {
                    console.error(`🚫 Autoplay blockiert oder Fehler bei ${name}:`, error);
                    alert("Audio Fehler: " + error.message); // Damit du es am Tablet siehst
                });
            }
        } else {
            console.error(`❓ Unbekannter Sound: ${name}`);
        }
    };

    // 4. Klick-Listener an alle Buttons
    function initButtonSounds() {
        const buttons = document.querySelectorAll('button, a, .pad-item, .pad-btn');
        console.log(`Found ${buttons.length} clickable elements.`);
        
        buttons.forEach(btn => {
            if(btn.dataset.soundAttached) return;
            btn.dataset.soundAttached = "true";
            
            btn.addEventListener('touchstart', () => {
                const txt = (btn.innerText || "").toUpperCase();
                if (!txt.includes('FOTO') && !txt.includes('REC') && !txt.includes('DRUCKEN') && !txt.includes('WÜRFELN')) {
                    window.playSound('click');
                }
            }, {passive: true});
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initButtonSounds);
    } else {
        initButtonSounds();
    }
    
    window.refreshAudio = initButtonSounds;
})();
