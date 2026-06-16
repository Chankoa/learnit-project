import type { Course } from "@/types/course";
import { aiFilmmakingDomain, webCreationDomain } from "@/data/domains";
import { aiFilmmakingModules, promptDesignModules, webCourseModules, wordpressModules } from "@/data/modules";
import {
  aiFilmmakingFAQ,
  aiFilmmakingResources,
  instructors,
  webCourseFAQ,
  webResources
} from "@/data/resources";

export const webCreationCourse = {
  id: "course-formation-creation-web",
  slug: "formation-creation-web",
  title: "Formation création web",
  subtitle: "De l'idée au site publié avec HTML, CSS, Next.js et Netlify",
  description:
    "Une formation complète et progressive pour concevoir, développer, tester et publier un site web professionnel. Le parcours part du cadrage du projet, avance vers les bases HTML/CSS, introduit une structure Next.js typée, puis se termine par une mise en ligne propre sur Netlify.",
  domain: webCreationDomain,
  level: "beginner",
  status: "published",
  visibility: "public",
  availability: "complete",
  modules: webCourseModules,
  instructors: instructors.filter((instructor) => instructor.id === "instructor-rexcode-web"),
  resources: webResources,
  faq: webCourseFAQ,
  audience: [
    "Débutants motivés qui veulent apprendre les bases solides du web",
    "Indépendants qui souhaitent créer ou améliorer leur site vitrine",
    "Entrepreneurs qui veulent mieux piloter leur présence en ligne",
    "Créatifs qui veulent publier un projet web professionnel sans dépendre d'un template"
  ],
  objectives: [
    "Transformer une idée en brief exploitable, avec cible, objectifs et pages prioritaires",
    "Structurer une page accessible avec HTML sémantique",
    "Créer une interface responsive avec CSS, Flexbox, Grid et composants réutilisables",
    "Organiser une application Next.js avec l'App Router, TypeScript et des données statiques typées",
    "Vérifier la qualité du projet : responsive, accessibilité, liens, performance et cohérence visuelle",
    "Préparer un déploiement Netlify depuis la racine du projet"
  ],
  requirements: [
    "Aucune expérience avancée en code n'est nécessaire",
    "Savoir utiliser un navigateur, créer des fichiers et organiser des dossiers",
    "Un ordinateur capable de lancer un environnement de développement local",
    "Une connexion internet pour installer les dépendances et publier le projet",
    "Une disponibilité régulière pour pratiquer sur le projet final"
  ],
  method: [
    "Leçons courtes orientées pratique, avec un objectif clair à chaque étape",
    "Exercices progressifs pour appliquer immédiatement HTML, CSS, Next.js et TypeScript",
    "Construction d'un projet final publiable, section par section",
    "Points de contrôle qualité avant chaque grande étape",
    "Ressources téléchargeables pour cadrer, coder, relire et livrer"
  ],
  featured: true,
  featuredOrder: 1,
  coverImage: "/images/courses/web-creation-cover.png",
  durationMinutes: 780,
  format: "Formation guidée",
  tags: ["html", "css", "nextjs", "typescript", "netlify"],
  createdBy: "admin-rekode",
  publishedAt: "2026-06-03",
  updatedAt: "2026-06-03"
} satisfies Course;

export const aiFilmmakingCourse = {
  id: "course-ai-filmmaking-foundations",
  slug: "ai-filmmaking-foundations",
  title: "AI Filmmaking Foundations",
  subtitle: "Concevoir une vidéo courte avec un workflow IA clair, de l'idée au montage démo",
  description:
    "Une formation en aperçu pour découvrir les bases de la création audiovisuelle assistée par IA. Le parcours pose les fondations d'un workflow court : intention créative, préproduction, prompts vidéo, cohérence visuelle, sélection des plans et assemblage d'une première séquence de démonstration.",
  domain: aiFilmmakingDomain,
  level: "beginner",
  status: "published",
  visibility: "public",
  availability: "preview",
  modules: aiFilmmakingModules,
  instructors: instructors.filter((instructor) => instructor.id === "instructor-ai-studio"),
  resources: aiFilmmakingResources,
  faq: aiFilmmakingFAQ,
  audience: [
    "Créatifs qui veulent tester la vidéo générative sans partir dans un workflow complexe",
    "Indépendants, communicants et créateurs de contenu qui préparent des formats courts",
    "Réalisateurs, monteurs ou designers curieux d'intégrer l'IA dans une phase d'exploration",
    "Débutants qui veulent comprendre les étapes avant de produire une séquence complète"
  ],
  objectives: [
    "Transformer une intention créative en concept vidéo simple",
    "Préparer une mini shotlist adaptée aux outils de génération vidéo IA",
    "Rédiger des prompts qui décrivent sujet, mouvement caméra, ambiance et style",
    "Comparer plusieurs générations pour choisir les plans les plus cohérents",
    "Assembler une courte démonstration vidéo et identifier les limites du workflow"
  ],
  featured: false,
  coverImage: "/images/courses/ai-creative-media-cover.png",
  durationMinutes: 150,
  format: "Fiche aperçu",
  tags: ["ia", "video", "prompt", "filmmaking"],
  createdBy: "admin-rekode",
  publishedAt: "2026-06-03",
  updatedAt: "2026-06-03"
} satisfies Course;

export const wordpressForIndependentsCourse = {
  id: "course-wordpress-independants",
  slug: "wordpress-pour-independants",
  title: "WordPress pour indépendants",
  description:
    "Un futur parcours pratique pour créer un site vitrine WordPress clair, crédible et facile à maintenir.",
  domain: webCreationDomain,
  level: "beginner",
  status: "published",
  visibility: "public",
  availability: "coming-soon",
  modules: wordpressModules,
  instructors: instructors.filter((instructor) => instructor.id === "instructor-rexcode-web"),
  featured: false,
  coverImage: "/images/courses/web-creation-cover.png",
  durationMinutes: 75,
  format: "Parcours guidé",
  tags: ["wordpress", "independants", "site vitrine", "no-code"],
  createdBy: "admin-rekode",
  publishedAt: "2026-06-03",
  updatedAt: "2026-06-03"
} satisfies Course;

export const promptDesignForCreativesCourse = {
  id: "course-prompt-design-creatifs",
  slug: "prompt-design-pour-creatifs",
  title: "Prompt Design pour créatifs",
  description:
    "Une fiche aperçu pour apprendre à formuler, tester et améliorer des prompts visuels, éditoriaux et vidéo.",
  domain: aiFilmmakingDomain,
  level: "intermediate",
  status: "published",
  visibility: "public",
  availability: "preview",
  modules: promptDesignModules,
  instructors: instructors.filter((instructor) => instructor.id === "instructor-ai-studio"),
  resources: aiFilmmakingResources,
  featured: false,
  coverImage: "/images/courses/ai-creative-media-cover.png",
  durationMinutes: 60,
  format: "Atelier pratique",
  tags: ["ia", "prompt", "creation", "workflow"],
  createdBy: "admin-rekode",
  publishedAt: "2026-06-03",
  updatedAt: "2026-06-03"
} satisfies Course;

export const courses = [
  webCreationCourse,
  wordpressForIndependentsCourse,
  aiFilmmakingCourse,
  promptDesignForCreativesCourse
] satisfies Course[];
