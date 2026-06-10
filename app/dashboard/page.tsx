import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  Circle,
  Clock3,
  Download,
  FileCheck2,
  Layers3,
  PlayCircle,
  Sparkles
} from "lucide-react";

import { formatCourseDuration } from "@/components/catalog/CourseCard";
import { LearningShell } from "@/components/learning/LearningShell";
import { getLearnerDashboardData } from "@/lib/progress";
import type { DeliverableStatus } from "@/types/learning";

export const metadata: Metadata = {
  title: "Tableau de bord",
  description: "Suivez votre progression, vos prochaines leçons et vos livrables LearnIt."
};

const deliverableStatusLabels: Record<DeliverableStatus, string> = {
  todo: "À faire",
  "in-progress": "En cours",
  submitted: "Envoyé"
};

function formatLastAccessed(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default function DashboardPage() {
  const dashboard = getLearnerDashboardData();
  const currentEnrollment = dashboard.currentEnrollment;
  const nextLesson = currentEnrollment?.nextLesson ?? currentEnrollment?.currentLesson;

  return (
    <LearningShell learner={dashboard.learner} pageTitle="Tableau de bord">
      <div className="dashboard-page">
        <section className="dashboard-welcome">
          <div>
            <span className="dashboard-kicker">
              <Sparkles size={15} aria-hidden="true" />
              Reprendre votre progression
            </span>
            <h2>Bonjour {dashboard.learner.firstName}, prêt à continuer ?</h2>
            <p>
              Retrouvez votre formation en cours, les prochaines étapes et les livrables à préparer.
            </p>
          </div>
          {currentEnrollment ? (
            <Link
              className="btn btn-primary"
              href={
                currentEnrollment.currentLesson
                  ? `/learn/${currentEnrollment.course.slug}/${currentEnrollment.currentLesson.slug}`
                  : `/learn/${currentEnrollment.course.slug}`
              }
            >
              <PlayCircle size={17} aria-hidden="true" />
              Continuer
            </Link>
          ) : null}
        </section>

        <section className="learning-metrics" id="progression" aria-label="Progression globale">
          <article>
            <span className="learning-metric-icon learning-metric-icon--purple">
              <Layers3 size={19} aria-hidden="true" />
            </span>
            <div>
              <small>Formations suivies</small>
              <strong>{dashboard.enrollments.length}</strong>
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
              <CheckCircle2 size={19} aria-hidden="true" />
            </span>
            <div>
              <small>Progression globale</small>
              <strong>{dashboard.globalProgress.percentage}%</strong>
            </div>
          </article>
        </section>

        <div className="dashboard-primary-grid">
          <section className="learning-panel learning-panel--current">
            <div className="learning-panel__heading">
              <div>
                <span>Formation en cours</span>
                <h2>{currentEnrollment?.course.title ?? "Aucune formation active"}</h2>
              </div>
              {currentEnrollment ? (
                <span className="learning-panel__percentage">{currentEnrollment.percentage}%</span>
              ) : null}
            </div>

            {currentEnrollment ? (
              <>
                <div className="current-course">
                  {currentEnrollment.course.coverImage ? (
                    <div className="current-course__media">
                      <Image
                        alt=""
                        fill
                        sizes="(max-width: 900px) 100vw, 260px"
                        src={currentEnrollment.course.coverImage}
                      />
                    </div>
                  ) : null}
                  <div className="current-course__body">
                    <div className="current-course__meta">
                      <span>{currentEnrollment.course.domain.name}</span>
                      <span>{formatCourseDuration(currentEnrollment.course.durationMinutes)}</span>
                    </div>
                    <p>
                      {currentEnrollment.completedCount} leçons terminées sur{" "}
                      {currentEnrollment.totalLessons}.
                    </p>
                    <div className="learning-progress">
                      <span style={{ width: `${currentEnrollment.percentage}%` }} />
                    </div>
                    <small>
                      Dernier accès : {formatLastAccessed(currentEnrollment.progress.lastAccessedAt)}
                    </small>
                  </div>
                </div>

                <Link
                  className="text-link"
                  href={`/learn/${currentEnrollment.course.slug}`}
                >
                  Ouvrir le curriculum
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </>
            ) : null}
          </section>

          <section className="learning-panel learning-panel--next">
            <div className="learning-panel__heading">
              <div>
                <span>Prochaine leçon</span>
                <h2>
                  {currentEnrollment?.nextLesson?.title ??
                    currentEnrollment?.currentLesson?.title ??
                    "À définir"}
                </h2>
              </div>
              <span className="learning-metric-icon learning-metric-icon--purple">
                <PlayCircle size={20} aria-hidden="true" />
              </span>
            </div>

            {nextLesson && currentEnrollment ? (
              <>
                <p>{nextLesson.description}</p>
                <div className="next-lesson-meta">
                  <span>
                    <Clock3 size={16} aria-hidden="true" />
                    {formatCourseDuration(nextLesson.durationMinutes)}
                  </span>
                  <span>
                    <BookOpenText size={16} aria-hidden="true" />
                    {nextLesson.type}
                  </span>
                </div>
                <Link
                  className="btn btn-secondary"
                  href={`/learn/${currentEnrollment.course.slug}/${nextLesson.slug}`}
                >
                  Voir la leçon
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </>
            ) : (
              <p>Aucune prochaine leçon disponible.</p>
            )}
          </section>
        </div>

        <section className="learning-section" id="mes-formations">
          <div className="learning-section__heading">
            <div>
              <span>Mes parcours</span>
              <h2>Formations suivies</h2>
            </div>
            <Link className="text-link" href="/#catalogue">
              Explorer le catalogue
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="enrollment-grid">
            {dashboard.enrollments.map((enrollment) => (
              <article className="enrollment-card" key={enrollment.course.id}>
                {enrollment.course.coverImage ? (
                  <div className="enrollment-card__media">
                    <Image
                      alt=""
                      fill
                      sizes="(max-width: 760px) 100vw, 35vw"
                      src={enrollment.course.coverImage}
                    />
                  </div>
                ) : null}
                <div className="enrollment-card__body">
                  <span>{enrollment.course.domain.name}</span>
                  <h3>{enrollment.course.title}</h3>
                  <div className="learning-progress">
                    <span style={{ width: `${enrollment.percentage}%` }} />
                  </div>
                  <div className="enrollment-card__footer">
                    <small>{enrollment.percentage}% terminé</small>
                    <Link href={`/learn/${enrollment.course.slug}`}>
                      Continuer
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="dashboard-secondary-grid">
          <section className="learning-panel" id="ressources">
            <div className="learning-panel__heading">
              <div>
                <span>Bibliothèque</span>
                <h2>Dernières ressources</h2>
              </div>
              <Download size={20} aria-hidden="true" />
            </div>
            <div className="resource-list">
              {dashboard.recentResources.map((resource) => (
                <article key={resource.id}>
                  <span className="learning-resource-icon">
                    <BookOpenText size={17} aria-hidden="true" />
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

          <section className="learning-panel" id="livrables">
            <div className="learning-panel__heading">
              <div>
                <span>Travail à produire</span>
                <h2>Livrables</h2>
              </div>
              <FileCheck2 size={20} aria-hidden="true" />
            </div>
            <div className="deliverable-list">
              {dashboard.deliverables.map((deliverable) => (
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
                    {deliverable.dueLabel ? <small>{deliverable.dueLabel}</small> : null}
                  </div>
                  <span className="state-badge" data-state={deliverable.status}>
                    {deliverableStatusLabels[deliverable.status]}
                  </span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </LearningShell>
  );
}
