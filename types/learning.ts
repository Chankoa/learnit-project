import type { Resource } from "@/types/resource";

export type LessonType = "video" | "reading" | "exercise" | "quiz" | "project";

export type LessonStatus = "locked" | "available" | "in-progress" | "completed";

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
