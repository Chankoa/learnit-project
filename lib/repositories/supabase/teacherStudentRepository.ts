import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { calculateCourseProgress } from "@/lib/course-progress";
import type {
  TeacherEnrollmentStatus,
  TeacherStudentEnrollmentRow,
  TeacherStudentRepository
} from "@/lib/repositories/teacherStudentRepository.types";
import { createOptionalClient } from "@/lib/supabase/server";

type CourseRow = { id: string; title: string };
type EnrollmentRow = {
  id: string;
  user_id: string;
  course_id: string;
  status: TeacherEnrollmentStatus;
  current_lesson_id: string | null;
  learning_time_minutes: number;
  started_at: string | null;
  last_accessed_at: string | null;
  created_at: string;
};
type ProfileRow = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
};
type LessonRow = { id: string; course_id: string; title: string; status: "draft" | "published" | "locked" };
type ProgressRow = { user_id: string; course_id: string; lesson_id: string; completed: boolean; updated_at: string };

async function getClient() {
  const supabase = await createOptionalClient();
  if (!supabase) throw new Error("Le suivi des apprenants requiert Supabase.");
  return supabase;
}

function latestIso(...values: Array<string | null | undefined>) {
  return values
    .filter((value): value is string => Boolean(value))
    .sort((first, second) => new Date(second).getTime() - new Date(first).getTime())[0];
}

async function readTeacherRows(supabase: SupabaseClient, teacherId: string) {
  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .select("id,title")
    .eq("teacher_id", teacherId);
  if (courseError) throw new Error(`Lecture des formations impossible : ${courseError.message}`);

  const courses = courseData as CourseRow[];
  if (courses.length === 0) return [];
  const courseIds = courses.map(({ id }) => id);

  const [enrollmentsResult, lessonsResult, progressResult] = await Promise.all([
    supabase
      .from("enrollments")
      .select("id,user_id,course_id,status,current_lesson_id,learning_time_minutes,started_at,last_accessed_at,created_at")
      .in("course_id", courseIds),
    supabase.from("lessons").select("id,course_id,title,status").in("course_id", courseIds),
    supabase
      .from("lesson_progress")
      .select("user_id,course_id,lesson_id,completed,updated_at")
      .in("course_id", courseIds)
  ]);

  const error = enrollmentsResult.error ?? lessonsResult.error ?? progressResult.error;
  if (error) throw new Error(`Lecture du suivi impossible : ${error.message}`);

  const enrollments = enrollmentsResult.data as EnrollmentRow[];
  if (enrollments.length === 0) return [];

  const learnerIds = [...new Set(enrollments.map(({ user_id }) => user_id))];
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("id,name,email,avatar_url")
    .in("id", learnerIds)
    .eq("role", "learner");
  if (profileError) throw new Error(`Lecture des profils apprenants impossible : ${profileError.message}`);

  return {
    courses,
    enrollments,
    lessons: lessonsResult.data as LessonRow[],
    progress: progressResult.data as ProgressRow[],
    profiles: profileData as ProfileRow[]
  };
}

export const supabaseTeacherStudentRepository: TeacherStudentRepository = {
  async getEnrollmentRows(teacherId) {
    const supabase = await getClient();
    const data = await readTeacherRows(supabase, teacherId);
    if (Array.isArray(data)) return [];

    const courseById = new Map(data.courses.map((course) => [course.id, course]));
    const profileById = new Map(data.profiles.map((profile) => [profile.id, profile]));
    const lessonById = new Map(data.lessons.map((lesson) => [lesson.id, lesson]));

    return data.enrollments.flatMap((enrollment): TeacherStudentEnrollmentRow[] => {
      const course = courseById.get(enrollment.course_id);
      const learner = profileById.get(enrollment.user_id);
      if (!course || !learner) return [];

      const accessibleLessonIds = data.lessons
        .filter((lesson) => lesson.course_id === course.id && lesson.status !== "locked")
        .map((lesson) => lesson.id);
      const progress = data.progress.filter(
        (item) => item.course_id === course.id && item.user_id === learner.id
      );
      const summary = calculateCourseProgress(
        progress.filter(({ completed }) => completed).map(({ lesson_id }) => lesson_id),
        accessibleLessonIds
      );
      const progressActivity = latestIso(...progress.map(({ updated_at }) => updated_at));
      const lastActivityAt = latestIso(
        enrollment.last_accessed_at,
        progressActivity,
        enrollment.started_at,
        enrollment.created_at
      );
      const currentLesson = enrollment.current_lesson_id
        ? lessonById.get(enrollment.current_lesson_id)
        : undefined;

      return [{
        enrollmentId: enrollment.id,
        learner: {
          id: learner.id,
          name: learner.name,
          email: learner.email,
          avatarUrl: learner.avatar_url ?? undefined
        },
        course,
        status: enrollment.status,
        currentLesson: currentLesson ? { id: currentLesson.id, title: currentLesson.title } : undefined,
        completedLessons: summary.completedCount,
        totalLessons: summary.totalLessons,
        progressPercentage: summary.percentage,
        learningTimeMinutes: enrollment.learning_time_minutes,
        lastActivityAt
      }];
    }).sort((first, second) =>
      new Date(second.lastActivityAt).getTime() - new Date(first.lastActivityAt).getTime()
    );
  }
};
