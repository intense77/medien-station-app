# 📖 Handreichung & Funktionsübersicht: MedienStation Hub

> **Informationen für das pädagogische Personal, Ausstellungsbetreuung, Fachkräfte und Aufsichtspersonen**  
> *Projekt: MedienStation (Version v7.9.8 / Build 335) – AV-Medienzentrale Bistum Augsburg*

Das **MedienStation Hub** ist eine interaktive Kiosk-Anwendung, die speziell für Kinder im Kita- und Grundschulalter (4–10 Jahre) entwickelt wurde. Sie lädt zum spielerischen Erkunden, Gestalten, Aufnehmen und Experimentieren mit digitalen Medien im Sinne einer aktiven, handlungsorientierten Medienpädagogik ein.

---

## 🎨 Übersicht der 8 Medien-Module

### 1. 🧙‍♂️ Zauber Selfie (Magie & Fotostudio)
* **Funktion**: KI-gestütztes Fotostudio ohne physikalischen Green-Screen.
* **Technologie**: Medienverarbeitung über lokales Machine Learning (MediaPipe Selfie Segmentation).
* **Möglichkeiten**: 
  - Auswahl verschiedener kindgerechter Hintergründe (Weltraum, Dschungel, Unterwasser, Paris, Schloss, Dino, Stadion).
  - **🏡 Eigene Kita-Hintergründe**: Fachkräfte können im Admin-Bereich bis zu 3 vertraute Fotos aus dem Kita-Alltag (z. B. Gruppenraum, Garten, Klettergerüst) hinterlegen, die automatisch mit einem Kita-Symbol in die Auswahlliste eingebunden werden.
  - Anwenden künstlerischer Filter (S/W, Sepia, Warm, Kalt).
  - Einzelbild-, Polaroid- oder 4er-Collage-Modus mit sofortiger Galerie-Ablage und Druckfunktion.
  - **📄 Direkter Portfolio-Druck**: Erzeugt per Knopfdruck (`📄 PORTFOLIO`) einen druckfertigen DIN A4 Entwicklungsdokumentations-Bogen mit Einrichtungsname, Bild und Notizlinien für die Fachkraft.
* **Pädagogischer Mehrwert**: Visuelle Gestaltung, Hintergrund-Erkundung, Selbstdarstellung und Medienkompetenz.

### 2. 🎤 Mikro Check (Audio-Labor & Interview)
* **Funktion**: Interaktiver Stimmen- und Audiorekorder mit unabhängigen Tonspuren.
* **Möglichkeiten**:
  - Zufalls-Fragen-Generator für Interviews und spontanes Antworten.
  - Stimmverfremdung in Echtzeit (Monster 🧟, Normal 🙂, Maus 🐭).
  - Visualisierung der eigenen Stimme über ein digitales Oszilloskop.
  - Automatische Bereitstellung im integrierten Audio-Player der Meisterwerke-Galerie.
* **Pädagogischer Mehrwert**: Sprachförderung, Hörverstehen, Medien-Experimente mit Akustik.

### 3. 🎹 Musik Labor (Soundboard & Rhythmus)
* **Funktion**: Digitales Touch-Soundboard zur Erstellung eigener Rhythmen und Klangcollagen.
* **Möglichkeiten**:
  - Aufnehmen eigener Töne auf 12 interaktive Sound-Pads.
  - Loop-Modus für endlose Schleifen und Beats.
  - Stimm-Effekte (Monster, Normal, Maus) und Live-Wellenformanzeige.
* **Pädagogischer Mehrwert**: Musikalische Früherziehung, Taktgefühl, Eigenkreation von Musik im Freispiel.

### 4. 📺 News Studio (Reporter-Station)
* **Funktion**: Erstellen eigener Nachrichten-Sendungen im Fernseh-Studio-Look.
* **Möglichkeiten**:
  - Live-Kamerabild in einem "Breaking News" TV-Frame.
  - Anpassen von Haupt-Schlagzeile und animiertem Lauftext (Ticker) direkt per Touch-Tastatur.
  - Sofortiges Speichern und Ausgeben als ausdruckbares Nachrichten-Foto.
* **Pädagogischer Mehrwert**: Medienkompetenz (Verstehen von Nachrichtenformaten), Journalismus, Freies Formulieren.

