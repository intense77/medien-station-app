# 🚨 Sicherheits- & Deployment-TODOs

Sicherheitsüberprüfung und Handlungsempfehlungen für das Deployment über Coolify.

---

## 🔴 1. KRITISCH: SSH-Schlüssel austauschen & sperren

Die Datei `coolify_deploy` (privater SSH-Schlüssel) war in Git getrackt und auf GitHub gepusht.

- [ ] **Schlüssel auf Server / Coolify sperren**:
  - Alten öffentlichen Schlüssel aus `~/.ssh/authorized_keys` auf dem Server entfernen.
  - Alten Schlüssel im Coolify Dashboard unter *Keys / Deployment Keys* löschen.
- [ ] **Neuen SSH-Schlüssel generieren**:
  - Einen neuen SSH-Schlüssel für Coolify anlegen.
- [ ] **Schlüssel aus Git-Tracking entfernen**:
  - [x] `.gitignore` wurde bereits aktualisiert, um `coolify_deploy*`, `*.pem`, `*.key` und `.env*` zu ignorieren.
  - Befehl zum Entfernen aus dem Git Index ausführen:
    ```bash
    git rm --cached coolify_deploy coolify_deploy.pub
    git commit -m "security: remove tracked ssh key files"
    git push origin main
    ```

---

## 🟠 2. HOCH: HTTP Security Headers in Coolify eintragen

In Coolify unter der Anwendungs-Konfiguration (*Custom Nginx Configuration* oder Proxy-Headers) folgende Sicherheits-Header hinzufügen:

- [ ] **Nginx / Proxy Header Konfiguration hinzufügen**:
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

Veraltete Build-Dependencies in Node-Modulen aktualisieren.

- [ ] `npm audit fix` ausführen
- [ ] `npm run build` testen, ob die Anwendung weiterhin fehlerfrei baut.

---

## ℹ️ 4. Allgemeine Sicherheitshinweise

- [x] **Keine Secrets im Frontend**: Keine Datenbank-Passwörter oder API-Schlüssel im Quellcode vorhanden.
- [x] **DOM-XSS Schutz**: In `comic.html` und `news.html` wird `innerText` verwendet.
- [ ] **Webserver-Schutz**: Sicherstellen, dass versteckte Ordner wie `.git` oder Konfigurationsdateien nicht direkt über den Webserver öffentlich erreichbar sind.
