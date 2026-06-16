import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { CourseGrid } from "@/components/catalog/CourseGrid";
import type { Course } from "@/types/course";

type CourseRecommendationsProps = {
  relatedCourses: Course[];
  domainCourses: Course[];
  domainName: string;
};

export function CourseRecommendations({
  relatedCourses,
  domainCourses,
  domainName
}: CourseRecommendationsProps) {
  const hasRelatedCourses = relatedCourses.length > 0;
  const hasDomainCourses = domainCourses.length > 0;

  return (
    <section className="section-shell content-section course-recommendations">
      <div className="section-heading-row">
        <div>
          <span className="eyebrow w-fit">Navigation transversale</span>
          <h2>Continuez à explorer les parcours LearnIt.</h2>
          <p>
            Comparez les formations proches, ouvrez les autres parcours du même domaine ou revenez au
            hub catalogue.
          </p>
        </div>
        <Link className="btn btn-secondary w-full sm:w-fit" href="/formations">
          Hub formations
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <div className="recommendation-sections">
        {hasRelatedCourses ? (
          <div className="recommendation-section">
            <div className="recommendation-section__heading">
              <h3>Formations similaires</h3>
              <p>Suggestions basées sur le domaine, le niveau et les tags du parcours.</p>
            </div>
            <CourseGrid courses={relatedCourses} />
          </div>
        ) : null}

        {hasDomainCourses ? (
          <div className="recommendation-section">
            <div className="recommendation-section__heading">
              <h3>Autres formations en {domainName}</h3>
              <p>Parcours rattachés au même domaine de compétences.</p>
            </div>
            <CourseGrid courses={domainCourses} />
          </div>
        ) : null}

        {!hasRelatedCourses && !hasDomainCourses ? (
          <div className="empty-state">
            <h3>Aucune recommandation disponible pour le moment.</h3>
            <p>Le catalogue s’enrichira avec les prochains domaines et parcours.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
