import "server-only";

import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

import { getForgeAIConfig } from "@/lib/forge-ai/config";
import { parseJsonObject } from "@/lib/forge-ai/validation";
import type {
  CourseBrief,
  ForgeCourseImprovement,
  ForgeCourseImprovementInput,
  ForgeCourseIntent,
  ForgeLessonContentInput,
  ForgeLessonContentProposal,
  ForgeLessonSuggestionInput,
  ForgePromptType
} from "@/types/forge-ai";

type ForgeAIJsonRequest = {
  input:
    | CourseBrief
    | ForgeCourseImprovementInput
    | ForgeCourseIntent
    | ForgeLessonContentInput
    | ForgeLessonSuggestionInput;
  promptType: ForgePromptType;
  systemPrompt: string;
  userPrompt: string;
};

type ForgeAIJsonResponse = {
  durationMs: number;
  json: unknown;
  model: string;
  provider: string;
};

export type ForgeAIProvider = {
  generateJson: (request: ForgeAIJsonRequest) => Promise<ForgeAIJsonResponse>;
};

export type ForgeAIProviderErrorCode =
  | "auth_refused"
  | "invalid_endpoint"
  | "missing_config"
  | "provider_unavailable"
  | "rate_limited"
  | "request_failed"
  | "timeout";

export class ForgeAIProviderError extends Error {
  code: ForgeAIProviderErrorCode;
  status?: number;

  constructor(code: ForgeAIProviderErrorCode, message: string, status?: number) {
    super(message);
    this.name = "ForgeAIProviderError";
    this.code = code;
    this.status = status;
  }
}

function isCourseBrief(input: ForgeAIJsonRequest["input"]): input is CourseBrief {
  return "subject" in input && "targetAudience" in input;
}

function isLegacyCourseIntent(input: ForgeAIJsonRequest["input"]): input is ForgeCourseIntent {
  return "subject" in input && "audience" in input;
}

function isCourseImprovement(
  input: ForgeAIJsonRequest["input"]
): input is ForgeCourseImprovementInput {
  return "mode" in input && "courseId" in input;
}

function isLessonContentInput(
  input: ForgeAIJsonRequest["input"]
): input is ForgeLessonContentInput {
  return "mode" in input && "lessonId" in input;
}

function getMockCourseProposal(input: CourseBrief | ForgeCourseIntent) {
  const subject = input.subject || "Nouveau parcours";
  const audience = isCourseBrief(input)
    ? input.targetAudience || "apprenants ciblés"
    : input.audience || "apprenants ciblés";
  const level = isCourseBrief(input) ? input.targetLevel : input.level;
  const summary = isCourseBrief(input)
    ? input.learningObjectives[0] || `Un parcours guidé pour structurer et pratiquer ${subject}.`
    : input.goal || `Un parcours guidé pour structurer et pratiquer ${subject}.`;

  return {
    audience,
    level,
    objectives: [
      `Identifier les fondamentaux de ${subject}`,
      "Appliquer une méthode progressive sur un cas concret",
      "Produire un livrable exploitable en autonomie"
    ],
    prerequisites: ["Avoir un objectif de projet clair", "Pouvoir consacrer du temps à la pratique"],
    sourceCount: isCourseBrief(input) ? input.sourceIds?.length ?? 0 : 0,
    summary,
    title: subject,
    modules: [
      {
        description: "Poser le cadre, les attentes et les critères de réussite.",
        lessons: [
          {
            estimatedMinutes: 25,
            objective: "Clarifier le résultat attendu et les contraintes.",
            title: "Comprendre le contexte et le livrable"
          },
          {
            estimatedMinutes: 30,
            objective: "Identifier les prérequis et les points de vigilance.",
            title: "Préparer son environnement de travail"
          }
        ],
        title: "Cadrer le parcours"
      },
      {
        description: "Construire progressivement les compétences principales.",
        lessons: [
          {
            estimatedMinutes: 35,
            objective: "Appliquer la première méthode sur un exemple simple.",
            title: "Mettre en place la méthode de base"
          },
          {
            estimatedMinutes: 40,
            objective: "Adapter la méthode aux besoins du public cible.",
            title: `Adapter ${subject} à ${audience}`
          }
        ],
        title: "Pratiquer les fondamentaux"
      },
      {
        description: "Finaliser, relire et préparer la suite du parcours.",
        lessons: [
          {
            estimatedMinutes: 45,
            objective: "Produire une version complète du livrable.",
            title: "Réaliser un cas pratique complet"
          },
          {
            estimatedMinutes: 20,
            objective: "Évaluer la production et identifier les prochaines améliorations.",
            title: "Faire le bilan et planifier la suite"
          }
        ],
        title: "Consolider par un projet"
      }
    ]
  };
}

