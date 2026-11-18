# 🛡️ IT-Sicherheits-, Datenschutz- & KI-Freigabedossier

> **Offizielle Dokumentationsmappe zur Prüfung und Genehmigung durch IT-Leitung, Datenschutzbeauftragte (DSB), KI-Beauftragte und Einrichtungsleitungen**  
> *Projekt: MedienStation (v7.9.8 / Build 335) – AV-Medienzentrale Bistum Augsburg*  
> *Rechtsrahmen: Gesetz über den Kirchlichen Datenschutz (KDG), DSGVO, EU AI Act (Verordnung (EU) 2024/1689)*  

---

## 📌 0. Vorangestellte Kurzbeschreibung des Projekts (Executive Summary)

### 0.1 Anlass, didaktischer Auftrag & Zielgruppe
Die **MedienStation** ist ein medienpädagogisches, nicht-kommerzielles Bildungsangebot der **AV-Medienzentrale des Bistums Augsburg (KdöR)**. Sie wurde gezielt für den Einsatz in **Kindertagesstätten (Kitas), Horten und Grundschulen** konzipiert und richtet sich an Kinder im Alter von **4 bis 10 Jahren** (inkl. Leseanfänger und Nichtleser).

* **Pädagogischer Leitgedanke**: Gemäß den Grundsätzen der aktiven, handlungsorientierten Medienpädagogik (nach Dieter Baacke) treten Kinder aus der passiven Konsumentenrolle heraus und werden zu **aktiven Schöpfern und Gestaltern**. Statt Kinder durch Gamification, Belohnungssysteme oder Algorithmen an Bildschirme zu binden, fungiert die MedienStation wie ein digitaler Malkasten oder ein Musikinstrument.
* **Sprachförderung & Inklusion**: Durch die visuelle Vertonung, Rollenspiele und Vorlesefunktionen regt die Station den aktiven sprachlichen Austausch der Kinder untereinander an.
* **Einsatzszenarien**:
  * Stationäre iPad- oder Android-Tablet-Stationen im Gruppenraum.
  * Mobile Medienkoffer der AV-Medienzentrale zum Ausleihen an Bildungseinrichtungen.
  * All-in-One Kiosksysteme in Museen oder Ausstellungen.

---

### 0.2 Funktionsweise & Technischer Workflow der 8 Kreativ-Module
Die MedienStation fasst acht niedrigschwellige Werkzeuge in einer kindgerechten, touch-optimierten Oberfläche zusammen:

| Modul | Werkzeug | Funktionsweise & Datenverarbeitung | Speicherung |
| :--- | :--- | :--- | :--- |
| **🧙‍♂️ Zauber Selfie** | Magisches Fotostudio | Lokale KI-Freistellung (Green-Screen-Effekt ohne Tuch), Themen-Hintergründe, Filter | Schnappschuss $\rightarrow$ Automatisch Galerie |
| **🎤 Mikro Check** | Audio-Labor & Interview | Aufnahme eigener Stimmen, Visualisierung als Wellenform, 3 Stimmfilter (Maus, Normal, Monster) | Schnappschuss $\rightarrow$ Automatisch Galerie |
| **🎹 Musik Labor** | Soundboard & Rhythmus | 12 interaktive Pads, eigene Geräusche aufnehmen, Loop-Funktion, Rhythmusmuster | Flüchtig im RAM / Session |
| **📺 News Studio** | TV-Reporterstation | Live-Kamerabild in TV-Maske („EILMELDUNG“), Touch-Laufband, Foto-Auslöser | Schnappschuss $\rightarrow$ Automatisch Galerie |
| **🎬 Trickfilm Studio** | Stop-Motion-Werkstatt | Geisterbild (*Onion Skinning*), Tempo-Regler (1–12 FPS), Tonaufnahme, A4-Daumenkino-Druck | Manuell via `💾 SPEICHERN` / `🖨️ DRUCKEN` |
| **👾 Pixel Labor** | Retro-Rasterkunst | 16×16 Rasterfläche mit 12 Farbtönen, Stift-/Touch-Erkennung, Undo-Schritte, 8-Bit Feedback | Manuell via `💾 SPEICHERN` / `🖨️ DRUCKEN` |
| **📸 Comic Story** | Fotogeschichten | 3-Panel-Bildgeschichte, eigene Fotos, bewegliche Sprechblasen mit XSS-geschütztem Text | Manuell via `💾 SPEICHERN` / `🖨️ DRUCKEN` |
| **🔄 Video Loop** | Zeitschleife / GIF | 2-Sekunden-Endlosschleife, 3 Geschwindigkeiten (Vor- & Rücklauf), 4er-Fotostreifen | Manuell via `💾 SPEICHERN` / `🖨️ DRUCKEN` |

