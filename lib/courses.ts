import { courses as staticCourses } from "@/data/courses";
import type { Course, CourseModule, CourseStatus } from "@/types/course";
import type { Lesson } from "@/types/learning";

type CourseSource = {
  getCourses: () => Course[];
};

const staticCourseSource: CourseSource = {
  getCourses: () => staticCourses
};

const catalogCourseStatuses = new Set<CourseStatus>(["published", "preview", "coming-soon"]);

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

export function getCatalogCourses() {
  return getAllCourses().filter((course) => catalogCourseStatuses.has(course.status));
}

export function getCatalogCourseBySlug(slug: string) {
  return getCatalogCourses().find((course) => course.slug === slug);
}

export function getCatalogCourseStaticParams() {
  return getCatalogCourses().map((course) => ({ slug: course.slug }));
}

export function getPublishedCourseBySlug(slug: string) {
  const course = getCourseBySlug(slug);

  return course?.status === "published" ? course : undefined;
}

export function getPublishedCourseStaticParams() {
  return getAllCourses()
    .filter((course) => course.status === "published")
    .map((course) => ({ slug: course.slug }));
}

export function getFeaturedCourses() {
  return getCatalogCourses()
    .filter((course) => course.featured)
    .sort((first, second) => (first.featuredOrder ?? 999) - (second.featuredOrder ?? 999));
}

export function getCourseBySlug(slug: string) {
  return getAllCourses().find((course) => course.slug === slug);
}

export function getCourseById(courseId: string) {
  return getAllCourses().find((course) => course.id === courseId);
}

export function getCoursesByDomain(domainId: string) {
  return getAllCourses().filter((course) => course.domain.id === domainId);
}

export function getPublishedCoursesByDomain(domainId: string) {
  return getPublishedCourses().filter((course) => course.domain.id === domainId);
}

export function getCatalogCoursesByDomain(domainId: string) {
  return getCatalogCourses().filter((course) => course.domain.id === domainId);
}

function scoreRelatedCourse(sourceCourse: Course, candidateCourse: Course) {
  const sourceTags = new Set(sourceCourse.tags ?? []);
  const sharedTagCount = (candidateCourse.tags ?? []).filter((tag) => sourceTags.has(tag)).length;
  const domainScore = candidateCourse.domain.id === sourceCourse.domain.id ? 4 : 0;
  const levelScore = candidateCourse.level === sourceCourse.level ? 2 : 0;
  const statusScore = candidateCourse.status === "published" ? 1 : 0;

  return domainScore + levelScore + sharedTagCount + statusScore;
}

export function getOtherCatalogCoursesInSameDomain(courseId: string, limit = 3) {
  const course = getCourseById(courseId);

  if (!course) {
    return [];
  }

  return getCatalogCoursesByDomain(course.domain.id)
    .filter((candidate) => candidate.id !== course.id)
    .slice(0, limit);
}

export function getRelatedCourses(courseId: string, limit = 3) {
  const course = getCourseById(courseId);

  if (!course) {
    return [];
  }

  return getCatalogCourses()
    .filter((candidate) => candidate.id !== course.id)
    .map((candidate) => ({
      course: candidate,
      score: scoreRelatedCourse(course, candidate)
    }))
    .filter(({ score }) => score > 0)
    .sort((first, second) => {
      if (second.score !== first.score) {
        return second.score - first.score;
      }

      return first.course.title.localeCompare(second.course.title);
    })
    .slice(0, limit)
    .map(({ course }) => course);
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