function getMockCourseImprovement(input: ForgeCourseImprovementInput): ForgeCourseImprovement {
  const title =
    input.mode === "analyze"
      ? "Analyse pédagogique du parcours"
      : "Propositions d'amélioration de structure";

  return {
    sourceCount: input.brief.sourceIds?.length ?? 0,
    suggestions: [
      {
        clientId: "suggestion-1",
        current: "Structure actuelle",
        proposed: "Cadrer le livrable et les critères de réussite",
        rationale:
          "Ajouter un module de cadrage clarifie les attentes avant les exercices et réduit les risques de décrochage.",
        type: "module"
      },
      {
        clientId: "suggestion-2",
        current: "Leçons existantes",
        proposed: "Exercice guidé avant le projet final",
        rationale:
          "Une leçon de pratique intermédiaire facilite le passage du concept au livrable complet.",
        type: "lesson"
      },
      {
        clientId: "suggestion-3",
        current: "Objectifs pédagogiques",
        proposed: "Reformuler les objectifs avec des verbes observables : identifier, produire, vérifier.",
        rationale:
          "Les objectifs deviennent plus faciles à évaluer par le formateur et l'apprenant.",
        type: "gap"
      }
    ],
    summary:
      "Le parcours peut gagner en lisibilité avec un cadrage initial, une pratique intermédiaire et des objectifs plus observables.",
    title
  };
}

function getMockLessonSuggestion(input: ForgeLessonSuggestionInput) {
  const title = input.title || "Leçon";

  const contentByAction: Record<ForgeLessonSuggestionInput["action"], string> = {
    intro: `## Introduction\n\nDans cette leçon, vous allez poser les bases de **${title}** et comprendre comment l'appliquer dans un cas concret.\n\nÀ la fin, vous saurez identifier les points clés à retenir avant de passer à la pratique.`,
    plan: `## Objectif de la leçon\n\nClarifier ce que l'apprenant doit être capable de faire après **${title}**.\n\n## Étapes proposées\n\n1. Situer le contexte et le résultat attendu.\n2. Présenter la méthode pas à pas.\n3. Montrer un exemple court.\n4. Faire pratiquer sur un mini-cas.\n5. Conclure avec les critères de réussite.`,
    simplify: `## Version simplifiée\n\n${input.content || `La leçon **${title}** doit présenter une idée principale, l'illustrer avec un exemple, puis guider l'apprenant vers une action concrète.`}\n\n## À retenir\n\n- Garder une seule idée centrale par section.\n- Montrer avant de demander de faire.\n- Conclure avec une action observable.`,
    summary: `## Synthèse\n\nLa leçon **${title}** permet de relier la méthode au cas pratique.\n\nPoints clés :\n\n- comprendre le contexte ;\n- appliquer les étapes dans l'ordre ;\n- vérifier le résultat avec des critères simples.`
  };

  return {
    action: input.action,
    content: contentByAction[input.action],
    title: `Proposition Forge - ${title}`
  };
}

