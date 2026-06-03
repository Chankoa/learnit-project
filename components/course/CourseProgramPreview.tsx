import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { formatCourseDuration } from "@/components/catalog/CourseCard";
import type { CourseModule } from "@/types/course";

type CourseProgramPreviewProps = {
  modules: CourseModule[];
};

export function CourseProgramPreview({ modules }: CourseProgramPreviewProps) {
  return (
    <section className="section-shell py-10" id="programme">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow w-fit">Programme</span>
          <h2 className="mt-4 text-2xl font-black text-text-strong md:text-3xl">Modules et leçons</h2>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            Le programme est structuré pour avancer du cadrage au déploiement du projet.
          </p>
        </div>
        <Link className="btn btn-secondary w-full sm:w-fit" href="/formations">
          Toutes les formations
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {modules.map((module) => (
          <article className="lesson-card overflow-hidden" key={module.id}>
            <div className="border-b border-border p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-extrabold text-accent">Module {module.order}</p>
                  <h3 className="mt-1 text-xl font-black text-text-strong">{module.title}</h3>
                  {module.description ? <p className="mt-2 text-sm text-text-muted">{module.description}</p> : null}
                </div>
                <span className="rounded-sm bg-muted px-2 py-1 text-xs font-extrabold uppercase text-text-muted">
                  {formatCourseDuration(module.durationMinutes)}
                </span>
              </div>
            </div>

            <div className="divide-y divide-border">
              {module.lessons.map((lesson) => (
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between" key={lesson.id}>
                  <div className="flex items-start gap-3">
                    <span className="icon-badge h-9 w-9 shrink-0">
                      <CheckCircle2 size={17} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-extrabold text-text-strong">{lesson.title}</span>
                      {lesson.description ? (
                        <span className="mt-1 block text-sm text-text-muted">{lesson.description}</span>
                      ) : null}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-text-muted">
                    {formatCourseDuration(lesson.durationMinutes)}
                  </span>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
