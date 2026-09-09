import { ForgeJourneyArt } from "@/components/app/ForgeJourneyHero";
import { getLmsCatalog } from "@/lib/lms";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenText, Compass, PenLine, Sparkles, Users } from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { UnifiedAppShell } from "@/components/app/UnifiedAppShell";
import { UnifiedCourseCard } from "@/components/app/UnifiedCourseCard";
import { getCurrentProfile, requireAuth } from "@/lib/auth/server";
import { getUnifiedCourseRelations } from "@/lib/unified-course-relations";
import { redirect } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Accueil LearnIt",
  description: "Retrouvez vos parcours, explorez et créez depuis un espace LearnIt unifié.",
  path: "/app",
  noIndex: true
});

export const dynamic = "force-dynamic";

export default async function AppAccessPage() {
  await requireAuth("/app");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/access-denied?reason=profile&next=%2Fapp");
  const [relations, catalog] = await Promise.all([getUnifiedCourseRelations(profile), getLmsCatalog()]);
  const toResume = relations.find((relation) => relation.enrollment?.status === "in-progress") ?? relations.find((relation) => relation.enrollment);

  return (
    <UnifiedAppShell profile={profile}>
      <div className="app-page unified-home">
        <AppBreadcrumb items={[{ label: "Accueil" }]} />
        <AppPageHeader
          eyebrow="LearnIt / Forge"
          title={`Bonjour ${profile.name}`}
          description="Heureux de vous retrouver. Qu’allez-vous faire avancer aujourd’hui ?"
        />
        <section className="workspace-create-entry" aria-labelledby="workspace-create-title"><div><h2 id="workspace-create-title">Votre prochain parcours</h2><p>Une idée à explorer ou à transmettre ?</p></div><Link className="btn btn-primary" href="/app/create"><PenLine size={17} aria-hidden="true" />Créer avec Forge</Link></section>
        {toResume ? <section className="unified-section" aria-labelledby="resume-title"><div className="unified-section__heading"><div><span>À reprendre</span><h2 id="resume-title">Votre dernier parcours actif</h2></div></div><div className="unified-course-grid"><UnifiedCourseCard relation={toResume} /></div></section> : null}
        <section className="unified-section" aria-labelledby="my-courses-title"><div className="unified-section__heading"><div><span>Mes parcours</span><h2 id="my-courses-title">Apprentissages et créations</h2></div><Link href="/app/courses">Tout voir <ArrowRight size={16} aria-hidden="true" /></Link></div>{relations.length ? <div className="unified-course-grid">{relations.filter(relation => relation.course.id !== toResume?.course.id).slice(0, 3).map((relation) => <UnifiedCourseCard key={relation.course.id} relation={relation} />)}</div> : <p className="unified-empty">Vous n'avez pas encore de parcours personnel. Explorez le catalogue pour commencer.</p>}</section>
        <section className="unified-section" aria-labelledby="explore-title"><div className="unified-section__heading"><h2 id="explore-title">À explorer</h2><Link href="/app/explore">Tout explorer <ArrowRight size={16} aria-hidden="true" /></Link></div><div className="unified-course-grid">{catalog.slice(0, 3).map(course => { const relation = relations.find(item => item.course.id === course.id); return relation ? <UnifiedCourseCard key={course.id} relation={relation} /> : <UnifiedCourseCard key={course.id} course={course} href={`/app/courses/${course.slug}`} />; })}</div></section>
      </div>
    </UnifiedAppShell>
  );
}
