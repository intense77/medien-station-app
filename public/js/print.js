// Helper: Versucht ein Bild oder Canvas synchron auf 3:2 vorzubereiten (1800x1200 / 1200x1800) und als Base64 zurückzugeben
function getOptimizedPrintDataSync(source, useContain = false) {
    let img;
    if (source instanceof HTMLCanvasElement || source instanceof HTMLImageElement) {
        img = source;
    } else if (typeof source === 'string') {
        // Falls eine String-URL übergeben wurde, suchen wir im DOM nach einem geladenen <img> mit dieser Quelle,
        // um den Prozess synchron fortsetzen zu können.
        const found = Array.from(document.querySelectorAll('img')).find(el => el.src === source || el.getAttribute('src') === source);
        if (found && found.complete && found.naturalWidth > 0) {
            img = found;
        } else {
            return null; // Asynchrones Fallback erforderlich
        }
    } else {
        return null; // Unbekannter Typ
    }

    const width = img.naturalWidth || img.width;
    const height = img.naturalHeight || img.height;
    if (!width || !height) return null;

    const isPortrait = height > width;
    const targetW = isPortrait ? 1200 : 1800;
    const targetH = isPortrait ? 1800 : 1200;

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    
    if (useContain) {
        // MODUS: CONTAIN (Alles zeigen, nichts abschneiden, ggf. weiße Ränder)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, targetW, targetH);
        
        const scale = Math.min(targetW / width, targetH / height);
        const w = width * scale;
        const h = height * scale;
        const x = (targetW - w) / 2;
        const y = (targetH - h) / 2;
        
        ctx.drawImage(img, 0, 0, width, height, x, y, w, h);
    } else {
        // MODUS: COVER (Zuschneiden, randlos füllen)
        let w = width;
        let h = height;
        let srcX = 0, srcY = 0, srcW = w, srcH = h;
        const targetRatio = targetW / targetH;
        const currentRatio = w / h;

        if (currentRatio > targetRatio) {
            srcW = h * targetRatio;
            srcX = (w - srcW) / 2;
        } else {
            srcH = w / targetRatio;
            srcY = (h - srcH) / 2;
        }
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);
    }
    
    return canvas.toDataURL('image/jpeg', 0.9);
}

// Asynchrones Fallback, falls die Quelle geladen werden muss (z. B. entfernter Bild-Pfad)
function getOptimizedPrintDataAsync(dataUrl, useContain = false) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const isPortrait = img.height > img.width;
            const targetW = isPortrait ? 1200 : 1800;
            const targetH = isPortrait ? 1800 : 1200;

            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');
            
            if (useContain) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, targetW, targetH);
                
                const scale = Math.min(targetW / img.width, targetH / img.height);
                const w = img.width * scale;
                const h = img.height * scale;
                const x = (targetW - w) / 2;
                const y = (targetH - h) / 2;
                
                ctx.drawImage(img, 0, 0, img.width, img.height, x, y, w, h);
            } else {
                let w = img.width;
                let h = img.height;
                let srcX = 0, srcY = 0, srcW = w, srcH = h;
                const targetRatio = targetW / targetH;
                const currentRatio = w / h;

                if (currentRatio > targetRatio) {
                    srcW = img.height * targetRatio;
                    srcX = (img.width - srcW) / 2;
                } else {
                    srcH = img.width / targetRatio;
                    srcY = (img.height - srcH) / 2;
                }
                ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, targetW, targetH);
            }
            
            img.onload = null; img.onerror = null; img.src = ''; 
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = (e) => reject(e);
        img.src = dataUrl;
    });
}

// Helper: Zeigt einen kindgerechten Hinweis vor dem Druck-Dialog
function showPrintHint(onConfirm) {
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
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        okBtn.removeEventListener('click', handler);

        // WICHTIG: Callback sofort ausführen, um im direkten Benutzerklick-Scope des Handlers zu verbleiben!
        if (onConfirm) onConfirm();
    };
    okBtn.addEventListener('click', handler);

    modal.style.display = 'flex';
    
    if (window.speakText) window.speakText("Gleich geht es los. Wähle im nächsten Menü die Canon Print App aus.");

    setTimeout(() => {
        modal.style.opacity = '1';
        const content = document.getElementById('print-hint-content');
        if (content) content.style.transform = 'scale(1)';
    }, 10);
}

// Synchroner iframe-basierter Druck (Bypass des Safari Asynchronitäts-Blocks)
function printViaIframeSync(base64Data, btn, restoreButton) {
    console.log("Starte synchronen iFrame-Druck...");
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    document.body.appendChild(iframe);

    iframe.contentWindow.document.write(`
        <html><head><style>@page{size:auto;margin:0}body{margin:0;display:flex;justify-content:center;align-items:center;height:100vh}img{max-width:100%;max-height:100%}</style></head>
        <body><img src="${base64Data}" id="print-image"></body></html>
    `);
    iframe.contentWindow.document.close();

    // WICHTIG: Synchron fokussieren und drucken!
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    
    if (btn) btn.innerText = "✅ OK";
    if (window.triggerConfetti) window.triggerConfetti();
    
    setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
    }, 10000);
    
    restoreButton();
}

