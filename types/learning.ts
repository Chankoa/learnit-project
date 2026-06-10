import type { Resource } from "@/types/resource";

export type LessonType = "video" | "reading" | "exercise" | "quiz" | "project";

export type LessonStatus = "locked" | "available" | "preview" | "in-progress" | "completed";

export type Lesson = {
  id: string;
  slug: string;
  title: string;
  type: LessonType;
  description?: string;
  durationMinutes?: number;
  status?: LessonStatus;
  videoUrl?: string;
  contentPath?: string;
  objectives?: string[];
  resources?: Resource[];
  order: number;
};

export type CourseProgress = {
  courseId: string;
  completedLessons: string[];
  currentLessonId: string;
  lastAccessedAt: string;
};

export type LearnerProfile = {
  id: string;
  firstName: string;
  displayName: string;
  email: string;
  initials: string;
};

export type DeliverableStatus = "todo" | "in-progress" | "submitted";

export type LearningDeliverable = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueLabel?: string;
  status: DeliverableStatus;
};

export type LessonContentSection = {
  id: string;
  title: string;
  paragraphs: string[];
  points?: string[];
};

export type LessonExercise = {
  title: string;
  description: string;
  steps: string[];
  deliverable?: string;
};

export type LessonContentDocument = {
  lead: string;
  sections: LessonContentSection[];
  exercise: LessonExercise;
};
