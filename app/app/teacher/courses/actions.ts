"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createTeacherDomain,
  createTeacherCourse,
  createTeacherLesson,
  createTeacherLessonResource,
  createTeacherModule,
  deleteTeacherLesson,
  deleteTeacherResource,
  deleteTeacherModule,
  moveTeacherLesson,
  moveTeacherModule,
  publishTeacherCourse,
  unpublishTeacherCourse,
  updateTeacherCourse,
  updateTeacherLesson,
  updateTeacherModule,
  uploadTeacherLessonResource
} from "@/lib/teacher-service";
import type { Domain } from "@/types/course";

type CreateTeacherDomainActionResult =
  | {
      ok: true;
      domain: Domain;
      message: string;
    }
  | {
      ok: false;
      error: string;
    };

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Action impossible pour le moment.";
}

function withParams(path: string, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}

function getBuilderPath(
  courseId: string,
  params: Record<string, string | undefined> = {},
  canonicalCourseSlug?: string
) {
  return canonicalCourseSlug
    ? withParams(`/app/courses/${canonicalCourseSlug}`, { mode: "edit", ...params })
    : withParams(`/app/teacher/courses/${courseId}/builder`, params);
}

function getEditPath(courseId: string, params: Record<string, string | undefined> = {}) {
  return withParams(`/app/teacher/courses/${courseId}/edit`, params);
}

function revalidateTeacherCourse(courseId: string, courseSlug?: string) {
  revalidatePath("/app/teacher");
  revalidatePath("/app/teacher/courses");
  revalidatePath("/app/teacher/resources");
  revalidatePath(`/app/teacher/courses/${courseId}/edit`);
  revalidatePath(`/app/teacher/courses/${courseId}/builder`);
  revalidatePath("/app/courses");
  revalidatePath("/formations");

  if (courseSlug) {
    revalidatePath(`/formations/${courseSlug}`);
    revalidatePath(`/formations/${courseSlug}/curriculum`);
    revalidatePath(`/learn/${courseSlug}`);
    revalidatePath(`/app/courses/${courseSlug}`);
  }
}

export async function createTeacherDomainAction(name: string): Promise<CreateTeacherDomainActionResult> {
  try {
    const domain = await createTeacherDomain(name);
    revalidatePath("/app/teacher/courses/new");
    revalidatePath("/app/teacher/courses");

    return {
      ok: true,
      domain,
      message: "Domaine disponible et sélectionné."
    };
  } catch (error) {
    return {
      ok: false,
      error: getErrorMessage(error)
    };
  }
}

export async function createTeacherCourseAction(formData: FormData) {
  let destination = "/app/teacher/courses/new";

  try {
    const course = await createTeacherCourse(formData);
    revalidateTeacherCourse(course.id, course.slug);
    destination = withParams(`/app/courses/${course.slug}`, { mode: "edit", message: "Parcours créé en brouillon." });
  } catch (error) {
    destination = withParams("/app/teacher/courses/new", { error: getErrorMessage(error) });
  }

  redirect(destination);
}

export async function updateTeacherCourseAction(courseId: string, formData: FormData) {
  let destination = getEditPath(courseId);

  try {
    const course = await updateTeacherCourse(courseId, formData);
    revalidateTeacherCourse(course.id, course.slug);
    destination = getEditPath(course.id, { message: "Informations enregistrées." });
  } catch (error) {
    destination = getEditPath(courseId, { error: getErrorMessage(error) });
  }

  redirect(destination);
}

export async function createTeacherModuleAction(courseId: string, canonicalCourseSlug?: string) {
  let destination = getBuilderPath(courseId, {}, canonicalCourseSlug);

  try {
    const module = await createTeacherModule(courseId);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      message: "Module ajouté.",
      module: module.id
    }, canonicalCourseSlug);
  } catch (error) {
    destination = getBuilderPath(courseId, { error: getErrorMessage(error) }, canonicalCourseSlug);
  }

  redirect(destination);
}

export async function updateTeacherModuleAction(
  courseId: string,
  moduleId: string,
  canonicalCourseSlug: string | undefined,
  formData: FormData
) {
  const from = formData.get("returnTo") === "publication" ? "publication" : undefined;
  let destination = getBuilderPath(courseId, { from, module: moduleId }, canonicalCourseSlug);

  try {
    const module = await updateTeacherModule(courseId, moduleId, formData);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      message: "Module enregistré.",
      from,
      module: module.id
    }, canonicalCourseSlug);
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      from,
      module: moduleId
    }, canonicalCourseSlug);
  }

  redirect(destination);
}

export async function moveTeacherModuleAction(
  courseId: string,
  moduleId: string,
  direction: -1 | 1,
  canonicalCourseSlug?: string
) {
  let destination = getBuilderPath(courseId, { module: moduleId }, canonicalCourseSlug);

  try {
    await moveTeacherModule(courseId, moduleId, direction);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      message: "Ordre des modules mis à jour.",
      module: moduleId
    }, canonicalCourseSlug);
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      module: moduleId
    }, canonicalCourseSlug);
  }

  redirect(destination);
}

export async function deleteTeacherModuleAction(courseId: string, moduleId: string, canonicalCourseSlug?: string) {
  let destination = getBuilderPath(courseId, {}, canonicalCourseSlug);

  try {
    await deleteTeacherModule(courseId, moduleId);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, { message: "Module supprimé." }, canonicalCourseSlug);
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      module: moduleId
    }, canonicalCourseSlug);
  }

  redirect(destination);
}

