# 📋 MedienStation – Roadmap, Fachanalyse & TODOs

> **Fachlich-kritische Bestandsaufnahme, Architektur-Analyse und strategische Weiterentwicklung**
> *Stand: September 2026 (Version v7.9.2 / Build 307)*

---

## 🎯 1. Fazit & Positionierung am Markt

Die MedienStation löst ein massives Kernproblem im Bildungsbereich: **Sie ermöglicht aktive Medienproduktion im Kita- und Grundschul-Freispiel ohne IT-Verwaltungsaufwand, ohne Nutzerkonten und zu 100 % DSGVO-konform.**

Sie konkurriert nicht mit hochkomplexer Produktionssoftware für Jugendliche/Erwachsene, sondern fungiert als **niedrigschwelliger digitaler Kreativ-Malkasten**.

---

## 📊 2. Marktvergleich & Fachbewertung

| Kriterium | **MedienStation** | **Kommerzielle Einzel-Apps** *(Stop Motion Pro, Book Creator)* | **Lernplattformen** *(Anton, Edurino)* | **Digitale Medientische** *(proprietär)* |
| :--- | :---: | :---: | :---: | :---: |
| **Pädagogisches Konzept** | 🥇 **Aktive Medienproduktion** | Professionelle Medienproduktion | Passiver Lernstoff-Konsum / Gamification | Meist Spiele & Puzzles |
| **Freispiel-Tauglichkeit (3–8 J.)** | 🥇 **Sehr hoch** (Kiosk, kein Login) | 🔴 Niedrig (benötigt ständige Begleitung) | 🟡 Mittel (Belohnungssysteme binden an Screen) | 🟢 Hoch |
| **Datenschutz & DSGVO** | 🥇 **100 % lokal / No Cloud** | ⚠️ Oft Cloud-, Account- & MDM-Pflicht | ⚠️ Account- & AVV-Pflicht | 🟢 Meist lokal |
| **Wartung & Kosten** | 🥇 **0 € Folgekosten / PWA Auto-Update** | ❌ Abos / Kauflizenzen pro Gerät | ❌ Schullizenzen | ❌ 5.000 € – 15.000 € Hardware |
| **Haptische Brücke (Druck)** | 🥇 **Direkter Foto-/Daumenkino-Druck** | 🟡 Nur digitaler Export | ❌ Reines Bildschirm-Erlebnis | 🟡 Selten angebunden |

---

## 🔍 3. Identifizierte Schwachstellen & Herausforderungen

### 🟢 1. Speichersystem: Ausfallsicheres `IndexedDB` v4 Engine (Gehärtet in v7.8.9)
* **Status:** Die Galerie der Meisterwerke speichert Bilder, Audio und Video-Daten in `IndexedDB` (`MedienStationDB_v4`).
* **Vorteil:** Navigation-Safe Sync-First Pattern schützt vor Abbrüchen bei Seitenwechseln. Automatischer PWA-Speicherschutz (`navigator.storage.persist()`), Einzellöschung (`🗑️`), Fullscreen-Lightbox & Speicher-Auslastungsanzeige.

### ⚠️ 2. Performance & Hitzeentwicklung auf Einsteiger-Hardware
* **Status:** Lokale KI-Segmentierung (*MediaPipe Selfie Segmentation*) und Canvas-Rendering laufen voll auf Client-Hardware.
* **Problem:** Günstige Android-Tablets oder ältere iPads können bei dauerhafter Nutzung warm werden oder Framerate-Einbrüche verzeichnen.
* **Ziel:** Automatisches Hardware-Profiling / dynamische Drosselung der Video-Auflösung auf Low-End-Geräten.

### 🟢 3. Fehlende Projekt-Persistenz gelöst: Fachkraft-Admin-Menü (Erledigt in v7.8.0 / v7.8.1)
* **Status:** Konfigurierbarer Speicher-Modus (Strenger Tages-Reset vs. 7-Tage-Projektmodus) schützt Daten und ermöglicht gleichzeitig Projektwochen.

### ⚠️ 4. Feinmotorische Barrieren
* **Status:** Das Ziehen sehr kleiner Sprechblasen-Griffe (*Comic*) oder winziger Buttons erfordert teils zu hohe Präzision für 3- bis 4-Jährige.
* **Ziel:** Größere Touch-Zonen (min. 56×56px) und vereinfachte Touch-Gesten für motorisch jüngere Kinder.

---

## 🚀 4. Actionable TODOs & Entwicklungs-Roadmap

