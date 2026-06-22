"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PrivateTabs } from "../PrivateTabs";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type PrivateGame = {
  id: string;
  title: string;
  status: string;
  summary: string;
  href: string | null;
  nextSteps: string[];
};

type PrivateGamesResponse = {
  title: string;
  description: string;
  games: PrivateGame[];
};

export function PrivateGamesContent() {
  const [content, setContent] = useState<PrivateGamesResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated" | "error">(
    "loading"
  );

  useEffect(() => {
    let isMounted = true;

    const loadGames = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/private/games`, {
          credentials: "include"
        });

        if (response.status === 401) {
          if (isMounted) {
            setStatus("unauthenticated");
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load private games.");
        }

        const data = (await response.json()) as PrivateGamesResponse;

        if (isMounted) {
          setContent(data);
          setStatus("authenticated");
        }
      } catch {
        if (isMounted) {
          setStatus("error");
        }
      }
    };

    loadGames();

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === "loading") {
    return <p className="text-lg text-white/70">Spiele-Bereich prüfen...</p>;
  }

  if (status === "unauthenticated") {
    return (
      <section className="text-center">
        <p className="mb-5 inline-flex border border-suit-orange/50 bg-suit-orange/10 px-3 py-1 text-sm font-medium text-suit-orange">
          Nicht angemeldet
        </p>
        <h1 className="text-5xl font-black text-white">Login erforderlich.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/70">
          Der Spiele-Bereich gehört zum privaten Bereich und wird erst nach dem Login geladen.
        </p>
        <Link
          href="/private/login"
          className="mt-8 inline-flex bg-suit-orange px-5 py-3 text-sm font-bold text-suit-black transition hover:bg-orange-400"
        >
          Zum Login
        </Link>
      </section>
    );
  }

  if (status === "error" || !content) {
    return (
      <section className="text-center">
        <p className="mb-5 inline-flex border border-suit-orange/50 bg-suit-orange/10 px-3 py-1 text-sm font-medium text-suit-orange">
          Fehler
        </p>
        <h1 className="text-5xl font-black text-white">Backend nicht erreichbar.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/70">
          Bitte prüfe, ob das Backend auf `http://localhost:4000` läuft.
        </p>
      </section>
    );
  }

  return (
    <section className="w-full text-left">
      <PrivateTabs />

      <p className="mb-5 inline-flex border border-suit-green/50 bg-suit-green/10 px-3 py-1 text-sm font-medium text-suit-green">
        Geschützt
      </p>
      <h1 className="text-5xl font-black text-white">{content.title}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">{content.description}</p>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {content.games.map((game) => (
          <article key={game.id} className="border border-white/12 bg-white/[0.045] p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-2xl font-black text-white">{game.title}</h2>
              <span className="border border-suit-orange/50 bg-suit-orange/10 px-2.5 py-1 text-xs font-bold text-suit-orange">
                {game.status}
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/70">{game.summary}</p>
            <ul className="mt-5 space-y-2 text-sm text-white/68">
              {game.nextSteps.map((step) => (
                <li key={step} className="border-l-2 border-suit-green/70 pl-3">
                  {step}
                </li>
              ))}
            </ul>
            {game.href ? (
              <Link
                href={game.href}
                className="mt-5 inline-flex bg-suit-purple px-4 py-3 text-sm font-bold text-white transition hover:bg-suit-orange hover:text-suit-black"
              >
                Öffnen
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
