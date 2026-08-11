import type { Metadata } from "next";

import { createTeacherCourseAction } from "@/app/app/teacher/courses/actions";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { TeacherCourseForm } from "@/components/app/TeacherCourseForm";
import {
  getTeacherCourseFormDefaults,
  getTeacherStudioDomains
} from "@/lib/teacher-service";
import { createPageMetadata } from "@/lib/seo";

type NewTeacherCoursePageProps = {
  searchParams?: Promise<{
    error?: string | string[];
    message?: string | string[];
  }>;
};

export const metadata: Metadata = createPageMetadata({
  title: "Creer une formation",
  description: "Creez une formation enseignant connectee a Supabase.",
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
  const domains = await getTeacherStudioDomains();

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Espace enseignant", href: "/app/teacher" },
          { label: "Mes formations", href: "/app/teacher/courses" },
          { label: "Creer une formation" }
        ]}
      />

      <AppPageHeader
        eyebrow="Creation"
        title="Creer une formation"
        description="La formation est creee en brouillon. Vous pourrez ensuite ajouter modules, lecons et publier le parcours."
      />

      <TeacherCourseForm
        action={createTeacherCourseAction}
        domains={domains}
        error={getSingleParam(params?.error)}
        initialValues={{
          ...getTeacherCourseFormDefaults(),
          domainId: domains[0]?.id ?? ""
        }}
        message={getSingleParam(params?.message)}
        mode="create"
      />
    </div>
  );
}
