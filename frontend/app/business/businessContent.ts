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
    title: "Schulische Zeugnisse",
    organization: "Schulische Laufbahn",
    period: "Schulzeit",
    summary: "Sammlung der vorhandenen Schulzeugnisse aus der lokalen Datenstruktur.",
    documents: [
      {
        title: "Schulzeugnis 1",
        kind: "Zeugnis",
        description: "Schulischer Nachweis als Bildvorschau.",
        imageSrc: "/documents/education/school/school-certificate-1.jpeg"
      },
      {
        title: "Schulzeugnis 2",
        kind: "Zeugnis",
        description: "Schulischer Nachweis als Bildvorschau.",
        imageSrc: "/documents/education/school/school-certificate-2.jpeg"
      },
      {
        title: "Schulzeugnis 3",
        kind: "Zeugnis",
        description: "Schulischer Nachweis als Bildvorschau.",
        imageSrc: "/documents/education/school/school-certificate-3.jpeg"
      },
      {
        title: "Schulzeugnis 4",
        kind: "Zeugnis",
        description: "Schulischer Nachweis als Bildvorschau.",
        imageSrc: "/documents/education/school/school-certificate-4.jpeg"
      }
    ]
  },
  {
    title: "Universitäre Nachweise",
    organization: "Studium",
    period: "Studium",
    summary: "Bachelor-Urkunde, universitäre Zeugnisse und vorhandenes englisches Bachelor-PDF.",
    documents: [
      {
        title: "Bachelor-Urkunde",
        kind: "Zeugnis",
        description: "Bachelor-Urkunde als Bildvorschau.",
        imageSrc: "/documents/education/university/bachelor-certificate.jpeg",
        pdfHref: "/documents/education/university/bachelor-degree-english.pdf"
      },
      {
        title: "Universitätszeugnis 1",
        kind: "Zeugnis",
        description: "Universitärer Nachweis als Bildvorschau.",
        imageSrc: "/documents/education/university/university-certificate-1.jpeg"
      },
      {
        title: "Universitätszeugnis 2",
        kind: "Zeugnis",
        description: "Universitärer Nachweis als Bildvorschau.",
        imageSrc: "/documents/education/university/university-certificate-2.jpeg"
      },
      {
        title: "Universitätszeugnis 3",
        kind: "Zeugnis",
        description: "Universitärer Nachweis als Bildvorschau.",
        imageSrc: "/documents/education/university/university-certificate-3.jpeg"
      }
    ]
  }
];

export const workExperience: BusinessTimelineEntry[] = [
  {
    title: "Arbeitszeugnisse",
    organization: "Berufliche Laufbahn",
    period: "Berufserfahrung",
    summary: "Vorhandene Arbeitszeugnisse aus der lokalen Datenstruktur. Zertifikate können später ergänzt werden.",
    documents: [
      {
        title: "Arbeitszeugnis 1",
        kind: "Arbeitszeugnis",
        description: "Arbeitszeugnis als Bildvorschau.",
        imageSrc: "/documents/work/work-reference-0.jpeg"
      },
      {
        title: "Arbeitszeugnis 2",
        kind: "Arbeitszeugnis",
        description: "Arbeitszeugnis als Bildvorschau.",
        imageSrc: "/documents/work/work-reference-1.jpeg"
      },
      {
        title: "Arbeitszeugnis 3",
        kind: "Arbeitszeugnis",
        description: "Arbeitszeugnis als Bildvorschau.",
        imageSrc: "/documents/work/work-reference-2.jpeg"
      },
      {
        title: "Arbeitszeugnis 4",
        kind: "Arbeitszeugnis",
        description: "Arbeitszeugnis als Bildvorschau.",
        imageSrc: "/documents/work/work-reference-3.jpeg"
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

export const projectLinks: BusinessLink[] = [
  {
    label: "Projektübersicht",
    href: "/business/projects",
    description: "Eigene Seite für Projekte, Referenzen und spätere Detailansichten."
  }
];
