# Hochschul-Fächerbereich

Der Bereich `Hochschule Gelsenkirchen` liegt unter:

- Öffentlich: `/business/hochschule-gelsenkirchen`
- Fachdetailseite: `/business/hochschule-gelsenkirchen/[fach-slug]`
- Admin: `/business/hochschule-gelsenkirchen/admin`

## Zweck

Hier kannst du öffentliche Zusammenfassungen deiner Fächer pflegen. Jedes Fach bekommt eine eigene Seite mit:

- Fachname
- Kurzbeschreibung
- ausführlicher Zusammenfassung
- mehreren optionalen Bildern
- Veröffentlichungsstatus

## Adminrechte

Der Adminbereich nutzt die bestehende Authentifizierung des privaten Bereichs.

1. Unter `/login` anmelden.
2. Danach `/business/hochschule-gelsenkirchen/admin` öffnen.
3. Fächer erstellen, bearbeiten, veröffentlichen oder löschen.

Die Admin-API liegt im Backend unter `/admin/subjects` und ist durch die bestehende Session geschützt.

## Datenablage

Die Inhalte werden nicht in Git gespeichert.

- Fachtexte: `backend/data/subjects.json`
- Bilder: `uploads/subjects/`

Beide Pfade stehen in `.gitignore`.

## Öffentliche API

Öffentliche Besucher lesen nur veröffentlichte Inhalte:

- `GET /subjects`
- `GET /subjects/:slug`

Unveröffentlichte Fächer sind nur im Adminbereich sichtbar.

## Bilder

Erlaubt sind:

- JPG
- PNG
- WebP

Maximale Dateigröße pro Bild: 3 MB.

Im Adminbereich können mehrere Bilder pro Fach hochgeladen werden. Bereits gespeicherte Bilder können:

- nach oben verschoben werden
- nach unten verschoben werden
- entfernt werden
- mit einer Bildbeschreibung versehen werden

Die Reihenfolge im Adminbereich ist die Reihenfolge auf der öffentlichen Fachseite.

## Datenschutz

Der Hochschul-Fächerbereich ist öffentlich. Dort dürfen keine privaten Dokumente, Zeugnisse, Arbeitszeugnisse, API-Schlüssel oder vertraulichen Texte gepflegt werden.

Wenn ein Inhalt nur privat sichtbar sein soll, gehört er in den geschützten privaten Bereich und muss serverseitig nach Session-Prüfung ausgeliefert werden.
