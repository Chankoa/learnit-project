import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { CreatorWorkspaceHeader } from "@/components/app/CreatorWorkspaceHeader";
import { ForgeCourseCreator } from "@/components/app/ForgeCourseCreator";
import { validateForgeCreationIntent } from "@/lib/forge-ai/creation-intent";
import { getTeacherStudioDomains } from "@/lib/teacher-service";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Construire avec Forge",
  description: "Générer une proposition de structure de formation à valider humainement.",
  path: "/app/teacher/courses/forge",
  noIndex: true
});

type ForgeCoursePageProps = {
  searchParams?: Promise<{
    format?: string | string[];
    intent?: string | string[];
  }>;
};

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ForgeCoursePage({ searchParams }: ForgeCoursePageProps) {
  const params = await searchParams;
  const domains = await getTeacherStudioDomains();
  const intentResult = validateForgeCreationIntent({
    formatHint: getSingleParam(params?.format),
    text: getSingleParam(params?.intent) ?? ""
  });
  const initialIntent = intentResult.ok ? intentResult.data : undefined;

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Créer", href: "/app/teacher" },
          { label: "Nouvelle création", href: "/app/teacher/courses/new" },
          { label: "Avec Forge" }
        ]}
      />

      <CreatorWorkspaceHeader
        actions={
          <Link className="btn btn-secondary" href="/app/teacher/courses/new">
            <ArrowLeft size={17} aria-hidden="true" />
            Changer de mode
          </Link>
        }
        eyebrow="Création en préparation"
        meta="Brief · Proposition · Import en brouillon"
        status="review"
        statusLabel="Brief"
        title="Nouvelle création avec Forge"
      />

      <ForgeCourseCreator domains={domains} initialIntent={initialIntent} />
    </div>
  );
}
