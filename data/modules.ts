import type { CourseModule } from "@/types/course";
import type { Resource } from "@/types/resource";
import {
  aiFilmmakingLessons,
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
    title: "Strategie et cadrage",
    description: "Transformer une idee en brief exploitable et en parcours utilisateur clair.",
    durationMinutes: 135,
    lessons: webStrategyLessons,
    resources: pickResources(webResources, ["resource-web-brief-checklist"]),
    order: 1
  },
  {
    id: "module-web-02-html",
    slug: "html-et-structure",
    title: "HTML et structure",
    description: "Construire les fondations semantiques et accessibles du site.",
    durationMinutes: 130,
    lessons: webHtmlLessons,
    resources: pickResources(webResources, ["resource-web-html-cheatsheet"]),
    order: 2
  },
  {
    id: "module-web-03-css",
    slug: "css-responsive",
    title: "CSS, responsive et composants",
    description: "Designer une interface propre, responsive et coherent avec CSS.",
    durationMinutes: 190,
    lessons: webCssLessons,
    resources: pickResources(webResources, ["resource-web-css-layout-kit"]),
    order: 3
  },
  {
    id: "module-web-04-next",
    slug: "nextjs-typescript",
    title: "Next.js et TypeScript",
    description: "Structurer l'application, les composants, les donnees et les types.",
    durationMinutes: 180,
    lessons: webNextLessons,
    resources: pickResources(webResources, ["resource-web-next-starter"]),
    order: 4
  },
  {
    id: "module-web-05-launch",
    slug: "qualite-et-publication",
    title: "Qualite et publication",
    description: "Finaliser, tester et publier le projet web sur Netlify.",
    durationMinutes: 145,
    lessons: webLaunchLessons,
    resources: pickResources(webResources, ["resource-web-launch-checklist"]),
    order: 5
  }
] satisfies CourseModule[];

export const aiFilmmakingModules = [
  {
    id: "module-ai-film-01-foundations",
    slug: "foundations",
    title: "AI Filmmaking Foundations",
    description: "Une introduction courte au workflow de creation video assistee par IA.",
    durationMinutes: 100,
    lessons: aiFilmmakingLessons,
    resources: pickResources(aiFilmmakingResources, ["resource-ai-shotlist", "resource-ai-prompt-bank"]),
    order: 1
  }
] satisfies CourseModule[];

export const modules = [...webCourseModules, ...aiFilmmakingModules] satisfies CourseModule[];
