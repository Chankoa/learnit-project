import type { CourseModule } from "@/types/course";
import type { Resource } from "@/types/resource";
import {
  aiFilmmakingLessons,
  promptDesignPreviewLessons,
  wordpressPreviewLessons,
  webCssLessons,
  webHtmlLessons,
  webLaunchLessons,
  webNextLessons,
  webStrategyLessons
} from "@/data/lessons";
import { aiFilmmakingResources, webResources } from "@/data/resources";

function pickResources(resources: Resource[], ids: string[]) {
  return resources.filter((resource) => ids.includes(resource.id));
}

export const webCourseModules = [
  {
    id: "module-web-01-strategy",
    slug: "strategie-et-cadrage",
    title: "Stratégie et cadrage",
    description: "Transformer une idée en brief exploitable et en parcours utilisateur clair.",
    durationMinutes: 135,
    lessons: webStrategyLessons,
    resources: pickResources(webResources, ["resource-web-brief-checklist"]),
    order: 1
  },
  {
    id: "module-web-02-html",
    slug: "html-et-structure",
    title: "HTML et structure",
    description: "Construire les fondations sémantiques et accessibles du site.",
    durationMinutes: 130,
    lessons: webHtmlLessons,
    resources: pickResources(webResources, ["resource-web-html-cheatsheet"]),
    order: 2
  },
  {
    id: "module-web-03-css",
    slug: "css-responsive",
    title: "CSS, responsive et composants",
    description: "Designer une interface propre, responsive et cohérente avec CSS.",
    durationMinutes: 190,
    lessons: webCssLessons,
    resources: pickResources(webResources, ["resource-web-css-layout-kit"]),
    order: 3
  },
  {
    id: "module-web-04-next",
    slug: "nextjs-typescript",
    title: "Next.js et TypeScript",
    description: "Structurer l'application, les composants, les données et les types.",
    durationMinutes: 180,
    lessons: webNextLessons,
    resources: pickResources(webResources, ["resource-web-next-starter"]),
    order: 4
  },
  {
    id: "module-web-05-launch",
    slug: "qualite-et-publication",
    title: "Qualité et publication",
    description: "Finaliser, tester et publier le projet web sur Netlify.",
    durationMinutes: 145,
    lessons: webLaunchLessons,
    resources: pickResources(webResources, ["resource-web-launch-checklist"]),
    order: 5
  }
] satisfies CourseModule[];

export const aiFilmmakingModules = [
  {
    id: "module-ai-film-01-preproduction",
    slug: "preproduction-et-concept",
    title: "Préproduction IA et concept",
    description: "Module prévisionnel pour cadrer l'intention, le format court et la première shotlist.",
    durationMinutes: 45,
    lessons: aiFilmmakingLessons.filter((lesson) => lesson.id === "lesson-ai-film-concept"),
    resources: pickResources(aiFilmmakingResources, ["resource-ai-shotlist"]),
    order: 1
  },
  {
    id: "module-ai-film-02-prompts",
    slug: "prompts-video-et-direction-artistique",
    title: "Prompts vidéo et direction artistique",
    description: "Module prévisionnel pour écrire des prompts vidéo, contrôler le style et itérer sur les plans.",
    durationMinutes: 55,
    lessons: aiFilmmakingLessons.filter((lesson) => lesson.id === "lesson-ai-film-prompts"),
    resources: pickResources(aiFilmmakingResources, ["resource-ai-prompt-bank"]),
    order: 2
  },
  {
    id: "module-ai-film-03-montage-demo",
    slug: "montage-demo-et-export",
    title: "Montage démo et export",
    description: "Module prévisionnel pour sélectionner les plans générés et assembler une séquence courte.",
    durationMinutes: 50,
    lessons: aiFilmmakingLessons.filter((lesson) => lesson.id === "lesson-ai-film-demo-edit"),
    order: 3
  }
] satisfies CourseModule[];

export const wordpressModules = [
  {
    id: "module-wordpress-01-preview",
    slug: "apercu-site-independant",
    title: "Aperçu du parcours WordPress",
    description: "Une fiche courte pour préparer un futur parcours WordPress pour indépendants.",
    durationMinutes: 75,
    lessons: wordpressPreviewLessons,
    order: 1
  }
] satisfies CourseModule[];

export const promptDesignModules = [
  {
    id: "module-prompt-design-01-preview",
    slug: "apercu-prompt-design",
    title: "Aperçu Prompt Design",
    description: "Une introduction courte pour tester un workflow de prompt créatif.",
    durationMinutes: 60,
    lessons: promptDesignPreviewLessons,
    order: 1
  }
] satisfies CourseModule[];

export const modules = [
  ...webCourseModules,
  ...wordpressModules,
  ...aiFilmmakingModules,
  ...promptDesignModules
] satisfies CourseModule[];
