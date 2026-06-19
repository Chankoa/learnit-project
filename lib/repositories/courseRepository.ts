import {
  adminCourses,
  adminDomains,
  platformSettings
} from "@/data/admin";
import { courses } from "@/data/courses";
import { domains } from "@/data/domains";
import { lessons } from "@/data/lessons";
import { modules } from "@/data/modules";
import { teacherCourses } from "@/data/teacher";

export type CourseLookup =
  | string
  | {
      id?: string;
      slug?: string;
    };

function getLookupValue(lookup: CourseLookup) {
  return typeof lookup === "string" ? { id: lookup, slug: lookup } : lookup;
}

export function listCourses() {
  return [...courses];
}

export function findCourse(lookup: CourseLookup) {
  const { id, slug } = getLookupValue(lookup);

  return courses.find((course) => course.id === id || course.slug === slug);
}

export function listModules() {
  return [...modules];
}

export function listLessons() {
  return [...lessons];
}

export function listDomains() {
  return [...domains];
}

export function listTeacherCourses() {
  return [...teacherCourses];
}

export function findTeacherCourse(courseId: string) {
  return teacherCourses.find((course) => course.id === courseId);
}

export function listAdminCourses() {
  return [...adminCourses];
}

export function listAdminDomains() {
  return [...adminDomains];
}

export function findAdminDomain(domainId: string) {
  return adminDomains.find((domain) => domain.id === domainId);
}

export function getPlatformSettings() {
  return platformSettings;
}
