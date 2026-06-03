import { ArrowRight, BookOpen, Clock, Layers } from "lucide-react";
import Link from "next/link";

import {
  courseLevelLabels,
  courseStatusLabels,
  formatCourseDuration,
  getCourseLessonCount
} from "@/components/catalog/CourseCard";
import type { Course } from "@/types/course";

type FeaturedCourseProps = {
  course: Course;
  ctaHref?: string;
  ctaLabel?: string;
  eyebrow?: string;
};

export function FeaturedCourse({
  course,
  ctaHref = course.status === "published" ? `/formations/${course.slug}` : `#${course.slug}`,
  ctaLabel = course.status === "published" ? "Voir la formation" : "Voir l'aperçu",
  eyebrow = "Formation recommandée"
}: FeaturedCourseProps) {
  return (
    <article className="hero-card p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold uppercase text-text-muted">
        <span className="rounded-sm bg-muted px-2 py-1">{course.domain.name}</span>
        <span className="rounded-sm bg-muted px-2 py-1">{courseLevelLabels[course.level]}</span>
        <span className="rounded-sm bg-muted px-2 py-1">{courseStatusLabels[course.status]}</span>
      </div>

      <p className="mt-5 text-sm font-extrabold text-accent">{eyebrow}</p>
      <h3 className="mt-3 text-2xl font-black text-text-strong">{course.title}</h3>
      <p className="mt-3 text-sm text-text-muted">{course.description}</p>

      <div className="mt-6 grid gap-3 text-sm text-text-muted sm:grid-cols-3">
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

      <Link className="btn btn-primary mt-6 w-full sm:w-fit" href={ctaHref}>
        {ctaLabel}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}
