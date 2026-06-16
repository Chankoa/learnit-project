import type { Lesson } from "@/types/learning";
import type { FAQItem, Instructor, Resource } from "@/types/resource";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type CourseStatus = "draft" | "published" | "archived";

export type CourseVisibility = "public" | "private" | "unlisted";

export type CourseAvailability = "complete" | "preview" | "coming-soon";

export type CourseModuleStatus = "available" | "in-progress" | "completed" | "locked" | "preview";

export type Domain = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  order?: number;
};

export type CourseModule = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  lessons: Lesson[];
  resources?: Resource[];
  order: number;
  status?: CourseModuleStatus;
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  domain: Domain;
  level: CourseLevel;
  status: CourseStatus;
  visibility: CourseVisibility;
  availability: CourseAvailability;
  modules: CourseModule[];
  instructors?: Instructor[];
  resources?: Resource[];
  faq?: FAQItem[];
  audience?: string[];
  objectives?: string[];
  requirements?: string[];
  method?: string[];
  featured?: boolean;
  featuredOrder?: number;
  coverImage?: string;
  durationMinutes?: number;
  format?: string;
  tags?: string[];
  createdBy: string;
  publishedAt?: string;
  updatedAt: string;
};
