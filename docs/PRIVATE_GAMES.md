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
- Wizard-Lobbies werden nach 1 Stunde ohne Spielaktion automatisch aus dem In-Memory-Store entfernt.
- Eine Lobby kann per Join-Link geteilt werden.
- Der Join-Link hat das Format `/private/games/wizard/join/[gameId]`.
- Der Backend-Store ist aktuell in-memory. Nach Backend-Neustart sind laufende Spiele weg.
- Der Client merkt sich die zuletzt geöffnete Wizard-Lobby lokal im Browser und öffnet sie nach einem Seiten-Reload automatisch wieder, solange das Spiel im Backend noch existiert.
- Admins sehen zusätzlich einen Debugmodus-Button.
- Admins können bestehende Wizard-Lobbys und laufende Spiele über die Lobbyliste oder direkt in der Spielansicht auflösen. Die Berechtigung wird serverseitig am WebSocket anhand der Admin-Rolle geprüft. Verbundene Clients schließen ein aufgelöstes Spiel sofort und entfernen den gespeicherten Lobby-Verweis.
- Im Debugmodus erstellt das Backend vier virtuelle Spieler: `Volle 1` bis `Volle 4`.
- Alle Debug-Spieler werden vom Admin-Account gesteuert.
- In der UI wird farbig angezeigt, welcher Debug-Spieler gerade am Zug ist.
- Nach dem letzten Stich einer Runde wertet das Backend automatisch und startet direkt die nächste Runde, solange das Spiel noch nicht beendet ist.
- Die Trumpfwahl bei aufgedecktem Wizard, Gestaltwandler, Vampir oder Werwolf ist intern an den Geber der Runde gebunden. Der Geber rotiert pro Runde über `dealerIndex = (roundNumber - 1) % players.length` im Spielerarray und damit im Uhrzeigersinn.
- Wird Wolke oder Jongleur als Trumpfkarte aufgedeckt, bestimmt die Person, die den ersten Stich der Runde eröffnen würde, die Trumpffarbe.
- Das Spiel-Log wird strukturiert übertragen. Gespielte Karten werden im Log als kleine Karten angezeigt; Gewinnernamen werden im Frontend hervorgehoben.
- Rundenwertungen werden im Log mit Punkteänderung und Gesamtstand pro Person angezeigt.

Für produktive Online-Nutzung sollte später ein persistenter Store ergänzt werden, zum Beispiel PostgreSQL oder Redis.

## Regeln

Aktueller Regelstand:

