"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";

import { apiBaseUrl, resolveAssetUrl, type Subject, type SubjectImage } from "../subjectTypes";

type FormState = {
  id?: string;
  title: string;
  summary: string;
  content: string;
  isPublished: boolean;
  images: SubjectImage[];
};

type ImageUpload = {
  fileName: string;
  dataUrl: string;
  alt?: string;
};

const emptyForm: FormState = {
  title: "",
  summary: "",
  content: "",
  isPublished: true,
  images: []
};

function subjectToForm(subject: Subject): FormState {
  return {
    id: subject.id,
    title: subject.title,
    summary: subject.summary,
    content: subject.content,
    isPublished: subject.isPublished,
    images: subject.images
  };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden."));
    reader.readAsDataURL(file);
  });
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, item);
  return nextItems;
}

export function SubjectAdminEditor() {
  const [authStatus, setAuthStatus] = useState<"loading" | "authenticated" | "unauthorized">("loading");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [imageUploads, setImageUploads] = useState<ImageUpload[]>([]);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadSubjects = async () => {
    const response = await fetch(`${apiBaseUrl}/admin/subjects`, {
      credentials: "include",
      cache: "no-store"
    });

    if (response.status === 401) {
      setAuthStatus("unauthorized");
      return;
    }

    if (!response.ok) {
      throw new Error("Fächer konnten nicht geladen werden.");
    }

    const data = (await response.json()) as { subjects: Subject[] };
    setSubjects(data.subjects);
    setAuthStatus("authenticated");
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/auth/me`, {
          credentials: "include",
          cache: "no-store"
        });

        if (!response.ok) {
          setAuthStatus("unauthorized");
          return;
        }

        await loadSubjects();
      } catch {
        setAuthStatus("unauthorized");
      }
    };

    void bootstrap();
  }, []);

  const updateField = (field: keyof FormState, value: string | boolean | SubjectImage[]) => {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      setImageUploads([]);
      return;
    }

    const uploads: ImageUpload[] = [];

    for (const file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setMessage("Bitte nur JPG, PNG oder WebP hochladen.");
        return;
      }

      if (file.size > 3 * 1024 * 1024) {
        setMessage("Ein Bild darf maximal 3 MB groß sein.");
        return;
      }

      uploads.push({
        fileName: file.name,
        dataUrl: await readFileAsDataUrl(file)
      });
    }

    setImageUploads(uploads);
    setMessage(`${uploads.length} Bild(er) zum Speichern vorgemerkt.`);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageUploads([]);
    setMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    const payload = {
      title: form.title,
      summary: form.summary,
      content: form.content,
      isPublished: form.isPublished,
      images: form.images,
      imageUploads
    };

    try {
      const response = await fetch(`${apiBaseUrl}/admin/subjects${form.id ? `/${form.id}` : ""}`, {
        method: form.id ? "PUT" : "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 401) {
        setAuthStatus("unauthorized");
        return;
      }

      if (!response.ok) {
        throw new Error("Speichern fehlgeschlagen.");
      }

      const data = (await response.json()) as { subject: Subject };
      await loadSubjects();
      setForm(subjectToForm(data.subject));
      setImageUploads([]);
      setMessage("Fach wurde gespeichert.");
    } catch {
      setMessage("Das Fach konnte nicht gespeichert werden.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) {
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/admin/subjects/${form.id}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error("Löschen fehlgeschlagen.");
      }

      await loadSubjects();
      resetForm();
      setMessage("Fach wurde gelöscht.");
    } catch {
      setMessage("Das Fach konnte nicht gelöscht werden.");
    } finally {
      setIsSaving(false);
    }
  };

  if (authStatus === "loading") {
    return <p className="border border-white/12 bg-white/[0.045] p-5 text-white/70">Adminrechte werden geprüft.</p>;
  }

  if (authStatus === "unauthorized") {
    return (
      <div className="border border-suit-orange/45 bg-suit-orange/10 p-6">
        <h2 className="text-2xl font-bold text-white">Adminbereich geschützt</h2>
        <p className="mt-3 leading-7 text-white/70">
          Melde dich zuerst an. Danach kannst du Fächer bearbeiten.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex bg-suit-orange px-4 py-2 text-sm font-bold text-suit-black transition hover:bg-orange-400"
        >
          Zum Login
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <aside className="border border-white/12 bg-white/[0.045] p-4">
        <button
          type="button"
          className="w-full bg-suit-orange px-4 py-3 text-sm font-bold text-suit-black transition hover:bg-orange-400"
          onClick={resetForm}
        >
          Neues Fach
        </button>

        <div className="mt-5 grid gap-2">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              type="button"
              className={`border px-4 py-3 text-left text-sm font-semibold transition ${
                subject.id === form.id
                  ? "border-suit-green bg-suit-green/10 text-white"
                  : "border-white/12 bg-suit-black/35 text-white/70 hover:border-suit-purple/70 hover:text-white"
              }`}
              onClick={() => {
                setForm(subjectToForm(subject));
                setImageUploads([]);
                setMessage("");
              }}
            >
              {subject.title}
            </button>
          ))}
        </div>
      </aside>

      <form className="border border-white/12 bg-white/[0.045] p-6" onSubmit={handleSubmit}>
        <div className="grid gap-5">
          <label className="block">
            <span className="text-sm font-semibold text-white/78">Fachname</span>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
              maxLength={120}
              className="mt-2 w-full border border-white/12 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-suit-green/70"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-white/78">Kurzbeschreibung</span>
            <textarea
              value={form.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              maxLength={500}
              rows={3}
              className="mt-2 w-full resize-y border border-white/12 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-suit-green/70"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-white/78">Zusammenfassung</span>
            <textarea
              value={form.content}
              onChange={(event) => updateField("content", event.target.value)}
              maxLength={12000}
              rows={12}
              className="mt-2 w-full resize-y border border-white/12 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-suit-green/70"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-white/78">Weitere Bilder</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageChange}
              className="mt-2 w-full border border-white/12 bg-black/35 px-4 py-3 text-sm text-white"
            />
          </label>

          {form.images.length > 0 ? (
            <div className="grid gap-4">
              <h3 className="text-sm font-semibold text-white/78">Bilder sortieren</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {form.images.map((image, index) => (
                  <div key={image.id} className="border border-white/12 bg-suit-black/35 p-4">
                    <img
                      src={resolveAssetUrl(image.url)}
                      alt={image.alt || form.title || "Fachbild"}
                      className="aspect-[16/10] w-full object-cover"
                    />
                    <input
                      value={image.alt ?? ""}
                      onChange={(event) =>
                        updateField(
                          "images",
                          form.images.map((item) =>
                            item.id === image.id
                              ? {
                                  ...item,
                                  alt: event.target.value
                                }
                              : item
                          )
                        )
                      }
                      placeholder="Bildbeschreibung"
                      className="mt-3 w-full border border-white/12 bg-black/35 px-3 py-2 text-sm text-white outline-none transition focus:border-suit-green/70"
                    />
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        disabled={index === 0}
                        className="border border-white/12 px-3 py-2 text-sm font-bold text-white/72 transition hover:border-suit-green/70 disabled:opacity-35"
                        onClick={() => updateField("images", moveItem(form.images, index, index - 1))}
                      >
                        Hoch
                      </button>
                      <button
                        type="button"
                        disabled={index === form.images.length - 1}
                        className="border border-white/12 px-3 py-2 text-sm font-bold text-white/72 transition hover:border-suit-green/70 disabled:opacity-35"
                        onClick={() => updateField("images", moveItem(form.images, index, index + 1))}
                      >
                        Runter
                      </button>
                      <button
                        type="button"
                        className="border border-suit-orange/60 px-3 py-2 text-sm font-bold text-suit-orange transition hover:bg-suit-orange/10"
                        onClick={() =>
                          updateField(
                            "images",
                            form.images.filter((item) => item.id !== image.id)
                          )
                        }
                      >
                        Entfernen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <label className="flex items-center gap-3 text-sm font-semibold text-white/78">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) => updateField("isPublished", event.target.checked)}
            />
            Öffentlich anzeigen
          </label>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-suit-purple px-5 py-3 text-sm font-bold text-white transition hover:bg-suit-purple/85 disabled:opacity-60"
          >
            {isSaving ? "Speichert..." : "Speichern"}
          </button>
          {form.id ? (
            <button
              type="button"
              disabled={isSaving}
              className="border border-suit-orange/60 px-5 py-3 text-sm font-bold text-suit-orange transition hover:bg-suit-orange/10 disabled:opacity-60"
              onClick={handleDelete}
            >
              Fach löschen
            </button>
          ) : null}
        </div>

        {message ? <p className="mt-5 border border-white/12 bg-black/30 p-4 text-sm text-white/76">{message}</p> : null}
      </form>
    </div>
  );
}
