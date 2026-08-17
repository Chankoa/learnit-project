"use server";

import { revalidatePath } from "next/cache";

import {
  generateForgeCourseProposal,
  generateForgeLessonSuggestion,
  importForgeCourseProposal
} from "@/lib/forge-ai/service";
import type {
  ForgeCourseImportInput,
  ForgeCourseIntent,
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
  input: ForgeCourseIntent
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
