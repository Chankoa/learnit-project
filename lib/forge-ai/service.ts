import "server-only";

import { requireRole } from "@/lib/auth/server";
import { getForgeAIConfig } from "@/lib/forge-ai/config";
import { logForgeGeneration } from "@/lib/forge-ai/generation-log";
import { ForgeAIProviderError, getForgeAIProvider } from "@/lib/forge-ai/provider";
import { getCourseContext } from "@/lib/forge-ai/retrieval";
import { retrieveUrlSource } from "@/lib/forge-ai/url-source";
import {
  buildCourseImprovementUserPrompt,
  buildCourseRevisionUserPrompt,
  buildCourseStructureUserPrompt,
  buildLessonContentUserPrompt,
  buildLessonAssistantUserPrompt,
  forgeCourseImprovementSystemPrompt,
  forgeCourseRevisionSystemPrompt,
  forgeCourseStructureSystemPrompt,
  forgeLessonContentSystemPrompt,
  forgeLessonAssistantSystemPrompt
} from "@/lib/forge-ai/prompts";
import { assertForgeAIRateLimit } from "@/lib/forge-ai/rate-limit";
import {
  validateForgeCourseImprovement,
  validateForgeCourseProposal,
  validateForgeCourseRevisionProposal,
  validateForgeLessonContentProposal,
  validateForgeModuleRevisionProposal,
  validateForgeLessonSuggestion
} from "@/lib/forge-ai/validation";
import * as forgeSourceRepository from "@/lib/repositories/forgeSourceRepository";
import * as teacherCourseRepository from "@/lib/repositories/teacherCourseRepository";
import type { CourseLevel } from "@/types/course";
import type {
  CourseBrief,
  CourseSource,
  ForgeCourseImportInput,
  ForgeCourseImprovement,
  ForgeCourseImprovementApplyInput,
  ForgeCourseImprovementInput,
  ForgeCourseProposal,
  ForgeCourseRevisionInput,
  ForgeCourseRevisionProposal,
  ForgeLessonContentInput,
  ForgeLessonContentMode,
  ForgeLessonContentProposal,
  ForgeLessonProposalApplyInput,
  ForgeLessonSuggestion,
  ForgeLessonSuggestionInput,
  ForgeModuleRevisionApplyInput,
  ForgePromptType
} from "@/types/forge-ai";
import type { TeacherCourse } from "@/types/teaching";

const courseLevels = ["beginner", "intermediate", "advanced"] satisfies CourseLevel[];

function truncate(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : undefined;
}

function normalizeLines(value: string[]) {
  return value
    .flatMap((item) => item.split("\n"))
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 8);
}

function courseLevel(value: CourseLevel | undefined, fallback: CourseLevel): CourseLevel {
  return courseLevels.includes(value as CourseLevel) ? (value as CourseLevel) : fallback;
}

