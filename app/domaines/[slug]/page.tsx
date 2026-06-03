import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Layers } from "lucide-react";
import { notFound } from "next/navigation";

import { CourseGrid } from "@/components/catalog/CourseGrid";
import { getCatalogCoursesByDomain } from "@/lib/courses";
import { getDomainBySlug, getDomainStaticParams } from "@/lib/domains";

type DomainPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getDomainStaticParams();
}

export async function generateMetadata({ params }: DomainPageProps): Promise<Metadata> {
  const { slug } = await params;
  const domain = getDomainBySlug(slug);

  if (!domain) {
    return {
      title: "Domaine introuvable"
    };
  }

  return {
    title: domain.name,
    description: domain.description
  };
}

export default async function DomainPage({ params }: DomainPageProps) {
  const { slug } = await params;
  const domain = getDomainBySlug(slug);

  if (!domain) {
    notFound();
  }

  const domainCourses = getCatalogCoursesByDomain(domain.id);
  const totalModules = domainCourses.reduce((total, course) => total + course.modules.length, 0);
  const totalLessons = domainCourses.reduce(
    (total, course) => total + course.modules.reduce((lessonTotal, module) => lessonTotal + module.lessons.length, 0),
    0
  );

  return (
    <>
      <section className="section-shell py-10 md:py-14">
        <Link className="nav-link inline-flex items-center gap-2" href="/formations#domaines">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour aux domaines
        </Link>

        <div className="hero-card mt-6 grid gap-8 p-5 md:grid-cols-[1fr_0.8fr] md:p-10">
          <div>
            <span className="eyebrow w-fit">Domaine</span>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight text-text-strong md:text-[3.25rem]">
              {domain.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base text-text-muted md:text-lg">{domain.description}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn btn-primary" href="/formations">
                Voir toutes les formations
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link className="btn btn-secondary" href="#formations-associees">
                Formations associées
              </Link>
            </div>
          </div>

          <aside className="lesson-card grid gap-4 p-5 sm:grid-cols-2 md:grid-cols-1">
            <div>
              <p className="text-sm font-bold text-text-muted">Formations au catalogue</p>
              <strong className="mt-2 block text-3xl text-text-strong">{domainCourses.length}</strong>
            </div>
            <div className="flex items-center gap-3">
              <span className="icon-badge">
                <Layers size={18} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-extrabold text-text-strong">{totalModules} modules</span>
                <span className="block text-xs text-text-muted">dans ce domaine</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="icon-badge">
                <BookOpen size={18} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-extrabold text-text-strong">{totalLessons} leçons</span>
                <span className="block text-xs text-text-muted">pour pratiquer</span>
              </span>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-shell py-10" id="formations-associees">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow w-fit">Formations associées</span>
            <h2 className="mt-4 text-2xl font-black text-text-strong md:text-3xl">
              Parcours disponibles en {domain.name.toLowerCase()}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-text-muted">
              Ces formations sont rattachées au domaine {domain.name} et sont actuellement référencées dans le catalogue.
            </p>
          </div>
          <Link className="btn btn-secondary w-full sm:w-fit" href="/formations">
            Toutes les formations
          </Link>
        </div>

        <CourseGrid courses={domainCourses} />
      </section>
    </>
  );
}
