# Tickets

Dieses Ticketprotokoll dokumentiert die bisherige Umsetzung lokal und spiegelt den Stand in Linear.

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
