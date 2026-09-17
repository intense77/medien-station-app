# MedienStation – Konzept, Fachbewertung & Technische Dokumentation

## 1. Übersicht & Steckbrief

* **Projektname**: MedienStation (AV-Medienzentrale Bistum Augsburg)
* **Aktuelle Version**: v7.7.0 (Build 292)
* **Zielgruppe**: Kindertagesstätten (Kitas) und Grundschulen (Altersstufe 4–10 Jahre)
* **Einsatzszenario**: Tablet-Stationen, All-in-One Kiosksysteme, mobile Medienkoffer
* **Technologie-Stack**: HTML5, CSS3, JavaScript (Vanilla ES6+), Web Audio API, Canvas, Client-Side MediaPipe AI, Service Worker PWA (Offline-First)

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
4. **✨ Zauber Selfie**: KI-gestützte Segmentierung (Green-Screen-Effekt ohne grüne Wand) für kreative Fotohintergründe und Collagen.
5. **👾 Pixel Labor**: Rasterbasiertes Zeichnen mit 16×16 Bausteinen, Karomuster, Farbpalette, Retro-Sounds und Undo-Funktion.
6. **📰 Nachrichten Studio**: Rollenspiele und Präsentationstechniken vor der TV-Kamera mit Live-Bauchbinde erproben.
7. **📸 Comic Story**: Multi-Panel-Bildgeschichten mit verschiebbaren Sprechblasen structuren, speichern und ausdrucken.
8. **🎬 Trickfilm Studio**: Stop-Motion-Filme erstellen mit Onion-Skinning (Geisterbild), Zeitleisten-Geschwindigkeitsregler (🐢/🐇), Vertonung, Daumenkino-Druck und Galerie-Ablage.

---

## 4. Datenschutz, Speicher- & Löschkonzept ("Meisterwerke")

Die MedienStation erfüllt höchste Datenschutzstandards für den Einsatz in Bildungseinrichtungen:

* **100% Lokale Datenverarbeitung**: Alle Berechnungen (Audioverarbeitung, KI-Hintergrundtrennung, Bildgenerierung) finden ausschließlich auf dem Endgerät im Browser statt.
* **Keine Cloud-Abhängigkeit**: Es werden keine Daten an externe Server gesendet.
* **Tracking- & Werbefrei**: Keine Logins, keine Cookies, keine Analytics.

### ℹ️ Speicher-Systematik der Galerie:
* **Schnappschuss-Apps (*Zauber Selfie*, *News Studio*, *Mikro Check*)**: Speichern automatisch beim Auslösen / Stoppen direkt in die Galerie.
* **Kreativprozess-Apps (*Pixel Labor*, *Comic Story*, *Trickfilm Studio*, *Video Loop*)**: Speichern gezielt über den einheitlichen **`💾 SPEICHERN`**-Button.
* **Automatischer Tages-Reset (DSGVO-Speicherbegrenzung)**: Zu Beginn eines neuen Tages (beim ersten Start oder Aufwachen des Tablets an einem neuen Datum) wird die Galerie automatisch und vollständig zurückgesetzt (Art. 5 Abs. 1 lit. e DSGVO).
* **Manuelle Bereinigung**: Fachkräfte können die Galerie jederzeit mit *"🧹 Galerie leeren"* (mit kindgerechtem Bestätigungs-Dialog) leeren.

---

## 5. Kiosktauglichkeit & PWA-Auto-Update

* **Robustes Kiosk-Design**: Deaktivierte Textauswahl, Touch-Optimierung (min. 48×48px Touch-Targets), kindgerechte Modals (`window.showConfirm`) und Inaktivitäts-Timer verhindern Fehlbedienungen im Freispiel.
* **Netzwerk-First Auto-Update**: Sobald die Station mit dem Internet verbunden ist, prüft ein intelligenter Service Worker im Hintergrund auf Aktualisierungen und installiert diese beim nächsten Start automatisch. Offline bleibt die Station ohne Einschränkung einsatzbereit.

---

## 6. Fachliche Bewertung & Marktvergleich

| Kriterium | **MedienStation** | **Kommerzielle Einzel-Apps** (*Book Creator, Stop Motion Studio etc.*) | **Schul-Webplattformen** (*Anton, edumaps etc.*) |
| :--- | :---: | :---: | :---: |
| **Datenschutz / DSGVO** | 🥇 **100 % lokal / Keinerlei Tracking** | ⚠️ Oft Cloud- & Accountpflicht | ⚠️ Registrierung / AVV erforderlich |
| **Kosten & Lizenzen** | 🥇 **Kostenfrei / Open Source** | ❌ Abos / Kauflizenzen pro Gerät | ❌ Schullizenzen |
| **Offline-Fähigkeit** | 🥇 **100 % Offline PWA** | 🟢 Teils offline | ❌ Internet zwingend erforderlich |
| **Kita-Freispiel-Eignung (3–6 J.)** | 🥇 **Sehr hoch (selbsterklärend)** | 🟡 Mittel (eher ab Grundschule) | 🔴 Niedrig (eher Lernsoftware) |
| **Kiosk-Schutz & Auto-Update** | 🥇 **Integriert & Automatisch** | ❌ MDM-Setup erforderlich | ❌ Browser-Abhängig |
| **Funktions-Tiefe / Profi-Tools**| 🟡 Basis-Kreativwerkzeuge | 🥇 Sehr hoch | 🟡 Je nach Modul |
