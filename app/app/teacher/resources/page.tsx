import type { Metadata } from "next";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";

import { deleteTeacherLibraryResourceAction } from "@/app/app/teacher/courses/actions";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { TeacherConfirmForm } from "@/components/app/TeacherConfirmForm";
import {
  formatTeacherDate,
  teacherResourceStatusLabels,
  teacherResourceTypeLabels
} from "@/lib/teacher";
import { formatFileSize } from "@/lib/storage/content-files";
import { getTeacherResources } from "@/lib/teacher-service";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Ressources enseignant",
  description: "Gérez les ressources pédagogiques de vos formations.",
  path: "/app/teacher/resources",
  noIndex: true
});

type TeacherResourcesPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
    message?: string | string[];
  }>;
};

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TeacherResourcesPage({
  searchParams
}: TeacherResourcesPageProps) {
  const [resources, query] = await Promise.all([getTeacherResources(), searchParams]);
  const error = getSingleParam(query?.error);
  const message = getSingleParam(query?.message);

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Créer", href: "/app/teacher" },
          { label: "Ressources" }
        ]}
      />

      <AppPageHeader
        eyebrow="Ressources"
        title="Bibliothèque enseignant"
        description="Consultez les ressources liées à vos formations et supprimez les supports devenus inutiles."
        actions={
          <Link className="btn btn-primary" href="/app/teacher/courses">
            <Plus size={17} aria-hidden="true" />
            Ajouter depuis une leçon
          </Link>
        }
      />

      {error ? (
        <div className="teacher-form-error" role="alert">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="teacher-toast" role="status">
          {message}
        </div>
      ) : null}

      <section className="teacher-table-card" aria-label="Ressources créées">
        <div className="teacher-table-card__heading">
          <div>
            <span>Ressources créées</span>
            <h2>{resources.length} ressources</h2>
          </div>
          <FileText size={20} aria-hidden="true" />
        </div>

        {resources.length > 0 ? (
          <div className="teacher-table">
            <div className="teacher-table__row teacher-table__row--head">
              <span>Titre</span>
              <span>Type</span>
              <span>Formation liée</span>
              <span>Leçon liée</span>
              <span>Statut</span>
              <span>Date</span>
              <span>Actions</span>
            </div>
            {resources.map((resource) => (
              <article className="teacher-table__row" key={resource.id}>
                <span>
                  {resource.title}
                  {resource.fileName ? (
                    <small>
                      {resource.fileName}
                      {resource.fileSize ? ` · ${formatFileSize(resource.fileSize)}` : ""}
                    </small>
                  ) : null}
                </span>
                <span>{teacherResourceTypeLabels[resource.type]}</span>
                <span>{resource.courseTitle ?? "Formation supprimée"}</span>
                <span>{resource.lessonTitle ?? "Aucune"}</span>
                <span className="state-badge" data-state={resource.status}>
                  {teacherResourceStatusLabels[resource.status]}
                </span>
                <span>{formatTeacherDate(resource.createdAt)}</span>
                <span>
                  <TeacherConfirmForm
                    action={deleteTeacherLibraryResourceAction.bind(null, resource.id)}
                    message="Supprimer cette ressource ? Le fichier associé sera aussi supprimé si nécessaire."
                  >
                    <button className="btn btn-secondary" type="submit">
                      Supprimer
                    </button>
                  </TeacherConfirmForm>
                </span>
              </article>
            ))}
          </div>
        ) : (
          <AppEmptyState
            action={
              <Link className="btn btn-primary" href="/app/teacher/courses">
                <Plus size={17} aria-hidden="true" />
                Ajouter depuis une leçon
              </Link>
            }
            description="Ajoutez un PDF, un template, un exercice ou un lien pour enrichir vos formations."
            icon={FileText}
            title="Aucune ressource"
          />
        )}
      </section>
    </div>
  );
}
