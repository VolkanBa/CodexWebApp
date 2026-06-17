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
- optionalem Bild
- Veröffentlichungsstatus

## Adminrechte

Der Adminbereich nutzt die bestehende Authentifizierung des privaten Bereichs.

1. Unter `/private/login` anmelden.
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

## Bildregeln

Erlaubt sind:

- JPG
- PNG
- WebP

Maximale Dateigröße pro Bild: 3 MB.

## Datenschutz

Der Hochschul-Fächerbereich ist öffentlich. Dort dürfen keine privaten Dokumente, Zeugnisse, Arbeitszeugnisse, API-Schlüssel oder vertraulichen Texte gepflegt werden.

Wenn ein Inhalt nur privat sichtbar sein soll, gehört er in den geschützten privaten Bereich und muss serverseitig nach Session-Prüfung ausgeliefert werden.
