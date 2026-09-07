import Link from "next/link";
import { filterCourseRelations, normalizeCourseRelationFilter } from "@/lib/course-collection";
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

export default async function UnifiedCoursesPage({ searchParams }: { searchParams: Promise<{ relation?: string | string[] }> }) {
  await requireAuth("/app/courses");
  const profile = await getCurrentProfile();
  if (!profile) redirect("/access-denied?reason=profile&next=%2Fapp%2Fcourses");
  const relations = await getUnifiedCourseRelations(profile);
  const selected = normalizeCourseRelationFilter((await searchParams).relation);
  const visible = filterCourseRelations(relations, selected);
  const filters = [{ value: "all", label: "Tous" }, { value: "learn", label: "J’apprends" }, { value: "create", label: "Je crée" }] as const;
  return <UnifiedAppShell profile={profile}><div className="app-page unified-courses">
    <AppBreadcrumb items={[{ label: "Accueil", href: "/app" }, { label: "Mes parcours" }]} />
    <AppPageHeader eyebrow="Mes parcours" title="J’apprends autant que j’enseigne." description="Retrouvez vos apprentissages et vos créations." />
    <div className="journey-collection-toolbar"><nav className="unified-filter-list" aria-label="Filtres de parcours">{filters.map(filter => <Link href={`/app/courses?relation=${filter.value}`} aria-current={selected === filter.value ? "page" : undefined} key={filter.value}>{filter.label}<small>{filterCourseRelations(relations, filter.value).length}</small></Link>)}</nav><Link className="btn btn-primary" href="/app/create">Créer un parcours</Link></div>
    {visible.length ? <section className="unified-course-grid" aria-label="Mes parcours filtrés">{visible.map(relation => <UnifiedCourseCard key={relation.course.id} relation={relation} />)}</section> : <div className="unified-empty"><h2>Aucun parcours ici pour le moment</h2><p>Commencez un apprentissage ou donnez forme à votre prochaine idée.</p><Link className="btn btn-secondary" href={selected === "create" ? "/app/create" : "/app/explore"}>{selected === "create" ? "Créer un parcours" : "Explorer les parcours"}</Link></div>}
  </div></UnifiedAppShell>;
}
