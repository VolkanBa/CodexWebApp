"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiBaseUrl, resolveAssetUrl, type Subject } from "./subjectTypes";

export function SubjectsOverview() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/subjects`, {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error("Subjects could not be loaded.");
        }

        const data = (await response.json()) as { subjects: Subject[] };
        setSubjects(data.subjects);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    };

    void loadSubjects();
  }, []);

  if (status === "loading") {
    return <p className="border border-white/12 bg-white/[0.045] p-5 text-white/70">Fächer werden geladen.</p>;
  }

  if (status === "error") {
    return (
      <p className="border border-suit-orange/45 bg-suit-orange/10 p-5 text-suit-orange">
        Die Fächer konnten gerade nicht geladen werden.
      </p>
    );
  }

  if (subjects.length === 0) {
    return (
      <div className="border border-white/12 bg-white/[0.045] p-6">
        <h2 className="text-2xl font-bold text-white">Noch keine Fächer veröffentlicht</h2>
        <p className="mt-3 leading-7 text-white/66">
          Sobald du im Adminbereich Fächer veröffentlichst, erscheinen sie hier als eigene Seiten.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {subjects.map((subject) => (
        <Link
          key={subject.id}
          href={`/business/hochschule-gelsenkirchen/${subject.slug}`}
          className="border border-white/12 bg-white/[0.045] p-5 transition hover:-translate-y-1 hover:border-suit-green/70 hover:bg-suit-green/10"
        >
          {subject.imageUrl ? (
            <img
              src={resolveAssetUrl(subject.imageUrl)}
              alt={subject.imageAlt || subject.title}
              className="mb-5 aspect-[16/9] w-full border border-white/10 object-cover"
            />
          ) : null}
          <h2 className="text-2xl font-bold text-white">{subject.title}</h2>
          <p className="mt-3 leading-7 text-white/66">{subject.summary}</p>
          <p className="mt-5 text-sm font-semibold text-suit-green">Fach ansehen</p>
        </Link>
      ))}
    </div>
  );
}
