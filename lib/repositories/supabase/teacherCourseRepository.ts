import "server-only";

import { createOptionalClient } from "@/lib/supabase/server";
import type { CourseLevel, Domain } from "@/types/course";
import type { LessonType } from "@/types/learning";
import type {
  TeacherCourse,
  TeacherLesson,
  TeacherModule
} from "@/types/teaching";
import type {
  TeacherCourseInput,
  TeacherCourseRepository,
  TeacherLessonInput,
  TeacherModuleInput
} from "@/lib/repositories/teacherCourseRepository.types";

type SupabaseClient = NonNullable<Awaited<ReturnType<typeof createOptionalClient>>>;

type DomainRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string | null;
  display_order: number;
};

type CourseRow = {
  id: string;
  domain_id: string;
  teacher_id: string | null;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  level: CourseLevel;
  status: "draft" | "published" | "archived";
  visibility: "public" | "private" | "unlisted";
  availability: "complete" | "preview" | "coming-soon";
  cover_image: string | null;
  duration_minutes: number | null;
  format: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  domains: DomainRow | DomainRow[] | null;
};

type ModuleRow = {
  id: string;
  course_id: string;
  slug: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  display_order: number;
  status: "draft" | "published" | "locked";
  created_at: string;
  updated_at: string;
};

type LessonRow = {
  id: string;
  course_id: string;
  module_id: string;
  slug: string;
  title: string;
  description: string | null;
  type: LessonType;
  status: "draft" | "published" | "locked";
  duration_minutes: number | null;
  content: string | null;
  video_url: string | null;
  objectives: string[] | null;
  display_order: number;
  created_at: string;
  updated_at: string;
};

const courseSelect =
  "id,domain_id,teacher_id,slug,title,subtitle,description,level,status,visibility,availability,cover_image,duration_minutes,format,published_at,created_at,updated_at,domains(id,slug,name,description,icon,display_order)";
const moduleSelect =
  "id,course_id,slug,title,description,duration_minutes,display_order,status,created_at,updated_at";
const lessonSelect =
  "id,course_id,module_id,slug,title,description,type,status,duration_minutes,content,video_url,objectives,display_order,created_at,updated_at";

function normalizeDomainRelation(row: CourseRow): CourseRow & { domains: DomainRow | null } {
  return {
    ...row,
    domains: Array.isArray(row.domains) ? row.domains[0] ?? null : row.domains
  };
}

function mapDomain(row: DomainRow): Domain {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    icon: row.icon ?? undefined,
    order: row.display_order
  };
}

function mapLesson(row: LessonRow): TeacherLesson {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    type: row.type,
    durationMinutes: row.duration_minutes ?? 0,
    objectives: row.objectives ?? [],
    content: row.content ?? undefined,
    resourceIds: [],
    status: row.status === "published" ? "published" : "draft",
    order: row.display_order
  };
}

function mapModule(row: ModuleRow, lessons: TeacherLesson[]): TeacherModule {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    order: row.display_order,
    durationMinutes: row.duration_minutes ?? undefined,
    status: row.status === "published" ? "published" : "draft",
    lessons: lessons.sort((first, second) => first.order - second.order)
  };
}

function mapCourse(
  row: CourseRow & { domains: DomainRow | null },
  modules: TeacherModule[]
): TeacherCourse {
  if (!row.domains) {
    throw new Error(`La formation ${row.id} n'a pas de domaine lisible.`);
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    description: row.description,
    domain: mapDomain(row.domains),
    level: row.level,
    format: row.format ?? "Formation guidee",
    status: row.status === "published" ? "published" : "draft",
    objectives: [],
    audience: [],
    requirements: [],
    coverImage: row.cover_image ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? undefined,
    modules
  };
}

function slugify(value: string) {
  const slug = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);

  return slug || "formation";
}

function getSlugCandidate(baseSlug: string, attempt: number) {
  return attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
}

function isUniqueViolation(error: { code?: string } | null) {
  return error?.code === "23505";
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value: string) {
  return uuidPattern.test(value);
}

function assertUuid(value: string, label: string) {
  if (!isUuid(value)) {
    throw new Error(`${label} invalide.`);
  }
}

function getTeacherCourseDuration(course: TeacherCourse) {
  return course.modules.reduce(
    (total, module) =>
      total + module.lessons.reduce((moduleTotal, lesson) => moduleTotal + lesson.durationMinutes, 0),
    0
  );
}

async function getClient() {
  const supabase = await createOptionalClient();

  if (!supabase) {
    throw new Error("Supabase Teacher Studio requires a configured Supabase client.");
  }

  return supabase;
}

