import "server-only";

import { getConfiguredDataSource } from "@/lib/config/data-source";
import { findCourse, listCourses, listDomains } from "@/lib/repositories/courseRepository";
import * as supabaseCourses from "@/lib/repositories/supabase/courseRepository";
import { getResources as getSupabaseResources } from "@/lib/repositories/supabase/resourceRepository";
import { listResources } from "@/lib/repositories/resourceRepository";
import type { Course, CourseModule, Domain } from "@/types/course";
import type { Lesson } from "@/types/learning";
import type { Resource } from "@/types/resource";

export type LmsDataSource = {
  getCourses: () => Promise<Course[]>;
  getCourse: (lookup: { id?: string; slug?: string }) => Promise<Course | undefined>;
  getDomains: () => Promise<Domain[]>;
  getModules: (courseId?: string) => Promise<CourseModule[]>;
  getLessons: (courseId?: string) => Promise<Lesson[]>;
  getResources: (courseId?: string) => Promise<Resource[]>;
};

const mockDataSource: LmsDataSource = {
  getCourses: async () => listCourses() as Course[],
  getCourse: async (lookup) => findCourse(lookup) as Course | undefined,
  getDomains: async () => listDomains() as Domain[],
  getModules: async (courseId) => {
    const course = courseId ? (findCourse({ id: courseId }) as Course | undefined) : undefined;
    const courses: Course[] = courseId ? (course ? [course] : []) : (listCourses() as Course[]);
    return courses.flatMap((course) => course.modules).sort((first, second) => first.order - second.order);
  },
  getLessons: async (courseId) => {
    const modules = await mockDataSource.getModules(courseId);
    return modules.flatMap((module) => module.lessons).sort((first, second) => first.order - second.order);
  },
  getResources: async (courseId) => {
    if (!courseId) {
      return listResources();
    }

    const course = findCourse({ id: courseId }) as Course | undefined;
    return course ? [
      ...(course.resources ?? []),
      ...course.modules.flatMap((module) => [...(module.resources ?? []), ...module.lessons.flatMap((lesson) => lesson.resources ?? [])])
    ] : [];
  }
};

const supabaseDataSource: LmsDataSource = {
  getCourses: () => supabaseCourses.getCourses(),
  getCourse: (lookup) => supabaseCourses.getCourse(lookup),
  getDomains: () => supabaseCourses.getDomains(),
  getModules: (courseId) => supabaseCourses.getModules(courseId),
  getLessons: (courseId) => supabaseCourses.getLessons(courseId),
  getResources: (courseId) => getSupabaseResources(courseId)
};

export function getLmsDataSource(): LmsDataSource {
  return getConfiguredDataSource() === "supabase" ? supabaseDataSource : mockDataSource;
}

export async function getLmsCatalog() {
  return (await getLmsDataSource().getCourses()).filter(
    (course) => course.status === "published" && course.visibility === "public"
  );
}

export async function getLmsCatalogCourse(slug: string) {
  const course = await getLmsDataSource().getCourse({ slug });
  return course?.status === "published" && (course.visibility === "public" || course.visibility === "unlisted")
    ? course
    : undefined;
}