import type { Metadata } from "next";
import {
  BookOpenCheck,
  BookOpenText,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Layers3,
  TrendingUp
} from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import {
  formatLearningTime,
  getLearnerCourseSummaries,
  getLearnerGlobalProgress
} from "@/lib/learner";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Progression apprenant",
  description: "Consultez la progression par formation, module, leçon, exercice et temps d'apprentissage.",
  path: "/app/learner/progress",
  noIndex: true
});

export default function LearnerProgressPage() {
  const courses = getLearnerCourseSummaries();
  const globalProgress = getLearnerGlobalProgress();
  const completedLessons = courses.flatMap((course) =>
    course.completedLessons.map((completedLesson) => ({
      ...completedLesson,
      course: course.course
    }))
  );
  const moduleRows = courses.flatMap((course) =>
    course.modules.map((module) => ({
      course: course.course,
      ...module
    }))
  );
  const exerciseRows = moduleRows.filter((module) => module.totalExerciseCount > 0);

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
        description="Visualisez l'avancement par formation et par module, les leçons terminées, les exercices rendus et le temps d'apprentissage fictif."
      />

      <section className="learning-metrics learner-metrics" aria-label="Synthese de progression">
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
            <FileCheck2 size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Exercices rendus</small>
            <strong>
              {globalProgress.exercisesSubmitted}/{globalProgress.exercisesTotal}
            </strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--amber">
            <Clock3 size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Temps fictif</small>
            <strong>{formatLearningTime(globalProgress.learningTimeMinutes)}</strong>
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
              <h2>Repartition fictive</h2>
            </div>
            <Clock3 size={20} aria-hidden="true" />
          </div>

          <div className="learner-list">
            {courses.map((summary) => (
              <article className="learner-time-row" key={summary.course.id}>
                <div>
                  <h3>{summary.course.title}</h3>
                  <p>{summary.status === "not-started" ? "Non démarré" : "Activité enregistrée"}</p>
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
                <span style={{ width: `${module.percentage}%` }} />
              </div>
              <p>
                {module.completedCount}/{module.totalLessons} leçons ·{" "}
                {formatLearningTime(module.learningTimeMinutes)}
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
            {completedLessons.map(({ course, lesson, module }) => (
              <article className="learner-compact-row" key={`${course.id}-${lesson.id}`}>
                <span className="learning-metric-icon learning-metric-icon--green">
                  <CheckCircle2 size={17} aria-hidden="true" />
                </span>
                <div>
                  <h3>{lesson.title}</h3>
                  <p>
                    {course.title} · {module.title}
                  </p>
                </div>
              </article>
            ))}
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
            {exerciseRows.map((module) => (
              <article className="learner-progress-row" key={`exercise-${module.course.id}-${module.module.id}`}>
                <div>
                  <h3>{module.module.title}</h3>
                  <p>{module.course.title}</p>
                </div>
                <div>
                  <strong>
                    {module.submittedExerciseCount}/{module.totalExerciseCount}
                  </strong>
                  <span>exercices rendus</span>
                  <div className="learning-progress">
                    <span
                      style={{
                        width: `${
                          module.totalExerciseCount > 0
                            ? Math.round((module.submittedExerciseCount / module.totalExerciseCount) * 100)
                            : 0
                        }%`
                      }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
