"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import type { BusinessDocument, BusinessLink, BusinessTimelineEntry } from "./businessContent";

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
  id: "links" | "projects";
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
  const [hoveredDocument, setHoveredDocument] = useState<BusinessDocument | null>(null);
  const [activeDocument, setActiveDocument] = useState<BusinessDocument | null>(null);
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

  useEffect(() => {
    if (!activeDocument) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDocument(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeDocument]);

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
            {activeSection.type === "timeline" ? (
              <Timeline
                entries={activeSection.entries}
                onDocumentClick={setActiveDocument}
                onDocumentHover={setHoveredDocument}
              />
            ) : null}
            {activeSection.type === "text" ? <FreeText content={activeSection.content} /> : null}
            {activeSection.type === "links" ? <ProfileLinks links={activeSection.links} /> : null}
          </div>
        </article>
      </div>

      {hoveredDocument?.imageSrc ? (
        <div className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center bg-suit-black/62 p-4 backdrop-blur-md">
          <img
            src={hoveredDocument.imageSrc}
            alt={hoveredDocument.title}
            className="max-h-[88vh] max-w-[92vw] border border-white/14 bg-suit-black object-contain shadow-glow"
          />
        </div>
      ) : null}

      {activeDocument?.imageSrc ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-suit-black/86 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={activeDocument.title}
          onClick={() => setActiveDocument(null)}
        >
          <div className="flex max-h-[94vh] w-full max-w-6xl flex-col gap-4" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-suit-green">{activeDocument.kind}</p>
                <h3 className="text-xl font-bold text-white">{activeDocument.title}</h3>
              </div>
              <button
                type="button"
                className="border border-white/18 bg-white/8 px-4 py-2 text-sm font-bold text-white transition hover:border-suit-orange/70 hover:text-suit-orange"
                onClick={() => setActiveDocument(null)}
              >
                Schließen
              </button>
            </div>
            <img
              src={activeDocument.imageSrc}
              alt={activeDocument.title}
              className="max-h-[78vh] w-full border border-white/14 bg-suit-black object-contain"
            />
            {activeDocument.pdfHref ? (
              <a
                href={activeDocument.pdfHref}
                download
                className="self-start bg-suit-orange px-4 py-2 text-sm font-bold text-suit-black transition hover:bg-orange-400"
              >
                PDF herunterladen
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Timeline({
  entries,
  onDocumentClick,
  onDocumentHover
}: {
  entries: BusinessTimelineEntry[];
  onDocumentClick: (document: BusinessDocument) => void;
  onDocumentHover: (document: BusinessDocument | null) => void;
}) {
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
                    <button
                      type="button"
                      className="group mb-4 block w-full border border-white/10 bg-suit-black/65 p-0 text-left transition hover:border-suit-orange/70 focus:outline-none focus:ring-2 focus:ring-suit-orange"
                      onClick={() => {
                        onDocumentHover(null);
                        onDocumentClick(document);
                      }}
                      onMouseEnter={() => onDocumentHover(document)}
                      onMouseLeave={() => onDocumentHover(null)}
                      onFocus={() => onDocumentHover(document)}
                      onBlur={() => onDocumentHover(null)}
                    >
                      <img
                        src={document.imageSrc}
                        alt={document.title}
                        className="aspect-[16/10] w-full object-contain transition duration-200 group-hover:scale-[1.01]"
                      />
                    </button>
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
        <LinkOrAnchor
          key={link.href}
          href={link.href}
          className="border border-white/12 bg-suit-black/45 p-5 transition hover:-translate-y-1 hover:border-suit-green/70 hover:bg-suit-green/10"
        >
          <h3 className="text-xl font-bold text-white">{link.label}</h3>
          <p className="mt-3 leading-7 text-white/66">{link.description}</p>
          <p className="mt-4 text-sm font-semibold text-suit-green">{link.href}</p>
        </LinkOrAnchor>
      ))}
    </div>
  );
}

function LinkOrAnchor({
  href,
  className,
  children
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