### 🟢 Phase 1: High Priority (Architektur & Storage)
- [x] **Storage-Upgrade & Härtung auf `IndexedDB`** (Erledigt in v7.8.9):
  - `public/js/common.js`: Ausfallsicheres `MedienStationDB_v4` v2 Speichersystem mit `navigator.storage.persist()`, Navigation-Safe Sync-First Puffer, Einzellöschen (`deleteMeisterwerk()`), Fullscreen-Lightbox & Speicherbelegungs-Anzeige.
- [x] **Echte Video-Wiedergabe in der Galerie**:
  - Video-Snippets und Player in Galerie integriert.

### 🟡 Phase 2: Medium Priority (Pädagogen-Werkzeuge & Inklusion)
- [x] **Pädagogen- & Admin-Bereich (PIN-geschützt)** (Erledigt in v7.8.0 / v7.8.1):
  - Diskreter Zugang (5× Tippen auf "Deine Mission" + PIN `1234`, PIN änderbar).
  - Funktionen:
    - 🔒 Konfigurierbarer Datenschutz: Strenger Tages-Reset (Standard / DSGVO) vs. Projekt-Modus (7 Tage pausieren) vs. Dauerhaft.
    - 📊 Live-Speicherstatus der Meisterwerke.
    - 🧹 Sofortige Galerie-Leerung auf Knopfdruck.
    - 🧹 Cache leeren & Update erzwingen.
    - 🏠 Klare Navigationsrückkehr zur App & visuelle Gespeichert-Badges.
- [x] **Sammel-Export / Portfolio-Download für Fachkräfte** (Erledigt in v7.8.0 / v7.8.1):
  - **Hintergrund:** Kinder erstellen tolle Werke; Erzieher und Lehrkräfte möchten diese gesammelt auf USB-Stick ziehen oder für Portfolio-Mappen und Elternarbeit sichern.
  - **Funktionen:**
    - 📥 "Als ZIP herunterladen"-Button **exklusiv im PIN-geschützten Fachkraft-Menü** (zum Schutz vor Fehlbedienung & Download-Spamming im Kinder-Freispiel).
    - Automatische strukturierte Benennung nach Modul, Datum und Uhrzeit (z. B. `01_foto_2026-09-18_14-30.png`, `02_trickfilm_2026-09-18_14-35.webm`).
    - Beiliegende `Uebersicht.txt` mit Auflistung aller Titel, Typen und Erstellungszeiten.
    - 100 % offline-fähig über integriertes JSZip.

### 🔵 Phase 3: UX, Performance, Accessibility & Haptische Brücke (Erledigt in v7.8.9)
- [x] **UX- & Feinmotorik-Polish für jüngere Kinder (3–4 Jahre)** (Erledigt in v7.8.9):
  - 🖐️ **Touch-Area-Vergrößerung:** Größere Ziehgriffe (min. 56×56 px) für Sprechblasen in `comic.html`.
  - 📳 **Haptisches Feedback:** Sanfte Vibration (`navigator.vibrate`) bei Auslöser, Aufnahmestart/Stopp und Speichern.
  - 🔔 **Akustisches Feedback:** Bestätigungssounds beim Speichern in der Galerie.
  - 📷 **Kamera-Berechtigungs-Overlay:** Kindgerechtes Fehler-Handling bei blockierter oder fehlender Kamera (`handleCamError`).
- [x] **Low-Power-Modus & Performance für Zauber Selfie** (Erledigt in v7.8.9):
  - Echtzeit-FPS-Überwachung: Wenn unter 22 FPS, automatisches Frame-Skipping zur Reduktion von Hitzeentwicklung und Akkuverbrauch auf günstigen Tablets.
- [x] **Erweiterte Inklusions-Hilfen & Vorlese-Animation** (Erledigt in v7.8.9):
  - `window.speakText` mit visueller Button-Pulsation (`animate-pulse`) und automatischer Emoji-Bereinigung.
- [x] **Daumenkino-Druckvorlagen-Polish & Bastelanleitung** (Erledigt in v7.8.9):
  - **Druckbogen:** Gestrichelte Schneidelinien (`✂️`), Heftzone (`📌 HIER TACKERN`), Bildnummerierung (`Bild #1`-`#9`) und Anleitung auf DIN-A4 Ausdruck.
  - **Pädagogische Erklärung:** Ausführliche Bastelanleitung ("Was ist ein Daumenkino & wie entsteht die Kino-Illusion im Auge?") im Info-Modal des Trickfilm Studios.
