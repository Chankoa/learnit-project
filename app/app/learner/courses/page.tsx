import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Clock3,
  GraduationCap
} from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { formatLearningTime, getLearnerCourseSummaries } from "@/lib/learner";
import { createPageMetadata } from "@/lib/seo";
import type { LearnerEnrollmentStatus } from "@/types/learning";

export const metadata: Metadata = createPageMetadata({
  title: "Mes formations",
  description: "Retrouvez les formations en cours, terminées et non commencées de l'apprenant.",
  path: "/app/learner/courses",
  noIndex: true
});

const courseGroups = [
  {
    status: "in-progress",
    title: "En cours",
    description: "Les parcours déjà démarrés et prêts à reprendre."
  },
  {
    status: "completed",
    title: "Terminées",
    description: "Les formations achevées que vous pouvez revoir."
  },
  {
    status: "not-started",
    title: "Non commencées",
    description: "Les parcours ajoutés à votre espace mais pas encore démarrés."
  }
] satisfies Array<{
  status: LearnerEnrollmentStatus;
  title: string;
  description: string;
}>;

export default function LearnerCoursesPage() {
  const courses = getLearnerCourseSummaries();

  return (
    <div className="app-page learner-page">
      <AppBreadcrumb
        items={[
          { label: "Espace apprenant", href: "/app/learner" },
          { label: "Mes formations" }
        ]}
      />

      <AppPageHeader
        eyebrow="Mes formations"
        title="Vos parcours d'apprentissage"
        description="Suivez les formations en cours, retrouvez celles déjà terminées et lancez les parcours non commencés."
      />

      {courseGroups.map((group) => {
        const groupCourses = courses.filter((course) => course.status === group.status);

        return (
          <section className="learner-course-section" key={group.status}>
            <div className="learning-section__heading">
              <div>
                <span>{group.title}</span>
                <h2>{group.description}</h2>
              </div>
              <strong>{groupCourses.length}</strong>
            </div>

            <div className="learner-course-grid">
              {groupCourses.length > 0 ? groupCourses.map((summary) => (
                <article className="learner-course-card" key={summary.course.id}>
                  {summary.course.coverImage ? (
                    <div className="learner-course-card__media">
                      <Image
                        alt={`Couverture de ${summary.course.title}`}
                        fill
                        sizes="(max-width: 760px) 100vw, 33vw"
                        src={summary.course.coverImage}
                      />
                    </div>
                  ) : null}

                  <div className="learner-course-card__body">
                    <div className="learner-course-card__topline">
                      <span>{summary.course.domain.name}</span>
                      <span className="state-badge" data-state={summary.status}>
                        {group.title}
                      </span>
                    </div>

                    <h3>{summary.course.title}</h3>

                    <div className="learning-progress" aria-label={`${summary.percentage}% termine`}>
                      <span style={{ width: `${summary.percentage}%` }} />
                    </div>

                    <div className="learner-course-card__stats">
                      <span>
                        <BookOpenText size={15} aria-hidden="true" />
                        {summary.completedCount}/{summary.totalLessons} leçons
                      </span>
                      <span>
                        <Clock3 size={15} aria-hidden="true" />
                        {formatLearningTime(summary.learningTimeMinutes)}
                      </span>
                    </div>

                    <Link className="btn btn-secondary" href={summary.ctaHref}>
                      <GraduationCap size={16} aria-hidden="true" />
                      {summary.ctaLabel}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              )) : (
                <AppEmptyState
                  description="Aucune formation ne correspond à cette catégorie pour le moment."
                  icon={GraduationCap}
                  title={`Aucune formation ${group.title.toLowerCase()}`}
                />
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
