export type AdminUserRole = "learner" | "teacher" | "admin";

export type AdminUserStatus = "active" | "pending" | "disabled";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  createdAt: string;
  lastActivityAt: string;
};

export type AdminCourseStatus = "draft" | "pending" | "published" | "archived";

export type AdminPublicationState = "published" | "unpublished" | "scheduled";

export type AdminCourse = {
  id: string;
  title: string;
  domainId: string;
  teacherId: string;
  status: AdminCourseStatus;
  publication: AdminPublicationState;
  learnerCount: number;
  moduleCount: number;
  lessonCount: number;
  updatedAt: string;
};

export type AdminDomainStatus = "active" | "inactive";

export type AdminDomain = {
  id: string;
  name: string;
  slug: string;
  status: AdminDomainStatus;
  courseCount: number;
  order: number;
  updatedAt: string;
};

export type AdminActivityType = "user" | "course" | "domain" | "settings";

export type AdminActivity = {
  id: string;
  type: AdminActivityType;
  label: string;
  actor: string;
  createdAt: string;
};

export type PlatformSettings = {
  identity: {
    name: string;
    tagline: string;
    supportEmail: string;
  };
  registration: {
    learnersEnabled: boolean;
    teachersRequireApproval: boolean;
    inviteOnly: boolean;
  };
  catalog: {
    showDraftPreviews: boolean;
    highlightNewCourses: boolean;
    defaultSort: "recent" | "popular" | "domain";
  };
  maintenance: {
    enabled: boolean;
    message: string;
  };
  certificates: {
    enabled: boolean;
    requireFullCompletion: boolean;
    issuerName: string;
  };
};
