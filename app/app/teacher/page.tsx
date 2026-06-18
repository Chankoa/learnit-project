import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  BookPlus,
  FileText,
  GraduationCap,
  History,
  Users
} from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import {
  formatTeacherDateTime,
  getTeacherDashboardData,
  teacherCourseStatusLabels
} from "@/lib/teacher";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Espace enseignant",
  description: "Gérez vos formations, modules, leçons, ressources et apprenants LearnIt.",
  path: "/app/teacher",
  noIndex: true
});

export default function TeacherAppPage() {
  const dashboard = getTeacherDashboardData();

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Accès plateforme", href: "/app" },
          { label: "Espace enseignant" }
        ]}
      />

      <AppPageHeader
        eyebrow="Tableau de bord enseignant"
        title={`Bonjour ${dashboard.teacher.firstName}`}
        description="Pilotez vos formations, surveillez les brouillons, suivez les ressources publiées et gardez un œil sur les apprenants inscrits."
        actions={
          <Link className="btn btn-primary" href="/app/teacher/courses/new">
            <BookPlus size={17} aria-hidden="true" />
            Créer une formation
          </Link>
        }
      />

      <section className="learning-metrics teacher-metrics" aria-label="Indicateurs enseignant">
        <article>
          <span className="learning-metric-icon learning-metric-icon--purple">
            <GraduationCap size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Formations créées</small>
            <strong>{dashboard.metrics.createdCourseCount}</strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--green">
            <BookOpenText size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Publiées / brouillons</small>
            <strong>
              {dashboard.metrics.publishedCourseCount}/{dashboard.metrics.draftCourseCount}
            </strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--cyan">
            <Users size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Apprenants fictifs</small>
            <strong>{dashboard.metrics.learnerCount}</strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--amber">
            <FileText size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Ressources publiées</small>
            <strong>{dashboard.metrics.publishedResourceCount}</strong>
          </div>
        </article>
      </section>

      <div className="dashboard-primary-grid">
        <section className="learning-panel">
          <div className="learning-panel__heading">
            <div>
              <span>Formations récentes</span>
              <h2>Dernières mises à jour</h2>
            </div>
            <Link className="text-link" href="/app/teacher/courses">
              Mes formations
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="teacher-list">
            {dashboard.courses.slice(0, 4).map((course) => (
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
            ))}
          </div>
        </section>

        <section className="learning-panel">
          <div className="learning-panel__heading">
            <div>
              <span>Historique</span>
              <h2>Dernières modifications</h2>
            </div>
            <History size={20} aria-hidden="true" />
          </div>

          <div className="teacher-timeline">
            {dashboard.activities.map((activity) => (
              <article key={activity.id}>
                <span />
                <div>
                  <h3>{activity.label}</h3>
                  <p>{formatTeacherDateTime(activity.updatedAt)}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
