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
  const relations = await getUnifiedCourseRelations(profile);
  const toResume = relations.find((relation) => relation.enrollment?.status === "in-progress") ?? relations.find((relation) => relation.enrollment);

  return (
    <UnifiedAppShell profile={profile}>
      <div className="app-page unified-home">
        <AppBreadcrumb items={[{ label: "Accueil" }]} />
        <AppPageHeader
          eyebrow="LearnIt / Forge"
          title={`Bonjour ${profile.name}`}
          description="Retrouvez ce que vous apprenez, ce que vous créez et les parcours que vous souhaitez explorer."
        />
        <section className="unified-hero" aria-labelledby="unified-hero-title">
          <div>
            <span>Un espace unique, propulsé par Forge</span>
            <h2 id="unified-hero-title">Apprenez, créez et partagez avec un contexte de confiance.</h2>
            <p>Forge vous accompagne dans les parcours et les créations déjà accessibles à votre compte.</p>
          </div>
          <div className="unified-hero__actions">
            <Link className="btn btn-secondary" href="/app/courses"><BookOpenText size={16} aria-hidden="true" /> Mes parcours</Link>
            <Link className="btn btn-secondary" href="/app/explore"><Compass size={16} aria-hidden="true" /> Explorer</Link>
            <Link className="btn btn-primary" href="/app/teacher/courses/new"><PenLine size={16} aria-hidden="true" /> Créer</Link>
          </div>
          <Sparkles aria-hidden="true" className="unified-hero__mark" size={54} />
        </section>
        {toResume ? <section className="unified-section" aria-labelledby="resume-title"><div className="unified-section__heading"><div><span>À reprendre</span><h2 id="resume-title">Votre dernier parcours actif</h2></div></div><UnifiedCourseCard relation={toResume} /></section> : null}
        <section className="unified-section" aria-labelledby="my-courses-title"><div className="unified-section__heading"><div><span>Mes parcours</span><h2 id="my-courses-title">Vos relations actives</h2></div><Link href="/app/courses">Tout voir <ArrowRight size={16} aria-hidden="true" /></Link></div>{relations.length ? <div className="unified-course-grid">{relations.slice(0, 3).map((relation) => <UnifiedCourseCard key={relation.course.id} relation={relation} />)}</div> : <p className="unified-empty">Vous n'avez pas encore de parcours personnel. Explorez le catalogue pour commencer.</p>}</section>
        <section className="unified-collaborative-preview" aria-labelledby="collaborative-title"><div><span>Collaboratif</span><h2 id="collaborative-title">Les relations réelles, sans faux réseau.</h2><p>Le suivi des inscrits et la publication restent disponibles dans les parcours que vous gérez. Contributions, discussions et remix arriveront avec leurs modèles de données.</p></div><Link className="btn btn-secondary" href="/app/collaborative"><Users size={16} aria-hidden="true" /> Voir le collaboratif</Link></section>
      </div>
    </UnifiedAppShell>
  );
}
