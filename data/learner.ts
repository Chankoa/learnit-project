import type {
  Certificate,
  LearnerEnrollment,
  LearnerProfile,
  LearnerResource,
  LearningDeliverable
} from "@/types/learning";

export const learnerProfile: LearnerProfile = {
  id: "learner-demo",
  firstName: "Chandra",
  displayName: "Chandra Josephus",
  email: "chandra@learnit.dev",
  initials: "CJ"
};

export const learnerEnrollments = [
  {
    courseId: "course-formation-creation-web",
    status: "in-progress",
    completedLessonIds: [
      "lesson-web-brief",
      "lesson-web-arborescence",
      "lesson-web-wireframe"
    ],
    currentLessonId: "lesson-web-html-structure",
    lastAccessedAt: "2026-06-17T18:30:00+02:00",
    learningTimeMinutes: 275,
    moduleProgress: [
      {
        moduleId: "module-web-01-strategy",
        completedLessonIds: [
          "lesson-web-brief",
          "lesson-web-arborescence",
          "lesson-web-wireframe"
        ],
        submittedExerciseCount: 2,
        totalExerciseCount: 2,
        learningTimeMinutes: 135
      },
      {
        moduleId: "module-web-02-html",
        completedLessonIds: [],
        submittedExerciseCount: 0,
        totalExerciseCount: 1,
        learningTimeMinutes: 80
      },
      {
        moduleId: "module-web-03-css",
        completedLessonIds: [],
        submittedExerciseCount: 0,
        totalExerciseCount: 2,
        learningTimeMinutes: 35
      },
      {
        moduleId: "module-web-04-next",
        completedLessonIds: [],
        submittedExerciseCount: 0,
        totalExerciseCount: 2,
        learningTimeMinutes: 15
      },
      {
        moduleId: "module-web-05-launch",
        completedLessonIds: [],
        submittedExerciseCount: 0,
        totalExerciseCount: 2,
        learningTimeMinutes: 10
      }
    ]
  },
  {
    courseId: "course-ai-filmmaking-foundations",
    status: "in-progress",
    completedLessonIds: [],
    currentLessonId: "lesson-ai-film-concept",
    lastAccessedAt: "2026-06-15T11:15:00+02:00",
    learningTimeMinutes: 45,
    moduleProgress: [
      {
        moduleId: "module-ai-film-01-preproduction",
        completedLessonIds: [],
        submittedExerciseCount: 0,
        totalExerciseCount: 0,
        learningTimeMinutes: 25
      },
      {
        moduleId: "module-ai-film-02-prompts",
        completedLessonIds: [],
        submittedExerciseCount: 0,
        totalExerciseCount: 1,
        learningTimeMinutes: 15
      },
      {
        moduleId: "module-ai-film-03-montage-demo",
        completedLessonIds: [],
        submittedExerciseCount: 0,
        totalExerciseCount: 1,
        learningTimeMinutes: 5
      }
    ]
  },
  {
    courseId: "course-prompt-design-creatifs",
    status: "completed",
    completedLessonIds: [
      "lesson-prompt-creative-brief",
      "lesson-prompt-iteration"
    ],
    lastAccessedAt: "2026-06-12T16:20:00+02:00",
    learningTimeMinutes: 70,
    moduleProgress: [
      {
        moduleId: "module-prompt-design-01-preview",
        completedLessonIds: [
          "lesson-prompt-creative-brief",
          "lesson-prompt-iteration"
        ],
        submittedExerciseCount: 1,
        totalExerciseCount: 1,
        learningTimeMinutes: 70
      }
    ]
  },
  {
    courseId: "course-wordpress-independants",
    status: "not-started",
    completedLessonIds: [],
    learningTimeMinutes: 0,
    moduleProgress: [
      {
        moduleId: "module-wordpress-01-preview",
        completedLessonIds: [],
        submittedExerciseCount: 0,
        totalExerciseCount: 1,
        learningTimeMinutes: 0
      }
    ]
  }
] satisfies LearnerEnrollment[];