---

### 0.3 Kompakte IT- & Datenschutz-Matrix auf einen Blick

| Prüffeld | Status / Realisierung | Sicherheits- & Datenschutz-Garantie |
| :--- | :---: | :--- |
| **Architektur** | 🟢 **100 % Client-Side** | Zero-Backend: Keine Datenbank, keine APIs, keine Benutzerkonten. |
| **Netzwerk & Ports** | 🟢 **Offline-First (PWA)** | Nach einmaligem Laden via HTTPS benötigt die App **keine Internetverbindung**. Keine offenen Inbound-Ports. |
| **Externer Traffic** | 🟢 **0 KB Fremd-Traffic** | Keine externen CDNs, keine Google-Cloud-Abrufe, keine Tracking-Dienste, keine Web-Analytics. |
| **KI-Komponente** | 🟢 **Lokale Inferenz** | Google MediaPipe Selfie Segmentation läuft als kompaktes TFLite-Modell rein lokal auf der WebAssembly/GPU-Engine des Tablets. **Keine Cloud-KI**. |
| **Biometrie & Tracking** | 🟢 **Vollständig Ausgeschlossen** | Keine Gesichtserkennung, keine Gesichts-Identifikation, keine Emotionsanalyse, kein Modell-Nachtraining mit Kinderfotos. |
| **Speicherbegrenzung** | 🟢 **Automatischer Tages-Reset** | Täglich um **00:00 Uhr** wird der lokale Browserspeicher (`IndexedDB`) automatisch gelöscht (Art. 5 Abs. 1 lit. e DSGVO). |
| **Freispiel-Schutz** | 🟢 **1-Klick Kamera-Stopp** | Fachkräfte können im PIN-Menü alle 5 Kamera-Apps deaktivieren, falls Kinder ohne Foto-Einwilligung im Raum sind. |
| **Admin-Schutz** | 🟢 **PIN-gesichert** | Fachkraft-Einstellungen (Lautstärke, Speicher, Diagnose, Reset) sind durch eine 4-stellige Touch-PIN geschützt. |
| **Einstufung AI Act** | 🟢 **Minimales Risiko** | Einstufung nach Verordnung (EU) 2024/1689: Minimal Risk AI (Art. 6). Kein Hochrisiko-System. |
| **DSFA-Erfordernis** | 🟢 **Nicht erforderlich** | Schwellwertanalyse nach § 35 KDG / Art. 35 DSGVO ergibt: Niedrigrisiko-Verarbeitung. |

---

## 🖥️ 1. IT-Betriebs- & Sicherheitsdatenblatt (Für IT-Leitung)

### 1.1 Technische Systemarchitektur
* **Typ**: Client-Side Single Page Application (PWA) auf Basis von modernem Vanilla HTML5, CSS3 und ES6+ JavaScript.
* **Hosting-Modell**: Rein statisches Webserver-Hosting (z. B. via Nginx Docker-Container über Coolify oder statischen Webserver).
* **Ausführung**: Alle Rechenoperationen (Bildmanipulation, Web Audio API, Canvas-Rendering, KI-Hintergrundsegmentierung) finden ausschließlich im unprivilegierten Browser-Sandbox-Prozess des Client-Endgeräts statt.
* **Keine Server-Persistenz**: Auf dem Webserver existieren weder Datenbanken (MySQL, PostgreSQL, MongoDB o. ä.) noch serverseitige Skriptsprachen (kein PHP, kein Node.js-Backend, kein Python-Backend zur Laufzeit).

