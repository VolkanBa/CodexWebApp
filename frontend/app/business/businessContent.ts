export type BusinessLink = {
  label: string;
  href: string;
  description: string;
};

export const profileHighlights = [
  {
    title: "Öffentliches Profil",
    description:
      "Dieser Bereich zeigt nur beruflich geeignete, bewusst öffentliche Informationen. Zeugnisse und private Nachweise werden nicht veröffentlicht."
  },
  {
    title: "Projekte",
    description:
      "Projektarbeiten, Code und technische Referenzen werden auf einer eigenen Projektseite gesammelt."
  },
  {
    title: "Kontaktfähig",
    description:
      "Der Bereich bleibt schlank und kann später um ein sicheres Kontaktformular oder verifizierte Links erweitert werden."
  }
];

export const profileLinks: BusinessLink[] = [
  {
    label: "GitHub",
    href: "https://github.com/VolkanBa",
    description: "Öffentliche Repositories und technische Arbeit."
  }
];

export const educationLinks: BusinessLink[] = [
  {
    label: "Hochschule Gelsenkirchen",
    href: "/business/hochschule-gelsenkirchen",
    description: "Öffentliche Zusammenfassungen von Fächern, Projekten und Lerninhalten."
  }
];

export const projectLinks: BusinessLink[] = [
  {
    label: "Projektübersicht",
    href: "/business/projects",
    description: "Eigene Seite für Projekte, Referenzen und spätere Detailansichten."
  }
];
