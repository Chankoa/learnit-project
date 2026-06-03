import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { courseLevelLabels } from "@/components/catalog/CourseCard";
import type { Course } from "@/types/course";

type CourseHeroProps = {
  course: Course;
};

export function CourseHero({ course }: CourseHeroProps) {
  return (
    <section className="section-shell py-10 md:py-14">
      <Link className="nav-link inline-flex items-center gap-2" href="/formations">
        <ArrowLeft size={16} aria-hidden="true" />
        Toutes les formations
      </Link>

      <div className="hero-card mt-6 p-5 md:p-10">
        <span className="eyebrow w-fit">{course.domain.name}</span>
        <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight text-text-strong md:text-[3.25rem]">
          {course.title}
        </h1>
        {course.subtitle ? (
          <p className="mt-4 max-w-2xl text-lg font-extrabold text-text-strong">{course.subtitle}</p>
        ) : null}
        <p className="mt-5 max-w-2xl text-base text-text-muted md:text-lg">{course.description}</p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs font-extrabold uppercase text-text-muted">
          <span className="rounded-sm bg-muted px-2 py-1">{courseLevelLabels[course.level]}</span>
          {course.tags?.map((tag) => (
            <span className="rounded-sm bg-muted px-2 py-1" key={tag}>
              {tag}
            </span>
          ))}
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
    </section>
  );
}
