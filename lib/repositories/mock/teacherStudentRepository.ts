import "server-only";

import type { TeacherStudentRepository } from "@/lib/repositories/teacherStudentRepository.types";

export const mockTeacherStudentRepository: TeacherStudentRepository = {
  async getEnrollmentRows() {
    // The real Teacher tracking surface must never fall back to demo learners.
    return [];
  }
};
