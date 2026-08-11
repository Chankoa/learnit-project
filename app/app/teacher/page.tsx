import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  BookPlus,
  GraduationCap,
  History,
  Pencil,
  Sparkles
} from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { getCurrentProfile } from "@/lib/auth/server";
import { formatTeacherDateTime, teacherCourseStatusLabels } from "@/lib/teacher";
import { getTeacherStudioDashboard } from "@/lib/teacher-service";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Espace enseignant",
  description: "Gerez vos formations, modules et lecons LearnIt.",
  path: "/app/teacher",
  noIndex: true
});

export default async function TeacherAppPage() {
  const [dashboard, profile] = await Promise.all([
    getTeacherStudioDashboard("/app/teacher"),
    getCurrentProfile()
  ]);

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Acces plateforme", href: "/app" },
          { label: "Espace enseignant" }
        ]}
      />

      <AppPageHeader
        eyebrow="Tableau de bord enseignant"
        title={`Bonjour ${profile?.name ?? "Utilisateur LearnIt"}`}
        description="Pilotez vos formations reelles, surveillez les brouillons et reprenez les dernieres modifications."
        actions={
          <Link className="btn btn-primary" href="/app/teacher/courses/new">
            <BookPlus size={17} aria-hidden="true" />
            Creer une formation
          </Link>
        }
      />

      <section className="learning-metrics teacher-metrics" aria-label="Indicateurs enseignant">
        <article>
          <span className="learning-metric-icon learning-metric-icon--purple">
            <GraduationCap size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Mes formations</small>
            <strong>{dashboard.metrics.courseCount}</strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--green">
            <BookOpenText size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Publiees / brouillons</small>
            <strong>
              {dashboard.metrics.publishedCount}/{dashboard.metrics.draftCount}
            </strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--cyan">
            <Pencil size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Brouillons</small>
            <strong>{dashboard.metrics.draftCount}</strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--amber">
            <Sparkles size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Derniere modification</small>
            <strong>
              {dashboard.metrics.latestUpdatedAt
                ? formatTeacherDateTime(dashboard.metrics.latestUpdatedAt)
                : "-"}
            </strong>
          </div>
        </article>
      </section>

      <div className="dashboard-primary-grid">
        <section className="learning-panel">
          <div className="learning-panel__heading">
            <div>
              <span>Formations recentes</span>
              <h2>Dernieres mises a jour</h2>
            </div>
            <Link className="text-link" href="/app/teacher/courses">
              Mes formations
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="teacher-list">
            {dashboard.courses.length > 0 ? (
              dashboard.courses.slice(0, 4).map((course) => (
                <article className="teacher-row teacher-row--course" key={course.id}>
                  <div>
                    <span>{course.domain.name}</span>
                    <h3>{course.title}</h3>
                    <p>{formatTeacherDateTime(course.updatedAt)}</p>
                  </div>
                  <span className="state-badge" data-state={course.status}>
                    {teacherCourseStatusLabels[course.status]}
                  </span>
                </article>
              ))
            ) : (
              <AppEmptyState
                action={
                  <Link className="btn btn-primary" href="/app/teacher/courses/new">
                    <BookPlus size={17} aria-hidden="true" />
                    Creer une formation
                  </Link>
                }
                description="Vous n'avez encore cree aucune formation. Commencez par un brouillon, ajoutez vos modules, puis publiez quand le parcours est pret."
                icon={GraduationCap}
                title="Aucune formation"
              />
            )}
          </div>
        </section>

        <section className="learning-panel">
          <div className="learning-panel__heading">
            <div>
              <span>Historique</span>
              <h2>Dernieres modifications</h2>
            </div>
            <History size={20} aria-hidden="true" />
          </div>

          <div className="teacher-timeline">
            {dashboard.activities.length > 0 ? (
              dashboard.activities.map((activity) => (
                <article key={activity.id}>
                  <span />
                  <div>
                    <h3>{activity.label}</h3>
                    <p>{formatTeacherDateTime(activity.updatedAt)}</p>
                  </div>
                </article>
              ))
            ) : (
              <article>
                <span />
                <div>
                  <h3>Aucune modification recente</h3>
                  <p>Les prochaines sauvegardes apparaitront ici.</p>
                </div>
              </article>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
