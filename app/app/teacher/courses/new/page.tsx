import type { Metadata } from "next";
import Link from "next/link";
import { PencilLine, Sparkles } from "lucide-react";

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
  title: "Nouvelle création",
  description: "Commencez un parcours manuellement ou avec l'assistance de Forge.",
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
          { label: "Créer", href: "/app/teacher" },
          { label: "Mes créations", href: "/app/teacher/courses" },
          { label: "Nouvelle création" }
        ]}
      />

      <AppPageHeader
        eyebrow="Créer"
        title="Nouvelle création"
        description="Choisissez votre point de départ. Dans les deux cas, le parcours reste un brouillon jusqu'à votre publication."
      />

      <section className="creator-start" aria-labelledby="creator-start-title">
        <div className="creator-start__heading">
          <span>Point de départ</span>
          <h2 id="creator-start-title">Comment souhaitez-vous commencer&nbsp;?</h2>
        </div>
        <div className="creator-start__options">
          <div className="creator-start__option" data-selected="true">
            <PencilLine size={21} aria-hidden="true" />
            <div>
              <strong>Créer manuellement</strong>
              <p>Renseignez les informations essentielles, puis structurez le parcours dans le cockpit.</p>
            </div>
            <span>Mode actuel</span>
          </div>
          <Link className="creator-start__option" href="/app/teacher/courses/forge">
            <Sparkles size={21} aria-hidden="true" />
            <div>
              <strong>Construire avec Forge</strong>
              <p>Décrivez votre intention et validez une proposition avant son import en brouillon.</p>
            </div>
            <span>Choisir</span>
          </Link>
        </div>
      </section>

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
