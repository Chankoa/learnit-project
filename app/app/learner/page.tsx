import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  GraduationCap,
  Library,
  PlayCircle,
} from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { formatCourseDuration } from "@/components/catalog/CourseCard";
import { getCurrentProfile } from "@/lib/auth/server";
import { getLearnerDashboard } from "@/lib/learning-service";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Espace apprenant",
  description: "Suivez vos formations, leçons, ressources, livrables et certificats LearnIt.",
  path: "/app/learner",
  noIndex: true
});

export default async function LearnerAppPage() {
  const dashboard = await getLearnerDashboard();
  const profile = await getCurrentProfile();
  const nextLesson = dashboard.nextCourse?.nextLesson ?? dashboard.nextCourse?.currentLesson;
  const hasCourses = dashboard.courses.length > 0;
  const completedCourseCount = dashboard.courses.filter((course) => course.enrollment?.status === "completed").length;
  const resumeCourse = dashboard.nextCourse;
  const otherActiveCourses = resumeCourse
    ? dashboard.activeCourses.filter((course) => course.course.id !== resumeCourse.course.id)
    : dashboard.activeCourses;

  return (
    <div className="app-page learner-page">
      <AppBreadcrumb
        items={[
          { label: "Accès plateforme", href: "/app" },
          { label: "Tableau de bord" }
        ]}
      />

      <AppPageHeader
        eyebrow="Tableau de bord apprenant"
        title={`Bonjour ${profile?.name ?? "Utilisateur LearnIt"}`}
        description="Votre suivi pédagogique regroupe la progression, les formations actives et vos ressources favorites."
        actions={
          hasCourses ? (
            <Link className="btn btn-secondary" href="/app/learner/courses">
              <GraduationCap size={17} aria-hidden="true" />
              Mes apprentissages
            </Link>
          ) : (
            <Link className="btn btn-primary" href="/formations">
              <GraduationCap size={17} aria-hidden="true" />
              Explorer les formations
            </Link>
          )
        }
      />

      {resumeCourse && nextLesson ? (
        <section className="learning-panel learning-panel--resume" aria-labelledby="resume-heading">
          <div className="learning-panel__heading">
            <div>
              <span>À reprendre</span>
              <h2 id="resume-heading">Reprendre votre apprentissage</h2>
            </div>
            <span className="learning-metric-icon learning-metric-icon--purple">
              <PlayCircle size={20} aria-hidden="true" />
            </span>
          </div>
          <div className="learner-resume">
            <div>
              <span>{resumeCourse.course.domain.name}</span>
              <h3>{resumeCourse.course.title}</h3>
              <p>{nextLesson.title}</p>
            </div>
            <div className="learner-resume__progress">
              <strong>{resumeCourse.percentage}%</strong>
              <span>{resumeCourse.completedCount}/{resumeCourse.totalLessons} leçons terminées</span>
              <div className="learning-progress" aria-label={`${resumeCourse.percentage}% de progression`}>
                <span style={{ width: `${resumeCourse.percentage}%` }} />
              </div>
            </div>
            <Link className="btn btn-primary" href={resumeCourse.ctaHref}>
              Reprendre
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      ) : !hasCourses ? (
        <AppEmptyState
          action={<Link className="btn btn-primary" href="/formations">Explorer les formations</Link>}
          description="Explorez le catalogue et commencez votre premier parcours."
          icon={GraduationCap}
          title="Aucune formation en cours"
        />
      ) : null}

      {otherActiveCourses.length > 0 ? (
        <section className="learning-panel">
          <div className="learning-panel__heading">
            <div>
              <span>En cours</span>
              <h2>Autres apprentissages actifs</h2>
            </div>
            <Link className="text-link" href="/app/learner/courses">
              Tout voir
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="learner-list">
            {otherActiveCourses.map((summary) => (
              <article className="learner-row learner-row--course" key={summary.course.id}>
                {summary.course.coverImage ? (
                  <div className="learner-row__media">
                    <Image
                      alt={`Couverture de ${summary.course.title}`}
                      fill
                      sizes="(max-width: 760px) 96px, 128px"
                      src={summary.course.coverImage}
                    />
                  </div>
                ) : null}
                <div>
                  <span>{summary.course.domain.name}</span>
                  <h3>{summary.course.title}</h3>
                  <p>
                    {summary.completedCount} leçons terminées sur {summary.totalLessons} ·{" "}
                    {formatCourseDuration(summary.course.durationMinutes)}
                  </p>
                  <div className="learning-progress">
                    <span style={{ width: `${summary.percentage}%` }} />
                  </div>
                </div>
                <Link className="btn btn-secondary" href={summary.ctaHref}>
                  {summary.ctaLabel}
                </Link>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {hasCourses ? (
        <section className="learner-dashboard-stats" aria-label="Synthèse de progression">
          <span><strong>{dashboard.globalProgress.percentage}%</strong> progression globale</span>
          <span><strong>{dashboard.activeCourses.length}</strong> apprentissage{dashboard.activeCourses.length > 1 ? "s" : ""} en cours</span>
          <span><strong>{completedCourseCount}</strong> terminé{completedCourseCount > 1 ? "s" : ""}</span>
        </section>
      ) : null}

      {dashboard.favoriteResources.length > 0 ? (
        <section className="learning-panel">
          <div className="learning-panel__heading">
            <div>
              <span>Ressources favorites</span>
              <h2>À retrouver</h2>
            </div>
            <Link className="text-link" href="/app/learner/resources">
              Bibliothèque
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="resource-list">
            {dashboard.favoriteResources.map((resource) => (
              <article key={resource.id}>
                <span className="learning-resource-icon">
                  <Library size={17} aria-hidden="true" />
                </span>
                <div>
                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>
                </div>
                <span>{resource.type}</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
