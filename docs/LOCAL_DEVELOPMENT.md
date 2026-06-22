# Lokale Entwicklung

Diese Anleitung beschreibt, wie du das Projekt lokal startest, prüfst und bei typischen Problemen vorgehst. Das Projekt besteht aus zwei getrennten Teilen:

- `frontend/`: Next.js App für die Website
- `backend/`: Node.js/Express API für spätere sichere Funktionen

## Voraussetzungen

- Node.js 20 LTS oder neuer
- npm
- Git
- VSCode mit den empfohlenen Extensions aus `.vscode/extensions.json`

Prüfen:

```bash
node --version
npm --version
git --version
```

## Erstinstallation

Im Projektordner ausführen:

```bash
npm install
```

Der Projektordner ist unter Windows aktuell:

```text
C:\Users\volka\Desktop\CodexWebApp
```

## Windows / VSCode

1. VSCode öffnen.
2. Ordner `C:\Users\volka\Desktop\CodexWebApp` öffnen.
3. Empfohlene Extensions installieren, wenn VSCode danach fragt.
4. Ein Terminal für das Frontend öffnen.
5. Ein zweites Terminal für das Backend öffnen.

Frontend starten:

```bash
npm run dev:frontend
```

Backend starten:

```bash
npm run dev:backend
```

URLs:

- Frontend: `http://localhost:3000`
- Backend Health Check: `http://localhost:4000/health`

Health Check in PowerShell:

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing
```

## Linux / Ubuntu

Empfohlener Weg: Node.js LTS über NodeSource installieren.

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg git
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Versionen prüfen:

```bash
node --version
npm --version
git --version
```

Repository klonen:

```bash
git clone https://github.com/VolkanBa/CodexWebApp.git
cd CodexWebApp
```

Dependencies installieren:

```bash
npm install
```

Frontend starten:

```bash
npm run dev:frontend
```

Backend in einem zweiten Terminal starten:

```bash
npm run dev:backend
```

Health Check:

```bash
curl http://localhost:4000/health
```

Ports prüfen:

```bash
ss -ltnp | grep ':3000'
ss -ltnp | grep ':4000'
```

Prozess bei belegtem Port beenden:

```bash
kill <PID>
```

Wenn der Prozess nicht reagiert:

```bash
kill -9 <PID>
```

## VSCode Tasks

In VSCode kannst du `Terminal > Run Task...` verwenden.

Vorhandene Tasks:

- `Frontend: Dev Server`
- `Backend: Dev Server`
- `Build: All`

Die Tasks sind in `.vscode/tasks.json` definiert.

## Build prüfen

Vor Commits oder größeren Änderungen immer prüfen:

```bash
npm run build
```

Der Build führt aus:

- Frontend: `next build`
- Backend: `tsc -p tsconfig.json`

## Wizard-Regeltests

Für die Wizard-Regel-Engine gibt es gezielte Backend-Tests:

```bash
npm run test:wizard
```

Diese Tests prüfen unter anderem Scoring, Farbzwang, Sonderkarten und parallele Spiel-IDs.

## Production-Start lokal

Erst bauen:

```bash
npm run build
```

Backend starten:

```bash
npm --workspace backend run start
```

Frontend starten:

```bash
npm --workspace frontend run start
```

Hinweis: Für echte Produktion braucht das Frontend später eine Deployment-Umgebung und das Backend passende Umgebungsvariablen.

## Docker

Alternativ kann das Projekt mit Docker Compose gestartet werden:

```bash
npm run docker:up
```

Stoppen:

```bash
npm run docker:down
```

Logs anzeigen:

```bash
npm run docker:logs
```

Details zur Installation, zu Docker Desktop, Ubuntu und Volumes stehen in `docs/DOCKER.md`.

## Umgebungsvariablen

Beispieldateien:

- `frontend/.env.example`
- `backend/.env.example`

Für lokale Entwicklung kannst du daraus eigene `.env`-Dateien erstellen. `.env`-Dateien werden nicht committed.

Frontend:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Backend:

```env
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
PRIVATE_ACCESS_ADMIN_USERNAME=Volle
PRIVATE_ACCESS_PASSWORD_HASH=$argon2id$v=19$...
PRIVATE_ACCESS_USERS_JSON=[{"username":"Neo","passwordHash":"","role":"user"}]
SESSION_COOKIE_NAME=private_session
SESSION_COOKIE_SECURE=false
SESSION_TTL_MINUTES=60
AUTH_RATE_LIMIT_WINDOW_MINUTES=15
AUTH_RATE_LIMIT_MAX=5
```

Passwort-Hash für lokale Entwicklung erzeugen:

```bash
node -e "import('argon2').then(async (argon2) => console.log(await argon2.hash(process.argv[1])))" "DEIN_LOKALES_PASSWORT"
```

Mehr Details stehen in `docs/AUTHENTICATION.md`.

## Troubleshooting

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

### Next.js Build scheitert wegen `.next/trace`

Ursache: Der Frontend-Dev-Server läuft noch und sperrt Dateien.

Lösung:

1. Frontend-Dev-Server stoppen.
2. Build erneut ausführen:

```bash
npm run build
```

### Dependencies fehlen

```bash
npm install
```

Danach erneut starten oder bauen.

### Backend antwortet nicht

Prüfen, ob der Backend-Server läuft:

```bash
curl http://localhost:4000/health
```

Unter Windows:

```powershell
Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing
```

### npm audit Hinweis

Aktuell ist ein moderater Audit-Hinweis in Nexts interner PostCSS-Abhängigkeit dokumentiert. Kein `npm audit fix --force` ausführen, solange npm dafür einen brechenden Versionswechsel vorschlägt. Die Behebung soll über ein gezieltes Framework-Upgrade erfolgen.

## Best Practices

- Änderungen klein halten und mit Linear-Tickets verknüpfen.
- Neue Features immer in `docs/` dokumentieren.
- Vor jedem Push `npm run build` ausführen.
- Private Inhalte und Passwörter nie im Frontend hardcoden.
- `.env`-Dateien lokal halten und nicht committen.
- Nicht direkt auf `main` arbeiten; Feature-Branches verwenden.