async function hydrateCourses(supabase: SupabaseClient, rows: CourseRow[]) {
  const courseRows = rows.map(normalizeDomainRelation);

  if (courseRows.length === 0) {
    return [];
  }

  const courseIds = courseRows.map((course) => course.id);
  const [{ data: moduleData, error: moduleError }, { data: lessonData, error: lessonError }] =
    await Promise.all([
      supabase
        .from("course_modules")
        .select(moduleSelect)
        .in("course_id", courseIds)
        .order("display_order"),
      supabase
        .from("lessons")
        .select(lessonSelect)
        .in("course_id", courseIds)
        .order("display_order")
    ]);

  if (moduleError || lessonError) {
    const error = moduleError ?? lessonError;
    throw new Error(`Lecture de la structure impossible : ${error?.message}`);
  }

  const modules = moduleData as ModuleRow[];
  const lessons = lessonData as LessonRow[];

  return courseRows.map((course) => {
    const courseModules = modules
      .filter((module) => module.course_id === course.id)
      .map((module) =>
        mapModule(
          module,
          lessons.filter((lesson) => lesson.module_id === module.id).map(mapLesson)
        )
      )
      .sort((first, second) => first.order - second.order);

    return mapCourse(course, courseModules);
  });
}

async function getDomains(): Promise<Domain[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("domains")
    .select("id,slug,name,description,icon,display_order")
    .eq("status", "active")
    .order("display_order");

  if (error) {
    throw new Error(`Lecture des domaines impossible : ${error.message}`);
  }

  return (data as DomainRow[]).map(mapDomain);
}

async function getTeacherCourses(teacherId: string): Promise<TeacherCourse[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("courses")
    .select(courseSelect)
    .eq("teacher_id", teacherId)
    .in("status", ["draft", "published"])
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Lecture des formations impossible : ${error.message}`);
  }

  return hydrateCourses(supabase, data as unknown as CourseRow[]);
}

async function getTeacherCourse(
  teacherId: string,
  courseId: string
): Promise<TeacherCourse | undefined> {
  if (!isUuid(courseId)) {
    return undefined;
  }

  const supabase = await getClient();
  const { data, error } = await supabase
    .from("courses")
    .select(courseSelect)
    .eq("id", courseId)
    .eq("teacher_id", teacherId)
    .maybeSingle();

  if (error) {
    throw new Error(`Lecture de la formation impossible : ${error.message}`);
  }

  if (!data) {
    return undefined;
  }

  return (await hydrateCourses(supabase, [data as unknown as CourseRow]))[0];
}

async function createCourse(teacherId: string, input: TeacherCourseInput): Promise<TeacherCourse> {
  const supabase = await getClient();
  const baseSlug = slugify(input.title);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { data, error } = await supabase
      .from("courses")
      .insert({
        teacher_id: teacherId,
        domain_id: input.domainId,
        slug: getSlugCandidate(baseSlug, attempt),
        title: input.title,
        subtitle: input.subtitle || null,
        description: input.description,
        level: input.level,
        status: "draft",
        visibility: "private",
        availability: "preview",
        cover_image: input.coverImage || null,
        format: input.format || null
      })
      .select("id")
      .single();

    if (!error && data) {
      const course = await getTeacherCourse(teacherId, data.id);
      if (!course) {
        throw new Error("Formation creee mais introuvable apres insertion.");
      }

      return course;
    }

    if (!isUniqueViolation(error)) {
      throw new Error(`Creation de la formation impossible : ${error?.message}`);
    }
  }

  throw new Error("Impossible de generer un slug unique pour cette formation.");
}

async function updateCourse(
  teacherId: string,
  courseId: string,
  input: TeacherCourseInput
): Promise<TeacherCourse> {
  assertUuid(courseId, "Formation");

  const supabase = await getClient();
  const { data, error } = await supabase
    .from("courses")
    .update({
      domain_id: input.domainId,
      title: input.title,
      subtitle: input.subtitle || null,
      description: input.description,
      level: input.level,
      cover_image: input.coverImage || null,
      format: input.format || null
    })
    .eq("id", courseId)
    .eq("teacher_id", teacherId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Mise a jour de la formation impossible : ${error.message}`);
  }

  if (!data) {
    throw new Error("Formation introuvable ou non modifiable.");
  }

  const course = await getTeacherCourse(teacherId, courseId);
  if (!course) {
    throw new Error("Formation introuvable apres mise a jour.");
  }

  return course;
}

