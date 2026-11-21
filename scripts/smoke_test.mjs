#!/usr/bin/env node
/**
 * MedienStation – Automatischer DSGVO- & Funktions-Wächter (Smoke Test)
 *
 * Prüft gegen das gebaute dist/-Verzeichnis:
 *  1. DSGVO-Wächter: 0 externe Netzwerk-Requests auf allen Apps & Doku-Seiten
 *  2. Stabilitäts-Wächter: Keine uncaught JS-Fehler & keine fehlenden lokalen Assets (HTTP >= 400)
 *  3. Funktions-Wächter: Galerie Speichern/Lesen/Löschen, strenger Tages-Reset, Kamera-Sperre bei Direktaufruf
 *
 * Ausführung: npm run test:smoke
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '..', 'dist');

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.mp3': 'audio/mpeg',
    '.wasm': 'application/wasm',
    '.binarypb': 'application/octet-stream',
    '.tflite': 'application/octet-stream'
};

const ROUTES = [
    '/index.html?skip_splash=1',
    '/apps/sound.html',
    '/apps/rec.html',
    '/apps/gif.html',
    '/apps/magic.html',
    '/apps/pixel.html',
    '/apps/news.html',
    '/apps/stopmotion.html',
    '/apps/comic.html',
    '/apps/galerie.html',
    '/apps/info.html',
    '/entdecker_karten.html',
    '/docs/index.html',
    '/docs/kita_einrichtung.html',
    '/docs/eltern_aushang.html',
    '/docs/FREIGABE_IT_DATENSCHUTZ.html',
    '/docs/datenschutz.html',
    '/docs/impressum.html'
];

function findBrowserExecutable() {
    const candidates = [
        process.env.CHROME_PATH,
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/snap/bin/chromium',
        '/usr/bin/google-chrome',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    ].filter(Boolean);

    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    return undefined;
}

function startStaticServer() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(DIST_DIR)) {
            return reject(new Error('dist/ Verzeichnis fehlt. Bitte zuerst "npm run build" ausführen.'));
        }
        const server = http.createServer((req, res) => {
            const urlPath = (req.url || '/').split('?')[0];
            let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
                filePath = path.join(filePath, 'index.html');
            }
            if (!fs.existsSync(filePath)) {
                res.writeHead(404);
                res.end('Not found');
                return;
            }
            const ext = path.extname(filePath).toLowerCase();
            res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
            fs.createReadStream(filePath).pipe(res);
        });
        server.listen(0, '127.0.0.1', () => {
            const addr = server.address();
            resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
        });
    });
}

async function main() {
    const { server, baseUrl } = await startStaticServer();
    const executablePath = findBrowserExecutable();
    if (!executablePath) {
        server.close();
        console.error('❌ Kein Chromium/Chrome gefunden. Setze CHROME_PATH=/pfad/zu/chromium.');
        process.exit(1);
    }

    const browser = await chromium.launch({
        executablePath,
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-dev-shm-usage',
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream'
        ]
    });

    const failures = [];
    const externalRequests = [];
    const missingAssets = [];

    try {
        const context = await browser.newContext({
            permissions: ['camera', 'microphone']
        });
        const page = await context.newPage();

        page.on('request', (req) => {
            const u = req.url();
            if (!u.startsWith(baseUrl) && !u.startsWith('data:') && !u.startsWith('blob:') && !u.startsWith('about:')) {
                externalRequests.push(`${page.url()} -> ${u}`);
            }
        });

        page.on('response', (res) => {
            if (res.status() >= 400 && res.url().startsWith(baseUrl)) {
                missingAssets.push(`${res.status()} ${res.url()}`);
            }
        });

        let currentRoute = '';
        page.on('pageerror', (err) => {
            // Im reinen Browser-PWA-Modus (ohne nativen Capacitor/Cordova-Container) wirft cordova.js diesen bekannten Hinweis
            if (err && String(err.message).includes('cordova/plugin_list')) return;
            failures.push(`[JS-Fehler auf ${currentRoute}] ${err.message}`);
        });

        console.log(`🛡️  MedienStation DSGVO- & Funktions-Wächter gestartet (${ROUTES.length} Seiten)...`);

        // 1. Alle Routen prüfen (DSGVO + JS-Fehler + 404)
        for (const route of ROUTES) {
            currentRoute = route;
            await page.goto(baseUrl + route, { waitUntil: 'domcontentloaded', timeout: 15000 });
            await page.waitForTimeout(250);
            process.stdout.write(`  ✅ ${route}\n`);
        }

        // 2. Funktions-Check: Galerie Speichern / Lesen / Strenger Tages-Reset / Löschen
        currentRoute = 'functional:gallery';
        await page.goto(baseUrl + '/index.html?skip_splash=1', { waitUntil: 'domcontentloaded' });
        const galleryResult = await page.evaluate(async () => {
            await window.clearMeisterwerke();
            const dummyImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            await window.saveToMeisterwerke({
                id: 'smoke_test_item',
                type: 'image',
                appName: 'Smoke Test',
                dataUrl: dummyImg,
                timestamp: Date.now() - (5 * 60 * 60 * 1000) // vor 5 Stunden
            });
            const afterSave = await window.getMeisterwerke();

            // Strenger Tages-Reset testen: Item auf gestern setzen + lastDate auf gestern
            await window.clearMeisterwerke();
            await window.saveToMeisterwerke({
                id: 'smoke_yesterday_item',
                type: 'image',
                appName: 'Smoke Test',
                dataUrl: dummyImg,
                timestamp: Date.now() - (26 * 60 * 60 * 1000)
            });
            localStorage.setItem('medienstation_reset_mode', 'daily');
            localStorage.setItem('medienstation_last_active_date', '2020-01-01');
            await window.checkDailyGalleryCleanup();
            const afterReset = await window.getMeisterwerke();

            return {
                savedCount: afterSave.length,
                afterResetCount: afterReset.length
            };
        });

        if (galleryResult.savedCount !== 1) {
            failures.push(`Galerie Speichern fehlgeschlagen (erwartet 1, erhalten ${galleryResult.savedCount})`);
        } else {
            console.log('  ✅ Galerie Speichern & Lesen OK');
        }

        if (galleryResult.afterResetCount !== 0) {
            failures.push(`Strenger Tages-Reset hat Vortages-Werk nicht gelöscht (verblieben: ${galleryResult.afterResetCount})`);
        } else {
            console.log('  ✅ Strenger DSGVO-Tages-Reset OK');
        }

        // 3. Funktions-Check: Kamera-Datenschutz bei Direktaufruf einer Kamera-App
        currentRoute = 'functional:camera-lock';
        await page.evaluate(() => window.setCameraRestricted(true));
        await page.goto(baseUrl + '/apps/magic.html', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(200);
        const lockVisible = await page.locator('#camera-restricted-lock-overlay').isVisible();
        if (!lockVisible) {
            failures.push('Kamera-Sperre (#camera-restricted-lock-overlay) greift bei Direktaufruf von /apps/magic.html nicht!');
        } else {
            console.log('  ✅ Kamera-Datenschutz (Direktaufruf-Sperre) OK');
        }

        // Aufräumen
        await page.evaluate(() => window.setCameraRestricted(false));

        // 4. Tablet-Viewport-Check: Keine abgeschnittenen/unerreichbaren Buttons im Quer- & Hochformat
        const tabletRoutes = [
            '/index.html?skip_splash=1',
            '/apps/pixel.html',
            '/apps/sound.html',
            '/apps/rec.html',
            '/apps/gif.html',
            '/apps/magic.html',
            '/apps/news.html',
            '/apps/stopmotion.html',
            '/apps/comic.html'
        ];
        const viewports = [
            { name: 'Tablet-Quer-1024x600', width: 1024, height: 600 },
            { name: 'iPad-Quer-1024x768', width: 1024, height: 768 },
            { name: 'iPad-Hoch-768x1024', width: 768, height: 1024 }
        ];
        let clippedCount = 0;
        for (const vp of viewports) {
            await page.setViewportSize({ width: vp.width, height: vp.height });
            for (const r of tabletRoutes) {
                currentRoute = `${vp.name}:${r}`;
                await page.goto(baseUrl + r, { waitUntil: 'domcontentloaded', timeout: 15000 });
                await page.waitForTimeout(150);
                const clipped = await page.evaluate(() => {
                    const out = [];
                    document.querySelectorAll('button').forEach(btn => {
                        const st = getComputedStyle(btn);
                        if (st.display === 'none' || st.visibility === 'hidden' || st.opacity === '0') return;
                        if (btn.closest('.hidden, [style*="display: none"], [style*="display:none"]')) return;
                        const rect = btn.getBoundingClientRect();
                        if (rect.width === 0 || rect.height === 0) return;
                        let p = btn.parentElement;
                        let scrollableAncestor = false;
                        while (p && p !== document.documentElement) {
                            const ps = getComputedStyle(p);
                            const pr = p.getBoundingClientRect();
                            if (ps.overflowY === 'auto' || ps.overflowY === 'scroll' || ps.overflowX === 'auto' || ps.overflowX === 'scroll') {
                                scrollableAncestor = true;
                            }
                            if (!scrollableAncestor && (ps.overflow === 'hidden' || ps.overflowY === 'hidden' || ps.overflowX === 'hidden')) {
                                if (rect.bottom > pr.bottom + 2 || rect.right > pr.right + 2 || rect.top < pr.top - 2 || rect.left < pr.left - 2) {
                                    out.push((btn.innerText || btn.title || btn.id || 'button').replace(/\s+/g, ' ').trim().slice(0, 30));
                                    break;
                                }
                            }
                            p = p.parentElement;
                        }
                    });
                    return out;
                });
                if (clipped.length > 0) {
                    clippedCount += clipped.length;
                    failures.push(`[Abgeschnittene Buttons auf ${vp.name} ${r}] ${clipped.join(', ')}`);
                }
            }
        }
        if (clippedCount === 0) {
            console.log('  ✅ Tablet-Viewport-Check (Quer- & Hochformat): 0 abgeschnittene Buttons');
        }

    } finally {
        await browser.close();
        server.close();
    }

    if (externalRequests.length > 0) {
        console.error('\n❌ DSGVO-VERSTOSS: Externe Netzwerk-Aufrufe erkannt:');
        externalRequests.forEach(r => console.error('   -', r));
        failures.push(`${externalRequests.length} externe Netzwerk-Aufrufe`);
    } else {
        console.log('  ✅ DSGVO-Wächter: 0 externe Netzwerk-Aufrufe');
    }

    if (missingAssets.length > 0) {
        console.error('\n❌ Fehlende lokale Assets (HTTP >= 400):');
        missingAssets.forEach(m => console.error('   -', m));
        failures.push(`${missingAssets.length} fehlende Assets`);
    } else {
        console.log('  ✅ Alle lokalen Assets fehlerfrei geladen (0x 404)');
    }

    if (failures.length > 0) {
        console.error(`\n❌ SMOKE TEST FEHLGESCHLAGEN (${failures.length} Problem(e)):`);
        failures.forEach(f => console.error('   -', f));
        process.exit(1);
    }

    console.log('\n🎉 ALLE PRÜFUNGEN BESTANDEN! MedienStation ist sauber & DSGVO-konform.');
}

main().catch((err) => {
    console.error('❌ Unerwarteter Testfehler:', err);
    process.exit(1);
});
