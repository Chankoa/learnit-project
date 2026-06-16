import { courses as staticCourses } from "@/data/courses";
import { lessons as staticLessons } from "@/data/lessons";
import { modules as staticModules } from "@/data/modules";
import { resources as staticResources } from "@/data/resources";
import type { Course, CourseModule } from "@/types/course";
import type { Lesson } from "@/types/learning";
import type { Resource } from "@/types/resource";

export type CourseLookup =
  | string
  | {
      id?: string;
      slug?: string;
    };

export type DataSource = {
  getCourses: () => Course[];
  getCourse: (lookup: CourseLookup) => Course | undefined;
  getModules: (courseId?: string) => CourseModule[];
  getLessons: (courseId?: string) => Lesson[];
  getResources: (courseId?: string) => Resource[];
};

function sortModules(modules: CourseModule[]) {
  return [...modules].sort((first, second) => first.order - second.order);
}

function sortLessons(lessons: Lesson[]) {
  return [...lessons].sort((first, second) => first.order - second.order);
}

function getLookupValue(lookup: CourseLookup) {
  return typeof lookup === "string" ? { id: lookup, slug: lookup } : lookup;
}

function uniqueResources(resources: Resource[]) {
  return Array.from(new Map(resources.map((resource) => [resource.id, resource])).values());
}

const staticDataSource: DataSource = {
  getCourses: () => staticCourses,
  getCourse: (lookup) => {
    const { id, slug } = getLookupValue(lookup);

    return staticCourses.find((course) => course.id === id || course.slug === slug);
  },
  getModules: (courseId) => {
    if (!courseId) {
      return sortModules(staticModules);
    }

    const course = staticDataSource.getCourse({ id: courseId });

    return course ? sortModules(course.modules) : [];
  },
  getLessons: (courseId) => {
    if (!courseId) {
      return [...staticLessons];
    }

    return staticDataSource
      .getModules(courseId)
      .flatMap((module) => sortLessons(module.lessons));
  },
  getResources: (courseId) => {
    if (!courseId) {
      return [...staticResources];
    }

    const course = staticDataSource.getCourse({ id: courseId });

    if (!course) {
      return [];
    }

    return uniqueResources([
      ...(course.resources ?? []),
      ...course.modules.flatMap((module) => module.resources ?? []),
      ...course.modules.flatMap((module) => module.lessons.flatMap((lesson) => lesson.resources ?? []))
    ]);
  }
};

function getDataSource() {
  return staticDataSource;
}

export function getCourses() {
  return [...getDataSource().getCourses()];
}

export function getCourse(lookup: CourseLookup) {
  return getDataSource().getCourse(lookup);
}

export function getModules(courseId?: string) {
  return getDataSource().getModules(courseId);
}

export function getLessons(courseId?: string) {
  return getDataSource().getLessons(courseId);
}

export function getResources(courseId?: string) {
  return getDataSource().getResources(courseId);
}