### 1.2 Netzwerk- & Portmatrix
* **Ausgehend (Outbound)**: Port 443 TCP (HTTPS) ausschließlich zum initialen Laden der statischen PWA-Dateien von der offiziellen Einrichtungs-Domain.
* **Eingehend (Inbound)**: **Keine offenen Server-Ports auf dem Endgerät.**
* **Offline-Betrieb**: Nach dem initialen Aufruf cacht der Service Worker (`sw.js`) alle Skripte, Styles, Bilder, Sounds und KI-Modelle lokal. Die Station kann dauerhaft im Flugmodus oder in Netzwerken ohne Internetzugang betrieben werden.
* **Verbot externer Abhängigkeiten**: Externe Schriften, Bibliotheken und Skripte sind vollständig in das Repository integriert und werden lokal ausgeliefert.

### 1.3 Gehärtete HTTP-Sicherheitsheader (Nginx-Konfiguration)
Der ausliefernde Webserver ist nach modernen CIS- und BSI-Standards gehärtet:

```nginx
# Schutz vor Clickjacking und Einbettung in Frames Dritter
add_header X-Frame-Options "SAMEORIGIN" always;

# Unterbindung von MIME-Type-Sniffing
add_header X-Content-Type-Options "nosniff" always;

# Referrer-Policy zum Schutz von URL-Metadaten
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Hardware-Zugriff strikt auf die eigene Herkunft (Origin) beschränken
add_header Permissions-Policy "camera=(self), microphone=(self)" always;

# Restriktive Content Security Policy (CSP): Keine Drittanbieter-Endpunkte erlaubt
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self';" always;

# Verbergen von Webserver-Versionen & Datensparsamkeit (keine IP-Access-Logs)
server_tokens off;
access_log off;
error_log /dev/stderr warn;
```

### 1.4 Hardware-, Betriebssystem- & Kiosk-Empfehlungen
* **Apple iPad**: iPadOS 15.0 oder neuer, Apple Safari / PWA („Zum Home-Bildschirm“). Empfohlen wird die Aktivierung des Kiosk-Modus via **Apple „Geführter Zugriff“ (Guided Access)** oder MDM-Single-App-Mode.
* **Android Tablets**: Android 10 oder neuer, Google Chrome / Android System WebView. Kiosk-Betrieb via **Android App-Pinning** oder geprüfte Kiosk-Browser (z. B. Fully Kiosk Browser).
* **Druckanbindung**: Standard AirPrint / Mopria Fotodrucker im lokalen Subnetz oder Direktanbindung per USB/WLAN ohne Cloud-Dienst.

---

## 📋 2. Verzeichnis von Verarbeitungstätigkeiten (VVT nach § 31 KDG / Art. 30 DSGVO)