export const learnerResources = [
  {
    id: "resource-web-html-cheatsheet",
    courseId: "course-formation-creation-web",
    title: "Mémo HTML essentiel",
    type: "pdf",
    href: "/resources/memo-html-essentiel.pdf",
    description: "Les balises HTML utiles pour structurer une page claire et accessible.",
    favorite: true,
    lastConsultedAt: "2026-06-17T19:05:00+02:00",
    tags: ["html", "structure"]
  },
  {
    id: "resource-web-brief-checklist",
    courseId: "course-formation-creation-web",
    title: "Checklist du brief projet",
    type: "checklist",
    href: "/resources/checklist-brief-projet.pdf",
    description: "Une trame pour cadrer l'objectif, la cible, les pages et les contraintes.",
    favorite: true,
    lastConsultedAt: "2026-06-16T09:20:00+02:00",
    tags: ["brief", "strategie"]
  },
  {
    id: "resource-ai-shotlist",
    courseId: "course-ai-filmmaking-foundations",
    title: "Mini shotlist IA",
    type: "template",
    href: "/resources/mini-shotlist-ia.pdf",
    description: "Une fiche simple pour préparer une séquence courte générée avec l'IA.",
    favorite: true,
    lastConsultedAt: "2026-06-15T11:35:00+02:00",
    tags: ["ia", "preproduction"]
  },
  {
    id: "resource-web-css-layout-kit",
    courseId: "course-formation-creation-web",
    title: "Kit Flexbox et Grid",
    type: "exercise",
    href: "/resources/kit-flexbox-grid.zip",
    description: "Exercices courts pour pratiquer les mises en page responsives.",
    favorite: false,
    lastConsultedAt: "2026-06-14T14:10:00+02:00",
    tags: ["css", "responsive"]
  },
  {
    id: "resource-web-next-starter",
    courseId: "course-formation-creation-web",
    title: "Starter Next.js LearnIt",
    type: "template",
    href: "/resources/next-starter-learnit.zip",
    description: "Base de projet Next.js avec App Router, TypeScript, Tailwind et Sass.",
    favorite: false,
    tags: ["nextjs", "typescript"]
  },
  {
    id: "resource-web-launch-checklist",
    courseId: "course-formation-creation-web",
    title: "Checklist mise en ligne",
    type: "checklist",
    href: "/resources/checklist-mise-en-ligne.pdf",
    description: "Contrôle final avant publication : SEO, accessibilité, performances et formulaires.",
    favorite: false,
    tags: ["netlify", "publication"]
  },
  {
    id: "resource-ai-prompt-bank",
    courseId: "course-ai-filmmaking-foundations",
    title: "Banque de prompts vidéo",
    type: "pdf",
    href: "/resources/banque-prompts-video.pdf",
    description: "Exemples de prompts pour décrire le style, le mouvement caméra et l'ambiance.",
    favorite: false,
    tags: ["ia", "prompt"]
  },
  {
    id: "resource-prompt-creative-gallery",
    courseId: "course-prompt-design-creatifs",
    title: "Galerie d'inspiration prompts",
    type: "external-link",
    href: "https://learnit.example/resources/prompt-gallery",
    description: "Sélection fictive de prompts visuels commentés pour comparer les intentions créatives.",
    favorite: true,
    lastConsultedAt: "2026-06-12T17:05:00+02:00",
    tags: ["prompt", "inspiration"]
  },
  {
    id: "resource-wordpress-content-plan",
    courseId: "course-wordpress-independants",
    title: "Plan de contenus site vitrine",
    type: "template",
    href: "/resources/plan-contenus-site-vitrine.pdf",
    description: "Modèle pour préparer les pages essentielles avant de commencer WordPress.",
    favorite: false,
    tags: ["wordpress", "contenu"]
  }
] satisfies LearnerResource[];

export const learnerDeliverables = [
  {
    id: "deliverable-web-wireframe",
    courseId: "course-formation-creation-web",
    title: "Wireframe de la page principale",
    description: "Finaliser la structure mobile et desktop avant le passage au HTML.",
    dueLabel: "Cette semaine",
    status: "in-progress"
  },
  {
    id: "deliverable-web-semantic-page",
    courseId: "course-formation-creation-web",
    title: "Page HTML sémantique",
    description: "Assembler les sections principales avec une hiérarchie de titres cohérente.",
    dueLabel: "Prochaine étape",
    status: "todo"
  },
  {
    id: "deliverable-ai-shotlist",
    courseId: "course-ai-filmmaking-foundations",
    title: "Mini shotlist IA",
    description: "Préparer cinq plans pour une première séquence générative courte.",
    status: "todo"
  },
  {
    id: "deliverable-prompt-iteration",
    courseId: "course-prompt-design-creatifs",
    title: "Itération de prompts créatifs",
    description: "Comparer deux variantes et documenter les ajustements appliqués.",
    dueLabel: "Rendu",
    status: "submitted"
  }
] satisfies LearningDeliverable[];

export const learnerCertificates = [
  {
    id: "certificate-prompt-design",
    courseId: "course-prompt-design-creatifs",
    title: "Certificat Prompt Design pour créatifs",
    description: "Atteste la maîtrise d'un cycle court de brief, génération et itération.",
    status: "obtained",
    requiredProgressPercentage: 100,
    currentProgressPercentage: 100,
    issuedAt: "2026-06-12",
    credentialId: "LIT-PDC-2026-018"
  },
  {
    id: "certificate-web-creation",
    courseId: "course-formation-creation-web",
    title: "Certificat Création web",
    description: "Disponible après validation du projet final et de la progression requise.",
    status: "eligible",
    requiredProgressPercentage: 90,
    currentProgressPercentage: 20,
    availableAtLabel: "Déblocage après le module Qualité et publication"
  },
  {
    id: "certificate-ai-filmmaking",
    courseId: "course-ai-filmmaking-foundations",
    title: "Certificat AI Filmmaking Foundations",
    description: "Certification prévue avec la version complète du parcours.",
    status: "coming-soon",
    requiredProgressPercentage: 80,
    currentProgressPercentage: 0,
    availableAtLabel: "Bientôt disponible"
  },
  {
    id: "certificate-wordpress",
    courseId: "course-wordpress-independants",
    title: "Certificat WordPress pour indépendants",
    description: "Attestation prévue pour le futur parcours WordPress complet.",
    status: "coming-soon",
    requiredProgressPercentage: 100,
    currentProgressPercentage: 0,
    availableAtLabel: "Bientôt disponible"
  }
] satisfies Certificate[];
