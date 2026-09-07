export type CourseModeHref = "edit" | "learn" | "view";

export function buildCourseModeHref(pathname: string, mode: CourseModeHref | string) {
  const [path, query = ""] = pathname.split("?", 2);
  const searchParams = new URLSearchParams(query);

  searchParams.set("mode", mode);

  const normalizedQuery = searchParams.toString();
  return normalizedQuery ? `${path}?${normalizedQuery}` : path;
}