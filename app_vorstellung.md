# MedienStation – Konzept, Fachbewertung & Technische Dokumentation

## 1. Übersicht & Steckbrief

* **Projektname**: MedienStation (AV-Medienzentrale Bistum Augsburg)
* **Aktuelle Version**: v7.9.8 (Build 335)
* **Zielgruppe**: Kindertagesstätten (Kitas) und Grundschulen (Altersstufe 4–10 Jahre)
* **Einsatzszenario**: Tablet-Stationen, All-in-One Kiosksysteme, mobile Medienkoffer
* **Technologie-Stack**: HTML5, CSS3, JavaScript (Vanilla ES6+), Web Audio API, Canvas, Client-Side MediaPipe AI, Service Worker PWA (Offline-First), IndexedDB Storage

---

## 2. Pädagogische Ansätze & Fachbegründung

Die MedienStation folgt konsequent den Grundsätzen der **aktiven, handlungsorientierten Medienpädagogik (u. a. nach Dieter Baacke)**: Kinder treten aus der passiven Konsumentenrolle heraus und werden zu aktiven Gestaltern ihrer eigenen digitalen Lebenswelt.

### 🎯 Warum aktive Medienarbeit im Kita-Alter so wichtig ist:
Medien gehören zur Realität von Kindern. Das Ziel der frühkindlichen Medienbildung ist nicht, Bildschirmzeiten zu maximieren, sondern Kindern **Medien als Werkzeug für Selbstwirksamkeit, Sprache und Kreativität** näherzubringen. Statt durch Belohnungssysteme oder Gamification an den Bildschirm gebunden zu werden, nutzen Kinder die MedienStation wie einen digitalen Malkasten oder ein Musikinstrument.

### 💡 Verfolgte medienpädagogische Kernansätze:

1. **Produzenten-Orientierung statt passivem Konsum**:
   * Kinder schauen nicht nur Bilder oder Videos an, sondern nehmen eigene Stimmen auf, fotografieren sich in neuen Welten, komponieren Sounds und drehen eigene Stop-Motion-Filme.
2. **Konstruktivistisches Lernen & Fehlerfreie Selbstwirksamkeit**:
   * Es gibt keine Punkte, Sterne, Timer oder Verlierszenarien. Kinder lernen durch Versuch und Irrtum (*Trial and Error*). Sofortiges optisches und akustisches Feedback stärkt das Selbstbewusstsein.
3. **Sprachförderung & Kommunikationsanlass**:
   * Das gemeinsame Erstellen von Hörbeispielen (*Mikro Check*) oder Fotogeschichten (*Comic Story*) regt den sprachlichen Austausch zwischen Kindern an. Beim Präsentieren der Ergebnisse am Nachmittag gegenüber Eltern entstehen wertvolle Anlässe zum Erzählen.
4. **Haptisch-digitale Verknüpfung**:
   * Medien bleiben nicht virtuell gefangen: Digitale Kunstwerke (Comics, Pixel-Bilder, Daumenkinos) können über angebundene Fotodrucker ausgedruckt, angefasst und mit nach Hause genommen werden.
5. **Niedrigerschwelliger Kiosk-Zugang für Leseanfänger**:
   * Emojis, Farbleitsysteme und Sprachausgabe (`Text-to-Speech`) ermöglichen auch 3- bis 6-jährigen Nichtlesern eine völlig eigenständige Nutzung im Freispiel.

---

## 3. Die 8 Medien-Module im Detail

