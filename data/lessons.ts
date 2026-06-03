import type { Lesson } from "@/types/learning";
import type { Resource } from "@/types/resource";
import { aiFilmmakingResources, webResources } from "@/data/resources";

function pickResources(resources: Resource[], ids: string[]) {
  return resources.filter((resource) => ids.includes(resource.id));
}

export const webStrategyLessons = [
  {
    id: "lesson-web-brief",
    slug: "brief-et-objectifs",
    title: "Brief, cible et objectifs",
    type: "reading",
    description: "Transformer une idee en brief clair pour guider toute la creation du site.",
    durationMinutes: 35,
    status: "available",
    contentPath: "content/lessons/web/brief-et-objectifs.md",
    objectives: ["Definir une cible", "Clarifier l'offre", "Lister les pages prioritaires"],
    resources: pickResources(webResources, ["resource-web-brief-checklist"]),
    order: 1
  },
  {
    id: "lesson-web-arborescence",
    slug: "arborescence-et-parcours",
    title: "Arborescence et parcours utilisateur",
    type: "exercise",
    description: "Organiser les pages, sections et appels a l'action avant de coder.",
    durationMinutes: 45,
    status: "available",
    contentPath: "content/lessons/web/arborescence-et-parcours.md",
    objectives: ["Structurer les pages", "Prioriser les contenus", "Preparer la navigation"],
    order: 2
  },
  {
    id: "lesson-web-wireframe",
    slug: "wireframe-rapide",
    title: "Wireframe rapide",
    type: "project",
    description: "Dessiner la structure de la page principale pour eviter les decisions au hasard.",
    durationMinutes: 55,
    status: "available",
    contentPath: "content/lessons/web/wireframe-rapide.md",
    objectives: ["Placer les sections", "Prevoir les blocs de contenu", "Valider la hierarchie visuelle"],
    order: 3
  }
] satisfies Lesson[];

export const webHtmlLessons = [
  {
    id: "lesson-web-html-structure",
    slug: "structure-html-semantique",
    title: "Structure HTML semantique",
    type: "video",
    description: "Construire une page lisible avec les balises HTML adaptees.",
    durationMinutes: 50,
    status: "available",
    videoUrl: "/videos/web/structure-html-semantique.mp4",
    contentPath: "content/lessons/web/structure-html-semantique.md",
    objectives: ["Utiliser header, main, section et footer", "Creer une structure accessible"],
    resources: pickResources(webResources, ["resource-web-html-cheatsheet"]),
    order: 1
  },
  {
    id: "lesson-web-html-content",
    slug: "contenus-et-liens",
    title: "Contenus, liens et medias",
    type: "exercise",
    description: "Ajouter textes, liens, images et boutons dans une page coherente.",
    durationMinutes: 45,
    status: "available",
    contentPath: "content/lessons/web/contenus-et-liens.md",
    objectives: ["Creer des liens fiables", "Organiser les textes", "Preparer les medias"],
    order: 2
  },
  {
    id: "lesson-web-html-accessibility",
    slug: "bases-accessibilite",
    title: "Bases d'accessibilite",
    type: "reading",
    description: "Appliquer les premieres bonnes pratiques pour rendre le site plus utilisable.",
    durationMinutes: 35,
    status: "available",
    contentPath: "content/lessons/web/bases-accessibilite.md",
    objectives: ["Soigner les textes alternatifs", "Verifier les titres", "Nommer les actions"],
    order: 3
  }
] satisfies Lesson[];

export const webCssLessons = [
  {
    id: "lesson-web-css-tokens",
    slug: "couleurs-typo-espacements",
    title: "Couleurs, typographie et espacements",
    type: "video",
    description: "Mettre en place une base visuelle propre et reutilisable.",
    durationMinutes: 55,
    status: "available",
    contentPath: "content/lessons/web/couleurs-typo-espacements.md",
    objectives: ["Choisir une palette", "Definir une echelle de titres", "Stabiliser les espacements"],
    order: 1
  },
  {
    id: "lesson-web-css-layout",
    slug: "flexbox-grid-responsive",
    title: "Flexbox, Grid et responsive",
    type: "exercise",
    description: "Creer des layouts qui restent lisibles sur mobile et desktop.",
    durationMinutes: 70,
    status: "available",
    contentPath: "content/lessons/web/flexbox-grid-responsive.md",
    objectives: ["Utiliser Flexbox", "Composer une grille", "Adapter les ruptures mobile"],
    resources: pickResources(webResources, ["resource-web-css-layout-kit"]),
    order: 2
  },
  {
    id: "lesson-web-css-components",
    slug: "composants-ui",
    title: "Composants UI reutilisables",
    type: "project",
    description: "Construire boutons, cartes et sections avec une logique coherent.",
    durationMinutes: 65,
    status: "available",
    contentPath: "content/lessons/web/composants-ui.md",
    objectives: ["Factoriser les styles", "Garder une interface coherente", "Preparer la maintenance"],
    order: 3
  }
] satisfies Lesson[];

