# Private Daten

Diese Richtlinie schützt private Inhalte davor, versehentlich im Repository oder auf GitHub zu landen.

## Niemals committen

Folgende Inhalte dürfen nicht committed werden:

- Zeugnisse
- Arbeitszeugnisse
- Zertifikate mit persönlichen Daten
- private Bilder
- private Notizen
- Ausweisdokumente
- Passwörter
- API-Schlüssel
- Session-Secrets
- Datenbank-Dateien mit echten Daten

## Blockierte Pfade

Diese Pfade sind für private oder sensible Daten reserviert und stehen in `.gitignore`:

- `Daten/`
- `private-data/`
- `backend/data/`
- `backend/private-data/`
- `backend/content/private/`
- `uploads/`
- `frontend/public/documents/`
- `frontend/public/private/`

## Wichtige Regel

Alles unter `frontend/public/` ist öffentlich erreichbar.

Private Dokumente dürfen dort nicht abgelegt werden. Wenn private Inhalte später angezeigt werden sollen, müssen sie über das Backend nach erfolgreicher Session-Prüfung ausgeliefert werden.

Öffentliche Admin-Inhalte wie Fächertexte und hochgeladene Bilder werden lokal in `backend/data/` und `uploads/` gespeichert. Diese Inhalte sind absichtlich nicht Teil von GitHub.

## Automatischer Check

Der Build führt diesen Check aus:

```bash
npm run check:sensitive-files
```

Der Check blockiert Dateien in öffentlichen Dokument- oder Privatordnern und prüft, dass sensible Pfade nicht getrackt werden.

## Bereits gepushte Dateien

Wenn sensible Dateien bereits in GitHub gelandet sind, reicht ein normaler Lösch-Commit nicht aus, um sie vollständig aus der Historie zu entfernen.

Nötiger separater Schritt:

1. Repository-Historie mit einem geeigneten Werkzeug bereinigen.
2. Bereinigte Historie per Force-Push veröffentlichen.
3. Alle lokalen Klone neu synchronisieren oder frisch klonen.

Dieser Schritt darf nicht beiläufig passieren, weil er die Zusammenarbeit im Repository beeinflusst.
