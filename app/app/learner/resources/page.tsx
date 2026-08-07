import type { Metadata } from "next";
import Link from "next/link";
import { Star } from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { LearnerResourceGrid } from "@/components/learning/LearnerResourceGrid";
import { getLearnerResources } from "@/lib/learning-service";
import { createPageMetadata } from "@/lib/seo";
import type { ResourceType } from "@/types/resource";

type ResourcesSearchParams = {
  course?: string | string[];
  type?: string | string[];
  favorites?: string | string[];
};

type LearnerResourcesPageProps = {
  searchParams?: Promise<ResourcesSearchParams>;
};

export const metadata: Metadata = createPageMetadata({
  title: "Ressources apprenant",
  description: "Consultez les PDF, templates, exercices, liens externes et checklists de l'apprenant.",
  path: "/app/learner/resources",
  noIndex: true
});

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

const resourceTypeLabels: Record<ResourceType, string> = { article: "Article", video: "Vidéo", download: "Téléchargement", template: "Modèle", exercise: "Exercice", link: "Lien", tool: "Outil" };

function isResourceType(value?: string): value is ResourceType {
  return Boolean(value && value in resourceTypeLabels);
}

function buildResourceFilterHref(filters: { courseId?: string; type?: ResourceType; favoritesOnly?: boolean }) {
  const params = new URLSearchParams();

  if (filters.courseId) {
    params.set("course", filters.courseId);
  }

  if (filters.type) {
    params.set("type", filters.type);
  }

  if (filters.favoritesOnly) {
    params.set("favorites", "1");
  }

  const query = params.toString();

  return query ? `/app/learner/resources?${query}` : "/app/learner/resources";
}

export default async function LearnerResourcesPage({
  searchParams
}: LearnerResourcesPageProps) {
  const params = await searchParams;
  const allResources = await getLearnerResources();
  const resourceCourses = [...new Map(allResources.map((item) => [item.course.id, item.course])).values()];
  const typeOptions = [...new Set(allResources.map((item) => item.resource.type))].map((value) => ({ value, label: resourceTypeLabels[value] }));
  const courseParam = getSingleParam(params?.course);
  const typeParam = getSingleParam(params?.type);
  const favoritesOnly = getSingleParam(params?.favorites) === "1";
  const selectedCourseId = resourceCourses.some((course) => course.id === courseParam)
    ? courseParam
    : undefined;
  const selectedType = isResourceType(typeParam) ? typeParam : undefined;
  const resourceItems = allResources.filter((item) =>
    (!selectedCourseId || item.course.id === selectedCourseId) &&
    (!selectedType || item.resource.type === selectedType)
  );

  return (
    <div className="app-page learner-page">
      <AppBreadcrumb
        items={[
          { label: "Espace apprenant", href: "/app/learner" },
          { label: "Ressources" }
        ]}
      />

      <AppPageHeader
        eyebrow="Ressources"
        title="Bibliothèque apprenant"
        description="Filtrez les ressources accessibles par formation, type de support et favoris."
      />

      <section className="learner-filter-panel" aria-label="Filtres ressources">
        <div>
          <span>Formation</span>
          <div className="learner-filter-group">
            <Link
              className="learner-filter-chip"
              data-active={!selectedCourseId}
              href={buildResourceFilterHref({
                type: selectedType,
                favoritesOnly
              })}
            >
              Toutes
            </Link>
            {resourceCourses.map((course) => (
              <Link
                className="learner-filter-chip"
                data-active={selectedCourseId === course.id}
                href={buildResourceFilterHref({
                  courseId: course.id,
                  type: selectedType,
                  favoritesOnly
                })}
                key={course.id}
              >
                {course.title}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <span>Type</span>
          <div className="learner-filter-group">
            <Link
              className="learner-filter-chip"
              data-active={!selectedType}
              href={buildResourceFilterHref({
                courseId: selectedCourseId,
                favoritesOnly
              })}
            >
              Tous
            </Link>
            {typeOptions.map((type) => (
              <Link
                className="learner-filter-chip"
                data-active={selectedType === type.value}
                href={buildResourceFilterHref({
                  courseId: selectedCourseId,
                  type: type.value,
                  favoritesOnly
                })}
                key={type.value}
              >
                {type.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <span>Favoris</span>
          <div className="learner-filter-group">
            <Link
              className="learner-filter-chip"
              data-active={!favoritesOnly}
              href={buildResourceFilterHref({
                courseId: selectedCourseId,
                type: selectedType
              })}
            >
              Toutes
            </Link>
            <Link
              className="learner-filter-chip"
              data-active={favoritesOnly}
              href={buildResourceFilterHref({
                courseId: selectedCourseId,
                type: selectedType,
                favoritesOnly: true
              })}
            >
              <Star size={15} aria-hidden="true" />
              Favoris
            </Link>
          </div>
        </div>
      </section>

      <LearnerResourceGrid items={resourceItems} favoritesOnly={favoritesOnly} />
    </div>
  );
}
