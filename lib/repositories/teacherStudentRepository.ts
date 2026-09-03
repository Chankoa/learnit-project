import "server-only";

import { getConfiguredDataSource } from "@/lib/config/data-source";
import { mockTeacherStudentRepository } from "@/lib/repositories/mock/teacherStudentRepository";
import { supabaseTeacherStudentRepository } from "@/lib/repositories/supabase/teacherStudentRepository";

function getRepository() {
  return getConfiguredDataSource() === "supabase"
    ? supabaseTeacherStudentRepository
    : mockTeacherStudentRepository;
}

export const getTeacherEnrollmentRows = (teacherId: string) =>
  getRepository().getEnrollmentRows(teacherId);

export type {
  TeacherEnrollmentStatus,
  TeacherStudentEnrollmentRow
} from "@/lib/repositories/teacherStudentRepository.types";