1. **🎹 Musik Labor**: Experimentieren mit Tönen, Beats, Tonhöhen-Verfremdung und Soundpads.
2. **🎙️ Mikro Check**: Sprachaufnahmen machen, Stimm-Effekte testen und Sprachförderung mit visueller Audio-Wellenform erleben.
3. **📹 Video Loop**: Bewegungs- und Mimikabläufe in 2-Sekunden-Endlosschleifen analysieren (mit Fotostreifen-Speicherung).
4. **✨ Zauber Selfie**: KI-gestützte Segmentierung (Green-Screen-Effekt ohne grüne Wand) für kreative Fotohintergründe, trägereigene Kita-Hintergründe, Collagen und 1-Klick-Portfoliobögen.
5. **👾 Pixel Labor**: Rasterbasiertes Zeichnen mit 16×16 Bausteinen, Karomuster, Farbpalette, Retro-Sounds, Portfolio-Bogen-Druck und Undo-Funktion.
6. **📰 Nachrichten Studio**: Rollenspiele und Präsentationstechniken vor der TV-Kamera mit Live-Bauchbinde erproben.
7. **📸 Comic Story**: Multi-Panel-Bildgeschichten mit verschiebbaren Sprechblasen structuren, speichern und ausdrucken.
8. **🎬 Trickfilm Studio**: Stop-Motion-Filme erstellen mit Onion-Skinning (Geisterbild), Zeitleisten-Geschwindigkeitsregler (🐢/🐇), Vertonung, echter Video-Generierung (WebM/MP4) für die Galerie und Daumenkino-Ausschneidebogen.

---

## 4. Datenschutz, Speicher- & Löschkonzept ("Meisterwerke")

Die MedienStation erfüllt höchste Datenschutzstandards für den Einsatz in Bildungseinrichtungen:

* **100% Lokale Datenverarbeitung**: Alle Berechnungen (Audioverarbeitung, Stop-Motion-Rendering, KI-Hintergrundtrennung, Bildgenerierung) finden ausschließlich auf dem Endgerät im Browser statt.
* **Keine Cloud-Abhängigkeit**: Es werden keine Daten an externe Server gesendet.
* **Tracking- & Werbefrei**: Keine Logins, keine Cookies, keine Analytics.

### ℹ️ Speicher- & Lösch-Systematik:
* **Flüchtige Kinderdaten & Meisterwerke (Fotos, Audio, Stop-Motion-Videos)**:
  * Schnappschuss-Apps speichern automatisch; Kreativ-Apps speichern gezielt über den einheitlichen **`💾 SPEICHERN`**-Button.
  * Alle Werke inklusive Stop-Motion-Videos (`type: 'video'`) liegen in der lokalen IndexedDB (`MedienStationDB_v5`).
  * **Automatischer Tages-Reset (Art. 5 Abs. 1 lit. e DSGVO)**: Täglich um 00:00 Uhr bzw. beim ersten Start am Folgetag werden alle Meisterwerke rückstandslos gelöscht. Optional kann für Projektwochen ein 7-Tage-Modus gewählt werden.
* **Portfolio-Druckbögen (Flüchtig / On-Demand)**:
  * Werden im Moment des Druckens direkt im Browser generiert. Hinterlassen keine Speicherdateien oder Dateireste auf dem Gerät.
* **Einrichtungs- & Fachkraft-Einstellungen (Dauerhafte Infrastruktur)**:
  * Einrichtungsname (für Portfolio-Bögen), trägereigene Hintergrundfotos, Master-Lautstärke und PIN bleiben dauerhaft erhalten, damit Fachkräfte diese nicht täglich neu konfigurieren müssen. Sie können im Admin-Bereich jederzeit selektiv mit `🗑️` entfernt werden.

---

## 5. Fachkraft-Menü & Pädagogische Schutzfunktionen

Über den dezidierten Button **„⚙️ Einstellungen“** in der Kopfzeile erhalten Fachkräfte nach PIN-Eingabe (über ein kindersicheres Touch-Zahlenfeld) Zugriff auf zentrale Steuerungsfunktionen für den Kita-Alltag:

1. 🏫 **Einrichtungsname & Portfolio-Integration**:
   - Hinterlegung des Kita-Namens, der automatisch auf allen A4-Portfolio-Bögen platziert wird.
2. 🏡 **Kita-Hintergründe verwalten**:
   - Lokaler Upload und Vorschau von bis zu 3 vertrauten Kita-Motiven (Garten, Gruppe etc.) für das Zauber Selfie inkl. Einzel-Löschung (`🗑️`).
