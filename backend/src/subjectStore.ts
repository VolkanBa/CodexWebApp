import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";

export type SubjectImageUpload = {
  fileName: string;
  dataUrl: string;
};

export type SubjectInput = {
  title: string;
  summary: string;
  content: string;
  isPublished: boolean;
  imageAlt?: string;
  imageUpload?: SubjectImageUpload;
  removeImage?: boolean;
};

export type Subject = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  isPublished: boolean;
  imageUrl?: string;
  imageAlt?: string;
  createdAt: string;
  updatedAt: string;
};

const fileExtensionsByMimeType: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

const normalizeText = (value: string) => value.trim().replace(/\s+/g, " ");

const createSlug = (title: string) => {
  const slug = normalizeText(title)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "fach";
};

const createUniqueSlug = (title: string, subjects: Subject[], currentId?: string) => {
  const baseSlug = createSlug(title);
  let slug = baseSlug;
  let index = 2;

  while (subjects.some((subject) => subject.id !== currentId && subject.slug === slug)) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }

  return slug;
};

const readSubjects = async (dataFilePath: string): Promise<Subject[]> => {
  try {
    const file = await readFile(dataFilePath, "utf8");
    const parsed = JSON.parse(file);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }

    throw error;
  }
};

const writeSubjects = async (dataFilePath: string, subjects: Subject[]) => {
  await mkdir(dirname(dataFilePath), { recursive: true });
  const temporaryPath = `${dataFilePath}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(subjects, null, 2)}\n`, "utf8");
  await rename(temporaryPath, dataFilePath);
};

const parseImageUpload = (upload: SubjectImageUpload) => {
  const match = upload.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);

  if (!match) {
    throw new Error("Unsupported image data.");
  }

  const [, mimeType, base64Data] = match;
  const buffer = Buffer.from(base64Data, "base64");

  if (buffer.length > 3 * 1024 * 1024) {
    throw new Error("Image is too large.");
  }

  return {
    buffer,
    extension: fileExtensionsByMimeType[mimeType]
  };
};

const saveImage = async (uploadRoot: string, subjectId: string, upload: SubjectImageUpload) => {
  const parsedUpload = parseImageUpload(upload);
  const directory = join(uploadRoot, "subjects");
  await mkdir(directory, { recursive: true });

  const fileName = `${subjectId}-${Date.now()}${parsedUpload.extension || extname(upload.fileName) || ".jpg"}`;
  await writeFile(join(directory, fileName), parsedUpload.buffer);

  return `/uploads/subjects/${fileName}`;
};

export const listPublicSubjects = async (dataFilePath: string) => {
  const subjects = await readSubjects(dataFilePath);
  return subjects
    .filter((subject) => subject.isPublished)
    .sort((left, right) => left.title.localeCompare(right.title, "de"));
};

export const listAdminSubjects = async (dataFilePath: string) => {
  const subjects = await readSubjects(dataFilePath);
  return subjects.sort((left, right) => left.title.localeCompare(right.title, "de"));
};

export const getPublicSubjectBySlug = async (dataFilePath: string, slug: string) => {
  const subjects = await readSubjects(dataFilePath);
  return subjects.find((subject) => subject.slug === slug && subject.isPublished);
};

export const createSubject = async (dataFilePath: string, uploadRoot: string, input: SubjectInput) => {
  const subjects = await readSubjects(dataFilePath);
  const now = new Date().toISOString();
  const id = randomUUID();
  const subject: Subject = {
    id,
    slug: createUniqueSlug(input.title, subjects),
    title: normalizeText(input.title),
    summary: input.summary.trim(),
    content: input.content.trim(),
    isPublished: input.isPublished,
    imageAlt: input.imageAlt?.trim() || undefined,
    createdAt: now,
    updatedAt: now
  };

  if (input.imageUpload) {
    subject.imageUrl = await saveImage(uploadRoot, id, input.imageUpload);
  }

  subjects.push(subject);
  await writeSubjects(dataFilePath, subjects);
  return subject;
};

export const updateSubject = async (
  dataFilePath: string,
  uploadRoot: string,
  subjectId: string,
  input: SubjectInput
) => {
  const subjects = await readSubjects(dataFilePath);
  const subject = subjects.find((item) => item.id === subjectId);

  if (!subject) {
    return undefined;
  }

  subject.title = normalizeText(input.title);
  subject.slug = createUniqueSlug(input.title, subjects, subjectId);
  subject.summary = input.summary.trim();
  subject.content = input.content.trim();
  subject.isPublished = input.isPublished;
  subject.imageAlt = input.imageAlt?.trim() || undefined;
  subject.updatedAt = new Date().toISOString();

  if (input.removeImage) {
    subject.imageUrl = undefined;
  }

  if (input.imageUpload) {
    subject.imageUrl = await saveImage(uploadRoot, subjectId, input.imageUpload);
  }

  await writeSubjects(dataFilePath, subjects);
  return subject;
};

export const deleteSubject = async (dataFilePath: string, subjectId: string) => {
  const subjects = await readSubjects(dataFilePath);
  const filteredSubjects = subjects.filter((subject) => subject.id !== subjectId);

  if (filteredSubjects.length === subjects.length) {
    return false;
  }

  await writeSubjects(dataFilePath, filteredSubjects);
  return true;
};
