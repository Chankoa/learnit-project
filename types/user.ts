export type UserRole = "visitor" | "learner" | "teacher" | "admin";

export type UserStatus = "active" | "pending" | "disabled";

export type LearnerProfile = {
  userId: string;
  enrolledCourseIds: string[];
  completedCourseIds: string[];
  currentCourseId?: string;
  learningGoal?: string;
  totalLearningMinutes: number;
  certificateIds: string[];
};

export type TeacherProfile = {
  userId: string;
  displayName: string;
  bio?: string;
  expertiseDomains: string[];
  courseIds: string[];
  publishedCourseCount: number;
  learnerCount: number;
};

export type AdminProfile = {
  userId: string;
  permissions: string[];
  supervisedDomainIds: string[];
  notes?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastActiveAt: string;
  avatar?: string;
  learnerProfile?: LearnerProfile;
  teacherProfile?: TeacherProfile;
  adminProfile?: AdminProfile;
};
