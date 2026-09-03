import "server-only";

export type TeacherEnrollmentStatus = "not-started" | "in-progress" | "completed";

export type TeacherStudentEnrollmentRow = {
  enrollmentId: string;
  learner: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  course: {
    id: string;
    title: string;
  };
  status: TeacherEnrollmentStatus;
  currentLesson?: {
    id: string;
    title: string;
  };
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
  learningTimeMinutes: number;
  lastActivityAt: string;
};

export type TeacherStudentRepository = {
  getEnrollmentRows: (teacherId: string) => Promise<TeacherStudentEnrollmentRow[]>;
};
