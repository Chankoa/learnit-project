import { UnifiedCourseCard } from "@/components/app/UnifiedCourseCard";
import type { Metadata } from "next";
import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { UnifiedAppShell } from "@/components/app/UnifiedAppShell";
import { getCurrentProfile, requireAuth } from "@/lib/auth/server";
import { getLmsCatalog } from "@/lib/lms";
import { createPageMetadata } from "@/lib/seo";
import { getUnifiedCourseRelations } from "@/lib/unified-course-relations";
export const dynamic = "force-dynamic";
export const metadata: Metadata = createPageMetadata({ title: "Explorer", description: "Explorez les formations publiées de LearnIt.", path: "/app/explore", noIndex: true });
export default async function ExplorePage() { await requireAuth("/app/explore"); const profile = await getCurrentProfile(); if (!profile) redirect("/access-denied?reason=profile&next=%2Fapp%2Fexplore"); const [courses, relations] = await Promise.all([getLmsCatalog(), getUnifiedCourseRelations(profile)]); const relationByCourse = new Map(relations.map((relation) => [relation.course.id, relation])); return <UnifiedAppShell profile={profile}><div className="app-page unified-explore"><AppBreadcrumb items={[{ label: "Accueil", href: "/app" }, { label: "Explorer" }]} /><AppPageHeader eyebrow="Explorer" title="Parcours publiés" description="Découvrez un sujet, développez une compétence, suivez votre curiosité." /><div className="unified-course-grid">{courses.map((course) => { const relation = relationByCourse.get(course.id); const label = relation?.primaryLabel ?? "Consulter"; const href = relation?.primaryHref ?? `/app/courses/${course.slug}`; return relation ? <UnifiedCourseCard surface="explore" key={course.id} relation={relation} /> : <UnifiedCourseCard surface="explore" key={course.id} course={course} href={href} />; })}</div></div></UnifiedAppShell>; }
