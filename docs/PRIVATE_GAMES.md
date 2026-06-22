# Privater Spiele-Bereich

Der private Spiele-Bereich liegt unter `/private/games`. Er ist serverseitig geschützt und wird nur nach gültigem Login geladen.

## Wizard

Wizard ist als erstes spielbares Kartenspiel vorbereitet.

Frontend:

- `/private/games/wizard`
- `/private/games/wizard/join/[gameId]`

Backend:

- `GET /private/games`: geschützte Spieleübersicht
- `WS /ws/wizard`: geschützter Wizard-WebSocket

Die WebSocket-Verbindung authentifiziert sich über das bestehende `httpOnly` Session-Cookie. Ohne gültige Session wird die Verbindung geschlossen.

## Multiplayer

- Pro Wizard-Lobby sind 2 bis 6 eingeloggte Accounts möglich.
- Mehrere Wizard-Spiele können parallel laufen.
- Eine Lobby kann per Join-Link geteilt werden.
- Der Join-Link hat das Format `/private/games/wizard/join/[gameId]`.
- Der Backend-Store ist aktuell in-memory. Nach Backend-Neustart sind laufende Spiele weg.
- Admins sehen zusätzlich einen Debugmodus-Button.
- Im Debugmodus erstellt das Backend zwei virtuelle Spieler: `Volle 1` und `Volle 2`.
- Beide Debug-Spieler werden vom Admin-Account gesteuert.
- In der UI wird farbig angezeigt, welcher Debug-Spieler gerade am Zug ist.

Für produktive Online-Nutzung sollte später ein persistenter Store ergänzt werden, zum Beispiel PostgreSQL oder Redis.

## Regeln

Aktueller Regelstand:

- Runde `R`: Jede Person erhält `R` Karten.
- Vor Rundenstart sagt jede Person die erwarteten Stiche voraus.
- Farbzwang gilt für angespielte Farben.
- Sonderkarten können vom Farbzwang ausgenommen sein.
- Nur serverseitig gültige Züge werden angenommen.
- Punkte:

```text
exakt: 20 + 10 * gewonnene Stiche
falsch: -10 * abs(Vorhersage - gewonnene Stiche)
```

## Sonderkarten

Basis:

- `Wizard`: gewinnt gegen normale Karten; bei mehreren Wizards gewinnt der erste.
- `Narr`: Sonderkarte ohne Farbzwang.

Erweiterungen:

- `Drache`: sehr hohe Sonderkarte.
- `Fee`: absoluter Verlierer, außer ein Drache liegt im Stich; dann gewinnt die Fee.
- `Bombe`: annulliert den Stich. Niemand bekommt einen Stichpunkt. Die Person, die ohne Bombe gewonnen hätte, eröffnet den nächsten Stich.
- `Werwolf`: ändert die Trumpffarbe sofort und bis zum Ende der Runde.
- `Gestaltwandler`: wird beim Ausspielen als Wizard oder Narr gewählt.
- `Vampir`: kopiert die Karte, die bei der Trumpfbestimmung aufgedeckt wurde.
- `Hexe`: sehr niedrige Sonderkarte. Nach der Stichauflösung tauscht die spielende Person eine Handkarte gegen eine Karte aus dem Stich; die neu gelegte Karte hat keinen Effekt.
- `Jongleur 7 1/2`: numerische Karte mit Wert `7.5`; nach Stichauflösung geben alle ihre letzte Handkarte nach links weiter.
- `Wolke 9 3/4`: numerische Karte mit Wert `9.75`; der Stichgewinner muss die eigene Vorhersage um `+1` oder `-1` ändern.

Sonderkarten können vor dem Spiel in der Lobby ein- oder ausgeschaltet werden.

## Tests

Wizard-Regeltests laufen mit:

```bash
npm run test:wizard
```

Abgedeckt sind unter anderem:

- Scoring
- Farbzwang
- Wizard First-In-Wins
- Fee gegen Drache
- Bombe
- Vampir-Kopie
- parallele Spiel-IDs
- Admin-Debugspiel mit zwei kontrollierten Seats

## Kartendesigns

Lokale private Kartendesigns liegen unter:

```text
private-data/Bilder für Wizard
```

Dieser Ordner wird nicht nach GitHub gepusht. Für spätere austauschbare Designs soll ein geschütztes Asset-Mapping ergänzt werden. Joseph Joestar ist als gewünschte Design-Zuordnung für die Gestaltwandler/Wizard-Narr-Karte vorgemerkt, aber nicht als Regel hart verdrahtet.

Jede Karte enthält bereits einen `designKey`, damit Designs später einzeln ausgetauscht werden können. Der Gestaltwandler nutzt den Schlüssel `joseph-joestar-wizard-jester`.

## Grenzen der aktuellen Version

- Der Spielstatus ist in-memory und noch nicht persistent.
- WebSocket-Status wird live übertragen, aber es gibt noch keine Wiederaufnahme nach Backend-Neustart.
- Es gibt noch keine KI-Spieler.
- Kartendesigns sind noch nicht als geschützter Asset-Store eingebunden.
