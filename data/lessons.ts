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
    description: "Transformer une idée en brief clair pour guider toute la création du site.",
    durationMinutes: 35,
    status: "available",
    contentPath: "content/lessons/web/brief-et-objectifs.md",
    objectives: ["Définir une cible", "Clarifier l'offre", "Lister les pages prioritaires"],
    resources: pickResources(webResources, ["resource-web-brief-checklist"]),
    order: 1
  },
  {
    id: "lesson-web-arborescence",
    slug: "arborescence-et-parcours",
    title: "Arborescence et parcours utilisateur",
    type: "exercise",
    description: "Organiser les pages, sections et appels à l'action avant de coder.",
    durationMinutes: 45,
    status: "available",
    contentPath: "content/lessons/web/arborescence-et-parcours.md",
    objectives: ["Structurer les pages", "Prioriser les contenus", "Préparer la navigation"],
    order: 2
  },
  {
    id: "lesson-web-wireframe",
    slug: "wireframe-rapide",
    title: "Wireframe rapide",
    type: "project",
    description: "Dessiner la structure de la page principale pour éviter les décisions au hasard.",
    durationMinutes: 55,
    status: "available",
    contentPath: "content/lessons/web/wireframe-rapide.md",
    objectives: ["Placer les sections", "Prévoir les blocs de contenu", "Valider la hiérarchie visuelle"],
    order: 3
  }
] satisfies Lesson[];

export const webHtmlLessons = [
  {
    id: "lesson-web-html-structure",
    slug: "structure-html-semantique",
    title: "Structure HTML sémantique",
    type: "video",
    description: "Construire une page lisible avec les balises HTML adaptées.",
    durationMinutes: 50,
    status: "available",
    videoUrl: "/videos/web/structure-html-semantique.mp4",
    contentPath: "content/lessons/web/structure-html-semantique.md",
    objectives: ["Utiliser header, main, section et footer", "Créer une structure accessible"],
    resources: pickResources(webResources, ["resource-web-html-cheatsheet"]),
    order: 1
  },
  {
    id: "lesson-web-html-content",
    slug: "contenus-et-liens",
    title: "Contenus, liens et medias",
    type: "exercise",
    description: "Ajouter textes, liens, images et boutons dans une page cohérente.",
    durationMinutes: 45,
    status: "available",
    contentPath: "content/lessons/web/contenus-et-liens.md",
    objectives: ["Créer des liens fiables", "Organiser les textes", "Préparer les médias"],
    order: 2
  },
  {
    id: "lesson-web-html-accessibility",
    slug: "bases-accessibilite",
    title: "Bases d'accessibilité",
    type: "reading",
    description: "Appliquer les premières bonnes pratiques pour rendre le site plus utilisable.",
    durationMinutes: 35,
    status: "available",
    contentPath: "content/lessons/web/bases-accessibilite.md",
    objectives: ["Soigner les textes alternatifs", "Vérifier les titres", "Nommer les actions"],
    order: 3
  }
] satisfies Lesson[];

export const webCssLessons = [
  {
    id: "lesson-web-css-tokens",
    slug: "couleurs-typo-espacements",
    title: "Couleurs, typographie et espacements",
    type: "video",
    description: "Mettre en place une base visuelle propre et réutilisable.",
    durationMinutes: 55,
    status: "available",
    contentPath: "content/lessons/web/couleurs-typo-espacements.md",
    objectives: ["Choisir une palette", "Définir une échelle de titres", "Stabiliser les espacements"],
    order: 1
  },
  {
    id: "lesson-web-css-layout",
    slug: "flexbox-grid-responsive",
    title: "Flexbox, Grid et responsive",
    type: "exercise",
    description: "Créer des layouts qui restent lisibles sur mobile et desktop.",
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
    title: "Composants UI réutilisables",
    type: "project",
    description: "Construire boutons, cartes et sections avec une logique cohérente.",
    durationMinutes: 65,
    status: "available",
    contentPath: "content/lessons/web/composants-ui.md",
    objectives: ["Factoriser les styles", "Garder une interface cohérente", "Préparer la maintenance"],
    order: 3
  }
] satisfies Lesson[];

export const webNextLessons = [
  {
    id: "lesson-web-next-setup",
    slug: "demarrer-nextjs",
    title: "Démarrer avec Next.js",
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
    title: "Données et types TypeScript",
    type: "exercise",
    description: "Structurer le contenu du site avec des fichiers de données typées.",
    durationMinutes: 55,
    status: "available",
    contentPath: "content/lessons/web/donnees-et-types.md",
    objectives: ["Créer des types", "Organiser data/", "Éviter les données dupliquées"],
    order: 2
  },
  {
    id: "lesson-web-next-page",
    slug: "assembler-page",
    title: "Assembler une page complète",
    type: "project",
    description: "Brancher les sections, les données et les styles dans une page Next.js.",
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
    title: "Qualité avant publication",
    type: "quiz",
    description: "Vérifier lisibilité, responsive, accessibilité et performance avant livraison.",
    durationMinutes: 40,
    status: "available",
    contentPath: "content/lessons/web/qualite-avant-publication.md",
    objectives: ["Tester les tailles d'écran", "Contrôler les liens", "Corriger les erreurs visibles"],
    resources: pickResources(webResources, ["resource-web-launch-checklist"]),
    order: 1
  },
  {
    id: "lesson-web-netlify",
    slug: "deployer-netlify",
    title: "Déployer sur Netlify",
    type: "video",
    description: "Configurer le build et publier le projet depuis la racine du dépôt.",
    durationMinutes: 45,
    status: "available",
    contentPath: "content/lessons/web/deployer-netlify.md",
    objectives: ["Configurer le build", "Publier .next", "Vérifier la production"],
    resources: pickResources(webResources, ["resource-web-launch-checklist"]),
    order: 2
  },
  {
    id: "lesson-web-final-review",
    slug: "revue-projet-final",
    title: "Revue du projet final",
    type: "project",
    description: "Présenter le site, identifier les améliorations et préparer la suite.",
    durationMinutes: 60,
    status: "available",
    contentPath: "content/lessons/web/revue-projet-final.md",
    objectives: ["Présenter le résultat", "Prioriser les améliorations", "Préparer le portfolio"],
    order: 3
  }
] satisfies Lesson[];

