#!/usr/bin/env python3
"""
scripts/build_docs.py
Synchronizes and compiles documentation files for MedienStation (AV-Medienzentrale Bistum Augsburg).
Generates both root and public/docs/ HTML files with unified responsive header, modern styling and print/PDF support.
"""

import os
import shutil
import re

VERSION = "7.9.8"
BUILD = "335"
DATE_STR = "Oktober 2026"
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PUBLIC_DOCS_DIR = os.path.join(BASE_DIR, "public", "docs")

os.makedirs(PUBLIC_DOCS_DIR, exist_ok=True)

SHARED_CSS = """
        :root {
            --primary: #0f172a;
            --accent: #10b981;
            --accent-hover: #059669;
            --bg: #0b1329;
            --card-bg: #1e293b;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --border: #334155;
            --success: #10b981;
            --warning: #f59e0b;
            --info: #38bdf8;
            --danger: #ef4444;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--bg);
            color: var(--text-main);
            line-height: 1.6;
            padding-bottom: 3rem;
        }

        .no-print-header {
            background-color: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(12px);
            border-bottom: 2px solid var(--border);
            position: sticky;
            top: 0;
            z-index: 1000;
            padding: 0.85rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            text-decoration: none;
            color: white;
            font-family: 'Outfit', sans-serif;
            font-weight: 900;
            font-size: 1.35rem;
        }

        .brand-icon {
            font-size: 1.8rem;
            background: linear-gradient(135deg, #10b981, #06b6d4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            flex-wrap: wrap;
        }

        .nav-btn {
            background: #1e293b;
            color: #cbd5e1;
            border: 1px solid #334155;
            padding: 0.4rem 0.85rem;
            border-radius: 9999px;
            font-size: 0.82rem;
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
        }

        .nav-btn:hover, .nav-btn.active {
            background: var(--accent);
            color: #0f172a;
            border-color: var(--accent);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .action-btns {
            display: flex;
            align-items: center;
            gap: 0.6rem;
        }

        .btn-action {
            background: #2563eb;
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            font-size: 0.85rem;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            text-decoration: none;
        }

        .btn-action:hover {
            background: #1d4ed8;
            transform: translateY(-1px);
        }

        .btn-action.btn-home {
            background: #475569;
        }

        .btn-action.btn-home:hover {
            background: #334155;
        }

        .container {
            max-width: 1060px;
            margin: 2rem auto;
            padding: 0 1.5rem;
        }

        .doc-card {
            background-color: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 1.5rem;
            padding: 2.5rem 3rem;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        h1, h2, h3, h4 {
            font-family: 'Outfit', sans-serif;
            color: #ffffff;
            line-height: 1.25;
        }

        h1 {
            font-size: 2.2rem;
            font-weight: 900;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            border-bottom: 2px solid var(--border);
            padding-bottom: 1rem;
        }

        .doc-subtitle {
            color: var(--accent);
            font-weight: 700;
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
        }

        .doc-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid var(--border);
            padding: 1rem 1.25rem;
            border-radius: 1rem;
            margin-bottom: 2rem;
            font-size: 0.85rem;
            color: var(--text-muted);
        }

        .doc-meta strong {
            color: #f1f5f9;
        }

        h2 {
            font-size: 1.5rem;
            font-weight: 800;
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            color: #34d399;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding-bottom: 0.5rem;
        }

        h3 {
            font-size: 1.2rem;
            font-weight: 700;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            color: #e2e8f0;
        }

        p {
            margin-bottom: 1rem;
            color: #cbd5e1;
            font-size: 0.95rem;
        }

        ul, ol {
            margin-bottom: 1.25rem;
            padding-left: 1.5rem;
            color: #cbd5e1;
            font-size: 0.95rem;
        }

        li {
            margin-bottom: 0.4rem;
        }

        .security-item {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid var(--border);
            border-radius: 1rem;
            padding: 1.25rem 1.5rem;
            margin-bottom: 1rem;
        }

        .security-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.5rem;
            flex-wrap: wrap;
        }

        .security-title {
            font-size: 1.1rem;
            font-weight: 800;
            color: #ffffff;
        }

        .security-status {
            margin-left: auto;
            font-size: 0.75rem;
            font-weight: 800;
            padding: 0.25rem 0.6rem;
            border-radius: 9999px;
            background: rgba(16, 185, 129, 0.2);
            color: #34d399;
            border: 1px solid #059669;
        }

        .security-status.blue {
            background: rgba(56, 189, 248, 0.2);
            color: #38bdf8;
            border-color: #0284c7;
        }

        .security-status.yellow {
            background: rgba(245, 158, 11, 0.2);
            color: #fbbf24;
            border-color: #d97706;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 1.25rem 0 2rem 0;
            font-size: 0.9rem;
            background: rgba(15, 23, 42, 0.5);
            border-radius: 0.75rem;
            overflow: hidden;
            border: 1px solid var(--border);
        }

        .data-table th, .data-table td {
            padding: 0.85rem 1rem;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }

        .data-table th {
            background: rgba(30, 41, 59, 0.9);
            color: #f8fafc;
            font-weight: 700;
            font-size: 0.85rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .data-table tr:last-child td {
            border-bottom: none;
        }

        .data-table tr:hover td {
            background: rgba(51, 65, 85, 0.3);
        }

        .callout {
            border-left: 4px solid var(--accent);
            background: rgba(16, 185, 129, 0.1);
            padding: 1.25rem 1.5rem;
            border-radius: 0 0.75rem 0.75rem 0;
            margin: 1.5rem 0;
        }

        .callout.info {
            border-left-color: #38bdf8;
            background: rgba(56, 189, 248, 0.1);
        }

        .callout.warning {
            border-left-color: #f59e0b;
            background: rgba(245, 158, 11, 0.1);
        }

        .callout-title {
            font-weight: 800;
            color: #f8fafc;
            margin-bottom: 0.3rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        code, pre {
            background: #0f172a;
            color: #38bdf8;
            font-family: monospace;
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
            font-size: 0.85rem;
        }

        pre {
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1rem 0;
            border: 1px solid var(--border);
        }

        hr {
            border: 0;
            height: 1px;
            background: var(--border);
            margin: 2.5rem 0;
        }

        .signature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }

        .signature-box {
            background: rgba(15, 23, 42, 0.7);
            border: 1px dashed var(--border);
            border-radius: 1rem;
            padding: 1.5rem;
        }

        .sig-line {
            border-bottom: 1px solid var(--border);
            height: 50px;
            margin: 1.5rem 0 0.5rem 0;
        }

        .sig-label {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        @media print {
            .no-print-header { display: none !important; }
            body { background: white !important; color: black !important; padding: 0 !important; font-size: 10pt; }
            .container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
            .doc-card { border: none !important; box-shadow: none !important; padding: 0 !important; background: white !important; color: black !important; }
            h1, h2, h3, h4, .security-title { color: black !important; -webkit-text-fill-color: initial !important; }
            p, li, div, td, th { color: #1e293b !important; }
            .security-item, .callout, .doc-meta, .signature-box { background: #f8fafc !important; border: 1px solid #cbd5e1 !important; color: black !important; }
            .data-table th { background: #f1f5f9 !important; color: black !important; }
            .data-table td, .data-table th { border-color: #cbd5e1 !important; }
            code, pre { background: #f1f5f9 !important; color: #0284c7 !important; border: 1px solid #ccc !important; }
            .security-status { border: 1px solid #64748b !important; color: black !important; background: #e2e8f0 !important; }
            .sig-line { border-bottom-color: black !important; }
        }
"""

def get_nav_header(active_page="security", is_public_docs=False):
    prefix = "" if not is_public_docs else ""
    app_link = "index.html?skip_splash=1" if not is_public_docs else "../index.html?skip_splash=1"
    
    pages = [
        ("hub", "docs.html", "📚 Übersicht"),
        ("security", "security.html", "🛡️ IT & DSGVO"),
        ("konzept", "app_vorstellung.html", "📘 Konzept"),
        ("module", "features.html", "🎨 Module"),
        ("roadmap", "todo.html", "📋 Roadmap"),
        ("datenschutz", "datenschutz.html", "🔒 Datenschutz"),
        ("impressum", "impressum.html", "🏛️ Impressum"),
        ("lizenzen", "lizenzen.html", "📜 Lizenzen"),
    ]
    
    nav_html = []
    for pid, url, title in pages:
        active_cls = " active" if pid == active_page else ""
        nav_html.append(f'<a href="{prefix}{url}" class="nav-btn{active_cls}">{title}</a>')
        
    return f"""
    <header class="no-print-header">
        <a href="{app_link}" class="brand">
            <span class="brand-icon">🎨</span>
            <span>MedienStation Dokus</span>
        </a>

        <nav class="nav-links">
            {"".join(nav_html)}
        </nav>

        <div class="action-btns">
            <button onclick="window.print()" class="btn-action">🖨️ Drucken / PDF</button>
            <a href="{app_link}" class="btn-action btn-home">🏠 Zur App</a>
        </div>
    </header>
"""