function sanitizeBrief(input: CourseBrief, fallbackCourse?: TeacherCourse): CourseBrief {
  const config = getForgeAIConfig();
  const fallbackObjective = fallbackCourse?.description ? [fallbackCourse.description] : [];
  const objectives = normalizeLines(
    input.learningObjectives.length > 0 ? input.learningObjectives : fallbackObjective
  );

  return {
    constraints: truncate(input.constraints ?? "", Math.min(config.maxInputChars, 900)),
    domainId: truncate(input.domainId || fallbackCourse?.domain.id || "", 80),
    duration: truncate(input.duration ?? "", 120),
    entryLevel: courseLevel(input.entryLevel, fallbackCourse?.level ?? "beginner"),
    learningObjectives: objectives,
    prerequisites: truncate(input.prerequisites ?? "", 500),
    sourceIds: Array.from(new Set(input.sourceIds ?? [])).filter(Boolean).slice(0, 8),
    sources: input.sources?.slice(0, 8),
    subject: truncate(input.subject || fallbackCourse?.title || "", 260),
    targetAudience: truncate(input.targetAudience, 260),
    targetLevel: courseLevel(input.targetLevel, fallbackCourse?.level ?? "beginner")
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

function sanitizeLessonContentInput(input: ForgeLessonContentInput): ForgeLessonContentInput {
  const config = getForgeAIConfig();

  return {
    content: truncate(input.content ?? "", config.maxInputChars),
    courseId: input.courseId,
    description: truncate(input.description ?? "", 500),
    lessonId: input.lessonId,
    mode: input.mode,
    sourceIds: Array.from(new Set(input.sourceIds ?? [])).filter(Boolean).slice(0, 8),
    title: truncate(input.title ?? "", 220)
  };
}

function required(value: string, message: string) {
  if (!value.trim()) {
    throw new Error(message);
  }
}

function assertCourseBrief(input: CourseBrief) {
  required(input.subject, "Le sujet est requis.");
  required(input.targetAudience, "Le public cible est requis.");
  required(input.domainId, "Le domaine est requis.");

  if (input.learningObjectives.length === 0) {
    throw new Error("Ajoutez au moins un objectif pédagogique.");
  }
}

export function buildForgeCourseRevisionInput(
  course: TeacherCourse,
  moduleId?: string
): ForgeCourseRevisionInput {
  const modules = moduleId
    ? course.modules.filter((module) => module.id === moduleId)
    : course.modules;

  return {
    course: {
      description: truncate(course.description, 900),
      modules: [...modules]
        .sort((left, right) => left.order - right.order)
        .slice(0, 12)
        .map((module) => ({
          description: truncate(module.description, 600),
          id: module.id,
          lessons: [...module.lessons]
            .sort((left, right) => left.order - right.order)
            .slice(0, 20)
            .map((lesson) => ({
              contentExcerpt: truncate(lesson.content ?? "", 800) || undefined,
              description: truncate(lesson.description ?? "", 500),
              id: lesson.id,
              objectives: normalizeLines(lesson.objectives ?? []),
              order: lesson.order,
              title: truncate(lesson.title, 220)
            })),
          order: module.order,
          title: truncate(module.title, 220)
        })),
      title: truncate(course.title, 260)
    },
    courseId: course.id
  };
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

function getLessonPromptType(mode: ForgeLessonContentMode): ForgePromptType {
  const promptTypes: Record<ForgeLessonContentMode, ForgePromptType> = {
    analyze: "lesson_analyze",
    examples: "lesson_examples",
    exercise: "lesson_exercise",
    expand: "lesson_expand",
    generate: "lesson_generate",
    improve: "lesson_improve",
    intro: "lesson_intro",
    simplify: "lesson_simplify",
    summary: "lesson_summary"
  };

  return promptTypes[mode];
}

function getLessonContext(course: TeacherCourse, lessonId: string) {
  for (const module of course.modules) {
    const lessonIndex = module.lessons.findIndex((lesson) => lesson.id === lessonId);

    if (lessonIndex >= 0) {
      const flattenedLessons = course.modules.flatMap((item) => item.lessons);
      const flattenedIndex = flattenedLessons.findIndex((lesson) => lesson.id === lessonId);

      return {
        lesson: module.lessons[lessonIndex],
        module,
        nextLesson: flattenedIndex >= 0 ? flattenedLessons[flattenedIndex + 1] : undefined,
        previousLesson: flattenedIndex > 0 ? flattenedLessons[flattenedIndex - 1] : undefined
      };
    }
  }

  return {};
}

function filterSourceReferences(
  proposal: ForgeLessonContentProposal,
  contextSourceLabels: Map<string, string>
): ForgeLessonContentProposal {
  const references = proposal.sourceReferences
    .filter((reference) => contextSourceLabels.has(reference.sourceId))
    .map((reference) => ({
      ...reference,
      label: reference.label || contextSourceLabels.get(reference.sourceId) || "Source"
    }));

  return {
    ...proposal,
    sourceReferences: references
  };
}

function logFailure(
  userId: string,
  promptType: ForgePromptType,
  startedAt: number,
  error: unknown,
  context?: {
    contextId?: string;
    contextType: "course" | "lesson" | "teacher_studio";
    sourceIds?: string[];
  }
) {
  const message = error instanceof Error ? error.message : "unknown";
  const usage = error instanceof ForgeAIProviderError ? error : undefined;
  const isInvalidOutput =
    usage?.code === "structured_output_invalid" ||
    usage?.code === "response_empty" ||
    message.includes("Sortie IA invalide") ||
    message.includes("Réponse IA invalide");
  const isRateLimited = usage?.code === "rate_limited" || message.includes("Limite temporaire");
  console.error("[forge-ai] generation failed", {
    durationMs: Date.now() - startedAt,
    finishReason: usage?.finishReason,
    promptType,
    reason: message,
    stage: usage?.stage
  });

  return logForgeGeneration({
    contextId: context?.contextId,
    contextType: context?.contextType ?? "teacher_studio",
    durationMs: Date.now() - startedAt,
    errorCode: usage?.code ?? message.slice(0, 120),
    inputTokens: usage?.inputTokens,
    model: getForgeAIConfig().model || "unknown",
    outputTokens: usage?.outputTokens,
    promptType,
    provider: getForgeAIConfig().provider,
    sourceIds: context?.sourceIds,
    status: isInvalidOutput
      ? "invalid_output"
      : isRateLimited
        ? "rate_limited"
        : "error",
      totalTokens: usage?.totalTokens,
    userId
  });
}

export async function getForgeCourseSources(
  courseId?: string,
  nextPath = "/app/teacher/courses/forge"
): Promise<CourseSource[]> {
  const profile = await requireRole("teacher", nextPath);
  return forgeSourceRepository.getSources(profile.id, courseId);
}

export async function uploadForgeCourseSource(formData: FormData): Promise<CourseSource> {
  const courseId = getString(formData, "courseId") || undefined;
  const profile = await requireRole(
    "teacher",
    courseId ? `/app/teacher/courses/${courseId}/edit` : "/app/teacher/courses/forge"
  );
  const file = getFile(formData, "sourceFile");

  if (!file) {
    throw new Error("Sélectionnez une source à téléverser.");
  }

  return forgeSourceRepository.createSource(profile.id, {
    courseId,
    file,
    kind: "file",
    title: getString(formData, "sourceTitle") || file.name
  });
}

export async function addForgeCourseUrlSource(formData: FormData): Promise<CourseSource> {
  const courseId = getString(formData, "courseId") || undefined;
  const originalUrl = getString(formData, "sourceUrl");
  const profile = await requireRole(
    "teacher",
    courseId ? `/app/teacher/courses/${courseId}/edit` : "/app/teacher/courses/forge"
  );
  const retrieved = await retrieveUrlSource(originalUrl);
  const requestedTitle = getString(formData, "sourceTitle");

  return forgeSourceRepository.createSource(profile.id, {
    content: retrieved.content,
    courseId,
    finalUrl: retrieved.finalUrl,
    kind: "url",
    mimeType: retrieved.mimeType,
    originalUrl,
    title: truncate(requestedTitle || retrieved.title || new URL(retrieved.finalUrl).hostname, 180)
  });
}

export async function deleteForgeCourseSource(sourceId: string, courseId?: string) {
  const profile = await requireRole(
    "teacher",
    courseId ? `/app/teacher/courses/${courseId}/edit` : "/app/teacher/courses/forge"
  );
  return forgeSourceRepository.deleteSource(profile.id, sourceId);
}

export async function generateForgeCourseProposal(
  input: CourseBrief
): Promise<ForgeCourseProposal> {
  const profile = await requireRole("teacher", "/app/teacher/courses/forge");
  const startedAt = Date.now();
  const sanitized = sanitizeBrief(input);
  assertCourseBrief(sanitized);
  assertForgeAIRateLimit(profile.id, "course_structure");

  try {
    const context = await getCourseContext(profile.id, sanitized.sourceIds);
    const provider = getForgeAIProvider();
    const response = await provider.generateJson({
      input: sanitized,
      promptType: "course_structure",
      systemPrompt: forgeCourseStructureSystemPrompt,
      userPrompt: buildCourseStructureUserPrompt(sanitized, context)
    });
    const proposal = {
      ...validateForgeCourseProposal(response.json),
      sourceCount: context.sourceCount
    };

    await logForgeGeneration({
      contextType: "teacher_studio",
      durationMs: response.durationMs,
      inputTokens: response.inputTokens,
      model: response.model,
      outputTokens: response.outputTokens,
      promptType: "course_structure",
      provider: response.provider,
      sourceIds: sanitized.sourceIds,
      status: "success",
      totalTokens: response.totalTokens,
      userId: profile.id
    });

    console.info("[forge-ai] course proposal generated", {
      durationMs: response.durationMs,
      model: response.model,
      provider: response.provider,
      sourceCount: context.sourceCount
    });

    return proposal;
  } catch (error) {
    await logFailure(profile.id, "course_structure", startedAt, error, {
      contextType: "teacher_studio",
      sourceIds: sanitized.sourceIds
    });
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
  const domainId = input.brief?.domainId || input.domainId;

  if (modules.length === 0) {
    throw new Error("Sélectionnez au moins un module avec une leçon.");
  }

  const course = await teacherCourseRepository.createCourse(profile.id, {
    description: proposal.summary,
    domainId,
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

  const sourceIds = input.brief?.sourceIds ?? [];

  if (sourceIds.length > 0) {
    await forgeSourceRepository.attachSourcesToCourse(profile.id, sourceIds, course.id);
  }

  await logForgeGeneration({
    contextId: course.id,
    contextType: "course",
    model: getForgeAIConfig().model || "unknown",
    promptType: "course_import",
    provider: getForgeAIConfig().provider,
    sourceIds,
    status: "success",
    userId: profile.id
  });

  return course;
}

export async function generateForgeCourseImprovement(
  input: ForgeCourseImprovementInput
): Promise<ForgeCourseImprovement> {
  const profile = await requireRole("teacher", `/app/teacher/courses/${input.courseId}/edit`);
  const course = await teacherCourseRepository.getTeacherCourse(profile.id, input.courseId);

  if (!course) {
    throw new Error("Formation introuvable ou non modifiable.");
  }

  const startedAt = Date.now();
  const sanitized: ForgeCourseImprovementInput = {
    ...input,
    brief: sanitizeBrief(input.brief, course)
  };

  assertCourseBrief(sanitized.brief);
  assertForgeAIRateLimit(profile.id, "course_improvement");

  try {
    const context = await getCourseContext(profile.id, sanitized.brief.sourceIds);
    const provider = getForgeAIProvider();
    const response = await provider.generateJson({
      input: sanitized,
      promptType: "course_improvement",
      systemPrompt: forgeCourseImprovementSystemPrompt,
      userPrompt: buildCourseImprovementUserPrompt(sanitized, course, context)
    });
    const improvement = {
      ...validateForgeCourseImprovement(response.json),
      sourceCount: context.sourceCount
    };

    await logForgeGeneration({
      contextId: course.id,
      contextType: "course",
      durationMs: response.durationMs,
      inputTokens: response.inputTokens,
      model: response.model,
      outputTokens: response.outputTokens,
      promptType: "course_improvement",
      provider: response.provider,
      sourceIds: sanitized.brief.sourceIds,
      status: "success",
      totalTokens: response.totalTokens,
      userId: profile.id
    });

    console.info("[forge-ai] course improvement generated", {
      courseId: course.id,
      durationMs: response.durationMs,
      model: response.model,
      provider: response.provider,
      sourceCount: context.sourceCount
    });

    return improvement;
  } catch (error) {
    await logFailure(profile.id, "course_improvement", startedAt, error, {
      contextId: course.id,
      contextType: "course",
      sourceIds: sanitized.brief.sourceIds
    });
    throw error;
  }
}

async function generateForgeCourseRevision(
  userId: string,
  course: TeacherCourse,
  input: ForgeCourseRevisionInput,
  moduleId?: string
) {
  const startedAt = Date.now();
  assertForgeAIRateLimit(userId, "course_analysis");

  try {
    const response = await getForgeAIProvider().generateJson({
      input,
      promptType: "course_analysis",
      systemPrompt: forgeCourseRevisionSystemPrompt,
      userPrompt: buildCourseRevisionUserPrompt(input)
    });
    const proposal = moduleId
      ? validateForgeModuleRevisionProposal(response.json, course, moduleId)
      : validateForgeCourseRevisionProposal(response.json, course);

    await logForgeGeneration({
      contextId: course.id,
      contextType: "course",
      durationMs: response.durationMs,
      inputTokens: response.inputTokens,
      model: response.model,
      outputTokens: response.outputTokens,
      promptType: "course_analysis",
      provider: response.provider,
      status: "success",
      totalTokens: response.totalTokens,
      userId
    });

    return proposal;
  } catch (error) {
    await logFailure(userId, "course_analysis", startedAt, error, {
      contextId: course.id,
      contextType: "course"
    });
    throw error;
  }
}

export async function reviewForgeCourseStructure(
  courseId: string
): Promise<ForgeCourseRevisionProposal> {
  const profile = await requireRole("teacher", `/app/teacher/courses/${courseId}/edit`);
  const course = await teacherCourseRepository.getTeacherCourse(profile.id, courseId);

  if (!course) {
    throw new Error("Formation introuvable ou non analysable.");
  }

  return generateForgeCourseRevision(
    profile.id,
    course,
    buildForgeCourseRevisionInput(course)
  );
}

export async function reviewForgeModule(input: {
  courseId: string;
  moduleId: string;
}): Promise<ForgeCourseRevisionProposal> {
  const profile = await requireRole(
    "teacher",
    `/app/teacher/courses/${input.courseId}/builder`
  );
  const course = await teacherCourseRepository.getTeacherCourse(profile.id, input.courseId);

  if (!course) {
    throw new Error("Formation introuvable ou non analysable.");
  }

  if (!course.modules.some((module) => module.id === input.moduleId)) {
    throw new Error("Module introuvable ou non analysable.");
  }

  const revisionInput = buildForgeCourseRevisionInput(course, input.moduleId);
  return generateForgeCourseRevision(profile.id, course, revisionInput, input.moduleId);
}

export async function applyForgeModuleRevision(input: ForgeModuleRevisionApplyInput) {
  const profile = await requireRole(
    "teacher",
    `/app/teacher/courses/${input.courseId}/builder`
  );
  const course = await teacherCourseRepository.getTeacherCourse(profile.id, input.courseId);

  if (!course) {
    throw new Error("Formation introuvable ou non modifiable.");
  }

  const proposal = validateForgeModuleRevisionProposal(
    { issues: [input.issue] },
    course,
    input.moduleId
  );
  const issue = proposal.issues[0];

  if (!issue) {
    throw new Error("Aucune correction de module à appliquer.");
  }

  return teacherCourseRepository.applyModuleRevision(
    profile.id,
    input.courseId,
    input.moduleId,
    {
      current: issue.current,
      proposed: issue.proposed
    }
  );
}

export async function applyForgeCourseImprovement(input: ForgeCourseImprovementApplyInput) {
  const profile = await requireRole("teacher", `/app/teacher/courses/${input.courseId}/edit`);
  const course = await teacherCourseRepository.getTeacherCourse(profile.id, input.courseId);

  if (!course) {
    throw new Error("Formation introuvable ou non modifiable.");
  }

  if (input.suggestion.type === "module") {
    return teacherCourseRepository.createModule(profile.id, course.id, {
      description: input.suggestion.rationale,
      status: "draft",
      title: input.suggestion.proposed.slice(0, 140)
    });
  }

  let moduleId = input.moduleId || course.modules[0]?.id;

  if (!moduleId) {
    const module = await teacherCourseRepository.createModule(profile.id, course.id, {
      description: "Module créé pour accueillir une suggestion Forge AI.",
      status: "draft",
      title: "Compléments proposés par Forge"
    });
    moduleId = module.id;
  }

  return teacherCourseRepository.createLesson(profile.id, course.id, moduleId, {
    content: "",
    description: input.suggestion.rationale,
    durationMinutes: 20,
    objectives: [input.suggestion.rationale ?? "Approfondir le parcours"],
    status: "draft",
    title: input.suggestion.proposed.slice(0, 140),
    type: "reading"
  });
}

export async function generateForgeLessonContent(
  input: ForgeLessonContentInput
): Promise<ForgeLessonContentProposal> {
  const profile = await requireRole("teacher", `/app/teacher/courses/${input.courseId}/builder`);
  const course = await teacherCourseRepository.getTeacherCourse(profile.id, input.courseId);

  if (!course) {
    throw new Error("Formation introuvable ou non modifiable.");
  }

  const { lesson, module, nextLesson, previousLesson } = getLessonContext(course, input.lessonId);

  if (!lesson) {
    throw new Error("Leçon introuvable ou non modifiable.");
  }

  const sources = await forgeSourceRepository.getSources(profile.id, course.id);
  const sourceIds = sources.map((source) => source.id);
  const sanitized = {
    ...sanitizeLessonContentInput({
    ...input,
    content: input.content ?? lesson.content,
    description: input.description ?? lesson.description,
    sourceIds,
    title: input.title || lesson.title
    }),
    lessonType: lesson.type
  };
  const promptType = getLessonPromptType(sanitized.mode);
  const startedAt = Date.now();
  assertForgeAIRateLimit(profile.id, promptType);

  try {
    const query = [
      course.title,
      course.domain.name,
      module?.title,
      lesson.title,
      lesson.description,
      lesson.objectives?.join(" "),
      sanitized.content
    ]
      .filter(Boolean)
      .join(" ");
    const context = await getCourseContext(profile.id, sourceIds, {
      maxSnippets: 6,
      query
    });
    const contextSourceLabels = new Map(
      context.snippets.map((snippet) => [snippet.sourceId, snippet.sourceTitle])
    );
    const provider = getForgeAIProvider();
    const response = await provider.generateJson({
      input: sanitized,
      promptType,
      systemPrompt: forgeLessonContentSystemPrompt,
      userPrompt: buildLessonContentUserPrompt({
        context,
        course,
        input: sanitized,
        lesson,
        module,
        nextLesson,
        previousLesson,
        sourcesCount: sources.length
      })
    });
    const proposal = filterSourceReferences(
      validateForgeLessonContentProposal(response.json),
      contextSourceLabels
    );
    const referencedSourceIds = proposal.sourceReferences.map((reference) => reference.sourceId);

    await logForgeGeneration({
      contextId: lesson.id,
      contextType: "lesson",
      durationMs: response.durationMs,
      inputTokens: response.inputTokens,
      model: response.model,
      outputTokens: response.outputTokens,
      promptType,
      provider: response.provider,
      sourceIds: referencedSourceIds,
      status: "success",
      totalTokens: response.totalTokens,
      userId: profile.id
    });

    console.info("[forge-ai] lesson content proposal generated", {
      durationMs: response.durationMs,
      lessonId: lesson.id,
      model: response.model,
      provider: response.provider,
      sourceCount: referencedSourceIds.length
    });

    return proposal;
  } catch (error) {
    await logFailure(profile.id, promptType, startedAt, error, {
      contextId: lesson.id,
      contextType: "lesson",
      sourceIds
    });
    throw error;
  }
}

export async function applyForgeLessonProposal(input: ForgeLessonProposalApplyInput) {
  const profile = await requireRole("teacher", `/app/teacher/courses/${input.courseId}/builder`);
  const course = await teacherCourseRepository.getTeacherCourse(profile.id, input.courseId);

  if (!course) {
    throw new Error("Formation introuvable ou non modifiable.");
  }

  const { lesson } = getLessonContext(course, input.lessonId);

  if (!lesson) {
    throw new Error("Leçon introuvable ou non modifiable.");
  }

  const proposal = validateForgeLessonContentProposal(input.proposal);

  return teacherCourseRepository.updateLesson(profile.id, course.id, lesson.id, {
    content: proposal.contentMarkdown,
    description: proposal.summary,
    durationMinutes: proposal.estimatedMinutes,
    objectives: proposal.objectives,
    status: lesson.status === "published" ? "published" : "draft",
    title: proposal.title,
    type: lesson.type
  });
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
      inputTokens: response.inputTokens,
      model: response.model,
      outputTokens: response.outputTokens,
      promptType: `lesson_${sanitized.action}` as ForgePromptType,
      provider: response.provider,
      status: "success",
      totalTokens: response.totalTokens,
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
