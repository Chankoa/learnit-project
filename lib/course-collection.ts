export type CourseRelationFilter = "all" | "learn" | "create";
export function normalizeCourseRelationFilter(value?: string | string[]): CourseRelationFilter {
  const selected = Array.isArray(value) ? value[0] : value;
  return selected === "learn" || selected === "create" ? selected : "all";
}
export function filterCourseRelations<T extends { enrollment?: unknown; capabilities: readonly string[] }>(rows: T[], filter: CourseRelationFilter): T[] {
  return rows.filter((row) => filter === "learn" ? Boolean(row.enrollment) : filter === "create" ? row.capabilities.includes("edit") : true);
}
