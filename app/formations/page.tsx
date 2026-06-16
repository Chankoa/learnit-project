import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Layers3, Search } from "lucide-react";

import { getCourseLessonCount } from "@/components/catalog/CourseCard";
import { CourseCatalog } from "@/components/courses/CourseCatalog";
import { getCatalogCourses } from "@/lib/courses";
import { getAllDomains } from "@/lib/domains";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Catalogue des formations",
  description:
    "Recherchez et filtrez les formations LearnIt par domaine, niveau, format, durée et statut.",
  path: "/formations"
});

export default function FormationsPage() {
  const courses = getCatalogCourses();
  const domains = getAllDomains();
  const totalModules = courses.reduce((total, course) => total + course.modules.length, 0);
  const totalLessons = courses.reduce((total, course) => total + getCourseLessonCount(course), 0);

  return (
    <>
      <section className="section-shell page-hero formations-hero">
        <div className="formations-hero__content">
          <span className="eyebrow w-fit">
            <Search size={14} aria-hidden="true" />
            Catalogue LearnIt
          </span>
          <h1>Trouvez le bon parcours de formation.</h1>
          <p>
            Explorez les formations disponibles, comparez les domaines et affinez rapidement le
            catalogue selon votre niveau, votre format de travail et votre disponibilité.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="btn btn-primary" href="#catalogue">
              Filtrer le catalogue
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link className="btn btn-secondary" href="/#domaines">
              Explorer les domaines
            </Link>
          </div>
        </div>

        <div className="formations-hero__stats" aria-label="Résumé du catalogue">
          <div>
            <strong>{courses.length}</strong>
            <span>formations référencées</span>
          </div>
          <div>
            <Layers3 size={20} aria-hidden="true" />
            <strong>{totalModules}</strong>
            <span>modules structurés</span>
          </div>
          <div>
            <BookOpen size={20} aria-hidden="true" />
            <strong>{totalLessons}</strong>
            <span>leçons disponibles ou prévues</span>
          </div>
        </div>
      </section>

      <CourseCatalog courses={courses} domains={domains} />
    </>
  );
}
