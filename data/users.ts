import type { User } from "@/types/user";

export const users = [
  {
    id: "user-learner-camille",
    name: "Camille Renaud",
    email: "camille.renaud@example.com",
    role: "learner",
    status: "active",
    createdAt: "2026-01-12T09:30:00.000Z",
    lastActiveAt: "2026-06-18T16:42:00.000Z",
    avatar: "/images/avatars/camille-renaud.png",
    learnerProfile: {
      userId: "user-learner-camille",
      enrolledCourseIds: ["course-web-creation", "course-prompt-design"],
      completedCourseIds: [],
      currentCourseId: "course-web-creation",
      learningGoal: "Créer un portfolio professionnel autonome.",
      totalLearningMinutes: 840,
      certificateIds: []
    }
  },
  {
    id: "user-learner-nadia",
    name: "Nadia Benali",
    email: "nadia.benali@example.com",
    role: "learner",
    status: "active",
    createdAt: "2026-02-04T13:15:00.000Z",
    lastActiveAt: "2026-06-17T19:05:00.000Z",
    learnerProfile: {
      userId: "user-learner-nadia",
      enrolledCourseIds: ["course-wordpress-indie"],
      completedCourseIds: ["course-prompt-design"],
      currentCourseId: "course-wordpress-indie",
      learningGoal: "Structurer une offre freelance avec WordPress.",
      totalLearningMinutes: 1260,
      certificateIds: ["certificate-prompt-design-nadia"]
    }
  },
  {
    id: "user-learner-jules",
    name: "Jules Martin",
    email: "jules.martin@example.com",
    role: "learner",
    status: "pending",
    createdAt: "2026-05-28T08:10:00.000Z",
    lastActiveAt: "2026-06-15T11:20:00.000Z",
    avatar: "/images/avatars/jules-martin.png",
    learnerProfile: {
      userId: "user-learner-jules",
      enrolledCourseIds: ["course-ai-filmmaking"],
      completedCourseIds: [],
      currentCourseId: "course-ai-filmmaking",
      learningGoal: "Produire des vidéos courtes avec un workflow IA.",
      totalLearningMinutes: 190,
      certificateIds: []
    }
  },
  {
    id: "user-teacher-elise",
    name: "Élise Moreau",
    email: "elise.moreau@example.com",
    role: "teacher",
    status: "active",
    createdAt: "2025-11-19T10:00:00.000Z",
    lastActiveAt: "2026-06-18T14:32:00.000Z",
    avatar: "/images/avatars/elise-moreau.png",
    teacherProfile: {
      userId: "user-teacher-elise",
      displayName: "Élise M.",
      bio: "Designer produit spécialisée dans les parcours d'apprentissage web.",
      expertiseDomains: ["creation-web", "ux-ui-design"],
      courseIds: ["teacher-course-web-portfolio", "teacher-course-nextjs-starter"],
      publishedCourseCount: 2,
      learnerCount: 86
    }
  },
  {
    id: "user-teacher-samuel",
    name: "Samuel Akoto",
    email: "samuel.akoto@example.com",
    role: "teacher",
    status: "active",
    createdAt: "2026-01-06T15:45:00.000Z",
    lastActiveAt: "2026-06-18T09:18:00.000Z",
    teacherProfile: {
      userId: "user-teacher-samuel",
      displayName: "Samuel Akoto",
      bio: "Formateur IA créative et production vidéo légère.",
      expertiseDomains: ["ai-filmmaking", "prompt-design"],
      courseIds: ["teacher-course-ai-video"],
      publishedCourseCount: 1,
      learnerCount: 42
    }
  },
  {
    id: "user-admin-learnit",
    name: "Marion Lefèvre",
    email: "admin@learnit.local",
    role: "admin",
    status: "active",
    createdAt: "2025-10-01T08:00:00.000Z",
    lastActiveAt: "2026-06-18T17:05:00.000Z",
    adminProfile: {
      userId: "user-admin-learnit",
      permissions: [
        "users:manage",
        "courses:publish",
        "domains:manage",
        "settings:update"
      ],
      supervisedDomainIds: [
        "admin-domain-web",
        "admin-domain-wordpress",
        "admin-domain-ux-ui",
        "admin-domain-ai-filmmaking",
        "admin-domain-prompt-design"
      ],
      notes: "Compte administrateur principal de démonstration."
    }
  }
] satisfies User[];

export function getUsers() {
  return users;
}

export function getUserById(userId: string) {
  return users.find((user) => user.id === userId);
}

export function getUsersByRole(role: User["role"]) {
  return users.filter((user) => user.role === role);
}
