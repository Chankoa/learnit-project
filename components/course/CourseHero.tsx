import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";

import { courseLevelLabels } from "@/components/catalog/CourseCard";
import type { Course } from "@/types/course";

type CourseHeroProps = {
  course: Course;
};

export function CourseHero({ course }: CourseHeroProps) {
  return (
    <section className="section-shell page-hero">
      <Link className="nav-link inline-flex items-center gap-2" href="/formations">
        <ArrowLeft size={16} aria-hidden="true" />
        Toutes les formations
      </Link>

      <div className="course-hero">
        <div className="course-hero__content">
          <span className="eyebrow w-fit">{course.domain.name}</span>
          <h1>{course.title}</h1>
          {course.subtitle ? <p className="course-hero__subtitle">{course.subtitle}</p> : null}
          <p className="course-hero__description">{course.description}</p>

          <div className="tag-list mt-6">
            <span>{courseLevelLabels[course.level]}</span>
            {course.tags?.slice(0, 4).map((tag) => <span key={tag}>{tag}</span>)}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="btn btn-primary" href="#programme">
              Voir le programme
            </Link>
            <Link className="btn btn-secondary" href="/formations">
              Retour au catalogue
            </Link>
          </div>
        </div>

        {course.coverImage ? (
          <div className="course-hero__media">
            <Image
              alt={`Illustration de la formation ${course.title}`}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
              src={course.coverImage}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
