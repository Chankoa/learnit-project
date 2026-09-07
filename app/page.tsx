import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpenText, Compass, Sparkles } from "lucide-react";
import { ForgeJourneyHero } from "@/components/app/ForgeJourneyHero";
import { UnifiedCourseCard } from "@/components/app/UnifiedCourseCard";
import { getLmsCatalog } from "@/lib/lms";
import { createPageMetadata } from "@/lib/seo";
export const metadata: Metadata = createPageMetadata({ title: "Forge — Apprendre, créer, partager", description: "Transformez une idée en un parcours de connaissance avec Forge.", path: "/" });
export default async function HomePage() {
  const courses = await getLmsCatalog();
  return <div className="journey-public section-shell">
    <ForgeJourneyHero />
    <div className="journey-workspace-entry"><Link className="btn btn-primary" href="/app">Accéder au Workspace <ArrowRight size={18} aria-hidden="true" /></Link><p>Un compte pour apprendre autant que vous enseignez.</p></div>
    <section className="unified-section" aria-labelledby="discover-title"><div className="unified-section__heading"><h2 id="discover-title">Un parcours pour chaque curiosité</h2><Link href="/formations">Tout explorer <ArrowRight size={16} aria-hidden="true" /></Link></div>{courses.length ? <div className="unified-course-grid">{courses.slice(0, 4).map(course => <UnifiedCourseCard key={course.id} course={course} href={`/formations/${course.slug}`} />)}</div> : <p>Les prochains parcours publiés apparaîtront ici.</p>}</section>
    <section className="journey-features" aria-label="Découvrir LearnIt"><article><Compass aria-hidden="true" /><h2>Suivez votre curiosité</h2><p>Explorez les parcours disponibles et avancez à votre rythme.</p><Link href="/formations">Explorer les parcours</Link></article><article><Sparkles aria-hidden="true" /><h2>Donnez forme à une idée</h2><p>Forge vous aide à structurer un parcours que vous gardez en main.</p><Link href="/app/create">Créer avec Forge</Link></article><article><BookOpenText aria-hidden="true" /><h2>Construisez vos connaissances</h2><p>Retrouvez les ressources qui accompagnent votre apprentissage.</p><Link href="/ressources">Découvrir les ressources</Link></article></section>
  </div>;
}
