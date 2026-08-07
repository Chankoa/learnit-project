import "server-only";

import { getCourses } from "@/lib/repositories/supabase/courseRepository";
import type { Resource } from "@/types/resource";

export async function getResources(courseId?: string): Promise<Resource[]> {
  const courses = await getCourses(courseId ? { id: courseId } : undefined);
  const resources = courses.flatMap((course) => [
    ...(course.resources ?? []),
    ...course.modules.flatMap((module) => [
      ...(module.resources ?? []),
      ...module.lessons.flatMap((lesson) => lesson.resources ?? [])
    ])
  ]);

  return Array.from(new Map(resources.map((resource) => [resource.id, resource])).values());
}