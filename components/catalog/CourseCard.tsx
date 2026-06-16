import { ArrowRight, BookOpen, Clock, Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { Course, CourseAvailability, CourseLevel, CourseStatus } from "@/types/course";

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
  published: "Publié",
  archived: "Archivé"
};

export const courseAvailabilityLabels: Record<CourseAvailability, string> = {
  complete: "Programme complet",
  preview: "Aperçu",
  "coming-soon": "Bientôt disponible"
};

export function isCourseFullPageAvailable(course: Course) {
  return (
    course.status === "published" &&
    (course.visibility === "public" || course.visibility === "unlisted") &&
    course.availability === "complete"
  );
}

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
  const hasFullPage = isCourseFullPageAvailable(course);
  const courseHref = hasFullPage
    ? `/formations/${course.slug}`
    : `/formations/${course.slug}/curriculum`;
  const courseCtaLabel = hasFullPage ? "Voir la formation" : "Voir le curriculum";

  return (
    <article className="course-card" id={course.slug}>
      {course.coverImage ? (
        <div className="course-card__media">
          <Image
            alt={`Couverture de ${course.title}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            src={course.coverImage}
          />
          <span className="course-card__status">{courseAvailabilityLabels[course.availability]}</span>
        </div>
      ) : null}

      <div className="course-card__body">
        <div className="tag-list">
          <span>{course.domain.name}</span>
          <span>{courseLevelLabels[course.level]}</span>
        </div>

        <h3>{course.title}</h3>
        <p>{course.description}</p>

        <div className="course-card__meta">
          <span>
            <Layers size={16} aria-hidden="true" />
            {course.modules.length} module{course.modules.length > 1 ? "s" : ""}
          </span>
          <span>
            <BookOpen size={16} aria-hidden="true" />
            {getCourseLessonCount(course)} leçons
          </span>
          <span>
            <Clock size={16} aria-hidden="true" />
            {formatCourseDuration(course.durationMinutes)}
          </span>
        </div>

        <Link className="text-link course-card__link" href={courseHref}>
          {courseCtaLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
