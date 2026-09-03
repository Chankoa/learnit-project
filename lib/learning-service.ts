import "server-only";

import { getCurrentProfile } from "@/lib/auth/server";
import { calculateProgressCounts, type CourseProgressSummary } from "@/lib/course-progress";
import { getLmsDataSource } from "@/lib/lms";
import * as learningRepository from "@/lib/repositories/learningRepository";
import type { Course, CourseModule } from "@/types/course";
import type { Certificate, LearningDeliverable, Lesson } from "@/types/learning";
import type { Resource } from "@/types/resource";

export type LearningCourseState = {
  course: Course;
  enrollment?: learningRepository.EnrollmentRecord;
  modules: CourseModule[];
  lessons: Lesson[];
  completedLessonIds: string[];
  completedCount: number;
  totalLessons: number;
  percentage: number;
  learningTimeMinutes: number;
  currentLesson?: Lesson;
  nextLesson?: Lesson;
  resumeLesson?: Lesson;
  ctaLabel: string;
  ctaHref: string;
};

export type LearnerResourceItem = {
  resource: Resource;
  course: Course;
  favorite: boolean;
};

function getPercentage(completed: number, total: number) {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

function orderLessons(course: Course) {
  return course.modules
    .flatMap((module) => module.lessons.map((lesson) => ({ lesson, moduleOrder: module.order })))
    .sort((first, second) => first.moduleOrder - second.moduleOrder || first.lesson.order - second.lesson.order)
    .map(({ lesson }) => lesson);
}

function getAccessibleLessons(course: Course) {
  return orderLessons(course).filter((lesson) => lesson.status !== "locked");
}

export function getCourseProgress(completedLessonIds: Set<string>, totalLessons: number): CourseProgressSummary {
  return calculateProgressCounts(completedLessonIds.size, totalLessons);
}

function withLearningStatuses(
  modules: CourseModule[],
  completedLessonIds: Set<string>,
  progressLessonIds: Set<string>,
  currentLessonId?: string
) {
  return modules.map((module) => ({
    ...module,
    lessons: module.lessons.map((lesson) => {
      let status: Lesson["status"] = lesson.status;

      if (lesson.status === "locked") {
        status = "locked";
      } else if (completedLessonIds.has(lesson.id)) {
        status = "completed";
      } else if (lesson.id === currentLessonId || progressLessonIds.has(lesson.id)) {
        status = "in-progress";
      }

      return {
        ...lesson,
        status
      };
    })
  }));
}

function findLessonById(lessons: Lesson[], lessonId?: string) {
  return lessonId ? lessons.find((lesson) => lesson.id === lessonId) : undefined;
}

function sortProgressByActivity(progress: learningRepository.LessonProgressRecord[]) {
  return [...progress].sort(
    (first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
  );
}

function isMissingAuthError(error: unknown) {
  return error instanceof Error && error.message.includes("authenticated user");
}

async function getReadableCourse(courseId: string) {
  const course = await getLmsDataSource().getCourse({ id: courseId });

  if (!course) {
    throw new Error("The course could not be read or is not available.");
  }

  return course;
}

export async function getLearningCourseState(courseSlug: string): Promise<LearningCourseState | undefined> {
  const course = await getLmsDataSource().getCourse({ slug: courseSlug });

  if (!course) {
    return undefined;
  }

  let enrollment: learningRepository.EnrollmentRecord | undefined;
  let progress: learningRepository.LessonProgressRecord[] = [];

  try {
    enrollment = await learningRepository.getEnrollment(course.id);
    progress = enrollment ? await learningRepository.getLessonProgress(course.id) : [];
  } catch (error) {
    if (!isMissingAuthError(error)) {
      throw error;
    }
  }
  const completedLessonIds = new Set(progress.filter((item) => item.completed).map((item) => item.lessonId));
  const progressLessonIds = new Set(progress.map((item) => item.lessonId));
  const modules = withLearningStatuses(course.modules, completedLessonIds, progressLessonIds, enrollment?.currentLessonId);
  const lessons = orderLessons({ ...course, modules });
  const accessibleLessons = lessons.filter((lesson) => lesson.status !== "locked");
  const currentLesson = findLessonById(accessibleLessons, enrollment?.currentLessonId);
  const latestInProgress = sortProgressByActivity(progress)
    .map((item) => findLessonById(accessibleLessons, item.lessonId))
    .find((lesson): lesson is Lesson => Boolean(lesson && !completedLessonIds.has(lesson.id)));
  const nextLesson = accessibleLessons.find((lesson) => !completedLessonIds.has(lesson.id));
  const resumeLesson = currentLesson && !completedLessonIds.has(currentLesson.id)
    ? currentLesson
    : latestInProgress ?? nextLesson ?? accessibleLessons.at(-1);
  const courseProgress = getCourseProgress(
    new Set([...completedLessonIds].filter((lessonId) => accessibleLessons.some((lesson) => lesson.id === lessonId))),
    accessibleLessons.length
  );

  return {
    course,
    enrollment,
    modules,
    lessons,
    completedLessonIds: [...completedLessonIds],
    completedCount: courseProgress.completedCount,
    totalLessons: courseProgress.totalLessons,
    percentage: courseProgress.percentage,
    learningTimeMinutes: enrollment?.learningTimeMinutes ?? 0,
    currentLesson,
    nextLesson,
    resumeLesson,
    ctaLabel:
      enrollment?.status === "completed"
        ? "Revoir"
        : enrollment?.status === "not-started"
          ? "Commencer"
          : resumeLesson
            ? "Continuer"
            : "Voir le parcours",
    ctaHref: resumeLesson ? `/learn/${course.slug}/${resumeLesson.slug}` : `/learn/${course.slug}`
  };
}

export async function getLearnerDashboard() {
  const profile = await getCurrentProfile();

  if (!profile) {
    throw new Error("Learner dashboard requires an active profile.");
  }

  const enrollments = await learningRepository.getEnrollments();
  const courses = await getLmsDataSource().getCourses();
  const states = (await Promise.all(
    enrollments
      .filter((enrollment) => courses.some((course) => course.id === enrollment.courseId))
      .map((enrollment) => getLearningCourseState(courses.find((course) => course.id === enrollment.courseId)?.slug ?? ""))
  )).filter((state): state is LearningCourseState => Boolean(state));
  const activeCourses = states
    .filter((state) => state.enrollment?.status !== "completed")
    .sort((first, second) =>
      new Date(second.enrollment?.lastAccessedAt ?? 0).getTime() -
      new Date(first.enrollment?.lastAccessedAt ?? 0).getTime()
    );
  const completedLessons = states.reduce((total, state) => total + state.completedCount, 0);
  const totalLessons = states.reduce((total, state) => total + state.totalLessons, 0);
  const favoriteResources = await getFavoriteResources();

  return {
    profile,
    courses: states,
    activeCourses,
    nextCourse: activeCourses[0],
    globalProgress: {
      completedLessons,
      totalLessons,
      percentage: getPercentage(completedLessons, totalLessons),
      learningTimeMinutes: states.reduce((total, state) => total + state.learningTimeMinutes, 0)
    },
    favoriteResources,
    deliverables: [] as Array<{ deliverable: LearningDeliverable; course?: Course }>,
    certificates: [] as Array<{ certificate: Certificate; course?: Course }>
  };
}

export async function enrollInCourse(courseId: string) {
  await getReadableCourse(courseId);

  return learningRepository.enroll(courseId);
}

export async function startLesson(courseId: string, lessonId: string) {
  const enrollment = await learningRepository.getEnrollment(courseId);
  if (!enrollment) throw new Error("Enroll in the course before starting a lesson.");
  const course = await getReadableCourse(courseId);
  const lesson = getAccessibleLessons(course).find((item) => item.id === lessonId);
  if (!lesson) throw new Error("The lesson is not available in this course.");

  const now = new Date().toISOString();
  await learningRepository.upsertLessonProgress(courseId, lessonId, {});
  await learningRepository.updateEnrollment(courseId, {
    status: "in-progress",
    current_lesson_id: lessonId,
    started_at: enrollment.startedAt ?? now,
    last_accessed_at: now,
    completed_at: null
  });
}

export async function setLessonCompleted(courseId: string, lessonId: string, completed: boolean) {
  const enrollment = await learningRepository.getEnrollment(courseId);
  if (!enrollment) throw new Error("Enroll in the course before updating progress.");
  const course = await getReadableCourse(courseId);
  const accessibleLessons = getAccessibleLessons(course);
  const lesson = accessibleLessons.find((item) => item.id === lessonId);
  if (!lesson) throw new Error("The lesson is not available in this course.");

  await learningRepository.upsertLessonProgress(courseId, lessonId, {
    completed,
    completed_at: completed ? new Date().toISOString() : null
  });
  const progress = await learningRepository.getLessonProgress(courseId);
  const completedIds = new Set(
    progress
      .filter((item) => item.completed && accessibleLessons.some((lesson) => lesson.id === item.lessonId))
      .map((item) => item.lessonId)
  );
  const nextLesson = accessibleLessons.find((lesson) => !completedIds.has(lesson.id));
  const totalLessons = accessibleLessons.length;
  const allComplete = totalLessons > 0 && completedIds.size >= totalLessons;

  await learningRepository.updateEnrollment(courseId, {
    status: allComplete ? "completed" : "in-progress",
    current_lesson_id: completed ? nextLesson?.id ?? lessonId : lessonId,
    completed_at: allComplete ? new Date().toISOString() : null,
    last_accessed_at: new Date().toISOString()
  });
}

export async function recordLearningTime(courseId: string, lessonId: string, minutes: number) {
  if (!Number.isFinite(minutes) || minutes < 1) return;
  const enrollment = await learningRepository.getEnrollment(courseId);
  if (!enrollment) return;
  const course = await getReadableCourse(courseId);
  if (!getAccessibleLessons(course).some((lesson) => lesson.id === lessonId)) return;
  const progress = await learningRepository.getLessonProgressRecord(courseId, lessonId);
  await learningRepository.upsertLessonProgress(courseId, lessonId, {
    learning_time_minutes: (progress?.learningTimeMinutes ?? 0) + Math.min(Math.round(minutes), 120)
  });
  await learningRepository.updateEnrollment(courseId, {
    learning_time_minutes: enrollment.learningTimeMinutes + Math.min(Math.round(minutes), 120),
    last_accessed_at: new Date().toISOString()
  });
}

export async function getLessonNote(lessonId: string) {
  return learningRepository.getNote(lessonId);
}

export async function saveLessonNote(lessonId: string, content: string) {
  if (content.length > 5000) throw new Error("A note cannot exceed 5000 characters.");
  return learningRepository.saveNote(lessonId, content);
}

export async function getFavoriteResources(): Promise<Resource[]> {
  const [resourceIds, resources] = await Promise.all([
    learningRepository.getFavoriteResourceIds(),
    getLmsDataSource().getResources()
  ]);
  const favorites = new Set(resourceIds);
  return resources.filter((resource) => favorites.has(resource.id));
}

export async function getLearnerResources(): Promise<LearnerResourceItem[]> {
  const [courses, enrollments, favoriteIds] = await Promise.all([
    getLmsDataSource().getCourses(),
    learningRepository.getEnrollments(),
    learningRepository.getFavoriteResourceIds()
  ]);
  const enrolledCourseIds = new Set(enrollments.map((enrollment) => enrollment.courseId));
  const favorites = new Set(favoriteIds);

  return courses.flatMap((course) => {
    const resources = [
      ...(course.resources ?? []),
      ...course.modules.flatMap((module) => [
        ...(module.resources ?? []),
        ...module.lessons.flatMap((lesson) => lesson.resources ?? [])
      ])
    ];

    return resources
      .filter((resource) => resource.access === "free" || (resource.access === "enrolled" && enrolledCourseIds.has(course.id)))
      .map((resource) => ({ resource, course, favorite: favorites.has(resource.id) }));
  });
}

export async function setResourceFavorite(resourceId: string, favorite: boolean) {
  return learningRepository.setFavorite(resourceId, favorite);
}
