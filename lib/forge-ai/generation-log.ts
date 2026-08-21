import "server-only";

import { createOptionalClient } from "@/lib/supabase/server";
import type { ForgeGenerationStatus, ForgePromptType } from "@/types/forge-ai";

type ForgeGenerationLogInput = {
  contextId?: string;
  contextType: "course" | "lesson" | "teacher_studio";
  durationMs?: number;
  errorCode?: string;
  inputTokens?: number;
  model: string;
  outputTokens?: number;
  promptType: ForgePromptType;
  provider: string;
  sourceIds?: string[];
  status: ForgeGenerationStatus;
  totalTokens?: number;
  userId: string;
};

export async function logForgeGeneration(input: ForgeGenerationLogInput) {
  const supabase = await createOptionalClient();

  if (!supabase) {
    return;
  }

  const { data, error } = await supabase
    .from("ai_generations")
    .insert({
      context_id: input.contextId ?? null,
      context_type: input.contextType,
      duration_ms: input.durationMs ?? null,
      error_code: input.errorCode ?? null,
      input_tokens: input.inputTokens ?? null,
      model: input.model,
      output_tokens: input.outputTokens ?? null,
      prompt_type: input.promptType,
      provider: input.provider,
      status: input.status,
      total_tokens: input.totalTokens ?? null,
      user_id: input.userId
    })
    .select("id")
    .single();

  if (error) {
    console.error("[forge-ai] generation metadata logging failed", error);
    return;
  }

  const sourceIds = Array.from(new Set(input.sourceIds ?? [])).filter(Boolean);

  if (sourceIds.length === 0 || !data) {
    return;
  }

  const { error: sourceError } = await supabase.from("ai_generation_sources").insert(
    sourceIds.map((sourceId) => ({
      generation_id: data.id,
      source_id: sourceId
    }))
  );

  if (sourceError) {
    console.error("[forge-ai] generation source refs logging failed", sourceError);
  }
}
