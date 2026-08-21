import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers3 } from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { countTeacherLessons, formatLessonCount, formatModuleCount, getTeacherStudioCourse } from "@/lib/teacher-service";
import { createPageMetadata } from "@/lib/seo";

type TeacherCoursePreviewPageProps = {
  params: Promise<{ courseId: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: TeacherCoursePreviewPageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getTeacherStudioCourse(courseId, `/app/teacher/courses/${courseId}/preview`);

  return course
    ? createPageMetadata({
        title: `Prévisualisation - ${course.title}`,
        description: `Prévisualisation authentifiée de ${course.title}.`,
        path: `/app/teacher/courses/${course.id}/preview`,
        noIndex: true
      })
    : { title: "Formation introuvable" };
}

export default async function TeacherCoursePreviewPage({ params }: TeacherCoursePreviewPageProps) {
  const { courseId } = await params;
  const course = await getTeacherStudioCourse(courseId, `/app/teacher/courses/${courseId}/preview`);

  if (!course) {
    notFound();
  }

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Espace enseignant", href: "/app/teacher" },
          { label: "Mes formations", href: "/app/teacher/courses" },
          { label: course.title, href: `/app/teacher/courses/${course.id}/edit` },
          { label: "Prévisualisation" }
        ]}
      />
      <section className="teacher-course-preview">
        <span className="eyebrow">Prévisualisation authentifiée</span>
        <h1>{course.title}</h1>
        <p>{course.subtitle || course.description}</p>
        <div className="teacher-course-preview__meta">
          <span>{course.domain.name}</span>
          <span>{formatModuleCount(course.modules.length)}</span>
          <span>{formatLessonCount(countTeacherLessons(course))}</span>
        </div>
        <div className="teacher-course-preview__actions">
          <Link className="btn btn-secondary" href={`/app/teacher/courses/${course.id}/edit`}>
            <ArrowLeft size={17} aria-hidden="true" />
            Retour à l'édition
          </Link>
          <Link className="btn btn-primary" href={`/app/teacher/courses/${course.id}/builder`}>
            <Layers3 size={17} aria-hidden="true" />
            Éditer le parcours
          </Link>
        </div>
      </section>
      <section className="teacher-form-section teacher-course-preview__curriculum">
        <div>
          <span>Parcours</span>
          <h2>Programme de la formation</h2>
        </div>
        <ol className="teacher-course-structure-summary__list">
          {course.modules.map((module) => (
            <li key={module.id}>
              <strong>{module.title}</strong>
              <span>{formatLessonCount(module.lessons.length)}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}