import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Eye,
  GraduationCap,
  Layers3,
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
  getTeacherStudioCourses
} from "@/lib/teacher-service";
import { formatTeacherDate, teacherCourseStatusLabels } from "@/lib/teacher";
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

      <section className="teacher-course-management-grid" aria-label="Créations pédagogiques">
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

              <p className="teacher-management-card__summary">
                {formatModuleCount(course.modules.length)} · {formatLessonCount(countTeacherLessons(course))} · {course.enrolledLearnerCount ?? 0} {(course.enrolledLearnerCount ?? 0) > 1 ? "inscrits" : "inscrit"}
                <br />
                Mis à jour le {formatTeacherDate(course.updatedAt)}
              </p>

              <div className="creator-card-actions">
                <Link className="btn btn-primary" href={`/app/teacher/courses/${course.id}/edit`}>
                  {course.status === "draft" ? "Continuer" : "Gérer"}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <details>
                  <summary className="btn btn-secondary">
                    Autres actions
                    <ChevronDown size={16} aria-hidden="true" />
                  </summary>
                  <div className="creator-card-actions__secondary">
                    <Link href={`/app/teacher/courses/${course.id}/builder`}>
                      <Layers3 size={16} aria-hidden="true" />
                      Éditer le parcours
                    </Link>
                    <Link href={`/app/teacher/courses/${course.id}/edit?tab=forge`}>
                      <Sparkles size={16} aria-hidden="true" />
                      Travailler avec Forge
                    </Link>
                    {course.status === "published" && course.slug ? (
                      <Link href={`/formations/${course.slug}`} rel="noreferrer" target="_blank">
                        <Eye size={16} aria-hidden="true" />
                        Voir sur le site
                      </Link>
                    ) : (
                      <Link
                        href={`/app/teacher/courses/${course.id}/preview`}
                        rel="noreferrer"
                        target="_blank"
                      >
                        <Eye size={16} aria-hidden="true" />
                        Prévisualiser
                      </Link>
                    )}
                    <Link href={`/app/teacher/courses/${course.id}/enrollments`}>
                      <Users size={16} aria-hidden="true" />
                      Apprenants
                    </Link>
                  </div>
                </details>
              </div>
            </article>
          ))
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
