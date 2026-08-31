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
