import "server-only";

import { teacherCourses } from "@/data/teacher";
import { domains } from "@/data/domains";
import type { TeacherCourseRepository } from "@/lib/repositories/teacherCourseRepository.types";

function getMockError() {
  return new Error("Le Teacher Studio persistant requiert NEXT_PUBLIC_DATA_SOURCE=supabase.");
}

export const mockTeacherCourseRepository: TeacherCourseRepository = {
  async getDomains() {
    return [...domains];
  },
  async createDomain() {
    throw getMockError();
  },
  async getTeacherCourses() {
    return [...teacherCourses].sort(
      (first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
    );
  },
  async getTeacherCourse(_teacherId, courseId) {
    return teacherCourses.find((course) => course.id === courseId);
  },
  async createCourse() {
    throw getMockError();
  },
  async updateCourse() {
    throw getMockError();
  },
  async createModule() {
    throw getMockError();
  },
  async updateModule() {
    throw getMockError();
  },
  async moveModule() {
    throw getMockError();
  },
  async deleteModule() {
    throw getMockError();
  },
  async createLesson() {
    throw getMockError();
  },
  async updateLesson() {
    throw getMockError();
  },
  async moveLesson() {
    throw getMockError();
  },
  async deleteLesson() {
    throw getMockError();
  },
  async publishCourse() {
    throw getMockError();
  }
};
