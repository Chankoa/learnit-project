import "server-only";

import { createOptionalClient } from "@/lib/supabase/server";
import type {
  EnrollmentRecord,
  EnrollmentUpdate,
  LearningRepository,
  LessonProgressRecord,
  LessonProgressUpdate
} from "@/lib/repositories/learningRepository.types";

type EnrollmentRow = {
  id: string;
  course_id: string;
  status: EnrollmentRecord["status"];
  current_lesson_id: string | null;
  learning_time_minutes: number;
  started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string | null;
};

type LessonProgressRow = {
  lesson_id: string;
  course_id: string;
  completed: boolean;
  completed_at: string | null;
  learning_time_minutes: number;
  created_at: string;
  updated_at: string;
};

async function getClient() {
  const supabase = await createOptionalClient();

  if (!supabase) {
    throw new Error("Learner state requires a configured Supabase client.");
  }

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error("Learner state requires an authenticated user.");
  }

  return { supabase, userId: data.user.id };
}

function mapEnrollment(row: EnrollmentRow): EnrollmentRecord {
  return {
    id: row.id,
    courseId: row.course_id,
    status: row.status,
    currentLessonId: row.current_lesson_id ?? undefined,
    learningTimeMinutes: row.learning_time_minutes,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    lastAccessedAt: row.last_accessed_at ?? undefined
  };
}

function mapLessonProgress(row: LessonProgressRow): LessonProgressRecord {
  return {
    lessonId: row.lesson_id,
    courseId: row.course_id,
    status: row.completed ? "completed" : "in_progress",
    completed: row.completed,
    completedAt: row.completed_at ?? undefined,
    learningTimeMinutes: row.learning_time_minutes,
    startedAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getEnrollments(): Promise<EnrollmentRecord[]> {
  const { supabase, userId } = await getClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("id,course_id,status,current_lesson_id,learning_time_minutes,started_at,completed_at,last_accessed_at")
    .eq("user_id", userId)
    .order("last_accessed_at", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(`Unable to read enrollments: ${error.message}`);
  }

  return (data as EnrollmentRow[]).map(mapEnrollment);
}

async function getEnrollment(courseId: string): Promise<EnrollmentRecord | undefined> {
  const { supabase, userId } = await getClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("id,course_id,status,current_lesson_id,learning_time_minutes,started_at,completed_at,last_accessed_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to read enrollment: ${error.message}`);
  }

  return data ? mapEnrollment(data as EnrollmentRow) : undefined;
}

async function enroll(courseId: string): Promise<EnrollmentRecord> {
  const existing = await getEnrollment(courseId);

  if (existing) {
    return existing;
  }

  const { supabase, userId } = await getClient();
  const { data, error } = await supabase
    .from("enrollments")
    .insert({ user_id: userId, course_id: courseId, status: "not-started" })
    .select("id,course_id,status,current_lesson_id,learning_time_minutes,started_at,completed_at,last_accessed_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      const duplicated = await getEnrollment(courseId);

      if (duplicated) {
        return duplicated;
      }
    }

    throw new Error(`Unable to create enrollment: ${error.message}`);
  }

  return mapEnrollment(data as EnrollmentRow);
}

async function unenroll(courseId: string) {
  const { supabase, userId } = await getClient();
  const { error } = await supabase
    .from("enrollments")
    .delete()
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (error) {
    throw new Error(`Unable to remove enrollment: ${error.message}`);
  }
}

async function updateEnrollment(courseId: string, values: EnrollmentUpdate) {
  const { supabase, userId } = await getClient();
  const { error } = await supabase
    .from("enrollments")
    .update(values)
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (error) {
    throw new Error(`Unable to update enrollment: ${error.message}`);
  }
}

async function getLessonProgress(courseId: string): Promise<LessonProgressRecord[]> {
  const { supabase, userId } = await getClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id,course_id,completed,completed_at,learning_time_minutes,created_at,updated_at")
    .eq("user_id", userId)
    .eq("course_id", courseId);

  if (error) {
    throw new Error(`Unable to read lesson progress: ${error.message}`);
  }

  return (data as LessonProgressRow[]).map(mapLessonProgress);
}

async function getLessonProgressRecord(courseId: string, lessonId: string) {
  const { supabase, userId } = await getClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id,course_id,completed,completed_at,learning_time_minutes,created_at,updated_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to read lesson progress: ${error.message}`);
  }

  return data ? mapLessonProgress(data as LessonProgressRow) : undefined;
}

async function upsertLessonProgress(
  courseId: string,
  lessonId: string,
  values: LessonProgressUpdate
) {
  const existing = await getLessonProgressRecord(courseId, lessonId);
  const { supabase, userId } = await getClient();
  const payload = {
    user_id: userId,
    course_id: courseId,
    lesson_id: lessonId,
    ...(existing ? {} : { completed: false, learning_time_minutes: 0 }),
    ...values
  };
  const { error } = await supabase
    .from("lesson_progress")
    .upsert(payload, { onConflict: "user_id,lesson_id" });

  if (error) {
    throw new Error(`Unable to save lesson progress: ${error.message}`);
  }
}

async function getNote(lessonId: string) {
  const { supabase, userId } = await getClient();
  const { data, error } = await supabase
    .from("notes")
    .select("content")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to read note: ${error.message}`);
  }

  return data?.content ?? "";
}

async function saveNote(lessonId: string, content: string) {
  const { supabase, userId } = await getClient();

  if (!content.trim()) {
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("user_id", userId)
      .eq("lesson_id", lessonId);
    if (error) throw new Error(`Unable to delete note: ${error.message}`);
    return;
  }

  const { error } = await supabase
    .from("notes")
    .upsert({ user_id: userId, lesson_id: lessonId, content: content.trim() }, { onConflict: "user_id,lesson_id" });

  if (error) {
    throw new Error(`Unable to save note: ${error.message}`);
  }
}

async function getFavoriteResourceIds() {
  const { supabase, userId } = await getClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("resource_id")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Unable to read favorites: ${error.message}`);
  }

  return (data as Array<{ resource_id: string }>).map((favorite) => favorite.resource_id);
}

async function setFavorite(resourceId: string, favorite: boolean) {
  const { supabase, userId } = await getClient();

  if (!favorite) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("resource_id", resourceId);
    if (error) throw new Error(`Unable to remove favorite: ${error.message}`);
    return;
  }

  const { error } = await supabase
    .from("favorites")
    .upsert({ user_id: userId, resource_id: resourceId }, { onConflict: "user_id,resource_id", ignoreDuplicates: true });

  if (error) {
    throw new Error(`Unable to save favorite: ${error.message}`);
  }
}

export const supabaseLearningRepository: LearningRepository = {
  getEnrollments,
  getEnrollment,
  enroll,
  unenroll,
  updateEnrollment,
  getLessonProgress,
  getLessonProgressRecord,
  upsertLessonProgress,
  getNote,
  saveNote,
  getFavoriteResourceIds,
  setFavorite
};
