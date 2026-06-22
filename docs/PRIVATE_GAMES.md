# Privater Spiele-Bereich

Der private Spiele-Bereich ist für spätere Spiele wie Uno, Wizard und 6 nimmt vorbereitet.

## Route

Frontend:

- `/private/games`

Backend:

- `GET /private/games`

Der Backend-Endpunkt ist mit derselben Session-Prüfung geschützt wie der restliche private Bereich. Ohne gültige Session antwortet das Backend mit `401`.

## Aktueller Stand

Version 1 enthält nur eine geschützte Übersicht mit geplanten Spielen:

- Uno
- Wizard
- 6 nimmt

Es gibt noch keine Spiel-Engine, keine Lobby, keine Spielstände und keine Persistenz.

## Sicherheitsgrenzen

- Keine Passwörter, Spielstände oder privaten Inhalte im Frontend hardcoden.
- Spätere Spielstände gehören serverseitig in eine Datenbank oder einen geschützten Storage.
- Wenn mehrere Nutzer gleichzeitig spielen sollen, muss die Logik serverseitig synchronisiert werden.
- Bei Echtzeitfunktionen später WebSockets oder Server-Sent Events gezielt prüfen.

## Nächste technische Schritte

1. Datenmodell für Spiele, Runden, Spieler und Spielzüge entwerfen.
2. Entscheiden, ob Spiele rundenbasiert über REST oder live über WebSockets laufen sollen.
3. Pro Spiel eine eigene Regel-Engine kapseln.
4. Tests für Regelentscheidungen, Punktewertung und ungültige Spielzüge ergänzen.
5. Erst danach UI für aktive Runden, Lobby und Scoreboards bauen.
