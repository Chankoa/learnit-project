import type { User, UserRole } from "@/types/user";
import { isAdminRole } from "@/lib/auth/role-governance";

export type PermissionUser = Pick<User, "id" | "email" | "role" | "status"> | null | undefined;

export type PermissionCourse = {
  id?: string;
  createdBy?: string;
  teacherId?: string;
  teacherIds?: string[];
  instructorIds?: string[];
  instructors?: Array<{
    id?: string;
    email?: string;
  }>;
};

function isActiveUser(user: PermissionUser): user is NonNullable<PermissionUser> {
  return Boolean(user && user.status === "active");
}

export function hasRole(user: PermissionUser, role: UserRole) {
  return isActiveUser(user) && user.role === role;
}

export function canAccessLearnerArea(user: PermissionUser) {
  return hasRole(user, "learner");
}

export function canAccessTeacherArea(user: PermissionUser) {
  return hasRole(user, "teacher");
}

export function canAccessAdminArea(user: PermissionUser) {
  return hasRole(user, "admin");
}

export function canManageCourse(user: PermissionUser, course: PermissionCourse | null | undefined) {
  if (!isActiveUser(user) || !course) {
    return false;
  }

  if (isAdminRole(user.role)) {
    return true;
  }

  if (user.role !== "teacher") {
    return false;
  }

  return (
    course.createdBy === user.id ||
    course.teacherId === user.id ||
    Boolean(course.teacherIds?.includes(user.id)) ||
    Boolean(course.instructorIds?.includes(user.id)) ||
    Boolean(
      course.instructors?.some(
        (instructor) => instructor.id === user.id || instructor.email === user.email
      )
    )
  );
}

export function canPublishCourse(user: PermissionUser) {
  return isActiveUser(user) && (user.role === "teacher" || isAdminRole(user.role));
}
