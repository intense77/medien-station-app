// Helper: Bild auf 3:2 vorbereiten (1800x1200) und als Base64 zurückgeben
function getOptimizedPrintData(dataUrl, useContain = false) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            // Zielgröße: 1800x1200 (3:2 Format des Selphy)
            const targetW = 1800;
            const targetH = 1200;

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
        // Prüfen, ob wir "Contain" nutzen sollen (für Pixel Art und Comic)
        // Damit wird nichts abgeschnitten, auch wenn das Format nicht 3:2 ist.
        const useContain = jobName && (jobName.includes('Pixel') || jobName.includes('Comic'));

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
                        (err) => { alert("Fehler: " + err); if (btn) btn.innerText = "❌"; }
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
                        if (window.playSound) window.playSound('success');
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
        alert("Fehler: " + e.message);
        if (btn) btn.innerText = "❌";
    } finally {
        if (btn) setTimeout(() => { btn.innerText = originalText; btn.disabled = false; }, 2000);
    }
};