def generate_freigabe_html(is_public_docs=False):
    header = get_nav_header("security", is_public_docs)
    
    html = f"""<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MedienStation – IT-Sicherheits-, Datenschutz- &amp; KI-Freigabedossier</title>
    <style>
{SHARED_CSS}
    </style>
</head>
<body>

{header}

    <main class="container">
        <article class="doc-card">
            <h1>IT-Sicherheits-, Datenschutz- &amp; KI-Freigabedossier</h1>
            <div class="doc-subtitle">Offizielle Dokumentationsmappe zur Genehmigung durch IT-Abteilung, Datenschutzbeauftragte (DSB) &amp; KI-Beauftragte</div>

            <div class="doc-meta">
                <div><strong>Projekt:</strong> AV-Medienstation für Kitas &amp; Grundschulen</div>
                <div><strong>Version:</strong> {VERSION} (Build {BUILD})</div>
                <div><strong>Stand:</strong> {DATE_STR}</div>
                <div><strong>Herausgeber:</strong> AV-Medienzentrale Bistum Augsburg (KdöR)</div>
                <div><strong>Ansprechpartner:</strong> Norbert Harner (Tel. 0821-31662272)</div>
                <div><strong>Rechtsrahmen:</strong> KDG (Kirchliches Datenschutzgesetz), DSGVO, EU AI Act (2024/1689)</div>
            </div>

            <div class="callout">
                <div class="callout-title">✅ Wichtigste Prüfergebnisse auf einen Blick:</div>
                <p style="margin-bottom: 0;">Die MedienStation ist als <strong>100% lokale Client-Side PWA</strong> konzipiert. Es werden <strong>keine personenbezogenen Daten</strong> (Bilder, Stimmen, Texte) an Server übertragen oder in Cloud-Diensten gespeichert. Die KI-Bildfreistellung arbeitet vollständig offline im Browser. Es liegt <strong>kein Hochrisiko-System</strong> vor; eine formelle Datenschutz-Folgenabschätzung (DSFA) ist nicht erforderlich.</p>
            </div>

            <!-- TEIL 0: VORANGESTELLTE KURZBESCHREIBUNG DES PROJEKTS -->
            <h2>📌 Teil 0: Vorangestellte Kurzbeschreibung des Projekts (Executive Summary)</h2>
            <p>Dieser Abschnitt bietet der IT-Leitung, Datenschutzbeauftragten, Trägern und Leitungen eine kompakte Gesamtschau über Anlass, Funktionsweise und Schutzarchitektur der MedienStation.</p>

            <div class="security-item">
                <div class="security-header">
                    <span class="security-title">0.1 Anlass, didaktischer Vermittlungsauftrag &amp; Zielgruppe</span>
                    <span class="security-status blue">BILDUNGSAUFTRAG</span>
                </div>
                <p>Die <strong>MedienStation</strong> ist ein medienpädagogisches, nicht-kommerzielles Bildungsangebot der <strong>AV-Medienzentrale des Bistums Augsburg (KdöR)</strong>. Sie wurde gezielt für den Einsatz in <strong>Kindertagesstätten (Kitas), Horten und Grundschulen</strong> konzipiert und richtet sich an Kinder im Alter von <strong>4 bis 10 Jahren</strong> (inklusive Leseanfänger und Nichtleser).</p>
                <ul>
                    <li><strong>Pädagogischer Leitgedanke:</strong> Gemäß den Grundsätzen der aktiven, handlungsorientierten Medienpädagogik (nach Dieter Baacke) treten Kinder aus der passiven Konsumentenrolle heraus und werden zu <strong>aktiven Gestaltern ihrer Medienwelt</strong>. Medien fungieren wie ein digitaler Malkasten oder ein Musikinstrument ohne Gamification- oder Suchtanreize.</li>
                    <li><strong>Sprachförderung &amp; Inklusion:</strong> Hörbeispiele (Mikro Check) und Fotogeschichten (Comic Story) fördern die sprachliche Interaktion unter den Kindern und bieten wertvolle Anlässe zum Erzählen beim Abholen durch Eltern.</li>
                    <li><strong>Einsatzformen:</strong> Stationäre Tablet-Stationen im Gruppenraum, Kiosk-Systeme sowie mobile Medienkoffer zum Verleih an Bildungseinrichtungen.</li>
                </ul>
            </div>

            <div class="security-item">
                <div class="security-header">
                    <span class="security-title">0.2 Funktionsweise &amp; Technischer Workflow der 8 Kreativ-Module</span>
                    <span class="security-status">8 KREATIV-MODULE</span>
                </div>
                <p>Die Station fasst acht kindgerechte Module zusammen, die rein lokal im Browser auf dem Endgerät arbeiten:</p>
                <table class="data-table" style="margin: 0.5rem 0;">
                    <thead>
                        <tr>
                            <th style="width: 25%;">Modul</th>
                            <th style="width: 25%;">Kreativ-Werkzeug</th>
                            <th style="width: 32%;">Funktionsweise &amp; Datenfluss</th>
                            <th style="width: 18%;">Speicherung</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>🧙‍♂️ Zauber Selfie</strong></td>
                            <td>Magisches Fotostudio</td>
                            <td>Lokale KI-Personenfreistellung (Green-Screen ohne Tuch), Themenhintergründe &amp; Filter.</td>
                            <td>Schnappschuss &rarr; Auto Galerie</td>
                        </tr>
                        <tr>
                            <td><strong>🎤 Mikro Check</strong></td>
                            <td>Audio-Labor &amp; Interview</td>
                            <td>Sprachaufnahme, Oszilloskop-Visualisierung, 3 Stimmfilter (Maus, Normal, Monster).</td>
                            <td>Schnappschuss &rarr; Auto Galerie</td>
                        </tr>
                        <tr>
                            <td><strong>🎹 Musik Labor</strong></td>
                            <td>Touch-Soundboard</td>
                            <td>12 Soundpads, eigene Töne aufnehmen, Beat-Loop-Funktion, Rhythmusmuster.</td>
                            <td>Flüchtig im RAM</td>
                        </tr>
                        <tr>
                            <td><strong>📺 News Studio</strong></td>
                            <td>TV-Reporterstation</td>
                            <td>Live-Kamera mit Breaking-News TV-Grafik und Touch-Schlagzeilenlaufband.</td>
                            <td>Schnappschuss &rarr; Auto Galerie</td>
                        </tr>
                        <tr>
                            <td><strong>🎬 Trickfilm Studio</strong></td>
                            <td>Stop-Motion Werkstatt</td>
                            <td>Geisterbild (Onion Skinning), 1–12 FPS Temporegler, Tonaufnahme, A4-Daumenkino-Druck.</td>
                            <td>Manuell: <code>💾</code> / <code>🖨️</code></td>
                        </tr>
                        <tr>
                            <td><strong>👾 Pixel Labor</strong></td>
                            <td>Retro Digitalkunst</td>
                            <td>16&times;16 Rasterfläche mit 12 Farbtönen, Stift-/Touch-Erkennung, Undo &amp; 8-Bit Feedback.</td>
                            <td>Manuell: <code>💾</code> / <code>🖨️</code></td>
                        </tr>
                        <tr>
                            <td><strong>📸 Comic Story</strong></td>
                            <td>Fotogeschichten</td>
                            <td>3-Panel-Comic, eigene Fotos, bewegliche Sprechblasen mit XSS-geschütztem Text.</td>
                            <td>Manuell: <code>💾</code> / <code>🖨️</code></td>
                        </tr>
                        <tr>
                            <td><strong>🔄 Video Loop</strong></td>
                            <td>Zeitschleife / GIF</td>
                            <td>2-Sekunden-Endlosschleife, 3 Geschwindigkeiten (Vor- &amp; Rücklauf), Fotostreifen.</td>
                            <td>Manuell: <code>💾</code> / <code>🖨️</code></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="security-item">
                <div class="security-header">
                    <span class="security-title">0.3 Kompakte IT- &amp; Datenschutz-Matrix auf einen Blick</span>
                    <span class="security-status">ÜBERSICHTSMATRIX</span>
                </div>
                <table class="data-table" style="margin: 0.5rem 0;">
                    <thead>
                        <tr>
                            <th style="width: 25%;">Prüffeld</th>
                            <th style="width: 25%;">Status / Realisierung</th>
                            <th style="width: 50%;">Sicherheits- &amp; Datenschutz-Garantie</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Architektur</strong></td>
                            <td><span class="security-status">100% CLIENT-SIDE</span></td>
                            <td>Zero-Backend: Keine Datenbank, keine APIs, keine Benutzerkonten.</td>
                        </tr>
                        <tr>
                            <td><strong>Netzwerk &amp; Ports</strong></td>
                            <td><span class="security-status blue">OFFLINE-FIRST (PWA)</span></td>
                            <td>Nach initialem Download autark ohne Internet nutzbar. Keine offenen Inbound-Ports.</td>
                        </tr>
                        <tr>
                            <td><strong>Externer Traffic</strong></td>
                            <td><span class="security-status">0 KB FREMD-TRAFFIC</span></td>
                            <td>Keine externen CDNs, keine Cloud-Abrufe, keine Tracking-Dienste oder Werbe-Cookies.</td>
                        </tr>
                        <tr>
                            <td><strong>KI-Komponente</strong></td>
                            <td><span class="security-status blue">LOKALE INFERENZ</span></td>
                            <td>MediaPipe TFLite Modell (250 KB) läuft lokal im WebAssembly-Sandbox. Keine Cloud-KI.</td>
                        </tr>
                        <tr>
                            <td><strong>Biometrie &amp; Tracking</strong></td>
                            <td><span class="security-status">AUSGESCHLOSSEN</span></td>
                            <td>Keine Gesichtserkennung, kein Profiling, keine Emotionserkennung, kein Modell-Nachtraining.</td>
                        </tr>
                        <tr>
                            <td><strong>Speicherbegrenzung</strong></td>
                            <td><span class="security-status">AUTO-RESET 00:00</span></td>
                            <td>Täglich um 00:00 Uhr wird der lokale Speicher (IndexedDB) automatisch gelöscht (Art. 5 DSGVO).</td>
                        </tr>
                        <tr>
                            <td><strong>Freispiel-Schutz</strong></td>
                            <td><span class="security-status">1-KLICK KAMERA-STOPP</span></td>
                            <td>Fachkräfte können im PIN-Menü alle 5 Kamera-Apps sperren (Schutz ohne Fotoerlaubnis).</td>
                        </tr>
                        <tr>
                            <td><strong>Admin-Schutz</strong></td>
                            <td><span class="security-status">PIN-GESICHERT</span></td>
                            <td>Einstellungen (Lautstärke, Speicher, Diagnose, Reset) sind durch eine 4-stellige Touch-PIN gesichert.</td>
                        </tr>
                        <tr>
                            <td><strong>EU AI Act Einstufung</strong></td>
                            <td><span class="security-status">MINIMAL RISK (ART. 6)</span></td>
                            <td>Minimales Risiko nach KI-Verordnung (EU) 2024/1689. Kein Hochrisiko-System.</td>
                        </tr>
                        <tr>
                            <td><strong>DSFA-Erfordernis</strong></td>
                            <td><span class="security-status">NICHT ERFORDERLICH</span></td>
                            <td>Schwellwertanalyse nach § 35 KDG / Art. 35 DSGVO ergibt: Niedrigrisiko-Verarbeitung.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <hr>

            <!-- TEIL 1: IT-SICHERHEIT & BETRIEB -->
            <h2>🖥️ Teil 1: IT-Betriebs- &amp; Sicherheitsdatenblatt (Für IT-Leitung)</h2>
            <p>Dieser Abschnitt dient der Prüfung durch die IT-Systemadministration, Netzwerkverantwortliche und Information-Security-Officers (CISO).</p>

            <div class="security-item">
                <div class="security-header">
                    <span class="security-title">1.1 Architektur: 100% Client-Side Single Page Application (PWA)</span>
                    <span class="security-status">ZERO-BACKEND</span>
                </div>
                <p>Die Anwendung besitzt <strong>kein dynamisches Backend</strong>, keine Datenbank auf dem Server und keine API-Schnittstellen zu Drittsystemen. Der Webserver (Nginx) fungiert ausschließlich als statischer Datei-Auslieferer für HTML-, CSS-, JavaScript-, WebAssembly- und Mediendateien. Sämtliche Programmlogik läuft in der Sandbox des lokalen Browser-Clients (iPad / Android Tablet).</p>
            </div>

            <div class="security-item">
                <div class="security-header">
                    <span class="security-title">1.2 Netzwerk- &amp; Portmatrix (Zero External Traffic)</span>
                    <span class="security-status blue">OFFLINE-FIRST</span>
                </div>
                <table class="data-table" style="margin: 0.5rem 0;">
                    <thead>
                        <tr>
                            <th>Richtung / Port</th>
                            <th>Protokoll</th>
                            <th>Ziel / Domain</th>
                            <th>Zweck &amp; Frequenz</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Ausgehend Port 443</strong></td>
                            <td>HTTPS</td>
                            <td>Eigene Hosting-Domain (Coolify/Nginx)</td>
                            <td>Einmaliger initialer Download der App-Assets / Service-Worker-Cache.</td>
                        </tr>
                        <tr>
                            <td><strong>Eingehend (Inbound)</strong></td>
                            <td>Keine</td>
                            <td>–</td>
                            <td><strong>Keine offenen Ports</strong> auf dem Client-Tablet erforderlich.</td>
                        </tr>
                        <tr>
                            <td><strong>Externe CDNs / APIs</strong></td>
                            <td>Keine</td>
                            <td>–</td>
                            <td><strong>0 KB externer Traffic.</strong> Google MediaPipe WASM, TFLite, JSZip, Tailwind und Fonts sind 100% lokal gehostet.</td>
                        </tr>
                        <tr>
                            <td><strong>Nach dem Erststart</strong></td>
                            <td>Offline</td>
                            <td>–</td>
                            <td>Vollständig offline nutzbar (z. B. Flugmodus, Waldkindergarten).</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="security-item">
                <div class="security-header">
                    <span class="security-title">1.3 Gehärtete HTTP-Sicherheitsheader (Nginx Konfiguration)</span>
                    <span class="security-status">A+ HÄRTUNG</span>
                </div>
                <p>Der Nginx-Webserver erzwingt restriktive Sicherheits-Header zur Abwehr von XSS, Clickjacking, MIME-Sniffing und unautorisierten Hardware-Zugriffen:</p>
                <pre><code># Abwehr von Clickjacking / Embedding in fremden Frames
add_header X-Frame-Options "SAMEORIGIN" always;

# Unterbindung von MIME-Type-Sniffing
add_header X-Content-Type-Options "nosniff" always;

# Referrer-Policy zum Schutz von URL-Metadaten
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Hardware-Zugriff (Kamera & Mikrofon) strikt auf die eigene Origin beschränken
add_header Permissions-Policy "camera=(self), microphone=(self)" always;

# Restriktive Content Security Policy (CSP): Keine Fremd-Skripte oder Fremd-Connects erlaubt
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self';" always;

# Unterdrückung der Webserver-Versionsnummer
server_tokens off;
access_log off;
error_log /dev/stderr warn;</code></pre>
            </div>

            <div class="security-item">
                <div class="security-header">
                    <span class="security-title">1.4 Hardware-, OS- &amp; Kiosk-Voraussetzungen</span>
                    <span class="security-status blue">CLIENT-KOMPATIBEL</span>
                </div>
                <ul>
                    <li><strong>Apple iPad:</strong> iPadOS 15.0 oder höher. Safari oder PWA-Modus („Zum Home-Bildschirm“). Kiosk-Betrieb über Apple „Geführter Zugriff“ (Guided Access) empfohlen.</li>
                    <li><strong>Android Tablets:</strong> Android 10 oder höher. Google Chrome / Webview. Kiosk-Betrieb über Android App-Pinning oder „Fully Kiosk Browser“.</li>
                    <li><strong>Keine Administrator-/Root-Rechte nötig:</strong> Die App läuft vollkommen isoliert im unprivilegierten Standard-Web-Sandbox-Modus.</li>
                </ul>
            </div>

            <hr>

            <!-- TEIL 2: VERZEICHNIS VON VERARBEITUNGSTÄTIGKEITEN (VVT) -->
            <h2>📋 Teil 2: Verzeichnis von Verarbeitungstätigkeiten (VVT nach § 31 KDG / Art. 30 DSGVO)</h2>
            <p>Dieser Vordruck kann von der Einrichtungsleitung oder dem Datenschutzbeauftragten direkt in das behördliche/kirchliche Verzeichnis der Verarbeitungstätigkeiten übernommen werden.</p>

            <table class="data-table">
                <tbody>
                    <tr>
                        <td style="width: 32%;"><strong>1. Bezeichnung der Verarbeitung</strong></td>
                        <td><strong>Medienpädagogische Kiosk-Station („MedienStation“)</strong> zur handlungsorientierten Förderung digitaler Medienkompetenz in Kindertagesstätten und Schulen.</td>
                    </tr>
                    <tr>
                        <td><strong>2. Verantwortlicher (§ 4 Nr. 9 KDG / Art. 4 Nr. 7 DSGVO)</strong></td>
                        <td>Diözese Augsburg KdöR / AV-Medienzentrale, Peutingerstraße 5, 86152 Augsburg.<br>
                        Ansprechpartner: Norbert Harner, Tel. 0821-31662272, E-Mail: norbert.harner@bistum-augsburg.de</td>
                    </tr>
                    <tr>
                        <td><strong>3. Zwecke der Verarbeitung</strong></td>
                        <td>Spielerische und pädagogische Erstellung von Tonaufnahmen (Mikro Check, Musik Labor), Bildern/Comics und Trickfilmen im Gruppenverband; Sensibilisierung für Bild- und Tonmanipulation; Sprachförderung.</td>
                    </tr>
                    <tr>
                        <td><strong>4. Rechtsgrundlagen</strong></td>
                        <td>§ 6 Abs. 1 lit. c KDG (Erfüllung der pädagogischen Bildungs- und Betreuungsaufgabe); § 6 Abs. 1 lit. g KDG / Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an moderner Medienbildung); ggf. Einwilligung der Personensorgeberechtigten für Gruppenfotos.</td>
                    </tr>
                    <tr>
                        <td><strong>5. Betroffene Personengruppen</strong></td>
                        <td>Kinder in Betreuungseinrichtungen (Kitas, Horte, Grundschulen); pädagogische Fachkräfte.</td>
                    </tr>
                    <tr>
                        <td><strong>6. Kategorien personenbezogener Daten</strong></td>
                        <td>
                            <ul>
                                <li><strong>Flüchtige Sprachaufnahmen:</strong> Eigene Stimme, Geräusche (rein lokal im RAM / IndexedDB).</li>
                                <li><strong>Flüchtige Bild-/Videoaufnahmen:</strong> Fotos für Comics, Zauber-Selfies, Stop-Motion-Videos mit Tonspur (<code>type: 'video'</code>) (rein lokal im IndexedDB-Browserspeicher <code>MedienStationDB_v5</code>).</li>
                                <li><strong>Flüchtige Portfolio-Bögen:</strong> Werden on-the-fly im Browser beim Drucken erzeugt; keine Speicherung auf dem Endgerät.</li>
                                <li><strong>Infrastrukturdaten ohne Personenbezug:</strong> Einrichtungsname für Portfolio-Bögen und trägereigene Raum-Hintergrundfotos im lokalen <code>localStorage</code>.</li>
                                <li><strong>Server-Logdaten beim Hosting:</strong> IP-Adresse, Zugriffszeit, User-Agent (technisch notwendig zum Ausliefern der Web-Assets; Nginx <code>access_log off;</code>).</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>7. Empfänger &amp; Dritte (§ 4 Nr. 10 KDG)</strong></td>
                        <td><strong>Keine Empfänger.</strong> Daten verbleiben auf dem lokalen Endgerät. Es findet kein Sync mit Apple iCloud, Google Cloud oder Drittanbietern statt.</td>
                    </tr>
                    <tr>
                        <td><strong>8. Drittlandübermittlung (§ 39 KDG)</strong></td>
                        <td><strong>Findet nicht statt.</strong> Weder Kinderdaten noch Telemetriedaten werden in Drittländer außerhalb der EU/des EWR übertragen.</td>
                    </tr>
                    <tr>
                        <td><strong>9. Löschfristen &amp; Speicherbegrenzung</strong></td>
                        <td>
                            <strong>Automatischer Tages-Reset:</strong> Täglich um 00:00 Uhr werden alle im IndexedDB-Speicher gespeicherten Kinddaten und Meisterwerke (Fotos, Audio, Stop-Motion-Filme) automatisch und unwiderruflich gelöscht.<br>
                            <strong>Flüchtige Portfolio-Bögen:</strong> Werden ad-hoc für den Druck gerendert, keine redundanten Dateien.<br>
                            <strong>Administrative Infrastruktur:</strong> Einrichtungsname und Kita-Hintergründe bleiben persistent für den Einrichtungsbetrieb und können im Fachkraft-Menü einzeln gelöscht werden (<code>🗑️</code>).<br>
                            <strong>Manuelle Sofort-Löschung:</strong> Im Fachkraft-Menü jederzeit per Klick („Galerie leeren“) ausführbar.
                        </td>
                    </tr>
                </tbody>
            </table>

            <hr>

            <!-- TEIL 3: TECHNISCH-ORGANISATORISCHE MASSNAHMEN (TOM) -->
            <h2>🛡️ Teil 3: Technisch-Organisatorische Maßnahmen (TOM nach § 26 KDG / Art. 32 DSGVO)</h2>
            <p>Die folgenden Maßnahmen gewährleisten die Sicherheit der Verarbeitung sowie den Schutz der Grundrechte der Kinder:</p>

            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 25%;">TOM-Kategorie</th>
                        <th style="width: 50%;">Implementierte Schutzmaßnahme</th>
                        <th style="width: 25%;">Status &amp; Verifikation</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>1. Vertraulichkeit (Zugriffskontrolle)</strong></td>
                        <td>Fachkraft- und Admin-Einstellungen sind durch eine 4-stellige PIN (Standard: <code>1234</code>, änderbar) gesichert. Kinder haben keinen Zugriff auf Systemeinstellungen oder Löschfunktionen.</td>
                        <td><span class="security-status">PIN-GESICHERT</span></td>
                    </tr>
                    <tr>
                        <td><strong>2. Freispiel-Kamera-Datenschutz</strong></td>
                        <td>Fachkräfte können im PIN-Menü alle 5 Kamera-Apps (Selfie, Loop, News, Trickfilm, Comic) zentral pausieren, falls Kinder ohne Fotoeinwilligung in der Gruppe sind.</td>
                        <td><span class="security-status">SCHUTZ AKTIV</span></td>
                    </tr>
                    <tr>
                        <td><strong>3. Integrität (Eingabekontrolle)</strong></td>
                        <td>Verhinderung von Script-Injection: Textfelder (z. B. Comic-Blasen) nutzen striktes <code>innerText</code>-Escaping. Keine SQL-Datenbanken oder unkontrollierte Dateisystemzugriffe.</td>
                        <td><span class="security-status">DOM-XSS SICHER</span></td>
                    </tr>
                    <tr>
                        <td><strong>4. Trennungsgebot (Sandbox)</strong></td>
                        <td>Isolierte Ausführung im Browser-Sicherheitskontext. Die IndexedDB-Galerie ist strikt an die Origin gebunden; fremde Webseiten oder andere Apps können nicht darauf zugreifen.</td>
                        <td><span class="security-status">BROWSER-SANDBOX</span></td>
                    </tr>
                    <tr>
                        <td><strong>5. Verfügbarkeit &amp; Belastbarkeit</strong></td>
                        <td>Offline-First-Design durch Service Worker: Das System funktioniert auch bei Netzwerkausfall, instabilem WLAN oder im Außengelände ohne Beeinträchtigung.</td>
                        <td><span class="security-status blue">PWA OFFLINE-READY</span></td>
                    </tr>
                    <tr>
                        <td><strong>6. Löschung &amp; Speicherbegrenzung</strong></td>
                        <td>Art. 5 Abs. 1 lit. e DSGVO (Speicherbegrenzung) wird durch automatisierten täglichen Kalender-Reset der lokalen Galerie algorithmisch erzwungen.</td>
                        <td><span class="security-status">AUTO-RESET 00:00</span></td>
                    </tr>
                </tbody>
            </table>

            <hr>

            <!-- TEIL 4: SCHWELLWERTANALYSE & DSFA-PRÜFUNG -->
            <h2>⚖️ Teil 4: Vorabprüfung zur Datenschutz-Folgenabschätzung (DSFA nach § 35 KDG / Art. 35 DSGVO)</h2>
            <p>Zur Feststellung, ob für den Einsatz der MedienStation eine formelle Datenschutz-Folgenabschätzung (DSFA) durchgeführt werden muss, wurde eine Schwellwertprüfung anhand der Kriterien der Datenschutzkonferenz (DSK) und der WP 248 vorgenommen:</p>

            <table class="data-table">
                <thead>
                    <tr>
                        <th style="width: 55%;">Prüfkriterium (gemäß Leitlinien WP 248)</th>
                        <th style="width: 15%;">Zutreffend?</th>
                        <th style="width: 30%;">Begründung</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>1. Bewertung oder Einstufung (Scoring / Profiling)</td>
                        <td><strong style="color: #34d399;">NEIN</strong></td>
                        <td>Keine Bewertung, kein Testen, kein Leistungsvergleich von Kindern.</td>
                    </tr>
                    <tr>
                        <td>2. Automatisierte Entscheidungsfindung mit Rechtswirkung</td>
                        <td><strong style="color: #34d399;">NEIN</strong></td>
                        <td>Keine automatisierten Entscheidungen.</td>
                    </tr>
                    <tr>
                        <td>3. Systematische Überwachung (Monitoring)</td>
                        <td><strong style="color: #34d399;">NEIN</strong></td>
                        <td>Keine Überwachung, keine Aufzeichnung von Sitzungsdauern.</td>
                    </tr>
                    <tr>
                        <td>4. Verarbeitung von Daten schutzbedürftiger Personen (Kinder)</td>
                        <td><strong style="color: #fbbf24;">JA</strong></td>
                        <td>Nutzerkreis sind Kinder in Kitas und Grundschulen.</td>
                    </tr>
                    <tr>
                        <td>5. Datenverarbeitung in großem Umfang (Big Data)</td>
                        <td><strong style="color: #34d399;">NEIN</strong></td>
                        <td>Dezentrale Einzelgeräte, wenige Megabyte temporäre Daten.</td>
                    </tr>
                    <tr>
                        <td>6. Verknüpfung oder Zusammenführung von Datensätzen</td>
                        <td><strong style="color: #34d399;">NEIN</strong></td>
                        <td>Keine Verknüpfung mit externen Datenquellen.</td>
                    </tr>
                    <tr>
                        <td>7. Innovative Technologien (Lokale KI-Segmentierung)</td>
                        <td><strong style="color: #fbbf24;">TEILWEISE</strong></td>
                        <td>Lokales MediaPipe-Modell, jedoch ohne Cloud und ohne Biometrie.</td>
                    </tr>
                    <tr>
                        <td>8. Datenübermittlung in Drittländer außerhalb der EU</td>
                        <td><strong style="color: #34d399;">NEIN</strong></td>
                        <td>Keine Übermittlung.</td>
                    </tr>
                    <tr>
                        <td>9. Ausschluss von Rechten oder Dienstleistungen</td>
                        <td><strong style="color: #34d399;">NEIN</strong></td>
                        <td>Reines pädagogisches Kreativwerkzeug.</td>
                    </tr>
                </tbody>
            </table>

            <div class="callout">
                <div class="callout-title">Ergebnis der Schwellwertanalyse:</div>
                <p style="margin-bottom: 0;">Von den 9 Risikokriterien wird lediglich das Kriterium der schutzbedürftigen Personengruppe (Kinder) erfüllt. Da <strong>weniger als zwei Kriterien kumulativ</strong> vorliegen und durch die 100% lokale Verarbeitung sowie den automatischen Tages-Reset keinerlei bleibendes Risiko für die Rechte und Freiheiten der Kinder entsteht, ist <strong>keine vollumfängliche DSFA erforderlich</strong> (Niedrigrisiko-Verarbeitung).</p>
            </div>

            <hr>

            <!-- TEIL 5: KI-BEAUFTRAGTER & EU AI ACT -->
            <h2>🤖 Teil 5: KI-Konformitäts- &amp; Transparenzerklärung (EU AI Act 2024/1689)</h2>
            <p>Dieser Abschnitt dokumentiert den Einsatz von Künstlicher Intelligenz (KI) in der MedienStation für den KI-Beauftragten und die ethische Prüfung.</p>

            <div class="security-item">
                <div class="security-header">
                    <span class="security-title">5.1 Spezifikation der eingesetzten KI-Komponente</span>
                    <span class="security-status blue">MEDIAPIPE TFLITE</span>
                </div>
                <p>In der App <strong>„Zauber Selfie“</strong> wird ein leichtgewichtiges Convolutional Neural Network (CNN) eingesetzt: <code>Google MediaPipe Selfie Segmentation</code> (Lizenz: Apache 2.0). Das Modell ist als TensorFlow-Lite-Datei (<code>selfie_segmentation.tflite</code>, ca. 250 KB) fest in die App integriert.</p>
            </div>

            <div class="security-item">
                <div class="security-header">
                    <span class="security-title">5.2 Einstufung nach EU AI Act (KI-Verordnung (EU) 2024/1689)</span>
                    <span class="security-status">MINIMALES RISIKO (ART. 6)</span>
                </div>
                <ul>
                    <li><strong>Kein verbotenes KI-System (Art. 5 EU AI Act):</strong> Es findet kein Social Scoring, keine Verhaltensmanipulation zur Schädigung und keine biometrische Echtzeit-Fernidentifizierung im öffentlichen Raum statt.</li>
                    <li><strong>Kein Hochrisiko-System (Art. 6 &amp; Anhang III EU AI Act):</strong> Die KI dient weder der Leistungsbewertung in Bildungsstätten, noch trifft sie Entscheidungen über den Zugang zu Bildungseinrichtungen oder das Verhalten der Kinder.</li>
                    <li><strong>Einstufung:</strong> System mit <strong>minimalem Risiko / Null-Risiko (Minimal / No Risk AI)</strong>. Das Modell fungiert rein als digitaler „Grafik-Scherenschnitt“ zur Maskierung von Bildhintergründen.</li>
                </ul>
            </div>

            <div class="security-item">
                <div class="security-header">
                    <span class="security-title">5.3 Ethische Negativ-Attestierung (Garantien für den Kinderschutz)</span>
                    <span class="security-status">GEPRÜFT &amp; ATTESTIERT</span>
                </div>
                <table class="data-table" style="margin: 0.5rem 0;">
                    <thead>
                        <tr>
                            <th style="width: 35%;">Eigenschaft</th>
                            <th style="width: 15%;">Vorhanden?</th>
                            <th style="width: 50%;">Erläuterung &amp; technischer Nachweis</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Biometrische Identifikation</strong></td>
                            <td><strong style="color: #34d399;">NEIN</strong></td>
                            <td>Das Modell erkennt Gesichter nicht wieder, erzeugt keine Face-Hashes und kann keine Personen identifizieren.</td>
                        </tr>
                        <tr>
                            <td><strong>Emotionserkennung</strong></td>
                            <td><strong style="color: #34d399;">NEIN</strong></td>
                            <td>Es erfolgt keinerlei mimische Analyse oder Stimmungserkennung (kein Emotion Recognition).</td>
                        </tr>
                        <tr>
                            <td><strong>Generative KI / LLM</strong></td>
                            <td><strong style="color: #34d399;">NEIN</strong></td>
                            <td>Keine Textgenerierung, keine KI-Synthese (kein Deepfake-Risiko, kein Halluzinieren).</td>
                        </tr>
                        <tr>
                            <td><strong>Modell-Training mit Kinderdaten</strong></td>
                            <td><strong style="color: #34d399;">NEIN</strong></td>
                            <td>Das Modell ist vorab trainiert und schreibgeschützt („Inferenz-only“). Es lernt nicht dazu.</td>
                        </tr>
                        <tr>
                            <td><strong>Cloud-Übertragung von Kamerabildern</strong></td>
                            <td><strong style="color: #34d399;">NEIN</strong></td>
                            <td>Kamerabilder verbleiben im GPU/RAM-Puffer des Tablets und werden nach dem Frame-Render sofort verworfen.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <hr>

            <!-- TEIL 6: FORMELLES FREIGABE- & GENEHMIGUNGSPROTOKOLL -->
            <h2>✍️ Teil 6: Freigabebeschluss &amp; Genehmigungsprotokoll</h2>
            <p>Zur formellen Dokumentation in den Einrichtungsakten kann diese Erklärung ausgedruckt und von den zuständigen Stellen gegengezeichnet werden:</p>

            <div class="callout info">
                <p><strong>Beschlussvorschlag:</strong> Der Einsatz der Software <em>MedienStation (Version {VERSION})</em> wird auf den dafür vorgesehenen Tablet-Endgeräten der Einrichtung für den medienpädagogischen Einsatz freigegeben. Die Einhaltung der Vorgaben des KDG, der DSGVO und des EU AI Act wurde anhand dieses Dossiers geprüft und bestätigt.</p>
            </div>

            <div class="signature-grid">
                <div class="signature-box">
                    <strong>1. IT-Freigabe (Systemtechnik)</strong>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Prüfung von Netzwerk, Ports, Sicherheit &amp; Endgeräte-Sandboxing.</p>
                    <div class="sig-line"></div>
                    <div class="sig-label">Datum, Name &amp; Unterschrift IT-Leitung</div>
                </div>

                <div class="signature-box">
                    <strong>2. Datenschutz-Freigabe (DSB)</strong>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Prüfung von KDG/DSGVO, VVT-Eintrag, TOM &amp; Schwellwertanalyse.</p>
                    <div class="sig-line"></div>
                    <div class="sig-label">Datum, Name &amp; Unterschrift Datenschutzbeauftragte(r)</div>
                </div>

                <div class="signature-box">
                    <strong>3. KI- &amp; Ethik-Freigabe</strong>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Prüfung nach EU AI Act (Art. 6) &amp; kirchlichen KI-Leitlinien.</p>
                    <div class="sig-line"></div>
                    <div class="sig-label">Datum, Name &amp; Unterschrift KI-Beauftragte(r)</div>
                </div>

                <div class="signature-box">
                    <strong>4. Einrichtungs- / Trägerleitung</strong>
                    <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Gesamtgenehmigung für den Betrieb im pädagogischen Alltag.</p>
                    <div class="sig-line"></div>
                    <div class="sig-label">Datum, Name &amp; Unterschrift Einrichtungsleitung</div>
                </div>
            </div>

            <div style="margin-top: 3rem; text-align: center;" class="no-print-header">
                <button onclick="window.print()" class="btn-action" style="font-size: 1rem; padding: 0.75rem 2rem;">🖨️ Dieses Freigabedossier als PDF drucken / speichern</button>
            </div>

        </article>
    </main>

</body>
</html>
"""
    return html