| Merkmal nach § 31 KDG | Beschreibung / Dokumentation |
| :--- | :--- |
| **1. Bezeichnung der Verarbeitung** | **Medienpädagogische Kreativstation („MedienStation“)** zur handlungsorientierten Förderung digitaler Medienkompetenz und Sprachbildung in Kindertagesstätten und Grundschulen. |
| **2. Verantwortlicher (§ 4 Nr. 9 KDG)** | Diözese Augsburg KdöR / AV-Medienzentrale, Peutingerstraße 5, 86152 Augsburg.<br>**Ansprechpartner:** Norbert Harner, Tel. 0821-31662272, E-Mail: `norbert.harner@bistum-augsburg.de` |
| **3. Zwecke der Verarbeitung** | Didaktisch begleitete Erstellung von Tonaufnahmen (Mikro Check, Musik Labor), Bildern/Comics und Trickfilmen im Gruppenverband; Sensibilisierung für Bild- und Tonmanipulation; handlungsorientierte Sprachförderung. |
| **4. Rechtsgrundlagen** | **§ 6 Abs. 1 lit. c KDG** (Erfüllung der pädagogischen Bildungs- und Betreuungsaufgabe der Einrichtung); **§ 6 Abs. 1 lit. g KDG / Art. 6 Abs. 1 lit. f DSGVO** (berechtigtes Interesse an moderner und sicherer Medienbildung); ggf. Einwilligung der Personensorgeberechtigten für Gruppenfotos. |
| **5. Betroffene Personengruppen** | Kinder in Betreuungseinrichtungen (Kitas, Horte, Grundschulen); pädagogische Fachkräfte / Aufsichtspersonen. |
| **6. Kategorien personenbezogener Daten** | **Flüchtige Sprachaufnahmen:** Eigene Stimme, Geräusche (rein lokal im RAM / IndexedDB).<br>**Flüchtige Bild-/Videoaufnahmen:** Fotos für Comics, Zauber-Selfies, Stop-Motion-Frames (rein lokal im IndexedDB-Browserspeicher).<br>**Server-Logdaten:** IP-Adresse, Zugriffszeit, User-Agent (technisch notwendig zur Bereitstellung der Dateien; automatische Rotation/Löschung nach max. 7 Tagen). |
| **7. Empfänger & Dritte (§ 4 Nr. 10 KDG)** | **Keine Empfänger.** Die Daten verlassen zu keinem Zeitpunkt das Endgerät. Keine Übertragung an Apple iCloud, Google Cloud oder sonstige Cloud-Dienste. |
| **8. Drittlandübermittlung (§ 39 KDG)** | **Findet nicht statt.** 0 % Übermittlung in Drittstaaten außerhalb der EU bzw. des EWR. |
| **9. Löschfristen & Speicherbegrenzung** | **Automatischer Tages-Reset:** Täglich um 00:00 Uhr werden alle im lokalen IndexedDB-Speicher abgelegten Werke unwiderruflich gelöscht.<br>**Manuelle Sofortlöschung:** Im PIN-geschützten Fachkraft-Menü jederzeit per Klick ausführbar. |

---

## 🛡️ 3. Technisch-Organisatorische Maßnahmen (TOM nach § 26 KDG / Art. 32 DSGVO)

### 3.1 Vertraulichkeit (Zugangskontrolle & Rechtestruktur)
* **PIN-gesichertes Fachkraft-Menü**: Systemeinstellungen, Speicherverwaltung, Reset-Modi und Exportfunktionen sind durch eine 4-stellige PIN (Standard: `1234`, änderbar) geschützt. Kinder können keine Einstellungen manipulieren oder Systemdaten löschen.
* **Foto- & Kamera-Datenschutz (Freispiel-Schutz)**: Fachkräfte können mit einem einzigen Klick alle 5 Kamera-Module sperren. Dadurch können Kinder ohne Fotoeinwilligung gefahrlos am Gerät spielen (Musik, Pixel, Audio).

### 3.2 Integrität (Eingabekontrolle & Schutz vor Schadcode)
* **Striktes DOM-XSS-Escaping**: Alle variablen Texteingaben (z. B. Sprechblasen in der Comic-App, Lauftexte im News-Studio) werden strikt über `innerText` oder TextNodes gerendert. Keine Ausführung von HTML/JavaScript-Injektionen.
* **Keine nativen Schreibzugriffe**: Die PWA besitzt keine Berechtigung, beliebige Systemdateien auf dem Betriebssystem des Tablets zu modifizieren.

### 3.3 Trennungsgebot (Sandbox-Isolation)
* **Browser-Origin-Isolation**: Der lokale Speicher (`IndexedDB`) ist an die exakte Herkunft gebunden (`Same-Origin-Policy`). Weder andere Apps noch fremde Websites können auf die dort abgelegten Kunstwerke zugreifen.

