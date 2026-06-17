import Link from "next/link";

import { SubjectDetail } from "./SubjectDetail";

export default async function SubjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="min-h-screen px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 flex items-center justify-between">
          <Link
            href="/business/hochschule-gelsenkirchen"
            className="text-sm font-semibold text-white/70 transition hover:text-white"
          >
            Zurück
          </Link>
          <Link
            href="/business/hochschule-gelsenkirchen/admin"
            className="text-sm font-semibold text-suit-green transition hover:text-white"
          >
            Admin
          </Link>
        </header>

        <SubjectDetail slug={slug} />
      </div>
    </main>
  );
}