### 5. 🎬 Trickfilm Studio (Stop-Motion Werkstatt)
* **Funktion**: Erstellen von eigenen Stop-Motion Animationen, Daumenkinos, Tonfilmen und echten Videodateien.
* **Möglichkeiten**:
  - Live-Kameraaufnahmen mit Bildzähler.
  - **Geisterbild-Funktion (Onion Skinning)**: Transparente Überlagerung des vorherigen Frames für flüssige, präzise Bewegungsabläufe.
  - **Echtzeit-Tempo-Steuerung**: Regler von 1 bis 12 Bildern/Sekunde mit Schildkröte 🐢 und Hase 🐇 direkt in der Zeitleiste.
  - **Bild-Filter & Kamerawechsel**: Farbanpassungen und Umschalten zwischen Front- und Rückkamera.
  - **Großzügige Zeitleiste**: Große Vorschaubilder im Filmstreifen mit direkter Lösch- und Reorganisationsmöglichkeit.
  - **Tonaufnahme**: Vertonung des Films per Mikrofon.
  - **🎬 Echter Video-Export mit Ton**: Rendert die Bildfolge direkt im Browser als echtes Video (WebM / MP4 via Canvas CaptureStream und MediaRecorder) inklusive gemischter Tonspur und Mindestlaufzeit für Videoplayer.
  - **`💾 Film Speichern`**: Legt den fertigen Stop-Motion-Film als abspielbares Video (`type: 'video'`) direkt in der Galerie der Meisterwerke ab.
  - **`🖨️ Daumenkino Drucken`**: Druckt einen optimierten A4-Ausschneidebogen mit gestrichelten Schneidelinien (`✂️`), Heftzone (`📌 HIER TACKERN`), Bildnummern (`Bild #1` bis `#9`) und Kurzanleitung aus.
  - **📖 Pädagogische Bastelanleitung & Daumenkino-Erklärung**: Integrierte Erklärung im Hilfemenü (*"Was ist ein Daumenkino & wie entsteht die Kino-Illusion im Auge?"*) mit 4-Schritte-Bastelanleitung (Ausdrucken, Ausschneiden, Stapeln, Tackern).
* **Pädagogischer Mehrwert**: Verständnis von Filmaufbau und Bildfrequenz (Kino-Illusion), Feinmotorik, Raum-Bewegungskonzepte, haptisch-digitales Lernerlebnis.

### 6. 👾 Pixel Labor (Retro Digitalkunst)
* **Funktion**: Digitaler Zeichenbereich in 16×16 Raster-Optik (Kästchen-Papier).
* **Möglichkeiten**:
  - Kristallklare, karierte Zeichenfläche mit Touch- & Stiftunterstützung (Pointer Events).
  - 12 kindgerechte Farben inkl. Schwamm/Radierer und deutlichem Leucht-Aktiv-Indikator.
  - **`↩️ ZURÜCK` (Undo)** zum schrittweisen Ausbessern von Fehlern.
  - **8-Bit Retro-Soundeffekt** beim Zeichnen für direktes taktiles Feedback.
  - Schärfegetreuer Ausdruck, direkter **`📄 PORTFOLIO`**-Druckbogen und Speichern in der Galerie der Meisterwerke.
  - Einheitlicher, extragroßer **`🏠 MENÜ`**-Button für intuitive Rückkehr zur Übersicht.
* **Pädagogischer Mehrwert**: Abstraktionsvermögen, Feinmotorik, Verständnis digitaler Rastergrafik ("Pixel als Bausteine der digitalen Welt").

### 7. 📸 Comic Story (Fotogeschichten)
* **Funktion**: 3-Panel-Comic-Werkstatt mit Fotos und verschiebbaren Sprechblasen.
* **Möglichkeiten**:
  - 3 Bildrahmen mit separaten Kamera-Auslösern.
  - Frei editierbare und per Ziehgriff verschiebbare Sprechblasen.
  - **`💾 SPEICHERN`** in die Galerie der Meisterwerke und **`🖨️ DRUCKEN`** für den Papierausdruck.
* **Pädagogischer Mehrwert**: Sequentielles Erzählen (Anfang – Mitte – Ende), Sprachbildung, Leseförderung.

### 8. 🔄 Video Loop (Zeitschleife / GIF)
* **Funktion**: 2-Sekunden-Video-Endlosschleife mit Geschwindigkeitsregler.
* **Möglichkeiten**:
  - 3-Sekunden-Countdown zur Vorbereitung.
  - Video-Vor- und Rückwärts-Loop in 3 Geschwindigkeiten (Langsam, Normal, Rakete).
  - **`💾 SPEICHERN`** als 4er-Fotostreifen-Collage in die Galerie.
* **Pädagogischer Mehrwert**: Erforschung von Mimik, Gestik, Kausalität und Bewegungsabläufen.

---

## 🎨 Galerie der Meisterwerke & Speicher-Systematik

Die Station verfügt über eine zentrale **Galerie der Meisterwerke** (`apps/galerie.html` und das Galerie-Modal im Hauptmenü) mit ausfallsicherem **IndexedDB-Speicher** (`MedienStationDB_v5`) für bis zu 40 hochauflösende Werke.

