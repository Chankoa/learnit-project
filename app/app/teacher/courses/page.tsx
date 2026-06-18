import type { Metadata } from "next";
import Link from "next/link";
import {
  Copy,
  Eye,
  Layers3,
  Pencil,
  Plus,
  Users
} from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import {
  countTeacherLessons,
  formatTeacherDate,
  getTeacherCourses,
  teacherCourseStatusLabels
} from "@/lib/teacher";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Mes formations enseignant",
  description: "Gérez les formations créées par l'enseignant en mode démo.",
  path: "/app/teacher/courses",
  noIndex: true
});

export default function TeacherCoursesPage() {
  const courses = getTeacherCourses();

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
        description="Consultez les parcours créés, leurs statuts, leurs contenus et les apprenants inscrits."
        actions={
          <Link className="btn btn-primary" href="/app/teacher/courses/new">
            <Plus size={17} aria-hidden="true" />
            Créer une formation
          </Link>
        }
      />

      <section className="teacher-course-management-grid" aria-label="Formations créées">
        {courses.map((course) => (
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
                <dt>Leçons</dt>
                <dd>{countTeacherLessons(course)}</dd>
              </div>
              <div>
                <dt>Apprenants</dt>
                <dd>{course.enrolledLearnerCount}</dd>
              </div>
              <div>
                <dt>Mise à jour</dt>
                <dd>{formatTeacherDate(course.updatedAt)}</dd>
              </div>
            </dl>

            <div className="teacher-management-card__actions">
              <Link href={`/app/teacher/courses/${course.id}/edit`}>
                <Pencil size={16} aria-hidden="true" />
                Modifier
              </Link>
              <Link href={`/app/teacher/courses/${course.id}/builder`}>
                <Eye size={16} aria-hidden="true" />
                Prévisualiser
              </Link>
              <Link href={`/app/teacher/courses/new?duplicate=${course.id}`}>
                <Copy size={16} aria-hidden="true" />
                Dupliquer
              </Link>
            </div>

            <div className="teacher-management-card__footer">
              <span>
                <Layers3 size={15} aria-hidden="true" />
                {course.modules.length} modules
              </span>
              <span>
                <Users size={15} aria-hidden="true" />
                {course.enrolledLearnerCount} inscrits
              </span>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
