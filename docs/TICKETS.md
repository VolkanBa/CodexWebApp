# Tickets

Dieses Ticketprotokoll dokumentiert die bisherige Umsetzung lokal und spiegelt den Stand in Linear.

Link zur Linear-Seite: `https://linear.app/codexwebapp/team/COD/all`

Linear-Projekt: `CodexWebApp`
Linear-Team: `CodexWebApp`

## Abgeschlossen

- [x] COD-5 / WEB-001: Projektstruktur als getrenntes Frontend und Backend anlegen
  - Ergebnis: `frontend/` und `backend/` wurden erstellt.
- [x] COD-6 / WEB-002: Next.js Frontend mit TypeScript und Tailwind konfigurieren
  - Ergebnis: App Router, Tailwind-Konfiguration und globale Styles sind vorhanden.
- [x] COD-7 / WEB-003: Landing Page mit Hero-Bild und Farbwelt umsetzen
  - Ergebnis: Startseite nutzt Lila als Hauptfarbe sowie Orange, Grün und Schwarz als Akzente.
- [x] COD-8 / WEB-004: Geschäftlichen Bereich als Platzhalterseite anlegen
  - Ergebnis: `/business` existiert mit Bereichen für Profil, Kompetenzen, Projekte und Kontakt.
- [x] COD-9 / WEB-005: Privaten Bereich als Login-Platzhalter vorbereiten
  - Ergebnis: `/private/login` existiert ohne unsichere Frontend-Passwortprüfung.
- [x] COD-10 / WEB-006: Backend-Grundgerüst mit Health Endpoint erstellen
  - Ergebnis: Express API mit `GET /health` ist implementiert.
- [x] COD-11 / WEB-007: VSCode-Unterstützung ergänzen
  - Ergebnis: Settings, Extensions und Tasks liegen in `.vscode/`.
- [x] COD-12 / WEB-008: Projektdokumentation starten
  - Ergebnis: README und `docs/ARCHITECTURE.md` dokumentieren Aufbau, Start und Sicherheitsgrundlagen.

## Offen

- [x] COD-13 / WEB-009: Tickets in Linear anlegen und abschließen
  - Ergebnis: Linear-Projekt und Tickets wurden erstellt.
- [ ] COD-14 / WEB-010: Echte Authentifizierung planen und implementieren
  - Hinweis: Erst nach Entscheidung über Datenbank und Session-Strategie umsetzen.
- [ ] COD-15 / WEB-011: Echte Inhalte für geschäftlichen Bereich einpflegen
  - Hinweis: Benötigt Name, Profiltext, Skills, Projekte und Kontaktinformationen.
- [ ] COD-16 / WEB-012: Next/PostCSS Audit-Treffer durch Framework-Upgrade beheben
  - Hinweis: `npm audit --omit=dev` meldet einen moderaten Treffer in Nexts interner `postcss@8.4.31`. `npm audit fix --force` wurde nicht ausgeführt, weil npm dafür einen brechenden Versionswechsel vorschlägt.
- [x] COD-17 / WEB-013: Deutsche Texte auf echte Umlaute umstellen
- [x] COD-18 / WEB-014: Projekt auf GitHub als CodexWebApp veröffentlichen
- [x] COD-19 / WEB-015: Lokale Entwicklungsdokumentation ergänzen
- [x] COD-20 / WEB-016: Sichere Authentifizierung für privaten Bereich implementieren
  - Branch: `codex/secure-auth`
- [x] COD-21 / WEB-017: Öffentlichen Bereich mit Dropdown-Struktur ausbauen
  - Branch: `codex/public-business-page`
  - Linear: `https://linear.app/codexwebapp/issue/COD-21/web-017-offentlichen-bereich-mit-dropdown-struktur-ausbauen`
- [x] COD-22 / WEB-018: Öffentliche Dokumente, Profilbild und Projektbereich einbinden
  - Branch: `codex/embed-public-data-projects`
  - Linear: `https://linear.app/codexwebapp/issue/COD-22/web-018-offentliche-dokumente-profilbild-und-projektbereich-einbinden`
- [x] COD-23 / WEB-019: Dokument-PDFs und Vollbild-Viewer umsetzen
  - Branch: `codex/document-pdf-viewer`
  - Linear: `https://linear.app/codexwebapp/issue/COD-23/web-019-dokument-pdfs-und-vollbild-viewer-umsetzen`
  - Untertickets:
    - [x] COD-24 / WEB-019-FE: Dokument-Viewer und Vollbildansicht implementieren
    - [x] COD-25 / WEB-019-BE: Öffentliche Asset-Auslieferung und Sicherheitsabgrenzung prüfen
    - [x] COD-26 / WEB-019-DOCS: Pflegehinweise für PDFs und Dokument-Viewer ergänzen
- [x] COD-27 / WEB-020: Öffentliche Zeugnisse entfernen und private Daten schützen
  - Branch: `codex/remove-public-documents`
  - Linear: `https://linear.app/codexwebapp/issue/COD-27/web-020-offentliche-zeugnisse-entfernen-und-private-daten-schutzen`
  - Untertickets:
    - [x] COD-28 / WEB-020-FE: Zeugnisse und Dropdown-Menüs aus öffentlichem Profil entfernen
    - [x] COD-29 / WEB-020-SEC: Private Daten gegen versehentliches Committen absichern
    - [x] COD-30 / WEB-020-DOCS: Private-Daten-Richtlinie und Ticketprotokoll ergänzen