def generate_hub_html(is_public_docs=False):
    header = get_nav_header("hub", is_public_docs)
    
    html = f"""<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MedienStation – Dokumentations-Portal &amp; Weitergabe-Hub</title>
    <style>
{SHARED_CSS}
        .hub-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }}
        .hub-card {{
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid var(--border);
            border-radius: 1.25rem;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            transition: all 0.2s ease;
        }}
        .hub-card:hover {{
            border-color: var(--accent);
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }}
        .hub-card-icon {{
            font-size: 2.2rem;
            margin-bottom: 0.75rem;
        }}
        .hub-card-title {{
            font-size: 1.25rem;
            font-weight: 800;
            color: #ffffff;
            margin-bottom: 0.4rem;
        }}
        .hub-card-desc {{
            color: #cbd5e1;
            font-size: 0.9rem;
            flex-grow: 1;
            margin-bottom: 1.25rem;
        }}
        .hub-badge {{
            display: inline-block;
            font-size: 0.72rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 0.2rem 0.6rem;
            border-radius: 9999px;
            margin-bottom: 0.75rem;
            width: fit-content;
        }}
        .hub-badge.green {{ background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid #059669; }}
        .hub-badge.blue {{ background: rgba(56, 189, 248, 0.2); color: #38bdf8; border: 1px solid #0284c7; }}
        .hub-badge.purple {{ background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid #9333ea; }}
        .hub-badge.amber {{ background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid #d97706; }}
        .hub-actions {{
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }}
    </style>
</head>
<body>

{header}

    <main class="container">
        <article class="doc-card">
            <h1>MedienStation Dokumentations-Portal</h1>
            <div class="doc-subtitle">Zentrales Dossier- &amp; Freigabeverzeichnis für IT, Datenschutz, Träger &amp; Fachkräfte</div>

            <div class="doc-meta">
                <div><strong>Projekt:</strong> MedienStation (AV-Medienzentrale Bistum Augsburg)</div>
                <div><strong>Aktuelle Version:</strong> {VERSION} (Build {BUILD})</div>
                <div><strong>Stand:</strong> {DATE_STR}</div>
                <div><strong>Rechtsrahmen:</strong> KDG, DSGVO, EU AI Act</div>
                <div><strong>Zielgruppe:</strong> Kitas, Horte &amp; Grundschulen (4–10 Jahre)</div>
            </div>

            <div class="callout">
                <div class="callout-title">📂 Alle Dokumente zur Weitergabe und Prüfung bereit:</div>
                <p style="margin-bottom: 0;">Sämtliche Unterlagen stehen sowohl als <strong>digitale HTML-Dossiers</strong> zur Weiterleitung per E-Mail/USB als auch als <strong>DIN-A4 druckfertige PDFs</strong> zur Verfügung. Klicken Sie auf ein Dokument, um es zu öffnen oder mit <code>🖨️ Drucken / PDF</code> abzuspeichern.</p>
            </div>

            <div class="hub-grid">
                
                <!-- Card 1: IT & Datenschutz Freigabe -->
                <div class="hub-card" style="border-color: #10b981;">
                    <div class="hub-badge green">Priorität: IT &amp; DSB</div>
                    <div class="hub-card-icon">🛡️</div>
                    <div class="hub-card-title">IT- &amp; Datenschutz-Freigabe</div>
                    <div class="hub-card-desc">
                        Vollständiges Freigabedossier: <strong>Vorangestellte Projekt-Kurzbeschreibung</strong>, IT-Sicherheitsblatt, VVT nach § 31 KDG, TOMs nach § 26 KDG, DSFA-Vorabprüfung, EU AI Act Einstufung (Minimal Risk) und 4-fach Unterschriften-Genehmigungsprotokoll.
                    </div>
                    <div class="hub-actions">
                        <a href="FREIGABE_IT_DATENSCHUTZ.html" class="btn-action" style="background: #10b981; color: #0f172a;">Öffnen &rarr;</a>
                        <a href="FREIGABE_IT_DATENSCHUTZ.html" onclick="window.open(this.href).print(); return false;" class="btn-action btn-home">🖨️ PDF</a>
                    </div>
                </div>

                <!-- Card 2: Kita-Einrichtung & Kiosk-Start -->
                <div class="hub-card" style="border-color: #f59e0b;">
                    <div class="hub-badge amber">Schnellstart: Fachkräfte</div>
                    <div class="hub-card-icon">🚀</div>
                    <div class="hub-card-title">Kita-Einrichtung &amp; Kiosk-Modus</div>
                    <div class="hub-card-desc">
                        Kompakte 1-Seiten-Anleitung für den Kita-Alltag: App-Installation (iPad &amp; Android), kindersicherer Kiosk-Schutz (Geführter Zugriff / App-Pinning), Drucker-Setup und 2-Minuten-Checkliste.
                    </div>
                    <div class="hub-actions">
                        <a href="kita_einrichtung.html" class="btn-action" style="background: #f59e0b; color: #0f172a;">Öffnen &rarr;</a>
                        <a href="kita_einrichtung.html" onclick="window.open(this.href).print(); return false;" class="btn-action btn-home">🖨️ PDF</a>
                    </div>
                </div>

                <!-- Card 2b: Eltern-Aushang (Kita-Pinnwand) -->
                <div class="hub-card" style="border-color: #ec4899;">
                    <div class="hub-badge purple">Elternarbeit &amp; Transparenz</div>
                    <div class="hub-card-icon">👨‍👩‍👧‍👦</div>
                    <div class="hub-card-title">Eltern-Aushang (1 Seite PDF)</div>
                    <div class="hub-card-desc">
                        Druckfertiger, freundlicher Aushang für die Kita-Pinnwand: Erklärt Eltern auf einen Blick das pädagogische Konzept, 100 % Offline-/Ohne-Cloud-Betrieb und den automatischen Tages-Reset.
                    </div>
                    <div class="hub-actions">
                        <a href="eltern_aushang.html" class="btn-action" style="background: #ec4899; color: #ffffff;">Öffnen &rarr;</a>
                        <a href="eltern_aushang.html" onclick="window.open(this.href).print(); return false;" class="btn-action btn-home">🖨️ PDF</a>
                    </div>
                </div>

                <!-- Card 2: Pädagogisches Konzept -->
                <div class="hub-card">
                    <div class="hub-badge blue">Leitung &amp; Pädagogik</div>
                    <div class="hub-card-icon">📘</div>
                    <div class="hub-card-title">Pädagogisches Konzept</div>
                    <div class="hub-card-desc">
                        Fachbegründung nach Dieter Baacke, Mehrwert aktiver Medienbildung im Freispiel (3–10 J.), 8 Kreativ-Module im Überblick und Vergleich mit kommerziellen Apps.
                    </div>
                    <div class="hub-actions">
                        <a href="app_vorstellung.html" class="btn-action">Öffnen &rarr;</a>
                        <a href="app_vorstellung.html" onclick="window.open(this.href).print(); return false;" class="btn-action btn-home">🖨️ PDF</a>
                    </div>
                </div>

                <!-- Card 3: Module & Praxishandbuch -->
                <div class="hub-card">
                    <div class="hub-badge amber">Praxis &amp; Fachkräfte</div>
                    <div class="hub-card-icon">🎨</div>
                    <div class="hub-card-title">Module &amp; Handreichung</div>
                    <div class="hub-card-desc">
                        Praxisanleitung aller 8 Kreativwerkzeuge, Daumenkino-Druckbogen &amp; Bastelanleitung, IndexedDB (<code>MedienStationDB_v5</code>) Galerie, PIN-geschütztes Fachkraft-Menü mit Kameraschutz.
                    </div>
                    <div class="hub-actions">
                        <a href="features.html" class="btn-action">Öffnen &rarr;</a>
                        <a href="features.html" onclick="window.open(this.href).print(); return false;" class="btn-action btn-home">🖨️ PDF</a>
                    </div>
                </div>

                <!-- Card 4: Roadmap & Qualitätssicherung -->
                <div class="hub-card">
                    <div class="hub-badge purple">Technik &amp; Entwicklung</div>
                    <div class="hub-card-icon">📋</div>
                    <div class="hub-card-title">Roadmap &amp; Analyse</div>
                    <div class="hub-card-desc">
                        Detaillierte Bestandsaufnahme, Architektur-Analyse, Storage Engine Gehärtet, Inklusionsmaßnahmen, Low-Power Optimierung und künftige Meilensteine.
                    </div>
                    <div class="hub-actions">
                        <a href="todo.html" class="btn-action">Öffnen &rarr;</a>
                        <a href="todo.html" onclick="window.open(this.href).print(); return false;" class="btn-action btn-home">🖨️ PDF</a>
                    </div>
                </div>

                <!-- Card 5: Datenschutzerklärung -->
                <div class="hub-card">
                    <div class="hub-badge green">Recht &amp; KDG</div>
                    <div class="hub-card-icon">🔒</div>
                    <div class="hub-card-title">Datenschutzerklärung</div>
                    <div class="hub-card-desc">
                        Offizielle Datenschutzerklärung nach KDG und DSGVO mit Erläuterung des automatischen täglichen Galerie-Resets und Betroffenenrechten.
                    </div>
                    <div class="hub-actions">
                        <a href="datenschutz.html" class="btn-action">Öffnen &rarr;</a>
                        <a href="datenschutz.html" onclick="window.open(this.href).print(); return false;" class="btn-action btn-home">🖨️ PDF</a>
                    </div>
                </div>

                <!-- Card 6: Impressum & Lizenzen -->
                <div class="hub-card">
                    <div class="hub-badge blue">Rechtliches &amp; Lizenzen</div>
                    <div class="hub-card-icon">🏛️</div>
                    <div class="hub-card-title">Impressum &amp; Lizenzen</div>
                    <div class="hub-card-desc">
                        Anbieterkennzeichnung gemäß § 5 DDG, Vertretungsberechtigte der Diözese Augsburg KdöR und Nachweise aller Open-Source-Lizenzen (MediaPipe, Tailwind, JSZip, Vite).
                    </div>
                    <div class="hub-actions">
                        <a href="impressum.html" class="btn-action">Impressum</a>
                        <a href="lizenzen.html" class="btn-action btn-home">Lizenzen</a>
                    </div>
                </div>

            </div>

            <hr>

            <h2>🖨️ Anleitung zum PDF-Export für die Akten</h2>
            <ol>
                <li>Öffnen Sie das gewünschte Dokument über die Schaltfläche <strong>„Öffnen“</strong>.</li>
                <li>Klicken Sie oben rechts auf die Schaltfläche <strong>„🖨️ Drucken / PDF“</strong> (oder drücken Sie <code>Strg + P</code> bzw. <code>Cmd + P</code>).</li>
                <li>Wählen Sie im Druckdialog Ihres Browsers als Ziel <strong>„Als PDF speichern“</strong> aus.</li>
                <li>Die Kopf- und Navigationszeilen werden im Druckmodus automatisch ausgeblendet; das Layout formatiert sich exakt auf DIN-A4 mit sauberen Seitenumbrüchen.</li>
            </ol>

        </article>
    </main>

</body>
</html>
"""
    return html