### 3.4 Verfügbarkeit & Belastbarkeit
* **Autarker Offline-First-Betrieb**: Dank Service Worker (`sw.js`) bleibt das System bei instabilem Kita-WLAN, Netzwerkausfällen oder im Freigelände uneingeschränkt bedienbar.
* **Automatisierter DSGVO- & Funktions-Wächter (`npm run test:smoke`)**: Vor jedem Release prüft ein automatisierter Playwright-Test alle 18 Routen auf 0 KB Fremd-Traffic, 0 fehlende Assets, strengen Tages-Reset und Direktaufruf-Kamerasperre.
* **Resilientes Speichermanagement**: PWA Persistent Storage API (`navigator.storage.persist()`) verhindert Datenverlust bei geringem Speicherplatz.

### 3.5 Speicherbegrenzung & Automatisches Löschen
* **Erzwungener täglicher Daten-Reset**: Zur Vermeidung dauerhafter Anhäufungen von Kinderbildern setzt ein automatischer Datumsabgleich beim ersten Start an einem neuen Tag die Galerie unwiderruflich zurück.

---

## ⚖️ 4. Vorabprüfung zur Datenschutz-Folgenabschätzung (DSFA nach § 35 KDG / Art. 35 DSGVO)

Anhand der Schwellwertkriterien der **Datenschutzkonferenz (DSK)** und der europäischen Leitlinien (WP 248) wurde geprüft, ob für die MedienStation eine formelle DSFA erforderlich ist:

| DSFA-Prüfkriterium (gemäß WP 248) | Status | Begründung & Bewertung |
| :--- | :---: | :--- |
| **1. Bewertung oder Einstufung (Profiling / Scoring)** | ❌ **NEIN** | Keine Benotung, kein Leistungsvergleich, keine Tests. |
| **2. Automatisierte Entscheidungsfindung mit Rechtswirkung** | ❌ **NEIN** | Keine automatisierten Entscheidungen. |
| **3. Systematische Überwachung (Monitoring)** | ❌ **NEIN** | Keine Protokollierung von Verweildauern oder Spielverhalten. |
| **4. Daten schutzbedürftiger Personen (Kinder)** | ⚠️ **JA** | Zielgruppe sind Kinder im Kita- und Grundschulalter. |
| **5. Datenverarbeitung in großem Umfang (Big Data)** | ❌ **NEIN** | Dezentrale Einzelgeräte, wenige Megabyte temporäre Daten. |
| **6. Zusammenführung von Datensätzen** | ❌ **NEIN** | Keine Verknüpfung mit externen Datenquellen. |
| **7. Innovative Technologie (Lokale KI-Segmentierung)** | 🟡 **TEILWEISE** | MediaPipe KI-Modell, jedoch 100 % lokal, ohne Biometrie und ohne Cloud. |
| **8. Datenübermittlung in Drittländer** | ❌ **NEIN** | Keinerlei Drittlandübermittlung. |
| **9. Ausschluss von Rechten oder Dienstleistungen** | ❌ **NEIN** | Reines pädagogisches Kreativwerkzeug. |

> **Ergebnis der DSFA-Schwellwertanalyse**:  
> Von 9 Kriterien ist lediglich eines voll erfüllt (Kinderdaten). Nach den Leitlinien WP 248 ist eine DSFA in der Regel erst erforderlich, wenn mindestens **zwei Kriterien kumulativ** erfüllt sind. Da durch den **100 % lokalen Betrieb**, den **automatischen Tages-Reset** und den **Freispiel-Kameraschutz** kein hohes Risiko für die Rechte und Freiheiten der Kinder entsteht, ist **keine formelle DSFA erforderlich** (Niedrigrisiko-Verarbeitung).

---

## 🤖 5. KI-Konformitäts- & Transparenzerklärung (EU AI Act 2024/1689)

