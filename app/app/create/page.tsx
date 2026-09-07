import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, PencilLine, Sparkles } from "lucide-react";

import { createTeacherCourseAction } from "@/app/app/teacher/courses/actions";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { ForgeCourseCreator } from "@/components/app/ForgeCourseCreator";
import { ForgeHomeIntent } from "@/components/app/ForgeHomeIntent";
import { TeacherCourseForm } from "@/components/app/TeacherCourseForm";
import { UnifiedAppShell } from "@/components/app/UnifiedAppShell";
import { getCurrentProfile, requireAuth } from "@/lib/auth/server";
import { validateForgeCreationIntent } from "@/lib/forge-ai/creation-intent";
import { createPageMetadata } from "@/lib/seo";
import { getTeacherCourseFormDefaults, getTeacherStudioDomains } from "@/lib/teacher-service";
import { redirect } from "next/navigation";

type CreatePageProps = {
  searchParams: Promise<{ error?: string | string[]; format?: string | string[]; intent?: string | string[] }>;
};

export const dynamic = "force-dynamic";
export const metadata: Metadata = createPageMetadata({ title: "Créer un parcours", description: "Commencez un parcours manuellement ou avec Forge.", path: "/app/create", noIndex: true });

function single(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CreatePage({ searchParams }: CreatePageProps) {
  await requireAuth("/app/create");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=%2Fapp%2Fcreate");

  const params = await searchParams;
  const intentResult = validateForgeCreationIntent({ formatHint: single(params.format), text: single(params.intent) ?? "" });
  const isForgeFlow = Boolean(single(params.intent));
  const domains = await getTeacherStudioDomains();

  return (
    <UnifiedAppShell profile={profile}>
      <main className="app-page teacher-page" id="main-content">
        <AppBreadcrumb items={[{ label: "Accueil", href: "/app" }, { label: "Créer" }]} />
        {isForgeFlow && intentResult.ok ? (
          <>
            <AppPageHeader eyebrow="Forge" title="Préparer un parcours" description="Vérifiez le brief et la proposition avant l'import dans un brouillon." />
            <Link className="btn btn-secondary" href="/app/create"><ArrowLeft size={17} aria-hidden="true" /> Changer de mode</Link>
            <ForgeCourseCreator domains={domains} initialIntent={intentResult.data} />
          </>
        ) : (
          <>
            <AppPageHeader eyebrow="Créer" title="Commencer un parcours" description="Posez une intention à Forge ou partez directement d'une structure manuelle." />
            <section className="creator-start" aria-labelledby="create-intent-title">
              <div className="creator-start__heading"><Sparkles size={21} aria-hidden="true" /><div><span>Avec Forge</span><h2 id="create-intent-title">Préparer un brief</h2></div></div>
              <ForgeHomeIntent />
            </section>
            <section className="creator-start" aria-labelledby="create-manual-title">
              <div className="creator-start__heading"><PencilLine size={21} aria-hidden="true" /><div><span>Création manuelle</span><h2 id="create-manual-title">Définir les informations essentielles</h2></div></div>
              <TeacherCourseForm action={createTeacherCourseAction} domains={domains} error={single(params.error)} initialValues={getTeacherCourseFormDefaults()} mode="create" returnPath="/app/create" />
            </section>
          </>
        )}
      </main>
    </UnifiedAppShell>
  );
}