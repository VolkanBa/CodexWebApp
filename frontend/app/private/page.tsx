import Link from "next/link";

export default function PrivatePage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-4xl place-items-center text-center">
        <section>
          <p className="mb-5 inline-flex border border-suit-green/50 bg-suit-green/10 px-3 py-1 text-sm font-medium text-suit-green">
            Geschützt
          </p>
          <h1 className="text-5xl font-black text-white">Privater Bereich kommt später.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Diese Route bleibt für die spätere Auth-Integration reserviert.
            Private Inhalte werden nicht im Frontend hart codiert.
          </p>
          <Link
            href="/private/login"
            className="mt-8 inline-flex bg-suit-orange px-5 py-3 text-sm font-bold text-suit-black transition hover:bg-orange-400"
          >
            Zum Login-Platzhalter
          </Link>
        </section>
      </div>
    </main>
  );
}
