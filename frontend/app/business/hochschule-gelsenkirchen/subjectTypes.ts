export type SubjectImage = {
  id: string;
  url: string;
  alt?: string;
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

export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export function resolveAssetUrl(path: string | undefined) {
  if (!path) {
    return undefined;
  }

  return path.startsWith("http") ? path : `${apiBaseUrl}${path}`;
}
