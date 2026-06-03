import type { Course } from "@/types/course";
import { aiFilmmakingDomain, webCreationDomain } from "@/data/domains";
import { aiFilmmakingModules, webCourseModules } from "@/data/modules";
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
  title: "Formation creation web",
  description:
    "Une formation complete pour concevoir, developper et publier un site web professionnel avec une approche projet.",
  domain: webCreationDomain,
  level: "beginner",
  status: "published",
  modules: webCourseModules,
  instructors: instructors.filter((instructor) => instructor.id === "instructor-rexcode-web"),
  resources: webResources,
  faq: webCourseFAQ,
  featured: true,
  featuredOrder: 1,
  coverImage: "/images/courses/formation-creation-web.jpg",
  durationMinutes: 780,
  tags: ["html", "css", "nextjs", "typescript", "netlify"],
  publishedAt: "2026-06-03",
  updatedAt: "2026-06-03"
} satisfies Course;

export const aiFilmmakingCourse = {
  id: "course-ai-filmmaking-foundations",
  slug: "ai-filmmaking-foundations",
  title: "AI Filmmaking Foundations",
  description:
    "Une fiche courte de demonstration pour presenter les bases d'un workflow de creation audiovisuelle avec IA.",
  domain: aiFilmmakingDomain,
  level: "beginner",
  status: "draft",
  modules: aiFilmmakingModules,
  instructors: instructors.filter((instructor) => instructor.id === "instructor-ai-studio"),
  resources: aiFilmmakingResources,
  faq: aiFilmmakingFAQ,
  featured: false,
  coverImage: "/images/courses/ai-filmmaking-foundations.jpg",
  durationMinutes: 100,
  tags: ["ia", "video", "prompt", "filmmaking"],
  publishedAt: "2026-06-03",
  updatedAt: "2026-06-03"
} satisfies Course;

export const courses = [webCreationCourse, aiFilmmakingCourse] satisfies Course[];
