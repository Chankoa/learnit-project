import "server-only";

import type { CourseSource } from "@/types/forge-ai";

export type ForgeSourceInput = {
  courseId?: string;
  file: File;
  title?: string;
};

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
};
