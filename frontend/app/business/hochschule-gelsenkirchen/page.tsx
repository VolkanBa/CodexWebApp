import Link from "next/link";

import { SubjectsOverview } from "./SubjectsOverview";

export default function HochschuleGelsenkirchenPage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <Link href="/business" className="text-sm font-semibold text-white/70 transition hover:text-white">
            Zurück
          </Link>
          <Link
            href="/business/hochschule-gelsenkirchen/admin"
            className="text-sm font-semibold text-suit-green transition hover:text-white"
          >
            Admin
          </Link>
        </header>

        <section className="py-16">
          <p className="mb-5 inline-flex border border-suit-orange/50 bg-suit-orange/10 px-3 py-1 text-sm font-medium text-suit-orange">
            Hochschule Gelsenkirchen
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-tight text-white sm:text-6xl">
            Fächer, Zusammenfassungen und Lerninhalte.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
            Hier entstehen öffentliche Zusammenfassungen deiner Fächer. Jedes Fach bekommt eine eigene Seite mit
            Texten und optionalem Bild.
          </p>
        </section>

        <section className="pb-16">
          <SubjectsOverview />
        </section>
      </div>
    </main>
  );
}
