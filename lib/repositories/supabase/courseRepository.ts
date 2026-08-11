import "server-only";

import { createOptionalClient } from "@/lib/supabase/server";
import type { Course, CourseModule, Domain } from "@/types/course";
import type { Lesson } from "@/types/learning";
import type { Resource } from "@/types/resource";

type CourseLookup = { id?: string; slug?: string };

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
  level: Course["level"];
  status: Course["status"];
  visibility: Course["visibility"];
  availability: Course["availability"];
  cover_image: string | null;
  duration_minutes: number | null;
  format: string | null;
  tags: string[] | null;
  published_at: string | null;
  updated_at: string;
  domains: DomainRow | null;
};

type CourseRowWithDomainRelation = Omit<CourseRow, "domains"> & {
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
};

type LessonRow = {
  id: string;
  course_id: string;
  module_id: string;
  slug: string;
  title: string;
  description: string | null;
  type: Lesson["type"];
  status: "draft" | "published" | "locked";
  duration_minutes: number | null;
  content_path: string | null;
  content: string | null;
  video_url: string | null;
  objectives: string[] | null;
  display_order: number;
};

type ResourceRow = {
  id: string;
  course_id: string | null;
  module_id: string | null;
  lesson_id: string | null;
  title: string;
  type: Resource["type"];
  href: string;
  description: string | null;
  file_name: string | null;
  access: Resource["access"] | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

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

function mapResource(row: ResourceRow): Resource {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    href: row.href,
    description: row.description ?? undefined,
    fileName: row.file_name ?? undefined,
    access: row.access ?? undefined,
    tags: row.tags ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapLesson(row: LessonRow, resources: Resource[]): Lesson {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    type: row.type,
    description: row.description ?? undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    status: row.status === "published" ? "available" : row.status === "locked" ? "locked" : "preview",
    contentPath: row.content_path ?? undefined,
    content: row.content ?? undefined,
    videoUrl: row.video_url ?? undefined,
    objectives: row.objectives ?? undefined,
    resources: resources.length > 0 ? resources : undefined,
    order: row.display_order
  };
}

function mapModule(row: ModuleRow, lessons: Lesson[], resources: Resource[]): CourseModule {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    status: row.status === "published" ? "available" : row.status === "locked" ? "locked" : "preview",
    lessons: lessons.sort((first, second) => first.order - second.order),
    resources: resources.length > 0 ? resources : undefined,
    order: row.display_order
  };
}

async function getClient() {
  const supabase = await createOptionalClient();

  if (!supabase) {
    throw new Error("Supabase LMS data source requires a configured Supabase client.");
  }

  return supabase;
}

export async function getDomains(): Promise<Domain[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("domains")
    .select("id,slug,name,description,icon,display_order")
    .order("display_order");

  if (error) {
    throw new Error(`Unable to read LMS domains: ${error.message}`);
  }

  return (data as DomainRow[]).map(mapDomain);
}

export async function getCourses(lookup?: CourseLookup): Promise<Course[]> {
  const supabase = await getClient();
  let courseQuery = supabase
    .from("courses")
    .select("id,domain_id,teacher_id,slug,title,subtitle,description,level,status,visibility,availability,cover_image,duration_minutes,format,tags,published_at,updated_at,domains(id,slug,name,description,icon,display_order)")
    .order("published_at", { ascending: false });

  if (lookup?.id) {
    courseQuery = courseQuery.eq("id", lookup.id);
  }

  if (lookup?.slug) {
    courseQuery = courseQuery.eq("slug", lookup.slug);
  }

  const { data: courseData, error: courseError } = await courseQuery;

  if (courseError) {
    throw new Error(`Unable to read LMS courses: ${courseError.message}`);
  }

  const courseRows = (courseData as unknown as CourseRowWithDomainRelation[]).map((course) => ({
    ...course,
    domains: Array.isArray(course.domains) ? course.domains[0] ?? null : course.domains
  }));

  if (courseRows.length === 0) {
    return [];
  }

  const courseIds = courseRows.map((course) => course.id);
  const [{ data: moduleData, error: moduleError }, { data: lessonData, error: lessonError }, { data: resourceData, error: resourceError }] = await Promise.all([
    supabase.from("course_modules").select("id,course_id,slug,title,description,duration_minutes,display_order,status").in("course_id", courseIds).order("display_order"),
    supabase.from("lessons").select("id,course_id,module_id,slug,title,description,type,status,duration_minutes,content_path,content,video_url,objectives,display_order").in("course_id", courseIds).order("display_order"),
    supabase.from("resources").select("id,course_id,module_id,lesson_id,title,type,href,description,file_name,access,tags,created_at,updated_at").in("course_id", courseIds)
  ]);

  if (moduleError || lessonError || resourceError) {
    const error = moduleError ?? lessonError ?? resourceError;
    throw new Error(`Unable to read LMS course relations: ${error?.message}`);
  }

  const modules = moduleData as ModuleRow[];
  const lessons = lessonData as LessonRow[];
  const resources = resourceData as ResourceRow[];

  return courseRows.map((course) => {
    if (!course.domains) {
      throw new Error(`LMS course ${course.id} has no readable domain.`);
    }

    const courseResources = resources
      .filter((resource) => resource.course_id === course.id && !resource.module_id && !resource.lesson_id)
      .map(mapResource);
    const courseModules = modules
      .filter((module) => module.course_id === course.id)
      .map((module) => {
        const moduleResources = resources
          .filter((resource) => resource.module_id === module.id && !resource.lesson_id)
          .map(mapResource);
        const moduleLessons = lessons
          .filter((lesson) => lesson.module_id === module.id)
          .map((lesson) => mapLesson(lesson, resources.filter((resource) => resource.lesson_id === lesson.id).map(mapResource)));

        return mapModule(module, moduleLessons, moduleResources);
      })
      .sort((first, second) => first.order - second.order);

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle ?? undefined,
      description: course.description,
      domain: mapDomain(course.domains),
      level: course.level,
      status: course.status,
      visibility: course.visibility,
      availability: course.availability,
      modules: courseModules,
      resources: courseResources.length > 0 ? courseResources : undefined,
      coverImage: course.cover_image ?? undefined,
      durationMinutes: course.duration_minutes ?? undefined,
      format: course.format ?? undefined,
      tags: course.tags ?? undefined,
      createdBy: course.teacher_id ?? "",
      publishedAt: course.published_at ?? undefined,
      updatedAt: course.updated_at
    };
  });
}

export async function getCourse(lookup: CourseLookup): Promise<Course | undefined> {
  return (await getCourses(lookup))[0];
}

export async function getModules(courseId?: string): Promise<CourseModule[]> {
  const courses = await getCourses(courseId ? { id: courseId } : undefined);
  return courses.flatMap((course) => course.modules);
}

export async function getLessons(courseId?: string): Promise<Lesson[]> {
  const modules = await getModules(courseId);
  return modules.flatMap((module) => module.lessons).sort((first, second) => first.order - second.order);
}
