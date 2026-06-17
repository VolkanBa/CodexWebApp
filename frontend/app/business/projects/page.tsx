import Link from "next/link";

const projectPlaceholders = [
  {
    title: "CodexWebApp",
    status: "Aktiv",
    description: "Persönliche Website/Webapp mit getrenntem Frontend, Backend, Dokumentation und sicherem Privatbereich.",
    href: "https://github.com/VolkanBa/CodexWebApp"
  },
  {
    title: "Weitere Projekte",
    status: "Geplant",
    description: "Platz für spätere Projekte, Repositories, Screenshots und kurze Ergebnisbeschreibungen.",
    href: "https://github.com/VolkanBa"
  }
];

export default function ProjectsPage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <Link href="/business" className="text-sm font-semibold text-white/70 transition hover:text-white">
            Zurück
          </Link>
          <Link href="/" className="text-sm font-semibold text-suit-green transition hover:text-white">
            Startseite
          </Link>
        </header>

        <section className="py-16">
          <p className="mb-5 inline-flex border border-suit-orange/50 bg-suit-orange/10 px-3 py-1 text-sm font-medium text-suit-orange">
            Projekte
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-tight text-white sm:text-6xl">
            Projektübersicht und technische Referenzen.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
            Hier werden öffentliche Projekte, Repositories und spätere Detailseiten gesammelt.
          </p>
        </section>

        <section className="grid gap-5 pb-16 md:grid-cols-2">
          {projectPlaceholders.map((project) => (
            <a
              key={project.title}
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="border border-white/12 bg-white/[0.045] p-6 transition hover:-translate-y-1 hover:border-suit-green/70 hover:bg-suit-green/10"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white">{project.title}</h2>
                <span className="border border-suit-purple/45 bg-suit-purple/20 px-3 py-1 text-sm font-semibold text-white/84">
                  {project.status}
                </span>
              </div>
              <p className="mt-4 leading-7 text-white/68">{project.description}</p>
              <p className="mt-5 text-sm font-semibold text-suit-green">{project.href}</p>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