3. 🔊 **Master-Lautstärke & Ruhemodus**:
   - **Normal (100%)**: Standard für aktiven Gruppenbetrieb.
   - **Flüstern (35%)**: Gedämpfter Pegel zur Vermeidung von Reizüberflutung bei lauter Gruppenraumsituation.
   - **Stumm (0%)**: Komplett geräuschlos für Mittagsruhe und Schlafräume.
4. 📷 **Foto- & Kamera-Datenschutz (Freispiel-Schutz)**:
   - Sperrt mit einem Klick alle 5 Kamera-Apps (*Zauber Selfie*, *Video Loop*, *Nachrichten*, *Trickfilm*, *Comic*).
   - Schützt Kinder, für die keine elterliche Fotoeinwilligung vorliegt, während nicht-kamerabasierte Module (*Pixel Labor*, *Musik Labor*, *Mikro Check*) weiterhin uneingeschränkt bespielbar bleiben.
5. 🩺 **Hardware- & Sensor-Diagnose**:
   - Sofortige Statusprüfung von Kamera, Mikrofon, IndexedDB-Speicher und WLAN-Anbindung.
6. 🛡️ **Speicher-Modus & Portfolio-Export**:
   - Umschaltung zwischen strengem Tages-Reset, 7-Tage-Projektmodus und Dauerhaft; 1-Klick-ZIP-Export aller Werke des Tages.
7. ⚡ **Sicheres System-Update**:
   - Cache-Bereinigung und Update-Erzwingung mit WLAN-Verbindungsprüfung.

---

## 6. Kiosktauglichkeit & PWA-Auto-Update

* **Robustes Kiosk-Design**: Deaktivierte Textauswahl, Touch-Optimierung (min. 48×48px Touch-Targets), kindgerechte Modals (`window.showConfirm`) und Inaktivitäts-Timer verhindern Fehlbedienungen im Freispiel.
* **Netzwerk-First Auto-Update**: Sobald die Station mit dem Internet verbunden ist, prüft ein intelligenter Service Worker im Hintergrund auf Aktualisierungen und installiert diese beim nächsten Start automatisch. Offline bleibt die Station ohne Einschränkung einsatzbereit.

---

## 7. Fachliche Bewertung & Marktvergleich

| Kriterium | **MedienStation** | **Kommerzielle Einzel-Apps** (*Book Creator, Stop Motion Studio etc.*) | **Schul-Webplattformen** (*Anton, edumaps etc.*) |
| :--- | :---: | :---: | :---: |
| **Datenschutz / DSGVO** | 🥇 **100 % lokal / Keinerlei Tracking** | ⚠️ Oft Cloud- & Accountpflicht | ⚠️ Registrierung / AVV erforderlich |
| **Kosten & Lizenzen** | 🥇 **Kostenfrei / Open Source** | ❌ Abos / Kauflizenzen pro Gerät | ❌ Schullizenzen |
| **Offline-Fähigkeit** | 🥇 **100 % Offline PWA** | 🟢 Teils offline | ❌ Internet zwingend erforderlich |
| **Kita-Freispiel-Eignung (3–6 J.)** | 🥇 **Sehr hoch (selbsterklärend)** | 🟡 Mittel (eher ab Grundschule) | 🔴 Niedrig (eher Lernsoftware) |
| **Kiosk-Schutz & Auto-Update** | 🥇 **Integriert & Automatisch** | ❌ MDM-Setup erforderlich | ❌ Browser-Abhängig |
| **Kita-Portfolio & Entwicklungsbogen** | 🥇 **1-Klick DIN A4 Bogen integriert** | ❌ Nicht vorhanden | ❌ Reine Bildschirmansicht |
| **Lokale Kita-Einbindung** | 🥇 **Eigene Hintergründe (Garten, Raum)** | ❌ Nur Standard-Vorlagen | ❌ Keine |
| **Funktions-Tiefe / Profi-Tools**| 🟡 Basis-Kreativwerkzeuge | 🥇 Sehr hoch | 🟡 Je nach Modul |
