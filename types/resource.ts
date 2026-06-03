export type ResourceType = "article" | "video" | "download" | "template" | "exercise" | "link" | "tool";

export type ResourceAccess = "free" | "enrolled" | "premium";

export type Resource = {
  id: string;
  title: string;
  type: ResourceType;
  href: string;
  description?: string;
  fileName?: string;
  durationMinutes?: number;
  access?: ResourceAccess;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type InstructorLink = {
  label: string;
  href: string;
};

export type Instructor = {
  id: string;
  name: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
  email?: string;
  specialties?: string[];
  links?: InstructorLink[];
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order?: number;
};
