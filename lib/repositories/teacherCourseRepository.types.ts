import "server-only";

import type { CourseLevel, Domain } from "@/types/course";
import type { LessonType } from "@/types/learning";
import type {
  TeacherCourse,
  TeacherCourseStatus,
  TeacherLesson,
  TeacherLessonStatus,
  TeacherModule,
  TeacherModuleStatus
} from "@/types/teaching";

export type TeacherCourseInput = {
  title: string;
  subtitle?: string;
  description: string;
  domainId: string;
  level: CourseLevel;
  format?: string;
  coverImage?: string;
};

export type TeacherDomainInput = {
  name: string;
};

export type TeacherModuleInput = {
  title: string;
  description?: string;
  durationMinutes?: number;
  status?: Extract<TeacherModuleStatus, "draft" | "published">;
};

export type TeacherLessonInput = {
  title: string;
  description?: string;
  type: LessonType;
  durationMinutes?: number;
  objectives?: string[];
  content?: string;
  status?: Extract<TeacherLessonStatus, "draft" | "published">;
};

export type TeacherCoursePublication = {
  publishedAt?: string;
  status: TeacherCourseStatus;
};

export type TeacherCourseRepository = {
  getDomains: () => Promise<Domain[]>;
  createDomain: (teacherId: string, input: TeacherDomainInput) => Promise<Domain>;
  getTeacherCourses: (teacherId: string) => Promise<TeacherCourse[]>;
  getTeacherCourse: (teacherId: string, courseId: string) => Promise<TeacherCourse | undefined>;
  createCourse: (teacherId: string, input: TeacherCourseInput) => Promise<TeacherCourse>;
  updateCourse: (
    teacherId: string,
    courseId: string,
    input: TeacherCourseInput
  ) => Promise<TeacherCourse>;
  createModule: (
    teacherId: string,
    courseId: string,
    input: TeacherModuleInput
  ) => Promise<TeacherModule>;
  updateModule: (
    teacherId: string,
    courseId: string,
    moduleId: string,
    input: TeacherModuleInput
  ) => Promise<TeacherModule>;
  moveModule: (
    teacherId: string,
    courseId: string,
    moduleId: string,
    direction: -1 | 1
  ) => Promise<void>;
  deleteModule: (teacherId: string, courseId: string, moduleId: string) => Promise<void>;
  createLesson: (
    teacherId: string,
    courseId: string,
    moduleId: string,
    input: TeacherLessonInput
  ) => Promise<TeacherLesson>;
  updateLesson: (
    teacherId: string,
    courseId: string,
    lessonId: string,
    input: TeacherLessonInput
  ) => Promise<TeacherLesson>;
  moveLesson: (
    teacherId: string,
    courseId: string,
    moduleId: string,
    lessonId: string,
    direction: -1 | 1
  ) => Promise<void>;
  deleteLesson: (teacherId: string, courseId: string, lessonId: string) => Promise<void>;
  publishCourse: (teacherId: string, courseId: string, durationMinutes?: number) => Promise<void>;
  unpublishCourse: (teacherId: string, courseId: string) => Promise<void>;
};