function getMockLessonContentProposal(input: ForgeLessonContentInput): ForgeLessonContentProposal {
  const title = input.title || "Leçon";
  const baseSummary =
    input.mode === "analyze"
      ? "Analyse pédagogique de la leçon et recommandations à valider."
      : `Proposition contextualisée pour ${title}.`;

  const contentByMode: Record<ForgeLessonContentInput["mode"], string> = {
    analyze:
      `## Analyse pédagogique\n\nLa leçon **${title}** gagne à expliciter le résultat attendu dès l'ouverture.\n\n## Recommandations\n\n- Relier la leçon à l'objectif du module.\n- Ajouter un exemple concret avant l'exercice.\n- Terminer par une vérification simple.`,
    examples:
      `## Exemples guidés\n\n### Exemple 1\n\nPrésenter un cas simple, puis montrer la décision pédagogique à prendre.\n\n### Exemple 2\n\nComparer une version incomplète et une version réussie pour rendre les critères visibles.`,
    exercise:
      `## Exercice\n\nProduisez une version courte du livrable de la leçon.\n\n### Consigne\n\n1. Reprenez le contexte donné.\n2. Appliquez la méthode étape par étape.\n3. Vérifiez le résultat avec les critères ci-dessous.\n\n### Critères de réussite\n\n- Le livrable répond à l'objectif.\n- Les choix sont justifiés.\n- Les prochaines améliorations sont identifiées.`,
    expand:
      `## ${title}\n\nCette leçon développe la méthode progressivement : d'abord le contexte, puis les étapes, puis une mise en pratique.\n\n## Méthode\n\n1. Clarifier le résultat attendu.\n2. Identifier les contraintes.\n3. Appliquer la procédure sur un cas simple.\n4. Vérifier la production.`,
    generate:
      `## Objectif\n\nÀ la fin de cette leçon, l'apprenant sait appliquer **${title}** dans un cas concret.\n\n## Étapes\n\n1. Comprendre le contexte.\n2. Observer un exemple.\n3. Réaliser une première pratique guidée.\n4. Vérifier le résultat.\n\n## À retenir\n\nLa progression doit rester observable et actionnable.`,
    improve:
      `## Version améliorée\n\n${input.content || `La leçon **${title}** présente une méthode courte, illustrée par un exemple et suivie d'une mise en pratique.`}\n\n## Points de vigilance\n\n- Garder une seule idée principale par section.\n- Montrer un exemple avant de demander de produire.\n- Conclure avec un critère de réussite.`,
    intro:
      `## Introduction\n\nDans cette leçon, vous allez aborder **${title}** à partir d'un cas concret.\n\nL'objectif est de comprendre la méthode, puis de l'appliquer immédiatement dans une situation simple.`,
    simplify:
      `## Version simplifiée\n\nLa leçon **${title}** doit aider l'apprenant à comprendre une méthode, l'observer dans un exemple, puis l'utiliser lui-même.\n\n## À retenir\n\n- Une idée par étape.\n- Un exemple concret.\n- Une action finale vérifiable.`,
    summary:
      `## Synthèse\n\nLa leçon **${title}** permet de passer d'une explication à une action concrète.\n\nPoints clés :\n\n- comprendre l'objectif ;\n- appliquer les étapes ;\n- vérifier le résultat.`
  };

  return {
    contentMarkdown: contentByMode[input.mode],
    estimatedMinutes: 30,
    keyPoints: [
      "Clarifier le résultat attendu",
      "Montrer un exemple concret",
      "Faire vérifier la production"
    ],
    objectives: [
      `Comprendre ${title}`,
      "Appliquer la méthode sur un cas simple",
      "Évaluer le résultat avec des critères observables"
    ],
    sourceReferences: (input.sourceIds ?? []).slice(0, 3).map((sourceId, index) => ({
      excerpt: "Extrait récupéré par le Retrieval Service.",
      label: `Source ${index + 1}`,
      sourceId
    })),
    summary: baseSummary,
    title: input.mode === "analyze" ? `Analyse Forge - ${title}` : title
  };
}

