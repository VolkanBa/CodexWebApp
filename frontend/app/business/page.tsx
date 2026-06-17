import Link from "next/link";

import { profileHighlights, profileLinks, projectLinks } from "./businessContent";

function isExternalLink(href: string) {
  return href.startsWith("http");
}

export default function BusinessPage() {
  const links = [...projectLinks, ...profileLinks];

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

        <section className="grid min-h-[52vh] items-center gap-8 py-16 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex border border-suit-orange/50 bg-suit-orange/10 px-3 py-1 text-sm font-medium text-suit-orange">
              Öffentlicher Bereich
            </p>
            <h1 className="text-5xl font-black leading-tight text-white sm:text-6xl">
              Berufliches Profil ohne private Nachweise.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              Diese Seite zeigt nur bewusst öffentliche Inhalte. Zeugnisse, Arbeitsnachweise und private Dateien
              gehören nicht in das öffentliche Profil und werden nicht über GitHub veröffentlicht.
            </p>
          </div>

          <div className="grid gap-4">
            {profileHighlights.map((item) => (
              <article key={item.title} className="border border-white/12 bg-white/[0.045] p-5">
                <h2 className="text-xl font-bold text-white">{item.title}</h2>
                <p className="mt-3 leading-7 text-white/66">{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 pb-16 md:grid-cols-2">
          {links.map((link) =>
            isExternalLink(link.href) ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="border border-white/12 bg-suit-black/45 p-6 transition hover:-translate-y-1 hover:border-suit-green/70 hover:bg-suit-green/10"
              >
                <h2 className="text-2xl font-bold text-white">{link.label}</h2>
                <p className="mt-3 leading-7 text-white/66">{link.description}</p>
                <p className="mt-5 text-sm font-semibold text-suit-green">{link.href}</p>
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="border border-white/12 bg-suit-black/45 p-6 transition hover:-translate-y-1 hover:border-suit-orange/70 hover:bg-suit-orange/10"
              >
                <h2 className="text-2xl font-bold text-white">{link.label}</h2>
                <p className="mt-3 leading-7 text-white/66">{link.description}</p>
                <p className="mt-5 text-sm font-semibold text-suit-orange">{link.href}</p>
              </Link>
            )
          )}
        </section>
      </div>
    </main>
  );
}
