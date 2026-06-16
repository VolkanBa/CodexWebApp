"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type PrivateContentResponse = {
  title: string;
  message: string;
  items: string[];
};

export function PrivateContent() {
  const router = useRouter();
  const [content, setContent] = useState<PrivateContentResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated" | "error">(
    "loading"
  );

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/private/content`, {
          credentials: "include"
        });

        if (response.status === 401) {
          if (isMounted) {
            setStatus("unauthenticated");
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to load private content.");
        }

        const data = (await response.json()) as PrivateContentResponse;

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

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    await fetch(`${apiBaseUrl}/auth/logout`, {
      method: "POST",
      credentials: "include"
    });

    router.push("/private/login");
    router.refresh();
  };

  if (status === "loading") {
    return <p className="text-lg text-white/70">Privaten Bereich prüfen...</p>;
  }

  if (status === "unauthenticated") {
    return (
      <section>
        <p className="mb-5 inline-flex border border-suit-orange/50 bg-suit-orange/10 px-3 py-1 text-sm font-medium text-suit-orange">
          Nicht angemeldet
        </p>
        <h1 className="text-5xl font-black text-white">Login erforderlich.</h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/70">
          Der private Bereich wird jetzt serverseitig geschützt. Melde dich an, um Inhalte zu laden.
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
      <section>
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
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-5 inline-flex border border-suit-green/50 bg-suit-green/10 px-3 py-1 text-sm font-medium text-suit-green">
            Geschützt
          </p>
          <h1 className="text-5xl font-black text-white">{content.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">{content.message}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex bg-suit-orange px-5 py-3 text-sm font-bold text-suit-black transition hover:bg-orange-400"
        >
          Logout
        </button>
      </div>

      <div className="mt-8 grid gap-4">
        {content.items.map((item) => (
          <div key={item} className="border border-white/12 bg-white/[0.045] p-5 text-white/72">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
