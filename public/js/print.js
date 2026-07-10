// Helper: Bild auf 3:2 vorbereiten (1800x1200) und als Base64 zurückgeben
function getOptimizedPrintData(dataUrl, useContain = false) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // Wenn das Bild höher als breit ist, drucken wir im Hochformat (1200x1800)
            const isPortrait = img.height > img.width;
            const targetW = isPortrait ? 1200 : 1800;
            const targetH = isPortrait ? 1800 : 1200;

            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');
            
            if (useContain) {
                // MODUS: CONTAIN (Alles zeigen, nichts abschneiden, ggf. weiße Ränder)
                // Ideal für Pixel Art und Comics
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, targetW, targetH);
                
                const scale = Math.min(targetW / img.width, targetH / img.height);
                const w = img.width * scale;
                const h = img.height * scale;
                const x = (targetW - w) / 2;
                const y = (targetH - h) / 2;
                
                ctx.drawImage(img, 0, 0, img.width, img.height, x, y, w, h);
            } else {
                // MODUS: COVER (Zuschneiden, randlos füllen)
                // Ideal für Fotos / Selfies
                let w = img.width;
                let h = img.height;
                let srcX = 0, srcY = 0, srcW = w, srcH = h;
                const targetRatio = targetW / targetH;
                const currentRatio = w / h;

                if (currentRatio > targetRatio) {
                    // Bild ist breiter als Papier -> Links/Rechts beschneiden
                    srcW = h * targetRatio;
                    srcX = (w - srcW) / 2;
                } else {
                    // Bild ist höher als Papier -> Oben/Unten beschneiden
                    srcH = w / targetRatio;
                    srcY = (h - srcH) / 2;
                }
                ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);
            }
            
            img.onload = null; img.onerror = null; img.src = ''; 
            
            // Optimierung: toBlob ist performanter als toDataURL bei großen Bildern
            canvas.toBlob(blob => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            }, 'image/jpeg', 0.9);
        };
        img.onerror = (e) => reject(e);
        img.src = dataUrl;
    });
}

// Helper: Zeigt einen kindgerechten Hinweis vor dem Druck-Dialog
function showPrintHint() {
    return new Promise(resolve => {
        let modal = document.getElementById('print-hint-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'print-hint-modal';
            // Inline-Styles erzwingen das Layout, auch wenn CSS-Klassen vom Compiler entfernt wurden!
            modal.style.cssText = "display: none; position: fixed; inset: 0; z-index: 999999; background-color: rgba(0,0,0,0.85); backdrop-filter: blur(5px); align-items: center; justify-content: center; padding: 1rem; opacity: 0; transition: opacity 0.3s;";
            modal.innerHTML = `
                <div style="background-color: #1e293b; border: 4px solid #3b82f6; border-radius: 2rem; max-width: 28rem; width: 100%; padding: 2rem; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); text-align: center; transform: scale(0.9); transition: transform 0.3s;" id="print-hint-content">
                    <div style="font-size: 5rem; margin-bottom: 1rem;">🖨️</div>
                    <h2 style="font-size: 2rem; font-weight: 900; color: white; margin-bottom: 1rem; font-family: sans-serif;">Gleich geht's los!</h2>
                    <p style="font-size: 1.25rem; color: #cbd5e1; margin-bottom: 2rem; font-weight: bold; font-family: sans-serif;">Wähle im nächsten Menü die <br><span style="color: #60a5fa;">Canon Print App</span> aus.</p>
                    <button id="print-hint-ok" style="width: 100%; background-color: #2563eb; color: white; font-weight: 900; padding: 1rem; border-radius: 0.75rem; font-size: 1.25rem; border: none; border-bottom: 6px solid #1e40af; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-family: sans-serif; transition: all 0.1s;">
                        <span style="font-size: 1.5rem;">👍</span> ALLES KLAR
                    </button>
                </div>
            `;
            document.body.appendChild(modal);

            // Touch-Feedback für den Inline-Button
            const btn = document.getElementById('print-hint-ok');
            btn.onmousedown = () => { btn.style.transform = 'translateY(4px)'; btn.style.borderBottomWidth = '2px'; };
            btn.onmouseup = () => { btn.style.transform = 'none'; btn.style.borderBottomWidth = '6px'; };
            btn.ontouchstart = () => { btn.style.transform = 'translateY(4px)'; btn.style.borderBottomWidth = '2px'; };
            btn.ontouchend = () => { btn.style.transform = 'none'; btn.style.borderBottomWidth = '6px'; };
        }
        
        const okBtn = document.getElementById('print-hint-ok');
        const handler = () => {
            if(window.playSound) window.playSound('click');
            
            // SPRACHAUSGABE ABBRECHEN
            if('speechSynthesis' in window) window.speechSynthesis.cancel();

            modal.style.opacity = '0';
            const content = document.getElementById('print-hint-content');
            if(content) content.style.transform = 'scale(0.9)';
            
            // WICHTIG: Sofort auflösen, damit Android die Aktion als "Nutzer-Klick" anerkennt!
            resolve();
            
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
            okBtn.removeEventListener('click', handler);
        };
        okBtn.addEventListener('click', handler);

        modal.style.display = 'flex';
        
        if (window.speakText) window.speakText("Gleich geht es los. Wähle im nächsten Menü die Canon Print App aus.");

        setTimeout(() => {
            modal.style.opacity = '1';
            const content = document.getElementById('print-hint-content');
            if (content) content.style.transform = 'scale(1)';
        }, 10);
    });
}

