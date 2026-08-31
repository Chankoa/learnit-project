import { createOpenAI } from "@ai-sdk/openai";
import { generateText, jsonSchema, Output } from "ai";

import { getRuntimeConfig } from "../lib/config/runtime";
import { getMaxOutputTokens } from "../lib/forge-ai/token-budget";
import { validateForgeCourseImprovement } from "../lib/forge-ai/validation";

const diagnosticSystemPrompt = `Tu es Forge AI, copilote de conception pédagogique.
Tu analyses une formation existante et proposes uniquement des améliorations ciblées à valider humainement.
Réponds uniquement avec un objet JSON contenant title, summary, sourceCount et suggestions.
Chaque suggestion contient type, current, proposed et rationale.`;

const stringSchema = { type: "string" as const };
const courseImprovementSchema = {
  additionalProperties: false,
  properties: {
    sourceCount: { type: "number" as const },
    suggestions: {
      items: {
        additionalProperties: false,
        properties: {
          current: stringSchema,
          proposed: stringSchema,
          rationale: stringSchema,
          type: {
            enum: ["module", "lesson", "rename", "reorder", "gap", "duration"],
            type: "string" as const
          }
        },
        required: ["current", "proposed", "rationale", "type"],
        type: "object" as const
      },
      type: "array" as const
    },
    summary: stringSchema,
    title: stringSchema
  },
  required: ["sourceCount", "suggestions", "summary", "title"],
  type: "object" as const
};

async function main() {
  const config = getRuntimeConfig();

  if (!config.ai.apiKey || !config.ai.model) {
    throw new Error("OPENAI_API_KEY and OPENAI_MODEL are required.");
  }

  const openai = createOpenAI({ apiKey: config.ai.apiKey, baseURL: config.ai.baseUrl });
  const result = await generateText({
    maxOutputTokens: getMaxOutputTokens("course_improvement", config.ai.maxOutputTokens),
    model: openai.responses(config.ai.model),
    output: Output.object({
      name: "forge_course_improvement",
      schema: jsonSchema(courseImprovementSchema, {
        validate(value) {
          try {
            return { success: true, value: validateForgeCourseImprovement(value) };
          } catch (error) {
            return {
              error: error instanceof Error ? error : new Error("Invalid structured output"),
              success: false
            };
          }
        }
      })
    }),
    prompt:
      "Analyse une formation de trois modules et propose uniquement des améliorations ciblées. La source Example Domain confirme qu’il s’agit d’un exemple documentaire.",
    system: diagnosticSystemPrompt
  });

  const response = result.output;

  console.info(JSON.stringify({
    finishReason: result.finishReason,
    inputTokens: result.usage.inputTokens,
    keys:
      response && typeof response === "object" && !Array.isArray(response)
        ? Object.keys(response)
        : [],
    model: config.ai.model,
    outputTokens: result.usage.outputTokens,
    provider: "ai-sdk",
    rootType: Array.isArray(response) ? "array" : typeof response,
    totalTokens: result.usage.totalTokens
  }));
}

main().catch((error: unknown) => {
  const details = error && typeof error === "object" ? error as Record<string, unknown> : {};

  console.error(JSON.stringify({
    code: details.code,
    finishReason: details.finishReason,
    inputTokens: details.inputTokens,
    message: error instanceof Error ? error.message : "Unknown error",
    name: error instanceof Error ? error.name : "UnknownError",
    outputTokens: details.outputTokens,
    stage: details.stage,
    totalTokens: details.totalTokens
  }));
  process.exitCode = 1;
});