export async function createTeacherLessonAction(courseId: string, moduleId: string, canonicalCourseSlug?: string) {
  let destination = getBuilderPath(courseId, { module: moduleId }, canonicalCourseSlug);

  try {
    const lesson = await createTeacherLesson(courseId, moduleId);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      lesson: lesson.id,
      message: "Leçon ajoutée."
    }, canonicalCourseSlug);
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      module: moduleId
    }, canonicalCourseSlug);
  }

  redirect(destination);
}

export async function updateTeacherLessonAction(
  courseId: string,
  lessonId: string,
  canonicalCourseSlug: string | undefined,
  formData: FormData
) {
  const from = formData.get("returnTo") === "publication" ? "publication" : undefined;
  let destination = getBuilderPath(courseId, { from, lesson: lessonId }, canonicalCourseSlug);

  try {
    const lesson = await updateTeacherLesson(courseId, lessonId, formData);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      lesson: lesson.id,
      from,
      message: "Leçon enregistrée."
    }, canonicalCourseSlug);
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      from,
      lesson: lessonId
    }, canonicalCourseSlug);
  }

  redirect(destination);
}

export async function moveTeacherLessonAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
  direction: -1 | 1,
  canonicalCourseSlug?: string
) {
  let destination = getBuilderPath(courseId, { lesson: lessonId }, canonicalCourseSlug);

  try {
    await moveTeacherLesson(courseId, moduleId, lessonId, direction);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      lesson: lessonId,
      message: "Ordre des leçons mis à jour."
    }, canonicalCourseSlug);
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      lesson: lessonId
    }, canonicalCourseSlug);
  }

  redirect(destination);
}

export async function deleteTeacherLessonAction(courseId: string, lessonId: string, moduleId: string, canonicalCourseSlug?: string) {
  let destination = getBuilderPath(courseId, { module: moduleId }, canonicalCourseSlug);

  try {
    await deleteTeacherLesson(courseId, lessonId);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      message: "Leçon supprimée.",
      module: moduleId
    }, canonicalCourseSlug);
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      lesson: lessonId
    }, canonicalCourseSlug);
  }

  redirect(destination);
}

export async function createTeacherLessonResourceAction(
  courseId: string,
  lessonId: string,
  canonicalCourseSlug: string | undefined,
  formData: FormData
) {
  let destination = getBuilderPath(courseId, { lesson: lessonId }, canonicalCourseSlug);

  try {
    await createTeacherLessonResource(courseId, lessonId, formData);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      lesson: lessonId,
      message: "Ressource ajoutée."
    }, canonicalCourseSlug);
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      lesson: lessonId
    }, canonicalCourseSlug);
  }

  redirect(destination);
}

export async function uploadTeacherLessonResourceAction(
  courseId: string,
  lessonId: string,
  canonicalCourseSlug: string | undefined,
  formData: FormData
) {
  let destination = getBuilderPath(courseId, { lesson: lessonId }, canonicalCourseSlug);

  try {
    await uploadTeacherLessonResource(courseId, lessonId, formData);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      lesson: lessonId,
      message: "Fichier téléversé."
    }, canonicalCourseSlug);
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      lesson: lessonId
    }, canonicalCourseSlug);
  }

  redirect(destination);
}

export async function deleteTeacherLessonResourceAction(
  courseId: string,
  lessonId: string,
  resourceId: string,
  canonicalCourseSlug?: string
) {
  let destination = getBuilderPath(courseId, { lesson: lessonId }, canonicalCourseSlug);

  try {
    await deleteTeacherResource(resourceId, getBuilderPath(courseId, { lesson: lessonId }, canonicalCourseSlug));
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      lesson: lessonId,
      message: "Ressource supprimée."
    }, canonicalCourseSlug);
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      lesson: lessonId
    }, canonicalCourseSlug);
  }

  redirect(destination);
}

export async function deleteTeacherLibraryResourceAction(resourceId: string) {
  let destination = "/app/teacher/resources";

  try {
    await deleteTeacherResource(resourceId, "/app/teacher/resources");
    revalidatePath("/app/teacher/resources");
    destination = withParams("/app/teacher/resources", { message: "Ressource supprimée." });
  } catch (error) {
    destination = withParams("/app/teacher/resources", { error: getErrorMessage(error) });
  }

  redirect(destination);
}

export async function publishTeacherCourseAction(courseId: string) {
  let destination = getEditPath(courseId);

  try {
    const course = await publishTeacherCourse(courseId);
    revalidateTeacherCourse(courseId, course.slug);
    destination = getEditPath(courseId, { message: "Formation publiée dans le catalogue." });
  } catch (error) {
    destination = getEditPath(courseId, { error: getErrorMessage(error) });
  }

  redirect(destination);
}

export async function unpublishTeacherCourseAction(courseId: string) {
  let destination = getEditPath(courseId);

  try {
    const course = await unpublishTeacherCourse(courseId);
    revalidateTeacherCourse(courseId, course.slug);
    destination = getEditPath(courseId, { message: "Formation dépubliée. Les inscriptions sont conservées." });
  } catch (error) {
    destination = getEditPath(courseId, { error: getErrorMessage(error) });
  }

  redirect(destination);
}
