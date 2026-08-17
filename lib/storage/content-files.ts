import "server-only";

const resourceMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "text/plain",
  "application/zip"
]);

const coverMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
]);

const extensionByMimeType: Record<string, string> = {
  "application/pdf": "pdf",
  "application/zip": "zip",
  "image/gif": "gif",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "text/plain": "txt"
};

export const resourceFileMaxSize = 10 * 1024 * 1024;
export const coverFileMaxSize = 5 * 1024 * 1024;
export const resourceStorageBucket = "resources";
export const courseCoverStorageBucket = "course-covers";

function normalizeFilename(value: string) {
  const [name] = value.split(/[?#]/);
  const withoutPath = name.split(/[/\\]/).pop() || "fichier";
  const normalized = withoutPath
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);

  return normalized || "fichier";
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

export function assertResourceFile(file: File) {
  if (file.size <= 0) {
    throw new Error("Le fichier est vide.");
  }

  if (file.size > resourceFileMaxSize) {
    throw new Error("Le fichier ne peut pas dépasser 10 Mo.");
  }

  if (!resourceMimeTypes.has(file.type)) {
    throw new Error("Type de fichier non autorisé. Formats acceptés : PDF, image, texte ou ZIP.");
  }
}

export function assertCoverFile(file: File) {
  if (file.size <= 0) {
    throw new Error("L'image est vide.");
  }

  if (file.size > coverFileMaxSize) {
    throw new Error("L'image de couverture ne peut pas dépasser 5 Mo.");
  }

  if (!coverMimeTypes.has(file.type)) {
    throw new Error("Format d'image non autorisé. Formats acceptés : JPG, PNG, WebP ou GIF.");
  }
}

export function buildResourceStoragePath(
  teacherId: string,
  courseId: string,
  lessonId: string | undefined,
  filename: string,
  mimeType: string
) {
  const safeFilename = withExtension(normalizeFilename(filename), mimeType);
  const lessonSegment = lessonId || "course";
  return `${teacherId}/${courseId}/${lessonSegment}/${getUniquePrefix()}-${safeFilename}`;
}

export function buildCoverStoragePath(
  teacherId: string,
  courseId: string,
  filename: string,
  mimeType: string
) {
  const safeFilename = withExtension(normalizeFilename(filename), mimeType);
  return `${teacherId}/${courseId}/${getUniquePrefix()}-${safeFilename}`;
}

export function formatFileSize(bytes?: number) {
  if (!bytes) {
    return "";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}
