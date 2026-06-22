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
- [x] COD-31 / WEB-021: Hochschul-Fächerbereich mit Admin-Bearbeitung umsetzen
  - Branch: `codex/subject-admin-area`
  - Linear: `https://linear.app/codexwebapp/issue/COD-31/web-021-hochschul-facherbereich-mit-admin-bearbeitung-umsetzen`
  - Untertickets:
    - [x] COD-32 / WEB-021-BE: Geschützte Fächer-API mit Bildspeicherung implementieren
    - [x] COD-33 / WEB-021-FE: Öffentliche Hochschul-Fächerseiten und Admin-Editor bauen
    - [x] COD-34 / WEB-021-DOCS: Hochschul-Fächerbereich dokumentieren
- [x] WEB-022: Login-Flow, Fächer-Galerie und Dockerisierung umsetzen
  - Branch: `codex/admin-gallery-docker`
  - Linear: ausstehend, weil Linear-Toolaufrufe aktuell mit einem internen Tool-Routingfehler abbrechen
  - Untertickets:
    - [x] WEB-022-FE-LOGIN: Eigenen Login-Reiter und Redirect zur Landing Page umsetzen
    - [x] WEB-022-FE-GALLERY: Mehrere Bilder pro Fach anzeigen und im Adminbereich sortierbar machen
    - [x] WEB-022-BE: Mehrfachbilder serverseitig speichern und Uploadpfade schützen
    - [x] WEB-022-DEVOPS: Dockerfiles, Compose und Docker-Doku ergänzen
    - [x] WEB-022-DOCS: Dokumentation und Datenschutzgrenzen aktualisieren
- [x] COD-35 / WEB-023: Docker-Setup finalisieren und lokal verifizieren
  - Branch: `codex/docker-finalization`
  - Linear: `https://linear.app/codexwebapp/issue/COD-35/web-023-docker-setup-finalisieren-und-lokal-verifizieren`
  - Hinweis: Docker Desktop wurde installiert, CLI und Compose-Konfiguration wurden geprüft. Der erste Container-Start benötigt noch eine laufende Docker Engine nach dem manuellen Erststart von Docker Desktop.
  - Untertickets:
    - [x] COD-36 / WEB-023-DEVOPS: Docker Compose und Images härten
    - [x] COD-37 / WEB-023-VERIFY: Docker Desktop Installation und Verifikation prüfen
    - [x] COD-38 / WEB-023-DOCS: Docker-Dokumentation ergänzen
- [x] COD-39 / WEB-024: Docker Runtime für Next-Konfiguration reparieren
  - Branch: `codex/docker-runtime-config-fix`
  - Linear: `https://linear.app/codexwebapp/issue/COD-39/web-024-docker-runtime-fur-next-konfiguration-reparieren`
  - Ergebnis: `next.config.ts` wird durch `next.config.mjs` ersetzt, damit der Produktionscontainer kein TypeScript zur Laufzeit nachinstalliert.
- [x] COD-40 / WEB-025: Lokale Docker-Anmeldung mit sicherer Cookie-Konfiguration reparieren
  - Branch: `codex/fix-local-docker-auth-cookie`
  - Linear: `https://linear.app/codexwebapp/issue/COD-40/web-025-lokale-docker-anmeldung-mit-sicherer-cookie-konfiguration`
  - Ergebnis: Session-Cookie `secure` wird über `SESSION_COOKIE_SECURE` konfigurierbar, damit lokale HTTP-Docker-Logins funktionieren und HTTPS-Produktion später explizit abgesichert bleibt.
- [x] COD-41 / WEB-026: Privat-Einstieg nach Login korrekt auf geschützten Bereich führen
  - Branch: `codex/fix-private-entry-link`
  - Linear: `https://linear.app/codexwebapp/issue/COD-41/web-026-privat-einstieg-nach-login-korrekt-auf-geschutzten-bereich`
  - Ergebnis: Landing-Page-Privatlink führt auf `/private` statt erneut auf `/login`.
- [x] COD-42 / WEB-027: Landing Page Login-Status anzeigen und Logout ermöglichen
  - Branch: `codex/landing-auth-state`
  - Linear: `https://linear.app/codexwebapp/issue/COD-42/web-027-landing-page-login-status-anzeigen-und-logout-ermoglichen`
  - Ergebnis: Landing Page zeigt bei aktiver Session `Log out` und blendet den großen Anmeldebutton aus.
- [x] COD-43 / WEB-028: Mehrbenutzer-Login mit Admin- und Nutzerrollen einführen
  - Branch: `codex/multi-user-auth`
  - Linear: `https://linear.app/codexwebapp/issue/COD-43/web-028-mehrbenutzer-login-mit-admin-und-nutzerrollen-einfuhren`
  - Ergebnis: Login nutzt Benutzername und Passwort; `Volle` ist Admin, 9 weitere Nutzer sind als normale Nutzer vorgesehen.
- [x] COD-44 / WEB-029: Ein Account nur einmal gleichzeitig und 1h Inaktivitäts-Logout
  - Branch: `codex/account-session-policy`
  - Linear: `https://linear.app/codexwebapp/issue/COD-44/web-029-ein-account-nur-einmal-gleichzeitig-und-1h-inaktivitats-logout`
  - Ergebnis: Die 9 normalen Nutzer teilen sich lokal ein neues sicheres Passwort, `Volle` behält das eigene Admin-Passwort. Pro Benutzername ist nur eine aktive Session erlaubt; nach 1 Stunde Inaktivität läuft die Session ab.
- [x] COD-45 / WEB-030: Privaten Spiele-Bereich vorbereiten
  - Branch: `codex/private-games-tab`
  - Linear: `https://linear.app/codexwebapp/issue/COD-45/web-030-privaten-spiele-bereich-vorbereiten`
  - Ergebnis: Der private Bereich enthält einen geschützten Tab `Spiele` mit eigener Route `/private/games` und geschütztem Backend-Endpunkt `GET /private/games`.
