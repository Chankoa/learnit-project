import type { Metadata } from "next";
import { Mail, Users } from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import {
  formatTeacherDateTime,
  getTeacherStudentRows,
  teacherStudentStatusLabels
} from "@/lib/teacher";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Apprenants enseignant",
  description: "Consultez les apprenants fictifs inscrits aux formations de l'enseignant.",
  path: "/app/teacher/students",
  noIndex: true
});

export default function TeacherStudentsPage() {
  const studentRows = getTeacherStudentRows();

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Espace enseignant", href: "/app/teacher" },
          { label: "Apprenants" }
        ]}
      />

      <AppPageHeader
        eyebrow="Apprenants"
        title="Suivi des inscrits"
        description="Liste fictive des apprenants inscrits aux formations de l'enseignant, avec progression et dernière activité."
      />

      <section className="learning-metrics teacher-metrics" aria-label="Synthèse apprenants">
        <article>
          <span className="learning-metric-icon learning-metric-icon--cyan">
            <Users size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Apprenants</small>
            <strong>{studentRows.length}</strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--green">
            <Mail size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Actifs</small>
            <strong>
              {studentRows.filter(({ student }) => student.status === "active").length}
            </strong>
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

        <div className="teacher-table teacher-table--students">
          <div className="teacher-table__row teacher-table__row--head">
            <span>Nom</span>
            <span>Email fictif</span>
            <span>Formation suivie</span>
            <span>Progression</span>
            <span>Dernière activité</span>
            <span>Statut</span>
          </div>
          {studentRows.map(({ student, course }) => (
            <article className="teacher-table__row" key={student.id}>
              <span>{student.name}</span>
              <span>{student.email}</span>
              <span>{course?.title ?? "Formation supprimée"}</span>
              <span>
                <strong>{student.progressPercentage}%</strong>
                <span className="learning-progress">
                  <span style={{ width: `${student.progressPercentage}%` }} />
                </span>
              </span>
              <span>{formatTeacherDateTime(student.lastActivityAt)}</span>
              <span className="state-badge" data-state={student.status}>
                {teacherStudentStatusLabels[student.status]}
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
