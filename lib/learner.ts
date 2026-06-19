import {
  getCourseById,
  getCourseLessons,
  getCourseModules
} from "@/lib/courses";
import {
  listLearnerCertificates,
  listLearnerDeliverables,
  listLearnerEnrollments
} from "@/lib/repositories/progressRepository";
import { listLearnerResources } from "@/lib/repositories/resourceRepository";
import { getLearnerProfile as getLearnerProfileFromRepository } from "@/lib/repositories/userRepository";
import type { Course, CourseModule } from "@/types/course";
import type {
  Certificate,
  CertificateStatus,
  LearnerEnrollment,
  LearnerEnrollmentStatus,
  LearnerResource,
  LearnerResourceType,
  LearningDeliverable,
  Lesson
} from "@/types/learning";

export const learnerEnrollmentStatusLabels: Record<LearnerEnrollmentStatus, string> = {
  "in-progress": "En cours",
  completed: "Terminée",
  "not-started": "Non commencée"
};

export const learnerResourceTypeLabels: Record<LearnerResourceType, string> = {
  pdf: "PDF",
  template: "Template",
  exercise: "Exercice",
  "external-link": "Lien externe",
  checklist: "Checklist"
};

export const certificateStatusLabels: Record<CertificateStatus, string> = {
  obtained: "Obtenu",
  eligible: "Formation éligible",
  "in-progress": "En progression",
  "coming-soon": "Bientôt disponible"
};

export type LearnerModuleSummary = {
  module: CourseModule;
  completedCount: number;
  totalLessons: number;
  percentage: number;
  submittedExerciseCount: number;
  totalExerciseCount: number;
  learningTimeMinutes: number;
};

export type LearnerCourseSummary = {
  course: Course;
  enrollment: LearnerEnrollment;
  status: LearnerEnrollmentStatus;
  completedCount: number;
  totalLessons: number;
  percentage: number;
  learningTimeMinutes: number;
  exercisesSubmitted: number;
  exercisesTotal: number;
  currentLesson?: Lesson;
  nextLesson?: Lesson;
  ctaLabel: string;
  ctaHref: string;
  modules: LearnerModuleSummary[];
  completedLessons: Array<{
    lesson: Lesson;
    module: CourseModule;
  }>;
};

export type LearnerDeliverableSummary = {
  deliverable: LearningDeliverable;
  course?: Course;
};

export type LearnerCertificateSummary = {
  certificate: Certificate;
  course?: Course;
};

