"use client";

import { useMemo, useState } from "react";

import type { BusinessLink, BusinessTimelineEntry } from "./businessContent";

type TimelineSection = {
  id: "school" | "work";
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  type: "timeline";
  entries: BusinessTimelineEntry[];
};

type TextSection = {
  id: "freeText";
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  type: "text";
  content: string;
};

type LinkSection = {
  id: "links";
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  type: "links";
  links: BusinessLink[];
};

type BusinessSection = TimelineSection | TextSection | LinkSection;

type BusinessProfileMenuProps = {
  sections: BusinessSection[];
};

export function BusinessProfileMenu({ sections }: BusinessProfileMenuProps) {
  const visibleSections = useMemo(
    () =>
      sections.filter((section) => {
        if (section.type === "text") {
          return section.content.trim().length > 0;
        }

        if (section.type === "links") {
          return section.links.length > 0;
        }

        return section.entries.length > 0;
      }),
    [sections]
  );
  const [selectedId, setSelectedId] = useState(visibleSections[0]?.id ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const activeSection = visibleSections.find((section) => section.id === selectedId) ?? visibleSections[0];

  if (!activeSection) {
    return null;
  }

  return (
    <section className="py-8">
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr] lg:items-start">
        <div className="relative">
          <button
            type="button"
            aria-expanded={isOpen}
            className="flex w-full items-center justify-between border border-suit-purple/60 bg-suit-black px-5 py-4 text-left text-sm font-bold text-white shadow-glow transition hover:border-suit-orange/70"
            onClick={() => setIsOpen((current) => !current)}
          >
            <span>{activeSection.label}</span>
            <span className="text-suit-orange" aria-hidden="true">
              {isOpen ? "▲" : "▼"}
            </span>
          </button>

          {isOpen ? (
            <div className="absolute z-20 mt-2 w-full overflow-hidden border border-white/12 bg-[#0d0915] shadow-glow">
              {visibleSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  className={`block w-full px-5 py-4 text-left text-sm font-semibold transition ${
                    section.id === activeSection.id
                      ? "bg-suit-purple text-white"
                      : "text-white/72 hover:bg-suit-purple/20 hover:text-white"
                  }`}
                  onClick={() => {
                    setSelectedId(section.id);
                    setIsOpen(false);
                  }}
                >
                  {section.label}
                </button>
              ))}
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-3 border border-suit-green/35 bg-suit-green/10 text-center text-xs font-bold uppercase text-white/72">
            <span className="border-r border-suit-green/25 px-3 py-3">Bild</span>
            <span className="border-r border-suit-green/25 px-3 py-3">PDF</span>
            <span className="px-3 py-3">Link</span>
          </div>
        </div>

        <article className="border border-white/12 bg-white/[0.045] p-6 sm:p-8">
          <p className="inline-flex border border-suit-orange/45 bg-suit-orange/10 px-3 py-1 text-sm font-semibold text-suit-orange">
            {activeSection.eyebrow}
          </p>
          <h2 className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl">{activeSection.title}</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/70">{activeSection.description}</p>

          <div className="mt-8">
            {activeSection.type === "timeline" ? <Timeline entries={activeSection.entries} /> : null}
            {activeSection.type === "text" ? <FreeText content={activeSection.content} /> : null}
            {activeSection.type === "links" ? <ProfileLinks links={activeSection.links} /> : null}
          </div>
        </article>
      </div>
    </section>
  );
}

function Timeline({ entries }: { entries: BusinessTimelineEntry[] }) {
  return (
    <div className="grid gap-5">
      {entries.map((entry) => (
        <div key={`${entry.title}-${entry.period}`} className="border-l-2 border-suit-purple pl-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">{entry.title}</h3>
              <p className="mt-1 text-sm font-semibold text-suit-green">{entry.organization}</p>
            </div>
            <p className="border border-suit-purple/45 bg-suit-purple/20 px-3 py-1 text-sm font-semibold text-white/84">
              {entry.period}
            </p>
          </div>
          <p className="mt-4 leading-7 text-white/68">{entry.summary}</p>

          {entry.documents.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {entry.documents.map((document) => (
                <div key={`${entry.title}-${document.title}`} className="border border-white/10 bg-white/[0.035] p-4">
                  {document.imageSrc ? (
                    <img
                      src={document.imageSrc}
                      alt={document.title}
                      className="mb-4 aspect-[16/10] w-full border border-white/10 object-cover"
                    />
                  ) : (
                    <div className="mb-4 grid aspect-[16/10] place-items-center border border-dashed border-suit-purple/55 bg-suit-purple/10 text-sm font-bold text-suit-purple">
                      {document.kind}
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-white">{document.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-white/62">{document.description}</p>
                    </div>
                    {document.issuedAt ? (
                      <span className="shrink-0 text-xs font-semibold text-white/48">{document.issuedAt}</span>
                    ) : null}
                  </div>
                  {document.pdfHref ? (
                    <a
                      href={document.pdfHref}
                      download
                      className="mt-4 inline-flex bg-suit-orange px-4 py-2 text-sm font-bold text-suit-black transition hover:bg-orange-400"
                    >
                      PDF herunterladen
                    </a>
                  ) : (
                    <span className="mt-4 inline-flex border border-white/12 px-4 py-2 text-sm font-semibold text-white/50">
                      PDF folgt
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function FreeText({ content }: { content: string }) {
  return <p className="whitespace-pre-line text-lg leading-8 text-white/76">{content}</p>;
}

function ProfileLinks({ links }: { links: BusinessLink[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="border border-white/12 bg-suit-black/45 p-5 transition hover:-translate-y-1 hover:border-suit-green/70 hover:bg-suit-green/10"
        >
          <h3 className="text-xl font-bold text-white">{link.label}</h3>
          <p className="mt-3 leading-7 text-white/66">{link.description}</p>
          <p className="mt-4 text-sm font-semibold text-suit-green">{link.href}</p>
        </a>
      ))}
    </div>
  );
}
