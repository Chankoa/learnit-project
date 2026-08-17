import "server-only";

import { teacherResources } from "@/data/teacher";
import type { TeacherResourceRepository } from "@/lib/repositories/teacherResourceRepository.types";

function getMockError() {
  return new Error("Les ressources persistantes requièrent NEXT_PUBLIC_DATA_SOURCE=supabase.");
}

export const mockTeacherResourceRepository: TeacherResourceRepository = {
  async getResources() {
    return [...teacherResources].sort(
      (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    );
  },
  async createFileResource() {
    throw getMockError();
  },
  async createResource() {
    throw getMockError();
  },
  async deleteResource() {
    throw getMockError();
  },
  async updateResource() {
    throw getMockError();
  },
  async uploadCourseCover() {
    throw getMockError();
  }
};
