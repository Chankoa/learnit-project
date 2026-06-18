import { domains } from "@/data/domains";
import {
  teacherActivities,
  teacherCourses,
  teacherProfile,
  teacherResources,
  teacherStudents
} from "@/data/teacher";
import type { CourseLevel } from "@/types/course";
import type { LessonType } from "@/types/learning";
import type { ResourceType } from "@/types/resource";
import type {
  TeacherCourse,
  TeacherCourseStatus,
  TeacherLesson,
  TeacherLessonStatus,
  TeacherResource,
  TeacherResourceStatus,
  TeacherStudentStatus
} from "@/types/teaching";

export const teacherCourseStatusLabels: Record<TeacherCourseStatus, string> = {
  draft: "Brouillon",
  published: "Publié"
};

export const teacherLessonStatusLabels: Record<TeacherLessonStatus, string> = {
  draft: "Brouillon",
  published: "Publié",
  review: "En relecture"
};

export const teacherResourceStatusLabels: Record<TeacherResourceStatus, string> = {
  draft: "Brouillon",
  published: "Publié"
};

export const teacherStudentStatusLabels: Record<TeacherStudentStatus, string> = {
  active: "Actif",
  late: "À relancer",
  completed: "Terminé"
};

export const courseLevelLabels: Record<CourseLevel, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé"
};

export const lessonTypeLabels: Record<LessonType, string> = {
  video: "Vidéo",
  reading: "Lecture",
  exercise: "Exercice",
  quiz: "Quiz",
  project: "Projet"
};

export const teacherResourceTypeLabels: Record<ResourceType, string> = {
  article: "Article",
  video: "Vidéo",
  download: "Téléchargement",
  template: "Template",
  exercise: "Exercice",
  link: "Lien",
  tool: "Outil"
};

export function formatTeacherDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function formatTeacherDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function getTeacherProfile() {
  return teacherProfile;
}

export function getTeacherDomains() {
  return domains;
}

export function getTeacherCourses() {
  return [...teacherCourses].sort(
    (first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
  );
}

export function getTeacherCourseById(courseId: string) {
  return teacherCourses.find((course) => course.id === courseId);
}

export function getTeacherCourseStaticParams() {
  return teacherCourses.map((course) => ({ courseId: course.id }));
}

export function getTeacherResources() {
  return [...teacherResources].sort(
    (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  );
}

export function getTeacherStudents() {
  return [...teacherStudents].sort((first, second) =>
    first.name.localeCompare(second.name, "fr")
  );
}

export function getTeacherActivities() {
  return [...teacherActivities].sort(
    (first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
  );
}

export function countTeacherLessons(course: TeacherCourse) {
  return course.modules.reduce((total, module) => total + module.lessons.length, 0);
}

export function getTeacherCourseMetrics() {
  const courses = getTeacherCourses();
  const publishedCourses = courses.filter((course) => course.status === "published");
  const draftCourses = courses.filter((course) => course.status === "draft");
  const resources = getTeacherResources();
  const publishedResources = resources.filter((resource) => resource.status === "published");

  return {
    createdCourseCount: courses.length,
    publishedCourseCount: publishedCourses.length,
    draftCourseCount: draftCourses.length,
    learnerCount: teacherStudents.length,
    publishedResourceCount: publishedResources.length
  };
}

export function getTeacherDashboardData() {
  return {
    teacher: getTeacherProfile(),
    courses: getTeacherCourses(),
    metrics: getTeacherCourseMetrics(),
    resources: getTeacherResources(),
    students: getTeacherStudents(),
    activities: getTeacherActivities().slice(0, 5)
  };
}

export function getLessonById(course: TeacherCourse, lessonId?: string) {
  if (!lessonId) {
    return undefined;
  }

  return course.modules.flatMap((module) => module.lessons).find((lesson) => lesson.id === lessonId);
}

export function getTeacherResourceRows() {
  return getTeacherResources().map((resource) => {
    const course = getTeacherCourseById(resource.courseId);
    const lesson = course ? getLessonById(course, resource.lessonId) : undefined;

    return {
      resource,
      course,
      lesson
    };
  });
}

export function getTeacherStudentRows() {
  return getTeacherStudents().map((student) => ({
    student,
    course: getTeacherCourseById(student.courseId)
  }));
}

export function getTeacherCourseFormDefaults(course?: TeacherCourse) {
  return {
    title: course?.title ?? "",
    description: course?.description ?? "",
    domainId: course?.domain.id ?? domains[0]?.id ?? "",
    level: course?.level ?? "beginner",
    format: course?.format ?? "Formation guidée",
    objectives: (course?.objectives ?? []).join("\n"),
    audience: (course?.audience ?? []).join("\n"),
    requirements: (course?.requirements ?? []).join("\n"),
    coverImage: course?.coverImage ?? "",
    status: course?.status ?? "draft"
  };
}

export function getAllTeacherLessons() {
  return getTeacherCourses().flatMap((course) =>
    course.modules.flatMap((module) =>
      module.lessons.map((lesson) => ({
        course,
        module,
        lesson
      }))
    )
  );
}

export function getTeacherResourceFormCourses() {
  return getTeacherCourses().map((course) => ({
    id: course.id,
    title: course.title
  }));
}

export function getTeacherResourceFormLessons(courseId?: string) {
  return getAllTeacherLessons()
    .filter((item) => !courseId || item.course.id === courseId)
    .map((item) => ({
      id: item.lesson.id,
      title: item.lesson.title,
      courseId: item.course.id
    }));
}

export function getTeacherLessonDurationTotal(lessons: TeacherLesson[]) {
  return lessons.reduce((total, lesson) => total + lesson.durationMinutes, 0);
}
