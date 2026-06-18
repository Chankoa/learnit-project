import type {
  AdminActivity,
  AdminCourse,
  AdminDomain,
  AdminUser,
  PlatformSettings
} from "@/types/admin";

export const adminUsers = [
  {
    id: "admin-user-chandra",
    name: "Chandra Josephus",
    email: "chandra@learnit.dev",
    role: "learner",
    status: "active",
    createdAt: "2026-05-20",
    lastActivityAt: "2026-06-17T18:30:00+02:00"
  },
  {
    id: "admin-user-rexcode",
    name: "Équipe REXCODE",
    email: "teacher@learnit.dev",
    role: "teacher",
    status: "active",
    createdAt: "2026-05-12",
    lastActivityAt: "2026-06-17T10:20:00+02:00"
  },
  {
    id: "admin-user-ai-studio",
    name: "Studio IA",
    email: "studio.ia@learnit.dev",
    role: "teacher",
    status: "active",
    createdAt: "2026-05-16",
    lastActivityAt: "2026-06-16T15:35:00+02:00"
  },
  {
    id: "admin-user-lina",
    name: "Lina Martin",
    email: "lina.martin@example.test",
    role: "learner",
    status: "active",
    createdAt: "2026-05-28",
    lastActivityAt: "2026-06-17T18:10:00+02:00"
  },
  {
    id: "admin-user-samir",
    name: "Samir Beldi",
    email: "samir.beldi@example.test",
    role: "learner",
    status: "active",
    createdAt: "2026-05-30",
    lastActivityAt: "2026-06-15T09:40:00+02:00"
  },
  {
    id: "admin-user-nora",
    name: "Nora Alves",
    email: "nora.alves@example.test",
    role: "learner",
    status: "active",
    createdAt: "2026-06-01",
    lastActivityAt: "2026-06-16T21:05:00+02:00"
  },
  {
    id: "admin-user-jules",
    name: "Jules Moreau",
    email: "jules.moreau@example.test",
    role: "learner",
    status: "pending",
    createdAt: "2026-06-03",
    lastActivityAt: "2026-06-09T14:30:00+02:00"
  },
  {
    id: "admin-user-ines",
    name: "Inès Carvalho",
    email: "ines.carvalho@example.test",
    role: "learner",
    status: "active",
    createdAt: "2026-06-05",
    lastActivityAt: "2026-06-17T08:25:00+02:00"
  },
  {
    id: "admin-user-ops",
    name: "Admin LearnIt",
    email: "admin@learnit.dev",
    role: "admin",
    status: "active",
    createdAt: "2026-05-10",
    lastActivityAt: "2026-06-17T12:45:00+02:00"
  },
  {
    id: "admin-user-paused",
    name: "Compte suspendu",
    email: "paused@example.test",
    role: "learner",
    status: "disabled",
    createdAt: "2026-05-22",
    lastActivityAt: "2026-06-01T08:00:00+02:00"
  }
] satisfies AdminUser[];

export const adminDomains = [
  {
    id: "admin-domain-web",
    name: "Création web",
    slug: "creation-web",
    status: "active",
    courseCount: 3,
    order: 1,
    updatedAt: "2026-06-17"
  },
  {
    id: "admin-domain-wordpress",
    name: "WordPress",
    slug: "wordpress",
    status: "active",
    courseCount: 1,
    order: 2,
    updatedAt: "2026-06-13"
  },
  {
    id: "admin-domain-ux-ui",
    name: "UX/UI Design",
    slug: "ux-ui-design",
    status: "inactive",
    courseCount: 0,
    order: 3,
    updatedAt: "2026-06-11"
  },
  {
    id: "admin-domain-ai-filmmaking",
    name: "AI Filmmaking",
    slug: "ai-filmmaking",
    status: "active",
    courseCount: 2,
    order: 4,
    updatedAt: "2026-06-16"
  },
  {
    id: "admin-domain-prompt-design",
    name: "Prompt Design",
    slug: "prompt-design",
    status: "active",
    courseCount: 1,
    order: 5,
    updatedAt: "2026-06-12"
  }
] satisfies AdminDomain[];

