import "server-only";

import { getForgeAIConfig } from "@/lib/forge-ai/config";
import { parseJsonObject } from "@/lib/forge-ai/validation";
import type {
  CourseBrief,
  ForgeCourseImprovement,
  ForgeCourseImprovementInput,
  ForgeCourseIntent,
  ForgeLessonSuggestionInput,
  ForgePromptType
} from "@/types/forge-ai";

type ForgeAIJsonRequest = {
  input: CourseBrief | ForgeCourseImprovementInput | ForgeCourseIntent | ForgeLessonSuggestionInput;
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

const mockProvider: ForgeAIProvider = {
  async generateJson(request) {
    const startedAt = Date.now();
    const json = isCourseImprovement(request.input)
      ? getMockCourseImprovement(request.input)
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

function getOpenAICompatibleProvider(): ForgeAIProvider {
  return {
    async generateJson(request) {
      const config = getForgeAIConfig();

      if (!config.apiKey || !config.model) {
        throw new Error("Provider IA non configuré. Renseignez AI_API_KEY et AI_MODEL côté serveur.");
      }

      const startedAt = Date.now();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

      try {
        const response = await fetch(config.baseUrl, {
          body: JSON.stringify({
            messages: [
              { content: request.systemPrompt, role: "system" },
              { content: request.userPrompt, role: "user" }
            ],
            model: config.model,
            response_format: { type: "json_object" },
            temperature: 0.35
          }),
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            "Content-Type": "application/json"
          },
          method: "POST",
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Provider IA indisponible (${response.status}).`);
        }

        const payload = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = payload.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error("Réponse IA vide.");
        }

        return {
          durationMs: Date.now() - startedAt,
          json: parseJsonObject(content),
          model: config.model,
          provider: config.provider
        };
      } finally {
        clearTimeout(timeout);
      }
    }
  };
}

export function getForgeAIProvider(): ForgeAIProvider {
  const config = getForgeAIConfig();
  return config.provider === "openai-compatible" ? getOpenAICompatibleProvider() : mockProvider;
}
