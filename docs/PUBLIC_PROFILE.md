# Öffentlicher Bereich

Der öffentliche Bereich liegt unter `/business` und ist für Arbeitgeber, Kunden und berufliche Kontakte gedacht.

## Grundsatz

Der öffentliche Bereich enthält keine Zeugnisse, Arbeitszeugnisse, privaten Nachweise oder anderen sensiblen Dateien.

Alles, was in `frontend/public/` liegt, ist später öffentlich per URL erreichbar. Deshalb gehören private Dokumente niemals in diesen Ordner.

## Dateien

- Seite: `frontend/app/business/page.tsx`
- Pflegebare öffentliche Links: `frontend/app/business/businessContent.ts`
- Projektseite: `frontend/app/business/projects/page.tsx`
- Öffentliches Profilbild: `frontend/public/images/profile-professional.jpg`

## Inhalte pflegen

Öffentliche Inhalte werden in `frontend/app/business/businessContent.ts` gepflegt.

Aktuell vorgesehen:

- `profileHighlights`: kurze öffentliche Profilpunkte
- `profileLinks`: externe öffentliche Profile, zum Beispiel GitHub
- `projectLinks`: interne Verweise auf Projektseiten

## Was nicht hierher gehört

Diese Inhalte dürfen nicht im öffentlichen Bereich abgelegt werden:

- Schulzeugnisse
- Unizeugnisse
- Arbeitszeugnisse
- Zertifikate mit privaten Daten
- Ausweisdokumente
- private Bilder
- private Texte oder Notizen
- Passwörter, Tokens oder API-Schlüssel

Solche Inhalte gehören später in den geschützten privaten Bereich und dürfen nur serverseitig nach erfolgreicher Authentifizierung ausgeliefert werden.

## Schutzmaßnahmen

- `frontend/public/documents/` ist in `.gitignore` eingetragen.
- `frontend/public/private/` ist in `.gitignore` eingetragen.
- Der Build führt `npm run check:sensitive-files` aus.
- Der Check blockiert Dateien in öffentlichen Dokument- oder Privatordnern.
- Der lokale Ordner `Daten/` ist ignoriert und bleibt außerhalb des Repositories.

## Bestehende Git-Historie

Normales Löschen entfernt sensible Dateien nur aus dem aktuellen Stand von `main`.

Wenn sensible Dateien bereits nach GitHub gepusht wurden, können sie in der Git-Historie weiter auffindbar sein. Für eine vollständige Entfernung aus der Historie ist ein separater History-Cleanup mit Force-Push nötig. Dieser Schritt muss bewusst geplant werden, weil er alle anderen Entwickler betrifft.
