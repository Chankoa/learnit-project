import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { TeacherCourseBuilder } from "@/components/app/TeacherCourseBuilder";
import {
  countTeacherLessons,
  getTeacherCourseById,
  getTeacherCourseStaticParams
} from "@/lib/teacher";
import { createPageMetadata } from "@/lib/seo";

type TeacherCourseBuilderPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getTeacherCourseStaticParams();
}

export async function generateMetadata({
  params
}: TeacherCourseBuilderPageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = getTeacherCourseById(courseId);

  return course
    ? createPageMetadata({
        title: `Builder - ${course.title}`,
        description: `Gérer les modules et leçons de ${course.title}.`,
        path: `/app/teacher/courses/${course.id}/builder`,
        noIndex: true
      })
    : {
        title: "Builder introuvable"
      };
}

export default async function TeacherCourseBuilderPage({
  params
}: TeacherCourseBuilderPageProps) {
  const { courseId } = await params;
  const course = getTeacherCourseById(courseId);

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
        eyebrow="Modules et leçons"
        title="Course Builder"
        description={`${course.modules.length} modules, ${countTeacherLessons(course)} leçons. Les actions modifient uniquement l'affichage local en mode démo.`}
      />

      <TeacherCourseBuilder course={course} />
    </div>
  );
}
