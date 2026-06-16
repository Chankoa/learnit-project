import { ArrowRight, BookOpen, Clock, Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  courseAvailabilityLabels,
  courseLevelLabels,
  formatCourseDuration,
  getCourseLessonCount,
  isCourseFullPageAvailable
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
  ctaHref = isCourseFullPageAvailable(course)
    ? `/formations/${course.slug}`
    : `/formations/${course.slug}/curriculum`,
  ctaLabel = isCourseFullPageAvailable(course) ? "Voir la formation" : "Voir le curriculum",
  eyebrow = "Formation recommandée"
}: FeaturedCourseProps) {
  return (
    <article className="featured-course">
      <div className="featured-course__content">
        <div className="tag-list">
          <span>{course.domain.name}</span>
          <span>{courseLevelLabels[course.level]}</span>
          <span>{courseAvailabilityLabels[course.availability]}</span>
        </div>

        <p className="featured-course__eyebrow">{eyebrow}</p>
        <h3>{course.title}</h3>
        <p className="featured-course__description">{course.description}</p>

        <div className="featured-course__meta">
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

        <Link className="btn btn-primary mt-7 w-full sm:w-fit" href={ctaHref}>
          {ctaLabel}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      {course.coverImage ? (
        <div className="featured-course__media">
          <Image
            alt={`Couverture de ${course.title}`}
            fill
            sizes="(max-width: 900px) 100vw, 45vw"
            src={course.coverImage}
          />
        </div>
      ) : null}
    </article>
  );
}
