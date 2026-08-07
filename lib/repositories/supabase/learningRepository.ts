import "server-only";

import { createOptionalClient } from "@/lib/supabase/server";

export type EnrollmentRecord = {
  id: string;
  courseId: string;
  status: "not-started" | "in-progress" | "completed";
  currentLessonId?: string;
  learningTimeMinutes: number;
  startedAt?: string;
  completedAt?: string;
  lastAccessedAt?: string;
};

export type LessonProgressRecord = {
  lessonId: string;
  courseId: string;
  completed: boolean;
  completedAt?: string;
  learningTimeMinutes: number;
  updatedAt: string;
};

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
    completed: row.completed,
    completedAt: row.completed_at ?? undefined,
    learningTimeMinutes: row.learning_time_minutes,
    updatedAt: row.updated_at
  };
}

export async function getEnrollments(): Promise<EnrollmentRecord[]> {
  const { supabase } = await getClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("id,course_id,status,current_lesson_id,learning_time_minutes,started_at,completed_at,last_accessed_at")
    .order("last_accessed_at", { ascending: false, nullsFirst: false });

  if (error) {
    throw new Error(`Unable to read enrollments: ${error.message}`);
  }

  return (data as EnrollmentRow[]).map(mapEnrollment);
}

export async function getEnrollment(courseId: string): Promise<EnrollmentRecord | undefined> {
  const { supabase } = await getClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("id,course_id,status,current_lesson_id,learning_time_minutes,started_at,completed_at,last_accessed_at")
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to read enrollment: ${error.message}`);
  }

  return data ? mapEnrollment(data as EnrollmentRow) : undefined;
}

export async function enroll(courseId: string): Promise<EnrollmentRecord> {
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
    throw new Error(`Unable to create enrollment: ${error.message}`);
  }

  return mapEnrollment(data as EnrollmentRow);
}

export async function unenroll(courseId: string) {
  const { supabase } = await getClient();
  const { error } = await supabase.from("enrollments").delete().eq("course_id", courseId);

  if (error) {
    throw new Error(`Unable to remove enrollment: ${error.message}`);
  }
}

export async function updateEnrollment(
  courseId: string,
  values: Partial<{
    status: EnrollmentRecord["status"];
    current_lesson_id: string | null;
    learning_time_minutes: number;
    started_at: string | null;
    completed_at: string | null;
    last_accessed_at: string | null;
  }>
) {
  const { supabase } = await getClient();
  const { error } = await supabase.from("enrollments").update(values).eq("course_id", courseId);

  if (error) {
    throw new Error(`Unable to update enrollment: ${error.message}`);
  }
}

export async function getLessonProgress(courseId: string): Promise<LessonProgressRecord[]> {
  const { supabase } = await getClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id,course_id,completed,completed_at,learning_time_minutes,updated_at")
    .eq("course_id", courseId);

  if (error) {
    throw new Error(`Unable to read lesson progress: ${error.message}`);
  }

  return (data as LessonProgressRow[]).map(mapLessonProgress);
}

export async function getLessonProgressRecord(courseId: string, lessonId: string) {
  const { supabase } = await getClient();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_id,course_id,completed,completed_at,learning_time_minutes,updated_at")
    .eq("course_id", courseId)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to read lesson progress: ${error.message}`);
  }

  return data ? mapLessonProgress(data as LessonProgressRow) : undefined;
}

export async function upsertLessonProgress(
  courseId: string,
  lessonId: string,
  values: Partial<{ completed: boolean; completed_at: string | null; learning_time_minutes: number }>
) {
  const existing = await getLessonProgressRecord(courseId, lessonId);
  const { supabase, userId } = await getClient();
  const payload = {
    user_id: userId,
    course_id: courseId,
    lesson_id: lessonId,
    ...values,
    ...(existing ? {} : { completed: false, learning_time_minutes: 0 })
  };
  const { error } = await supabase
    .from("lesson_progress")
    .upsert(payload, { onConflict: "user_id,lesson_id" });

  if (error) {
    throw new Error(`Unable to save lesson progress: ${error.message}`);
  }
}

export async function getNote(lessonId: string) {
  const { supabase } = await getClient();
  const { data, error } = await supabase.from("notes").select("content").eq("lesson_id", lessonId).maybeSingle();

  if (error) {
    throw new Error(`Unable to read note: ${error.message}`);
  }

  return data?.content ?? "";
}

export async function saveNote(lessonId: string, content: string) {
  const { supabase, userId } = await getClient();

  if (!content.trim()) {
    const { error } = await supabase.from("notes").delete().eq("lesson_id", lessonId);
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

export async function getFavoriteResourceIds() {
  const { supabase } = await getClient();
  const { data, error } = await supabase.from("favorites").select("resource_id");

  if (error) {
    throw new Error(`Unable to read favorites: ${error.message}`);
  }

  return (data as Array<{ resource_id: string }>).map((favorite) => favorite.resource_id);
}

export async function setFavorite(resourceId: string, favorite: boolean) {
  const { supabase, userId } = await getClient();

  if (!favorite) {
    const { error } = await supabase.from("favorites").delete().eq("resource_id", resourceId);
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