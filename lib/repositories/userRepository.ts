import { adminUsers } from "@/data/admin";
import { learnerProfile } from "@/data/learner";
import {
  learnerProfile as learningProfile
} from "@/data/progress";
import { teacherProfile } from "@/data/teacher";
import { users } from "@/data/users";
import type { User } from "@/types/user";

export function listUsers() {
  return [...users];
}

export function findUserById(userId: string) {
  return users.find((user) => user.id === userId);
}

export function listUsersByRole(role: User["role"]) {
  return users.filter((user) => user.role === role);
}

export function listAdminUsers() {
  return [...adminUsers];
}

export function findAdminUser(userId: string) {
  return adminUsers.find((user) => user.id === userId);
}

export function getLearnerProfile() {
  return learnerProfile;
}

export function getLearningProfile() {
  return learningProfile;
}

export function getTeacherProfile() {
  return teacherProfile;
}
