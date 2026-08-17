import type { CourseLevel } from "@/types/course";
import type {
  ForgeCourseProposal,
  ForgeLessonAction,
  ForgeLessonSuggestion
} from "@/types/forge-ai";

const courseLevels = ["beginner", "intermediate", "advanced"] satisfies CourseLevel[];
const lessonActions = ["plan", "intro", "summary", "simplify"] satisfies ForgeLessonAction[];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : fallback;
}

function optionalString(value: unknown) {
  const next = stringValue(value);
  return next || undefined;
}

function stringArray(value: unknown, maxItems: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => stringValue(item))
    .filter(Boolean)
    .slice(0, maxItems);
}

function courseLevel(value: unknown): CourseLevel {
  const next = stringValue(value);
  return courseLevels.includes(next as CourseLevel) ? (next as CourseLevel) : "beginner";
}

function positiveMinutes(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(180, Math.round(parsed)) : undefined;
}

function requiredString(value: unknown, label: string) {
  const next = stringValue(value);

  if (!next) {
    throw new Error(`Sortie IA invalide : ${label} manquant.`);
  }

  return next;
}

export function parseJsonObject(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;

    if (!isRecord(parsed)) {
      throw new Error("La réponse n'est pas un objet JSON.");
    }

    return parsed;
  } catch (error) {
    const message = error instanceof Error ? error.message : "JSON illisible.";
    throw new Error(`Réponse IA invalide : ${message}`);
  }
}

export function validateForgeCourseProposal(value: unknown): ForgeCourseProposal {
  if (!isRecord(value)) {
    throw new Error("Sortie IA invalide : objet attendu.");
  }

  const modulesSource = Array.isArray(value.modules) ? value.modules : [];
  const modules = modulesSource.slice(0, 6).map((moduleValue, moduleIndex) => {
    if (!isRecord(moduleValue)) {
      throw new Error(`Sortie IA invalide : module ${moduleIndex + 1} incorrect.`);
    }

    const lessonsSource = Array.isArray(moduleValue.lessons) ? moduleValue.lessons : [];
    const lessons = lessonsSource.slice(0, 6).map((lessonValue, lessonIndex) => {
      if (!isRecord(lessonValue)) {
        throw new Error(
          `Sortie IA invalide : leçon ${lessonIndex + 1} du module ${moduleIndex + 1} incorrecte.`
        );
      }

      return {
        clientId: `module-${moduleIndex + 1}-lesson-${lessonIndex + 1}`,
        estimatedMinutes: positiveMinutes(lessonValue.estimatedMinutes),
        objective: optionalString(lessonValue.objective),
        title: requiredString(lessonValue.title, `titre de la leçon ${lessonIndex + 1}`)
      };
    });

    if (lessons.length === 0) {
      throw new Error(`Sortie IA invalide : le module ${moduleIndex + 1} doit contenir au moins une leçon.`);
    }

    return {
      clientId: `module-${moduleIndex + 1}`,
      description: optionalString(moduleValue.description),
      lessons,
      title: requiredString(moduleValue.title, `titre du module ${moduleIndex + 1}`)
    };
  });

  if (modules.length < 1) {
    throw new Error("Sortie IA invalide : au moins un module est requis.");
  }

  return {
    audience: requiredString(value.audience, "public cible"),
    level: courseLevel(value.level),
    modules,
    objectives: stringArray(value.objectives, 8),
    prerequisites: stringArray(value.prerequisites, 6),
    summary: requiredString(value.summary, "résumé"),
    title: requiredString(value.title, "titre")
  };
}

export function validateForgeLessonSuggestion(value: unknown): ForgeLessonSuggestion {
  if (!isRecord(value)) {
    throw new Error("Sortie IA invalide : objet attendu.");
  }

  const action = stringValue(value.action);

  return {
    action: lessonActions.includes(action as ForgeLessonAction) ? (action as ForgeLessonAction) : "plan",
    content: requiredString(value.content, "contenu proposé"),
    title: requiredString(value.title, "titre de la proposition")
  };
}
