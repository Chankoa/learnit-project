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
import { countTeacherLessons, getTeacherStudioCourses } from "@/lib/teacher-service";
import { formatTeacherDate, teacherCourseStatusLabels } from "@/lib/teacher";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Mes formations enseignant",
  description: "Gerez les formations creees par l'enseignant connecte.",
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
        title="Formations creees"
        description="Consultez vos parcours, leurs statuts, leurs contenus et leur derniere mise a jour."
        actions={
          <Link className="btn btn-primary" href="/app/teacher/courses/new">
            <Plus size={17} aria-hidden="true" />
            Creer une formation
          </Link>
        }
      />

      <section className="teacher-course-management-grid" aria-label="Formations creees">
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
                  <dd>{course.modules.length}</dd>
                </div>
                <div>
                  <dt>Lecons</dt>
                  <dd>{countTeacherLessons(course)}</dd>
                </div>
                <div>
                  <dt>Inscrits</dt>
                  <dd>{course.enrolledLearnerCount ?? "Non expose"}</dd>
                </div>
                <div>
                  <dt>Mise a jour</dt>
                  <dd>{formatTeacherDate(course.updatedAt)}</dd>
                </div>
              </dl>

              <div className="teacher-management-card__actions">
                <Link href={`/app/teacher/courses/${course.id}/edit`}>
                  <Pencil size={16} aria-hidden="true" />
                  Modifier
                </Link>
                <Link href={`/app/teacher/courses/${course.id}/builder`}>
                  <Layers3 size={16} aria-hidden="true" />
                  Builder
                </Link>
                {course.status === "published" && course.slug ? (
                  <Link href={`/formations/${course.slug}`}>
                    <Eye size={16} aria-hidden="true" />
                    Voir
                  </Link>
                ) : (
                  <span aria-disabled="true">
                    <Eye size={16} aria-hidden="true" />
                    Apercu apres publication
                  </span>
                )}
              </div>

              <div className="teacher-management-card__footer">
                <span>
                  <Layers3 size={15} aria-hidden="true" />
                  {course.modules.length} modules
                </span>
                <span>
                  <BookOpenText size={15} aria-hidden="true" />
                  {countTeacherLessons(course)} lecons
                </span>
              </div>
            </article>
          ))
        ) : (
          <AppEmptyState
            action={
              <Link className="btn btn-primary" href="/app/teacher/courses/new">
                <Plus size={17} aria-hidden="true" />
                Creer une formation
              </Link>
            }
            description="Vous n'avez encore cree aucune formation. Un brouillon apparaitra ici des sa creation."
            icon={GraduationCap}
            title="Aucune formation"
          />
        )}
      </section>
    </div>
  );
}
