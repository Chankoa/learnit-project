import "server-only";

import {
  assertCourseSourceFile,
  buildCourseSourcePath,
  courseSourceBucket,
  getCourseSourceType
} from "@/lib/forge-ai/source-files";
import { createOptionalClient } from "@/lib/supabase/server";
import type {
  ForgeSourceInput,
  ForgeSourceRepository
} from "@/lib/repositories/forgeSourceRepository.types";
import type { CourseSource, CourseSourceType } from "@/types/forge-ai";

type SupabaseClient = NonNullable<Awaited<ReturnType<typeof createOptionalClient>>>;

type SourceRow = {
  course_id: string | null;
  created_at: string;
  file_name: string;
  file_size: number;
  id: string;
  metadata: Record<string, unknown> | null;
  mime_type: string;
  storage_bucket: string;
  storage_path: string;
  teacher_id: string;
  title: string;
  type: CourseSourceType;
  updated_at: string;
};

const sourceSelect =
  "id,teacher_id,course_id,title,type,file_name,storage_bucket,storage_path,mime_type,file_size,metadata,created_at,updated_at";
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return uuidPattern.test(value);
}

function mapSource(row: SourceRow): CourseSource {
  return {
    courseId: row.course_id ?? undefined,
    createdAt: row.created_at,
    fileName: row.file_name,
    fileSize: row.file_size,
    id: row.id,
    metadata: row.metadata ?? undefined,
    mimeType: row.mime_type,
    storageBucket: row.storage_bucket,
    storagePath: row.storage_path,
    teacherId: row.teacher_id,
    title: row.title,
    type: row.type,
    updatedAt: row.updated_at
  };
}

async function getClient() {
  const supabase = await createOptionalClient();

  if (!supabase) {
    throw new Error("Supabase Forge sources requires a configured Supabase client.");
  }

  return supabase;
}

async function assertOwnedCourse(
  supabase: SupabaseClient,
  teacherId: string,
  courseId?: string
) {
  if (!courseId) {
    return;
  }

  if (!isUuid(courseId)) {
    throw new Error("Formation invalide.");
  }

  const { data, error } = await supabase
    .from("courses")
    .select("id")
    .eq("id", courseId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (error) {
    throw new Error(`Vérification de la formation impossible : ${error.message}`);
  }

  if (!data) {
    throw new Error("Formation introuvable ou non modifiable.");
  }
}

async function getSources(teacherId: string, courseId?: string) {
  if (courseId && !isUuid(courseId)) {
    return [];
  }

  const supabase = await getClient();
  let query = supabase
    .from("course_sources")
    .select(sourceSelect)
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (courseId) {
    query = query.eq("course_id", courseId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Lecture des sources impossible : ${error.message}`);
  }

  return (data as SourceRow[]).map(mapSource);
}

async function getSourcesByIds(teacherId: string, sourceIds: string[]) {
  if (sourceIds.length === 0) {
    return [];
  }

  const supabase = await getClient();
  const { data, error } = await supabase
    .from("course_sources")
    .select(sourceSelect)
    .eq("teacher_id", teacherId)
    .in("id", sourceIds);

  if (error) {
    throw new Error(`Lecture des sources impossible : ${error.message}`);
  }

  return (data as SourceRow[]).map(mapSource);
}

async function createSource(teacherId: string, input: ForgeSourceInput) {
  assertCourseSourceFile(input.file);

  const supabase = await getClient();
  await assertOwnedCourse(supabase, teacherId, input.courseId);

  const storagePath = buildCourseSourcePath(
    teacherId,
    input.courseId,
    input.file.name,
    input.file.type || "text/plain"
  );
  const fileBody = new Blob([await input.file.arrayBuffer()], {
    type: input.file.type || "text/plain"
  });
  const { error: uploadError } = await supabase.storage
    .from(courseSourceBucket)
    .upload(storagePath, fileBody, {
      contentType: input.file.type || "text/plain",
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Téléversement de la source impossible : ${uploadError.message}`);
  }

  const { data, error } = await supabase
    .from("course_sources")
    .insert({
      course_id: input.courseId ?? null,
      file_name: input.file.name,
      file_size: input.file.size,
      metadata: {
        generated_for: input.courseId ? "existing_course" : "course_brief"
      },
      mime_type: input.file.type || "text/plain",
      storage_bucket: courseSourceBucket,
      storage_path: storagePath,
      teacher_id: teacherId,
      title: input.title?.trim() || input.file.name,
      type: getCourseSourceType(input.file)
    })
    .select(sourceSelect)
    .single();

  if (error) {
    await supabase.storage.from(courseSourceBucket).remove([storagePath]);
    throw new Error(`Enregistrement de la source impossible : ${error.message}`);
  }

  return mapSource(data as SourceRow);
}

async function attachSourcesToCourse(
  teacherId: string,
  sourceIds: string[],
  courseId: string
) {
  if (sourceIds.length === 0) {
    return;
  }

  const supabase = await getClient();
  await assertOwnedCourse(supabase, teacherId, courseId);

  const { error } = await supabase
    .from("course_sources")
    .update({ course_id: courseId })
    .eq("teacher_id", teacherId)
    .in("id", sourceIds);

  if (error) {
    throw new Error(`Rattachement des sources impossible : ${error.message}`);
  }
}

async function deleteSource(teacherId: string, sourceId: string) {
  const supabase = await getClient();
  const sources = await getSourcesByIds(teacherId, [sourceId]);
  const source = sources[0];

  if (!source) {
    throw new Error("Source introuvable ou non modifiable.");
  }

  const { error } = await supabase
    .from("course_sources")
    .delete()
    .eq("id", sourceId)
    .eq("teacher_id", teacherId);

  if (error) {
    throw new Error(`Suppression de la source impossible : ${error.message}`);
  }

  const { error: removeError } = await supabase.storage
    .from(source.storageBucket)
    .remove([source.storagePath]);

  if (removeError) {
    throw new Error(`Source supprimée, nettoyage Storage à relancer : ${removeError.message}`);
  }
}

export const supabaseForgeSourceRepository: ForgeSourceRepository = {
  attachSourcesToCourse,
  createSource,
  deleteSource,
  getSources,
  getSourcesByIds
};
