import type { Metadata } from "next";
import {
  BookOpenCheck,
  BookOpenText,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  Layers3,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { getLearnerDashboard } from "@/lib/learning-service";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Progression apprenant",
  description: "Consultez la progression par formation, module, leçon, exercice et temps d'apprentissage.",
  path: "/app/learner/progress",
  noIndex: true
});

function formatLearningTime(minutes: number) {
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export default async function LearnerProgressPage() {
  const dashboard = await getLearnerDashboard();
  const courses = dashboard.courses;
  const globalProgress = dashboard.globalProgress;
  const completedCourseCount = courses.filter((course) => course.enrollment?.status === "completed").length;
  const completedLessons = courses.flatMap((course) =>
    course.modules.flatMap((module) => module.lessons
      .filter((lesson) => lesson.status === "completed")
      .map((lesson) => ({ course: course.course, lesson, module })))
  );
  const moduleRows = courses.flatMap((course) =>
    course.modules.map((module) => {
      const accessibleLessons = module.lessons.filter((lesson) => lesson.status !== "locked");

      return {
        course: course.course,
        module,
        completedCount: accessibleLessons.filter((lesson) => lesson.status === "completed").length,
        totalLessons: accessibleLessons.length
      };
    })
  );

  return (
    <div className="app-page learner-page">
      <AppBreadcrumb
        items={[
          { label: "Espace apprenant", href: "/app/learner" },
          { label: "Progression" }
        ]}
      />

      <AppPageHeader
        eyebrow="Progression"
        title="Suivi pédagogique détaillé"
        description="Visualisez l'avancement par formation et par module, les leçons terminées et le temps d'apprentissage enregistré."
      />

      {courses.length === 0 ? (
        <AppEmptyState
          action={<Link className="btn btn-primary" href="/formations">Explorer les formations</Link>}
          description="Vous n'avez encore commencé aucune formation. Votre progression apparaîtra dès qu'un parcours sera inscrit."
          icon={TrendingUp}
          title="Aucune progression enregistrée"
        />
      ) : (
      <>
      <section className="learning-metrics learner-metrics" aria-label="Synthèse de progression">
        <article>
          <span className="learning-metric-icon learning-metric-icon--purple">
            <TrendingUp size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Progression globale</small>
            <strong>{globalProgress.percentage}%</strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--cyan">
            <BookOpenText size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Leçons terminées</small>
            <strong>{globalProgress.completedLessons}</strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--green">
            <GraduationCap size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Formations suivies</small>
            <strong>{courses.length}</strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--amber">
            <BookOpenCheck size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Formations terminées</small>
            <strong>{completedCourseCount}</strong>
          </div>
        </article>
      </section>

      <div className="learner-progress-layout">
        <section className="learning-panel">
          <div className="learning-panel__heading">
            <div>
              <span>Par formation</span>
              <h2>Progression des parcours</h2>
            </div>
            <Layers3 size={20} aria-hidden="true" />
          </div>

          <div className="learner-list">
            {courses.map((summary) => (
              <article className="learner-progress-row" key={summary.course.id}>
                <div>
                  <h3>{summary.course.title}</h3>
                  <p>{summary.course.domain.name}</p>
                </div>
                <div>
                  <strong>{summary.percentage}%</strong>
                  <span>
                    {summary.completedCount}/{summary.totalLessons} leçons
                  </span>
                  <div className="learning-progress">
                    <span style={{ width: `${summary.percentage}%` }} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="learning-panel">
          <div className="learning-panel__heading">
            <div>
              <span>Temps d'apprentissage</span>
              <h2>Répartition enregistrée</h2>
            </div>
            <BookOpenText size={20} aria-hidden="true" />
          </div>

          <div className="learner-list">
            {courses.map((summary) => (
              <article className="learner-time-row" key={summary.course.id}>
                <div>
                  <h3>{summary.course.title}</h3>
                  <p>{summary.enrollment?.status === "not-started" ? "Non démarré" : "Activité enregistrée"}</p>
                </div>
                <strong>{formatLearningTime(summary.learningTimeMinutes)}</strong>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="learning-panel">
        <div className="learning-panel__heading">
          <div>
            <span>Par module</span>
            <h2>Avancement module par module</h2>
          </div>
          <BookOpenCheck size={20} aria-hidden="true" />
        </div>

        <div className="learner-module-grid">
          {moduleRows.map((module) => (
            <article className="learner-module-card" key={`${module.course.id}-${module.module.id}`}>
              <span>{module.course.title}</span>
              <h3>{module.module.title}</h3>
              <div className="learning-progress">
                <span style={{ width: `${module.totalLessons > 0 ? Math.round((module.completedCount / module.totalLessons) * 100) : 0}%` }} />
              </div>
              <p>
                {module.completedCount}/{module.totalLessons} leçons
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="dashboard-secondary-grid">
        <section className="learning-panel">
          <div className="learning-panel__heading">
            <div>
              <span>Leçons terminées</span>
              <h2>Historique des validations</h2>
            </div>
            <CheckCircle2 size={20} aria-hidden="true" />
          </div>

          <div className="learner-list">
            {completedLessons.length > 0 ? completedLessons.map(({ course, lesson, module }) => (
              <article className="learner-compact-row" key={`${course.id}-${lesson.id}`}>
                <div>
                  <h3>{lesson.title}</h3>
                  <p>
                    {course.title} · {module.title}
                  </p>
                </div>
              </article>
            )) : <AppEmptyState description="Les leçons validées apparaîtront ici." icon={BookOpenCheck} title="Aucune leçon terminée" />}
          </div>
        </section>

        <section className="learning-panel">
          <div className="learning-panel__heading">
            <div>
              <span>Exercices rendus</span>
              <h2>Suivi des travaux</h2>
            </div>
            <FileCheck2 size={20} aria-hidden="true" />
          </div>

          <div className="learner-list">
            <AppEmptyState description="Le suivi des exercices sera disponible prochainement." icon={FileCheck2} title="Aucun exercice rendu" />
          </div>
        </section>
      </div>
      </>
      )}
    </div>
  );
}
