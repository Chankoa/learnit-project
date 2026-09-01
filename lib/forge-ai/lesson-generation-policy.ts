import type {
  ForgeLessonContentMode,
  ForgePromptType
} from "@/types/forge-ai";

export type ForgeLessonReasoningEffort = "low";

const boundedLessonPromptTypes = new Set<ForgePromptType>([
  "lesson_generate",
  "lesson_improve"
]);

function getSectionRange(durationMinutes: number) {
  if (durationMinutes <= 25) {
    return "2 à 3 sections courtes";
  }

  if (durationMinutes <= 50) {
    return "3 à 4 sections";
  }

  return "4 à 5 sections";
}

export function getLessonGenerationGuidance(
  mode: ForgeLessonContentMode,
  durationMinutes: number
): string | undefined {
  if (mode !== "generate" && mode !== "improve") {
    return undefined;
  }

  const duration = Math.max(5, Math.min(180, Math.round(durationMinutes || 30)));
  const modeGuidance =
    mode === "improve"
      ? "Conserve les parties utiles et une longueur comparable au contenu actuel. Corrige, clarifie et complète uniquement les lacunes démontrables ; ne duplique pas les idées et n'allonge pas systématiquement la leçon."
      : "Produis une leçon complète mais concise, directement exploitable par l'apprenant.";

  return `Gabarit de longueur pour une leçon de ${duration} minutes : ${getSectionRange(duration)}. Une introduction courte, au plus deux paragraphes concis par section et 3 à 5 points à retenir. Renseigne exemple, code, encadré et approfondissement uniquement lorsqu'ils apportent une valeur pédagogique directe ; sinon retourne une chaîne vide. ${modeGuidance}`;
}

export function getLessonGenerationReasoningEffort(
  promptType: ForgePromptType,
  model: string
): ForgeLessonReasoningEffort | undefined {
  if (!boundedLessonPromptTypes.has(promptType)) {
    return undefined;
  }

  return /^gpt-5(?:$|[-.])/i.test(model.trim()) ? "low" : undefined;
}
