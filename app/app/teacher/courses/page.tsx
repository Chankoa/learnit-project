import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpenText,
  Eye,
  GraduationCap,
  Layers3,
  Pencil,
  Plus
} from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import {
  countTeacherLessons,
  formatLessonCount,
  formatModuleCount,
  getTeacherStudioCourses
} from "@/lib/teacher-service";
import { formatTeacherDate, teacherCourseStatusLabels } from "@/lib/teacher";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Mes formations enseignant",
  description: "Gérez les formations créées par l'enseignant connecté.",
  path: "/app/teacher/courses",
  noIndex: true
});

export default async function TeacherCoursesPage() {
  const courses = await getTeacherStudioCourses("/app/teacher/courses");

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Espace enseignant", href: "/app/teacher" },
          { label: "Mes formations" }
        ]}
      />

      <AppPageHeader
        eyebrow="Mes formations"
        title="Formations créées"
        description="Consultez vos parcours, leurs statuts, leurs contenus et leur dernière mise à jour."
        actions={
          <Link className="btn btn-primary" href="/app/teacher/courses/new">
            <Plus size={17} aria-hidden="true" />
            Créer une formation
          </Link>
        }
      />

      <section className="teacher-course-management-grid" aria-label="Formations créées">
        {courses.length > 0 ? (
          courses.map((course) => (
            <article className="teacher-management-card" key={course.id}>
              <div className="teacher-management-card__heading">
                <div>
                  <span>{course.domain.name}</span>
                  <h2>{course.title}</h2>
                </div>
                <span className="state-badge" data-state={course.status}>
                  {teacherCourseStatusLabels[course.status]}
                </span>
              </div>

              <dl className="teacher-management-card__meta">
                <div>
                  <dt>Domaine</dt>
                  <dd>{course.domain.name}</dd>
                </div>
                <div>
                  <dt>Modules</dt>
                  <dd>{formatModuleCount(course.modules.length)}</dd>
                </div>
                <div>
                  <dt>Leçons</dt>
                  <dd>{formatLessonCount(countTeacherLessons(course))}</dd>
                </div>
                <div>
                  <dt>Inscrits</dt>
                  <dd>{course.enrolledLearnerCount ?? "Non exposé"}</dd>
                </div>
                <div>
                  <dt>Mise à jour</dt>
                  <dd>{formatTeacherDate(course.updatedAt)}</dd>
                </div>
              </dl>

              <div className="teacher-management-card__actions">
                <Link href={`/app/teacher/courses/${course.id}/edit`}>
                  <Pencil size={16} aria-hidden="true" />
                  Modifier les infos
                </Link>
                <Link href={`/app/teacher/courses/${course.id}/builder`}>
                  <Layers3 size={16} aria-hidden="true" />
                  Éditer le parcours
                </Link>
                {course.status === "published" && course.slug ? (
                  <Link href={`/formations/${course.slug}`}>
                    <Eye size={16} aria-hidden="true" />
                    Voir
                  </Link>
                ) : (
                  <span aria-disabled="true">
                    <Eye size={16} aria-hidden="true" />
                    Aperçu après publication
                  </span>
                )}
              </div>

              <div className="teacher-management-card__footer">
                <span>
                  <Layers3 size={15} aria-hidden="true" />
                  {formatModuleCount(course.modules.length)}
                </span>
                <span>
                  <BookOpenText size={15} aria-hidden="true" />
                  {formatLessonCount(countTeacherLessons(course))}
                </span>
              </div>
            </article>
          ))
        ) : (
          <AppEmptyState
            action={
              <Link className="btn btn-primary" href="/app/teacher/courses/new">
                <Plus size={17} aria-hidden="true" />
                Créer une formation
              </Link>
            }
            description="Vous n'avez encore créé aucune formation. Un brouillon apparaîtra ici dès sa création."
            icon={GraduationCap}
            title="Aucune formation"
          />
        )}
      </section>
    </div>
  );
}
