# MedienStation – Konzept, Fachbewertung & Technische Dokumentation

## 1. Übersicht & Steckbrief

* **Projektname**: MedienStation (AV-Medienzentrale Bistum Augsburg)
* **Zielgruppe**: Kindertagesstätten (Kitas) und Grundschulen (Altersstufe 4–10 Jahre)
* **Einsatzszenario**: Tablet-Stationen, All-in-One Kiosksysteme, mobile Medienkoffer
* **Technologie-Stack**: HTML5, CSS3, JavaScript (Vanilla ES6+), Web Audio API, Canvas, Client-Side MediaPipe AI, Service Worker PWA (Offline-First)

---

## 2. Pädagogisches Konzept & Zielsetzung

Die MedienStation folgt dem Grundsatz der **aktiven Medienarbeit und Produzenten-Orientierung**: Kinder treten aus der passiven Konsumentenrolle heraus und werden selbst zu Gestaltern von digitalen Inhalten.

### Kernprinzipien:
* **Selbstwirksamkeit & fehlerfreies Lernen**: Es gibt keine Bewertungs- oder Verlierszenarien. Die Bedienung motiviert durch sofortige visuelle und akustische Rückmeldungen.
* **Barrierefreiheit für Leseanfänger**: Nichtleser orientieren sich an prägnanten Emojis, Farbleitsystemen und einer integrierten Sprachausgabe (`Text-to-Speech`).
* **Haptisch-digitale Verknüpfung**: Medien (Comics, Pixel-Artworks, Daumenkinos) können direkt vor Ort über angebundene Fotodrucker ausgedruckt und als physisches Produkt mitgenommen werden.

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

## 6. Fachliche Bewertung

Die MedienStation stellt eine praxisnahe, datenschutzkonforme Lösung für die frühkindliche Medienbildung dar. Sie vereint intuitive UX-Standards mit hohen pädagogischen Qualitätsansprüchen und schützt die Privatsphäre der Kinder lückenlos.
