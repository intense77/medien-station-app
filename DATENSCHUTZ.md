# 🔒 Datenschutzerklärung der MedienStation

> **Informationen zum Datenschutz nach dem Gesetz über den Kirchlichen Datenschutz (KDG) und der Datenschutz-Grundverordnung (DSGVO)**  
> *Stand: Version v7.9.8 (Build 335)*  
> *Herausgeber: AV-Medienzentrale Bistum Augsburg (KdöR)*  

---

## 1. Grundsatz: 100 % Lokale Datenverarbeitung & Datensparsamkeit

Der Schutz der Privatsphäre von Kindern und pädagogischem Personal hat bei der Entwicklung der **MedienStation** höchste Priorität. Die Anwendung folgt dem Prinzip des **„Privacy by Design“** und der **strikten Datensparsamkeit**:

* **Kein Cloud-Zwang**: Alle Rechenoperationen (Audioverarbeitung, Stop-Motion-Zusammenstellung, Bildbearbeitung, KI-Hintergrundtrennung) finden ausschließlich **lokal im Browser auf dem Endgerät** statt.
* **Keine externen Server**: Es werden zu keinem Zeitpunkt Fotos, Tonaufnahmen oder Zeichnungen an externe Server, Dritte oder Cloud-Dienste übertragen.
* **Kein Tracking & keine Werbung**: Die MedienStation enthält keinerlei Analysetools (wie Google Analytics), keine Werbenetzwerke, keine Profiling-Algorithmen und setzt keine Tracking-Cookies ein.
* **Keine Nutzerkonten**: Die Nutzung erfolgt vollkommen anonym ohne Registrierung, Login oder Passwörter.

---

## 2. Verantwortliche Stelle

**Diözese Augsburg (Körperschaft des öffentlichen Rechts)**  
vertreten durch die **AV-Medienzentrale Bistum Augsburg**  
Peutingerstraße 5, 86152 Augsburg, Deutschland  

* **Leitung & Ansprechpartner**: Norbert Harner  
* **Telefon**: 0821-31662272  
* **E-Mail**: `norbert.harner@bistum-augsburg.de`  
* **Web**: [bistum-augsburg.de](https://bistum-augsburg.de)  

---

## 3. Datenverarbeitung bei der Nutzung der Station

### A. Lokale Aufnahmen & Kunstwerke (Kamera & Mikrofon)
* **Kamera-Module** (*Zauber Selfie, Video Loop, News Studio, Trickfilm Studio, Comic Story*):
  * Die Kamerabilder werden flüchtig verarbeitet, um den gewünschten Effekt darzustellen.
  * Erst bei bewusstem Klick auf `💾 SPEICHERN` oder beim Schnappschuss-Auslösen wird das Werk (Standbilder, Collagen oder generierte **Stop-Motion-Videodateien mit Tonspur**) im lokalen Browser-Speicher (`IndexedDB: MedienStationDB_v5`) des Geräts abgelegt.
* **Mikrofon-Module** (*Mikro Check, Musik Labor*):
  * Sprachaufnahmen und Töne werden lokal im Arbeitsspeicher/IndexedDB verarbeitet.
* **Portfolio-Druckbögen**:
  * Werden beim Klick auf `📄 PORTFOLIO` flüchtig („on-the-fly“) im Arbeitsspeicher des Browsers gerendert und an das Drucksystem übergeben; es werden hierfür keine persistenten Dateien angelegt.
* **Löschkonzept für Kinddaten**:
  * **Automatischer Tages-Reset**: Bei jedem Tageswechsel (ab 00:00 Uhr beim ersten Start am Folgetag) werden alle Werke vom Vortag (inklusive aller Stop-Motion-Filme) in der Galerie automatisch und unwiderruflich gelöscht.
  * **Projektmodus (7 Tage)**: Kann für mehrtägige Projekte im Admin-Bereich aktiviert werden; nach 7 Tagen erfolgt die automatische Bereinigung.
  * **Manuelle Löschung**: Kinder können Werke einzeln mit `🗑️` entfernen; Fachkräfte können die Galerie im PIN-geschützten Einstellungsmenü jederzeit sofort leeren.

### B. Einrichtungs- und Fachkraft-Einstellungen (Infrastrukturdaten)
* Zur Erleichterung des Kita-Alltags speichert das Gerät trägerspezifische Einstellungen lokal im Browser (`localStorage`):
  * **Einrichtungsname**: Für den automatischen Eindruck auf DIN A4 Portfolio-Bögen.
  * **Eigene Kita-Hintergründe**: Bis zu 3 Fotos aus dem Kita-Alltag (z. B. Gruppenraum, Garten; ohne Personenbezug) für das Zauber Selfie.
  * **Systemkonfiguration**: Master-Lautstärke, Ruhemodus, Admin-PIN und Kamera-Pausierung.
* **Löschung**: Diese administrativen Einstellungen überstehen den nächtlichen Kinderdaten-Reset bewusst, können jedoch von Fachkräften im PIN-Menü jederzeit einzeln über das Mülleimer-Symbol `🗑️` gelöscht oder geändert werden.

### C. Freispiel-Schutz für Gruppen ohne Foto-Einwilligung
Fachkräfte können im PIN-Menü mit einem Klick alle 5 Kamera-Apps sperren (inklusive Direktaufruf-Schutz). Dadurch können Kinder, für die keine elterliche Fotoeinwilligung vorliegt, gefahrlos an der Station mit den verbleibenden Modulen (Musik, Pixel, Audio) spielen.

### D. Server-Logdateien beim Webseiten-Hosting
Der ausliefernde Nginx-Webserver ist strikt datensparsam konfiguriert (`access_log off;`): Es werden auf Anwendungsebene **keine dauerhaften IP-Zugriffsprotokolle (Access-Logs)** gespeichert. Lediglich beim initialen Abruf über die Infrastruktur fallen technisch unvermeidbare, flüchtige Transportdaten zur sicheren Auslieferung an; im anschließenden Offline-PWA-Betrieb findet überhaupt kein Serverkontakt statt.

---

## 4. Rechte der betroffenen Personen

Als Betroffener bzw. gesetzlicher Vertreter (Personensorgeberechtigte) stehen Ihnen nach § 17 ff. KDG bzw. Art. 15 ff. DSGVO folgende Rechte zu:
* Recht auf Auskunft über verarbeitete Daten
* Recht auf Berichtigung oder Löschung
* Recht auf Einschränkung der Verarbeitung
* Beschwerderecht bei der zuständigen kirchlichen Datenschutzaufsicht:
  * **Diözesandatenschutzbeauftragter der bayerischen Bistümer**, Kapellenstraße 4, 80333 München.
