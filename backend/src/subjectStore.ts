import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";

export type SubjectImageUpload = {
  fileName: string;
  dataUrl: string;
  alt?: string;
};

export type SubjectImage = {
  id: string;
  url: string;
  alt?: string;
};

export type SubjectInput = {
  title: string;
  summary: string;
  content: string;
  isPublished: boolean;
  images?: SubjectImage[];
  imageUploads?: SubjectImageUpload[];
};

export type Subject = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  isPublished: boolean;
  images: SubjectImage[];
  createdAt: string;
  updatedAt: string;
};

type StoredSubject = Subject & {
  imageUrl?: string;
  imageAlt?: string;
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

const normalizeSubject = (subject: StoredSubject): Subject => ({
  id: subject.id,
  slug: subject.slug,
  title: subject.title,
  summary: subject.summary,
  content: subject.content,
  isPublished: subject.isPublished,
  images:
    subject.images?.length > 0
      ? subject.images
      : subject.imageUrl
        ? [
            {
              id: randomUUID(),
              url: subject.imageUrl,
              alt: subject.imageAlt
            }
          ]
        : [],
  createdAt: subject.createdAt,
  updatedAt: subject.updatedAt
});

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
    return Array.isArray(parsed) ? parsed.map((subject) => normalizeSubject(subject)) : [];
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

const saveImage = async (uploadRoot: string, subjectId: string, upload: SubjectImageUpload): Promise<SubjectImage> => {
  const parsedUpload = parseImageUpload(upload);
  const directory = join(uploadRoot, "subjects");
  await mkdir(directory, { recursive: true });

  const fileName = `${subjectId}-${Date.now()}-${randomUUID()}${parsedUpload.extension || extname(upload.fileName) || ".jpg"}`;
  await writeFile(join(directory, fileName), parsedUpload.buffer);

  return {
    id: randomUUID(),
    url: `/uploads/subjects/${fileName}`,
    alt: upload.alt?.trim() || undefined
  };
};

const deleteUploadImage = async (uploadRoot: string, imageUrl: string) => {
  if (!imageUrl.startsWith("/uploads/subjects/")) {
    return;
  }

  const targetPath = resolve(uploadRoot, "subjects", basename(imageUrl));
  const uploadSubjectsPath = resolve(uploadRoot, "subjects");

  if (!targetPath.startsWith(uploadSubjectsPath)) {
    return;
  }

  await unlink(targetPath).catch(() => undefined);
};

const removeDeletedImages = async (uploadRoot: string, previousImages: SubjectImage[], nextImages: SubjectImage[]) => {
  const nextImageIds = new Set(nextImages.map((image) => image.id));
  const deletedImages = previousImages.filter((image) => !nextImageIds.has(image.id));

  await Promise.all(deletedImages.map((image) => deleteUploadImage(uploadRoot, image.url)));
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
  const uploadedImages = await Promise.all((input.imageUploads ?? []).map((upload) => saveImage(uploadRoot, id, upload)));
  const subject: Subject = {
    id,
    slug: createUniqueSlug(input.title, subjects),
    title: normalizeText(input.title),
    summary: input.summary.trim(),
    content: input.content.trim(),
    isPublished: input.isPublished,
    images: [...(input.images ?? []), ...uploadedImages],
    createdAt: now,
    updatedAt: now
  };

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

  const previousImages = subject.images;
  const retainedImages = (input.images ?? []).filter((image) => previousImages.some((current) => current.id === image.id));
  const uploadedImages = await Promise.all((input.imageUploads ?? []).map((upload) => saveImage(uploadRoot, subjectId, upload)));

  subject.title = normalizeText(input.title);
  subject.slug = createUniqueSlug(input.title, subjects, subjectId);
  subject.summary = input.summary.trim();
  subject.content = input.content.trim();
  subject.isPublished = input.isPublished;
  subject.images = [...retainedImages, ...uploadedImages];
  subject.updatedAt = new Date().toISOString();

  await removeDeletedImages(uploadRoot, previousImages, subject.images);
  await writeSubjects(dataFilePath, subjects);
  return subject;
};

export const deleteSubject = async (dataFilePath: string, uploadRoot: string, subjectId: string) => {
  const subjects = await readSubjects(dataFilePath);
  const subject = subjects.find((item) => item.id === subjectId);

  if (!subject) {
    return false;
  }

  await Promise.all(subject.images.map((image) => deleteUploadImage(uploadRoot, image.url)));
  await writeSubjects(
    dataFilePath,
    subjects.filter((item) => item.id !== subjectId)
  );
  return true;
};
