import Link from "next/link";

import { LoginForm } from "../private/login/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-md">
        <header className="mb-12 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-white/70 transition hover:text-white">
            Zurück
          </Link>
          <Link href="/business" className="text-sm font-semibold text-suit-green transition hover:text-white">
            Öffentlich
          </Link>
        </header>

        <section>
          <p className="mb-5 inline-flex border border-suit-orange/50 bg-suit-orange/10 px-3 py-1 text-sm font-medium text-suit-orange">
            Anmeldung
          </p>
          <h1 className="text-4xl font-black leading-tight text-white">Admin- und Privatbereich.</h1>
          <p className="mt-5 leading-7 text-white/70">
            Nach erfolgreicher Anmeldung wirst du zur Landing Page zurückgeleitet.
          </p>
          <div className="mt-8">
            <LoginForm redirectTo="/" />
          </div>
        </section>
      </div>
    </main>
  );
}
