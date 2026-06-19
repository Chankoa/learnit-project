import { adminActivities } from "@/data/admin";
import {
  learnerCertificates,
  learnerDeliverables,
  learnerEnrollments
} from "@/data/learner";
import {
  courseProgress,
  learningDeliverables,
  recentResourceIds
} from "@/data/progress";
import {
  teacherActivities,
  teacherStudents
} from "@/data/teacher";

export function listCourseProgress() {
  return [...courseProgress];
}

export function listRecentResourceIds() {
  return [...recentResourceIds];
}

export function listLearningDeliverables() {
  return [...learningDeliverables];
}

export function listLearnerEnrollments() {
  return [...learnerEnrollments];
}

export function listLearnerDeliverables() {
  return [...learnerDeliverables];
}

export function listLearnerCertificates() {
  return [...learnerCertificates];
}

export function listTeacherStudents() {
  return [...teacherStudents];
}

export function listTeacherActivities() {
  return [...teacherActivities];
}

export function listAdminActivities() {
  return [...adminActivities];
}