function proceedWithPrint(base64Data, jobName, btn, isIOS, isAndroid, isCordova, restoreButton, showErrorFunc) {
    // --- STRATEGIE 1: Direkt-Druck per cordova-plugin-printer (iOS) ---
    // HINWEIS: Bypassed/Deaktiviert aufgrund negativer Zuverlässigkeitserfahrungen auf iOS.
    // iOS nutzt stattdessen die Web Share API (Strategie 3).

    // --- STRATEGIE 2: Android Direkt-App oder Fallback ---
    if (isCordova && window.plugins && window.plugins.socialsharing && isAndroid) {
        const packages = [
            'jp.co.canon.bsd.ad.pixmaprint',
            'jp.co.canon.bsd.ad.pixma.ts.print',
            'jp.co.canon.bsd.ad.selphyphotolayout'
        ];

        const tryPackage = (index) => {
            if (index >= packages.length) {
                if (window.cordova.plugins && window.cordova.plugins.printer) {
                    try {
                        const rawBase64 = base64Data.split(',')[1] || base64Data;
                        const printContent = 'base64://' + rawBase64;
                        window.cordova.plugins.printer.print(printContent, { name: jobName, photo: true }, () => {
                            if (btn) btn.innerText = "✅ OK";
                            if (window.triggerConfetti) window.triggerConfetti();
                            restoreButton();
                        });
                        return;
                    } catch (e) {
                        console.warn("Android Printer-Plugin fehlgeschlagen, nutze Teilen-Dialog...", e);
                    }
                }
                
                window.plugins.socialsharing.share(
                    null, 'Foto drucken', base64Data, null,
                    () => { if (btn) btn.innerText = "✅ OK"; if (window.playSound) window.playSound('success'); restoreButton(); },
                    (err) => { 
                        console.warn("SocialSharing fehlgeschlagen, nutze iFrame...", err);
                        printViaIframeSync(base64Data, btn, restoreButton);
                    }
                );
                return;
            }

            const pkg = packages[index];
            window.plugins.socialsharing.shareVia(
                pkg, 
                null, 'Foto drucken', base64Data, null, 
                () => {
                    if (btn) btn.innerText = "✅ OK";
                    if (window.triggerConfetti) window.triggerConfetti();
                    restoreButton();
                }, 
                (err) => {
                    console.warn(`App ${pkg} nicht verfügbar, versuche nächste...`);
                    tryPackage(index + 1);
                }
            );
        };
        tryPackage(0);
        return;
    }

    // --- STRATEGIE 3: Web Share API als Option vor iFrame-Druck (Bevorzugt auf iOS / Nicht-Kiosk auf anderen Systemen) ---
    const isKioskMode = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
    if (navigator.share && (isIOS || !isKioskMode)) {
        fetch(base64Data)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    return navigator.share({
                        files: [file],
                        title: 'Drucken'
                    });
                } else {
                    throw new Error("Cannot share files");
                }
            })
            .then(() => {
                if (btn) btn.innerText = "✅ OK";
                if (window.triggerConfetti) window.triggerConfetti();
                restoreButton();
            })
            .catch(shareErr => {
                console.warn("Share abgebrochen oder fehlgeschlagen, nutze iFrame-Druck:", shareErr);
                printViaIframeSync(base64Data, btn, restoreButton);
            });
        return;
    }

    // --- STRATEGIE 4: iFrame-basierter Druck (Standard für Browser/PWAs & Fallback) ---
    printViaIframeSync(base64Data, btn, restoreButton);
}

/**
 * Zentrale Druckfunktion: "Smart Share Loop"
 * Strategie: Multi-Tier Fallback-Kette (Printer-Plugin -> SocialSharing -> iFrame-Druck)
 * WICHTIG: Muss synchron im Klick-Handler aufgerufen werden, um den iOS Safari Druckblocker zu umgehen!
 */
window.printImage = function(source, jobName, btn, bypassHint = false) {
    const originalText = btn ? btn.innerText : '';
    
    if (btn) {
        btn.innerText = "🖨️ ...";
        btn.disabled = true;
    }

    const restoreButton = () => {
        if (btn) {
            setTimeout(() => {
                btn.innerText = originalText;
                btn.disabled = false;
            }, 2000);
        }
    };

    // 1. Kindgerechten Hinweis VOR dem System-Dialog anzeigen (nur einmal pro Session)
    if (!bypassHint && !sessionStorage.getItem('print_hint_shown')) {
        showPrintHint(() => {
            sessionStorage.setItem('print_hint_shown', 'true');
            // Erneut printImage aufrufen, aber dieses Mal bypassHint = true.
            // Läuft synchron im Klick-Scope des Hinweisfelds!
            window.printImage(source, jobName, btn, true);
        });
        restoreButton();
        return;
    }

    const useContain = jobName && (jobName.includes('Pixel') || jobName.includes('Comic') || jobName.includes('Polaroid'));
    const isIOS = /ipad|iphone|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /android/i.test(navigator.userAgent);
    const isCordova = !!window.cordova;

    const showPrintAndRestoreError = () => {
        if(window.showError) window.showError("Oh nein, der Drucker klemmt! Bitte ruf jemanden zu Hilfe.", "🖨️");
        if (btn) btn.innerText = "❌";
        restoreButton();
    };

    try {
        // Versuche synchrone Bildaufbereitung
        const base64Data = getOptimizedPrintDataSync(source, useContain);
        if (base64Data) {
            proceedWithPrint(base64Data, jobName, btn, isIOS, isAndroid, isCordova, restoreButton, showPrintAndRestoreError);
        } else {
            console.warn("Druckdaten nicht synchron bereitstellbar, weiche auf asynchron aus...");
            // Asynchroner Fallback, falls z. B. eine entfernte URL als String übergeben wurde
            getOptimizedPrintDataAsync(source, useContain)
                .then(asyncBase64 => {
                    proceedWithPrint(asyncBase64, jobName, btn, isIOS, isAndroid, isCordova, restoreButton, showPrintAndRestoreError);
                })
                .catch(err => {
                    console.error("Asynchrone Optimierung fehlgeschlagen:", err);
                    showPrintAndRestoreError();
                });
        }
    } catch (e) {
        console.error("Gesamtdruckfehler:", e);
        showPrintAndRestoreError();
    }
};