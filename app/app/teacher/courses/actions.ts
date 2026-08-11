"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createTeacherCourse,
  createTeacherLesson,
  createTeacherModule,
  deleteTeacherLesson,
  deleteTeacherModule,
  moveTeacherLesson,
  moveTeacherModule,
  publishTeacherCourse,
  updateTeacherCourse,
  updateTeacherLesson,
  updateTeacherModule
} from "@/lib/teacher-service";

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
  params: Record<string, string | undefined> = {}
) {
  return withParams(`/app/teacher/courses/${courseId}/builder`, params);
}

function getEditPath(courseId: string, params: Record<string, string | undefined> = {}) {
  return withParams(`/app/teacher/courses/${courseId}/edit`, params);
}

function revalidateTeacherCourse(courseId: string, courseSlug?: string) {
  revalidatePath("/app/teacher");
  revalidatePath("/app/teacher/courses");
  revalidatePath(`/app/teacher/courses/${courseId}/edit`);
  revalidatePath(`/app/teacher/courses/${courseId}/builder`);
  revalidatePath("/formations");

  if (courseSlug) {
    revalidatePath(`/formations/${courseSlug}`);
    revalidatePath(`/formations/${courseSlug}/curriculum`);
    revalidatePath(`/learn/${courseSlug}`);
  }
}

export async function createTeacherCourseAction(formData: FormData) {
  let destination = "/app/teacher/courses/new";

  try {
    const course = await createTeacherCourse(formData);
    revalidateTeacherCourse(course.id, course.slug);
    destination = getEditPath(course.id, { message: "Formation creee en brouillon." });
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
    destination = getEditPath(course.id, { message: "Informations enregistrees." });
  } catch (error) {
    destination = getEditPath(courseId, { error: getErrorMessage(error) });
  }

  redirect(destination);
}

export async function createTeacherModuleAction(courseId: string) {
  let destination = getBuilderPath(courseId);

  try {
    const module = await createTeacherModule(courseId);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      message: "Module ajoute.",
      module: module.id
    });
  } catch (error) {
    destination = getBuilderPath(courseId, { error: getErrorMessage(error) });
  }

  redirect(destination);
}

export async function updateTeacherModuleAction(
  courseId: string,
  moduleId: string,
  formData: FormData
) {
  let destination = getBuilderPath(courseId, { module: moduleId });

  try {
    const module = await updateTeacherModule(courseId, moduleId, formData);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      message: "Module enregistre.",
      module: module.id
    });
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      module: moduleId
    });
  }

  redirect(destination);
}

export async function moveTeacherModuleAction(
  courseId: string,
  moduleId: string,
  direction: -1 | 1
) {
  let destination = getBuilderPath(courseId, { module: moduleId });

  try {
    await moveTeacherModule(courseId, moduleId, direction);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      message: "Ordre des modules mis a jour.",
      module: moduleId
    });
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      module: moduleId
    });
  }

  redirect(destination);
}

export async function deleteTeacherModuleAction(courseId: string, moduleId: string) {
  let destination = getBuilderPath(courseId);

  try {
    await deleteTeacherModule(courseId, moduleId);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, { message: "Module supprime." });
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      module: moduleId
    });
  }

  redirect(destination);
}

export async function createTeacherLessonAction(courseId: string, moduleId: string) {
  let destination = getBuilderPath(courseId, { module: moduleId });

  try {
    const lesson = await createTeacherLesson(courseId, moduleId);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      lesson: lesson.id,
      message: "Lecon ajoutee."
    });
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      module: moduleId
    });
  }

  redirect(destination);
}

export async function updateTeacherLessonAction(
  courseId: string,
  lessonId: string,
  formData: FormData
) {
  let destination = getBuilderPath(courseId, { lesson: lessonId });

  try {
    const lesson = await updateTeacherLesson(courseId, lessonId, formData);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      lesson: lesson.id,
      message: "Lecon enregistree."
    });
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      lesson: lessonId
    });
  }

  redirect(destination);
}

export async function moveTeacherLessonAction(
  courseId: string,
  moduleId: string,
  lessonId: string,
  direction: -1 | 1
) {
  let destination = getBuilderPath(courseId, { lesson: lessonId });

  try {
    await moveTeacherLesson(courseId, moduleId, lessonId, direction);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      lesson: lessonId,
      message: "Ordre des lecons mis a jour."
    });
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      lesson: lessonId
    });
  }

  redirect(destination);
}

export async function deleteTeacherLessonAction(courseId: string, lessonId: string, moduleId: string) {
  let destination = getBuilderPath(courseId, { module: moduleId });

  try {
    await deleteTeacherLesson(courseId, lessonId);
    revalidateTeacherCourse(courseId);
    destination = getBuilderPath(courseId, {
      message: "Lecon supprimee.",
      module: moduleId
    });
  } catch (error) {
    destination = getBuilderPath(courseId, {
      error: getErrorMessage(error),
      lesson: lessonId
    });
  }

  redirect(destination);
}

export async function publishTeacherCourseAction(courseId: string) {
  let destination = getEditPath(courseId);

  try {
    const course = await publishTeacherCourse(courseId);
    revalidateTeacherCourse(courseId, course.slug);
    destination = getEditPath(courseId, { message: "Formation publiee dans le catalogue." });
  } catch (error) {
    destination = getEditPath(courseId, { error: getErrorMessage(error) });
  }

  redirect(destination);
}