### Das transparente Speicher-Prinzip:
1. **Schnappschuss-Apps (*Zauber Selfie*, *News Studio*, *Mikro Check*)**:
   - Da das Auslösen des Fotos oder das Stoppen der Tonaufnahme direkt das fertige Endprodukt liefert, landen die Werke **automatisch sofort** in der Galerie.
2. **Kreativ- & Gestaltungs-Apps (*Pixel Labor*, *Comic Story*, *Trickfilm Studio*, *Video Loop*)**:
   - Kinder arbeiten in Etappen. Hier speichern die Kinder ihr Werk nach Fertigstellung ganz bewusst mit dem goldenen **`💾 SPEICHERN`**-Button (mit Konfetti 🎉) oder drucken es direkt mit **`🖨️ DRUCKEN`** aus.

### 🛡️ PWA Speicherschutz & Kindgerechte Galerie-Funktionen:
- **Navigation-Safe Sync-First Pattern**: Sofortige synchrone Sicherung schützt Werke auch bei plötzlichem App-Wechsel.
- **PWA Persistent Storage (`navigator.storage.persist()`)**: Markiert die Galerie im OS/Browser als schützenswert vor automatischer Datenlöschung.
- **Kindgerechtes Einzellöschen (`🗑️`)**: Jedes Werk kann in der Rasteransicht einzeln gelöscht werden, ohne andere Werke zu beeinträchtigen.
- **🔍 Fullscreen-Lightbox mit Video- & Audiowiedergabe**: Klick auf ein Werk öffnet eine Großansicht mit Zoom, Audio-Player für Stimmen/Beats und echtem HTML5-Videoplayer für Stop-Motion-Filme.
- **📄 1-Klick DIN A4 Kita-Portfolio-Bogen (`📄 Portfolio`)**: Erstellt direkt aus der Galerie oder Einzel-App einen professionellen Portfolio-Bogen nach anerkannten bildungspädagogischen Standards (mit Einrichtungsname, Werktitel, Datum und liniertem Reflexions-/Beobachtungsfeld für Fachkräfte).
- **💾 Speicherbelegungs-Anzeige**: Transparente Anzeige des belegten Speicherplatzes in MB.

### 📥 100% Offline-ZIP-Export:
- Fachkräfte und Kinder können alle Werke des Tages mit einem Klick (**"📥 Alle als ZIP speichern"**) gebündelt als ZIP-Archiv inklusive Inhaltsübersicht auf USB-Stick oder PC sichern.

---

## 🔒 Datensparsamkeit & Speicher-/Löschstrategie (DSGVO)

Das MedienStation Hub erfüllt höchste Anforderungen an den Datenschutz und die Datensparsamkeit im Bildungsbereich. Das Speicher- und Löschkonzept unterscheidet klar zwischen **Kinddaten** und **Einrichtungs-Infrastruktur**:

### 1. Kind-generierte Daten & Meisterwerke (Vollständiger Auto-Reset)
* **Betrifft**: Alle Fotos (Selfies, Comics, News), Sprachaufnahmen, Sound-Collagen, Pixel-Bilder und **Stop-Motion-Videodateien** (`type: 'video'`).
* **Speicherort**: Ausschließlich lokal im sandboxed Browser-Speicher (`IndexedDB: MedienStationDB_v5`).
* **Automatischer Tages-Reset (Standard nach Art. 5 Abs. 1 lit. e DSGVO)**: Um 00:00 Uhr bzw. beim ersten Start am Folgetag werden sämtliche Meisterwerke vollständig, automatisch und unwiderruflich gelöscht.
* **Projektwochen-Modus (7 Tage)**: Für mehrtägige Projekte (z. B. Trickfilm-Woche) kann im Admin-Menü ein 7-Tage-Laufzeitfenster gewählt werden.
* **Manuelle Sofort-Löschung**: Kinder können eigene Werke per `🗑️` einzeln entfernen; Fachkräfte können die gesamte Galerie im Admin-Bereich mit einem Klick (`🧹 Galerie leeren`) leeren.

### 2. Kita-Portfolio-Druckbögen (Flüchtig / On-Demand)
* Werden beim Klick auf `📄 PORTFOLIO` **on-the-fly im Browser gerendert** und direkt an den Druckertreiber übergeben.
* Es entstehen **keine separaten Speicherdateien oder Dateileichen** auf dem Endgerät. Nach dem Druck oder Schließen des Druckdialogs verbleiben keine zusätzlichen Daten.