def generate_kita_einrichtung_html(is_public_docs=False):
    header = get_nav_header("kita", is_public_docs)

    html = f"""<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MedienStation – Kita-Einrichtungshilfe &amp; Kiosk-Checkliste</title>
    <style>
{SHARED_CSS}
        .step-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.25rem;
            margin: 1.5rem 0;
        }}
        .step-box {{
            background: rgba(15, 23, 42, 0.7);
            border: 1px solid var(--border);
            border-radius: 0.9rem;
            padding: 1.25rem;
        }}
        .step-box h3 {{
            margin-top: 0;
            color: #fbbf24;
        }}
        .checklist {{
            list-style: none;
            padding-left: 0;
        }}
        .checklist li {{
            padding: 0.45rem 0;
            border-bottom: 1px dashed rgba(148, 163, 184, 0.25);
        }}
        @media print {{
            .step-box {{
                background: #f8fafc !important;
                border: 1px solid #cbd5e1 !important;
                break-inside: avoid;
            }}
            .step-box h3 {{
                color: #0f172a !important;
            }}
        }}
    </style>
</head>
<body>

{header}

    <main class="container">
        <article class="doc-card">
            <h1>Kita-Einrichtungshilfe &amp; Kiosk-Checkliste</h1>
            <div class="doc-subtitle">In 5 Minuten startklar für das sichere Freispiel auf iPad &amp; Android-Tablet</div>

            <div class="doc-meta">
                <div><strong>Produkt:</strong> MedienStation v{VERSION}</div>
                <div><strong>Einsatzort:</strong> Kita-Gruppenraum, Vorschule, Medienkoffer</div>
                <div><strong>Betriebsart:</strong> 100 % lokal &amp; offline-fähig (ohne Konten)</div>
                <div><strong>Standard-PIN (Fachkraft-Menü):</strong> <code>1234</code> (bitte direkt ändern!)</div>
            </div>

            <h2>1. MedienStation als App installieren (PWA)</h2>
            <div class="step-grid">
                <div class="step-box">
                    <h3>🍎 iPad (iPadOS Safari)</h3>
                    <ol>
                        <li>Die URL der MedienStation in <strong>Safari</strong> öffnen (nicht in Chrome).</li>
                        <li>Oben rechts auf das <strong>Teilen-Symbol</strong> (Viereck mit Pfeil nach oben) tippen.</li>
                        <li><strong>„Zum Home-Bildschirm“</strong> wählen und mit <strong>„Hinzufügen“</strong> bestätigen.</li>
                        <li>Die App ab sofort über das neue <strong>MedienStation-Icon</strong> starten (Vollbild ohne Browserleiste).</li>
                    </ol>
                </div>
                <div class="step-box">
                    <h3>🤖 Android-Tablet (Chrome)</h3>
                    <ol>
                        <li>Die URL der MedienStation in <strong>Google Chrome</strong> öffnen.</li>
                        <li>Auf das Banner <strong>„App installieren“</strong> oder oben rechts auf das Menü <strong>(⋮)</strong> tippen.</li>
                        <li><strong>„App installieren“</strong> bzw. <strong>„Zum Startbildschirm zufügen“</strong> auswählen.</li>
                        <li>Die App über das Startbildschirm-Icon starten – sie lädt alle KI-Modelle automatisch für den Offline-Betrieb.</li>
                    </ol>
                </div>
            </div>

            <h2>2. Echter Kiosk-Schutz (Kinder bleiben sicher in der App)</h2>
            <p>Eine Web-App allein kann die Home-Geste des Tablets nicht sperren. Aktivieren Sie daher vor dem Freispiel den eingebauten Kiosk-Schutz des Tablets – das dauert 3 Sekunden:</p>
            <div class="step-grid">
                <div class="step-box">
                    <h3>🍎 iPad: „Geführter Zugriff“</h3>
                    <p><strong>Einmalig einrichten:</strong> <em>Einstellungen &rarr; Bedienungshilfen &rarr; Geführter Zugriff</em> aktivieren und einen eigenen Code festlegen.</p>
                    <p><strong>Im Kita-Alltag:</strong> MedienStation öffnen &rarr; <strong>3× schnell auf die Seitentaste / Home-Taste drücken</strong> &rarr; <em>Starten</em>. Zum Beenden erneut 3× drücken und Code eingeben.</p>
                </div>
                <div class="step-box">
                    <h3>🤖 Android: „App anheften / Fixieren“</h3>
                    <p><strong>Einmalig einrichten:</strong> <em>Einstellungen &rarr; Sicherheit &rarr; App-Anheften (Bildschirm fixieren)</em> aktivieren + Entsperr-PIN einschalten.</p>
                    <p><strong>Im Kita-Alltag:</strong> App-Übersicht öffnen &rarr; auf das MedienStation-Icon tippen &rarr; <strong>„Anheften“</strong> wählen. Kinder können die App nicht mehr verlassen.</p>
                </div>
            </div>

            <h2>3. Drucken &amp; Haptische Brücke einrichten</h2>
            <ul>
                <li><strong>WLAN-Drucker / AirPrint / Fotodrucker:</strong> Tablet und Drucker müssen im selben WLAN sein (oder per Wi-Fi Direct verbunden). Beim ersten Drucken im System-Dialog einfach den Kita-Drucker bzw. die installierte Drucker-App auswählen.</li>
                <li><strong>Tipp für Daumenkinos &amp; Entdecker-Karten:</strong> Auf festem Papier (ab 160 g/m²) drucken. Die 12 <em>Entdecker-Karten</em> (im Menü unter <code>💡 INFO</code>) einmalig ausdrucken und laminieren – sie geben Kindern im Freispiel sofort kreative Impulse.</li>
            </ul>

            <h2>4. Fachkraft-Menü &amp; Datenschutz im Alltag (⚙️ Einstellungen)</h2>
            <div class="callout">
                <div class="callout-title">🔐 Wichtiger erster Schritt: Standard-PIN ändern!</div>
                <p style="margin-bottom: 0;">Tippen Sie im Hauptmenü oben rechts auf <strong>⚙️ EINSTELLUNGEN</strong> (Standard-PIN: <code>1234</code>) und legen Sie unter <strong>„🔐 PIN ändern“</strong> eine eigene 4-stellige Kita-PIN fest.</p>
            </div>
            <ul>
                <li><strong>📷 Foto- &amp; Kamera-Datenschutz:</strong> Nimmt ein Kind ohne elterliche Fotoeinwilligung am Freispiel teil? Ein Klick auf <strong>„🔒 Kamera pausieren“</strong> sperrt sofort alle 5 Kamera-Apps; <em>Musik</em>, <em>Mikro</em> und <em>Pixel Art</em> bleiben voll nutzbar.</li>
                <li><strong>🔊 Lautstärke &amp; Mittagsruhe:</strong> Wählen Sie zwischen <em>Normal (100 %)</em>, <em>Flüstern (35 %)</em> und <em>Stumm (0 %)</em> – gilt für Klicks, Sprachausgabe, Musik Labor, Mikro Check und Galerie.</li>
                <li><strong>🛡️ Tages-Reset vs. Projekt-Modus:</strong> Standardmäßig löscht die Station alle Werke vom Vortag automatisch beim Tageswechsel (DSGVO/KDG-konform). Für Projektwochen lässt sich der <em>7-Tage-Projektmodus</em> aktivieren.</li>
                <li><strong>📥 Portfolio-Export:</strong> Über <strong>„Als ZIP herunterladen“</strong> sichern Fachkräfte alle Werke des Tages mit einem Klick lokal auf dem Tablet (ohne Cloud).</li>
            </ul>

            <h2>5. 2-Minuten-Checkliste vor dem ersten Kinder-Einsatz</h2>
            <ul class="checklist">
                <li>☐ <strong>MedienStation</strong> über das Home-Bildschirm-Icon gestartet und gewartet, bis das blaue Update-/Caching-Fenster bei <strong>100 %</strong> fertig ist.</li>
                <li>☐ Im Fachkraft-Menü (<code>⚙️</code>) die <strong>PIN geändert</strong> und die <strong>Hardware-Diagnose</strong> geprüft (Kamera ✅, Mikrofon ✅, Speicher ✅).</li>
                <li>☐ Einmal kurz <em>Zauber Selfie</em> und <em>Mikro Check</em> geöffnet und die System-Abfragen für <strong>Kamera &amp; Mikrofon</strong> mit „Erlauben“ bestätigt.</li>
                <li>☐ Kurzer <strong>Offline-Test</strong>: Flugmodus kurz einschalten – alle 8 Apps öffnen sich ohne WLAN.</li>
                <li>☐ <strong>Geführter Zugriff</strong> (iPad) bzw. <strong>App-Anheften</strong> (Android) einmal getestet.</li>
            </ul>
        </article>
    </main>

</body>
</html>
"""
    return html


