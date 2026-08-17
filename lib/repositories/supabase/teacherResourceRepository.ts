import "server-only";

import { createOptionalClient } from "@/lib/supabase/server";
import {
  assertCoverFile,
  assertResourceFile,
  buildCoverStoragePath,
  buildResourceStoragePath,
  courseCoverStorageBucket,
  resourceStorageBucket
} from "@/lib/storage/content-files";
import type {
  CourseCoverUploadInput,
  CourseCoverUploadResult,
  TeacherFileResourceInput,
  TeacherResourceInput,
  TeacherResourceRepository,
  TeacherResourceUpdateInput
} from "@/lib/repositories/teacherResourceRepository.types";
import type { ResourceAccess, ResourceType } from "@/types/resource";
import type { TeacherResource } from "@/types/teaching";

type SupabaseClient = NonNullable<Awaited<ReturnType<typeof createOptionalClient>>>;

type RelatedRow = {
  title: string | null;
};

type ResourceRow = {
  access: ResourceAccess;
  course_id: string;
  courses?: RelatedRow | RelatedRow[] | null;
  created_at: string;
  description: string | null;
  file_name: string | null;
  file_size: number | null;
  href: string;
  id: string;
  lesson_id: string | null;
  lessons?: RelatedRow | RelatedRow[] | null;
  mime_type: string | null;
  module_id: string | null;
  storage_bucket: string | null;
  storage_path: string | null;
  title: string;
  type: ResourceType;
  updated_at: string;
};

type CourseRow = {
  cover_storage_path: string | null;
  id: string;
  title: string;
};

type LessonRow = {
  course_id: string;
  id: string;
  module_id: string;
  title: string;
};

