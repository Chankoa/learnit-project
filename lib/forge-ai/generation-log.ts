import "server-only";

import { createOptionalClient } from "@/lib/supabase/server";
import type { ForgeGenerationStatus, ForgePromptType } from "@/types/forge-ai";

type ForgeGenerationLogInput = {
  contextId?: string;
  contextType: "course" | "lesson" | "teacher_studio";
  durationMs?: number;
  errorCode?: string;
  model: string;
  promptType: ForgePromptType;
  provider: string;
  status: ForgeGenerationStatus;
  userId: string;
};

export async function logForgeGeneration(input: ForgeGenerationLogInput) {
  const supabase = await createOptionalClient();

  if (!supabase) {
    return;
  }

  const { error } = await supabase.from("ai_generations").insert({
    context_id: input.contextId ?? null,
    context_type: input.contextType,
    duration_ms: input.durationMs ?? null,
    error_code: input.errorCode ?? null,
    model: input.model,
    prompt_type: input.promptType,
    provider: input.provider,
    status: input.status,
    user_id: input.userId
  });

  if (error) {
    console.error("[forge-ai] generation metadata logging failed", error);
  }
}