const mockProvider: ForgeAIProvider = {
  async generateJson(request) {
    const startedAt = Date.now();
    const json = isCourseImprovement(request.input)
      ? getMockCourseImprovement(request.input)
      : isLessonContentInput(request.input)
      ? getMockLessonContentProposal(request.input)
      : isCourseBrief(request.input) || isLegacyCourseIntent(request.input)
      ? getMockCourseProposal(request.input)
      : getMockLessonSuggestion(request.input);

    return {
      durationMs: Date.now() - startedAt,
      json,
      model: "forge-mock-v1",
      provider: "mock"
    };
  }
};

function logOpenAICompatibleConfig(config: ReturnType<typeof getForgeAIConfig>) {
  console.info("[forge-ai] Forge AI config", {
    apiKey: config.apiKey ? "present" : "missing",
    baseUrl: config.baseUrlSource,
    model: config.model ? "present" : "missing",
    provider: config.provider
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function truncateForLog(value: string, maxLength = 240) {
  const compact = value.replace(/\s+/g, " ").trim();
  return compact.length > maxLength ? `${compact.slice(0, maxLength)}...` : compact;
}

function getResponsesEndpoint(baseUrl: string) {
  return `${baseUrl.replace(/\/+$/, "")}/responses`;
}

function getSafeEndpointForLog(endpoint: string) {
  try {
    const url = new URL(endpoint);
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return endpoint.split("?")[0] ?? endpoint;
  }
}

function objectSchema(properties: Record<string, unknown>) {
  return {
    additionalProperties: false,
    properties,
    required: Object.keys(properties),
    type: "object"
  };
}

function arraySchema(items: Record<string, unknown>) {
  return {
    items,
    type: "array"
  };
}

const stringSchema = { type: "string" };
const numberSchema = { type: "number" };
const courseLevelSchema = { enum: ["beginner", "intermediate", "advanced"], type: "string" };

const courseProposalSchema = objectSchema({
  audience: stringSchema,
  level: courseLevelSchema,
  modules: arraySchema(
    objectSchema({
      description: stringSchema,
      lessons: arraySchema(
        objectSchema({
          estimatedMinutes: numberSchema,
          objective: stringSchema,
          title: stringSchema
        })
      ),
      title: stringSchema
    })
  ),
  objectives: arraySchema(stringSchema),
  prerequisites: arraySchema(stringSchema),
  sourceCount: numberSchema,
  summary: stringSchema,
  title: stringSchema
});

const courseImprovementSchema = objectSchema({
  sourceCount: numberSchema,
  suggestions: arraySchema(
    objectSchema({
      current: stringSchema,
      proposed: stringSchema,
      rationale: stringSchema,
      type: {
        enum: ["module", "lesson", "rename", "reorder", "gap", "duration"],
        type: "string"
      }
    })
  ),
  summary: stringSchema,
  title: stringSchema
});

const lessonContentSchema = objectSchema({
  contentMarkdown: stringSchema,
  estimatedMinutes: numberSchema,
  keyPoints: arraySchema(stringSchema),
  objectives: arraySchema(stringSchema),
  sourceReferences: arraySchema(
    objectSchema({
      excerpt: stringSchema,
      label: stringSchema,
      sourceId: stringSchema
    })
  ),
  summary: stringSchema,
  title: stringSchema
});

const lessonSuggestionSchema = objectSchema({
  action: { enum: ["plan", "intro", "summary", "simplify"], type: "string" },
  content: stringSchema,
  title: stringSchema
});

function getStructuredOutputSchema(request: ForgeAIJsonRequest) {
  if (request.promptType === "course_structure") {
    return {
      name: "forge_course_structure",
      schema: courseProposalSchema
    };
  }

  if (request.promptType === "course_improvement") {
    return {
      name: "forge_course_improvement",
      schema: courseImprovementSchema
    };
  }

  if (isLessonContentInput(request.input)) {
    return {
      name: "forge_lesson_content",
      schema: lessonContentSchema
    };
  }

  return {
    name: "forge_lesson_suggestion",
    schema: lessonSuggestionSchema
  };
}

function buildResponsesPayload(config: ReturnType<typeof getForgeAIConfig>, request: ForgeAIJsonRequest) {
  const outputSchema = getStructuredOutputSchema(request);

  return {
    input: [
      {
        content: [{ text: request.systemPrompt, type: "input_text" }],
        role: "system"
      },
      {
        content: [{ text: request.userPrompt, type: "input_text" }],
        role: "user"
      }
    ],
    max_output_tokens: config.maxOutputTokens,
    model: config.model,
    text: {
      format: {
        name: outputSchema.name,
        schema: outputSchema.schema,
        strict: true,
        type: "json_schema"
      }
    }
  };
}

type ProviderErrorDetails = {
  code: string;
  message: string;
  type: string;
};

async function readProviderErrorDetails(response: Response): Promise<ProviderErrorDetails> {
  const fallback = {
    code: "missing",
    message: "",
    type: "missing"
  };

  const text = await response.text();

  if (!text) {
    return fallback;
  }

  try {
    const payload = JSON.parse(text) as unknown;
    const error = isRecord(payload) && isRecord(payload.error) ? payload.error : undefined;

    return {
      code: stringValue(error?.code) || "missing",
      message: truncateForLog(stringValue(error?.message)),
      type: stringValue(error?.type) || "missing"
    };
  } catch {
    return {
      ...fallback,
      message: truncateForLog(text)
    };
  }
}

function logProviderHttpError(
  response: Response,
  endpoint: string,
  model: string,
  details: ProviderErrorDetails
) {
  console.error("[forge-ai] provider request failed", {
    endpoint: getSafeEndpointForLog(endpoint),
    errorCode: details.code,
    errorMessage: details.message,
    errorType: details.type,
    model,
    status: response.status,
    statusText: response.statusText
  });
}

function getProviderError(status: number) {
  if (status === 401 || status === 403) {
    return new ForgeAIProviderError(
      "auth_refused",
      `Provider IA authentication refused (${status}).`,
      status
    );
  }

  if (status === 404 || status === 405) {
    return new ForgeAIProviderError(
      "invalid_endpoint",
      `Provider IA endpoint invalid or incompatible (${status}).`,
      status
    );
  }

  if (status === 429) {
    return new ForgeAIProviderError(
      "rate_limited",
      "Provider IA quota or rate limit reached.",
      status
    );
  }

  if (status >= 500 && status <= 599) {
    return new ForgeAIProviderError(
      "provider_unavailable",
      `Provider IA temporarily unavailable (${status}).`,
      status
    );
  }

  return new ForgeAIProviderError(
    "request_failed",
    `Provider IA request failed (${status}).`,
    status
  );
}

function getResponseStatus(payload: Record<string, unknown>) {
  return stringValue(payload.status);
}

function getResponseErrorMessage(payload: Record<string, unknown>) {
  const error = isRecord(payload.error) ? payload.error : undefined;
  return stringValue(error?.message) || stringValue(payload.error);
}

function extractTextFromContentItem(item: unknown) {
  if (!isRecord(item)) {
    return { refusal: "", text: "" };
  }

  const type = stringValue(item.type);
  const refusal = stringValue(item.refusal);

  if (type.includes("refusal") || refusal) {
    return { refusal: refusal || "Provider refused the request.", text: "" };
  }

  if (isRecord(item.parsed)) {
    return { refusal: "", text: JSON.stringify(item.parsed) };
  }

  return { refusal: "", text: stringValue(item.text) };
}

function extractStructuredOutput(payload: unknown) {
  if (!isRecord(payload)) {
    throw new Error("Réponse IA invalide : objet attendu.");
  }

  const status = getResponseStatus(payload);

  if (status === "failed") {
    throw new ForgeAIProviderError(
      "request_failed",
      `Provider IA response failed: ${truncateForLog(getResponseErrorMessage(payload), 160)}`
    );
  }

  if (status === "incomplete") {
    throw new ForgeAIProviderError(
      "request_failed",
      "Provider IA response incomplete."
    );
  }

  const outputText = stringValue(payload.output_text);

  if (outputText.trim()) {
    return outputText;
  }

  const output = Array.isArray(payload.output) ? payload.output : [];
  const textParts: string[] = [];
  const refusals: string[] = [];

  for (const outputItem of output) {
    if (!isRecord(outputItem)) {
      continue;
    }

    const content = Array.isArray(outputItem.content) ? outputItem.content : [];

    for (const contentItem of content) {
      const extracted = extractTextFromContentItem(contentItem);

      if (extracted.refusal) {
        refusals.push(extracted.refusal);
      }

      if (extracted.text.trim()) {
        textParts.push(extracted.text);
      }
    }
  }

  if (refusals.length > 0) {
    throw new ForgeAIProviderError(
      "request_failed",
      `Provider IA refused request: ${truncateForLog(refusals[0] ?? "", 160)}`
    );
  }

  const text = textParts.join("\n").trim();

  if (!text) {
    throw new Error("Réponse IA vide.");
  }

  return text;
}

function isAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name?: unknown }).name === "AbortError"
  );
}

