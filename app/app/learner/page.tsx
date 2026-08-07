import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpenText,
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
import { getCurrentProfile } from "@/lib/auth/server";
import { getLearnerDashboard } from "@/lib/learning-service";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Espace apprenant",
  description: "Suivez vos formations, leçons, ressources, livrables et certificats LearnIt.",
  path: "/app/learner",
  noIndex: true
});

function formatLearningTime(minutes: number) {
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export default async function LearnerAppPage() {
  const dashboard = await getLearnerDashboard();
  const profile = await getCurrentProfile();
  const nextLesson = dashboard.nextCourse?.nextLesson ?? dashboard.nextCourse?.currentLesson;

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
        title={`Bonjour ${profile?.name ?? "Utilisateur LearnIt"}`}
        description="Votre suivi pédagogique regroupe la progression, les formations actives et vos ressources favorites."
        actions={
          <Link className="btn btn-secondary" href="/app/learner/courses">
            <GraduationCap size={17} aria-hidden="true" />
            Mes formations
          </Link>
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
            <small>Temps d'apprentissage</small>
            <strong>{formatLearningTime(dashboard.globalProgress.learningTimeMinutes)}</strong>
          </div>
        </article>
      </section>

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
              <span>Ressources favorites</span>
              <h2>À retrouver</h2>
            </div>
            <Link className="text-link" href="/app/learner/resources">
              Bibliothèque
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="resource-list">
            {dashboard.favoriteResources.length > 0 ? dashboard.favoriteResources.map((resource) => (
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
            )) : (
              <AppEmptyState
                description="Ajoutez des ressources aux favoris pour les retrouver ici."
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
            <AppEmptyState
              description="Le suivi des livrables sera disponible prochainement."
              icon={FileCheck2}
              title="Aucun travail en attente"
            />
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
          <AppEmptyState
            description="Les certificats disponibles ou à venir seront listés ici."
            icon={Award}
            title="Aucun certificat"
          />
        </div>
      </section>
    </div>
  );
}