/**
 * Zentrale Druckfunktion: "Smart Share Loop"
 * Strategie: Wir nutzen das Plugin (kann große Dateien) und probieren Canon-Apps durch.
 * window.location.href scheitert an der URL-Länge von Base64-Bildern!
 */
window.printImage = async function(dataUrl, jobName, btn) {
    const originalText = btn ? btn.innerText : '';
    
    if (btn) {
        btn.innerText = "🖨️ ...";
        btn.disabled = true;
    }

    try {
        // Zeige den kindgerechten Hinweis VOR dem System-Dialog (nur einmal pro Session)
        if (!sessionStorage.getItem('print_hint_shown')) {
            await showPrintHint();
            sessionStorage.setItem('print_hint_shown', 'true');
        }

        // Prüfen, ob wir "Contain" nutzen sollen (für Pixel Art und Comic)
        // Damit wird nichts abgeschnitten, auch wenn das Format nicht 3:2 ist.
        const useContain = jobName && (jobName.includes('Pixel') || jobName.includes('Comic') || jobName.includes('Polaroid'));

        // 1. Bild vorbereiten (Resize auf 1800x1200, ggf. mit weißen Rändern statt Crop)
        const base64Data = await getOptimizedPrintData(dataUrl, useContain);

        // 2. Strategie: Cordova SocialSharing Plugin
        if (window.plugins && window.plugins.socialsharing) {
            
            // Liste der bekannten Canon Apps (Priorität beachten!)
            const packages = [
                'jp.co.canon.bsd.ad.pixmaprint',       // Canon PRINT (Deine Vermutung)
                'jp.co.canon.bsd.ad.pixma.ts.print',   // Canon PRINT (Alternative ID)
                'jp.co.canon.bsd.ad.selphyphotolayout' // SELPHY Layout
            ];

            // Rekursive Funktion zum Durchprobieren
            const tryPackage = (index) => {
                if (index >= packages.length) {
                    // Wenn keine spezifische App klappt -> Standard-Dialog als Fallback
                    console.log("Keine Direkt-App funktioniert, öffne Auswahl.");
                    window.plugins.socialsharing.share(
                        null, 'Foto drucken', base64Data, null,
                        () => { if (btn) btn.innerText = "✅ OK"; if (window.playSound) window.playSound('success'); },
                    (err) => { if(window.showError) window.showError("Der Drucker möchte gerade nicht!", "🖨️"); if (btn) btn.innerText = "❌"; }
                    );
                    return;
                }

                const pkg = packages[index];
                // shareVia versucht direkt an das Paket zu senden
                window.plugins.socialsharing.shareVia(
                    pkg, 
                    null, 'Foto drucken', base64Data, null, 
                    () => {
                        console.log("Erfolg mit:", pkg);
                        if (btn) btn.innerText = "✅ OK";
                        if (window.triggerConfetti) window.triggerConfetti();
                        else if (window.playSound) window.playSound('success');
                    }, 
                    (err) => {
                        console.warn(`App ${pkg} nicht verfügbar/sichtbar, versuche nächste...`);
                        tryPackage(index + 1);
                    }
                );
            };

            // Starten
            tryPackage(0);

        } 
        // 3. Fallback: Web Share API (Perfekt für iPad/iPhone PWA)
        else if (navigator.share) {
            // Base64 zurück zu Blob konvertieren
            const blob = await (await fetch(base64Data)).blob();
            const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Drucken'
                    });
                    if (btn) btn.innerText = "✅ OK";
                    if (window.triggerConfetti) window.triggerConfetti();
                    return; // Beenden, wenn Teilen erfolgreich war
                } catch (shareErr) {
                    console.warn("Share abgebrochen oder fehlgeschlagen, nutze Fallback:", shareErr);
                    // Kein throw, wir machen mit dem klassischen Browser-Druck als Fallback weiter!
                }
            }
        }

        // 4. Fallback: Klassischer Browser-Druck (PC/Mac oder wenn Share fehlschlägt)
        // Wir nutzen ein unsichtbares iFrame, da window.open() oft von Popup-Blockern blockiert wird!
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        iframe.contentWindow.document.write(`
            <html><head><style>@page{size:auto;margin:0}body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh}img{max-width:100%;max-height:100%}</style></head>
            <body><img src="${base64Data}" onload="window.print();"></body></html>
        `);
        iframe.contentWindow.document.close();

        // Aufräumen des DOMs nach kurzer Wartezeit
        setTimeout(() => {
            if (document.body.contains(iframe)) document.body.removeChild(iframe);
        }, 10000);

        if (btn) btn.innerText = "✅ OK";

    } catch (e) {
        console.error(e);
        if(window.showError) window.showError("Oh nein, der Drucker klemmt! Bitte ruf jemanden zu Hilfe.", "🖨️");
        if (btn) btn.innerText = "❌";
    } finally {
        if (btn) setTimeout(() => { btn.innerText = originalText; btn.disabled = false; }, 2000);
    }
};