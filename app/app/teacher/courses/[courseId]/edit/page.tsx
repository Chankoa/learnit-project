import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Layers3, Send } from "lucide-react";

import {
  publishTeacherCourseAction,
  updateTeacherCourseAction
} from "@/app/app/teacher/courses/actions";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { TeacherCourseForm } from "@/components/app/TeacherCourseForm";
import { TeacherSubmitButton } from "@/components/app/TeacherSubmitButton";
import {
  countTeacherLessons,
  getPublicationIssues,
  getTeacherCourseFormDefaults,
  getTeacherStudioCourse,
  getTeacherStudioDomains
} from "@/lib/teacher-service";
import { createPageMetadata } from "@/lib/seo";

type EditTeacherCoursePageProps = {
  params: Promise<{
    courseId: string;
  }>;
  searchParams?: Promise<{
    error?: string | string[];
    message?: string | string[];
  }>;
};

export const dynamic = "force-dynamic";

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params
}: EditTeacherCoursePageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getTeacherStudioCourse(courseId, `/app/teacher/courses/${courseId}/edit`);

  return course
    ? createPageMetadata({
        title: `Modifier - ${course.title}`,
        description: `Modifier la formation ${course.title}.`,
        path: `/app/teacher/courses/${course.id}/edit`,
        noIndex: true
      })
    : {
        title: "Formation introuvable"
      };
}

export default async function EditTeacherCoursePage({
  params,
  searchParams
}: EditTeacherCoursePageProps) {
  const { courseId } = await params;
  const [course, domains, query] = await Promise.all([
    getTeacherStudioCourse(courseId, `/app/teacher/courses/${courseId}/edit`),
    getTeacherStudioDomains(),
    searchParams
  ]);

  if (!course) {
    notFound();
  }

  const publicationIssues = getPublicationIssues(course);
  const canPublish = publicationIssues.length === 0;

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Espace enseignant", href: "/app/teacher" },
          { label: "Mes formations", href: "/app/teacher/courses" },
          { label: course.title }
        ]}
      />

      <AppPageHeader
        eyebrow="Edition"
        title="Modifier la formation"
        description="Mettez a jour les informations generales, organisez la structure, puis publiez lorsque le parcours est pret."
        actions={
          <Link className="btn btn-secondary" href={`/app/teacher/courses/${course.id}/builder`}>
            <Layers3 size={17} aria-hidden="true" />
            Ouvrir le builder
          </Link>
        }
      />

      <TeacherCourseForm
        action={updateTeacherCourseAction.bind(null, course.id)}
        course={course}
        domains={domains}
        error={getSingleParam(query?.error)}
        initialValues={getTeacherCourseFormDefaults(course)}
        message={getSingleParam(query?.message)}
        mode="edit"
      />

      <section className="teacher-form-section">
        <div>
          <span>Structure</span>
          <h2>Modules et lecons</h2>
        </div>
        <div className="teacher-form-grid teacher-form-grid--compact">
          <div className="teacher-field">
            <span>Modules</span>
            <strong>{course.modules.length}</strong>
          </div>
          <div className="teacher-field">
            <span>Lecons</span>
            <strong>{countTeacherLessons(course)}</strong>
          </div>
          <div className="teacher-form-actions">
            <Link className="btn btn-secondary" href={`/app/teacher/courses/${course.id}/builder`}>
              <Layers3 size={17} aria-hidden="true" />
              Gerer la structure
            </Link>
          </div>
        </div>
      </section>

      <section className="teacher-form-section">
        <div>
          <span>Publication</span>
          <h2>Rendre la formation accessible</h2>
        </div>

        {publicationIssues.length > 0 ? (
          <div className="teacher-form-error" role="status">
            {publicationIssues[0]}
          </div>
        ) : null}

        <div className="teacher-form-grid teacher-form-grid--compact">
          <div className="teacher-field teacher-field--wide">
            <span>Etat</span>
            <strong>
              {course.status === "published"
                ? "La formation est publiee dans le catalogue."
                : "La formation est en brouillon et invisible du catalogue."}
            </strong>
          </div>
          <div className="teacher-form-actions">
            {course.status === "published" && course.slug ? (
              <Link className="btn btn-secondary" href={`/formations/${course.slug}`}>
                <Eye size={17} aria-hidden="true" />
                Voir dans le catalogue
              </Link>
            ) : null}
            <form action={publishTeacherCourseAction.bind(null, course.id)}>
              <TeacherSubmitButton
                className="btn btn-primary"
                pendingLabel="Publication..."
              >
                <Send size={17} aria-hidden="true" />
                Publier la formation
              </TeacherSubmitButton>
            </form>
          </div>
        </div>

        {!canPublish ? (
          <p className="teacher-field-note">
            La publication restera bloquee tant que les criteres minimum ne sont pas respectes.
          </p>
        ) : null}

        <p className="teacher-field-note">
          Depublication non destructive reportee : elle doit etre cadree avec le comportement des apprenants deja inscrits.
        </p>
      </section>
    </div>
  );
}
