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
import type {
  CourseSource,
  CourseSourceExtractionStatus,
  CourseSourceKind,
  CourseSourceType
} from "@/types/forge-ai";

type SupabaseClient = NonNullable<Awaited<ReturnType<typeof createOptionalClient>>>;

type SourceRow = {
  course_id: string | null;
  created_at: string;
  extracted_content?: string | null;
  extraction_error: string | null;
  extraction_status: CourseSourceExtractionStatus;
  file_name: string | null;
  file_size: number | null;
  id: string;
  metadata: Record<string, unknown> | null;
  mime_type: string;
  original_url: string | null;
  source_kind: CourseSourceKind;
  storage_bucket: string | null;
  storage_path: string | null;
  teacher_id: string;
  title: string;
  type: CourseSourceType;
  updated_at: string;
};

const sourceSelect =
  "id,teacher_id,course_id,title,type,source_kind,original_url,file_name,storage_bucket,storage_path,mime_type,file_size,extraction_status,extraction_error,metadata,created_at,updated_at";
const sourceContentSelect = `${sourceSelect},extracted_content`;
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return uuidPattern.test(value);
}

function mapSource(row: SourceRow): CourseSource {
  return {
    courseId: row.course_id ?? undefined,
    createdAt: row.created_at,
    extractedContent: row.extracted_content ?? undefined,
    extractionError: row.extraction_error ?? undefined,
    extractionStatus: row.extraction_status,
    fileName: row.file_name ?? undefined,
    fileSize: row.file_size ?? undefined,
    id: row.id,
    metadata: row.metadata ?? undefined,
    mimeType: row.mime_type,
    originalUrl: row.original_url ?? undefined,
    sourceKind: row.source_kind,
    storageBucket: row.storage_bucket ?? undefined,
    storagePath: row.storage_path ?? undefined,
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
    .select(sourceContentSelect)
    .eq("teacher_id", teacherId)
    .in("id", sourceIds);

  if (error) {
    throw new Error(`Lecture des sources impossible : ${error.message}`);
  }

  return (data as SourceRow[]).map(mapSource);
}

async function createSource(teacherId: string, input: ForgeSourceInput) {
  const supabase = await getClient();
  await assertOwnedCourse(supabase, teacherId, input.courseId);

  if (input.kind === "url") {
    const { data, error } = await supabase
      .from("course_sources")
      .insert({
        course_id: input.courseId ?? null,
        extracted_content: input.content,
        extraction_error: null,
        extraction_status: "ready",
        file_name: null,
        file_size: null,
        metadata: {
          final_url: input.finalUrl,
          generated_for: input.courseId ? "existing_course" : "course_brief"
        },
        mime_type: input.mimeType,
        original_url: input.originalUrl,
        source_kind: "url",
        storage_bucket: null,
        storage_path: null,
        teacher_id: teacherId,
        title: input.title,
        type: "web"
      })
      .select(sourceSelect)
      .single();

    if (error) {
      throw new Error(`Enregistrement de la source web impossible : ${error.message}`);
    }

    return mapSource(data as SourceRow);
  }

  assertCourseSourceFile(input.file);

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
      original_url: null,
      source_kind: "file",
      storage_bucket: courseSourceBucket,
      storage_path: storagePath,
      teacher_id: teacherId,
      title: input.title?.trim() || input.file.name,
      type: getCourseSourceType(input.file),
      extraction_status: "ready"
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

  if (!source.storageBucket || !source.storagePath) {
    return;
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
