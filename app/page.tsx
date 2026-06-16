import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Clapperboard,
  Code2,
  Compass,
  Layers3,
  PlayCircle,
  Search,
  Sparkles,
  WandSparkles
} from "lucide-react";

import { FeaturedCourse } from "@/components/catalog/FeaturedCourse";
import { formatCourseDuration, getCourseLessonCount } from "@/components/catalog/CourseCard";
import { CourseCatalog } from "@/components/courses/CourseCatalog";
import { getCatalogCourses, getFeaturedCourses } from "@/lib/courses";
import { getAllDomains } from "@/lib/domains";
import type { Course, Domain } from "@/types/course";

export const metadata: Metadata = {
  title: "Formations web et création IA",
  description:
    "Explorez les formations LearnIt en création web, WordPress, AI Filmmaking et Prompt Design."
};

const domainVisuals: Record<string, { image: string; icon: typeof Code2 }> = {
  "creation-web": {
    image: "/images/courses/web-creation-cover.png",
    icon: Code2
  },
  "creation-audiovisuelle-ia": {
    image: "/images/courses/ai-creative-media-cover.png",
    icon: Clapperboard
  }
};

function getTotalLessons(courses: Course[]) {
  return courses.reduce((total, course) => total + getCourseLessonCount(course), 0);
}

function DomainCard({ domain }: { domain: Domain }) {
  const visual = domainVisuals[domain.slug] ?? domainVisuals["creation-web"];
  const Icon = visual.icon;

  return (
    <Link className="domain-card group" href={`/domaines/${domain.slug}`}>
      <div className="domain-card__media">
        <Image alt="" fill sizes="(max-width: 768px) 100vw, 50vw" src={visual.image} />
      </div>
      <div className="domain-card__content">
        <span className="icon-badge">
          <Icon size={19} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-xl font-black text-text-strong">{domain.name}</h3>
          <p className="mt-2 text-sm text-text-muted">{domain.description}</p>
        </div>
        <ArrowRight className="domain-card__arrow" size={20} aria-hidden="true" />
      </div>
    </Link>
  );
}

export default function HomePage() {
  const domains = getAllDomains();
  const catalogCourses = getCatalogCourses();
  const featuredCourses = getFeaturedCourses();
  const featuredCourse = featuredCourses[0] ?? catalogCourses[0];
  const totalModules = catalogCourses.reduce((total, course) => total + course.modules.length, 0);
  const totalLessons = getTotalLessons(catalogCourses);
  const resourceCount = new Set(
    catalogCourses.flatMap((course) => course.resources?.map((resource) => resource.id) ?? [])
  ).size;

  return (
    <>
      <section className="section-shell home-hero" id="accueil">
        <div className="hub-hero">
          <div className="hub-hero__content">
            <span className="eyebrow w-fit">
              <Sparkles size={14} aria-hidden="true" />
              Plateforme multi-parcours
            </span>
            <h1 className="hub-hero__title">
              Apprenez. Créez.
              <span> Faites avancer vos projets.</span>
            </h1>
            <p className="hub-hero__lead">
              Des formations structurées pour développer des compétences concrètes en création web,
              production audiovisuelle IA et workflows créatifs.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn btn-primary" href="#catalogue">
                Explorer les formations
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link className="btn btn-secondary" href="/formations/formation-creation-web">
                <PlayCircle size={17} aria-hidden="true" />
                Accéder à la démo
              </Link>
            </div>

            <div className="hub-stats" aria-label="Chiffres clés du catalogue">
              <div>
                <strong>{catalogCourses.length}</strong>
                <span>formations</span>
              </div>
              <div>
                <strong>{totalModules}</strong>
                <span>modules</span>
              </div>
              <div>
                <strong>{totalLessons}</strong>
                <span>leçons</span>
              </div>
            </div>
          </div>

          <div className="hub-hero__visual">
            <Image
              alt="Interface LearnIt réunissant création web, montage vidéo et outils créatifs"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 52vw"
              src="/images/learnit-hub-hero.png"
            />
            <div className="hub-hero__visual-label">
              <span>Web</span>
              <span>AI Filmmaking</span>
              <span>Prompt Design</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell content-section" id="apropos">
        <div className="section-intro">
          <div>
            <span className="eyebrow w-fit">Une plateforme, plusieurs trajectoires</span>
            <h2>Des parcours pensés pour passer de l’idée au projet.</h2>
          </div>
          <p>
            LearnIt rassemble des programmes progressifs, des exercices pratiques et des ressources
            directement utilisables. Chaque parcours reste autonome tout en partageant la même expérience.
          </p>
        </div>

        <div className="value-grid">
          <article className="value-card">
            <span className="icon-badge">
              <Compass size={19} aria-hidden="true" />
            </span>
            <h3>Choisir clairement</h3>
            <p>Comparez les domaines, les niveaux et les formats sans parcourir des pages dispersées.</p>
          </article>
          <article className="value-card">
            <span className="icon-badge icon-badge--cyan">
              <Layers3 size={19} aria-hidden="true" />
            </span>
            <h3>Progresser par étapes</h3>
            <p>Modules, leçons et objectifs s’enchaînent dans un ordre lisible et orienté pratique.</p>
          </article>
          <article className="value-card">
            <span className="icon-badge icon-badge--pink">
              <WandSparkles size={19} aria-hidden="true" />
            </span>
            <h3>Produire concrètement</h3>
            <p>Chaque formation vise un livrable, une compétence démontrable ou un workflow réutilisable.</p>
          </article>
        </div>
      </section>

      {featuredCourse ? (
        <section className="section-shell content-section" id="mises-en-avant">
          <div className="section-heading-row">
            <div>
              <span className="eyebrow w-fit">Parcours recommandé</span>
              <h2>Commencez par une formation complète.</h2>
            </div>
              <Link className="text-link" href="/formations">
              Voir tout le catalogue
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <FeaturedCourse course={featuredCourse} />
        </section>
      ) : null}

      <section className="section-shell content-section" id="domaines">
        <div className="section-heading-row">
          <div>
            <span className="eyebrow w-fit">Domaines</span>
            <h2>Explorez les familles de compétences.</h2>
            <p>Chaque univers regroupe ses formations, ses ressources et ses prochains parcours.</p>
          </div>
        </div>
        <div className="domain-grid">
          {domains.map((domain) => (
            <DomainCard domain={domain} key={domain.id} />
          ))}
        </div>
      </section>

      <section className="resource-band" id="ressources">
        <div className="section-shell resource-band__inner">
          <div>
            <span className="eyebrow eyebrow--inverse w-fit">Ressources incluses</span>
            <h2>Des supports prêts à utiliser, pas seulement des vidéos.</h2>
            <p>
              Checklists, modèles, exercices et guides accompagnent les formations pour faciliter le
              passage à l’action.
            </p>
          </div>
          <div className="resource-band__stats">
            <div>
              <BookOpen size={21} aria-hidden="true" />
              <strong>{resourceCount}</strong>
              <span>ressources disponibles</span>
            </div>
            <div>
              <Search size={21} aria-hidden="true" />
              <strong>Recherche</strong>
              <span>et filtres instantanés</span>
            </div>
          </div>
        </div>
      </section>

      <CourseCatalog courses={catalogCourses} domains={domains} />
    </>
  );
}
