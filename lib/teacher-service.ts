import "server-only";

import { requireRole } from "@/lib/auth/server";
import * as teacherCourseRepository from "@/lib/repositories/teacherCourseRepository";
import type { CourseLevel } from "@/types/course";
import type { LessonType } from "@/types/learning";
import type {
  TeacherCourse,
  TeacherLesson,
  TeacherModule
} from "@/types/teaching";

const courseLevels = ["beginner", "intermediate", "advanced"] satisfies CourseLevel[];
const lessonTypes = ["video", "reading", "exercise", "quiz", "project"] satisfies LessonType[];
const publishableStatuses = ["draft", "published"] as const;

export type TeacherCourseFormValues = {
  title: string;
  subtitle: string;
  description: string;
  domainId: string;
  level: CourseLevel;
  format: string;
  coverImage: string;
};

export type TeacherDashboardData = {
  courses: TeacherCourse[];
  metrics: {
    courseCount: number;
    draftCount: number;
    publishedCount: number;
    latestUpdatedAt?: string;
  };
  activities: Array<{
    id: string;
    label: string;
    updatedAt: string;
  }>;
};

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string) {
  const value = Number(getString(formData, key));
  return Number.isFinite(value) && value > 0 ? Math.round(value) : undefined;
}

function getLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isCourseLevel(value: string): value is CourseLevel {
  return courseLevels.includes(value as CourseLevel);
}

function isLessonType(value: string): value is LessonType {
  return lessonTypes.includes(value as LessonType);
}

function isPublishableStatus(value: string): value is (typeof publishableStatuses)[number] {
  return publishableStatuses.includes(value as (typeof publishableStatuses)[number]);
}

function required(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }

  return value.trim();
}

export function formatTeacherCount(count: number, singular: string, plural: string) {
  return `${count} ${count > 1 ? plural : singular}`;
}

export function formatModuleCount(count: number) {
  return formatTeacherCount(count, "module", "modules");
}

export function formatLessonCount(count: number) {
  return formatTeacherCount(count, "leçon", "leçons");
}

export function countTeacherLessons(course: TeacherCourse) {
  return course.modules.reduce((total, module) => total + module.lessons.length, 0);
}

export function getTeacherCourseDuration(course: TeacherCourse) {
  return course.modules.reduce(
    (total, module) =>
      total + module.lessons.reduce((moduleTotal, lesson) => moduleTotal + lesson.durationMinutes, 0),
    0
  );
}

export function getTeacherCourseFormDefaults(course?: TeacherCourse): TeacherCourseFormValues {
  return {
    title: course?.title ?? "",
    subtitle: course?.subtitle ?? "",
    description: course?.description ?? "",
    domainId: course?.domain.id ?? "",
    level: course?.level ?? "beginner",
    format: course?.format ?? "Formation guidée",
    coverImage: course?.coverImage ?? ""
  };
}

export function parseTeacherCourseForm(formData: FormData): teacherCourseRepository.TeacherCourseInput {
  const level = getString(formData, "level");

  return {
    title: required(getString(formData, "title"), "Le titre est requis."),
    subtitle: getString(formData, "subtitle") || undefined,
    description: required(getString(formData, "description"), "La description est requise."),
    domainId: required(getString(formData, "domainId"), "Le domaine est requis."),
    level: isCourseLevel(level) ? level : "beginner",
    format: getString(formData, "format") || undefined,
    coverImage: getString(formData, "coverImage") || undefined
  };
}

export function parseTeacherModuleForm(formData: FormData): teacherCourseRepository.TeacherModuleInput {
  const status = getString(formData, "status");

  return {
    title: required(getString(formData, "title"), "Le titre du module est requis."),
    description: getString(formData, "description") || undefined,
    durationMinutes: getNumber(formData, "durationMinutes"),
    status: isPublishableStatus(status) ? status : "draft"
  };
}

export function parseTeacherLessonForm(formData: FormData): teacherCourseRepository.TeacherLessonInput {
  const type = getString(formData, "type");
  const status = getString(formData, "status");

  return {
    title: required(getString(formData, "title"), "Le titre de la leçon est requis."),
    description: getString(formData, "description") || undefined,
    type: isLessonType(type) ? type : "reading",
    durationMinutes: getNumber(formData, "durationMinutes"),
    objectives: getLines(getString(formData, "objectives")),
    content: getString(formData, "content") || undefined,
    status: isPublishableStatus(status) ? status : "draft"
  };
}

export function getPublicationIssues(course: TeacherCourse) {
  const issues: string[] = [];

  if (!course.title.trim()) {
    issues.push("Ajoutez un titre.");
  }

  if (!course.description.trim()) {
    issues.push("Ajoutez une description.");
  }

  if (course.modules.length === 0) {
    issues.push("Ajoutez au moins un module.");
  }

  if (countTeacherLessons(course) === 0) {
    issues.push("Ajoutez au moins une leçon.");
  }

  return issues;
}

export function getModuleById(course: TeacherCourse, moduleId?: string) {
  return moduleId ? course.modules.find((module) => module.id === moduleId) : undefined;
}

export function getLessonById(course: TeacherCourse, lessonId?: string) {
  return lessonId
    ? course.modules.flatMap((module) => module.lessons).find((lesson) => lesson.id === lessonId)
    : undefined;
}

export function getModuleForLesson(course: TeacherCourse, lesson: TeacherLesson) {
  return course.modules.find((module) => module.lessons.some((item) => item.id === lesson.id));
}

export function getDefaultModuleInput(): teacherCourseRepository.TeacherModuleInput {
  return {
    title: "Nouveau module",
    description: "Décrivez l'objectif de ce module.",
    status: "draft"
  };
}

