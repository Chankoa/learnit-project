import "server-only";

import { getConfiguredDataSource } from "@/lib/config/data-source";
import { mockTeacherCourseRepository } from "@/lib/repositories/mock/teacherCourseRepository";
import { supabaseTeacherCourseRepository } from "@/lib/repositories/supabase/teacherCourseRepository";
import type {
  TeacherDomainInput,
  TeacherCourseInput,
  TeacherLessonInput,
  TeacherModuleInput,
  TeacherModuleRevisionInput
} from "@/lib/repositories/teacherCourseRepository.types";

export type {
  TeacherDomainInput,
  TeacherCourseInput,
  TeacherCourseRepository,
  TeacherLessonInput,
  TeacherModuleInput,
  TeacherModuleRevisionInput
} from "@/lib/repositories/teacherCourseRepository.types";

function getTeacherCourseRepository() {
  return getConfiguredDataSource() === "supabase"
    ? supabaseTeacherCourseRepository
    : mockTeacherCourseRepository;
}

export const getTeacherDomains = () => getTeacherCourseRepository().getDomains();
export const createDomain = (teacherId: string, input: TeacherDomainInput) =>
  getTeacherCourseRepository().createDomain(teacherId, input);
export const getTeacherCourses = (teacherId: string) =>
  getTeacherCourseRepository().getTeacherCourses(teacherId);
export const getTeacherCourse = (teacherId: string, courseId: string) =>
  getTeacherCourseRepository().getTeacherCourse(teacherId, courseId);
export const createCourse = (teacherId: string, input: TeacherCourseInput) =>
  getTeacherCourseRepository().createCourse(teacherId, input);
export const updateCourse = (teacherId: string, courseId: string, input: TeacherCourseInput) =>
  getTeacherCourseRepository().updateCourse(teacherId, courseId, input);
export const createModule = (
  teacherId: string,
  courseId: string,
  input: TeacherModuleInput
) => getTeacherCourseRepository().createModule(teacherId, courseId, input);
export const updateModule = (
  teacherId: string,
  courseId: string,
  moduleId: string,
  input: TeacherModuleInput
) => getTeacherCourseRepository().updateModule(teacherId, courseId, moduleId, input);
export const applyModuleRevision = (
  teacherId: string,
  courseId: string,
  moduleId: string,
  input: TeacherModuleRevisionInput
) => getTeacherCourseRepository().applyModuleRevision(teacherId, courseId, moduleId, input);
export const moveModule = (
  teacherId: string,
  courseId: string,
  moduleId: string,
  direction: -1 | 1
) => getTeacherCourseRepository().moveModule(teacherId, courseId, moduleId, direction);
export const deleteModule = (teacherId: string, courseId: string, moduleId: string) =>
  getTeacherCourseRepository().deleteModule(teacherId, courseId, moduleId);
export const createLesson = (
  teacherId: string,
  courseId: string,
  moduleId: string,
  input: TeacherLessonInput
) => getTeacherCourseRepository().createLesson(teacherId, courseId, moduleId, input);
export const updateLesson = (
  teacherId: string,
  courseId: string,
  lessonId: string,
  input: TeacherLessonInput
) => getTeacherCourseRepository().updateLesson(teacherId, courseId, lessonId, input);
export const moveLesson = (
  teacherId: string,
  courseId: string,
  moduleId: string,
  lessonId: string,
  direction: -1 | 1
) => getTeacherCourseRepository().moveLesson(teacherId, courseId, moduleId, lessonId, direction);
export const deleteLesson = (teacherId: string, courseId: string, lessonId: string) =>
  getTeacherCourseRepository().deleteLesson(teacherId, courseId, lessonId);
export const publishCourse = (teacherId: string, courseId: string, durationMinutes?: number) =>
  getTeacherCourseRepository().publishCourse(teacherId, courseId, durationMinutes);
export const unpublishCourse = (teacherId: string, courseId: string) =>
  getTeacherCourseRepository().unpublishCourse(teacherId, courseId);
