import "server-only";

import { getConfiguredDataSource } from "@/lib/config/data-source";
import { mockLearningRepository } from "@/lib/repositories/mock/learningRepository";
import { supabaseLearningRepository } from "@/lib/repositories/supabase/learningRepository";
import type { EnrollmentUpdate, LessonProgressUpdate } from "@/lib/repositories/learningRepository.types";

export type {
  EnrollmentRecord,
  EnrollmentUpdate,
  LearningRepository,
  LessonProgressRecord,
  LessonProgressStatus,
  LessonProgressUpdate
} from "@/lib/repositories/learningRepository.types";

function getLearningRepository() {
  return getConfiguredDataSource() === "supabase"
    ? supabaseLearningRepository
    : mockLearningRepository;
}

export const getEnrollments = () => getLearningRepository().getEnrollments();
export const getEnrollment = (courseId: string) => getLearningRepository().getEnrollment(courseId);
export const enroll = (courseId: string) => getLearningRepository().enroll(courseId);
export const unenroll = (courseId: string) => getLearningRepository().unenroll(courseId);
export const updateEnrollment = (courseId: string, values: EnrollmentUpdate) =>
  getLearningRepository().updateEnrollment(courseId, values);
export const getLessonProgress = (courseId: string) =>
  getLearningRepository().getLessonProgress(courseId);
export const getLessonProgressRecord = (courseId: string, lessonId: string) =>
  getLearningRepository().getLessonProgressRecord(courseId, lessonId);
export const upsertLessonProgress = (
  courseId: string,
  lessonId: string,
  values: LessonProgressUpdate
) => getLearningRepository().upsertLessonProgress(courseId, lessonId, values);
export const getNote = (lessonId: string) => getLearningRepository().getNote(lessonId);
export const saveNote = (lessonId: string, content: string) =>
  getLearningRepository().saveNote(lessonId, content);
export const getFavoriteResourceIds = () => getLearningRepository().getFavoriteResourceIds();
export const setFavorite = (resourceId: string, favorite: boolean) =>
  getLearningRepository().setFavorite(resourceId, favorite);
