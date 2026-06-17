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
- `/business`: öffentlicher geschäftlicher Bereich mit Dropdown-Struktur
- `/business/projects`: öffentliche Projektübersicht
- `/private/login`: serverseitig angebundenes Loginformular
- `/private`: geschützte private Ansicht

Das Frontend prüft keine Passwörter. Passwortprüfung und Session-Erstellung liegen im Backend.

### Öffentlicher Bereich

Der öffentliche Bereich wird datengetrieben aufgebaut:

- `frontend/app/business/page.tsx`: Seite und Abschnittsdefinitionen
- `frontend/app/business/BusinessProfileMenu.tsx`: Dropdown und Bereichsanzeige
- `frontend/app/business/businessContent.ts`: pflegbare Inhalte für Schule, Beruf, Freitext und Links
- `frontend/app/business/projects/page.tsx`: eigene Projektseite
- `frontend/public/documents/`: öffentlich ausgelieferte Zeugnisse und Nachweise
- `frontend/public/images/profile-professional.jpg`: professionelles Profilbild für die Landing Page

Der Freitextbereich wird nur angezeigt, wenn `freeTextContent` nicht leer ist. Dokumente sind für spätere Bildvorschauen und PDF-Downloads vorbereitet. Details stehen in `docs/PUBLIC_PROFILE.md`.

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

## Sicherheit

Der private Bereich ist serverseitig geschützt. Details stehen in `docs/AUTHENTICATION.md`.

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
