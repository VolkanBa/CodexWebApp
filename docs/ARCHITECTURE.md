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
- später API-Aufrufe an das Backend senden

Aktuelle Routen:

- `/`: Landing Page
- `/business`: Platzhalter für den geschäftlichen Bereich
- `/private/login`: Login-Platzhalter
- `/private`: reservierte Route für den später geschützten Bereich

Das Frontend prüft aktuell keine Passwörter. Das ist absichtlich so, weil Passwortlogik niemals nur im Browser umgesetzt werden soll.

## Backend

Pfad: `backend/`

Technik:

- Node.js
- TypeScript
- Express
- Helmet
- CORS

Aufgaben:

- API-Endpunkte bereitstellen
- später Authentifizierung prüfen
- später Sessions oder sichere Cookies verwalten
- später private Inhalte serverseitig schützen
- später Datenbankzugriff kapseln

Aktuelle Route:

- `GET /health`: prüft, ob das Backend läuft

Geplante spätere Routen:

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `GET /private/content`

## Sicherheit

Der private Bereich wird erst dann wirklich aktiviert, wenn das Backend Authentifizierung und Zugriffsschutz implementiert.

Geplante Mindestanforderungen:

- Passwort-Hashing mit `argon2` oder `bcrypt`
- keine Klartext-Passwörter
- parametrisierte Datenbankabfragen oder ORM gegen SQL Injection
- sichere Cookies mit `httpOnly`, `secure` und `sameSite`
- Rate Limiting gegen Bruteforce
- serverseitige Session-Prüfung vor jedem privaten Inhalt
- Validierung aller API-Eingaben

Bekannter Stand der Abhängigkeiten:

- `npm audit --omit=dev` meldet aktuell einen moderaten Audit-Treffer in Nexts interner PostCSS-Abhängigkeit.
- Kein automatisches `npm audit fix --force` verwenden, solange npm dafür einen brechenden Versionswechsel vorschlägt.
- Behebung später über gezieltes Next-Upgrade prüfen.

## Lokale Entwicklung

Frontend starten:

```bash
npm run dev:frontend
```

Backend starten:

```bash
npm run dev:backend
```

Build prüfen:

```bash
npm run build
```

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
