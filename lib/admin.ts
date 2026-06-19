import {
  findAdminDomain,
  getPlatformSettings as getPlatformSettingsFromRepository,
  listAdminCourses,
  listAdminDomains
} from "@/lib/repositories/courseRepository";
import {
  listAdminActivities
} from "@/lib/repositories/progressRepository";
import {
  findAdminUser,
  listAdminUsers
} from "@/lib/repositories/userRepository";
import type {
  AdminCourseStatus,
  AdminDomainStatus,
  AdminPublicationState,
  AdminUserRole,
  AdminUserStatus
} from "@/types/admin";

export const adminUserRoleLabels: Record<AdminUserRole, string> = {
  learner: "Apprenant",
  teacher: "Enseignant",
  admin: "Admin"
};

export const adminUserStatusLabels: Record<AdminUserStatus, string> = {
  active: "Actif",
  pending: "En attente",
  disabled: "Désactivé"
};

export const adminCourseStatusLabels: Record<AdminCourseStatus, string> = {
  draft: "Brouillon",
  pending: "En attente",
  published: "Publié",
  archived: "Archivé"
};

export const adminPublicationLabels: Record<AdminPublicationState, string> = {
  published: "Publiée",
  unpublished: "Non publiée",
  scheduled: "Planifiée"
};

export const adminDomainStatusLabels: Record<AdminDomainStatus, string> = {
  active: "Actif",
  inactive: "Inactif"
};

export function formatAdminDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function formatAdminDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function getAdminUsers() {
  return listAdminUsers().sort(
    (first, second) =>
      new Date(second.lastActivityAt).getTime() - new Date(first.lastActivityAt).getTime()
  );
}

export function getAdminDomains() {
  return listAdminDomains().sort((first, second) => first.order - second.order);
}

export function getAdminCourses() {
  return listAdminCourses().sort(
    (first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
  );
}

export function getAdminActivities() {
  return listAdminActivities().sort(
    (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  );
}

export function getPlatformSettings() {
  return getPlatformSettingsFromRepository();
}

export function getAdminUserById(userId: string) {
  return findAdminUser(userId);
}

export function getAdminDomainById(domainId: string) {
  return findAdminDomain(domainId);
}

export function getAdminCourseRows() {
  return getAdminCourses().map((course) => ({
    course,
    domain: getAdminDomainById(course.domainId),
    teacher: getAdminUserById(course.teacherId)
  }));
}

export type AdminCourseFilters = {
  status?: AdminCourseStatus;
  domainId?: string;
  teacherId?: string;
  publication?: AdminPublicationState;
};

export function getFilteredAdminCourseRows(filters: AdminCourseFilters) {
  return getAdminCourseRows().filter(({ course }) => {
    if (filters.status && course.status !== filters.status) {
      return false;
    }

    if (filters.domainId && course.domainId !== filters.domainId) {
      return false;
    }

    if (filters.teacherId && course.teacherId !== filters.teacherId) {
      return false;
    }

    if (filters.publication && course.publication !== filters.publication) {
      return false;
    }

    return true;
  });
}

export function getAdminTeachers() {
  return getAdminUsers()
    .filter((user) => user.role === "teacher")
    .sort((first, second) => first.name.localeCompare(second.name, "fr"));
}

export function getAdminMetrics() {
  const users = getAdminUsers();
  const courses = getAdminCourses();
  const domains = getAdminDomains();

  return {
    totalUsers: users.length,
    learnerCount: users.filter((user) => user.role === "learner").length,
    teacherCount: users.filter((user) => user.role === "teacher").length,
    publishedCourseCount: courses.filter((course) => course.status === "published").length,
    pendingCourseCount: courses.filter((course) => course.status === "pending").length,
    activeDomainCount: domains.filter((domain) => domain.status === "active").length
  };
}

export function getAdminDashboardData() {
  return {
    metrics: getAdminMetrics(),
    users: getAdminUsers(),
    courses: getAdminCourseRows(),
    domains: getAdminDomains(),
    activities: getAdminActivities()
  };
}

export function isAdminCourseStatus(value?: string): value is AdminCourseStatus {
  return Boolean(value && value in adminCourseStatusLabels);
}

export function isAdminPublicationState(value?: string): value is AdminPublicationState {
  return Boolean(value && value in adminPublicationLabels);
}
