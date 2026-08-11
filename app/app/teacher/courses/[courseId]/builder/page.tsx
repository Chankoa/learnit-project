import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { TeacherCourseBuilder } from "@/components/app/TeacherCourseBuilder";
import { countTeacherLessons, getTeacherStudioCourse } from "@/lib/teacher-service";
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
        title: `Builder - ${course.title}`,
        description: `Gerer les modules et lecons de ${course.title}.`,
        path: `/app/teacher/courses/${course.id}/builder`,
        noIndex: true
      })
    : {
        title: "Builder introuvable"
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
          { label: "Espace enseignant", href: "/app/teacher" },
          { label: "Mes formations", href: "/app/teacher/courses" },
          { label: "Builder" }
        ]}
      />

      <AppPageHeader
        eyebrow="Modules et lecons"
        title="Course Builder"
        description={`${course.modules.length} modules, ${countTeacherLessons(course)} lecons. Les modifications sont enregistrees dans Supabase.`}
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
