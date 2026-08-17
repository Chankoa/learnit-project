import "server-only";

import { requireRole } from "@/lib/auth/server";
import * as teacherCourseRepository from "@/lib/repositories/teacherCourseRepository";
import * as teacherResourceRepository from "@/lib/repositories/teacherResourceRepository";
import type { CourseLevel } from "@/types/course";
import type { LessonType } from "@/types/learning";
import type { ResourceAccess, ResourceType } from "@/types/resource";
import type {
  TeacherCourse,
  TeacherLesson,
  TeacherModule
} from "@/types/teaching";

const courseLevels = ["beginner", "intermediate", "advanced"] satisfies CourseLevel[];
const lessonTypes = ["video", "reading", "exercise", "quiz", "project"] satisfies LessonType[];
const publishableStatuses = ["draft", "published"] as const;
const resourceTypes = ["article", "video", "download", "template", "exercise", "link", "tool"] satisfies ResourceType[];
const resourceAccessValues = ["free", "enrolled", "premium"] satisfies ResourceAccess[];

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

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : undefined;
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

function isResourceType(value: string): value is ResourceType {
  return resourceTypes.includes(value as ResourceType);
}

function isResourceAccess(value: string): value is ResourceAccess {
  return resourceAccessValues.includes(value as ResourceAccess);
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

export function parseTeacherResourceForm(
  courseId: string,
  lessonId: string | undefined,
  formData: FormData
): teacherResourceRepository.TeacherResourceInput {
  const type = getString(formData, "resourceType");
  const access = getString(formData, "resourceAccess");
  const href = getString(formData, "resourceHref");

  return {
    access: isResourceAccess(access) ? access : "enrolled",
    courseId,
    description: getString(formData, "resourceDescription") || undefined,
    href: required(href, "L'URL de la ressource est requise."),
    lessonId,
    title: required(getString(formData, "resourceTitle"), "Le titre de la ressource est requis."),
    type: isResourceType(type) ? type : "link"
  };
}

export function parseTeacherFileResourceForm(
  courseId: string,
  lessonId: string | undefined,
  formData: FormData
): teacherResourceRepository.TeacherFileResourceInput {
  const type = getString(formData, "fileResourceType");
  const access = getString(formData, "fileResourceAccess");
  const file = getFile(formData, "resourceFile");

  if (!file) {
    throw new Error("Sélectionnez un fichier à téléverser.");
  }

  return {
    access: isResourceAccess(access) ? access : "enrolled",
    courseId,
    description: getString(formData, "fileResourceDescription") || undefined,
    file,
    lessonId,
    title: getString(formData, "fileResourceTitle") || file.name,
    type: isResourceType(type) ? type : "download"
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

export async function getTeacherResources(nextPath = "/app/teacher/resources") {
  const profile = await requireRole("teacher", nextPath);
  return teacherResourceRepository.getTeacherResources(profile.id);
}

export async function getTeacherStudioCourse(courseId: string, nextPath: string) {
  const profile = await requireRole("teacher", nextPath);
  return teacherCourseRepository.getTeacherCourse(profile.id, courseId);
}

export async function createTeacherCourse(formData: FormData) {
  const profile = await requireRole("teacher", "/app/teacher/courses/new");
  const course = await teacherCourseRepository.createCourse(profile.id, parseTeacherCourseForm(formData));
  const coverFile = getFile(formData, "coverFile");

  if (!coverFile) {
    return course;
  }

  await teacherResourceRepository.uploadCourseCover(profile.id, {
    courseId: course.id,
    file: coverFile
  });

  return (await teacherCourseRepository.getTeacherCourse(profile.id, course.id)) ?? course;
}

export async function updateTeacherCourse(courseId: string, formData: FormData) {
  const profile = await requireRole("teacher", `/app/teacher/courses/${courseId}/edit`);
  const course = await teacherCourseRepository.updateCourse(profile.id, courseId, parseTeacherCourseForm(formData));
  const coverFile = getFile(formData, "coverFile");

  if (!coverFile) {
    return course;
  }

  await teacherResourceRepository.uploadCourseCover(profile.id, {
    courseId: course.id,
    file: coverFile
  });

  return (await teacherCourseRepository.getTeacherCourse(profile.id, course.id)) ?? course;
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

export async function createTeacherLessonResource(
  courseId: string,
  lessonId: string | undefined,
  formData: FormData
) {
  const profile = await requireRole("teacher", `/app/teacher/courses/${courseId}/builder`);
  return teacherResourceRepository.createResource(
    profile.id,
    parseTeacherResourceForm(courseId, lessonId, formData)
  );
}

export async function uploadTeacherLessonResource(
  courseId: string,
  lessonId: string | undefined,
  formData: FormData
) {
  const profile = await requireRole("teacher", `/app/teacher/courses/${courseId}/builder`);
  return teacherResourceRepository.createFileResource(
    profile.id,
    parseTeacherFileResourceForm(courseId, lessonId, formData)
  );
}

export async function deleteTeacherResource(
  resourceId: string,
  nextPath = "/app/teacher/resources"
) {
  const profile = await requireRole("teacher", nextPath);
  return teacherResourceRepository.deleteResource(profile.id, resourceId);
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
