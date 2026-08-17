import "server-only";

import type { ResourceAccess, ResourceType } from "@/types/resource";
import type { TeacherResource } from "@/types/teaching";

export type TeacherResourceInput = {
  access?: ResourceAccess;
  courseId: string;
  description?: string;
  href: string;
  lessonId?: string;
  moduleId?: string;
  title: string;
  type: ResourceType;
};

export type TeacherFileResourceInput = Omit<TeacherResourceInput, "href"> & {
  file: File;
};

export type TeacherResourceUpdateInput = Partial<TeacherResourceInput> & {
  id: string;
};

export type CourseCoverUploadInput = {
  courseId: string;
  file: File;
};

export type CourseCoverUploadResult = {
  coverImage: string;
  coverStoragePath: string;
};

export type TeacherResourceRepository = {
  createFileResource: (
    teacherId: string,
    input: TeacherFileResourceInput
  ) => Promise<TeacherResource>;
  createResource: (teacherId: string, input: TeacherResourceInput) => Promise<TeacherResource>;
  deleteResource: (teacherId: string, resourceId: string) => Promise<void>;
  getResources: (teacherId: string) => Promise<TeacherResource[]>;
  updateResource: (
    teacherId: string,
    input: TeacherResourceUpdateInput
  ) => Promise<TeacherResource>;
  uploadCourseCover: (
    teacherId: string,
    input: CourseCoverUploadInput
  ) => Promise<CourseCoverUploadResult>;
};