def generate_eltern_aushang_html(is_public_docs=False):
    header = get_nav_header("eltern", is_public_docs)

    html = f"""<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MedienStation – Eltern-Information &amp; Kita-Aushang</title>
    <style>
{SHARED_CSS}
        .poster-hero {{
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(56, 189, 248, 0.14));
            border: 2px solid rgba(245, 158, 11, 0.5);
            border-radius: 1rem;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            text-align: center;
        }}
        .poster-hero h1 {{
            margin-bottom: 0.4rem;
            font-size: 2rem;
        }}
        .poster-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 1rem;
            margin: 1.25rem 0;
        }}
        .poster-box {{
            background: rgba(15, 23, 42, 0.72);
            border: 1px solid var(--border);
            border-radius: 0.9rem;
            padding: 1.1rem 1.25rem;
        }}
        .poster-box h3 {{
            margin-top: 0;
            margin-bottom: 0.5rem;
            color: #fbbf24;
            font-size: 1.1rem;
        }}
        .promise-strip {{
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.75rem;
            margin: 1.25rem 0;
            text-align: center;
        }}
        .promise-item {{
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.45);
            border-radius: 0.8rem;
            padding: 0.8rem 0.6rem;
            font-size: 0.9rem;
        }}
        .promise-item strong {{
            display: block;
            color: #34d399;
            font-size: 1rem;
            margin-bottom: 0.2rem;
        }}
        .kita-footer-note {{
            margin-top: 1.25rem;
            padding: 1rem 1.25rem;
            border-radius: 0.85rem;
            background: rgba(56, 189, 248, 0.1);
            border: 1px solid rgba(56, 189, 248, 0.35);
            font-size: 0.92rem;
        }}
        @media print {{
            @page {{ size: A4; margin: 12mm; }}
            .container {{ padding: 0 !important; margin: 0 !important; max-width: 100% !important; }}
            .doc-card {{ padding: 0 !important; border: none !important; box-shadow: none !important; }}
            .poster-hero {{
                background: #fffbeb !important;
                border: 2px solid #d97706 !important;
                padding: 1rem !important;
                margin-bottom: 0.9rem !important;
            }}
            .poster-hero h1 {{ font-size: 1.65rem !important; color: #0f172a !important; }}
            .poster-grid {{ gap: 0.75rem !important; margin: 0.8rem 0 !important; grid-template-columns: 1fr 1fr !important; }}
            .poster-box {{
                background: #f8fafc !important;
                border: 1px solid #cbd5e1 !important;
                padding: 0.85rem !important;
                break-inside: avoid;
            }}
            .poster-box h3 {{ color: #0f172a !important; font-size: 1rem !important; }}
            .promise-item {{
                background: #ecfdf5 !important;
                border: 1px solid #059669 !important;
                padding: 0.65rem 0.5rem !important;
            }}
            .promise-item strong {{ color: #065f46 !important; }}
            .kita-footer-note {{
                background: #f0f9ff !important;
                border: 1px solid #0284c7 !important;
                padding: 0.8rem 1rem !important;
            }}
            p, li {{ font-size: 0.92rem !important; line-height: 1.42 !important; }}
        }}
    </style>
</head>
<body>

{header}

    <main class="container">
        <article class="doc-card">
            <div class="poster-hero">
                <div style="font-size: 2.2rem; margin-bottom: 0.25rem;">🎨 🎙️ 🎬 ✨</div>
                <h1>Liebe Eltern, bei uns steht die MedienStation!</h1>
                <div class="doc-subtitle" style="margin-bottom: 0;">Kreativer digitaler Malkasten statt passivem Bildschirm-Konsum</div>
            </div>

            <p>In unserer Einrichtung nutzen die Kinder im pädagogisch begleiteten Freispiel die <strong>MedienStation</strong> (entwickelt von der AV-Medienzentrale Bistum Augsburg). Anders als klassische Spiele-Apps oder Videos schauen die Kinder hier nicht einfach zu – sie werden selbst zu kleinen <strong>Regisseuren, Musikern, Fotografen und Geschichtenerzählern</strong>.</p>

            <div class="promise-strip">
                <div class="promise-item">
                    <strong>🔒 100 % ohne Internet</strong>
                    Keine Cloud, kein Tracking, keine Werbung, keine Konten.
                </div>
                <div class="promise-item">
                    <strong>🧹 Täglicher Auto-Reset</strong>
                    Alle Bilder &amp; Töne werden beim Tageswechsel automatisch gelöscht.
                </div>
                <div class="promise-item">
                    <strong>📷 Foto-Schutz</strong>
                    Kamera-Apps sind per 1 Klick pausierbar – jedes Kind kann mitmachen.
                </div>
            </div>

            <div class="poster-grid">
                <div class="poster-box">
                    <h3>🚀 Was machen die Kinder damit?</h3>
                    <ul style="margin-bottom: 0; padding-left: 1.1rem;">
                        <li><strong>🎹 Musik &amp; 🎙️ Mikro:</strong> Eigene Geräusche, Beats &amp; Sprachaufnahmen erforschen.</li>
                        <li><strong>👾 Pixel Art &amp; 📸 Comic:</strong> Muster malen und eigene Bildergeschichten erzählen.</li>
                        <li><strong>🎬 Trickfilm &amp; ✨ Zauber-Selfie:</strong> Kleine Stop-Motion-Filme drehen oder Fantasie-Kulissen entdecken.</li>
                        <li><strong>🖨️ Zum Anfassen:</strong> Ausgewählte Werke können als Bild oder Daumenkino ausgedruckt werden.</li>
                    </ul>
                </div>

                <div class="poster-box">
                    <h3>🛡️ Wie schützen wir die Daten Ihres Kindes?</h3>
                    <ul style="margin-bottom: 0; padding-left: 1.1rem;">
                        <li><strong>Nur auf dem Kita-Tablet:</strong> Kein einziges Foto und keine Tonaufnahme verlässt das Gerät.</li>
                        <li><strong>Kein Profil, kein Name:</strong> Es werden keinerlei Kinderdaten oder Logins gespeichert.</li>
                        <li><strong>Respekt für Ihre Entscheidung:</strong> Liegt keine Fotoerlaubnis vor, schaltet die Fachkraft alle Kamera-Apps mit einem Klick stumm – Musik, Mikro und Pixel Art bleiben nutzbar.</li>
                        <li><strong>Rechtskonform:</strong> Geprüft nach KDG / DSGVO und EU AI Act (lokale Verarbeitung).</li>
                    </ul>
                </div>
            </div>

            <div class="kita-footer-note">
                <strong>💬 Fragen oder neugierig?</strong> Sprechen Sie unser pädagogisches Team jederzeit gerne an – wir zeigen Ihnen die MedienStation sehr gerne direkt am Tablet! Weitere Infos &amp; Datenschutzerklärung finden Sie direkt in der App unter <em>💡 INFO</em>.
            </div>
        </article>
    </main>

</body>
</html>
"""
    return html