function getSingleRelation<T>(value?: T | T[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function mapResource(row: ResourceRow): TeacherResource {
  const course = getSingleRelation(row.courses);
  const lesson = getSingleRelation(row.lessons);

  return {
    id: row.id,
    title: row.title,
    type: row.type,
    href: row.href,
    description: row.description ?? undefined,
    courseId: row.course_id,
    courseTitle: course?.title ?? undefined,
    lessonId: row.lesson_id ?? undefined,
    lessonTitle: lesson?.title ?? undefined,
    moduleId: row.module_id ?? undefined,
    fileName: row.file_name ?? undefined,
    fileSize: row.file_size ?? undefined,
    mimeType: row.mime_type ?? undefined,
    storageBucket: row.storage_bucket ?? undefined,
    storagePath: row.storage_path ?? undefined,
    access: row.access,
    status: "published",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getClient() {
  const supabase = await createOptionalClient();

  if (!supabase) {
    throw new Error("Supabase Teacher resources requires a configured Supabase client.");
  }

  return supabase;
}

async function getOwnedCourse(
  supabase: SupabaseClient,
  teacherId: string,
  courseId: string
): Promise<CourseRow> {
  const { data, error } = await supabase
    .from("courses")
    .select("id,title,cover_storage_path")
    .eq("id", courseId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (error) {
    throw new Error(`Lecture de la formation impossible : ${error.message}`);
  }

  if (!data) {
    throw new Error("Formation introuvable ou non modifiable.");
  }

  return data as CourseRow;
}

async function getLesson(
  supabase: SupabaseClient,
  courseId: string,
  lessonId?: string
): Promise<LessonRow | undefined> {
  if (!lessonId) {
    return undefined;
  }

  const { data, error } = await supabase
    .from("lessons")
    .select("id,title,course_id,module_id")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(`Lecture de la leçon impossible : ${error.message}`);
  }

  if (!data) {
    throw new Error("Leçon introuvable pour cette formation.");
  }

  return data as LessonRow;
}

async function getResources(teacherId: string): Promise<TeacherResource[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("resources")
    .select("id,title,type,href,description,file_name,file_size,mime_type,storage_bucket,storage_path,access,course_id,module_id,lesson_id,created_at,updated_at,courses!inner(title,teacher_id),lessons(title)")
    .eq("courses.teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Lecture des ressources impossible : ${error.message}`);
  }

  return (data as unknown as ResourceRow[]).map(mapResource);
}

async function insertResource(
  supabase: SupabaseClient,
  teacherId: string,
  input: TeacherResourceInput,
  fileMetadata?: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    storageBucket: string;
    storagePath: string;
  }
) {
  const lesson = await getLesson(supabase, input.courseId, input.lessonId);
  await getOwnedCourse(supabase, teacherId, input.courseId);

  const { data, error } = await supabase
    .from("resources")
    .insert({
      access: input.access ?? "enrolled",
      course_id: input.courseId,
      created_by: teacherId,
      description: input.description || null,
      file_name: fileMetadata?.fileName ?? null,
      file_size: fileMetadata?.fileSize ?? null,
      href: fileMetadata?.storagePath ?? input.href,
      lesson_id: input.lessonId || null,
      mime_type: fileMetadata?.mimeType ?? null,
      module_id: input.moduleId ?? lesson?.module_id ?? null,
      storage_bucket: fileMetadata?.storageBucket ?? null,
      storage_path: fileMetadata?.storagePath ?? null,
      title: input.title,
      type: input.type
    })
    .select("id,title,type,href,description,file_name,file_size,mime_type,storage_bucket,storage_path,access,course_id,module_id,lesson_id,created_at,updated_at,courses!inner(title),lessons(title)")
    .single();

  if (error) {
    throw new Error(`Création de la ressource impossible : ${error.message}`);
  }

  return mapResource(data as unknown as ResourceRow);
}

async function createResource(teacherId: string, input: TeacherResourceInput) {
  const supabase = await getClient();
  return insertResource(supabase, teacherId, input);
}

async function createFileResource(teacherId: string, input: TeacherFileResourceInput) {
  assertResourceFile(input.file);

  const supabase = await getClient();
  const lesson = await getLesson(supabase, input.courseId, input.lessonId);
  await getOwnedCourse(supabase, teacherId, input.courseId);
  const storagePath = buildResourceStoragePath(
    teacherId,
    input.courseId,
    input.lessonId,
    input.file.name,
    input.file.type
  );
  const fileBody = new Blob([await input.file.arrayBuffer()], { type: input.file.type });
  const { error: uploadError } = await supabase.storage
    .from(resourceStorageBucket)
    .upload(storagePath, fileBody, {
      contentType: input.file.type,
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Téléversement du fichier impossible : ${uploadError.message}`);
  }

  try {
    return await insertResource(
      supabase,
      teacherId,
      {
        ...input,
        href: storagePath,
        moduleId: input.moduleId ?? lesson?.module_id,
        type: input.type || "download"
      },
      {
        fileName: input.file.name,
        fileSize: input.file.size,
        mimeType: input.file.type,
        storageBucket: resourceStorageBucket,
        storagePath
      }
    );
  } catch (error) {
    await supabase.storage.from(resourceStorageBucket).remove([storagePath]);
    throw error;
  }
}

async function updateResource(teacherId: string, input: TeacherResourceUpdateInput) {
  const supabase = await getClient();
  const current = await readResource(supabase, teacherId, input.id);

  if (!current) {
    throw new Error("Ressource introuvable ou non modifiable.");
  }

  const nextCourseId = input.courseId ?? current.courseId;
  const lesson = await getLesson(supabase, nextCourseId, input.lessonId ?? current.lessonId);
  await getOwnedCourse(supabase, teacherId, nextCourseId);

  const { data, error } = await supabase
    .from("resources")
    .update({
      access: input.access ?? current.access ?? "enrolled",
      course_id: nextCourseId,
      description: input.description ?? current.description ?? null,
      href: input.href ?? current.href,
      lesson_id: input.lessonId ?? current.lessonId ?? null,
      module_id: input.moduleId ?? lesson?.module_id ?? current.moduleId ?? null,
      title: input.title ?? current.title,
      type: input.type ?? current.type
    })
    .eq("id", input.id)
    .select("id,title,type,href,description,file_name,file_size,mime_type,storage_bucket,storage_path,access,course_id,module_id,lesson_id,created_at,updated_at,courses!inner(title),lessons(title)")
    .single();

  if (error) {
    throw new Error(`Mise à jour de la ressource impossible : ${error.message}`);
  }

  return mapResource(data as unknown as ResourceRow);
}

async function readResource(
  supabase: SupabaseClient,
  teacherId: string,
  resourceId: string
) {
  const { data, error } = await supabase
    .from("resources")
    .select("id,title,type,href,description,file_name,file_size,mime_type,storage_bucket,storage_path,access,course_id,module_id,lesson_id,created_at,updated_at,courses!inner(title,teacher_id),lessons(title)")
    .eq("id", resourceId)
    .eq("courses.teacher_id", teacherId)
    .maybeSingle();

  if (error) {
    throw new Error(`Lecture de la ressource impossible : ${error.message}`);
  }

  return data ? mapResource(data as unknown as ResourceRow) : undefined;
}

async function deleteResource(teacherId: string, resourceId: string) {
  const supabase = await getClient();
  const resource = await readResource(supabase, teacherId, resourceId);

  if (!resource) {
    throw new Error("Ressource introuvable ou non modifiable.");
  }

  const { error } = await supabase
    .from("resources")
    .delete()
    .eq("id", resourceId);

  if (error) {
    throw new Error(`Suppression de la ressource impossible : ${error.message}`);
  }

  if (resource.storagePath) {
    const { error: removeError } = await supabase.storage
      .from(resource.storageBucket ?? resourceStorageBucket)
      .remove([resource.storagePath]);

    if (removeError) {
      throw new Error(`Ressource supprimée, mais nettoyage du fichier Storage à relancer : ${removeError.message}`);
    }
  }
}

async function uploadCourseCover(
  teacherId: string,
  input: CourseCoverUploadInput
): Promise<CourseCoverUploadResult> {
  assertCoverFile(input.file);

  const supabase = await getClient();
  const course = await getOwnedCourse(supabase, teacherId, input.courseId);
  const storagePath = buildCoverStoragePath(
    teacherId,
    input.courseId,
    input.file.name,
    input.file.type
  );
  const fileBody = new Blob([await input.file.arrayBuffer()], { type: input.file.type });
  const { error: uploadError } = await supabase.storage
    .from(courseCoverStorageBucket)
    .upload(storagePath, fileBody, {
      contentType: input.file.type,
      upsert: false
    });

  if (uploadError) {
    throw new Error(`Téléversement de la couverture impossible : ${uploadError.message}`);
  }

  const publicUrl = supabase.storage.from(courseCoverStorageBucket).getPublicUrl(storagePath).data.publicUrl;
  const { error: updateError } = await supabase
    .from("courses")
    .update({
      cover_file_size: input.file.size,
      cover_image: publicUrl,
      cover_mime_type: input.file.type,
      cover_storage_path: storagePath
    })
    .eq("id", input.courseId)
    .eq("teacher_id", teacherId);

  if (updateError) {
    await supabase.storage.from(courseCoverStorageBucket).remove([storagePath]);
    throw new Error(`Enregistrement de la couverture impossible : ${updateError.message}`);
  }

  if (course.cover_storage_path && course.cover_storage_path !== storagePath) {
    await supabase.storage.from(courseCoverStorageBucket).remove([course.cover_storage_path]);
  }

  return {
    coverImage: publicUrl,
    coverStoragePath: storagePath
  };
}

export const supabaseTeacherResourceRepository: TeacherResourceRepository = {
  createFileResource,
  createResource,
  deleteResource,
  getResources,
  updateResource,
  uploadCourseCover
};
