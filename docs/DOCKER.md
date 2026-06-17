# Docker

Das Projekt kann mit Docker Compose als zwei getrennte Services gestartet werden:

- `frontend`: Next.js auf Port `3000`
- `backend`: Express API auf Port `4000`

## Voraussetzungen

- Docker Desktop
- vorhandene `backend/.env`

Die Datei `backend/.env` wird nicht nach GitHub gepusht. Sie muss lokal existieren und mindestens den Passwort-Hash für den Admin-/Privatlogin enthalten.

## Start

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
docker compose down
```

## Persistente Daten

Docker Compose nutzt Volumes:

- `subject-data`: speichert `subjects.json`
- `subject-uploads`: speichert hochgeladene Fachbilder

Diese Daten sind nicht Teil des Git-Repositories und werden nicht nach GitHub gepusht.

## Neu bauen

```bash
docker compose build --no-cache
docker compose up
```

## Best-Practice-Regeln

- Keine `.env`-Dateien committen.
- Keine Uploads committen.
- Keine privaten Dokumente in `frontend/public/` ablegen.
- Produktions-Secrets später über die Hosting-Umgebung setzen, nicht im Image speichern.
