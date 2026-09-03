import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { UnifiedAppShell } from "@/components/app/UnifiedAppShell";
import { UnifiedCourseCard } from "@/components/app/UnifiedCourseCard";
import { getCurrentProfile, requireAuth } from "@/lib/auth/server";
import { getUnifiedCourseRelations } from "@/lib/unified-course-relations";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = createPageMetadata({ title: "Mes parcours", description: "Vos parcours LearnIt, réunis par relation réelle.", path: "/app/courses", noIndex: true });

export default async function UnifiedCoursesPage() {
  await requireAuth("/app/courses");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/access-denied?reason=profile&next=%2Fapp%2Fcourses");
  const relations = await getUnifiedCourseRelations(profile);
  const filters = [
    { label: "J'apprends", rows: relations.filter((relation) => Boolean(relation.enrollment)) },
    { label: "Je crée", rows: relations.filter((relation) => relation.capabilities.includes("edit")) },
    { label: "Partagés avec moi", rows: relations.filter((relation) => relation.memberships.some((role) => role !== "owner")) },
    { label: "Terminés", rows: relations.filter((relation) => relation.enrollment?.status === "completed") }
  ].filter((filter) => filter.rows.length > 0);

  return <UnifiedAppShell profile={profile}><div className="app-page unified-courses"><AppBreadcrumb items={[{ label: "Accueil", href: "/app" }, { label: "Mes parcours" }]} /><AppPageHeader eyebrow="Mes parcours" title="Tout ce qui vous relie à un parcours." description="Une carte unique par parcours, même lorsque vous apprenez et créez au même endroit." />{relations.length ? <><nav className="unified-filter-list" aria-label="Filtres de parcours"><a href="#all">Tous <small>{relations.length}</small></a>{filters.map((filter) => <a href={`#${filter.label}`} key={filter.label}>{filter.label} <small>{filter.rows.length}</small></a>)}</nav><section id="all" className="unified-course-grid" aria-label="Tous mes parcours">{relations.map((relation) => <UnifiedCourseCard key={relation.course.id} relation={relation} />)}</section></> : <p className="unified-empty">Aucun parcours n'est encore associé à votre compte.</p>}</div></UnifiedAppShell>;
}