function getOpenAIProvider(): ForgeAIProvider {
  return {
    async generateJson(request) {
      const config = getForgeAIConfig();
      logOpenAICompatibleConfig(config);

      if (!config.apiKey || !config.model) {
        throw new ForgeAIProviderError(
          "missing_config",
          "Provider IA non configuré. Renseignez OPENAI_API_KEY et OPENAI_MODEL côté serveur."
        );
      }

      const startedAt = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
      const outputSchema = getStructuredOutputSchema(request);
      const openai = createOpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl
      });

      try {
        const result = await generateText({
          abortSignal: controller.signal,
          maxOutputTokens: config.maxOutputTokens,
          model: openai.responses(config.model),
          prompt: `${request.userPrompt}\n\nRépondez uniquement avec un objet JSON valide respectant ce schéma JSON : ${JSON.stringify(
            outputSchema.schema
          )}`,
          system: request.systemPrompt
        });

        return {
          durationMs: Date.now() - startedAt,
          json: parseJsonObject(result.text),
          model: config.model,
          provider: config.provider
        };
      } catch (error) {
        if (isAbortError(error)) {
          throw new ForgeAIProviderError("timeout", "Provider IA request timed out.");
        }

        throw error;
      } finally {
        clearTimeout(timeout);
      }
    }
  };
}

