import Link from "next/link";

export default function PrivateLoginPage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-white/70 transition hover:text-white">
            Zurück
          </Link>
          <Link href="/business" className="text-sm font-semibold text-suit-orange transition hover:text-white">
            Geschäftlich
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-8 py-16 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="mb-5 inline-flex border border-suit-green/50 bg-suit-green/10 px-3 py-1 text-sm font-medium text-suit-green">
              Privater Bereich
            </p>
            <h1 className="text-5xl font-black leading-tight text-white">
              Login wird serverseitig vorbereitet.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              Dieser Bereich ist absichtlich noch kein echter Login. Die spätere
              Version prüft Passwörter nur im Backend, speichert Hashes und
              schützt private Inhalte serverseitig.
            </p>
          </div>

          <form className="border border-white/12 bg-white/[0.045] p-6" aria-label="Login Platzhalter">
            <label className="block text-sm font-semibold text-white/80" htmlFor="password">
              Passwort
            </label>
            <input
              id="password"
              type="password"
              disabled
              placeholder="Noch nicht aktiv"
              className="mt-3 w-full border border-white/12 bg-black/35 px-4 py-3 text-white placeholder:text-white/35 outline-none"
            />
            <button
              type="button"
              disabled
              className="mt-5 w-full bg-suit-purple px-5 py-3 text-sm font-bold text-white opacity-60"
            >
              Login später aktivieren
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
