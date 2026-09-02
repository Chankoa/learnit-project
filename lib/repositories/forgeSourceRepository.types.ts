import "server-only";

import type { CourseSource } from "@/types/forge-ai";

export type ForgeFileSourceInput = {
  courseId?: string;
  file: File;
  kind: "file";
  title?: string;
};

export type ForgeUrlSourceInput = {
  content: string;
  courseId?: string;
  finalUrl: string;
  kind: "url";
  mimeType: string;
  originalUrl: string;
  title: string;
};

export type ForgeSourceInput = ForgeFileSourceInput | ForgeUrlSourceInput;

export type ForgeSourceRepository = {
  attachSourcesToCourse: (
    teacherId: string,
    sourceIds: string[],
    courseId: string
  ) => Promise<void>;
  createSource: (teacherId: string, input: ForgeSourceInput) => Promise<CourseSource>;
  deleteSource: (teacherId: string, sourceId: string) => Promise<void>;
  getSources: (teacherId: string, courseId?: string) => Promise<CourseSource[]>;
  getSourcesByIds: (teacherId: string, sourceIds: string[]) => Promise<CourseSource[]>;
  getLearnerCourseSources: (courseId: string) => Promise<CourseSource[]>;
  getLearnerCourseSourcesByIds: (courseId: string, sourceIds: string[]) => Promise<CourseSource[]>;
};
