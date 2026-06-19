"use client";

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
import { useEffect, useMemo, useState } from "react";

import { AppEmptyState } from "@/components/app/AppEmptyState";
import { useToast } from "@/components/app/ToastProvider";
import {
  getFavoriteResourceIds,
  LEARNER_LOCAL_CHANGE_EVENT,
  setResourceFavorite
} from "@/lib/learner-local-storage";
import { learnerResourceTypeLabels } from "@/lib/learner";
import type { LearnerResource, LearnerResourceType } from "@/types/learning";

type LearnerResourceGridItem = {
  resource: LearnerResource;
  courseTitle: string;
};

type LearnerResourceGridProps = {
  items: LearnerResourceGridItem[];
  favoritesOnly: boolean;
};

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

export function LearnerResourceGrid({ items, favoritesOnly }: LearnerResourceGridProps) {
  const [favoriteResourceIds, setFavoriteResourceIds] = useState<string[]>([]);
  const { showToast } = useToast();
  const favoriteResourceSet = useMemo(() => new Set(favoriteResourceIds), [favoriteResourceIds]);

  useEffect(() => {
    function syncFavorites() {
      setFavoriteResourceIds(getFavoriteResourceIds());
    }

    syncFavorites();
    window.addEventListener(LEARNER_LOCAL_CHANGE_EVENT, syncFavorites);
    window.addEventListener("storage", syncFavorites);

    return () => {
      window.removeEventListener(LEARNER_LOCAL_CHANGE_EVENT, syncFavorites);
      window.removeEventListener("storage", syncFavorites);
    };
  }, []);

  function isFavorite(resource: LearnerResource) {
    return resource.favorite || favoriteResourceSet.has(resource.id);
  }

  function toggleFavorite(resource: LearnerResource) {
    const nextFavoriteState = !isFavorite(resource);

    setResourceFavorite(resource.id, nextFavoriteState);
    showToast({
      description: nextFavoriteState
        ? "La ressource apparaît dans le filtre Favoris."
        : "La ressource est retirée de vos favoris locaux.",
      title: nextFavoriteState ? "Ressource ajoutée aux favoris" : "Ressource retirée des favoris",
      variant: nextFavoriteState ? "success" : "info"
    });
  }

  const visibleItems = favoritesOnly
    ? items.filter(({ resource }) => isFavorite(resource))
    : items;

  return (
    <section className="learner-resource-grid" aria-label="Ressources accessibles">
      {visibleItems.length > 0 ? (
        visibleItems.map(({ resource, courseTitle }) => {
          const Icon = getResourceIcon(resource.type);
          const favorite = isFavorite(resource);

          return (
            <article className="learner-resource-card" key={resource.id}>
              <div className="learner-resource-card__header">
                <span className="learning-metric-icon learning-metric-icon--cyan">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <button
                  aria-pressed={favorite}
                  className="learner-favorite-button"
                  data-active={favorite}
                  type="button"
                  onClick={() => toggleFavorite(resource)}
                >
                  <Star size={16} aria-hidden="true" />
                  {favorite ? "Favori" : "Ajouter aux favoris"}
                </button>
              </div>
              <div>
                <span>{learnerResourceTypeLabels[resource.type]}</span>
                <h2>{resource.title}</h2>
                <p>{resource.description}</p>
              </div>
              <div className="learner-resource-card__footer">
                <small>{courseTitle}</small>
                <ResourceLink resource={resource} />
              </div>
            </article>
          );
        })
      ) : (
        <AppEmptyState
          description={
            favoritesOnly
              ? "Marquez des ressources avec l'étoile pour les retrouver ici."
              : "Aucune ressource ne correspond aux filtres sélectionnés."
          }
          icon={Star}
          title={favoritesOnly ? "Aucun favori pour ces filtres" : "Aucun résultat"}
        />
      )}
    </section>
  );
}