export const webNextLessons = [
  {
    id: "lesson-web-next-setup",
    slug: "demarrer-nextjs",
    title: "Demarrer avec Next.js",
    type: "video",
    description: "Installer et comprendre la structure d'une application Next.js avec App Router.",
    durationMinutes: 50,
    status: "available",
    contentPath: "content/lessons/web/demarrer-nextjs.md",
    objectives: ["Comprendre app/", "Utiliser les composants", "Importer les styles globaux"],
    resources: pickResources(webResources, ["resource-web-next-starter"]),
    order: 1
  },
  {
    id: "lesson-web-next-data",
    slug: "donnees-et-types",
    title: "Donnees et types TypeScript",
    type: "exercise",
    description: "Structurer le contenu du site avec des fichiers de donnees types.",
    durationMinutes: 55,
    status: "available",
    contentPath: "content/lessons/web/donnees-et-types.md",
    objectives: ["Creer des types", "Organiser data/", "Eviter les donnees dupliquees"],
    order: 2
  },
  {
    id: "lesson-web-next-page",
    slug: "assembler-page",
    title: "Assembler une page complete",
    type: "project",
    description: "Brancher les sections, les donnees et les styles dans une page Next.js.",
    durationMinutes: 75,
    status: "available",
    contentPath: "content/lessons/web/assembler-page.md",
    objectives: ["Composer les sections", "Relire les imports", "Tester la page"],
    order: 3
  }
] satisfies Lesson[];

export const webLaunchLessons = [
  {
    id: "lesson-web-quality",
    slug: "qualite-avant-publication",
    title: "Qualite avant publication",
    type: "quiz",
    description: "Verifier lisibilite, responsive, accessibilite et performance avant livraison.",
    durationMinutes: 40,
    status: "available",
    contentPath: "content/lessons/web/qualite-avant-publication.md",
    objectives: ["Tester les tailles d'ecran", "Controler les liens", "Corriger les erreurs visibles"],
    resources: pickResources(webResources, ["resource-web-launch-checklist"]),
    order: 1
  },
  {
    id: "lesson-web-netlify",
    slug: "deployer-netlify",
    title: "Deployer sur Netlify",
    type: "video",
    description: "Configurer le build et publier le projet depuis la racine du depot.",
    durationMinutes: 45,
    status: "available",
    contentPath: "content/lessons/web/deployer-netlify.md",
    objectives: ["Configurer le build", "Publier .next", "Verifier la production"],
    resources: pickResources(webResources, ["resource-web-launch-checklist"]),
    order: 2
  },
  {
    id: "lesson-web-final-review",
    slug: "revue-projet-final",
    title: "Revue du projet final",
    type: "project",
    description: "Presenter le site, identifier les ameliorations et preparer la suite.",
    durationMinutes: 60,
    status: "available",
    contentPath: "content/lessons/web/revue-projet-final.md",
    objectives: ["Presenter le resultat", "Prioriser les ameliorations", "Preparer le portfolio"],
    order: 3
  }
] satisfies Lesson[];

export const aiFilmmakingLessons = [
  {
    id: "lesson-ai-film-concept",
    slug: "concept-video-courte",
    title: "Concept d'une video courte",
    type: "reading",
    description: "Passer d'une intention creative a une idee de sequence simple.",
    durationMinutes: 25,
    status: "available",
    contentPath: "content/lessons/ai-filmmaking/concept-video-courte.md",
    objectives: ["Definir une intention", "Choisir un format court"],
    resources: pickResources(aiFilmmakingResources, ["resource-ai-shotlist"]),
    order: 1
  },
  {
    id: "lesson-ai-film-prompts",
    slug: "prompts-video-ia",
    title: "Prompts video IA",
    type: "exercise",
    description: "Ecrire des prompts courts pour decrire le sujet, la camera et l'ambiance.",
    durationMinutes: 35,
    status: "available",
    contentPath: "content/lessons/ai-filmmaking/prompts-video-ia.md",
    objectives: ["Decrire un plan", "Controler le style", "Iterer rapidement"],
    resources: pickResources(aiFilmmakingResources, ["resource-ai-prompt-bank"]),
    order: 2
  },
  {
    id: "lesson-ai-film-demo-edit",
    slug: "montage-demo",
    title: "Montage demo",
    type: "project",
    description: "Assembler quelques plans generes dans une demonstration courte.",
    durationMinutes: 40,
    status: "available",
    contentPath: "content/lessons/ai-filmmaking/montage-demo.md",
    objectives: ["Selectionner les plans", "Construire une sequence", "Exporter une demo"],
    order: 3
  }
] satisfies Lesson[];

export const webLessons = [
  ...webStrategyLessons,
  ...webHtmlLessons,
  ...webCssLessons,
  ...webNextLessons,
  ...webLaunchLessons
] satisfies Lesson[];

export const lessons = [...webLessons, ...aiFilmmakingLessons] satisfies Lesson[];