export function getDefaultLessonInput(): teacherCourseRepository.TeacherLessonInput {
  return {
    title: "Nouvelle leçon",
    description: "Décrivez ce que l'apprenant va réaliser.",
    type: "reading",
    durationMinutes: 20,
    objectives: ["Comprendre l'objectif de la leçon"],
    content:
      "# Nouvelle leçon\n\nAjoutez ici le contenu pédagogique. Un éditeur MDX pourra remplacer ce champ plus tard.",
    status: "draft"
  };
}

export async function getTeacherStudioDashboard(nextPath = "/app/teacher"): Promise<TeacherDashboardData> {
  const profile = await requireRole("teacher", nextPath);
  const courses = await teacherCourseRepository.getTeacherCourses(profile.id);
  const sortedCourses = [...courses].sort(
    (first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
  );

  return {
    courses: sortedCourses,
    metrics: {
      courseCount: courses.length,
      draftCount: courses.filter((course) => course.status === "draft").length,
      publishedCount: courses.filter((course) => course.status === "published").length,
      latestUpdatedAt: sortedCourses[0]?.updatedAt
    },
    activities: sortedCourses.slice(0, 5).map((course) => ({
      id: course.id,
      label: `Formation mise à jour : ${course.title}`,
      updatedAt: course.updatedAt
    }))
  };
}

export async function getTeacherStudioCourses(nextPath = "/app/teacher/courses") {
  const profile = await requireRole("teacher", nextPath);
  return teacherCourseRepository.getTeacherCourses(profile.id);
}

export async function getTeacherStudioDomains() {
  return teacherCourseRepository.getTeacherDomains();
}

export async function createTeacherDomain(name: string) {
  const profile = await requireRole("teacher", "/app/teacher/courses/new");
  const normalizedName = name.replace(/\s+/g, " ").trim();

  if (!normalizedName) {
    throw new Error("Le nom du domaine est requis.");
  }

  return teacherCourseRepository.createDomain(profile.id, { name: normalizedName });
}

export async function getTeacherStudioCourse(courseId: string, nextPath: string) {
  const profile = await requireRole("teacher", nextPath);
  return teacherCourseRepository.getTeacherCourse(profile.id, courseId);
}

export async function createTeacherCourse(formData: FormData) {
  const profile = await requireRole("teacher", "/app/teacher/courses/new");
  return teacherCourseRepository.createCourse(profile.id, parseTeacherCourseForm(formData));
}

export async function updateTeacherCourse(courseId: string, formData: FormData) {
  const profile = await requireRole("teacher", `/app/teacher/courses/${courseId}/edit`);
  return teacherCourseRepository.updateCourse(profile.id, courseId, parseTeacherCourseForm(formData));
}

export async function createTeacherModule(courseId: string) {
  const profile = await requireRole("teacher", `/app/teacher/courses/${courseId}/builder`);
  return teacherCourseRepository.createModule(profile.id, courseId, getDefaultModuleInput());
}

export async function updateTeacherModule(courseId: string, moduleId: string, formData: FormData) {
  const profile = await requireRole("teacher", `/app/teacher/courses/${courseId}/builder`);
  return teacherCourseRepository.updateModule(
    profile.id,
    courseId,
    moduleId,
    parseTeacherModuleForm(formData)
  );
}

export async function moveTeacherModule(courseId: string, moduleId: string, direction: -1 | 1) {
  const profile = await requireRole("teacher", `/app/teacher/courses/${courseId}/builder`);
  return teacherCourseRepository.moveModule(profile.id, courseId, moduleId, direction);
}

export async function deleteTeacherModule(courseId: string, moduleId: string) {
  const profile = await requireRole("teacher", `/app/teacher/courses/${courseId}/builder`);
  return teacherCourseRepository.deleteModule(profile.id, courseId, moduleId);
}

export async function createTeacherLesson(courseId: string, moduleId: string) {
  const profile = await requireRole("teacher", `/app/teacher/courses/${courseId}/builder`);
  return teacherCourseRepository.createLesson(profile.id, courseId, moduleId, getDefaultLessonInput());
}

export async function updateTeacherLesson(courseId: string, lessonId: string, formData: FormData) {
  const profile = await requireRole("teacher", `/app/teacher/courses/${courseId}/builder`);
  return teacherCourseRepository.updateLesson(
    profile.id,
    courseId,
    lessonId,
    parseTeacherLessonForm(formData)
  );
}

export async function moveTeacherLesson(
  courseId: string,
  moduleId: string,
  lessonId: string,
  direction: -1 | 1
) {
  const profile = await requireRole("teacher", `/app/teacher/courses/${courseId}/builder`);
  return teacherCourseRepository.moveLesson(profile.id, courseId, moduleId, lessonId, direction);
}

export async function deleteTeacherLesson(courseId: string, lessonId: string) {
  const profile = await requireRole("teacher", `/app/teacher/courses/${courseId}/builder`);
  return teacherCourseRepository.deleteLesson(profile.id, courseId, lessonId);
}

export async function publishTeacherCourse(courseId: string) {
  const profile = await requireRole("teacher", `/app/teacher/courses/${courseId}/edit`);
  const course = await teacherCourseRepository.getTeacherCourse(profile.id, courseId);

  if (!course) {
    throw new Error("Formation introuvable ou non publiable.");
  }

  const issues = getPublicationIssues(course);

  if (issues.length > 0) {
    throw new Error(issues[0]);
  }

  await teacherCourseRepository.publishCourse(profile.id, courseId, getTeacherCourseDuration(course));

  return course;
}