def update_html_files():
    print("Building and synchronizing all HTML documentation...")

    # 1. Freigabe IT & Datenschutz HTML
    root_freigabe = generate_freigabe_html(is_public_docs=False)
    pub_freigabe = generate_freigabe_html(is_public_docs=True)

    with open(os.path.join(BASE_DIR, "FREIGABE_IT_DATENSCHUTZ.html"), "w", encoding="utf-8") as f:
        f.write(root_freigabe)
    with open(os.path.join(BASE_DIR, "DATENSCHUTZ_IT_FREIGABE.html"), "w", encoding="utf-8") as f:
        f.write(root_freigabe)
    with open(os.path.join(BASE_DIR, "security.html"), "w", encoding="utf-8") as f:
        f.write(root_freigabe)

    with open(os.path.join(PUBLIC_DOCS_DIR, "FREIGABE_IT_DATENSCHUTZ.html"), "w", encoding="utf-8") as f:
        f.write(pub_freigabe)
    with open(os.path.join(PUBLIC_DOCS_DIR, "DATENSCHUTZ_IT_FREIGABE.html"), "w", encoding="utf-8") as f:
        f.write(pub_freigabe)
    with open(os.path.join(PUBLIC_DOCS_DIR, "security.html"), "w", encoding="utf-8") as f:
        f.write(pub_freigabe)

    # 2. Hub / Übersicht HTML
    root_hub = generate_hub_html(is_public_docs=False)
    pub_hub = generate_hub_html(is_public_docs=True)

    with open(os.path.join(BASE_DIR, "DOKUMENTATION.html"), "w", encoding="utf-8") as f:
        f.write(root_hub)
    with open(os.path.join(BASE_DIR, "docs.html"), "w", encoding="utf-8") as f:
        f.write(root_hub)

    with open(os.path.join(PUBLIC_DOCS_DIR, "index.html"), "w", encoding="utf-8") as f:
        f.write(pub_hub)
    with open(os.path.join(PUBLIC_DOCS_DIR, "docs.html"), "w", encoding="utf-8") as f:
        f.write(pub_hub)

    # 2b. Kita-Einrichtungshilfe & Kiosk-Checkliste HTML
    root_kita = generate_kita_einrichtung_html(is_public_docs=False)
    pub_kita = generate_kita_einrichtung_html(is_public_docs=True)

    with open(os.path.join(BASE_DIR, "kita_einrichtung.html"), "w", encoding="utf-8") as f:
        f.write(root_kita)
    with open(os.path.join(PUBLIC_DOCS_DIR, "kita_einrichtung.html"), "w", encoding="utf-8") as f:
        f.write(pub_kita)

    # 2c. Eltern-Aushang (1 Seite DIN-A4 PDF)
    root_eltern = generate_eltern_aushang_html(is_public_docs=False)
    pub_eltern = generate_eltern_aushang_html(is_public_docs=True)

    with open(os.path.join(BASE_DIR, "eltern_aushang.html"), "w", encoding="utf-8") as f:
        f.write(root_eltern)
    with open(os.path.join(PUBLIC_DOCS_DIR, "eltern_aushang.html"), "w", encoding="utf-8") as f:
        f.write(pub_eltern)

    # 3. Synchronize existing files with updated versions & headers
    for doc in ["app_vorstellung.html", "features.html", "todo.html", "datenschutz.html", "impressum.html", "lizenzen.html"]:
        root_path = os.path.join(BASE_DIR, doc)
        pub_path = os.path.join(PUBLIC_DOCS_DIR, doc)
        
        if os.path.exists(root_path):
            with open(root_path, "r", encoding="utf-8") as f:
                content = f.read()
                
            # Remove external Google Fonts links (DSGVO / offline compliance)
            content = "\n".join(
                line for line in content.splitlines()
                if "fonts.googleapis.com" not in line and "fonts.gstatic.com" not in line
            ) + "\n"

            # Replace old versions
            content = content.replace("v7.9.6 (Build 316)", f"v{VERSION} (Build {BUILD})")
            content = content.replace("v7.9.6 (Build 311)", f"v{VERSION} (Build {BUILD})")
            content = content.replace("v7.9.6", f"v{VERSION}")
            content = content.replace("Build 316", f"Build {BUILD}")
            content = content.replace("Build 311", f"Build {BUILD}")
            content = content.replace("September 2026", DATE_STR)
            
            with open(root_path, "w", encoding="utf-8") as f:
                f.write(content)
                
            # Copy or adapt for public/docs
            pub_content = content.replace('href="index.html?skip_splash=1"', 'href="../index.html?skip_splash=1"')
            with open(pub_path, "w", encoding="utf-8") as f:
                f.write(pub_content)

    print("All documentation HTML files built successfully!")

if __name__ == "__main__":
    update_html_files()
