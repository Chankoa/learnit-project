import type { Metadata } from "next";
import Link from "next/link";
import {
  Eye,
  GraduationCap,
  Layers3,
  Pencil,
  Plus,
  Sparkles
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
          <>
            <Link className="btn btn-primary" href="/app/teacher/courses/new">
              <Plus size={17} aria-hidden="true" />
              Créer une formation
            </Link>
            <Link className="btn btn-secondary" href="/app/teacher/courses/forge">
              <Sparkles size={17} aria-hidden="true" />
              Créer avec Forge AI
            </Link>
          </>
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
                  <p>{course.description}</p>
                </div>
                <span className="state-badge" data-state={course.status}>
                  {teacherCourseStatusLabels[course.status]}
                </span>
              </div>

              <dl className="teacher-management-card__meta">
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
                  <dd>{course.enrolledLearnerCount ?? 0}</dd>
                </div>
                <div>
                  <dt>Mise à jour</dt>
                  <dd>{formatTeacherDate(course.updatedAt)}</dd>
                </div>
              </dl>

              <div className="teacher-management-card__actions">
                <Link href={`/app/teacher/courses/${course.id}/builder`}>
                  <Layers3 size={16} aria-hidden="true" />
                  Éditer le parcours
                </Link>
                <Link href={`/app/teacher/courses/${course.id}/edit#forge-ai`}>
                  <Sparkles size={16} aria-hidden="true" />
                  Modifier le parcours avec Forge AI
                </Link>
              </div>

              <div className="teacher-management-card__actions teacher-management-card__actions--secondary">
                <Link href={`/app/teacher/courses/${course.id}/edit`}>
                  <Pencil size={16} aria-hidden="true" />
                  Modifier les infos
                </Link>
                {course.status === "published" && course.slug ? (
                  <Link href={`/formations/${course.slug}`} target="_blank">
                    <Eye size={16} aria-hidden="true" />
                    Voir sur le site
                  </Link>
                ) : (
                  <span aria-disabled="true">
                    <Eye size={16} aria-hidden="true" />
                    Prévisualisation de brouillon dans l'éditeur
                  </span>
                )}
              </div>
            </article>
          ))
        ) : (
          <AppEmptyState
            action={
              <>
                <Link className="btn btn-secondary" href="/app/teacher/courses/forge">
                  <Sparkles size={17} aria-hidden="true" />
                  Créer avec Forge AI
                </Link>
                <Link className="btn btn-primary" href="/app/teacher/courses/new">
                  <Plus size={17} aria-hidden="true" />
                  Créer une formation
                </Link>
              </>
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
