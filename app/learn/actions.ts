"use server";

import { revalidatePath } from "next/cache";

import {
  enrollInCourse,
  recordLearningTime,
  saveLessonNote,
  setResourceFavorite,
  setLessonCompleted,
  startLesson
} from "@/lib/learning-service";

function revalidateLearning(courseSlug: string) {
  revalidatePath("/app/learner");
  revalidatePath("/app/learner/courses");
  revalidatePath("/app/learner/progress");
  revalidatePath(`/learn/${courseSlug}`);
  revalidatePath(`/app/courses/${courseSlug}`);
  revalidatePath(`/app/courses/${courseSlug}/lessons`);
  revalidatePath("/dashboard");
}

export async function enrollAction(courseId: string, courseSlug: string) {
  await enrollInCourse(courseId);
  revalidateLearning(courseSlug);
}

export async function startLessonAction(courseId: string, lessonId: string, courseSlug: string) {
  await startLesson(courseId, lessonId);
  revalidateLearning(courseSlug);
  revalidatePath(`/learn/${courseSlug}`);
}

export async function setLessonCompletedAction(
  courseId: string,
  lessonId: string,
  courseSlug: string,
  completed: boolean
) {
  await setLessonCompleted(courseId, lessonId, completed);
  revalidateLearning(courseSlug);
}

export async function recordLearningTimeAction(
  courseId: string,
  lessonId: string,
  courseSlug: string,
  minutes: number
) {
  await recordLearningTime(courseId, lessonId, minutes);
  revalidateLearning(courseSlug);
}

export async function saveLessonNoteAction(lessonId: string, content: string, courseSlug: string) {
  await saveLessonNote(lessonId, content);
  revalidateLearning(courseSlug);
}

export async function setResourceFavoriteAction(resourceId: string, favorite: boolean) {
  await setResourceFavorite(resourceId, favorite);
  revalidatePath("/app/learner");
  revalidatePath("/app/learner/resources");
}
