import type { ComponentType } from "react";

import AiFilmmakingIntroduction from "@/content/lessons/ai-filmmaking-foundations/introduction.mdx";
import WebCreationIntroduction from "@/content/lessons/formation-creation-web/introduction.mdx";

type LessonMdxComponent = ComponentType<Record<string, unknown>>;

const lessonMdxRegistry: Record<string, LessonMdxComponent> = {
  "formation-creation-web/brief-et-objectifs": WebCreationIntroduction,
  "ai-filmmaking-foundations/concept-video-courte": AiFilmmakingIntroduction
};

export function getLessonMdxComponent(
  courseSlug: string,
  lessonSlug: string
) {
  return lessonMdxRegistry[`${courseSlug}/${lessonSlug}`];
}
