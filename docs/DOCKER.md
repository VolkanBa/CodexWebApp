# Docker

Das Projekt kann mit Docker Compose als zwei getrennte Services gestartet werden:

- `frontend`: Next.js auf Port `3000`
- `backend`: Express API auf Port `4000`

Docker ist für lokale Entwicklung optional. Für Zusammenarbeit ist es aber sinnvoll, weil alle Entwickler dieselben Container, Ports und Laufzeitversionen verwenden.

## Voraussetzungen

- Docker Desktop mit Docker Compose v2
- Git
- lokale `backend/.env`, wenn Login und Admin-Funktionen genutzt werden sollen

Prüfen:

```bash
docker --version
docker compose version
```

## Windows

Empfohlen ist Docker Desktop über `winget`:

```powershell
winget install --id Docker.DockerDesktop -e --accept-source-agreements --accept-package-agreements
```

Danach Docker Desktop einmal starten. Falls Windows dich dazu auffordert, WSL 2 zu installieren oder den Rechner neu zu starten, diesen Schritt abschließen und anschließend ein neues Terminal öffnen.

## Linux / Ubuntu

Empfohlen ist die offizielle Docker-Installation:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Optional ohne `sudo` arbeiten:

```bash
sudo usermod -aG docker $USER
```

Danach abmelden und neu anmelden.

## Lokale Environment-Datei

Für Docker gibt es eine Vorlage:

```bash
cp backend/.env.docker.example backend/.env
```

Unter Windows PowerShell:

```powershell
Copy-Item backend/.env.docker.example backend/.env
```

Wichtig: `backend/.env` wird nicht nach GitHub gepusht. Dort muss dein echter `PRIVATE_ACCESS_PASSWORD_HASH` stehen, wenn Login und Admin-Bereich funktionieren sollen. Weitere Nutzer werden über `PRIVATE_ACCESS_USERS_JSON` konfiguriert; Details stehen in `docs/AUTH_USERS.md`.
Compose liest diese Datei im Raw-Format, damit `$`-Zeichen in Argon2-Hashes nicht als Umgebungsvariablen interpretiert werden.

Einen Argon2-Hash erzeugst du lokal so:

```bash
node -e "import('argon2').then(async (argon2) => console.log(await argon2.hash(process.argv[1])))" "DEIN_PASSWORT"
```

In `backend/.env` ersetzt du anschließend nur den Wert hinter `PRIVATE_ACCESS_PASSWORD_HASH=`.

## Start

Über npm:

```bash
npm run docker:up
```

Direkt mit Docker Compose:

```bash
docker compose up --build
```

Danach:

- Frontend: `http://localhost:3000`
- Backend Health: `http://localhost:4000/health`
- Login: `http://localhost:3000/login`
- Fächer-Admin: `http://localhost:3000/business/hochschule-gelsenkirchen/admin`

## Stoppen

```bash
npm run docker:down
```

oder:

```bash
docker compose down
```

## Logs

```bash
npm run docker:logs
```

oder:

```bash
docker compose logs -f
```

## Neu bauen

```bash
docker compose build --no-cache
docker compose up
```

## Healthchecks

Compose prüft beide Services:

- Backend: `GET http://127.0.0.1:4000/health`
- Frontend: `GET http://127.0.0.1:3000`

Status anzeigen:

```bash
docker compose ps
```

## Persistente Daten

Docker Compose nutzt Volumes:

- `subject-data`: speichert `subjects.json`
- `subject-uploads`: speichert hochgeladene Fachbilder

Diese Daten sind nicht Teil des Git-Repositories und werden nicht nach GitHub gepusht.

Volumes löschen, wenn du lokal wirklich neu anfangen willst:

```bash
docker compose down -v
```

Das löscht lokale Fächer-Inhalte und Uploads in den Docker-Volumes.

## Sicherheit und Best Practices

- Keine `.env`-Dateien committen.
- Keine Uploads committen.
- Keine privaten Dokumente in `frontend/public/` ablegen.
- Produktions-Secrets später über die Hosting-Umgebung setzen, nicht im Image speichern.
- Container laufen mit einem nicht privilegierten Benutzer.
- Runtime-Images enthalten nur Produktionsabhängigkeiten.
- Das Backend bleibt die einzige Stelle für Login, Sessions, Uploads und private Daten.

## Troubleshooting

### Docker wird nicht gefunden

Docker Desktop installieren, starten und danach ein neues Terminal öffnen:

```bash
docker --version
```

### Docker CLI funktioniert, aber die Engine läuft nicht

Wenn `docker --version` funktioniert, aber `docker info` oder `docker compose up` meldet, dass keine Verbindung zur Docker Engine möglich ist:

1. Docker Desktop manuell starten.
2. Warten, bis Docker Desktop den Status `Running` zeigt.
3. Falls Docker Desktop WSL 2 oder einen Neustart verlangt, den Schritt abschließen.
4. Danach ein neues Terminal öffnen und erneut prüfen:

```bash
docker info
```

### Port ist belegt

Windows:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen
Get-NetTCPConnection -LocalPort 4000 -State Listen
```

Ubuntu:

```bash
ss -ltnp | grep ':3000'
ss -ltnp | grep ':4000'
```

### Login funktioniert im Container nicht

Prüfe `backend/.env`:

- `PRIVATE_ACCESS_PASSWORD_HASH` muss ein echter Argon2-Hash sein.
- `PRIVATE_ACCESS_ADMIN_USERNAME` sollte lokal `Volle` sein.
- `PRIVATE_ACCESS_USERS_JSON` braucht für aktivierte Nutzer echte Argon2-Hashes.
- `FRONTEND_ORIGIN` muss `http://localhost:3000` sein.
- `SESSION_COOKIE_SECURE` muss lokal und in Docker `false` sein, weil `http://localhost` kein HTTPS ist.
- Nach Änderungen Container neu starten:

```bash
npm run docker:down
npm run docker:up
```
