import type { Metadata } from "next";
import { BookOpenCheck, Users } from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { formatTeacherDateTime } from "@/lib/teacher";
import { getTeacherStudentTracking } from "@/lib/teacher-service";
import type { TeacherEnrollmentStatus } from "@/lib/repositories/teacherStudentRepository";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Apprenants enseignant",
  description: "Consultez les apprenants inscrits à vos formations et leur progression.",
  path: "/app/teacher/students",
  noIndex: true
});

const statusLabels: Record<TeacherEnrollmentStatus, string> = {
  "not-started": "À commencer",
  "in-progress": "En cours",
  completed: "Terminé"
};

function formatLearningTime(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours} h ${remainingMinutes} min` : `${hours} h`;
}

export default async function TeacherStudentsPage() {
  const { rows, metrics } = await getTeacherStudentTracking();

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Créer", href: "/app/teacher" },
          { label: "Apprenants" }
        ]}
      />

      <AppPageHeader
        eyebrow="Apprenants"
        title="Suivi des inscrits"
        description="Suivez les apprenants inscrits à vos formations, leur progression et leur dernière activité."
      />

      <section className="learning-metrics teacher-metrics" aria-label="Synthèse apprenants">
        <article>
          <span className="learning-metric-icon learning-metric-icon--cyan">
            <Users size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Apprenants</small>
            <strong>{metrics.learnerCount}</strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--green">
            <BookOpenCheck size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Inscriptions en cours</small>
            <strong>{metrics.inProgressCount}</strong>
          </div>
        </article>
      </section>

      <section className="teacher-table-card" aria-label="Liste des apprenants">
        <div className="teacher-table-card__heading">
          <div>
            <span>Inscrits</span>
            <h2>Progression par apprenant</h2>
          </div>
          <Users size={20} aria-hidden="true" />
        </div>

        {rows.length > 0 ? (
          <div className="teacher-table teacher-table--students">
            <div className="teacher-table__row teacher-table__row--head">
              <span>Nom</span>
              <span>Email</span>
              <span>Formation suivie</span>
              <span>Progression</span>
              <span>Dernière activité</span>
              <span>Statut</span>
            </div>
            {rows.map((row) => (
              <article className="teacher-table__row" key={row.enrollmentId}>
                <span data-label="Nom">{row.learner.name}</span>
                <span data-label="Email">{row.learner.email}</span>
                <span data-label="Formation suivie">
                  <strong>{row.course.title}</strong>
                  {row.currentLesson ? <small>Étape actuelle : {row.currentLesson.title}</small> : null}
                </span>
                <span data-label="Progression">
                  <strong>{row.progressPercentage}%</strong>
                  <small>{row.completedLessons}/{row.totalLessons} leçons · {formatLearningTime(row.learningTimeMinutes)}</small>
                  <span className="learning-progress">
                    <span style={{ width: `${row.progressPercentage}%` }} />
                  </span>
                </span>
                <span data-label="Dernière activité">{formatTeacherDateTime(row.lastActivityAt)}</span>
                <span data-label="Statut">
                  <span className="state-badge" data-state={row.status}>
                    {statusLabels[row.status]}
                  </span>
                </span>
              </article>
            ))}
          </div>
        ) : (
          <AppEmptyState
            description="Les apprenants inscrits aux formations de cet enseignant apparaîtront ici."
            icon={Users}
            title="Aucun apprenant inscrit"
          />
        )}
      </section>
    </div>
  );
}