async function createModule(
  teacherId: string,
  courseId: string,
  input: TeacherModuleInput
): Promise<TeacherModule> {
  assertUuid(courseId, "Formation");

  const supabase = await getClient();
  const course = await getTeacherCourse(teacherId, courseId);

  if (!course) {
    throw new Error("Formation introuvable ou non modifiable.");
  }

  const baseSlug = slugify(input.title);
  const nextOrder = course.modules.length + 1;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { data, error } = await supabase
      .from("course_modules")
      .insert({
        course_id: courseId,
        slug: getSlugCandidate(baseSlug, attempt),
        title: input.title,
        description: input.description || null,
        duration_minutes: input.durationMinutes ?? null,
        display_order: nextOrder,
        status: input.status ?? "draft"
      })
      .select(moduleSelect)
      .single();

    if (!error && data) {
      return mapModule(data as ModuleRow, []);
    }

    if (!isUniqueViolation(error)) {
      throw new Error(`Creation du module impossible : ${error?.message}`);
    }
  }

  throw new Error("Impossible de generer un slug unique pour ce module.");
}

async function updateModule(
  _teacherId: string,
  courseId: string,
  moduleId: string,
  input: TeacherModuleInput
): Promise<TeacherModule> {
  assertUuid(courseId, "Formation");
  assertUuid(moduleId, "Module");

  const supabase = await getClient();
  const { data, error } = await supabase
    .from("course_modules")
    .update({
      title: input.title,
      description: input.description || null,
      duration_minutes: input.durationMinutes ?? null,
      status: input.status ?? "draft"
    })
    .eq("id", moduleId)
    .eq("course_id", courseId)
    .select(moduleSelect)
    .maybeSingle();

  if (error) {
    throw new Error(`Mise a jour du module impossible : ${error.message}`);
  }

  if (!data) {
    throw new Error("Module introuvable ou non modifiable.");
  }

  return mapModule(data as ModuleRow, []);
}

