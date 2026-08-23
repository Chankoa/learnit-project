import type { CourseLevel } from "@/types/course";
import type {
  ForgeCourseImprovement,
  ForgeCourseProposal,
  ForgeCourseRevisionProposal,
  ForgeLessonAction,
  ForgeLessonCalloutType,
  ForgeLessonContentProposal,
  ForgeLessonSection,
  ForgeLessonSuggestion
} from "@/types/forge-ai";
import { lessonProposalToMarkdown } from "@/lib/forge-ai/lesson-markdown";
import type { TeacherCourse } from "@/types/teaching";

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

function contentString(value: unknown) {
  return typeof value === "string" ? value.replace(/\r\n/g, "\n").trim() : "";
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

function boundedRequiredString(value: unknown, label: string, maxLength: number) {
  const next = requiredString(value, label);

  if (next.length > maxLength) {
    throw new Error(`Sortie IA invalide : ${label} dépasse ${maxLength} caractères.`);
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
    sourceCount: positiveMinutes(value.sourceCount),
    summary: requiredString(value.summary, "résumé"),
    title: requiredString(value.title, "titre")
  };
}

export function validateForgeCourseImprovement(value: unknown): ForgeCourseImprovement {
  if (!isRecord(value)) {
    throw new Error("Sortie IA invalide : objet attendu.");
  }

  const suggestionTypes = ["module", "lesson", "rename", "reorder", "gap", "duration"];
  const suggestionsSource = Array.isArray(value.suggestions) ? value.suggestions : [];
  const suggestions = suggestionsSource.slice(0, 8).map((suggestionValue, suggestionIndex) => {
    if (!isRecord(suggestionValue)) {
      throw new Error(`Sortie IA invalide : suggestion ${suggestionIndex + 1} incorrecte.`);
    }

    const type = stringValue(suggestionValue.type);

    return {
      clientId: `suggestion-${suggestionIndex + 1}`,
      current: optionalString(suggestionValue.current),
      proposed: requiredString(suggestionValue.proposed, `proposition ${suggestionIndex + 1}`),
      rationale: requiredString(suggestionValue.rationale, `justification ${suggestionIndex + 1}`),
      type: suggestionTypes.includes(type)
        ? (type as ForgeCourseImprovement["suggestions"][number]["type"])
        : "gap"
    };
  });

  return {
    sourceCount: positiveMinutes(value.sourceCount) ?? 0,
    suggestions,
    summary: requiredString(value.summary, "synthèse"),
    title: requiredString(value.title, "titre")
  };
}

export function validateForgeCourseRevisionProposal(
  value: unknown,
  course?: TeacherCourse
): ForgeCourseRevisionProposal {
  if (!isRecord(value)) {
    throw new Error("Sortie IA invalide : objet de révision attendu.");
  }

  if (!Array.isArray(value.issues)) {
    throw new Error("Sortie IA invalide : liste d'incohérences attendue.");
  }

  if (value.issues.length > 4) {
    throw new Error("Sortie IA invalide : quatre incohérences maximum sont autorisées.");
  }

  const seenTargets = new Set<string>();
  const issues = value.issues.map((issueValue, issueIndex) => {
    if (!isRecord(issueValue) || !isRecord(issueValue.current) || !isRecord(issueValue.proposed)) {
      throw new Error(`Sortie IA invalide : incohérence ${issueIndex + 1} incorrecte.`);
    }

    if (issueValue.scope !== "module" || issueValue.type !== "content_mismatch") {
      throw new Error(`Sortie IA invalide : type d'incohérence ${issueIndex + 1} non autorisé.`);
    }

    const targetId = requiredString(issueValue.targetId, `cible ${issueIndex + 1}`);

    if (seenTargets.has(targetId)) {
      throw new Error(`Sortie IA invalide : cible ${targetId} dupliquée.`);
    }

    seenTargets.add(targetId);
    const current = {
      description: contentString(issueValue.current.description),
      title: requiredString(issueValue.current.title, `titre actuel ${issueIndex + 1}`)
    };
    const proposed = {
      description: boundedRequiredString(
        issueValue.proposed.description,
        `description proposée ${issueIndex + 1}`,
        600
      ),
      title: boundedRequiredString(
        issueValue.proposed.title,
        `titre proposé ${issueIndex + 1}`,
        220
      )
    };

    if (current.title === proposed.title && current.description === proposed.description) {
      throw new Error(`Sortie IA invalide : l'incohérence ${issueIndex + 1} ne propose aucun changement.`);
    }

    if (course) {
      const targetModule = course.modules.find((module) => module.id === targetId);

      if (!targetModule) {
        throw new Error(`Sortie IA invalide : module cible ${targetId} introuvable.`);
      }

      if (
        stringValue(targetModule.title) !== current.title ||
        contentString(targetModule.description) !== current.description
      ) {
        throw new Error(`Sortie IA invalide : état actuel du module ${targetId} obsolète.`);
      }
    }

    return {
      current,
      proposed,
      reason: boundedRequiredString(
        issueValue.reason,
        `justification ${issueIndex + 1}`,
        600
      ),
      scope: "module" as const,
      targetId,
      type: "content_mismatch" as const
    };
  });

  return { issues };
}

export function validateForgeModuleRevisionProposal(
  value: unknown,
  course: TeacherCourse,
  moduleId: string
): ForgeCourseRevisionProposal {
  const proposal = validateForgeCourseRevisionProposal(value, course);

  if (proposal.issues.length > 1) {
    throw new Error("Sortie IA invalide : une seule correction de module est autorisée.");
  }

  const issue = proposal.issues[0];

  if (issue && issue.targetId !== moduleId) {
    throw new Error("Sortie IA invalide : la correction ne cible pas le module analysé.");
  }

  return proposal;
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

export function validateForgeLessonContentProposal(value: unknown): ForgeLessonContentProposal {
  if (!isRecord(value)) {
    throw new Error("Sortie IA invalide : objet attendu.");
  }

  const referencesSource = Array.isArray(value.sourceReferences) ? value.sourceReferences : [];
  const sourceReferences = referencesSource.slice(0, 6).flatMap((referenceValue) => {
    if (!isRecord(referenceValue)) {
      return [];
    }

    const sourceId = stringValue(referenceValue.sourceId);
    const label = stringValue(referenceValue.label);

    if (!sourceId || !label) {
      return [];
    }

    return {
      excerpt: optionalString(referenceValue.excerpt),
      label,
      sourceId
    };
  });

  const sectionsSource = Array.isArray(value.sections) ? value.sections : [];
  const sections = sectionsSource.slice(0, 7).map((sectionValue, sectionIndex): ForgeLessonSection => {
    if (!isRecord(sectionValue)) {
      throw new Error(`Sortie IA invalide : section ${sectionIndex + 1} incorrecte.`);
    }

    const calloutType = stringValue(sectionValue.calloutType);

    return {
      callout: contentString(sectionValue.callout),
      calloutType: ["none", "note", "tip", "warning"].includes(calloutType)
        ? (calloutType as ForgeLessonCalloutType)
        : "none",
      code: contentString(sectionValue.code),
      codeLanguage: stringValue(sectionValue.codeLanguage).slice(0, 24),
      content: requiredString(sectionValue.content, `contenu de la section ${sectionIndex + 1}`),
      example: contentString(sectionValue.example),
      title: requiredString(sectionValue.title, `titre de la section ${sectionIndex + 1}`)
    };
  });

  if (sections.length === 0) {
    throw new Error("Sortie IA invalide : au moins une section est requise.");
  }

  const proposal = {
    estimatedMinutes: positiveMinutes(value.estimatedMinutes) ?? 20,
    furtherReading: contentString(value.furtherReading),
    intro: requiredString(value.intro, "introduction"),
    keyTakeaways: stringArray(value.keyTakeaways, 8),
    objectives: stringArray(value.objectives, 8),
    practice: contentString(value.practice),
    sections,
    sourceReferences,
    summary: requiredString(value.summary, "résumé"),
    title: requiredString(value.title, "titre")
  };

  return {
    ...proposal,
    contentMarkdown: lessonProposalToMarkdown(proposal)
  };
}
