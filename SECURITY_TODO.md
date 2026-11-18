# 🚨 Sicherheits- & Deployment-TODOs

Sicherheitsüberprüfung und Handlungsempfehlungen für das Deployment über Coolify.

---

## ✅ 1. ERLEDIGT: SSH-Schlüssel ausgetauscht & Server neu aufgesetzt

Die Datei `coolify_deploy` (privater SSH-Schlüssel) war früher in Git getrackt. Sie wurde aus dem Git-Tracking entfernt, von `.gitignore` ignoriert und der Coolify-Server wurde mit neuen Schlüsseln komplett neu aufgesetzt.

- [x] **Schlüssel auf Server / Coolify gesperrt (Server neu aufgesetzt)**:
  - Alter Server / alte Schlüssel vollständig ersetzt.
- [x] **Neuen SSH-Schlüssel generiert**:
  - Neue Deployment-Schlüssel auf dem neu aufgesetzten Coolify-Server eingerichtet.
- [x] **Schlüssel aus Git-Tracking entfernt**:
  - `.gitignore` ignoriert `coolify_deploy*`, `*.pem`, `*.key` und `.env*`.
  - Dateieinträge wurden aus dem Git-Index entfernt.

---

## 🟠 2. HOCH: HTTP Security Headers in Webserver/Nginx integriert

Die empfohlenen HTTP-Sicherheits-Header wurden direkt in die `nginx.conf` des Dockerfiles integriert:

- [x] **Nginx Security Header Konfiguration integriert**:
  ```nginx
  # Schutz vor Clickjacking
  add_header X-Frame-Options "SAMEORIGIN" always;

  # Schutz vor MIME-Type-Sniffing
  add_header X-Content-Type-Options "nosniff" always;

  # Referrer Policy
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  # Hardware-Zugriff (Kamera/Mikrofon) nur auf die eigene Domain beschränken
  add_header Permissions-Policy "camera=(self), microphone=(self)" always;

  # Content Security Policy (CSP)
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self';" always;
  ```

---

## 🟠 3. HOCH: NPM-Abhängigkeiten aktualisieren (`npm audit`)

- [x] `npm audit fix` ausgeführt (18 Abhängigkeiten automatisch aktualisiert).
- [x] `npm run build` & `docker build` erfolgreich verifiziert.

---

## ℹ️ 4. Allgemeine Sicherheitshinweise

- [x] **Keine Secrets im Frontend**: Keine Datenbank-Passwörter oder API-Schlüssel im Quellcode vorhanden.
- [x] **DOM-XSS Schutz**: In `comic.html` und `news.html` wird `innerText` verwendet.
- [x] **Webserver-Schutz**: Nginx liefert nur statische Dateien aus dem `dist/`-Ordner aus; versteckte Ordner wie `.git` befinden sich nicht im Container. `server_tokens off;` ist aktiv.
