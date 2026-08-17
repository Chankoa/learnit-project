import "server-only";

import { requireRole } from "@/lib/auth/server";
import { getForgeAIConfig } from "@/lib/forge-ai/config";
import { logForgeGeneration } from "@/lib/forge-ai/generation-log";
import { getForgeAIProvider } from "@/lib/forge-ai/provider";
import {
  buildCourseStructureUserPrompt,
  buildLessonAssistantUserPrompt,
  forgeCourseStructureSystemPrompt,
  forgeLessonAssistantSystemPrompt
} from "@/lib/forge-ai/prompts";
import { assertForgeAIRateLimit } from "@/lib/forge-ai/rate-limit";
import {
  validateForgeCourseProposal,
  validateForgeLessonSuggestion
} from "@/lib/forge-ai/validation";
import * as teacherCourseRepository from "@/lib/repositories/teacherCourseRepository";
import type {
  ForgeCourseImportInput,
  ForgeCourseIntent,
  ForgeCourseProposal,
  ForgeLessonSuggestion,
  ForgeLessonSuggestionInput,
  ForgePromptType
} from "@/types/forge-ai";

function truncate(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function sanitizeIntent(input: ForgeCourseIntent): ForgeCourseIntent {
  const config = getForgeAIConfig();

  return {
    audience: truncate(input.audience, 260),
    constraints: truncate(input.constraints ?? "", Math.min(config.maxInputChars, 800)),
    domainId: input.domainId,
    duration: truncate(input.duration ?? "", 120),
    goal: truncate(input.goal, 600),
    level: input.level,
    subject: truncate(input.subject, 260),
    tone: truncate(input.tone ?? "", 220)
  };
}

function sanitizeLessonInput(input: ForgeLessonSuggestionInput): ForgeLessonSuggestionInput {
  const config = getForgeAIConfig();

  return {
    action: input.action,
    content: truncate(input.content ?? "", config.maxInputChars),
    courseId: input.courseId,
    description: truncate(input.description ?? "", 500),
    lessonId: input.lessonId,
    title: truncate(input.title, 220)
  };
}

function required(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

function assertCourseIntent(input: ForgeCourseIntent) {
  required(input.subject, "Le sujet est requis.");
  required(input.audience, "Le public cible est requis.");
  required(input.goal, "L'objectif général est requis.");
  required(input.domainId, "Le domaine est requis.");
}

function getSelectedModules(input: ForgeCourseImportInput) {
  const selectedModuleIds = new Set(input.selection.moduleIds);
  const selectedLessonIds = new Set(input.selection.lessonIds);

  return input.proposal.modules
    .filter((module) => selectedModuleIds.has(module.clientId))
    .map((module) => ({
      ...module,
      lessons: module.lessons.filter((lesson) => selectedLessonIds.has(lesson.clientId))
    }))
    .filter((module) => module.lessons.length > 0);
}

function logFailure(
  userId: string,
  promptType: ForgePromptType,
  startedAt: number,
  error: unknown,
  context?: { contextId?: string; contextType: "course" | "lesson" | "teacher_studio" }
) {
  const message = error instanceof Error ? error.message : "unknown";
  console.error("[forge-ai] generation failed", {
    durationMs: Date.now() - startedAt,
    promptType,
    reason: message
  });

  return logForgeGeneration({
    contextId: context?.contextId,
    contextType: context?.contextType ?? "teacher_studio",
    durationMs: Date.now() - startedAt,
    errorCode: message.slice(0, 120),
    model: getForgeAIConfig().model || "unknown",
    promptType,
    provider: getForgeAIConfig().provider,
    status: message.includes("Sortie IA invalide") || message.includes("Réponse IA invalide")
      ? "invalid_output"
      : message.includes("Limite temporaire")
        ? "rate_limited"
        : "error",
    userId
  });
}

export async function generateForgeCourseProposal(
  input: ForgeCourseIntent
): Promise<ForgeCourseProposal> {
  const profile = await requireRole("teacher", "/app/teacher/courses/forge");
  const startedAt = Date.now();
  const sanitized = sanitizeIntent(input);
  assertCourseIntent(sanitized);
  assertForgeAIRateLimit(profile.id, "course_structure");

  try {
    const provider = getForgeAIProvider();
    const response = await provider.generateJson({
      input: sanitized,
      promptType: "course_structure",
      systemPrompt: forgeCourseStructureSystemPrompt,
      userPrompt: buildCourseStructureUserPrompt(sanitized)
    });
    const proposal = validateForgeCourseProposal(response.json);

    await logForgeGeneration({
      contextType: "teacher_studio",
      durationMs: response.durationMs,
      model: response.model,
      promptType: "course_structure",
      provider: response.provider,
      status: "success",
      userId: profile.id
    });

    console.info("[forge-ai] course proposal generated", {
      durationMs: response.durationMs,
      model: response.model,
      provider: response.provider
    });

    return proposal;
  } catch (error) {
    await logFailure(profile.id, "course_structure", startedAt, error);
    throw error;
  }
}

export async function importForgeCourseProposal(input: ForgeCourseImportInput) {
  const profile = await requireRole("teacher", "/app/teacher/courses/forge");
  const proposal = validateForgeCourseProposal(input.proposal);
  const modules = getSelectedModules({
    ...input,
    proposal
  });

  if (modules.length === 0) {
    throw new Error("Sélectionnez au moins un module avec une leçon.");
  }

  const course = await teacherCourseRepository.createCourse(profile.id, {
    description: proposal.summary,
    domainId: input.domainId,
    format: "Parcours assisté par Forge AI",
    level: proposal.level,
    subtitle: proposal.summary,
    title: proposal.title
  });

  for (const moduleProposal of modules) {
    const module = await teacherCourseRepository.createModule(profile.id, course.id, {
      description: moduleProposal.description,
      durationMinutes: moduleProposal.lessons.reduce(
        (total, lesson) => total + (lesson.estimatedMinutes ?? 20),
        0
      ),
      status: "draft",
      title: moduleProposal.title
    });

    for (const lessonProposal of moduleProposal.lessons) {
      await teacherCourseRepository.createLesson(profile.id, course.id, module.id, {
        content: "",
        description: lessonProposal.objective,
        durationMinutes: lessonProposal.estimatedMinutes ?? 20,
        objectives: lessonProposal.objective ? [lessonProposal.objective] : [],
        status: "draft",
        title: lessonProposal.title,
        type: "reading"
      });
    }
  }

  await logForgeGeneration({
    contextId: course.id,
    contextType: "course",
    model: getForgeAIConfig().model || "unknown",
    promptType: "course_import",
    provider: getForgeAIConfig().provider,
    status: "success",
    userId: profile.id
  });

  return course;
}

export async function generateForgeLessonSuggestion(
  input: ForgeLessonSuggestionInput
): Promise<ForgeLessonSuggestion> {
  const profile = await requireRole("teacher", `/app/teacher/courses/${input.courseId}/builder`);
  const course = await teacherCourseRepository.getTeacherCourse(profile.id, input.courseId);

  if (!course) {
    throw new Error("Formation introuvable ou non modifiable.");
  }

  const lesson = course.modules
    .flatMap((module) => module.lessons)
    .find((item) => item.id === input.lessonId);

  if (!lesson) {
    throw new Error("Leçon introuvable ou non modifiable.");
  }

  const startedAt = Date.now();
  const sanitized = sanitizeLessonInput({
    ...input,
    content: input.content ?? lesson.content,
    description: input.description ?? lesson.description,
    title: input.title || lesson.title
  });
  assertForgeAIRateLimit(profile.id, `lesson_${sanitized.action}`);

  try {
    const provider = getForgeAIProvider();
    const response = await provider.generateJson({
      input: sanitized,
      promptType: `lesson_${sanitized.action}` as ForgePromptType,
      systemPrompt: forgeLessonAssistantSystemPrompt,
      userPrompt: buildLessonAssistantUserPrompt(sanitized)
    });
    const suggestion = validateForgeLessonSuggestion(response.json);

    await logForgeGeneration({
      contextId: lesson.id,
      contextType: "lesson",
      durationMs: response.durationMs,
      model: response.model,
      promptType: `lesson_${sanitized.action}` as ForgePromptType,
      provider: response.provider,
      status: "success",
      userId: profile.id
    });

    console.info("[forge-ai] lesson suggestion generated", {
      durationMs: response.durationMs,
      model: response.model,
      provider: response.provider
    });

    return suggestion;
  } catch (error) {
    await logFailure(profile.id, `lesson_${sanitized.action}` as ForgePromptType, startedAt, error, {
      contextId: lesson.id,
      contextType: "lesson"
    });
    throw error;
  }
}
