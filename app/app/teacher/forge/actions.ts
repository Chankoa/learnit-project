"use server";

import { revalidatePath } from "next/cache";

import {
  applyForgeCourseImprovement,
  generateForgeCourseProposal,
  generateForgeCourseImprovement,
  generateForgeLessonSuggestion,
  importForgeCourseProposal,
  uploadForgeCourseSource,
  deleteForgeCourseSource
} from "@/lib/forge-ai/service";
import type {
  CourseBrief,
  CourseSource,
  ForgeCourseImportInput,
  ForgeCourseImprovement,
  ForgeCourseImprovementApplyInput,
  ForgeCourseImprovementInput,
  ForgeCourseProposal,
  ForgeLessonSuggestion,
  ForgeLessonSuggestionInput
} from "@/types/forge-ai";

type ForgeActionResult<T> =
  | {
      data: T;
      ok: true;
    }
  | {
      error: string;
      ok: false;
    };

type ForgeImportResult =
  | {
      destination: string;
      ok: true;
    }
  | {
      error: string;
      ok: false;
    };

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Forge AI est indisponible pour le moment.";
  }

  if (error.message.includes("JSON") || error.message.includes("Sortie IA invalide")) {
    return "Forge a renvoyé une proposition inexploitable. Régénérez une proposition.";
  }

  if (error.message.includes("Provider IA")) {
    return "Forge AI n'est pas encore configuré pour ce déploiement.";
  }

  if (error.message.includes("Limite temporaire")) {
    return error.message;
  }

  return error.message || "Forge AI est indisponible pour le moment.";
}

export async function generateForgeCourseProposalAction(
  input: CourseBrief
): Promise<ForgeActionResult<ForgeCourseProposal>> {
  try {
    const proposal = await generateForgeCourseProposal(input);
    return {
      data: proposal,
      ok: true
    };
  } catch (error) {
    return {
      error: getErrorMessage(error),
      ok: false
    };
  }
}

export async function uploadForgeCourseSourceAction(
  formData: FormData
): Promise<ForgeActionResult<CourseSource>> {
  try {
    const source = await uploadForgeCourseSource(formData);
    revalidatePath("/app/teacher/courses/forge");

    if (source.courseId) {
      revalidatePath(`/app/teacher/courses/${source.courseId}/edit`);
      revalidatePath(`/app/teacher/courses/${source.courseId}/builder`);
    }

    return {
      data: source,
      ok: true
    };
  } catch (error) {
    return {
      error: getErrorMessage(error),
      ok: false
    };
  }
}

export async function deleteForgeCourseSourceAction(
  sourceId: string,
  courseId?: string
): Promise<ForgeActionResult<{ sourceId: string }>> {
  try {
    await deleteForgeCourseSource(sourceId, courseId);
    revalidatePath("/app/teacher/courses/forge");

    if (courseId) {
      revalidatePath(`/app/teacher/courses/${courseId}/edit`);
      revalidatePath(`/app/teacher/courses/${courseId}/builder`);
    }

    return {
      data: { sourceId },
      ok: true
    };
  } catch (error) {
    return {
      error: getErrorMessage(error),
      ok: false
    };
  }
}

export async function importForgeCourseProposalAction(
  input: ForgeCourseImportInput
): Promise<ForgeImportResult> {
  try {
    const course = await importForgeCourseProposal(input);
    revalidatePath("/app/teacher");
    revalidatePath("/app/teacher/courses");
    revalidatePath(`/app/teacher/courses/${course.id}/builder`);

    return {
      destination: `/app/teacher/courses/${course.id}/builder?message=${encodeURIComponent(
        "Brouillon créé depuis une proposition Forge AI."
      )}`,
      ok: true
    };
  } catch (error) {
    return {
      error: getErrorMessage(error),
      ok: false
    };
  }
}

export async function generateForgeLessonSuggestionAction(
  input: ForgeLessonSuggestionInput
): Promise<ForgeActionResult<ForgeLessonSuggestion>> {
  try {
    const suggestion = await generateForgeLessonSuggestion(input);
    return {
      data: suggestion,
      ok: true
    };
  } catch (error) {
    return {
      error: getErrorMessage(error),
      ok: false
    };
  }
}

export async function generateForgeCourseImprovementAction(
  input: ForgeCourseImprovementInput
): Promise<ForgeActionResult<ForgeCourseImprovement>> {
  try {
    const improvement = await generateForgeCourseImprovement(input);
    return {
      data: improvement,
      ok: true
    };
  } catch (error) {
    return {
      error: getErrorMessage(error),
      ok: false
    };
  }
}

export async function applyForgeCourseImprovementAction(
  input: ForgeCourseImprovementApplyInput
): Promise<ForgeActionResult<{ message: string }>> {
  try {
    await applyForgeCourseImprovement(input);
    revalidatePath(`/app/teacher/courses/${input.courseId}/edit`);
    revalidatePath(`/app/teacher/courses/${input.courseId}/builder`);

    return {
      data: { message: "Suggestion appliquée en brouillon." },
      ok: true
    };
  } catch (error) {
    return {
      error: getErrorMessage(error),
      ok: false
    };
  }
}
