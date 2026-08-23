import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { TeacherCourseBuilder } from "@/components/app/TeacherCourseBuilder";
import {
  countTeacherLessons,
  formatLessonCount,
  formatModuleCount,
  getTeacherStudioCourse
} from "@/lib/teacher-service";
import { createPageMetadata } from "@/lib/seo";

type TeacherCourseBuilderPageProps = {
  params: Promise<{
    courseId: string;
  }>;
  searchParams?: Promise<{
    error?: string | string[];
    lesson?: string | string[];
    message?: string | string[];
    module?: string | string[];
    preview?: string | string[];
  }>;
};

export const dynamic = "force-dynamic";

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata({
  params
}: TeacherCourseBuilderPageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getTeacherStudioCourse(courseId, `/app/teacher/courses/${courseId}/builder`);

  return course
    ? createPageMetadata({
        title: `Éditeur de parcours - ${course.title}`,
        description: `Gérer les modules et leçons de ${course.title}.`,
        path: `/app/teacher/courses/${course.id}/builder`,
        noIndex: true
      })
    : {
        title: "Éditeur introuvable"
      };
}

export default async function TeacherCourseBuilderPage({
  params,
  searchParams
}: TeacherCourseBuilderPageProps) {
  const { courseId } = await params;
  const [course, query] = await Promise.all([
    getTeacherStudioCourse(courseId, `/app/teacher/courses/${courseId}/builder`),
    searchParams
  ]);

  if (!course) {
    notFound();
  }

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Créer", href: "/app/teacher" },
          { label: "Mes créations", href: "/app/teacher/courses" },
          { label: "Éditeur de parcours" }
        ]}
      />

      <AppPageHeader
        eyebrow="Structure"
        title="Éditeur de parcours"
        description={`${formatModuleCount(course.modules.length)}, ${formatLessonCount(countTeacherLessons(course))}. Les modifications sont enregistrées dans Supabase.`}
      />

      <TeacherCourseBuilder
        course={course}
        error={getSingleParam(query?.error)}
        message={getSingleParam(query?.message)}
        previewLessonId={getSingleParam(query?.preview)}
        selectedLessonId={getSingleParam(query?.lesson)}
        selectedModuleId={getSingleParam(query?.module)}
      />
    </div>
  );
}
