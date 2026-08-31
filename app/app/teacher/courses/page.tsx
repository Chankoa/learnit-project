import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardCheck,
  Eye,
  GraduationCap,
  PenLine,
  Plus,
  Sparkles,
  Users
} from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import {
  countTeacherLessons,
  formatLessonCount,
  formatModuleCount,
  getPublicationIssues,
  getTeacherStudioCourses
} from "@/lib/teacher-service";
import { formatTeacherDate, teacherCourseStatusLabels } from "@/lib/teacher";
import { getTeacherPublicationHref } from "@/lib/teacher-authoring";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Mes créations",
  description: "Gérez vos créations pédagogiques et reprenez leur préparation.",
  path: "/app/teacher/courses",
  noIndex: true
});

export default async function TeacherCoursesPage() {
  const courses = await getTeacherStudioCourses("/app/teacher/courses");

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Créer", href: "/app/teacher" },
          { label: "Mes créations" }
        ]}
      />

      <AppPageHeader
        eyebrow="Créer"
        title="Mes créations"
        description="Consultez vos parcours, leur statut éditorial, leur structure et leur dernière mise à jour."
        actions={
          <Link className="btn btn-primary" href="/app/teacher/courses/new">
            <Plus size={17} aria-hidden="true" />
            Nouvelle création
          </Link>
        }
      />

      <section className="teacher-editorial-catalogue" aria-label="Catalogue éditorial">
        {courses.length > 0 ? (
          courses.map((course) => {
            const canPublish = getPublicationIssues(course).length === 0;
            const isPublished = course.status === "published";
            const previewHref =
              isPublished && course.slug
                ? `/formations/${course.slug}`
                : `/app/teacher/courses/${course.id}/preview`;
            const publicationHref = getTeacherPublicationHref({
              canPublish,
              courseId: course.id,
              isPublished
            });

            return (
              <article className="teacher-editorial-item" key={course.id}>
                <div className="teacher-editorial-item__identity">
                  <div className="teacher-editorial-item__topline">
                    <span>{course.domain.name}</span>
                    <span className="state-badge" data-state={course.status}>
                      {teacherCourseStatusLabels[course.status]}
                    </span>
                  </div>
                  <h2>{course.title}</h2>
                  {course.description ? <p>{course.description}</p> : null}
                </div>

                <dl className="teacher-editorial-item__meta">
                  <div>
                    <dt>Structure</dt>
                    <dd>{formatModuleCount(course.modules.length)} · {formatLessonCount(countTeacherLessons(course))}</dd>
                  </div>
                  <div>
                    <dt>Apprenants</dt>
                    <dd>{course.enrolledLearnerCount ?? 0} {(course.enrolledLearnerCount ?? 0) > 1 ? "inscrits" : "inscrit"}</dd>
                  </div>
                  <div>
                    <dt>Mise à jour</dt>
                    <dd>{formatTeacherDate(course.updatedAt)}</dd>
                  </div>
                </dl>

                <div className="teacher-editorial-item__actions">
                  <Link className="btn btn-primary" href={`/app/teacher/courses/${course.id}/builder`}>
                    <PenLine size={16} aria-hidden="true" />
                    Modifier
                  </Link>
                  <div className="teacher-editorial-item__quick-actions" aria-label={`Raccourcis pour ${course.title}`}>
                    <Link
                      aria-label={isPublished ? `Voir ${course.title} sur le site` : `Prévisualiser ${course.title}`}
                      className="teacher-icon-button"
                      href={previewHref}
                      rel="noreferrer"
                      target="_blank"
                      title={isPublished ? "Voir sur le site" : "Prévisualiser"}
                    >
                      <Eye size={17} aria-hidden="true" />
                    </Link>
                    <Link
                      aria-label={`Travailler sur ${course.title} avec Forge`}
                      className="teacher-icon-button"
                      href={`/app/teacher/courses/${course.id}/edit?tab=forge`}
                      title="Forge AI"
                    >
                      <Sparkles size={17} aria-hidden="true" />
                    </Link>
                    <Link
                      aria-label={`Gérer les apprenants de ${course.title}`}
                      className="teacher-icon-button"
                      href={`/app/teacher/courses/${course.id}/enrollments`}
                      title="Apprenants"
                    >
                      <Users size={17} aria-hidden="true" />
                    </Link>
                  </div>
                  <Link className="btn btn-secondary teacher-editorial-item__publication" href={publicationHref}>
                    <ClipboardCheck size={16} aria-hidden="true" />
                    {isPublished ? "Gérer la publication" : canPublish ? "Publier" : "Préparer la publication"}
                  </Link>
                </div>
              </article>
            );
          })
        ) : (
          <AppEmptyState
            action={
              <Link className="btn btn-primary" href="/app/teacher/courses/new">
                <Plus size={17} aria-hidden="true" />
                Créer mon premier parcours
              </Link>
            }
            description="Vous n'avez encore aucune création. Un brouillon apparaîtra ici dès que vous aurez commencé un parcours."
            icon={GraduationCap}
            title="Aucune création"
          />
        )}
      </section>
    </div>
  );
}