function getPercentage(completed: number, total: number) {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function getLessonModule(courseModules: CourseModule[], lessonId: string) {
  return courseModules.find((module) =>
    module.lessons.some((lesson) => lesson.id === lessonId)
  );
}

function getCourseAction(
  course: Course,
  enrollment: LearnerEnrollment,
  nextLesson?: Lesson
) {
  if (enrollment.status === "completed") {
    return {
      ctaLabel: "Revoir",
      ctaHref: `/formations/${course.slug}/curriculum`
    };
  }

  if (enrollment.status === "not-started") {
    return {
      ctaLabel: "Commencer",
      ctaHref: `/formations/${course.slug}/curriculum`
    };
  }

  return {
    ctaLabel: "Continuer",
    ctaHref: nextLesson
      ? `/learn/${course.slug}/${nextLesson.slug}`
      : `/learn/${course.slug}`
  };
}

function buildCourseSummary(enrollment: LearnerEnrollment): LearnerCourseSummary | undefined {
  const course = getCourseById(enrollment.courseId);

  if (!course) {
    return undefined;
  }

  const lessons = getCourseLessons(course.id);
  const modules = getCourseModules(course.id);
  const completedLessonIds = new Set(enrollment.completedLessonIds);
  const completedCount = lessons.filter((lesson) => completedLessonIds.has(lesson.id)).length;
  const currentLesson = enrollment.currentLessonId
    ? lessons.find((lesson) => lesson.id === enrollment.currentLessonId)
    : undefined;
  const nextLesson =
    enrollment.status === "completed"
      ? undefined
      : currentLesson ?? lessons.find((lesson) => !completedLessonIds.has(lesson.id));
  const moduleSummaries = modules.map((module) => {
    const progress = enrollment.moduleProgress.find((item) => item.moduleId === module.id);
    const moduleCompletedCount = module.lessons.filter((lesson) =>
      progress?.completedLessonIds.includes(lesson.id)
    ).length;

    return {
      module,
      completedCount: moduleCompletedCount,
      totalLessons: module.lessons.length,
      percentage: getPercentage(moduleCompletedCount, module.lessons.length),
      submittedExerciseCount: progress?.submittedExerciseCount ?? 0,
      totalExerciseCount: progress?.totalExerciseCount ?? 0,
      learningTimeMinutes: progress?.learningTimeMinutes ?? 0
    } satisfies LearnerModuleSummary;
  });
  const completedLessons = enrollment.completedLessonIds
    .map((lessonId) => {
      const lesson = lessons.find((item) => item.id === lessonId);
      const module = getLessonModule(modules, lessonId);

      return lesson && module ? { lesson, module } : undefined;
    })
    .filter((item): item is { lesson: Lesson; module: CourseModule } => Boolean(item));
  const action = getCourseAction(course, enrollment, nextLesson);

  return {
    course,
    enrollment,
    status: enrollment.status,
    completedCount,
    totalLessons: lessons.length,
    percentage: getPercentage(completedCount, lessons.length),
    learningTimeMinutes: enrollment.learningTimeMinutes,
    exercisesSubmitted: moduleSummaries.reduce(
      (total, module) => total + module.submittedExerciseCount,
      0
    ),
    exercisesTotal: moduleSummaries.reduce(
      (total, module) => total + module.totalExerciseCount,
      0
    ),
    currentLesson,
    nextLesson,
    ctaLabel: action.ctaLabel,
    ctaHref: action.ctaHref,
    modules: moduleSummaries,
    completedLessons
  };
}

export function formatLearningTime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}` : `${hours}h`;
}

export function formatLearnerDate(value?: string) {
  if (!value) {
    return "Jamais consulté";
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

export function getLearnerProfile() {
  return getLearnerProfileFromRepository();
}

export function getLearnerCourseSummaries(): LearnerCourseSummary[] {
  return listLearnerEnrollments()
    .map(buildCourseSummary)
    .filter((summary): summary is LearnerCourseSummary => Boolean(summary));
}

export function getLearnerGlobalProgress() {
  const summaries = getLearnerCourseSummaries();
  const completedLessons = summaries.reduce(
    (total, summary) => total + summary.completedCount,
    0
  );
  const totalLessons = summaries.reduce((total, summary) => total + summary.totalLessons, 0);
  const exercisesSubmitted = summaries.reduce(
    (total, summary) => total + summary.exercisesSubmitted,
    0
  );
  const exercisesTotal = summaries.reduce((total, summary) => total + summary.exercisesTotal, 0);
  const learningTimeMinutes = summaries.reduce(
    (total, summary) => total + summary.learningTimeMinutes,
    0
  );

  return {
    completedLessons,
    totalLessons,
    percentage: getPercentage(completedLessons, totalLessons),
    exercisesSubmitted,
    exercisesTotal,
    learningTimeMinutes
  };
}

export function getRecentLearnerResources(limit = 4) {
  return listLearnerResources()
    .filter((resource) => Boolean(resource.lastConsultedAt))
    .sort(
      (first, second) =>
        new Date(second.lastConsultedAt ?? 0).getTime() -
        new Date(first.lastConsultedAt ?? 0).getTime()
    )
    .slice(0, limit);
}

export function getLearnerDeliverableSummaries(): LearnerDeliverableSummary[] {
  return listLearnerDeliverables().map((deliverable) => ({
    deliverable,
    course: getCourseById(deliverable.courseId)
  }));
}

export function getLearnerCertificateSummaries(): LearnerCertificateSummary[] {
  return listLearnerCertificates().map((certificate) => ({
    certificate,
    course: getCourseById(certificate.courseId)
  }));
}

export function getLearnerDashboardData() {
  const courses = getLearnerCourseSummaries();
  const activeCourses = courses
    .filter((summary) => summary.status === "in-progress")
    .sort(
      (first, second) =>
        new Date(second.enrollment.lastAccessedAt ?? 0).getTime() -
        new Date(first.enrollment.lastAccessedAt ?? 0).getTime()
    );
  const deliverables = getLearnerDeliverableSummaries().filter(
    ({ deliverable }) => deliverable.status !== "submitted"
  );

  return {
    learner: getLearnerProfile(),
    courses,
    activeCourses,
    nextCourse: activeCourses[0],
    globalProgress: getLearnerGlobalProgress(),
    recentResources: getRecentLearnerResources(4),
    deliverables,
    certificates: getLearnerCertificateSummaries()
  };
}

export type LearnerResourceFilters = {
  courseId?: string;
  type?: LearnerResourceType;
  favoritesOnly?: boolean;
};

export function getLearnerResources(filters: LearnerResourceFilters = {}) {
  return listLearnerResources().filter((resource) => {
    if (filters.courseId && resource.courseId !== filters.courseId) {
      return false;
    }

    if (filters.type && resource.type !== filters.type) {
      return false;
    }

    if (filters.favoritesOnly && !resource.favorite) {
      return false;
    }

    return true;
  });
}

export function getLearnerResourceCourses() {
  const courseIds = Array.from(
    new Set(listLearnerResources().map((resource) => resource.courseId))
  );

  return courseIds
    .map((courseId) => getCourseById(courseId))
    .filter((course): course is Course => Boolean(course));
}

export function getCourseForLearnerResource(resource: LearnerResource) {
  return getCourseById(resource.courseId);
}

export function getLearnerResourceTypeOptions() {
  return Object.entries(learnerResourceTypeLabels).map(([value, label]) => ({
    value: value as LearnerResourceType,
    label
  }));
}
