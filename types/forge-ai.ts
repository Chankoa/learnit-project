import type { CourseLevel } from "@/types/course";

export type ForgePromptType =
  | "course_structure"
  | "course_improvement"
  | "course_import"
  | "lesson_generate"
  | "lesson_improve"
  | "lesson_expand"
  | "lesson_examples"
  | "lesson_exercise"
  | "lesson_analyze"
  | "lesson_plan"
  | "lesson_intro"
  | "lesson_summary"
  | "lesson_simplify";

export type ForgeGenerationStatus =
  | "success"
  | "error"
  | "invalid_output"
  | "rate_limited";

export type ForgeCourseIntent = {
  audience: string;
  constraints?: string;
  domainId: string;
  duration?: string;
  goal: string;
  level: CourseLevel;
  subject: string;
  tone?: string;
};

export type CourseBrief = {
  constraints?: string;
  domainId: string;
  duration?: string;
  entryLevel: CourseLevel;
  learningObjectives: string[];
  prerequisites?: string;
  sourceIds?: string[];
  sources?: CourseSource[];
  subject: string;
  targetAudience: string;
  targetLevel: CourseLevel;
};

export type CourseSourceType = "pdf" | "text" | "markdown" | "docx";

export type CourseSource = {
  courseId?: string;
  createdAt: string;
  fileName: string;
  fileSize: number;
  id: string;
  metadata?: Record<string, unknown>;
  mimeType: string;
  storageBucket: string;
  storagePath: string;
  teacherId: string;
  title: string;
  type: CourseSourceType;
  updatedAt: string;
};

export type CourseContextSnippet = {
  sourceId: string;
  sourceTitle: string;
  text: string;
};

export type CourseContext = {
  sourceCount: number;
  snippets: CourseContextSnippet[];
};

export type ForgeLessonProposal = {
  clientId: string;
  estimatedMinutes?: number;
  objective?: string;
  title: string;
};

export type ForgeModuleProposal = {
  clientId: string;
  description?: string;
  lessons: ForgeLessonProposal[];
  title: string;
};

export type ForgeCourseProposal = {
  audience: string;
  level: CourseLevel;
  modules: ForgeModuleProposal[];
  objectives: string[];
  prerequisites?: string[];
  sourceCount?: number;
  summary: string;
  title: string;
};

export type ForgeCourseImportSelection = {
  lessonIds: string[];
  moduleIds: string[];
};

export type ForgeCourseImportInput = {
  brief?: CourseBrief;
  domainId: string;
  proposal: ForgeCourseProposal;
  selection: ForgeCourseImportSelection;
};

export type ForgeCourseImprovementInput = {
  brief: CourseBrief;
  courseId: string;
  mode: "analyze" | "improve_structure";
};

export type ForgeCourseImprovementApplyInput = {
  courseId: string;
  moduleId?: string;
  suggestion: {
    proposed: string;
    rationale?: string;
    type: "module" | "lesson";
  };
};

export type ForgeCourseImprovement = {
  summary: string;
  sourceCount: number;
  suggestions: Array<{
    clientId: string;
    current?: string;
    proposed: string;
    rationale: string;
    type: "module" | "lesson" | "rename" | "reorder" | "gap" | "duration";
  }>;
  title: string;
};

export type ForgeLessonAction =
  | "plan"
  | "intro"
  | "summary"
  | "simplify";

export type ForgeLessonContentMode =
  | "generate"
  | "improve"
  | "simplify"
  | "expand"
  | "intro"
  | "summary"
  | "examples"
  | "exercise"
  | "analyze";

export type ForgeSourceReference = {
  excerpt?: string;
  label: string;
  sourceId: string;
};

export type ForgeLessonContentInput = {
  content?: string;
  courseId: string;
  description?: string;
  lessonId: string;
  mode: ForgeLessonContentMode;
  sourceIds?: string[];
  title?: string;
};

export type ForgeLessonContentProposal = {
  contentMarkdown: string;
  estimatedMinutes: number;
  keyPoints: string[];
  objectives: string[];
  sourceReferences: ForgeSourceReference[];
  summary: string;
  title: string;
};

export type ForgeLessonProposalApplyInput = {
  courseId: string;
  lessonId: string;
  proposal: ForgeLessonContentProposal;
};

export type ForgeLessonSuggestionInput = {
  action: ForgeLessonAction;
  content?: string;
  courseId: string;
  description?: string;
  lessonId: string;
  title: string;
};

export type ForgeLessonSuggestion = {
  action: ForgeLessonAction;
  content: string;
  title: string;
};
