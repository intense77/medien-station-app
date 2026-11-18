# 📚 MedienStation – Dokumentations-Übersicht & Weitergabe-Hub

> **Zentrales Verzeichnis aller Dokumente für IT-Abteilung, Datenschutzbeauftragte (DSB), Einrichtungsleitungen und pädagogische Fachkräfte**  
> *Projekt: MedienStation (Version v7.9.8 / Build 335)*  
> *Herausgeber: AV-Medienzentrale Bistum Augsburg (KdöR)*  

---

## 🎯 Schnelleinstieg & Dokumenten-Matrix

Alle Dokumente liegen sowohl als **Markdown (`.md`)** für die Versionskontrolle als auch als **druckfertige, autarke HTML-Dokumente (`.html`)** mit integriertem PDF-Druck-Stylesheet zur direkten Weitergabe bereit:

| Dokument | Markdown | HTML (Weitergabe & Druck) | Zielgruppe & Verwendungszweck |
| :--- | :---: | :---: | :--- |
| **🛡️ IT- & Datenschutz-Freigabe** | [FREIGABE_IT_DATENSCHUTZ.md](FREIGABE_IT_DATENSCHUTZ.md) | [FREIGABE_IT_DATENSCHUTZ.html](FREIGABE_IT_DATENSCHUTZ.html) | **IT-Leitung, Datenschutz (DSB), KI-Beauftragte:** Enthält vorangestellte Projekt-Kurzbeschreibung, IT-Sicherheitsblatt, VVT-Vordruck (§ 31 KDG / Art. 30 DSGVO), TOMs (§ 26 KDG), DSFA-Schwellwertprüfung, EU AI Act Einstufung (Minimal Risk) & 4-fach Freigabeprotokoll. |
| **🚀 Kita-Einrichtung & Kiosk-Start** | — | [kita_einrichtung.html](kita_einrichtung.html) | **Fachkräfte & IT-Einstieg:** 5-Minuten-Anleitung für iPad & Android (PWA-Installation, Geführter Zugriff / App-Pinning, Drucken, PIN-Änderung & 2-Minuten-Checkliste). |
| **👨‍👩‍👧‍👦 Eltern-Aushang (1 Seite PDF)** | — | [eltern_aushang.html](eltern_aushang.html) | **Eltern & Kita-Pinnwand:** Druckfertiger, freundlicher Aushang zum pädagogischen Konzept, 100 % Offline-/Ohne-Cloud-Betrieb und täglichem Auto-Reset. |
| **📘 Pädagogisches Konzept** | [app_vorstellung.md](app_vorstellung.md) | [app_vorstellung.html](app_vorstellung.html) | **Träger, Einrichtungsleitung, Pädagogen:** Fachbegründung nach Dieter Baacke, Mehrwert aktiver Medienbildung im Kita-Alter, 8 Module im Überblick, Marktvergleich mit kommerzieller Software. |
| **🎨 Module & Praxishandbuch** | [features.md](features.md) | [features.html](features.html) | **Fachkräfte & Aufsicht:** Detaillierte Anleitung aller 8 Module, Daumenkino-Bastelanleitung & Druckbogen, IndexedDB (`MedienStationDB_v5`) Galerie, PIN-geschütztes Fachkraft-Menü mit Kameraschutz & Lautstärkeregelung. |
| **📋 Roadmap & Qualitätssicherung** | [TODO.md](TODO.md) | [todo.html](todo.html) | **Entwickler, Träger, QS:** Architektur-Analyse, Status aller Entwicklungsphasen, automatischer DSGVO-/Smoke-Test (`npm run test:smoke`) und künftige Erweiterungen. |
| **🔒 Datenschutzerklärung** | [DATENSCHUTZ.md](DATENSCHUTZ.md) | [datenschutz.html](datenschutz.html) | **Eltern, Träger, Aufsicht:** Vollständige Datenschutzerklärung nach KDG und DSGVO mit Erläuterung des automatischen täglichen Galerie-Resets. |
| **🏛️ Impressum** | [IMPRESSUM.md](IMPRESSUM.md) | [impressum.html](impressum.html) | **Öffentlichkeit & Behörden:** Gesetzliche Anbieterkennzeichnung nach § 5 DDG und § 18 Abs. 2 MStV der Diözese Augsburg KdöR / AV-Medienzentrale. |
| **📜 Open-Source-Lizenzen** | [LIZENZEN.md](LIZENZEN.md) | [lizenzen.html](lizenzen.html) | **Rechtsabteilung:** Nachweise und Urheberrechtsvermerke aller Open-Source-Komponenten (MediaPipe, Tailwind, JSZip, Vite – 100 % ohne externe Webfonts). |

---

## 🖨️ Hinweise zum PDF-Export und zur Weitergabe

1. **Direktes Drucken / PDF-Generierung**:
   * Jedes HTML-Dokument verfügt in der oberen Menüleiste über eine Schaltfläche **`🖨️ Drucken / PDF`**.
   * Beim Aufruf wird die Navigationsleiste automatisch ausgeblendet und ein für DIN-A4 optimiertes Drucklayout angewendet.
   * Über den Browser-Druckdialog kann die Option *„Als PDF speichern“* gewählt werden.

2. **Offline-Verfügbarkeit**:
   * Sämtliche HTML-Dokumente sind autark aufgebaut und können ohne aktive Internetverbindung lokal im Webbrowser geöffnet werden.

3. **Verfügbarkeit auf der Station**:
   * Alle Dokumente sind im laufenden Betrieb der MedienStation über das **PIN-geschützte Fachkraft-Menü** („⚙️ Einstellungen“) sowie über den Footer direkt erreichbar.
