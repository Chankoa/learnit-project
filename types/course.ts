import type { Lesson } from "@/types/learning";
import type { FAQItem, Instructor, Resource } from "@/types/resource";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type CourseStatus = "draft" | "published" | "archived";

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
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  description: string;
  domain: Domain;
  level: CourseLevel;
  status: CourseStatus;
  modules: CourseModule[];
  instructors?: Instructor[];
  resources?: Resource[];
  faq?: FAQItem[];
  featured?: boolean;
  featuredOrder?: number;
  coverImage?: string;
  durationMinutes?: number;
  tags?: string[];
  publishedAt?: string;
  updatedAt?: string;
};
