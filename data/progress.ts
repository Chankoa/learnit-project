import type { CourseProgress, LearnerProfile, LearningDeliverable } from "@/types/learning";

export const learnerProfile: LearnerProfile = {
  id: "learner-demo",
  firstName: "Chandra",
  displayName: "Chandra Josephus",
  email: "chandra@learnit.dev",
  initials: "CJ"
};

export const courseProgress: CourseProgress[] = [
  {
    courseId: "course-formation-creation-web",
    completedLessons: [
      "lesson-web-brief",
      "lesson-web-arborescence",
      "lesson-web-wireframe"
    ],
    currentLessonId: "lesson-web-html-structure",
    lastAccessedAt: "2026-06-09T18:30:00+02:00"
  },
  {
    courseId: "course-ai-filmmaking-foundations",
    completedLessons: [],
    currentLessonId: "lesson-ai-film-concept",
    lastAccessedAt: "2026-06-07T11:15:00+02:00"
  }
];

export const recentResourceIds = [
  "resource-web-html-cheatsheet",
  "resource-web-brief-checklist",
  "resource-ai-shotlist"
];

export const learningDeliverables: LearningDeliverable[] = [
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
  }
];
