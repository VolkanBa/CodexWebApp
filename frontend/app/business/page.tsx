import Link from "next/link";

import { BusinessProfileMenu } from "./BusinessProfileMenu";
import { freeTextContent, profileLinks, projectLinks, schoolCareer, workExperience } from "./businessContent";

const sections = [
  {
    id: "school" as const,
    label: "Schulische Laufbahn",
    eyebrow: "Zeugnisse",
    title: "Schulische Laufbahn und Abschlüsse",
    description: "Ein klarer Überblick über Bildungsstationen, Abschlüsse und hinterlegte Zeugnisse.",
    type: "timeline" as const,
    entries: schoolCareer
  },
  {
    id: "work" as const,
    label: "Arbeitserfahrung",
    eyebrow: "Zertifikate und Arbeitszeugnisse",
    title: "Berufliche Erfahrung und Nachweise",
    description: "Stationen, Verantwortlichkeiten, Zertifikate und Arbeitszeugnisse an einem übersichtlichen Ort.",
    type: "timeline" as const,
    entries: workExperience
  },
  ...(freeTextContent.trim()
    ? [
        {
          id: "freeText" as const,
          label: "Persönliches Profil",
          eyebrow: "Freitext",
          title: "Ergänzende Informationen",
          description: "Ein frei pflegbarer Bereich für zusätzliche berufliche Informationen.",
          type: "text" as const,
          content: freeTextContent
        }
      ]
    : []),
  ...(profileLinks.length
    ? [
        {
          id: "links" as const,
          label: "Links",
          eyebrow: "Profile",
          title: "Externe Profile und Projekte",
          description: "Direkte Verweise auf öffentliche Profile, Code und relevante Projektseiten.",
          type: "links" as const,
          links: profileLinks
        }
      ]
    : []),
  ...(projectLinks.length
    ? [
        {
          id: "projects" as const,
          label: "Projekte",
          eyebrow: "Projektbereich",
          title: "Projekte und Referenzen",
          description: "Eine eigene Projektseite bündelt spätere Arbeiten, Repositories und Detailansichten.",
          type: "links" as const,
          links: projectLinks
        }
      ]
    : [])
];

export default function BusinessPage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-white/70 transition hover:text-white">
            Zurück
          </Link>
          <Link href="/private/login" className="text-sm font-semibold text-suit-green transition hover:text-white">
            Privat
          </Link>
        </header>

        <section className="grid min-h-[42vh] items-end gap-8 py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex border border-suit-orange/50 bg-suit-orange/10 px-3 py-1 text-sm font-medium text-suit-orange">
              Öffentlicher Bereich
            </p>
            <h1 className="text-5xl font-black leading-tight text-white sm:text-6xl">
              Berufliches Profil, Nachweise und Projekte.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              Ein strukturierter Überblick für Arbeitgeber, Kunden und Partner. Inhalte können später mit
              Bildvorschauen und PDF-Downloads erweitert werden.
            </p>
          </div>

          <div className="grid gap-3 border border-suit-purple/45 bg-white/[0.045] p-5">
            {["Schule", "Beruf", "Projekte", "Links"].map((item) => (
              <div key={item} className="flex items-center justify-between border-b border-white/10 py-3 last:border-b-0">
                <span className="font-bold text-white">{item}</span>
                <span className="h-2.5 w-2.5 bg-suit-green" aria-hidden="true" />
              </div>
            ))}
          </div>
        </section>

        <BusinessProfileMenu sections={sections} />
      </div>
    </main>
  );
}
