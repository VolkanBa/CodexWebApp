"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiBaseUrl, resolveAssetUrl, type Subject } from "../subjectTypes";

export function SubjectDetail({ slug }: { slug: string }) {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "notFound" | "error">("loading");

  useEffect(() => {
    const loadSubject = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/subjects/${slug}`, {
          cache: "no-store"
        });

        if (response.status === 404) {
          setStatus("notFound");
          return;
        }

        if (!response.ok) {
          throw new Error("Subject could not be loaded.");
        }

        const data = (await response.json()) as { subject: Subject };
        setSubject(data.subject);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    };

    void loadSubject();
  }, [slug]);

  if (status === "loading") {
    return <p className="border border-white/12 bg-white/[0.045] p-5 text-white/70">Fach wird geladen.</p>;
  }

  if (status === "notFound") {
    return (
      <div className="border border-white/12 bg-white/[0.045] p-6">
        <h1 className="text-3xl font-bold text-white">Fach nicht gefunden</h1>
        <Link className="mt-5 inline-flex text-sm font-bold text-suit-green" href="/business/hochschule-gelsenkirchen">
          Zur Fächerübersicht
        </Link>
      </div>
    );
  }

  if (status === "error" || !subject) {
    return (
      <p className="border border-suit-orange/45 bg-suit-orange/10 p-5 text-suit-orange">
        Das Fach konnte gerade nicht geladen werden.
      </p>
    );
  }

  return (
    <article>
      {subject.images.length > 0 ? (
        <div className="mb-8 grid gap-4">
          <img
            src={resolveAssetUrl(subject.images[0].url)}
            alt={subject.images[0].alt || subject.title}
            className="max-h-[32rem] w-full border border-white/12 object-cover"
          />
          {subject.images.length > 1 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subject.images.slice(1).map((image) => (
                <img
                  key={image.id}
                  src={resolveAssetUrl(image.url)}
                  alt={image.alt || subject.title}
                  className="aspect-[16/10] w-full border border-white/12 object-cover"
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
      <p className="mb-5 inline-flex border border-suit-orange/50 bg-suit-orange/10 px-3 py-1 text-sm font-medium text-suit-orange">
        Hochschule Gelsenkirchen
      </p>
      <h1 className="max-w-4xl text-5xl font-black leading-tight text-white sm:text-6xl">{subject.title}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">{subject.summary}</p>
      <div className="mt-10 whitespace-pre-line border border-white/12 bg-white/[0.045] p-6 text-lg leading-8 text-white/76">
        {subject.content}
      </div>
    </article>
  );
}
