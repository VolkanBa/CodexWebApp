# Architektur

Diese Webapp ist bewusst in Frontend und Backend getrennt. Dadurch bleibt die sichtbare Website flexibel, während alle sicherheitskritischen Funktionen später zentral im Backend liegen.

## Frontend

Pfad: `frontend/`

Technik:

- Next.js
- TypeScript
- Tailwind CSS

Aufgaben:

- Landing Page rendern
- öffentlichen geschäftlichen Bereich anzeigen
- Login-Oberfläche für den privaten Bereich bereitstellen
- API-Aufrufe an das Backend senden

Aktuelle Routen:

- `/`: Landing Page
- `/login`: eigener Login-Reiter für Admin- und Privatbereich
- `/business`: öffentlicher geschäftlicher Bereich ohne private Nachweise
- `/business/projects`: öffentliche Projektübersicht
- `/business/hochschule-gelsenkirchen`: öffentliche Fächerübersicht
- `/business/hochschule-gelsenkirchen/[slug]`: öffentliche Fachdetailseite
- `/business/hochschule-gelsenkirchen/admin`: geschützter Adminbereich für Fächer
- `/private/login`: serverseitig angebundenes Loginformular
- `/private`: geschützte private Ansicht

Das Frontend prüft keine Passwörter. Passwortprüfung und Session-Erstellung liegen im Backend.

### Öffentlicher Bereich

Der öffentliche Bereich ist bewusst auf nicht-sensitive Inhalte begrenzt:

- `frontend/app/business/page.tsx`: öffentliche Profilseite
- `frontend/app/business/businessContent.ts`: pflegbare öffentliche Profilpunkte und Links
- `frontend/app/business/projects/page.tsx`: eigene Projektseite
- `frontend/app/business/hochschule-gelsenkirchen/`: öffentliche Hochschul-Fächerseiten und Admin-Editor
- `frontend/public/images/profile-professional.jpg`: professionelles Profilbild für die Landing Page
- `scripts/check_sensitive_files.py`: blockiert sensible öffentliche Dokumentpfade im Build

Zeugnisse, Arbeitszeugnisse und private Nachweise gehören nicht in `frontend/public/` und nicht ins Repository. Details stehen in `docs/PUBLIC_PROFILE.md` und `docs/PRIVATE_DATA_POLICY.md`.

## Backend

Pfad: `backend/`

Technik:

- Node.js
- TypeScript
- Express
- Helmet
- CORS
- Argon2
- Zod
- express-rate-limit

Aufgaben:

- API-Endpunkte bereitstellen
- Authentifizierung prüfen
- Sessions über sichere Cookies verwalten
- private Inhalte serverseitig schützen
- später Datenbankzugriff kapseln

Aktuelle Route:

- `GET /health`: prüft, ob das Backend läuft

Auth-Routen:

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /private/content`

Fächer-Routen:

- `GET /subjects`: veröffentlichte Fächer lesen
- `GET /subjects/:slug`: veröffentlichtes Fach lesen
- `GET /admin/subjects`: alle Fächer im Adminbereich lesen
- `POST /admin/subjects`: Fach erstellen
- `PUT /admin/subjects/:id`: Fach bearbeiten
- `DELETE /admin/subjects/:id`: Fach löschen

Die Admin-Routen verwenden dieselbe serverseitige Session-Prüfung wie der private Bereich. Fächertexte liegen lokal in `backend/data/subjects.json`, Bilder in `uploads/subjects/`. Pro Fach sind mehrere Bilder möglich; ihre Reihenfolge wird im JSON gespeichert. Beide Pfade werden nicht nach GitHub gepusht.

## Docker

Docker Compose startet Frontend und Backend getrennt. Details stehen in `docs/DOCKER.md`.

- Frontend-Image: `frontend/Dockerfile`
- Backend-Image: `backend/Dockerfile`
- Compose: `docker-compose.yml`
- Persistente Daten: Docker-Volumes für `backend/data` und `uploads`

## Sicherheit

Der private Bereich ist serverseitig geschützt. Details stehen in `docs/AUTHENTICATION.md`.

Private Inhalte dürfen nicht in Git oder in `frontend/public/` gespeichert werden. Für lokale private Daten sind ignorierte Pfade wie `Daten/`, `private-data/` oder `backend/private-data/` vorgesehen. Der Build führt `npm run check:sensitive-files` aus und blockiert bekannte öffentliche sensible Pfade.

Geplante Mindestanforderungen:

- Passwort-Hashing mit `argon2`
- keine Klartext-Passwörter
- parametrisierte Datenbankabfragen oder ORM gegen SQL Injection
- sichere Cookies mit `httpOnly`, `secure` und `sameSite`
- Rate Limiting gegen Bruteforce
- serverseitige Session-Prüfung vor jedem privaten Inhalt
- Validierung aller API-Eingaben
- Rate Limiting für Loginversuche

Bekannter Stand der Abhängigkeiten:

- `npm audit --omit=dev` meldet aktuell einen moderaten Audit-Treffer in Nexts interner PostCSS-Abhängigkeit.
- Kein automatisches `npm audit fix --force` verwenden, solange npm dafür einen brechenden Versionswechsel vorschlägt.
- Behebung später über gezieltes Next-Upgrade prüfen.

## Lokale Entwicklung

Die vollständige Anleitung für Windows/VSCode und Linux/Ubuntu steht in `docs/LOCAL_DEVELOPMENT.md`.

## VSCode

Der Workspace enthält `.vscode/` mit:

- empfohlenen Extensions
- automatischem Formatieren beim Speichern
- Tasks für Frontend, Backend und Build

Empfohlene Arbeitsweise:

1. Workspace-Root in VSCode öffnen.
2. Empfohlene Extensions installieren.
3. Frontend und Backend in getrennten Terminals starten.
4. Änderungen in `docs/` mitdokumentieren.

## Git-Workflow

Für parallele Arbeit wird nicht direkt auf `main` entwickelt. Details stehen in `docs/GIT_WORKFLOW.md`.
