export type BusinessDocument = {
  title: string;
  kind: "Zeugnis" | "Zertifikat" | "Arbeitszeugnis";
  description: string;
  issuedAt?: string;
  imageSrc?: string;
  pdfHref?: string;
};

export type BusinessTimelineEntry = {
  title: string;
  organization: string;
  period: string;
  summary: string;
  documents: BusinessDocument[];
};

export type BusinessLink = {
  label: string;
  href: string;
  description: string;
};

export const schoolCareer: BusinessTimelineEntry[] = [
  {
    title: "Schulabschluss",
    organization: "Schule oder Bildungseinrichtung ergänzen",
    period: "Zeitraum ergänzen",
    summary: "Kurzbeschreibung deiner schulischen Laufbahn ergänzen.",
    documents: [
      {
        title: "Abschlusszeugnis",
        kind: "Zeugnis",
        description: "Zeugnisbild und PDF können später hier verknüpft werden."
      }
    ]
  }
];

export const workExperience: BusinessTimelineEntry[] = [
  {
    title: "Berufliche Station",
    organization: "Unternehmen oder Arbeitgeber ergänzen",
    period: "Zeitraum ergänzen",
    summary: "Kurzbeschreibung deiner Aufgaben, Verantwortung und Ergebnisse ergänzen.",
    documents: [
      {
        title: "Arbeitszeugnis",
        kind: "Arbeitszeugnis",
        description: "Arbeitszeugnis kann später als Bildvorschau und PDF ergänzt werden."
      },
      {
        title: "Zertifikat",
        kind: "Zertifikat",
        description: "Zertifikate können später je Station gesammelt werden."
      }
    ]
  }
];

export const freeTextContent = "";

export const profileLinks: BusinessLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/VolkanBa",
    description: "Code, Projekte und technische Arbeit."
  }
];
