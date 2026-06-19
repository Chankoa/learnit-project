import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpenText,
  CheckCircle2,
  Circle,
  Clock3,
  FileCheck2,
  GraduationCap,
  Library,
  PlayCircle,
  Sparkles
} from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { formatCourseDuration } from "@/components/catalog/CourseCard";
import { LearnerLocalProgressStrip } from "@/components/learning/LearnerLocalProgressStrip";
import { ResumeCourseButton } from "@/components/learning/ResumeCourseButton";
import { getCourseLessons } from "@/lib/courses";
import {
  certificateStatusLabels,
  formatLearnerDate,
  formatLearningTime,
  getLearnerDashboardData,
  learnerResourceTypeLabels
} from "@/lib/learner";
import { createPageMetadata } from "@/lib/seo";
import type { DeliverableStatus } from "@/types/learning";

export const metadata: Metadata = createPageMetadata({
  title: "Espace apprenant",
  description: "Suivez vos formations, leçons, ressources, livrables et certificats LearnIt.",
  path: "/app/learner",
  noIndex: true
});

const deliverableStatusLabels: Record<DeliverableStatus, string> = {
  todo: "À faire",
  "in-progress": "En cours",
  submitted: "Envoyé"
};

export default function LearnerAppPage() {
  const dashboard = getLearnerDashboardData();
  const nextLesson = dashboard.nextCourse?.nextLesson ?? dashboard.nextCourse?.currentLesson;
  const resumeCourses = dashboard.courses.map((summary) => ({
    id: summary.course.id,
    slug: summary.course.slug,
    title: summary.course.title,
    lessons: getCourseLessons(summary.course.id).map((lesson) => ({
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      status: lesson.status
    }))
  }));

  return (
    <div className="app-page learner-page">
      <AppBreadcrumb
        items={[
          { label: "Accès plateforme", href: "/app" },
          { label: "Espace apprenant" }
        ]}
      />

      <AppPageHeader
        eyebrow="Tableau de bord apprenant"
        title={`Bonjour ${dashboard.learner.firstName}`}
        description="Votre suivi pédagogique regroupe la progression, les formations actives, les ressources récentes, les travaux attendus et les certificats."
        actions={
          <>
            <ResumeCourseButton courses={resumeCourses} />
            <Link className="btn btn-secondary" href="/app/learner/courses">
              <GraduationCap size={17} aria-hidden="true" />
              Mes formations
            </Link>
          </>
        }
      />

      <section className="learning-metrics learner-metrics" aria-label="Progression globale">
        <article>
          <span className="learning-metric-icon learning-metric-icon--purple">
            <Sparkles size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Progression globale</small>
            <strong>{dashboard.globalProgress.percentage}%</strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--cyan">
            <BookOpenText size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Leçons terminées</small>
            <strong>
              {dashboard.globalProgress.completedLessons}/{dashboard.globalProgress.totalLessons}
            </strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--green">
            <FileCheck2 size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Exercices rendus</small>
            <strong>
              {dashboard.globalProgress.exercisesSubmitted}/{dashboard.globalProgress.exercisesTotal}
            </strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--amber">
            <Clock3 size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Temps fictif</small>
            <strong>{formatLearningTime(dashboard.globalProgress.learningTimeMinutes)}</strong>
          </div>
        </article>
      </section>

      <LearnerLocalProgressStrip courses={resumeCourses} />

      <div className="dashboard-primary-grid">
        <section className="learning-panel">
          <div className="learning-panel__heading">
            <div>
              <span>Formations en cours</span>
              <h2>Parcours à reprendre</h2>
            </div>
            <Link className="text-link" href="/app/learner/courses">
              Tout voir
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="learner-list">
            {dashboard.activeCourses.length > 0 ? dashboard.activeCourses.map((summary) => (
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
            )) : (
              <AppEmptyState
                description="Aucune formation n'est en cours pour le moment."
                icon={GraduationCap}
                title="Aucune formation"
              />
            )}
          </div>
        </section>

        <section className="learning-panel learning-panel--next">
          <div className="learning-panel__heading">
            <div>
              <span>Prochaine leçon</span>
              <h2>{nextLesson?.title ?? "Aucune leçon planifiée"}</h2>
            </div>
            <span className="learning-metric-icon learning-metric-icon--purple">
              <PlayCircle size={20} aria-hidden="true" />
            </span>
          </div>

          {nextLesson && dashboard.nextCourse ? (
            <>
              <p>{nextLesson.description}</p>
              <div className="next-lesson-meta">
                <span>
                  <Clock3 size={16} aria-hidden="true" />
                  {formatCourseDuration(nextLesson.durationMinutes)}
                </span>
                <span>
                  <GraduationCap size={16} aria-hidden="true" />
                  {dashboard.nextCourse.course.title}
                </span>
              </div>
              <Link className="btn btn-primary" href={dashboard.nextCourse.ctaHref}>
                Reprendre
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </>
          ) : (
            <p>Aucune prochaine leçon disponible pour le moment.</p>
          )}
        </section>
      </div>

      <div className="dashboard-secondary-grid">
        <section className="learning-panel">
          <div className="learning-panel__heading">
            <div>
              <span>Ressources récentes</span>
              <h2>Dernières consultations</h2>
            </div>
            <Link className="text-link" href="/app/learner/resources">
              Bibliothèque
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="resource-list">
            {dashboard.recentResources.length > 0 ? dashboard.recentResources.map((resource) => (
              <article key={resource.id}>
                <span className="learning-resource-icon">
                  <Library size={17} aria-hidden="true" />
                </span>
                <div>
                  <h3>{resource.title}</h3>
                  <p>
                    {resource.description} Consulté le {formatLearnerDate(resource.lastConsultedAt)}.
                  </p>
                </div>
                <span>{learnerResourceTypeLabels[resource.type]}</span>
              </article>
            )) : (
              <AppEmptyState
                description="Les dernières ressources consultées apparaîtront ici."
                icon={Library}
                title="Aucune ressource"
              />
            )}
          </div>
        </section>

        <section className="learning-panel">
          <div className="learning-panel__heading">
            <div>
              <span>Travaux à terminer</span>
              <h2>Livrables et exercices</h2>
            </div>
            <FileCheck2 size={20} aria-hidden="true" />
          </div>

          <div className="deliverable-list">
            {dashboard.deliverables.length > 0 ? dashboard.deliverables.map(({ deliverable, course }) => (
              <article key={deliverable.id}>
                <span className="deliverable-check" data-status={deliverable.status}>
                  {deliverable.status === "submitted" ? (
                    <CheckCircle2 size={18} aria-hidden="true" />
                  ) : (
                    <Circle size={18} aria-hidden="true" />
                  )}
                </span>
                <div>
                  <h3>{deliverable.title}</h3>
                  <p>{deliverable.description}</p>
                  <small>{course?.title ?? "Formation"} · {deliverable.dueLabel ?? "À planifier"}</small>
                </div>
                <span className="state-badge" data-state={deliverable.status}>
                  {deliverableStatusLabels[deliverable.status]}
                </span>
              </article>
            )) : (
              <AppEmptyState
                description="Aucun exercice ou livrable n'est à terminer."
                icon={FileCheck2}
                title="Aucun travail en attente"
              />
            )}
          </div>
        </section>
      </div>

      <section className="learning-panel">
        <div className="learning-panel__heading">
          <div>
            <span>Certificats</span>
            <h2>Disponibles ou à venir</h2>
          </div>
          <Link className="text-link" href="/app/learner/certificates">
            Voir les certificats
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="learner-certificate-strip">
          {dashboard.certificates.length > 0 ? dashboard.certificates.slice(0, 3).map(({ certificate, course }) => (
            <article key={certificate.id}>
              <span className="learning-metric-icon learning-metric-icon--green">
                <Award size={19} aria-hidden="true" />
              </span>
              <div>
                <h3>{certificate.title}</h3>
                <p>{course?.title ?? "Formation"} · {certificateStatusLabels[certificate.status]}</p>
              </div>
              <span className="state-badge" data-state={certificate.status}>
                {certificate.currentProgressPercentage}%
              </span>
            </article>
          )) : (
            <AppEmptyState
              description="Les certificats disponibles ou à venir seront listés ici."
              icon={Award}
              title="Aucun certificat"
            />
          )}
        </div>
      </section>
    </div>
  );
}
