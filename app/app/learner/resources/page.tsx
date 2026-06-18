import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenCheck,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Library,
  Star
} from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import {
  getCourseForLearnerResource,
  getLearnerResourceCourses,
  getLearnerResources,
  getLearnerResourceTypeOptions,
  learnerResourceTypeLabels,
  type LearnerResourceFilters
} from "@/lib/learner";
import { createPageMetadata } from "@/lib/seo";
import type { LearnerResource, LearnerResourceType } from "@/types/learning";

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

function isResourceType(value?: string): value is LearnerResourceType {
  return Boolean(value && value in learnerResourceTypeLabels);
}

function getResourceIcon(type: LearnerResourceType) {
  const icons = {
    pdf: FileText,
    template: Library,
    exercise: BookOpenCheck,
    "external-link": ExternalLink,
    checklist: ClipboardCheck
  };

  return icons[type];
}

function buildResourceFilterHref(filters: LearnerResourceFilters) {
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

function ResourceLink({ resource }: { resource: LearnerResource }) {
  const content = (
    <>
      Ouvrir
      <ArrowUpRight size={16} aria-hidden="true" />
    </>
  );

  if (resource.href.startsWith("http")) {
    return (
      <a className="text-link" href={resource.href} rel="noreferrer" target="_blank">
        {content}
      </a>
    );
  }

  return (
    <Link className="text-link" href={resource.href}>
      {content}
    </Link>
  );
}

export default async function LearnerResourcesPage({
  searchParams
}: LearnerResourcesPageProps) {
  const params = await searchParams;
  const resourceCourses = getLearnerResourceCourses();
  const typeOptions = getLearnerResourceTypeOptions();
  const courseParam = getSingleParam(params?.course);
  const typeParam = getSingleParam(params?.type);
  const favoritesOnly = getSingleParam(params?.favorites) === "1";
  const selectedCourseId = resourceCourses.some((course) => course.id === courseParam)
    ? courseParam
    : undefined;
  const selectedType = isResourceType(typeParam) ? typeParam : undefined;
  const filters = {
    courseId: selectedCourseId,
    type: selectedType,
    favoritesOnly
  } satisfies LearnerResourceFilters;
  const resources = getLearnerResources(filters);

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

      <section className="learner-resource-grid" aria-label="Ressources accessibles">
        {resources.map((resource) => {
          const Icon = getResourceIcon(resource.type);
          const course = getCourseForLearnerResource(resource);

          return (
            <article className="learner-resource-card" key={resource.id}>
              <div className="learner-resource-card__header">
                <span className="learning-metric-icon learning-metric-icon--cyan">
                  <Icon size={18} aria-hidden="true" />
                </span>
                {resource.favorite ? (
                  <span className="state-badge" data-state="favorite">
                    Favori
                  </span>
                ) : null}
              </div>
              <div>
                <span>{learnerResourceTypeLabels[resource.type]}</span>
                <h2>{resource.title}</h2>
                <p>{resource.description}</p>
              </div>
              <div className="learner-resource-card__footer">
                <small>{course?.title ?? "Formation"}</small>
                <ResourceLink resource={resource} />
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
