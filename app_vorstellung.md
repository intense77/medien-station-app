# MedienStation – Konzept, Fachbewertung & Technische Dokumentation

## 1. Übersicht & Steckbrief

* **Projektname**: MedienStation (AV-Medienzentrale Bistum Augsburg)
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

## 3. Die 8 Medien-Module

1. **🎹 Musik Labor**: Experimentieren mit Tönen, Beats und Tonhöhen-Verfremdung.
2. **🎙️ Mikro Check**: Sprachaufnahmen machen, Stimm-Effekte testen und Sprachförderung erleben.
3. **📹 Video Loop**: Bewegungs- und Mimikabläufe in Endlosschleifen analysieren.
4. **✨ Zauber Selfie**: KI-gestützte Segmentierung (Green-Screen-Effekt ohne grüne Wand) für kreative Fotohintergründe.
5. **👾 Pixel Art**: Rasterbasiertes Zeichnen mit digitalen Bausteinen zur Schulung der Feinmotorik und Raumvorstellung.
6. **📰 Nachrichten Studio**: Rollenspiele und Präsentationstechniken vor der Kamera erproben.
7. **📸 Comic Story**: Multi-Panel-Bildgeschichten mit Textblasen strukturieren und erzählen.
8. **🎬 Trickfilm Studio**: Stop-Motion-Filme erstellen mit Onion-Skinning, Timeline-Scrubbing und Daumenkino-Druckfunktion.

---

## 4. Datenschutz & Datensparsamkeit

Die MedienStation erfüllt höchste Datenschutzstandards für den Einsatz in Bildungseinrichtungen:

* **100% Lokale Datenverarbeitung**: Alle Berechnungen (Audioverarbeitung, KI-Hintergrundtrennung, Bildgenerierung) finden ausschließlich auf dem Endgerät im Browser statt.
* **Keine Cloud-Abhängigkeit**: Es werden keine Daten an externe Server gesendet.
* **Tracking- & Werbefrei**: Keine Logins, keine Cookies, keine Analytics.

### ℹ️ Speicher- & Löschkonzept der Galerie ("Meisterwerke")

* **Speicherort**: Erstellte Medien (Bilder, Sounds, Videos) werden im lokalen Speicher des Browsers (`localStorage` / `IndexedDB`) des jeweiligen Geräts abgelegt.
* **Kapazität**: Das System speichert automatisch die jeweils neuesten 30 Kunstwerke des aktuellen Tages ab.
* **Löschung**:
  * **Automatischer Tages-Reset (DSGVO-Speicherbegrenzung)**: Zu Beginn eines neuen Tages (beim ersten Start oder Aufwachen des Tablets an einem neuen Datum) wird die Galerie automatisch und vollständig zurückgesetzt. Dies schützt die Kindermedien zuverlässig über Nacht und erfüllt das Gebot der Speicherbegrenzung (Art. 5 Abs. 1 lit. e DSGVO), ohne den Tagesbetrieb (z. B. Präsentieren der Werke beim Abholen) zu stören.
  * **Manuell**: Benutzer oder Fachkräfte können die Galerie jederzeit mit einem Klick auf *"🧹 Galerie leeren"* (mit Bestätigungsabfrage) leeren.
  * **System-Reset**: Beim Ausführen des Admin-Resets (*"Update erzwingen"*) oder beim Zurücksetzen der Browserdaten wird der Speicher geleert.

---

## 5. Kiosktauglichkeit & PWA-Auto-Update

* **Robustes Kiosk-Design**: Deaktivierte Textauswahl, Touch-Optimierung (min. 48x48px Touch-Targets) und Inaktivitäts-Timer verhindern Fehlbedienungen im Freispiel.
* **Netzwerk-First Auto-Update**: Sobald die Station mit dem Internet verbunden ist, prüft ein intelligenter Service Worker im Hintergrund auf Aktualisierungen und installiert diese beim nächsten Start automatisch. Offline bleibt die Station ohne Einschränkung einsatzbereit.

