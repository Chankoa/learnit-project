"use client";

import { Archive, Eye, Send, XCircle } from "lucide-react";
import { useState } from "react";

import { AppEmptyState } from "@/components/app/AppEmptyState";
import { useToast } from "@/components/app/ToastProvider";
import {
  adminCourseStatusLabels,
  adminPublicationLabels,
  formatAdminDateTime
} from "@/lib/admin";
import type { AdminCourse } from "@/types/admin";

export type AdminCourseRow = {
  course: AdminCourse;
  domainName: string;
  teacherName: string;
};

type AdminCoursesTableProps = {
  rows: AdminCourseRow[];
};

export function AdminCoursesTable({ rows }: AdminCoursesTableProps) {
  const [courseRows, setCourseRows] = useState(rows);
  const [toast, setToast] = useState<string>();
  const { showToast } = useToast();

  function notify(message: string, description = "Action appliquée localement en mode démo.") {
    setToast(message);
    showToast({
      description,
      title: message,
      variant: "success"
    });
  }

  function updateCourse(courseId: string, patch: Partial<AdminCourse>, message: string) {
    setCourseRows((currentRows) =>
      currentRows.map((row) =>
        row.course.id === courseId ? { ...row, course: { ...row.course, ...patch } } : row
      )
    );
    notify(message);
  }

  return (
    <section className="admin-table-card" aria-label="Toutes les formations">
      {toast ? (
        <div className="teacher-toast" role="status">
          {toast}
        </div>
      ) : null}

      {courseRows.length > 0 ? (
        <div className="admin-table admin-table--courses">
          <div className="admin-table__row admin-table__row--head">
            <span>Titre</span>
            <span>Domaine</span>
            <span>Enseignant</span>
            <span>Statut</span>
            <span>Publication</span>
            <span>Inscrits</span>
            <span>Mise à jour</span>
            <span>Actions</span>
          </div>

          {courseRows.map(({ course, domainName, teacherName }) => (
            <article className="admin-table__row" key={course.id}>
              <span>{course.title}</span>
              <span>{domainName}</span>
              <span>{teacherName}</span>
              <span className="state-badge" data-state={course.status}>
                {adminCourseStatusLabels[course.status]}
              </span>
              <span className="state-badge" data-state={course.publication}>
                {adminPublicationLabels[course.publication]}
              </span>
              <span>{course.learnerCount}</span>
              <span>{formatAdminDateTime(course.updatedAt)}</span>
              <span className="admin-row-actions">
                <button
                  type="button"
                  onClick={() =>
                    notify(
                      `Prévisualisation fictive : ${course.title}`,
                      "La prévisualisation réelle sera branchée plus tard."
                    )
                  }
                >
                  <Eye size={15} aria-hidden="true" />
                  Prévisualiser
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateCourse(
                      course.id,
                      { status: "published", publication: "published" },
                      "Formation publiée en mode démo."
                    )
                  }
                >
                  <Send size={15} aria-hidden="true" />
                  Publier
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateCourse(
                      course.id,
                      { status: "draft", publication: "unpublished" },
                      "Formation dépubliée en mode démo."
                    )
                  }
                >
                  <XCircle size={15} aria-hidden="true" />
                  Dépublier
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateCourse(
                      course.id,
                      { status: "archived", publication: "unpublished" },
                      "Formation archivée en mode démo."
                    )
                  }
                >
                  <Archive size={15} aria-hidden="true" />
                  Archiver
                </button>
              </span>
            </article>
          ))}
        </div>
      ) : (
        <AppEmptyState
          description="Aucune formation ne correspond aux filtres sélectionnés."
          icon={XCircle}
          title="Aucun résultat"
        />
      )}
    </section>
  );
}
