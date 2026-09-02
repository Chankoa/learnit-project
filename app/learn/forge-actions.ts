"use server";

import { generateLearnerForgeResponse } from "@/lib/forge-ai/service";
import { ForgeAIProviderError } from "@/lib/forge-ai/provider";
import type { LearnerForgeInput, LearnerForgeResponse } from "@/types/forge-ai";

export type LearnerForgeActionResult =
  | { data: LearnerForgeResponse; ok: true }
  | { error: string; errorCode: string; ok: false; retryable: boolean };

function learnerError(error: unknown): Omit<Extract<LearnerForgeActionResult, { ok: false }>, "ok"> {
  if (error instanceof ForgeAIProviderError) {
    const messages: Record<ForgeAIProviderError["code"], string> = {
      auth_refused: "Forge n'est pas disponible pour le moment.",
      invalid_endpoint: "Forge n'est pas disponible pour le moment.",
      missing_config: "Forge n'est pas configuré sur cet environnement.",
      output_token_limit: "La réponse était trop longue. Réessayez avec une question plus précise.",
      provider_unavailable: "Forge est momentanément indisponible.",
      rate_limited: "Trop de demandes ont été envoyées. Réessayez un peu plus tard.",
      request_failed: "Forge n'a pas pu répondre. Réessayez.",
      response_empty: "Forge n'a produit aucune réponse exploitable. Réessayez.",
      response_incomplete: "La réponse n'a pas pu être terminée. Réessayez.",
      response_refusal: "Forge ne peut pas traiter cette demande.",
      structured_output_invalid: "La réponse n'a pas pu être affichée. Réessayez.",
      timeout: "Forge a mis trop de temps à répondre. Réessayez."
    };

    return {
      error: messages[error.code],
      errorCode: error.code,
      retryable: !["auth_refused", "invalid_endpoint", "missing_config", "response_refusal"].includes(error.code)
    };
  }

  return {
    error: error instanceof Error ? error.message : "Forge n'a pas pu répondre. Réessayez.",
    errorCode: "learner_forge_failed",
    retryable: true
  };
}

export async function askLearnerForgeAction(
  input: LearnerForgeInput
): Promise<LearnerForgeActionResult> {
  try {
    return { data: await generateLearnerForgeResponse(input), ok: true };
  } catch (error) {
    return { ...learnerError(error), ok: false };
  }
}
