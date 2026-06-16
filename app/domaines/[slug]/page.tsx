import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Clapperboard, Code2, Layers } from "lucide-react";
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
  const isAiDomain = domain.slug === "creation-audiovisuelle-ia";
  const domainImage = isAiDomain
    ? "/images/courses/ai-creative-media-cover.png"
    : "/images/courses/web-creation-cover.png";
  const DomainIcon = isAiDomain ? Clapperboard : Code2;

  return (
    <>
      <section className="section-shell page-hero">
        <Link className="nav-link inline-flex items-center gap-2" href="/#domaines">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour aux domaines
        </Link>

        <div className="domain-hero">
          <div className="domain-hero__content">
            <span className="eyebrow w-fit">
              <DomainIcon size={14} aria-hidden="true" />
              Domaine
            </span>
            <h1>
              {domain.name}
            </h1>
            <p>{domain.description}</p>

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

          <div className="domain-hero__media">
            <Image alt="" fill priority sizes="(max-width: 900px) 100vw, 48vw" src={domainImage} />
          </div>
        </div>

        <div className="domain-stats">
          <div>
            <strong>{domainCourses.length}</strong>
            <span>formations au catalogue</span>
          </div>
          <div>
            <Layers size={19} aria-hidden="true" />
            <strong>{totalModules}</strong>
            <span>modules structurés</span>
          </div>
          <div>
            <BookOpen size={19} aria-hidden="true" />
            <strong>{totalLessons}</strong>
            <span>leçons pour pratiquer</span>
          </div>
        </div>
      </section>

      <section className="section-shell content-section" id="formations-associees">
        <div className="section-heading-row">
          <div>
            <span className="eyebrow w-fit">Formations associées</span>
            <h2>
              Parcours disponibles en {domain.name.toLowerCase()}
            </h2>
            <p>
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
