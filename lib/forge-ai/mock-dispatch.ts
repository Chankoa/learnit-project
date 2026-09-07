import type { ForgePromptType } from "@/types/forge-ai";

export type MockForgeRequestKind =
  | "course-improvement"
  | "course-revision"
  | "course-structure"
  | "learner"
  | "lesson-content"
  | "lesson-suggestion"
  | "unsupported";

export function getMockForgeRequestKind(promptType: ForgePromptType): MockForgeRequestKind {
  switch (promptType) {
    case "course_structure":
      return "course-structure";
    case "course_improvement":
      return "course-improvement";
    case "course_analysis":
      return "course-revision";
    case "lesson_generate":
    case "lesson_improve":
    case "lesson_expand":
    case "lesson_examples":
    case "lesson_exercise":
    case "lesson_analyze":
      return "lesson-content";
    case "lesson_plan":
    case "lesson_intro":
    case "lesson_summary":
    case "lesson_simplify":
      return "lesson-suggestion";
    case "learner_explain":
    case "learner_clarify":
    case "learner_rephrase":
    case "learner_example":
    case "learner_question":
    case "learner_freeform":
      return "learner";
    case "course_import":
      return "unsupported";
  }

  return "unsupported";
}