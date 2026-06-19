import {
  findCourse,
  listCourses,
  listLessons,
  listModules,
  type CourseLookup
} from "@/lib/repositories/courseRepository";
import { listResources } from "@/lib/repositories/resourceRepository";
import type { Course, CourseModule } from "@/types/course";
import type { Lesson } from "@/types/learning";
import type { Resource } from "@/types/resource";

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

function uniqueResources(resources: Resource[]) {
  return Array.from(new Map(resources.map((resource) => [resource.id, resource])).values());
}

const staticDataSource: DataSource = {
  getCourses: () => listCourses(),
  getCourse: (lookup) => findCourse(lookup),
  getModules: (courseId) => {
    if (!courseId) {
      return sortModules(listModules());
    }

    const course = staticDataSource.getCourse({ id: courseId });

    return course ? sortModules(course.modules) : [];
  },
  getLessons: (courseId) => {
    if (!courseId) {
      return listLessons();
    }

    return staticDataSource
      .getModules(courseId)
      .flatMap((module) => sortLessons(module.lessons));
  },
  getResources: (courseId) => {
    if (!courseId) {
      return listResources();
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
