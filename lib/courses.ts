import { courses as staticCourses } from "@/data/courses";
import type { Course, CourseModule } from "@/types/course";
import type { Lesson } from "@/types/learning";

type CourseSource = {
  getCourses: () => Course[];
};

const staticCourseSource: CourseSource = {
  getCourses: () => staticCourses
};

function getCourseSource() {
  return staticCourseSource;
}

function getCoursesSnapshot() {
  return [...getCourseSource().getCourses()];
}

function sortModules(modules: CourseModule[]) {
  return [...modules].sort((first, second) => first.order - second.order);
}

function sortLessons(lessons: Lesson[]) {
  return [...lessons].sort((first, second) => first.order - second.order);
}

function getOrderedCourseLessons(course: Course) {
  return sortModules(course.modules).flatMap((module) => sortLessons(module.lessons));
}

export function getAllCourses() {
  return getCoursesSnapshot();
}

export function getPublishedCourses() {
  return getAllCourses().filter((course) => course.status === "published");
}

export function getFeaturedCourses() {
  return getPublishedCourses()
    .filter((course) => course.featured)
    .sort((first, second) => (first.featuredOrder ?? 999) - (second.featuredOrder ?? 999));
}

export function getCourseBySlug(slug: string) {
  return getAllCourses().find((course) => course.slug === slug);
}

export function getCoursesByDomain(domainId: string) {
  return getAllCourses().filter((course) => course.domain.id === domainId);
}

export function getCourseModules(courseId: string) {
  const course = getAllCourses().find((item) => item.id === courseId);

  return course ? sortModules(course.modules) : [];
}

export function getCourseLessons(courseId: string) {
  const course = getAllCourses().find((item) => item.id === courseId);

  return course ? getOrderedCourseLessons(course) : [];
}

export function getLessonBySlug(courseSlug: string, lessonSlug: string) {
  const course = getCourseBySlug(courseSlug);

  return course ? getOrderedCourseLessons(course).find((lesson) => lesson.slug === lessonSlug) : undefined;
}

export function getNextLesson(courseId: string, lessonId: string) {
  const lessons = getCourseLessons(courseId);
  const currentIndex = lessons.findIndex((lesson) => lesson.id === lessonId);

  return currentIndex >= 0 ? lessons[currentIndex + 1] : undefined;
}

export function getPreviousLesson(courseId: string, lessonId: string) {
  const lessons = getCourseLessons(courseId);
  const currentIndex = lessons.findIndex((lesson) => lesson.id === lessonId);

  return currentIndex > 0 ? lessons[currentIndex - 1] : undefined;
}