export const adminCourses = [
  {
    id: "admin-course-web-portfolio",
    title: "Création web : portfolio professionnel",
    domainId: "admin-domain-web",
    teacherId: "admin-user-rexcode",
    status: "published",
    publication: "published",
    learnerCount: 38,
    moduleCount: 3,
    lessonCount: 5,
    updatedAt: "2026-06-17T10:20:00+02:00"
  },
  {
    id: "admin-course-ai-video",
    title: "AI Filmmaking Foundations",
    domainId: "admin-domain-ai-filmmaking",
    teacherId: "admin-user-ai-studio",
    status: "published",
    publication: "published",
    learnerCount: 24,
    moduleCount: 2,
    lessonCount: 3,
    updatedAt: "2026-06-16T15:35:00+02:00"
  },
  {
    id: "admin-course-nextjs-starter",
    title: "Atelier Next.js starter",
    domainId: "admin-domain-web",
    teacherId: "admin-user-rexcode",
    status: "pending",
    publication: "unpublished",
    learnerCount: 0,
    moduleCount: 1,
    lessonCount: 1,
    updatedAt: "2026-06-14T09:10:00+02:00"
  },
  {
    id: "admin-course-wordpress",
    title: "WordPress pour indépendants",
    domainId: "admin-domain-wordpress",
    teacherId: "admin-user-rexcode",
    status: "draft",
    publication: "unpublished",
    learnerCount: 0,
    moduleCount: 1,
    lessonCount: 1,
    updatedAt: "2026-06-13T12:00:00+02:00"
  },
  {
    id: "admin-course-prompt-design",
    title: "Prompt Design pour créatifs",
    domainId: "admin-domain-prompt-design",
    teacherId: "admin-user-ai-studio",
    status: "published",
    publication: "published",
    learnerCount: 16,
    moduleCount: 1,
    lessonCount: 2,
    updatedAt: "2026-06-12T17:05:00+02:00"
  },
  {
    id: "admin-course-ux-foundations",
    title: "Fondamentaux UX/UI Design",
    domainId: "admin-domain-ux-ui",
    teacherId: "admin-user-ai-studio",
    status: "archived",
    publication: "unpublished",
    learnerCount: 8,
    moduleCount: 2,
    lessonCount: 4,
    updatedAt: "2026-06-05T11:00:00+02:00"
  }
] satisfies AdminCourse[];

export const adminActivities = [
  {
    id: "admin-activity-course-pending",
    type: "course",
    label: "Atelier Next.js starter envoyé en attente de publication",
    actor: "Équipe REXCODE",
    createdAt: "2026-06-17T10:20:00+02:00"
  },
  {
    id: "admin-activity-user-role",
    type: "user",
    label: "Studio IA confirmé comme enseignant",
    actor: "Admin LearnIt",
    createdAt: "2026-06-16T15:35:00+02:00"
  },
  {
    id: "admin-activity-domain-ux",
    type: "domain",
    label: "Domaine UX/UI Design désactivé temporairement",
    actor: "Admin LearnIt",
    createdAt: "2026-06-11T09:00:00+02:00"
  },
  {
    id: "admin-activity-settings",
    type: "settings",
    label: "Options certificats mises à jour en mode démo",
    actor: "Admin LearnIt",
    createdAt: "2026-06-10T14:15:00+02:00"
  }
] satisfies AdminActivity[];

export const platformSettings = {
  identity: {
    name: "LearnIt",
    tagline: "Plateforme de formation créative et technique",
    supportEmail: "support@learnit.dev"
  },
  registration: {
    learnersEnabled: true,
    teachersRequireApproval: true,
    inviteOnly: false
  },
  catalog: {
    showDraftPreviews: false,
    highlightNewCourses: true,
    defaultSort: "recent"
  },
  maintenance: {
    enabled: false,
    message: "Maintenance planifiée en mode démo."
  },
  certificates: {
    enabled: true,
    requireFullCompletion: true,
    issuerName: "LearnIt Academy"
  }
} satisfies PlatformSettings;
