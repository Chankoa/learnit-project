import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Layers3 } from "lucide-react";

import {
  publishTeacherCourseAction,
  unpublishTeacherCourseAction,
  updateTeacherCourseAction
} from "@/app/app/teacher/courses/actions";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { ForgeCourseContextPanel } from "@/components/app/ForgeCourseContextPanel";
import { ForgeCourseSourcesPanel } from "@/components/app/ForgeCourseSourcesPanel";
import { TeacherCourseCockpit } from "@/components/app/TeacherCourseCockpit";
import { TeacherCourseForm } from "@/components/app/TeacherCourseForm";
import { getForgeCourseSources } from "@/lib/forge-ai/service";
import {
  countTeacherLessons,
  formatLessonCount,
  formatModuleCount,
  formatTeacherCount,
  getPublicationIssues,
  getTeacherCourseDuration,
  getTeacherCourseFormDefaults,
  getTeacherStudioCourse,
  getTeacherStudioDomains
} from "@/lib/teacher-service";
import { createPageMetadata } from "@/lib/seo";

type EditTeacherCoursePageProps = {
  params: Promise<{ courseId: string }>;
  searchParams?: Promise<{
    error?: string | string[];
    message?: string | string[];
    publish?: string | string[];
    tab?: string | string[];
  }>;
};

export const dynamic = "force-dynamic";

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({ params }: EditTeacherCoursePageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getTeacherStudioCourse(courseId, `/app/teacher/courses/${courseId}/edit`);

  return course
    ? createPageMetadata({
        title: `Modifier - ${course.title}`,
        description: `Modifier la formation ${course.title}.`,
        path: `/app/teacher/courses/${course.id}/edit`,
        noIndex: true
      })
    : { title: "Formation introuvable" };
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

  const lessonCount = countTeacherLessons(course);
  const publicationIssues = getPublicationIssues(course);
  const missingLessonContent = course.modules.flatMap((module) =>
    module.lessons
      .filter((lesson) => !lesson.content?.trim())
      .map((lesson) => ({
        description: `Module « ${module.title} » · contenu manquant`,
        href: `/app/teacher/courses/${course.id}/builder?lesson=${lesson.id}&from=publication`,
        label: `Leçon — ${lesson.title}`
      }))
  );
  const missingLessonLabels = new Set(
    course.modules.flatMap((module) =>
      module.lessons
        .filter((lesson) => !lesson.content?.trim())
        .map((lesson) => `Module « ${module.title} » → leçon « ${lesson.title} » sans contenu.`)
    )
  );
  const isPublished = course.status === "published";
  const requestedTab = getSingleParam(query?.tab);
  const initialTab =
    requestedTab === "structure" ||
    requestedTab === "sources" ||
    requestedTab === "forge" ||
    requestedTab === "publication"
      ? requestedTab
      : "information";

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Créer", href: "/app/teacher" },
          { label: "Mes créations", href: "/app/teacher/courses" },
          { label: course.title }
        ]}
      />
      <TeacherCourseCockpit
        courseTitle={course.title}
        enrollmentLabel={formatTeacherCount(course.enrolledLearnerCount ?? 0, "inscrit", "inscrits")}
        forgeContent={<ForgeCourseContextPanel course={course} domains={domains} initialSources={sources} />}
        informationContent={
          <TeacherCourseForm
            action={updateTeacherCourseAction.bind(null, course.id)}
            domains={domains}
            error={getSingleParam(query?.error)}
            initialValues={getTeacherCourseFormDefaults(course)}
            message={getSingleParam(query?.message)}
            mode="edit"
          />
        }
        editHref={`/app/teacher/courses/${course.id}/builder`}
        initialTab={initialTab}
        initialPublishDialog={getSingleParam(query?.publish) === "1"}
        isPublished={isPublished}
        lessonCountLabel={formatLessonCount(lessonCount)}
        moduleCountLabel={formatModuleCount(course.modules.length)}
        previewHref={
          isPublished && course.slug
            ? `/formations/${course.slug}`
            : `/app/teacher/courses/${course.id}/preview`
        }
        publicationChecklist={[
          { complete: Boolean(course.title.trim() && course.domain.id), label: "Informations générales" },
          { complete: Boolean(course.description.trim()), label: "Description" },
          { complete: true, label: "Image de couverture (facultative)" },
          { complete: course.modules.length > 0, label: "Modules présents" },
          { complete: lessonCount > 0, label: "Leçons présentes" },
          {
            complete: course.modules.every((module) => module.lessons.every((lesson) => lesson.content?.trim())),
            label: "Contenu des leçons"
          }
        ]}
        publicationIssues={[
          ...publicationIssues
            .filter((label) => !missingLessonLabels.has(label))
            .map((label) => ({
              href: label.includes("description") || label.includes("titre")
                ? `/app/teacher/courses/${course.id}/edit?tab=information`
                : `/app/teacher/courses/${course.id}/builder`,
              label
            })),
          ...missingLessonContent
        ]}
        publishAction={publishTeacherCourseAction.bind(null, course.id)}
        sourceContent={<ForgeCourseSourcesPanel courseId={course.id} initialSources={sources} />}
        structureContent={
          <section className="teacher-form-section teacher-course-structure-summary">
            <div>
              <span>Parcours</span>
              <h2>{formatModuleCount(course.modules.length)} · {formatLessonCount(lessonCount)}</h2>
              <p>{getTeacherCourseDuration(course)} min de durée estimée.</p>
            </div>
            {course.modules.length > 0 ? (
              <ol className="teacher-course-structure-summary__list">
                {course.modules.map((module) => (
                  <li key={module.id}>
                    <strong>{module.title}</strong>
                    <span>{formatLessonCount(module.lessons.length)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="teacher-field-note">Ajoutez votre premier module pour commencer à structurer la formation.</p>
            )}
            <div className="teacher-form-actions">
              <Link className="btn btn-primary" href={`/app/teacher/courses/${course.id}/builder`}>
                <Layers3 size={17} aria-hidden="true" />
                Éditer le parcours
              </Link>
            </div>
          </section>
        }
        unpublishAction={unpublishTeacherCourseAction.bind(null, course.id)}
      />
    </div>
  );
}
