import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { ForgeCourseCreator } from "@/components/app/ForgeCourseCreator";
import { getTeacherStudioDomains } from "@/lib/teacher-service";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Créer avec Forge AI",
  description: "Générer une proposition de structure de formation à valider humainement.",
  path: "/app/teacher/courses/forge",
  noIndex: true
});

export default async function ForgeCoursePage() {
  const domains = await getTeacherStudioDomains();

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Espace enseignant", href: "/app/teacher" },
          { label: "Mes formations", href: "/app/teacher/courses" },
          { label: "Créer avec Forge AI" }
        ]}
      />

      <AppPageHeader
        eyebrow="Forge AI"
        title="Créer avec Forge AI"
        description="Transformez une intention pédagogique en proposition de parcours. Rien n'est écrit avant validation explicite."
        actions={
          <Link className="btn btn-secondary" href="/app/teacher/courses">
            <ArrowLeft size={17} aria-hidden="true" />
            Mes formations
          </Link>
        }
      />

      <div className="forge-ai-banner">
        <Sparkles size={18} aria-hidden="true" />
        <p>
          Copilote pédagogique : Forge propose une structure, le formateur décide ce qui est importé.
        </p>
      </div>

      <ForgeCourseCreator domains={domains} />
    </div>
  );
}
