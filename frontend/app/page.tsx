import Link from "next/link";

const sections = [
  {
    title: "Geschäftlich",
    text: "Profil, Projekte und Kompetenzen für Arbeitgeber, Kunden und Partner.",
    href: "/business",
    accent: "border-suit-orange/60"
  },
  {
    title: "Privat",
    text: "Ein später geschützter Bereich für persönliche Inhalte.",
    href: "/private/login",
    accent: "border-suit-green/60"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.22em] text-white/80">
          Profil
        </Link>
        <nav className="flex items-center gap-4 text-sm text-white/72">
          <Link className="transition hover:text-white" href="/business">
            Geschäftlich
          </Link>
          <Link className="transition hover:text-white" href="/private/login">
            Privat
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-6xl items-center gap-10 px-6 pb-14 pt-4 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex border border-suit-green/45 bg-suit-green/10 px-3 py-1 text-sm font-medium text-suit-green">
            Persönlich. Klar. Erweiterbar.
          </p>
          <h1 className="max-w-3xl text-5xl font-black leading-[0.96] text-white sm:text-6xl lg:text-7xl">
            Eine Website für meinen privaten und beruflichen Auftritt.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/72">
            Diese erste Version legt die Grundlage: eine markante Landing Page,
            ein öffentlicher Bereich für berufliche Inhalte und ein vorbereiteter,
            später sicher geschützter Privatbereich.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/business"
              className="inline-flex items-center justify-center bg-suit-orange px-5 py-3 text-sm font-bold text-suit-black transition hover:bg-orange-400"
            >
              Geschäftlich ansehen
            </Link>
            <Link
              href="/private/login"
              className="inline-flex items-center justify-center border border-white/20 bg-white/8 px-5 py-3 text-sm font-bold text-white transition hover:border-suit-green/70 hover:bg-suit-green/10"
            >
              Privater Bereich
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[28rem] lg:max-w-none">
          <div className="absolute -inset-4 bg-suit-purple/25 blur-3xl" aria-hidden="true" />
          <div className="relative overflow-hidden border border-white/12 bg-black shadow-glow">
            <img
              src="/images/profile-professional.jpg"
              alt="Professionelles Profilbild"
              className="aspect-[4/5] h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 pb-16 md:grid-cols-2">
        {sections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className={`border ${section.accent} bg-white/[0.045] p-6 transition hover:-translate-y-1 hover:bg-white/[0.07]`}
          >
            <h2 className="text-2xl font-bold text-white">{section.title}</h2>
            <p className="mt-3 leading-7 text-white/68">{section.text}</p>
          </Link>
        ))}
      </section>
    </main>
  );
}