export const aiFilmmakingLessons = [
  {
    id: "lesson-ai-film-concept",
    slug: "concept-video-courte",
    title: "Concept d'une vidéo courte",
    type: "reading",
    description: "Passer d'une intention créative à une idée de séquence simple.",
    durationMinutes: 25,
    status: "available",
    contentPath: "content/lessons/ai-filmmaking/concept-video-courte.md",
    objectives: ["Définir une intention", "Choisir un format court"],
    resources: pickResources(aiFilmmakingResources, ["resource-ai-shotlist"]),
    order: 1
  },
  {
    id: "lesson-ai-film-prompts",
    slug: "prompts-video-ia",
    title: "Prompts vidéo IA",
    type: "exercise",
    description: "Écrire des prompts courts pour décrire le sujet, la caméra et l'ambiance.",
    durationMinutes: 35,
    status: "available",
    contentPath: "content/lessons/ai-filmmaking/prompts-video-ia.md",
    objectives: ["Décrire un plan", "Contrôler le style", "Itérer rapidement"],
    resources: pickResources(aiFilmmakingResources, ["resource-ai-prompt-bank"]),
    order: 2
  },
  {
    id: "lesson-ai-film-demo-edit",
    slug: "montage-demo",
    title: "Montage démo",
    type: "project",
    description: "Assembler quelques plans générés dans une démonstration courte.",
    durationMinutes: 40,
    status: "available",
    contentPath: "content/lessons/ai-filmmaking/montage-demo.md",
    objectives: ["Sélectionner les plans", "Construire une séquence", "Exporter une démo"],
    order: 3
  }
] satisfies Lesson[];

export const wordpressPreviewLessons = [
  {
    id: "lesson-wordpress-positioning",
    slug: "positionner-son-site",
    title: "Positionner son site d'indépendant",
    type: "reading",
    description: "Identifier l'offre, les pages essentielles et les contenus a préparer avant WordPress.",
    durationMinutes: 30,
    status: "locked",
    contentPath: "content/lessons/wordpress/positionner-son-site.md",
    objectives: ["Clarifier son offre", "Lister les pages prioritaires", "Préparer les contenus"],
    order: 1
  },
  {
    id: "lesson-wordpress-site-vitrine",
    slug: "site-vitrine-wordpress",
    title: "Assembler un site vitrine WordPress",
    type: "project",
    description: "Construire une premiere structure de site vitrine avec pages, menu et formulaire.",
    durationMinutes: 45,
    status: "locked",
    contentPath: "content/lessons/wordpress/site-vitrine-wordpress.md",
    objectives: ["Créer les pages clés", "Configurer la navigation", "Préparer le formulaire"],
    order: 2
  }
] satisfies Lesson[];

export const promptDesignPreviewLessons = [
  {
    id: "lesson-prompt-creative-brief",
    slug: "brief-creatif-prompt",
    title: "Brief créatif et intention",
    type: "reading",
    description: "Transformer une intention visuelle ou éditoriale en brief exploitable pour l'IA.",
    durationMinutes: 25,
    status: "locked",
    contentPath: "content/lessons/prompt-design/brief-creatif-prompt.md",
    objectives: ["Définir l'intention", "Décrire le style", "Structurer une demande"],
    order: 1
  },
  {
    id: "lesson-prompt-iteration",
    slug: "iterer-ses-prompts",
    title: "Itérer ses prompts",
    type: "exercise",
    description: "Comparer plusieurs variantes et affiner le résultat avec des contraintes claires.",
    durationMinutes: 35,
    status: "locked",
    contentPath: "content/lessons/prompt-design/iterer-ses-prompts.md",
    objectives: ["Tester des variantes", "Analyser le rendu", "Améliorer les consignes"],
    order: 2
  }
] satisfies Lesson[];

export const webLessons = [
  ...webStrategyLessons,
  ...webHtmlLessons,
  ...webCssLessons,
  ...webNextLessons,
  ...webLaunchLessons
] satisfies Lesson[];

export const lessons = [
  ...webLessons,
  ...aiFilmmakingLessons,
  ...wordpressPreviewLessons,
  ...promptDesignPreviewLessons
] satisfies Lesson[];
