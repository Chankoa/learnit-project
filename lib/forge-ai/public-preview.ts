import { getForgeCreationFormat, validateForgeCreationIntent } from "@/lib/forge-ai/creation-intent";
import type { ForgeCreationIntent } from "@/types/forge-ai";

/** Local illustration only: no provider call, course persistence or inferred personal data. */
export function buildPublicForgePreview(input: ForgeCreationIntent) {
  const result = validateForgeCreationIntent(input);
  if (!result.ok) throw new Error(result.error);
  const intent = result.data;
  const practical = intent.formatHint === "practical-workshop";
  const short = intent.formatHint === "thematic-module";
  return {
    intent,
    title: intent.text,
    format: getForgeCreationFormat(intent.formatHint)?.label ?? "Parcours guidé",
    estimatedMinutes: short ? 45 : practical ? 90 : 120,
    explanation: practical
      ? "Cette trame place la pratique au centre : un objectif, un essai guidé, puis un bilan."
      : "Cette trame avance de la compréhension à la pratique, puis à la vérification des acquis.",
    modules: short ? [
      { title: "Comprendre et mettre en pratique", objectives: ["Définir la question à explorer", "Construire un exemple et vérifier ce que l’on retient"] }
    ] : [
      { title: "Poser les bases", objectives: ["Préciser votre objectif", "Identifier les notions à explorer"] },
      { title: practical ? "Réaliser un premier essai" : "Passer à la pratique", objectives: ["Travailler un exemple guidé", "Appliquer les notions à votre projet"] },
      { title: "Consolider les acquis", objectives: ["Vérifier votre compréhension", "Définir la prochaine étape"] }
    ]
  };
}
