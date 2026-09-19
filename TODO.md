# 📋 MedienStation – Roadmap, Fachanalyse & TODOs

> **Fachlich-kritische Bestandsaufnahme, Architektur-Analyse und strategische Weiterentwicklung**
> *Stand: September 2026 (Version v7.9.6 / Build 311)*

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

### 🟡 Phase 2: Medium Priority (Pädagogen-Werkzeuge, Schutz & Inklusion)
- [x] **Pädagogen- & Fachkraft-Menü (PIN-geschützt)** (Vollständig ausgebaut in v7.9.6):
  - **Zugang:** Dezidierter Header-Button *"⚙️ Einstellungen"* (sowie diskreter Notfall-Zugang über 5× Tippen auf *"Deine Mission"*).
  - **Tablet-Touch-Numpad:** Großes Touch-Zahlenfeld für 4-stellige PIN-Eingabe und PIN-Änderung (ersetzt störende Browser-`prompt()`-Dialoge).
  - **Funktionen:**
    - 🔊 **Master-Lautstärke & Ruhemodus:**
      - Normal (100% Lautstärke für aktiven Gruppenraum).
      - Flüstermodus (35% Lautstärke zur akustischen Entlastung der Erzieher/innen).
      - Stumm (0% Lautstärke für Mittagsruhe / Schlafräume – Töne & Sprachausgabe pausiert).
    - 📷 **Foto- & Kamera-Datenschutz (Freispiel-Schutz):**
      - 1-Klick-Pausierung aller 5 Kamera-Apps (*Zauber Selfie*, *Video Loop*, *Nachrichten*, *Trickfilm*, *Comic*).
      - Schutz für Gruppen, in denen Kinder ohne elterliche Fotoerlaubnis am Freispiel teilnehmen.
      - Kindgerechte visuelle Sperr-Badges (*"🔒 PAUSIERT"*) und freundliche Sprach-/Text-Meldung.
    - 🩺 **Hardware- & Sensor-Diagnose:**
      - Live-Statuscheck für Kamera, Mikrofon, lokalen IndexedDB-Speicher (MB-Belegung) und WLAN/Netzwerk.
    - 🔒 **Datenschutz & Auto-Reset:** Strenger Tages-Reset (Standard / DSGVO) vs. Projekt-Modus (7 Tage pausieren) vs. Dauerhaft.
    - 📊 **Live-Speicherstatus & Galerie-Verwaltung:** Sofortige Galerie-Leerung und Speicherüberwachung.
    - 📥 **Portfolio- & Sammel-Export:** ZIP-Download aller Werke inklusive `Uebersicht.txt` exklusiv im Fachkraft-Menü.
    - ⚡ **Sicheres Cache leeren & Update erzwingen:** Mit integrierter `navigator.onLine`-Prüfung gegen versehentliches Löschen im Offline-Zustand.

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
