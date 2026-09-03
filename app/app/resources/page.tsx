import type { Metadata } from "next";
import { ExternalLink, Library } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { UnifiedAppShell } from "@/components/app/UnifiedAppShell";
import { getCurrentProfile, requireAuth } from "@/lib/auth/server";
import { getUnifiedCourseRelations } from "@/lib/unified-course-relations";
import { createPageMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export const metadata: Metadata = createPageMetadata({ title: "Ressources", description: "Ressources accessibles dans vos parcours LearnIt.", path: "/app/resources", noIndex: true });
export default async function UnifiedResourcesPage() { await requireAuth("/app/resources"); const profile = await getCurrentProfile(); if (!profile) redirect("/access-denied?reason=profile&next=%2Fapp%2Fresources"); const relations = await getUnifiedCourseRelations(profile); const resources = relations.flatMap((relation) => [ ...(relation.course.resources ?? []), ...relation.course.modules.flatMap((module) => [ ...(module.resources ?? []), ...module.lessons.flatMap((lesson) => lesson.resources ?? []) ]) ].map((resource) => ({ course: relation.course.title, resource }))); return <UnifiedAppShell profile={profile}><div className="app-page unified-resources"><AppBreadcrumb items={[{ label: "Accueil", href: "/app" }, { label: "Ressources" }]} /><AppPageHeader eyebrow="Ressources" title="Ressources de vos parcours" description="Les ressources pédagogiques restent distinctes des sources de travail Forge." />{resources.length ? <div className="unified-resource-list">{resources.map(({ course, resource }) => <article key={resource.id}><Library size={18} aria-hidden="true" /><div><span>{course}</span><h2>{resource.title}</h2>{resource.description ? <p>{resource.description}</p> : null}</div><Link aria-label={`Ouvrir ${resource.title}`} href={resource.href}><ExternalLink size={17} aria-hidden="true" /></Link></article>)}</div> : <p className="unified-empty">Aucune ressource accessible n'est associée à vos parcours pour le moment.</p>}</div></UnifiedAppShell>; }