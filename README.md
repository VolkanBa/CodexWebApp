# Personal Webapp

Getrennte Webapp-Struktur für eine persönliche Website mit öffentlichem geschäftlichem Bereich und später geschütztem privaten Bereich.

## Struktur

- `frontend/`: Next.js + TypeScript + Tailwind CSS
- `backend/`: Node.js + TypeScript + Express API
- `.vscode/`: empfohlene VSCode-Einstellungen, Extensions und Start-Tasks

## Repository

GitHub: `https://github.com/VolkanBa/CodexWebApp`

## Start in VSCode

Die vollständige Anleitung für Windows/VSCode und Linux/Ubuntu steht in [docs/LOCAL_DEVELOPMENT.md](docs/LOCAL_DEVELOPMENT.md).

1. Ordner `C:\Users\volka\Desktop\CodexWebApp` in VSCode öffnen.
2. Empfohlene Extensions installieren, wenn VSCode danach fragt.
3. Terminal in VSCode öffnen.
4. Einmalig installieren:

```bash
npm install
```

5. Frontend starten:

```bash
npm run dev:frontend
```

6. In einem zweiten Terminal Backend starten:

```bash
npm run dev:backend
```

Das Frontend läuft standardmäßig auf `http://localhost:3000`.
Das Backend läuft standardmäßig auf `http://localhost:4000`.

Alternativ kannst du in VSCode `Terminal > Run Task...` nutzen:

- `Frontend: Dev Server`
- `Backend: Dev Server`
- `Build: All`

## Wichtige Dateien

- Landing Page: `frontend/app/page.tsx`
- Geschäftlicher Bereich: `frontend/app/business/page.tsx`
- Inhalte für den geschäftlichen Bereich: `frontend/app/business/businessContent.ts`
- Projektseite: `frontend/app/business/projects/page.tsx`
- Hochschul-Fächerbereich: `frontend/app/business/hochschule-gelsenkirchen/`
- Login-Platzhalter: `frontend/app/private/login/page.tsx`
- Backend-Server: `backend/src/server.ts`
- Fächer-API und Speicherung: `backend/src/subjectStore.ts`
- Professionelles Profilbild: `frontend/public/images/profile-professional.jpg`
- Private-Daten-Check: `scripts/check_sensitive_files.py`
- Architektur-Doku: `docs/ARCHITECTURE.md`
- Lokale Entwicklungsdoku: `docs/LOCAL_DEVELOPMENT.md`
- Auth-Doku: `docs/AUTHENTICATION.md`
- Öffentlicher Bereich: `docs/PUBLIC_PROFILE.md`
- Hochschul-Fächerbereich: `docs/SUBJECT_ADMIN.md`
- Private-Daten-Richtlinie: `docs/PRIVATE_DATA_POLICY.md`
- Git-Workflow: `docs/GIT_WORKFLOW.md`
- Ticketprotokoll: `docs/TICKETS.md`
- Linear-Doku: `docs/LINEAR.md`

## Sicherheit

Der private Bereich wird serverseitig geschützt. Passwortprüfung und Session-Verwaltung liegen im Backend, nicht im Frontend.

Private Dokumente, Zeugnisse und Arbeitsnachweise dürfen nicht in `frontend/public/` oder Git abgelegt werden. Details stehen in [docs/PRIVATE_DATA_POLICY.md](docs/PRIVATE_DATA_POLICY.md).

## Dokumentationsregel

Neue Features sollen immer in `docs/` dokumentiert werden. Aufgaben werden zusätzlich in `docs/TICKETS.md` gepflegt und in Linear gespiegelt.
