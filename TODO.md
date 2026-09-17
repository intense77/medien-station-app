# 📋 MedienStation – Roadmap, Fachanalyse & TODOs

> **Fachlich-kritische Bestandsaufnahme, Architektur-Analyse und strategische Weiterentwicklung**
> *Stand: September 2026 (Version v7.7.0)*

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

### 🟢 1. Speichersystem: Auf `IndexedDB` migriert (Erledigt in v7.7.0)
* **Status:** Die Galerie der Meisterwerke speichert Bilder, Audio und Video-Daten in `IndexedDB` (`MedienStationDB`).
* **Vorteil:** Das 5-MB-Limit von `localStorage` ist aufgehoben, Hunderte Megabyte Speicher für hochauflösende Fotos und Videos sind verfügbar.

### ⚠️ 2. Performance & Hitzeentwicklung auf Einsteiger-Hardware
* **Status:** Lokale KI-Segmentierung (*MediaPipe Selfie Segmentation*) und Canvas-Rendering laufen voll auf Client-Hardware.
* **Problem:** Günstige Android-Tablets oder ältere iPads können bei dauerhafter Nutzung warm werden oder Framerate-Einbrüche verzeichnen.
* **Ziel:** Automatisches Hardware-Profiling / dynamische Drosselung der Video-Auflösung auf Low-End-Geräten.

### ⚠️ 3. Fehlende Projekt-Persistenz über mehrere Tage
* **Status:** Der automatische Tages-Reset um 04:00 Uhr schützt die Daten zuverlässig, löscht aber auch begonnene Langzeitprojekte.
* **Problem:** Mehrtägige Stop-Motion- oder Comic-Projekte in Projektwochen können nicht nahtlos am nächsten Tag fortgesetzt werden.
* **Ziel:** PIN-geschützte Option für Fachkräfte zum "Projekt sperren / behalten" oder lokaler Export/Import.

### ⚠️ 4. Feinmotorische Barrieren
* **Status:** Das Ziehen sehr kleiner Sprechblasen-Griffe (*Comic*) oder winziger Buttons erfordert teils zu hohe Präzision für 3- bis 4-Jährige.
* **Ziel:** Größere Touch-Zonen (min. 56×56px) und vereinfachte Touch-Gesten für motorisch jüngere Kinder.

---

## 🚀 4. Actionable TODOs & Entwicklungs-Roadmap

### 🟢 Phase 1: High Priority (Architektur & Storage)
- [x] **Storage-Upgrade auf `IndexedDB`** (Erledigt in v7.7.0):
  - `public/js/common.js`: Meisterwerke-Speichersystem von `localStorage` auf `IndexedDB` migriert mit automatischer Datenübernahme & Fallback.
- [x] **Echte Video-Wiedergabe in der Galerie**:
  - Video-Snippets und Player in Galerie integriert.

### 🟡 Phase 2: Medium Priority (Pädagogen-Werkzeuge & Inklusion)
- [x] **Pädagogen- & Admin-Bereich (PIN-geschützt)** (Erledigt in v7.8.0):
  - Diskreter Zugang (5× Tippen auf "Deine Mission" + PIN `1234`, PIN änderbar).
  - Funktionen:
    - 🔒 Konfigurierbarer Datenschutz: Strenger Tages-Reset (Standard / DSGVO) vs. Projekt-Modus (7 Tage pausieren) vs. Dauerhaft.
    - 📊 Live-Speicherstatus der Meisterwerke.
    - 🧹 Sofortige Galerie-Leerung auf Knopfdruck.
    - 🧹 Cache leeren & Update erzwingen.
- [x] **Projekt-Export / Sammel-Download** (Erledigt in v7.8.0):
  - 100% Offline-Export aller Meisterwerke (Fotos, Comics, Videos, Audios) als strukturiertes ZIP-Archiv inklusive Inhaltsübersicht.

### 🔵 Phase 3: Low Priority & Polish (Performance & Accessibility)
- [ ] **Low-Power-Modus für Zauber Selfie**:
  - Automatische FPS-Überwachung: Wenn unter 20 FPS, Segmentierungsauflösung dynamisch auf 256×256 px skalieren.
- [ ] **Touch-Area-Vergrößerung im Comic Studio**:
  - Größere Ziehgriffe (48px+) für Sprechblasen auf Smartphones und kleinen Tablets.
- [ ] **Erweiterte Inklusions-Hilfen**:
  - Haptische Vibration bei erfolgreichem Foto-Klick / Sound-Aufnahme auf Android-Geräten.
