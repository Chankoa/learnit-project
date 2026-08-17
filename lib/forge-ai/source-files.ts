import "server-only";

import type { CourseSourceType } from "@/types/forge-ai";

const sourceMimeTypes = new Set([
  "application/pdf",
  "text/markdown",
  "text/plain"
]);

const extensionByMimeType: Record<string, string> = {
  "application/pdf": "pdf",
  "text/markdown": "md",
  "text/plain": "txt"
};

export const courseSourceBucket = "course-sources";
export const courseSourceMaxSize = 10 * 1024 * 1024;

function normalizeFilename(value: string) {
  const [name] = value.split(/[?#]/);
  const withoutPath = name.split(/[/\\]/).pop() || "source";
  const normalized = withoutPath
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);

  return normalized || "source";
}

function withExtension(filename: string, mimeType: string) {
  if (filename.includes(".")) {
    return filename;
  }

  const extension = extensionByMimeType[mimeType];
  return extension ? `${filename}.${extension}` : filename;
}

function getUniquePrefix() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getCourseSourceType(file: File): CourseSourceType {
  if (file.type === "application/pdf") {
    return "pdf";
  }

  if (file.type === "text/markdown" || file.name.toLowerCase().endsWith(".md")) {
    return "markdown";
  }

  return "text";
}

export function assertCourseSourceFile(file: File) {
  if (file.size <= 0) {
    throw new Error("Le fichier source est vide.");
  }

  if (file.size > courseSourceMaxSize) {
    throw new Error("Le fichier source ne peut pas dépasser 10 Mo.");
  }

  if (!sourceMimeTypes.has(file.type) && !file.name.toLowerCase().endsWith(".md")) {
    throw new Error("Type de source non autorisé. Formats acceptés : PDF, TXT ou Markdown.");
  }
}

export function buildCourseSourcePath(
  teacherId: string,
  courseId: string | undefined,
  filename: string,
  mimeType: string
) {
  const safeFilename = withExtension(normalizeFilename(filename), mimeType);
  return `${teacherId}/${courseId || "brief"}/${getUniquePrefix()}-${safeFilename}`;
}
