import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye, Layers3, Send, Sparkles } from "lucide-react";

import {
  publishTeacherCourseAction,
  updateTeacherCourseAction
} from "@/app/app/teacher/courses/actions";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { ForgeCourseContextPanel } from "@/components/app/ForgeCourseContextPanel";
import { TeacherCourseForm } from "@/components/app/TeacherCourseForm";
import { TeacherSubmitButton } from "@/components/app/TeacherSubmitButton";
import { getForgeCourseSources } from "@/lib/forge-ai/service";
import {
  countTeacherLessons,
  formatLessonCount,
  formatModuleCount,
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
  const [course, domains, sources, query] = await Promise.all([
    getTeacherStudioCourse(courseId, `/app/teacher/courses/${courseId}/edit`),
    getTeacherStudioDomains(),
    getForgeCourseSources(courseId, `/app/teacher/courses/${courseId}/edit`),
    searchParams
  ]);

  if (!course) {
    notFound();
  }

  const publicationIssues = getPublicationIssues(course);
  const isPublished = course.status === "published";
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
        eyebrow="Édition"
        title="Modifier la formation"
        description="Mettez à jour les informations générales, organisez la structure, puis publiez lorsque le parcours est prêt."
        actions={
          <>
            <Link className="btn btn-secondary" href="#forge-ai">
              <Sparkles size={17} aria-hidden="true" />
              Travailler avec Forge AI
            </Link>
            <Link className="btn btn-secondary" href={`/app/teacher/courses/${course.id}/builder`}>
              <Layers3 size={17} aria-hidden="true" />
              Éditer le parcours
            </Link>
          </>
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
          <h2>Modules et leçons</h2>
        </div>
        <div className="teacher-form-grid teacher-form-grid--compact">
          <div className="teacher-field">
            <span>Modules</span>
            <strong>{formatModuleCount(course.modules.length)}</strong>
          </div>
          <div className="teacher-field">
            <span>Leçons</span>
            <strong>{formatLessonCount(countTeacherLessons(course))}</strong>
          </div>
          <div className="teacher-form-actions">
            <Link className="btn btn-secondary" href={`/app/teacher/courses/${course.id}/builder`}>
              <Layers3 size={17} aria-hidden="true" />
              Éditer le parcours
            </Link>
          </div>
        </div>
      </section>

      <section className="teacher-form-section">
        <div>
          <span>Publication</span>
          <h2>État de publication</h2>
        </div>

        {!isPublished && publicationIssues.length > 0 ? (
          <div className="teacher-form-error" role="status">
            <strong>Éléments à compléter avant publication</strong>
            <ul>
              {publicationIssues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="teacher-form-grid teacher-form-grid--compact">
          <div className="teacher-field teacher-field--wide">
            <span>État</span>
            <strong>
              {isPublished
                ? "Formation publiée dans le catalogue."
                : "Formation en brouillon, invisible du catalogue."}
            </strong>
          </div>
          <div className="teacher-form-actions">
            {isPublished && course.slug ? (
              <Link className="btn btn-secondary" href={`/formations/${course.slug}`}>
                <Eye size={17} aria-hidden="true" />
                Voir dans le catalogue
              </Link>
            ) : null}
            {isPublished ? (
              <Link className="btn btn-secondary" href="#course-information">
                Modifier les infos
              </Link>
            ) : (
              <form action={publishTeacherCourseAction.bind(null, course.id)}>
                <TeacherSubmitButton
                  className="btn btn-primary"
                  pendingLabel="Publication..."
                >
                  <Send size={17} aria-hidden="true" />
                  Publier la formation
                </TeacherSubmitButton>
              </form>
            )}
          </div>
        </div>

        {!isPublished && !canPublish ? (
          <p className="teacher-field-note">
            La publication restera bloquée tant que les critères minimum ne sont pas respectés.
          </p>
        ) : null}

        <p className="teacher-field-note">
          La dépublication reste non destructive et sera cadrée avec le maintien des enrollments dans un sprint dédié.
        </p>
      </section>

      <div id="forge-ai">
        <ForgeCourseContextPanel course={course} domains={domains} initialSources={sources} />
      </div>
    </div>
  );
}