### 5.1 Spezifikation der eingesetzten KI-Komponente
In der Anwendung **„Zauber Selfie“** kommt das Bildsegmentierungs-Modell `Google MediaPipe Selfie Segmentation` zum Einsatz.
* **Modelltyp**: Convolutional Neural Network (CNN) im TensorFlow-Lite-Format (`.tflite`).
* **Dateigröße**: ca. 250 KB, fest in das lokale Asset-Verzeichnis eingebunden.
* **Ausführung**: WebAssembly (WASM) / WebGL GPU-Shader direkt im Browser.

### 5.2 Rechtliche Einstufung nach EU AI Act (Verordnung (EU) 2024/1689)
1. **Kein verbotenes KI-System (Art. 5 EU AI Act)**: Es findet keine biometrische Fernidentifizierung, kein Social Scoring und keine manipulative Beeinflussung von Verhalten statt.
2. **Kein Hochrisiko-System (Art. 6 & Anhang III EU AI Act)**: Das System dient nicht der Leistungsbeurteilung in Bildungseinrichtungen und entscheidet nicht über Bildungswege.
3. **Einstufung**: **Minimales Risiko / Kein Risiko (Minimal Risk AI)**. Die KI dient rein als digitaler Scheren-Effekt zur Trennung von Vordergrund (Kind) und Hintergrund.

### 5.3 Ethische Negativ-Attestierung (Garantien für den Kinderschutz)
* ❌ **Keine Biometrische Identifikation**: Das Modell analysiert keine biometrischen Merkmale und speichert keine Gesichtsvektoren.
* ❌ **Keine Emotionserkennung**: Mimik oder Gemütszustände werden weder erfasst noch klassifiziert.
* ❌ **Keine Generative KI / Kein LLM**: Es werden keine synthetischen Inhalte, Texte oder Deepfakes erzeugt.
* ❌ **Kein Modelltraining**: Das Modell arbeitet rein inferentiell (*Read-Only*) und lernt nicht anhand der Kamerabilder der Kinder dazu.
* ❌ **Kein Cloud-Streaming**: Sämtliche Bildverarbeitung endet nach dem Rendern des Frames im GPU-Speicher des Geräts.

---

## ✍️ 6. Formeller Freigabebeschluss & Genehmigungsprotokoll

Zur formellen Ablage in den Dokumentationsakten der Einrichtung kann dieser Abschnitt gegengezeichnet werden:

> **Beschlussvorschlag:**  
> Der Einsatz der Web-Anwendung **MedienStation (Version 7.9.8)** wird auf den dafür vorgesehenen Tablet-Geräten der Einrichtung für den pädagogischen Betrieb freigegeben. Die Vereinbarkeit mit den Vorgaben des Kirchlichen Datenschutzgesetzes (KDG), der DSGVO und des EU AI Act wurde geprüft und bestätigt.

<br>

| 1. IT-Freigabe (Systemtechnik & IT-Sicherheit) | 2. Datenschutz-Freigabe (Datenschutzbeauftragte/r) |
| :--- | :--- |
| **Geprüft:** Zero-Backend, Offline-First, gehärtete Nginx-Header, Portmatrix.<br><br>Unterschrift: ________________________________<br>Name: _____________________________________<br>Datum: ____________________________________ | **Geprüft:** VVT-Vordruck, TOMs, Schwellwertanalyse, automatischer Tages-Reset.<br><br>Unterschrift: ________________________________<br>Name: _____________________________________<br>Datum: ____________________________________ |

<br>

| 3. KI- & Ethik-Freigabe (KI-Beauftragte/r) | 4. Einrichtungs- / Trägerleitung |
| :--- | :--- |
| **Geprüft:** EU AI Act Konformität (Art. 6), ethische Negativ-Attestierung, Kinderschutz.<br><br>Unterschrift: ________________________________<br>Name: _____________________________________<br>Datum: ____________________________________ | **Geprüft:** Gesamtgenehmigung für den Einsatz im Kita-/Schulalltag.<br><br>Unterschrift: ________________________________<br>Name: _____________________________________<br>Datum: ____________________________________ |