async function moveModule(
  teacherId: string,
  courseId: string,
  moduleId: string,
  direction: -1 | 1
) {
  assertUuid(courseId, "Formation");
  assertUuid(moduleId, "Module");

  const course = await getTeacherCourse(teacherId, courseId);

  if (!course) {
    throw new Error("Formation introuvable ou non modifiable.");
  }

  const modules = [...course.modules].sort((first, second) => first.order - second.order);
  const index = modules.findIndex((module) => module.id === moduleId);
  const targetIndex = index + direction;

  if (index < 0 || targetIndex < 0 || targetIndex >= modules.length) {
    return;
  }

  const supabase = await getClient();
  const updates = modules.map((module, moduleIndex) => ({
    id: module.id,
    display_order:
      moduleIndex === index
        ? modules[targetIndex].order
        : moduleIndex === targetIndex
          ? modules[index].order
          : module.order
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from("course_modules")
      .update({ display_order: update.display_order })
      .eq("id", update.id)
      .eq("course_id", courseId);

    if (error) {
      throw new Error(`Reorganisation des modules impossible : ${error.message}`);
    }
  }
}

async function deleteModule(_teacherId: string, courseId: string, moduleId: string) {
  assertUuid(courseId, "Formation");
  assertUuid(moduleId, "Module");

  const supabase = await getClient();
  const { count, error: countError } = await supabase
    .from("lessons")
    .select("id", { count: "exact", head: true })
    .eq("module_id", moduleId)
    .eq("course_id", courseId);

  if (countError) {
    throw new Error(`Verification du module impossible : ${countError.message}`);
  }

  if ((count ?? 0) > 0) {
    throw new Error("Supprimez d'abord les lecons du module.");
  }

  const { error } = await supabase
    .from("course_modules")
    .delete()
    .eq("id", moduleId)
    .eq("course_id", courseId);

  if (error) {
    throw new Error(`Suppression du module impossible : ${error.message}`);
  }
}

async function createLesson(
  teacherId: string,
  courseId: string,
  moduleId: string,
  input: TeacherLessonInput
): Promise<TeacherLesson> {
  assertUuid(courseId, "Formation");
  assertUuid(moduleId, "Module");

  const course = await getTeacherCourse(teacherId, courseId);
  const module = course?.modules.find((item) => item.id === moduleId);

  if (!course || !module) {
    throw new Error("Module introuvable ou non modifiable.");
  }

  const supabase = await getClient();
  const baseSlug = slugify(`${course.slug ?? course.title}-${module.title}-${input.title}`);
  const nextOrder = module.lessons.length + 1;

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { data, error } = await supabase
      .from("lessons")
      .insert({
        course_id: courseId,
        module_id: moduleId,
        slug: getSlugCandidate(baseSlug, attempt),
        title: input.title,
        description: input.description || null,
        type: input.type,
        duration_minutes: input.durationMinutes ?? null,
        objectives: input.objectives ?? [],
        content: input.content || null,
        display_order: nextOrder,
        status: input.status ?? "draft"
      })
      .select(lessonSelect)
      .single();

    if (!error && data) {
      return mapLesson(data as LessonRow);
    }

    if (!isUniqueViolation(error)) {
      throw new Error(`Creation de la lecon impossible : ${error?.message}`);
    }
  }

  throw new Error("Impossible de generer un slug unique pour cette lecon.");
}

async function updateLesson(
  _teacherId: string,
  courseId: string,
  lessonId: string,
  input: TeacherLessonInput
): Promise<TeacherLesson> {
  assertUuid(courseId, "Formation");
  assertUuid(lessonId, "Lecon");

  const supabase = await getClient();
  const { data, error } = await supabase
    .from("lessons")
    .update({
      title: input.title,
      description: input.description || null,
      type: input.type,
      duration_minutes: input.durationMinutes ?? null,
      objectives: input.objectives ?? [],
      content: input.content || null,
      status: input.status ?? "draft"
    })
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .select(lessonSelect)
    .maybeSingle();

  if (error) {
    throw new Error(`Mise a jour de la lecon impossible : ${error.message}`);
  }

  if (!data) {
    throw new Error("Lecon introuvable ou non modifiable.");
  }

  return mapLesson(data as LessonRow);
}

async function moveLesson(
  teacherId: string,
  courseId: string,
  moduleId: string,
  lessonId: string,
  direction: -1 | 1
) {
  assertUuid(courseId, "Formation");
  assertUuid(moduleId, "Module");
  assertUuid(lessonId, "Lecon");

  const course = await getTeacherCourse(teacherId, courseId);
  const module = course?.modules.find((item) => item.id === moduleId);

  if (!course || !module) {
    throw new Error("Module introuvable ou non modifiable.");
  }

  const lessons = [...module.lessons].sort((first, second) => first.order - second.order);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  const targetIndex = index + direction;

  if (index < 0 || targetIndex < 0 || targetIndex >= lessons.length) {
    return;
  }

  const supabase = await getClient();
  const updates = lessons.map((lesson, lessonIndex) => ({
    id: lesson.id,
    display_order:
      lessonIndex === index
        ? lessons[targetIndex].order
        : lessonIndex === targetIndex
          ? lessons[index].order
          : lesson.order
  }));

  for (const update of updates) {
    const { error } = await supabase
      .from("lessons")
      .update({ display_order: update.display_order })
      .eq("id", update.id)
      .eq("module_id", moduleId)
      .eq("course_id", courseId);

    if (error) {
      throw new Error(`Reorganisation des lecons impossible : ${error.message}`);
    }
  }
}

async function deleteLesson(_teacherId: string, courseId: string, lessonId: string) {
  assertUuid(courseId, "Formation");
  assertUuid(lessonId, "Lecon");

  const supabase = await getClient();
  const { data, error: readError } = await supabase
    .from("lessons")
    .select("id,status")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (readError) {
    throw new Error(`Verification de la lecon impossible : ${readError.message}`);
  }

  if (!data) {
    throw new Error("Lecon introuvable ou non modifiable.");
  }

  if ((data as { status: string }).status !== "draft") {
    throw new Error("Seules les lecons en brouillon peuvent etre supprimees.");
  }

  const { error } = await supabase
    .from("lessons")
    .delete()
    .eq("id", lessonId)
    .eq("course_id", courseId);

  if (error) {
    throw new Error(`Suppression de la lecon impossible : ${error.message}`);
  }
}

async function publishCourse(teacherId: string, courseId: string, durationMinutes?: number) {
  assertUuid(courseId, "Formation");

  const course = await getTeacherCourse(teacherId, courseId);

  if (!course) {
    throw new Error("Formation introuvable ou non publiable.");
  }

  const supabase = await getClient();
  const [{ error: modulesError }, { error: lessonsError }] = await Promise.all([
    supabase
      .from("course_modules")
      .update({ status: "published" })
      .eq("course_id", courseId)
      .neq("status", "locked"),
    supabase
      .from("lessons")
      .update({ status: "published" })
      .eq("course_id", courseId)
      .neq("status", "locked")
  ]);

  if (modulesError || lessonsError) {
    const error = modulesError ?? lessonsError;
    throw new Error(`Publication de la structure impossible : ${error?.message}`);
  }

  const { error } = await supabase
    .from("courses")
    .update({
      status: "published",
      visibility: "public",
      availability: "complete",
      duration_minutes: durationMinutes ?? getTeacherCourseDuration(course),
      published_at: new Date().toISOString()
    })
    .eq("id", courseId)
    .eq("teacher_id", teacherId);

  if (error) {
    throw new Error(`Publication de la formation impossible : ${error.message}`);
  }
}

export const supabaseTeacherCourseRepository: TeacherCourseRepository = {
  getDomains,
  getTeacherCourses,
  getTeacherCourse,
  createCourse,
  updateCourse,
  createModule,
  updateModule,
  moveModule,
  deleteModule,
  createLesson,
  updateLesson,
  moveLesson,
  deleteLesson,
  publishCourse
};
