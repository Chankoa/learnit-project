import type { CourseLevel, Domain } from "@/types/course";
import type { LessonType } from "@/types/learning";
import type { ResourceAccess, ResourceType } from "@/types/resource";

export type TeacherProfile = {
  id: string;
  displayName: string;
  firstName: string;
  email: string;
};

export type TeacherCourseStatus = "draft" | "published";

export type TeacherModuleStatus = "draft" | "published" | "review";

export type TeacherLessonStatus = "draft" | "published" | "review";

export type TeacherLesson = {
  id: string;
  title: string;
  description?: string;
  type: LessonType;
  durationMinutes: number;
  objectives?: string[];
  content?: string;
  resourceIds?: string[];
  resources?: TeacherResource[];
  status: TeacherLessonStatus;
  order: number;
};

export type TeacherModule = {
  id: string;
  title: string;
  description: string;
  order: number;
  durationMinutes?: number;
  status?: TeacherModuleStatus;
  lessons: TeacherLesson[];
};

export type TeacherCourse = {
  id: string;
  slug?: string;
  title: string;
  subtitle?: string;
  description: string;
  domain: Domain;
  level: CourseLevel;
  format: string;
  status: TeacherCourseStatus;
  objectives: string[];
  audience: string[];
  requirements: string[];
  coverImage?: string;
  coverStoragePath?: string;
  enrolledLearnerCount?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  modules: TeacherModule[];
};

export type TeacherResourceStatus = "draft" | "published";

export type TeacherResource = {
  id: string;
  title: string;
  type: ResourceType;
  href: string;
  description?: string;
  courseId: string;
  courseTitle?: string;
  lessonId?: string;
  lessonTitle?: string;
  moduleId?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  storageBucket?: string;
  storagePath?: string;
  access?: ResourceAccess;
  status: TeacherResourceStatus;
  createdAt: string;
  updatedAt?: string;
};

export type TeacherStudentStatus = "active" | "late" | "completed";

export type TeacherStudent = {
  id: string;
  name: string;
  email: string;
  courseId: string;
  progressPercentage: number;
  lastActivityAt: string;
  status: TeacherStudentStatus;
};

export type TeacherActivityType = "course" | "module" | "lesson" | "resource";

export type TeacherActivity = {
  id: string;
  type: TeacherActivityType;
  label: string;
  courseId?: string;
  resourceId?: string;
  updatedAt: string;
};
