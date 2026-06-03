import { BookOpen, CheckCircle2, Clock3, PlayCircle } from "lucide-react";

import { getLearningModules } from "@/lib/site";

export function LearningPreview() {
  const learningModules = getLearningModules();

  return (
    <section className="section-shell py-8 pb-16" id="programme">
      <div className="dashboard-grid">
        <aside className="lesson-card p-5">
          <p className="text-sm font-bold text-text-muted">Progression globale</p>
          <div className="mt-5 flex items-center gap-5">
            <div className="progress-ring">
              <span>40%</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-text-strong">Formation création web</h2>
              <p className="text-sm text-text-muted">4 / 10 jours complétés</p>
              <button className="btn btn-primary mt-4 min-h-10 px-4" type="button">
                Reprendre
              </button>
            </div>
          </div>
        </aside>

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="metric-card p-5">
              <Clock3 className="text-status-warning" size={22} aria-hidden="true" />
              <p className="mt-4 text-sm text-text-muted">Temps d'apprentissage</p>
              <strong className="text-2xl text-text-strong">12h 30m</strong>
            </div>
            <div className="metric-card p-5">
              <PlayCircle className="text-accent" size={22} aria-hidden="true" />
              <p className="mt-4 text-sm text-text-muted">Leçons terminées</p>
              <strong className="text-2xl text-text-strong">28 / 70</strong>
            </div>
            <div className="metric-card p-5">
              <BookOpen className="text-status-success" size={22} aria-hidden="true" />
              <p className="mt-4 text-sm text-text-muted">Module en cours</p>
              <strong className="text-2xl text-text-strong">CSS</strong>
            </div>
          </div>

          <div className="lesson-card p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-extrabold text-accent">Module en cours</p>
                <h3 className="mt-1 text-xl font-black text-text-strong">Jour 4 - CSS & Mise en forme</h3>
                <p className="mt-1 text-sm text-text-muted">Flexbox, Grid, couleurs et espacements.</p>
              </div>
              <button className="btn btn-primary min-h-10 px-4" type="button">
                Continuer
              </button>
            </div>
          </div>

          <div className="lesson-card divide-y divide-border overflow-hidden">
            {learningModules.map((module) => (
              <div className="flex items-center justify-between gap-4 p-4" key={module.title}>
                <div className="flex items-center gap-3">
                  <span className="icon-badge h-9 w-9">
                    <CheckCircle2 size={17} aria-hidden="true" />
                  </span>
                  <span className="font-extrabold text-text-strong">{module.title}</span>
                </div>
                <span className="text-sm font-bold text-status-success">{module.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
