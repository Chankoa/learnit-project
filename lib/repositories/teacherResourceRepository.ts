import "server-only";

import { getConfiguredDataSource } from "@/lib/config/data-source";
import { mockTeacherResourceRepository } from "@/lib/repositories/mock/teacherResourceRepository";
import { supabaseTeacherResourceRepository } from "@/lib/repositories/supabase/teacherResourceRepository";
import type {
  CourseCoverUploadInput,
  TeacherFileResourceInput,
  TeacherResourceInput,
  TeacherResourceUpdateInput
} from "@/lib/repositories/teacherResourceRepository.types";

export type {
  CourseCoverUploadInput,
  CourseCoverUploadResult,
  TeacherFileResourceInput,
  TeacherResourceInput,
  TeacherResourceRepository,
  TeacherResourceUpdateInput
} from "@/lib/repositories/teacherResourceRepository.types";

function getTeacherResourceRepository() {
  return getConfiguredDataSource() === "supabase"
    ? supabaseTeacherResourceRepository
    : mockTeacherResourceRepository;
}

export const getTeacherResources = (teacherId: string) =>
  getTeacherResourceRepository().getResources(teacherId);

export const createResource = (teacherId: string, input: TeacherResourceInput) =>
  getTeacherResourceRepository().createResource(teacherId, input);

export const createFileResource = (teacherId: string, input: TeacherFileResourceInput) =>
  getTeacherResourceRepository().createFileResource(teacherId, input);

export const updateResource = (teacherId: string, input: TeacherResourceUpdateInput) =>
  getTeacherResourceRepository().updateResource(teacherId, input);

export const deleteResource = (teacherId: string, resourceId: string) =>
  getTeacherResourceRepository().deleteResource(teacherId, resourceId);

export const uploadCourseCover = (teacherId: string, input: CourseCoverUploadInput) =>
  getTeacherResourceRepository().uploadCourseCover(teacherId, input);
