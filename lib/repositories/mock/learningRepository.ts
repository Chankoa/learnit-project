import "server-only";

import { listLearnerEnrollments } from "@/lib/repositories/progressRepository";
import type {
  EnrollmentRecord,
  LearningRepository,
  LessonProgressRecord
} from "@/lib/repositories/learningRepository.types";

function mapEnrollment(enrollment: ReturnType<typeof listLearnerEnrollments>[number]): EnrollmentRecord {
  return {
    id: `mock-${enrollment.courseId}`,
    courseId: enrollment.courseId,
    status: enrollment.status,
    currentLessonId: enrollment.currentLessonId,
    learningTimeMinutes: enrollment.learningTimeMinutes,
    completedAt: enrollment.status === "completed" ? enrollment.lastAccessedAt : undefined,
    lastAccessedAt: enrollment.lastAccessedAt,
    startedAt: enrollment.lastAccessedAt
  };
}

function getMockProgress(courseId: string): LessonProgressRecord[] {
  const enrollment = listLearnerEnrollments().find((item) => item.courseId === courseId);

  if (!enrollment) {
    return [];
  }

  const activityDate = enrollment.lastAccessedAt ?? new Date(0).toISOString();
  const completedRecords: LessonProgressRecord[] = enrollment.completedLessonIds.map((lessonId) => ({
    courseId,
    lessonId,
    status: "completed",
    completed: true,
    completedAt: activityDate,
    learningTimeMinutes: 0,
    startedAt: activityDate,
    updatedAt: activityDate
  }));

  if (enrollment.currentLessonId && !enrollment.completedLessonIds.includes(enrollment.currentLessonId)) {
    completedRecords.push({
      courseId,
      lessonId: enrollment.currentLessonId,
      status: "in_progress",
      completed: false,
      learningTimeMinutes: 0,
      startedAt: activityDate,
      updatedAt: activityDate
    });
  }

  return completedRecords;
}

export const mockLearningRepository: LearningRepository = {
  async getEnrollments() {
    return listLearnerEnrollments().map(mapEnrollment);
  },
  async getEnrollment(courseId) {
    const enrollment = listLearnerEnrollments().find((item) => item.courseId === courseId);

    return enrollment ? mapEnrollment(enrollment) : undefined;
  },
  async enroll(courseId) {
    return {
      id: `mock-${courseId}`,
      courseId,
      status: "not-started",
      learningTimeMinutes: 0
    };
  },
  async unenroll() {
    return undefined;
  },
  async updateEnrollment() {
    return undefined;
  },
  async getLessonProgress(courseId) {
    return getMockProgress(courseId);
  },
  async getLessonProgressRecord(courseId, lessonId) {
    return getMockProgress(courseId).find((progress) => progress.lessonId === lessonId);
  },
  async upsertLessonProgress() {
    return undefined;
  },
  async getNote() {
    return "";
  },
  async saveNote() {
    return undefined;
  },
  async getFavoriteResourceIds() {
    return [];
  },
  async setFavorite() {
    return undefined;
  }
};
