import Link from "next/link";

import { SubjectAdminEditor } from "./SubjectAdminEditor";

export default function SubjectAdminPage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <Link
            href="/business/hochschule-gelsenkirchen"
            className="text-sm font-semibold text-white/70 transition hover:text-white"
          >
            Zurück
          </Link>
          <Link href="/private" className="text-sm font-semibold text-suit-green transition hover:text-white">
            Privater Bereich
          </Link>
        </header>

        <section className="py-12">
          <p className="mb-5 inline-flex border border-suit-orange/50 bg-suit-orange/10 px-3 py-1 text-sm font-medium text-suit-orange">
            Admin
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-tight text-white sm:text-6xl">
            Fächer bearbeiten.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
            Erstelle und bearbeite öffentliche Fachseiten für Hochschule Gelsenkirchen. Inhalte werden lokal im Backend
            gespeichert und nicht in GitHub committed.
          </p>
        </section>

        <section className="pb-16">
          <SubjectAdminEditor />
        </section>
      </div>
    </main>
  );
}
