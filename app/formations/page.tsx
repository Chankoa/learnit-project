import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Clock, Layers, Sparkles } from "lucide-react";

import { FeaturedCourse } from "@/components/catalog/FeaturedCourse";
import {
  formatCourseDuration,
  getCourseLessonCount
} from "@/components/catalog/CourseCard";
import { CourseCatalog } from "@/components/courses/CourseCatalog";
import { getAllDomains } from "@/lib/domains";
import { getCatalogCourses, getFeaturedCourses } from "@/lib/courses";
import type { Course } from "@/types/course";

export const metadata: Metadata = {
  title: "Formations",
  description: "Explorez les formations LearnIt par domaine, niveau et recherche simple."
};

function getTotalLessons(courses: Course[]) {
  return courses.reduce((total, course) => total + getCourseLessonCount(course), 0);
}

export default function FormationsPage() {
  const domains = getAllDomains();
  const catalogCourses = getCatalogCourses();
  const featuredCourses = getFeaturedCourses();
  const totalLessons = getTotalLessons(catalogCourses);
  const totalModules = catalogCourses.reduce((total, course) => total + course.modules.length, 0);
  const featuredCourse = featuredCourses[0] ?? catalogCourses[0];
  const resourceCount = new Set(
    catalogCourses.flatMap((course) => course.resources?.map((resource) => resource.id) ?? [])
  ).size;

  return (
    <>
      <section className="section-shell py-10 md:py-14" id="demo">
        <div className="hero-card grid gap-8 p-5 md:grid-cols-[1fr_0.75fr] md:p-10">
          <div className="flex flex-col justify-center">
            <span className="eyebrow w-fit">
              <Sparkles size={14} aria-hidden="true" />
              Hub formations
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight text-text-strong md:text-[3.25rem]">
              Choisissez votre parcours LearnIt.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-text-muted md:text-lg">
              Retrouvez les formations disponibles, comparez les domaines et filtrez les parcours selon votre niveau.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="metric-card p-4">
                <strong className="block text-2xl text-text-strong">{catalogCourses.length}</strong>
                <span className="text-sm text-text-muted">formations au catalogue</span>
              </div>
              <div className="metric-card p-4">
                <strong className="block text-2xl text-text-strong">{totalModules}</strong>
                <span className="text-sm text-text-muted">modules structurés</span>
              </div>
              <div className="metric-card p-4">
                <strong className="block text-2xl text-text-strong">{totalLessons}</strong>
                <span className="text-sm text-text-muted">leçons disponibles</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn btn-primary" href="#formations">
                Explorer les formations
              </Link>
              <Link className="btn btn-secondary" href="#domaines">
                Voir les domaines
              </Link>
            </div>
          </div>

          {featuredCourse ? (
            <aside className="lesson-card flex flex-col justify-between p-5">
              <div>
                <p className="text-sm font-extrabold text-accent">Démo recommandée</p>
                <h2 className="mt-3 text-2xl font-black text-text-strong">{featuredCourse.title}</h2>
                <p className="mt-3 text-sm text-text-muted">{featuredCourse.description}</p>
              </div>
              <div className="mt-6 grid gap-3 text-sm text-text-muted">
                <span className="flex items-center gap-2">
                  <Layers size={16} aria-hidden="true" />
                  {featuredCourse.modules.length} module{featuredCourse.modules.length > 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-2">
                  <BookOpen size={16} aria-hidden="true" />
                  {getCourseLessonCount(featuredCourse)} leçons
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={16} aria-hidden="true" />
                  {formatCourseDuration(featuredCourse.durationMinutes)}
                </span>
              </div>
            </aside>
          ) : null}
        </div>
      </section>

      <section className="section-shell py-8" id="ressources">
        <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <span className="eyebrow w-fit">Introduction</span>
            <h2 className="mt-4 text-2xl font-black text-text-strong md:text-3xl">
              Des parcours pensés pour passer de l'idée au projet.
            </h2>
          </div>
          <p className="text-sm text-text-muted md:text-base">
            Chaque formation combine objectifs clairs, modules progressifs, leçons pratiques et ressources
            téléchargeables. Le hub vous aide à trouver rapidement le bon point de départ.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="profile-card p-5">
            <strong className="text-lg text-text-strong">{domains.length} domaines</strong>
            <p className="mt-2 text-sm text-text-muted">Des univers de formation séparés pour mieux choisir.</p>
          </div>
          <div className="profile-card p-5">
            <strong className="text-lg text-text-strong">{resourceCount} ressources</strong>
            <p className="mt-2 text-sm text-text-muted">Templates, exercices et supports pour pratiquer.</p>
          </div>
          <div className="profile-card p-5">
            <strong className="text-lg text-text-strong">Recherche client</strong>
            <p className="mt-2 text-sm text-text-muted">Filtrage instantané sans quitter la page.</p>
          </div>
        </div>
      </section>

      <section className="section-shell py-8" id="mises-en-avant">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow w-fit">Mises en avant</span>
            <h2 className="mt-4 text-2xl font-black text-text-strong md:text-3xl">
              Formations recommandées
            </h2>
          </div>
          <Link className="nav-link" href="#formations">
            Voir tout le catalogue
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {featuredCourses.map((course) => (
            <FeaturedCourse course={course} key={course.id} />
          ))}
        </div>
      </section>

      <section className="section-shell py-8" id="domaines">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow mx-auto w-fit">Domaines</span>
          <h2 className="mt-4 text-2xl font-black text-text-strong md:text-3xl">
            Explorez les familles de compétences.
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Les filtres du catalogue utilisent ces domaines pour isoler rapidement les parcours pertinents.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {domains.map((domain) => (
            <Link
              className="profile-card block p-5 transition hover:border-border-strong hover:shadow-sm"
              href={`/domaines/${domain.slug}`}
              key={domain.id}
            >
              <h3 className="text-lg font-black text-text-strong">{domain.name}</h3>
              <p className="mt-2 text-sm text-text-muted">{domain.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <CourseCatalog courses={catalogCourses} domains={domains} />
    </>
  );
}
