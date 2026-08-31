export const teacherAuthoringSurfaces = [
  "information",
  "content",
  "resources"
] as const;

export type TeacherAuthoringSurface = (typeof teacherAuthoringSurfaces)[number];

export const teacherAuthoringSurfaceLabels: Record<TeacherAuthoringSurface, string> = {
  content: "Contenu",
  information: "Informations",
  resources: "Ressources"
};

export function isTeacherAuthoringPath(pathname: string) {
  return /^\/app\/teacher\/courses\/[^/]+\/builder\/?$/.test(pathname);
}

export function getTeacherPublicationHref({
  canPublish,
  courseId,
  isPublished
}: {
  canPublish: boolean;
  courseId: string;
  isPublished: boolean;
}) {
  const base = `/app/teacher/courses/${courseId}/edit?tab=publication`;

  return !isPublished && canPublish ? `${base}&publish=1` : base;
}
