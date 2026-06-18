import type { Metadata } from "next";
import { FileText, Plus } from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { TeacherResourceForm } from "@/components/app/TeacherResourceForm";
import {
  formatTeacherDate,
  getTeacherResourceFormCourses,
  getTeacherResourceFormLessons,
  getTeacherResourceRows,
  teacherResourceStatusLabels,
  teacherResourceTypeLabels
} from "@/lib/teacher";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Ressources enseignant",
  description: "Gérez les ressources créées par l'enseignant en mode démo.",
  path: "/app/teacher/resources",
  noIndex: true
});

export default function TeacherResourcesPage() {
  const resourceRows = getTeacherResourceRows();

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Espace enseignant", href: "/app/teacher" },
          { label: "Ressources" }
        ]}
      />

      <AppPageHeader
        eyebrow="Ressources"
        title="Bibliothèque enseignant"
        description="Consultez les ressources créées, leurs types, leurs formations liées, leurs leçons et leurs statuts."
        actions={
          <a className="btn btn-primary" href="#add-resource">
            <Plus size={17} aria-hidden="true" />
            Ajouter une ressource
          </a>
        }
      />

      <section id="add-resource">
        <TeacherResourceForm
          courses={getTeacherResourceFormCourses()}
          lessons={getTeacherResourceFormLessons()}
        />
      </section>

      <section className="teacher-table-card" aria-label="Ressources créées">
        <div className="teacher-table-card__heading">
          <div>
            <span>Ressources créées</span>
            <h2>{resourceRows.length} ressources</h2>
          </div>
          <FileText size={20} aria-hidden="true" />
        </div>

        <div className="teacher-table">
          <div className="teacher-table__row teacher-table__row--head">
            <span>Titre</span>
            <span>Type</span>
            <span>Formation liée</span>
            <span>Leçon liée</span>
            <span>Statut</span>
            <span>Date</span>
          </div>
          {resourceRows.map(({ resource, course, lesson }) => (
            <article className="teacher-table__row" key={resource.id}>
              <span>{resource.title}</span>
              <span>{teacherResourceTypeLabels[resource.type]}</span>
              <span>{course?.title ?? "Formation supprimée"}</span>
              <span>{lesson?.title ?? "Aucune"}</span>
              <span className="state-badge" data-state={resource.status}>
                {teacherResourceStatusLabels[resource.status]}
              </span>
              <span>{formatTeacherDate(resource.createdAt)}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