### 3. Einrichtungs- & Fachkraft-Einstellungen (Dauerhafte Infrastruktur)
* **Betrifft**: Einrichtungsname (für Portfolio-Bögen), trägereigene Kita-Hintergrundfotos, Master-Lautstärke, Admin-PIN und Kamera-Pausierung.
* **Verhalten**: Diese administrativen Konfigurationen **überstehen den täglichen Reset bewusst**, damit Fachkräfte nicht jeden Morgen erneut den Gruppennamen oder die Fotos des Außengeländes hinterlegen müssen.
* **Löschung**: Eigene Hintergründe können im Admin-Bereich jederzeit einzeln über das Mülleimer-Symbol `🗑️` gelöscht werden; der Einrichtungsname kann jederzeit geändert oder geleert werden.

---

## ⚙️ Fachkraft- & Admin-Menü (PIN-geschützt)

Das PIN-geschützte Fachkraft-Dashboard ist über den Button **„⚙️ Einstellungen“** in der Kopfzeile oder diskret durch **5× Antippen des Titels „Deine Mission“** erreichbar. Die PIN-Eingabe erfolgt komfortabel über ein großes Touch-Zahlenfeld direkt auf dem Tablet (Standard-PIN: `1234`, jederzeit änderbar):

* 🏫 **Kita- & Einrichtungsname**:
  - Hinterlegung des Einrichtungsnamens (z. B. *„Kath. Kita St. Ulrich“*), der automatisch auf allen DIN A4 Portfolio-Druckbögen erscheint.
* 🏡 **Eigene Kita-Hintergründe (Zauber Selfie)**:
  - Lokaler Upload von bis zu 3 vertrauten Fotos aus dem Kita-Alltag (Gruppenraum, Garten, Turnhalle).
  - Automatische lokale Bildkomprimierung (unter 400 KB) zur Schonung des Tablet-Speichers.
  - Live-Vorschau und kindersichere Einzel-Löschung (`🗑️`).
* 🔊 **Master-Lautstärke & Ruhezeit-Modus**:
  - **Normal (100%)**: Volle Lautstärke für den regulären Gruppenraum-Betrieb.
  - **Flüstern (35%)**: Gedämpfte Klangwiedergabe bei lauter Gruppenatmosphäre zur Entlastung des pädagogischen Personals.
  - **Stumm / Mittagsruhe (0%)**: Schaltet sämtliche Klick-, Effekt- und Sprachausgaben stumm, damit die Station auch in Ruhephasen oder Schlafraumnähe betrieben werden kann.
* 📷 **Foto- & Kamera-Datenschutz (Freispiel-Schutz)**:
  - Mit einem Klick können alle 5 Kamera-Apps (*Zauber Selfie*, *Video Loop*, *Nachrichten*, *Trickfilm*, *Comic*) pausiert werden.
  - Ermöglicht das freie Spielen an der Station auch in Gruppen mit Kindern, deren Erziehungsberechtigte keine Fotoerlaubnis erteilt haben. Gesperrte Apps werden mit einem deutlichen *"🔒 PAUSIERT"*-Badge versehen.
* 🩺 **Hardware- & Sensor-Diagnose**:
  - Schneller Live-Check für Kamera, Mikrofon, lokalen IndexedDB-Speicherplatz (MB-Auslastung) und WLAN-Verbindung.
* 🛡️ **Datenschutz & Auto-Reset**:
  - Strenger Tages-Reset um 00:00 Uhr (Standard / DSGVO) vs. 7-Tage-Projektmodus (für mehrtägige Stop-Motion- & Comic-Projekte) vs. Dauerhaft behalten.
* 🎨 **Meisterwerke & Portfolio-ZIP-Export**:
  - Live-Zähler der gespeicherten Werke, 1-Klick-Download aller Kunstwerke als strukturiertes ZIP-Archiv inklusive `Uebersicht.txt` für Elternarbeit und Dokumentation, sowie vollständiges Leeren der Galerie.
* 🛠️ **System & Wartung**:
  - Station neu laden, PIN ändern und sicheres **„⚡ Cache leeren / Update“** (gesichert mit automatischer WLAN-Prüfung).

---

## 🖨️ Druckfunktion & Kiosk-Betrieb

* **Drucken**: Über den Druck-Button kann das erstellte Werk ausgedruckt werden. Vor dem Druckdialog erscheint ein kindgerechter Hinweis.
* **Inaktivitäts-Schutz**: Nach 5 Minuten ohne Interaktion erscheint das "Aufräumen-Monster". Reagiert niemand innerhalb von 15 Sekunden, setzt sich die Station automatisch für die nächsten Kinder zurück.
* **Barrierefreiheit**: Alle Anleitungen verfügen über eine integrierte Vorlesefunktion (🔊-Button).
