import { ArrowRight, BookOpen, Clock, Layers } from "lucide-react";
import Link from "next/link";

import type { Course, CourseLevel, CourseStatus } from "@/types/course";

type CourseCardProps = {
  course: Course;
};

export const courseLevelLabels: Record<CourseLevel, string> = {
  beginner: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé"
};

export const courseStatusLabels: Record<CourseStatus, string> = {
  draft: "Brouillon",
  published: "Programme complet",
  preview: "Aperçu",
  "coming-soon": "Bientôt disponible",
  archived: "Archivé"
};

export function formatCourseDuration(minutes?: number) {
  if (!minutes) {
    return "Durée à venir";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}` : `${hours}h`;
}

export function getCourseLessonCount(course: Course) {
  return course.modules.reduce((total, module) => total + module.lessons.length, 0);
}

export function CourseCard({ course }: CourseCardProps) {
  const isPublished = course.status === "published";
  const courseHref = isPublished ? `/formations/${course.slug}` : `/formations#${course.slug}`;
  const courseCtaLabel = isPublished ? "Voir la formation" : "Voir l'aperçu";

  return (
    <article className="lesson-card flex flex-col p-5" id={course.slug}>
      <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase text-text-muted">
        <span className="rounded-sm bg-muted px-2 py-1">{course.domain.name}</span>
        <span className="rounded-sm bg-muted px-2 py-1">{courseLevelLabels[course.level]}</span>
        <span className="rounded-sm bg-muted px-2 py-1">{courseStatusLabels[course.status]}</span>
      </div>

      <h3 className="mt-5 text-xl font-black text-text-strong">{course.title}</h3>
      <p className="mt-2 flex-1 text-sm text-text-muted">{course.description}</p>

      <div className="mt-5 grid gap-3 text-sm text-text-muted sm:grid-cols-3">
        <span className="flex items-center gap-2">
          <Layers size={16} aria-hidden="true" />
          {course.modules.length} module{course.modules.length > 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-2">
          <BookOpen size={16} aria-hidden="true" />
          {getCourseLessonCount(course)} leçons
        </span>
        <span className="flex items-center gap-2">
          <Clock size={16} aria-hidden="true" />
          {formatCourseDuration(course.durationMinutes)}
        </span>
      </div>

      <Link className="btn btn-secondary mt-6 w-full sm:w-fit" href={courseHref}>
        {courseCtaLabel}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}
