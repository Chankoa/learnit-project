import type { Metadata } from "next";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { TeacherCourseForm } from "@/components/app/TeacherCourseForm";
import {
  getTeacherCourseById,
  getTeacherCourseFormDefaults,
  getTeacherDomains
} from "@/lib/teacher";
import { createPageMetadata } from "@/lib/seo";

type NewTeacherCoursePageProps = {
  searchParams?: Promise<{
    duplicate?: string | string[];
  }>;
};

export const metadata: Metadata = createPageMetadata({
  title: "Créer une formation",
  description: "Créez une formation enseignant en mode démo.",
  path: "/app/teacher/courses/new",
  noIndex: true
});

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewTeacherCoursePage({
  searchParams
}: NewTeacherCoursePageProps) {
  const params = await searchParams;
  const duplicateCourseId = getSingleParam(params?.duplicate);
  const duplicatedCourse = duplicateCourseId ? getTeacherCourseById(duplicateCourseId) : undefined;
  const initialValues = getTeacherCourseFormDefaults(duplicatedCourse);

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Espace enseignant", href: "/app/teacher" },
          { label: "Mes formations", href: "/app/teacher/courses" },
          { label: "Créer une formation" }
        ]}
      />

      <AppPageHeader
        eyebrow="Création"
        title={duplicatedCourse ? "Dupliquer une formation" : "Créer une formation"}
        description="Le formulaire fonctionne en mode démo : validation front, log navigateur au submit et confirmation visuelle."
      />

      <TeacherCourseForm
        domains={getTeacherDomains()}
        initialValues={{
          ...initialValues,
          title: duplicatedCourse ? `${initialValues.title} - copie` : initialValues.title,
          status: "draft"
        }}
        mode="create"
      />
    </div>
  );
}
