import type { ForgePromptType } from "@/types/forge-ai";

export const FORGE_AI_MAX_OUTPUT_TOKENS_LIMIT = 4000;

const maxOutputTokensByPromptType: Record<ForgePromptType, number> = {
  course_analysis: 1800,
  course_improvement: 3200,
  course_import: 1200,
  course_structure: 2400,
  lesson_analyze: 1600,
  lesson_examples: 1600,
  lesson_exercise: 1600,
  lesson_expand: 1600,
  lesson_generate: 3600,
  lesson_improve: 3000,
  lesson_intro: 900,
  lesson_outline: 1200,
  lesson_plan: 1200,
  lesson_simplify: 1600,
  lesson_summary: 900
};

export function getMaxOutputTokens(promptType: ForgePromptType, globalLimit: number) {
  return Math.min(maxOutputTokensByPromptType[promptType], globalLimit);
}
