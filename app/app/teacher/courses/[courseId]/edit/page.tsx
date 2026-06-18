import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { TeacherCourseForm } from "@/components/app/TeacherCourseForm";
import {
  getTeacherCourseById,
  getTeacherCourseFormDefaults,
  getTeacherCourseStaticParams,
  getTeacherDomains
} from "@/lib/teacher";
import { createPageMetadata } from "@/lib/seo";

type EditTeacherCoursePageProps = {
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
}: EditTeacherCoursePageProps): Promise<Metadata> {
  const { courseId } = await params;
  const course = getTeacherCourseById(courseId);

  return course
    ? createPageMetadata({
        title: `Modifier - ${course.title}`,
        description: `Modifier la formation ${course.title} en mode démo.`,
        path: `/app/teacher/courses/${course.id}/edit`,
        noIndex: true
      })
    : {
        title: "Formation introuvable"
      };
}

export default async function EditTeacherCoursePage({
  params
}: EditTeacherCoursePageProps) {
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
          { label: course.title }
        ]}
      />

      <AppPageHeader
        eyebrow="Édition"
        title="Modifier la formation"
        description="Les champs sont préremplis depuis les données mockées. L'enregistrement affiche une notification de mode démo."
      />

      <TeacherCourseForm
        domains={getTeacherDomains()}
        initialValues={getTeacherCourseFormDefaults(course)}
        mode="edit"
      />
    </div>
  );
}
