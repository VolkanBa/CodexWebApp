import Link from "next/link";
import { LoginForm } from "./LoginForm";

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
              Login wird serverseitig geschützt.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              Das Passwort wird nur im Backend geprüft. Die Sitzung wird über ein
              sicheres httpOnly Cookie verwaltet, damit private Inhalte nicht im
              Frontend freigegeben werden.
            </p>
          </div>

          <LoginForm />
        </section>
      </div>
    </main>
  );
}