function getOpenAICompatibleProvider(): ForgeAIProvider {
  return {
    async generateJson(request) {
      const config = getForgeAIConfig();
      logOpenAICompatibleConfig(config);

      if (!config.apiKey || !config.model) {
        throw new ForgeAIProviderError(
          "missing_config",
          "Provider IA non configuré. Renseignez AI_API_KEY et AI_MODEL côté serveur."
        );
      }

      const startedAt = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
      const endpoint = getResponsesEndpoint(config.baseUrl);

      try {
        const response = await fetch(endpoint, {
          body: JSON.stringify(buildResponsesPayload(config, request)),
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json"
          },
          method: "POST",
          signal: controller.signal
        });

        if (!response.ok) {
          const details = await readProviderErrorDetails(response);
          logProviderHttpError(response, endpoint, config.model, details);
          throw getProviderError(response.status);
        }

        const payload = (await response.json()) as unknown;
        const content = extractStructuredOutput(payload);

        return {
          durationMs: Date.now() - startedAt,
          json: parseJsonObject(content),
          model: config.model,
          provider: config.provider
        };
      } catch (error) {
        if (error instanceof ForgeAIProviderError) {
          throw error;
        }

        if (isAbortError(error)) {
          throw new ForgeAIProviderError("timeout", "Provider IA request timed out.");
        }

        throw error;
      } finally {
        clearTimeout(timeout);
      }
    }
  };
}

export function getForgeAIProvider(): ForgeAIProvider {
  const config = getForgeAIConfig();
  if (config.provider === "openai") {
    return getOpenAIProvider();
  }

  return config.provider === "openai-compatible" ? getOpenAICompatibleProvider() : mockProvider;
}