---

## 6. Fachliche Bewertung & Marktvergleich

Im Vergleich mit gängigen Lösungen auf dem Markt (kommerzielle Einzel-Apps, Lernplattformen und digitale Medientische) lässt sich die MedienStation wie folgt einordnen:

### 🟢 Wo die MedienStation herausragt (Alleinstellungsmerkmale):

* **100 % DSGVO- & Kita-Konform ohne Kompromisse**: Im Gegensatz zu kommerziellen Apps (*Book Creator, Stop Motion Studio etc.*) werden **keine Accounts, keine App-Store-Logins, keine Cloud-Dienste und keine AV-Verträge** benötigt. Alle Daten verbleiben auf dem Gerät.
* **All-in-One Kiosk-Hub**: Statt 10 unterschiedlicher Apps mit variierender Bedienung bündelt die MedienStation 8 Kreativ-Werkzeuge unter einer einheitlichen, kindgerechten Oberfläche.
* **Wartungsfreier Betrieb**: Durch die Offline-First PWA-Architektur mit Hintergrund-Auto-Update und dem automatischen täglichen Galerie-Reset (DSGVO-Speicherbegrenzung) ist das System für Kitas und Medienzentralen wartungsfrei und „unkaputtbar“.

### 🟡 Ehrliche Leistungsgrenzen & Abgrenzung:

* **Bewusste Reduktion der Funktionstiefe**: Die MedienStation verzichtet auf komplexe Profi-Funktionen (wie 4K-Export, Multi-Track-Audioschnitt oder Keyframe-Animationen), um die Zielgruppe der 3- bis 10-Jährigen nicht zu überfordern.
* **Keine Cloud-Archivierung**: Medien werden für die Dauer des Kita-Tages in der lokalen Tagesgalerie bereitgestellt. Ein langfristiges Speichern über Wochen ist datenschutzbedingt nicht vorgesehen.

### 📊 Marktvergleich im Überblick

| Kriterium | **MedienStation** | **Kommerzielle Einzel-Apps** (*Book Creator, Stop Motion Studio etc.*) | **Schul-Webplattformen** (*Anton, edumaps etc.*) |
| :--- | :---: | :---: | :---: |
| **Datenschutz / DSGVO** | 🥇 **100 % lokal / Keinerlei Tracking** | ⚠️ Oft Cloud- & Accountpflicht | ⚠️ Registrierung / AVV erforderlich |
| **Kosten & Lizenzen** | 🥇 **Kostenfrei / Open Source** | ❌ Abos / Kauflizenzen pro Gerät | ❌ Schullizenzen |
| **Offline-Fähigkeit** | 🥇 **100 % Offline PWA** | 🟢 Teils offline | ❌ Internet zwingend erforderlich |
| **Kita-Freispiel-Eignung (3–6 J.)** | 🥇 **Sehr hoch (selbsterklärend)** | 🟡 Mittel (eher ab Grundschule) | 🔴 Niedrig (eher Lernsoftware) |
| **Kiosk-Schutz & Auto-Update** | 🥇 **Integriert & Automatisch** | ❌ MDM-Setup erforderlich | ❌ Browser-Abhängig |
| **Funktions-Tiefe / Profi-Tools**| 🟡 Basis-Kreativwerkzeuge | 🥇 Sehr hoch | 🟡 Je nach Modul |

---

## 7. Fazit & Gesamteinschätzung

Die **MedienStation** schließt eine zentrale Lücke im Bildungsbereich: Sie ist eine praxisnahe, lückenlos datenschutzkonforme und niedrigschwellige Gesamtlösung für die frühkindliche Medienbildung. Sie vereint intuitive UX-Standards mit hohen pädagogischen Qualitätsansprüchen und schützt die Privatsphäre der Kinder zuverlässig.

