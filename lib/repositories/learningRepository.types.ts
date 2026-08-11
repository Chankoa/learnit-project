import "server-only";

export type EnrollmentRecord = {
  id: string;
  courseId: string;
  status: "not-started" | "in-progress" | "completed";
  currentLessonId?: string;
  learningTimeMinutes: number;
  startedAt?: string;
  completedAt?: string;
  lastAccessedAt?: string;
};

export type LessonProgressStatus = "not_started" | "in_progress" | "completed";

export type LessonProgressRecord = {
  lessonId: string;
  courseId: string;
  status: LessonProgressStatus;
  completed: boolean;
  completedAt?: string;
  learningTimeMinutes: number;
  startedAt: string;
  updatedAt: string;
};

export type EnrollmentUpdate = Partial<{
  status: EnrollmentRecord["status"];
  current_lesson_id: string | null;
  learning_time_minutes: number;
  started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string | null;
}>;

export type LessonProgressUpdate = Partial<{
  completed: boolean;
  completed_at: string | null;
  learning_time_minutes: number;
}>;

export type LearningRepository = {
  getEnrollments: () => Promise<EnrollmentRecord[]>;
  getEnrollment: (courseId: string) => Promise<EnrollmentRecord | undefined>;
  enroll: (courseId: string) => Promise<EnrollmentRecord>;
  unenroll: (courseId: string) => Promise<void>;
  updateEnrollment: (courseId: string, values: EnrollmentUpdate) => Promise<void>;
  getLessonProgress: (courseId: string) => Promise<LessonProgressRecord[]>;
  getLessonProgressRecord: (
    courseId: string,
    lessonId: string
  ) => Promise<LessonProgressRecord | undefined>;
  upsertLessonProgress: (
    courseId: string,
    lessonId: string,
    values: LessonProgressUpdate
  ) => Promise<void>;
  getNote: (lessonId: string) => Promise<string>;
  saveNote: (lessonId: string, content: string) => Promise<void>;
  getFavoriteResourceIds: () => Promise<string[]>;
  setFavorite: (resourceId: string, favorite: boolean) => Promise<void>;
};
