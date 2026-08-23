import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  GraduationCap,
  History,
  Pencil,
  Sparkles
} from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { ForgeHomeIntent } from "@/components/app/ForgeHomeIntent";
import { getCurrentProfile } from "@/lib/auth/server";
import { formatTeacherDateTime, teacherCourseStatusLabels } from "@/lib/teacher";
import { getTeacherStudioDashboard } from "@/lib/teacher-service";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Créer",
  description: "Retrouvez et développez vos créations pédagogiques dans Forge.",
  path: "/app/teacher",
  noIndex: true
});

function getDisplayName(name?: string) {
  const normalized = name?.replace(/\s+/g, " ").trim();

  if (!normalized || normalized.includes("@")) {
    return undefined;
  }

  return normalized
    .replace(/\s+(teacher|enseignante?|formatrice|formateur|créatrice|créateur)$/iu, "")
    .trim() || undefined;
}

export default async function TeacherAppPage() {
  const [dashboard, profile] = await Promise.all([
    getTeacherStudioDashboard("/app/teacher"),
    getCurrentProfile()
  ]);
  const displayName = getDisplayName(profile?.name);

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Accès plateforme", href: "/app" },
          { label: "Créer" }
        ]}
      />

      <section className="forge-home-hero" aria-labelledby="forge-home-title">
        <div className="forge-home-hero__copy">
          <span>{displayName ? `Bonjour ${displayName}` : "Bonjour"}</span>
          <p className="forge-home-hero__eyebrow">Créer</p>
          <h1 id="forge-home-title">Qu'allez-vous construire aujourd'hui&nbsp;?</h1>
          <p className="forge-home-hero__description">
            Décrivez une idée, un objectif ou un besoin pédagogique.
          </p>
        </div>
        <ForgeHomeIntent />
      </section>

      <section className="learning-panel forge-home-recent">
        <div className="learning-panel__heading">
          <div>
            <span>Créations récentes</span>
            <h2>Reprendre votre travail</h2>
          </div>
          <Link className="text-link" href="/app/teacher/courses">
            Mes créations
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="teacher-list">
          {dashboard.courses.length > 0 ? (
            dashboard.courses.slice(0, 4).map((course) => (
              <article className="teacher-row teacher-row--course" key={course.id}>
                <div>
                  <span>{course.domain.name}</span>
                  <h3>
                    <Link href={`/app/teacher/courses/${course.id}/edit`}>{course.title}</Link>
                  </h3>
                  <p>{formatTeacherDateTime(course.updatedAt)}</p>
                </div>
                <div className="teacher-row__actions">
                  <span className="state-badge" data-state={course.status}>
                    {teacherCourseStatusLabels[course.status]}
                  </span>
                  <Link className="text-link" href={`/app/teacher/courses/${course.id}/edit`}>
                    {course.status === "draft" ? "Continuer" : "Gérer"}
                    <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <AppEmptyState
              action={
                <Link className="btn btn-primary" href="/app/teacher/courses/new">
                  Créer mon premier parcours
                </Link>
              }
              description="Vous n'avez encore aucune création. Décrivez une intention avec Forge ou commencez manuellement."
              icon={GraduationCap}
              title="Aucune création"
            />
          )}
        </div>
      </section>

      <div className="dashboard-primary-grid forge-home-secondary">
        <section className="learning-metrics teacher-metrics forge-home-metrics" aria-label="Indicateurs de création">
          <article>
            <span className="learning-metric-icon learning-metric-icon--purple">
              <GraduationCap size={19} aria-hidden="true" />
            </span>
            <div>
              <small>Mes créations</small>
              <strong>{dashboard.metrics.courseCount}</strong>
            </div>
          </article>
          <article>
            <span className="learning-metric-icon learning-metric-icon--green">
              <BookOpenText size={19} aria-hidden="true" />
            </span>
            <div>
              <small>Publiées / brouillons</small>
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
              <small>Dernière modification</small>
              <strong>
                {dashboard.metrics.latestUpdatedAt
                  ? formatTeacherDateTime(dashboard.metrics.latestUpdatedAt)
                  : "-"}
              </strong>
            </div>
          </article>
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
                  <h3>Aucune modification récente</h3>
                  <p>Les prochaines sauvegardes apparaîtront ici.</p>
                </div>
              </article>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
