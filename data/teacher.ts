import { aiFilmmakingDomain, webCreationDomain } from "@/data/domains";
import type {
  TeacherActivity,
  TeacherCourse,
  TeacherProfile,
  TeacherResource,
  TeacherStudent
} from "@/types/teaching";

export const teacherProfile = {
  id: "teacher-demo-rexcode",
  displayName: "Équipe REXCODE",
  firstName: "REXCODE",
  email: "teacher@learnit.dev"
} satisfies TeacherProfile;

export const teacherCourses = [
  {
    id: "teacher-course-web-portfolio",
    title: "Création web : portfolio professionnel",
    description:
      "Un parcours guidé pour concevoir, coder et publier un portfolio responsive avec une base Next.js propre.",
    domain: webCreationDomain,
    level: "beginner",
    format: "Formation guidée",
    status: "published",
    objectives: [
      "Structurer un brief de projet web",
      "Construire une page accessible",
      "Publier une version vérifiable"
    ],
    audience: [
      "Débutants en création web",
      "Indépendants qui veulent présenter leur activité"
    ],
    requirements: [
      "Savoir utiliser un navigateur",
      "Pouvoir installer un environnement local"
    ],
    coverImage: "/images/courses/web-creation-cover.png",
    enrolledLearnerCount: 38,
    createdAt: "2026-05-18",
    updatedAt: "2026-06-17T10:20:00+02:00",
    modules: [
      {
        id: "teacher-module-web-brief",
        title: "Cadrage du projet",
        description: "Transformer une idée en brief, cible et structure de page.",
        order: 1,
        lessons: [
          {
            id: "teacher-lesson-web-brief",
            title: "Brief, cible et objectifs",
            type: "reading",
            durationMinutes: 35,
            status: "published",
            order: 1
          },
          {
            id: "teacher-lesson-web-wireframe",
            title: "Wireframe rapide",
            type: "project",
            durationMinutes: 55,
            status: "published",
            order: 2
          }
        ]
      },
      {
        id: "teacher-module-web-html",
        title: "HTML et structure",
        description: "Assembler une page sémantique avec une hiérarchie fiable.",
        order: 2,
        lessons: [
          {
            id: "teacher-lesson-web-html",
            title: "Structure HTML sémantique",
            type: "video",
            durationMinutes: 50,
            status: "published",
            order: 1
          },
          {
            id: "teacher-lesson-web-accessibility",
            title: "Bases d'accessibilité",
            type: "reading",
            durationMinutes: 35,
            status: "review",
            order: 2
          }
        ]
      },
      {
        id: "teacher-module-web-launch",
        title: "Qualité et publication",
        description: "Vérifier le projet et préparer la mise en ligne.",
        order: 3,
        lessons: [
          {
            id: "teacher-lesson-web-quality",
            title: "Checklist qualité",
            type: "quiz",
            durationMinutes: 40,
            status: "draft",
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: "teacher-course-ai-video",
    title: "AI Filmmaking Foundations",
    description:
      "Une initiation à la conception de vidéo courte avec un workflow IA cadré, de l'intention au montage démo.",
    domain: aiFilmmakingDomain,
    level: "beginner",
    format: "Atelier pratique",
    status: "published",
    objectives: [
      "Transformer une intention créative en concept vidéo",
      "Rédiger des prompts vidéo exploitables",
      "Assembler une courte démonstration"
    ],
    audience: [
      "Créateurs de contenu",
      "Designers et monteurs curieux des workflows IA"
    ],
    requirements: [
      "Avoir accès à un outil de génération vidéo",
      "Préparer une idée de séquence courte"
    ],
    coverImage: "/images/courses/ai-creative-media-cover.png",
    enrolledLearnerCount: 24,
    createdAt: "2026-05-27",
    updatedAt: "2026-06-16T15:35:00+02:00",
    modules: [
      {
        id: "teacher-module-ai-concept",
        title: "Concept et préproduction",
        description: "Clarifier l'intention, le format et la première shotlist.",
        order: 1,
        lessons: [
          {
            id: "teacher-lesson-ai-concept",
            title: "Concept d'une vidéo courte",
            type: "reading",
            durationMinutes: 25,
            status: "published",
            order: 1
          },
          {
            id: "teacher-lesson-ai-shotlist",
            title: "Mini shotlist IA",
            type: "exercise",
            durationMinutes: 40,
            status: "published",
            order: 2
          }
        ]
      },
      {
        id: "teacher-module-ai-prompts",
        title: "Prompts vidéo",
        description: "Décrire sujet, mouvement caméra, style et contraintes.",
        order: 2,
        lessons: [
          {
            id: "teacher-lesson-ai-prompts",
            title: "Prompts vidéo IA",
            type: "exercise",
            durationMinutes: 35,
            status: "review",
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: "teacher-course-nextjs-starter",
    title: "Atelier Next.js starter",
    description:
      "Un brouillon de formation pour apprendre à structurer un projet Next.js avec données typées et composants.",
    domain: webCreationDomain,
    level: "intermediate",
    format: "Workshop",
    status: "draft",
    objectives: [
      "Comprendre l'App Router",
      "Structurer les données statiques",
      "Créer des composants réutilisables"
    ],
    audience: [
      "Apprenants ayant déjà les bases HTML/CSS",
      "Créateurs web qui veulent passer à Next.js"
    ],
    requirements: [
      "Connaître les bases de JavaScript",
      "Avoir déjà publié une page simple"
    ],
    coverImage: "/images/courses/web-creation-cover.png",
    enrolledLearnerCount: 0,
    createdAt: "2026-06-01",
    updatedAt: "2026-06-14T09:10:00+02:00",
    modules: [
      {
        id: "teacher-module-next-setup",
        title: "Démarrer le projet",
        description: "Installer, lire l'arborescence et créer les premières routes.",
        order: 1,
        lessons: [
          {
            id: "teacher-lesson-next-setup",
            title: "Initialiser le starter",
            type: "video",
            durationMinutes: 45,
            status: "draft",
            order: 1
          }
        ]
      }
    ]
  },
  {
    id: "teacher-course-wordpress-indie",
    title: "WordPress pour indépendants",
    description:
      "Brouillon de parcours pour aider un indépendant à préparer et assembler un site vitrine maintenable.",
    domain: webCreationDomain,
    level: "beginner",
    format: "Parcours guidé",
    status: "draft",
    objectives: [
      "Préparer les contenus essentiels",
      "Structurer les pages clés",
      "Publier une première version crédible"
    ],
    audience: [
      "Indépendants",
      "Entrepreneurs solo"
    ],
    requirements: [
      "Avoir une offre ou activité à présenter"
    ],
    coverImage: "/images/courses/web-creation-cover.png",
    enrolledLearnerCount: 0,
    createdAt: "2026-06-08",
    updatedAt: "2026-06-13T12:00:00+02:00",
    modules: [
      {
        id: "teacher-module-wordpress-content",
        title: "Préparer le contenu",
        description: "Clarifier l'offre, les pages et les appels à l'action.",
        order: 1,
        lessons: [
          {
            id: "teacher-lesson-wordpress-positioning",
            title: "Positionner son site",
            type: "reading",
            durationMinutes: 30,
            status: "draft",
            order: 1
          }
        ]
      }
    ]
  }
] satisfies TeacherCourse[];

export const teacherResources = [
  {
    id: "teacher-resource-brief-template",
    title: "Template brief projet",
    type: "template",
    courseId: "teacher-course-web-portfolio",
    lessonId: "teacher-lesson-web-brief",
    status: "published",
    createdAt: "2026-06-02"
  },
  {
    id: "teacher-resource-html-memo",
    title: "Mémo HTML essentiel",
    type: "download",
    courseId: "teacher-course-web-portfolio",
    lessonId: "teacher-lesson-web-html",
    status: "published",
    createdAt: "2026-06-05"
  },
  {
    id: "teacher-resource-shotlist",
    title: "Mini shotlist IA",
    type: "template",
    courseId: "teacher-course-ai-video",
    lessonId: "teacher-lesson-ai-shotlist",
    status: "published",
    createdAt: "2026-06-07"
  },
  {
    id: "teacher-resource-next-starter",
    title: "Starter Next.js",
    type: "tool",
    courseId: "teacher-course-nextjs-starter",
    lessonId: "teacher-lesson-next-setup",
    status: "draft",
    createdAt: "2026-06-11"
  },
  {
    id: "teacher-resource-wordpress-plan",
    title: "Plan de contenus WordPress",
    type: "template",
    courseId: "teacher-course-wordpress-indie",
    lessonId: "teacher-lesson-wordpress-positioning",
    status: "draft",
    createdAt: "2026-06-12"
  }
] satisfies TeacherResource[];

export const teacherStudents = [
  {
    id: "student-lina-martin",
    name: "Lina Martin",
    email: "lina.martin@example.test",
    courseId: "teacher-course-web-portfolio",
    progressPercentage: 72,
    lastActivityAt: "2026-06-17T18:10:00+02:00",
    status: "active"
  },
  {
    id: "student-samir-beldi",
    name: "Samir Beldi",
    email: "samir.beldi@example.test",
    courseId: "teacher-course-web-portfolio",
    progressPercentage: 44,
    lastActivityAt: "2026-06-15T09:40:00+02:00",
    status: "active"
  },
  {
    id: "student-nora-alves",
    name: "Nora Alves",
    email: "nora.alves@example.test",
    courseId: "teacher-course-ai-video",
    progressPercentage: 91,
    lastActivityAt: "2026-06-16T21:05:00+02:00",
    status: "completed"
  },
  {
    id: "student-jules-moreau",
    name: "Jules Moreau",
    email: "jules.moreau@example.test",
    courseId: "teacher-course-ai-video",
    progressPercentage: 28,
    lastActivityAt: "2026-06-09T14:30:00+02:00",
    status: "late"
  },
  {
    id: "student-ines-carvalho",
    name: "Inès Carvalho",
    email: "ines.carvalho@example.test",
    courseId: "teacher-course-web-portfolio",
    progressPercentage: 63,
    lastActivityAt: "2026-06-17T08:25:00+02:00",
    status: "active"
  }
] satisfies TeacherStudent[];

export const teacherActivities = [
  {
    id: "activity-web-quality",
    type: "lesson",
    label: "Leçon « Checklist qualité » passée en brouillon",
    courseId: "teacher-course-web-portfolio",
    updatedAt: "2026-06-17T10:20:00+02:00"
  },
  {
    id: "activity-ai-prompts",
    type: "lesson",
    label: "Prompts vidéo IA envoyé en relecture",
    courseId: "teacher-course-ai-video",
    updatedAt: "2026-06-16T15:35:00+02:00"
  },
  {
    id: "activity-next-starter",
    type: "resource",
    label: "Ressource « Starter Next.js » ajoutée",
    courseId: "teacher-course-nextjs-starter",
    resourceId: "teacher-resource-next-starter",
    updatedAt: "2026-06-14T09:10:00+02:00"
  },
  {
    id: "activity-wordpress-plan",
    type: "module",
    label: "Module « Préparer le contenu » créé",
    courseId: "teacher-course-wordpress-indie",
    updatedAt: "2026-06-13T12:00:00+02:00"
  }
] satisfies TeacherActivity[];
