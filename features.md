# 📖 Handreichung & Funktionsübersicht: MedienStation Hub

> **Informationen für das pädagogische Personal, Ausstellungsbetreuung und Aufsichtspersonen**

Das **MedienStation Hub** ist eine interaktive Kiosk-Anwendung, die speziell für Kinder und Jugendliche im Museums- und Ausstellungskontext entwickelt wurde. Sie lädt zum spielerischen Erkunden, Gestalten, Aufnehmen und Experimentieren mit digitalen Medien ein.

---

## 🎨 Übersicht der Medienstationen

### 1. 🧙‍♂️ Zauber Selfie (Magie & Fotostudio)
* **Funktion**: KI-gestütztes Fotostudio ohne physikalischen Green-Screen.
* **Technologie**: Medienverarbeitung über lokales Machine Learning (MediaPipe Segmentation).
* **Möglichkeiten**: 
  - Auswahl verschiedener Hintergründe (Weltraum, Dschungel, Unterwasser, Paris, Schloss, Dino, Stadion).
  - Anwenden künstlerischer Filter (S/W, Sepia, Warm, Kalt).
  - Einzelbild-, Polaroid- oder 3er-Collage-Modus mit Ausdruckfunktion.
* **Pädagogischer Mehrwert**: Visuelle Gestaltung, Hintergrund-Erkundung, Selbstdarstellung.

### 2. 🎤 Mikro Check (Audio-Labor)
* **Funktion**: Interaktiver Stimmen- und Audiorekorder mit 2 unabhängigen Tonspuren.
* **Möglichkeiten**:
  - Zufalls-Fragen-Generator für Interviews und spontanes Antworten.
  - Stimmverfremdung in Echtzeit (Monster 🧟, Normal 🙂, Maus 🐭).
  - Visualisierung der eigenen Stimme über ein digitales Oszilloskop.
* **Pädagogischer Mehrwert**: Sprachförderung, Hörverstehen, Medien-Experimente mit Akustik.

### 3. 🎹 Musik Labor (Soundboard & Rhythmus)
* **Funktion**: Digitales Touch-Soundboard zur Erstellung eigener Rhythmen.
* **Möglichkeiten**:
  - Aufnehmen eigener Töne auf 12 interaktive Sound-Pads.
  - Loop-Modus für endlose Schleifen und Beats.
  - Stimm-Effekte und Live-Wellenformanzeige.
* **Pädagogischer Mehrwert**: Musikalische Früherziehung, Taktgefühl, Eigenkreation von Musik.

### 4. 📺 News Studio (Reporter-Station)
* **Funktion**: Erstellen eigener Nachrichten-Sendungen im Fernseh-Look.
* **Möglichkeiten**:
  - Live-Kamerabild in einem "Breaking News" TV-Frame.
  - Anpassen von Haupt-Schlagzeile und animiertem Lauftext (Ticker) direkt per Touch-Tastatur.
  - Ausgeben als ausdruckbares Nachrichten-Foto.
* **Pädagogischer Mehrwert**: Medienkompetenz (Verstehen von Nachrichtenformaten), Journalismus, Freies Formulieren.

### 5. 🎬 Trickfilm Studio (Stop-Motion Werkstatt)
* **Funktion**: Erstellen von eigenen Stop-Motion Animationen und Daumenkinos.
* **Möglichkeiten**:
  - Live-Kameraaufnahmen (bis zu 12 Einzelbilder pro Film).
  - Geisterbild-Funktion (Onion Skinning: Transparente Überlagerung des vorherigen Frames für präzise Bewegungsabläufe).
  - Geschwindigkeitssteuerung (3 FPS, 6 FPS, 12 FPS) mit sofortiger Schleifen-Wiedergabe.
  - Ausdruck der Bilderfolge als gestalteter Daumenkino-Ausschneidebogen (3:2 Format für Photo-Drucker).
* **Pädagogischer Mehrwert**: Verständnis von Filmaufbau und Bildfrequenz, Feinmotorik, Raum-Bewegungskonzepte, Haptisches Lernerlebnis.

### 6. 👾 Pixel Labor (Retro Digitalkunst)
* **Funktion**: Digitaler Zeichenbereich in 16x16 Raster-Optik.
* **Möglichkeiten**:
  - Malen mit Farbpaletten, Radiergummi und Füllwerkzeug.
  - Schärfegetreuer Ausdruck der Kunstwerke im Pixel-Look.
* **Pädagogischer Mehrwert**: Abstraktionsvermögen, Feinmotorik, Verständnis digitaler Rastergrafik.

---

## 🔒 Datensparsamkeit & Datenschutz (DSGVO)

Das MedienStation Hub erfüllt höchste Anforderungen an den Datenschutz und die Datensparsamkeit im öffentlichen Raum:

1. **100% Lokale Datenverarbeitung (No Cloud / No Tracking)**:
   - Es werden **keinerlei Daten, Fotos oder Audioaufnahmen in das Internet oder auf externe Server übertragen**.
   - Das System besitzt kein Tracking, keine Analysedienste und keine Telemetrie.
   - Alle Berechnungen (z. B. Hintergrundfreistellung per KI) finden ausschließlich lokal auf dem Hauptprozessor/Grafikchip des Kiosk-Geräts statt.

2. **Automatische Session-Bereinigung**:
   - Sobald eine Anwendung verlassen wird (`Menü`-Button) oder der automatische Inaktivitäts-Timer abläuft, werden **alle temporär erstellten Audioaufnahmen, Sprachspuren und Fotos sofort und unwiderruflich gelöscht**.
   - Es verbleiben keine Personenbilder oder Stimmdateien auf dem Gerät für nachfolgende Besucherinnen und Besucher.

3. **Hardware-Schutz & Privatsphäre**:
   - Kamera und Mikrofon sind nur während der aktiven Nutzung freigeschaltet und werden beim Verlassen einer App hardwareseitig sofort deaktiviert.

4. **Automatischer täglicher Galerie-Reset (DSGVO-Speicherbegrenzung)**:
   - Die lokale meisterwerke-Galerie speichert erstellte Fotos und Sounds für die Dauer des Kita-Tages.
   - Bei jedem neuen Tag (beim Ersterfassen eines neuen Datums beim Start oder Aufwachen des Tablets) werden alle gespeicherten Kunstwerke automatisch und rückstandslos aus dem Browserspeicher gelöscht.

---

## 🖨️ Druckfunktion & Kiosk-Betrieb

- **Drucken**: Über den Druck-Button kann das erstellte Werk ausgedruckt werden. Vor dem System-Druckdialog erscheint ein kindgerechter Hinweis.
- **Inaktivitäts-Schutz**: Nach 5 Minuten ohne Interaktion erscheint das "Aufräumen-Monster". Reagiert niemand innerhalb von 15 Sekunden, setzt sich die Station automatisch für die nächsten Gäste zurück.
- **Barrierefreiheit**: Alle Anleitungen verfügen über eine integrierte Vorlesefunktion (🔊-Button).
