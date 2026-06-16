import Link from "next/link";

export default function BusinessPage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-white/70 transition hover:text-white">
            Zurück
          </Link>
          <Link href="/private/login" className="text-sm font-semibold text-suit-green transition hover:text-white">
            Privat
          </Link>
        </header>

        <section className="grid min-h-[72vh] items-center gap-8 py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="mb-5 inline-flex border border-suit-orange/50 bg-suit-orange/10 px-3 py-1 text-sm font-medium text-suit-orange">
              Geschäftlicher Bereich
            </p>
            <h1 className="text-5xl font-black leading-tight text-white">
              Platz für Profil, Projekte und berufliche Stärken.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              Hier entstehen später Lebenslauf, Tech Stack, Referenzen,
              Projektbeispiele und eine Kontaktmöglichkeit für Arbeitgeber
              oder Geschäftspartner.
            </p>
          </div>

          <div className="grid gap-4">
            {["Kurzprofil", "Kompetenzen", "Projekte", "Kontakt"].map((item) => (
              <div key={item} className="border border-white/12 bg-white/[0.045] p-5">
                <h2 className="text-xl font-bold text-white">{item}</h2>
                <p className="mt-2 text-white/62">Platzhalterinhalt für die nächste Ausbaustufe.</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
