import {
  courseProgress as staticCourseProgress,
  learnerProfile,
  learningDeliverables,
  recentResourceIds
} from "@/data/progress";
import {
  getAllCourses,
  getCourseLessons,
  getNextLesson
} from "@/lib/courses";
import { getResources } from "@/lib/data-source";
import type { CourseProgress } from "@/types/learning";

type ProgressSource = {
  getProgress: () => CourseProgress[];
};

const staticProgressSource: ProgressSource = {
  getProgress: () => staticCourseProgress
};

function getProgressSource() {
  return staticProgressSource;
}

export function getAllCourseProgress() {
  return [...getProgressSource().getProgress()];
}

export function getCourseProgress(courseId: string) {
  return getAllCourseProgress().find((progress) => progress.courseId === courseId);
}

export function getLearnerProfile() {
  return learnerProfile;
}

export function getLearnerDashboardData() {
  const courses = getAllCourses();
  const progressRecords = getAllCourseProgress();

  const enrollments = progressRecords
    .map((progress) => {
      const course = courses.find((item) => item.id === progress.courseId);

      if (!course) {
        return undefined;
      }

      const lessons = getCourseLessons(course.id);
      const currentLesson = lessons.find((lesson) => lesson.id === progress.currentLessonId);
      const completedCount = progress.completedLessons.filter((lessonId) =>
        lessons.some((lesson) => lesson.id === lessonId)
      ).length;

      return {
        course,
        progress,
        lessons,
        currentLesson,
        nextLesson: currentLesson ? getNextLesson(course.id, currentLesson.id) : undefined,
        completedCount,
        totalLessons: lessons.length,
        percentage: lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0
      };
    })
    .filter((enrollment): enrollment is NonNullable<typeof enrollment> => Boolean(enrollment))
    .sort(
      (first, second) =>
        new Date(second.progress.lastAccessedAt).getTime() -
        new Date(first.progress.lastAccessedAt).getTime()
    );

  const completedLessons = enrollments.reduce(
    (total, enrollment) => total + enrollment.completedCount,
    0
  );
  const totalLessons = enrollments.reduce(
    (total, enrollment) => total + enrollment.totalLessons,
    0
  );
  const resources = getResources();

  return {
    learner: learnerProfile,
    enrollments,
    currentEnrollment: enrollments[0],
    globalProgress: {
      completedLessons,
      totalLessons,
      percentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
    },
    recentResources: recentResourceIds
      .map((resourceId) => resources.find((resource) => resource.id === resourceId))
      .filter((resource): resource is NonNullable<typeof resource> => Boolean(resource)),
    deliverables: learningDeliverables
  };
}
