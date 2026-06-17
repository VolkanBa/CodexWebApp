# Öffentlicher Bereich

Der öffentliche Bereich liegt unter `/business` und ist für Arbeitgeber, Kunden und andere berufliche Kontakte gedacht.

## Dateien

- Seite: `frontend/app/business/page.tsx`
- Interaktives Dropdown: `frontend/app/business/BusinessProfileMenu.tsx`
- Pflegebare Inhalte: `frontend/app/business/businessContent.ts`
- Projektseite: `frontend/app/business/projects/page.tsx`
- Öffentliche Assets: `frontend/public/documents/` und `frontend/public/images/`

## Inhalte pflegen

Die Inhalte werden in `frontend/app/business/businessContent.ts` gepflegt.

### Schulische Laufbahn

Schulische Stationen stehen in `schoolCareer`.

Pro Eintrag können folgende Angaben gepflegt werden:

- `title`: Name der Station oder des Abschlusses
- `organization`: Schule oder Bildungseinrichtung
- `period`: Zeitraum
- `summary`: kurze Beschreibung
- `documents`: Zeugnisse als spätere Bild- und PDF-Nachweise

### Arbeitserfahrung

Berufliche Stationen stehen in `workExperience`.

Hier können Zertifikate und Arbeitszeugnisse je Station gesammelt werden. Die Struktur entspricht der schulischen Laufbahn.

### Freitext

Der Freitext steht in `freeTextContent`.

Wenn `freeTextContent` leer ist, wird der Bereich nicht im Dropdown angezeigt. Sobald dort Text eingetragen wird, erscheint der Bereich automatisch.

### Links

Externe Profile stehen in `profileLinks`.

Beispiele:

- GitHub
- LinkedIn
- Portfolio
- Projektseiten

## Bilder und PDFs

Dokumente können später über diese Felder erweitert werden:

- `imageSrc`: Pfad zu einer Bildvorschau
- `pdfHref`: Pfad zur herunterladbaren PDF-Datei

Empfohlene Ablage:

- Bilder: `frontend/public/documents/images/`
- PDFs: `frontend/public/documents/pdfs/`

Beispiel:

```ts
{
  title: "Abschlusszeugnis",
  kind: "Zeugnis",
  description: "Abschlusszeugnis der Schule.",
  issuedAt: "2024",
  imageSrc: "/documents/images/abschlusszeugnis.jpg",
  pdfHref: "/documents/pdfs/abschlusszeugnis.pdf"
}
```

Keine privaten oder sensiblen Dokumente im öffentlichen Bereich ablegen. Inhalte, die nur mit Passwort sichtbar sein sollen, gehören später in den geschützten privaten Bereich und werden serverseitig ausgeliefert.

Für jedes JPEG-Dokument kann automatisch eine gleichnamige PDF-Datei erzeugt werden:

```bash
npm run generate:document-pdfs
```

Der Befehl liest Dateien aus `frontend/public/documents/` und erstellt pro `.jpg` oder `.jpeg` eine gleichnamige `.pdf`.

## Aktuelle Asset-Struktur

Die Dateien aus `Daten/` wurden mit URL-tauglichen Namen nach `frontend/public/` kopiert.

- Professionelles Profilbild: `frontend/public/images/profile-professional.jpg`
- Schulzeugnisse: `frontend/public/documents/education/school/`
- Unizeugnisse: `frontend/public/documents/education/university/`
- Arbeitszeugnisse: `frontend/public/documents/work/`

Die Originaldateien in `Daten/` bleiben unverändert. Next.js liefert nur Dateien aus `frontend/public/` öffentlich aus.

Der lokale Ordner `Daten/` steht in `.gitignore`, damit die Originalstruktur nicht versehentlich zusätzlich committed wird.

## Dokument-Viewer

Dokumentbilder im öffentlichen Bereich sind interaktiv:

- Hover zeigt das komplette Bild größer an.
- Der Hintergrund wird dabei weich unscharf dargestellt.
- Klick auf ein Dokumentbild öffnet eine Vollbildansicht.
- Die Vollbildansicht kann über `Schließen`, `Escape` oder Klick auf den Hintergrund beendet werden.
- Der PDF-Link in der Vollbildansicht lädt die passende PDF herunter.

## Projekte

Der Projekteinstieg wird in `projectLinks` gepflegt und verweist auf `/business/projects`.

Die Projektseite kann später um echte Projektkarten, Screenshots, Tech Stack, GitHub-Repositories und Detailseiten erweitert werden.
