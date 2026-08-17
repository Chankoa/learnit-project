import type { CourseLevel } from "@/types/course";

export type ForgePromptType =
  | "course_structure"
  | "course_import"
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
  summary: string;
  title: string;
};

export type ForgeCourseImportSelection = {
  lessonIds: string[];
  moduleIds: string[];
};

export type ForgeCourseImportInput = {
  domainId: string;
  proposal: ForgeCourseProposal;
  selection: ForgeCourseImportSelection;
};

export type ForgeLessonAction =
  | "plan"
  | "intro"
  | "summary"
  | "simplify";

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