- Runde `R`: Jede Person erhält `R` Karten.
- Die maximale Rundenzahl hängt von der Spielerzahl ab: 2 Spieler = 30, 3 Spieler = 20, 4 Spieler = 15, 5 Spieler = 12, 6 Spieler = 10.
- Vor Rundenstart sagt jede Person die erwarteten Stiche voraus.
- Eine abgegebene Stichvorhersage kann nicht manuell geändert werden.
- Farbzwang gilt für angespielte Farben.
- Sonderkarten können vom Farbzwang ausgenommen sein.
- Handkarten werden serverseitig nach Farbe `Rot`, `Grün`, `Blau`, `Gelb` und danach nach Wert aufsteigend sortiert.
- Die feste Handanzeige rendert ausschließlich die Karten. Sie besitzt keinen sichtbaren Hintergrund, keinen Titel, keinen Zähler und keine sichtbare Scrollleiste.
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
- `Bombe`: annulliert den Stich. Niemand bekommt einen Stichpunkt. Die Person, die ohne Bombe gewonnen hätte, eröffnet den nächsten Stich. Wird die Bombe als erste Karte eines Stichs gespielt, zählt sie als Narr und annulliert den Stich nicht.
- `Werwolf`: Wenn der Werwolf zu Rundenbeginn auf einer Hand liegt, zieht ihn das System vor jeder Vorhersage automatisch auf den Trumpfplatz. Die ursprünglich aufgedeckte Trumpfkarte wird mit dem Werwolf getauscht und auf diese Hand gelegt. Die Person, die den Werwolf hatte, bestimmt die Trumpffarbe.
- `Gestaltwandler`: wird erst beim Ausspielen per Popup als Wizard oder Narr gewählt.
- `Vampir`: Beim Ausspielen deckt der Vampir eine zufällige Karte aus dem Restdeck auf. Diese Karte wird sofort zur neuen Trumpfkarte und wird vom Vampir für den aktuellen Stich kopiert. Liegt vorher der Werwolf auf dem Trumpfplatz, kopiert der Vampir nicht den Werwolf, sondern ersetzt ihn durch die gezogene Restdeckkarte.
- `Hexe`: sehr niedrige Sonderkarte. Nach der Stichauflösung tauscht nur die Person, die die Hexe gespielt hat, eine eigene Handkarte gegen eine Karte aus dem Stich; die neu gelegte Karte hat keinen Effekt. Nach dem Tausch wird der Effekt serverseitig geschlossen, damit das Tauschmenü nicht erneut erscheint.
- `Jongleur 7 1/2`: kommt nur einmal im Deck vor. Die Karte ist auf der Hand farblos, kann immer gespielt werden und wird beim Ausspielen per Popup frei eingefärbt. Farbzwang gilt für diese Karte nicht. Der Weitergabe-Effekt tritt nur ein, wenn der Jongleur den Stich gewinnt. Dann wählt jede Person geheim eine eigene Handkarte aus; diese Karten werden gleichzeitig nach links weitergegeben.
- `Wolke 9 3/4`: kommt nur einmal im Deck vor. Die Karte ist auf der Hand farblos, kann immer gespielt werden und wird beim Ausspielen per Popup frei eingefärbt. Farbzwang gilt für diese Karte nicht. Der Vorhersage-Effekt tritt nur ein, wenn die Wolke den Stich gewinnt. Der Stichgewinner verändert die eigene Vorhersage um `+1` oder `-1`; die Vorhersage darf nicht unter `0` fallen.

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
- Vampir ersetzt Werwolf-Trumpf durch eine Restdeckkarte
- flexible Farbwahl für Wolke und Jongleur
- freie Jongleur-Auswahl pro Spieler
- Wolke/Jongleur ohne Farbzwang und Effekte nur bei Stichgewinn
- Werwolf-Trumpfwahl
- Werwolf-Starttausch aus der Hand
- Vampir-Restdeck-Trumpfwechsel
- feste Maximalrunden nach Spielerzahl
- Lobby-Timeout nach 1 Stunde Inaktivität
- Vorhersagesperre nach Abgabe
- Bombe als erste Stichkarte zählt als Narr
- Punkteänderungen im Rundenlog
- Wolke `+1` und `-1`
- rotierende Trumpfwahlberechtigung über den Geber
- Hexen-Tausch nur durch die Hexen-Person und nur einmal pro Effekt
- parallele Spiel-IDs
- Admin-Debugspiel mit vier kontrollierten Seats

## Kartendesigns

Lokale private Kartendesigns liegen unter:

```text
private-data/BIlder für Wizard
```

Dieser Ordner wird nicht nach GitHub gepusht. Das Backend liefert die Bilder nach Login über `GET /private/wizard/cards/:designKey/image` aus. Der Ordner wird nicht in `frontend/public/` kopiert und bleibt dadurch vom öffentlichen Frontend getrennt.

Jede Karte enthält einen `designKey` und einen relativen `imagePath`, damit Designs später einzeln ausgetauscht werden können. Wenn kein exakt passendes Bild gefunden wird, nutzt das Backend deterministisch ein vorhandenes Bild als Fallback. Der Gestaltwandler nutzt den Schlüssel `joseph-joestar-wizard-jester` und ist auf `Joseph Joestar` gemappt.

Der lokale Asset-Pfad ist konfigurierbar:

```env
WIZARD_CARD_IMAGE_ROOT=../private-data/BIlder für Wizard
```

Docker nutzt:

```env
WIZARD_CARD_IMAGE_ROOT=/app/private-data/BIlder für Wizard
```

## Grenzen der aktuellen Version

- Der Spielstatus ist in-memory und noch nicht persistent.
- WebSocket-Status wird live übertragen, aber es gibt noch keine Wiederaufnahme nach Backend-Neustart.
- Es gibt noch keine KI-Spieler.
- Kartendesigns werden lokal geschützt ausgeliefert, aber noch nicht in einer Datenbank verwaltet.
