"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookOpenCheck,
  ClipboardCheck,
  ExternalLink,
  FileText,
  Library,
  Star
} from "lucide-react";
import { useState, useTransition } from "react";

import { setResourceFavoriteAction } from "@/app/learn/actions";
import { AppEmptyState } from "@/components/app/AppEmptyState";
import { useToast } from "@/components/app/ToastProvider";
import type { LearnerResourceItem } from "@/lib/learning-service";
import type { Resource, ResourceType } from "@/types/resource";

type LearnerResourceGridProps = {
  items: LearnerResourceItem[];
  favoritesOnly: boolean;
};

const resourceTypeLabels: Record<ResourceType, string> = { article: "Article", video: "Vidéo", download: "Téléchargement", template: "Modèle", exercise: "Exercice", link: "Lien", tool: "Outil" };

function getResourceIcon(type: ResourceType) {
  const icons = {
    article: FileText,
    video: Library,
    download: FileText,
    template: Library,
    exercise: BookOpenCheck,
    link: ExternalLink,
    tool: ClipboardCheck
  };

  return icons[type];
}

function ResourceLink({ resource }: { resource: Resource }) {
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
  const [favoriteResourceIds, setFavoriteResourceIds] = useState(() => new Set(items.filter((item) => item.favorite).map((item) => item.resource.id)));
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  function isFavorite(resource: Resource) {
    return favoriteResourceIds.has(resource.id);
  }

  function toggleFavorite(resource: Resource) {
    const nextFavoriteState = !isFavorite(resource);
    setFavoriteResourceIds((ids) => {
      const nextIds = new Set(ids);
      nextFavoriteState ? nextIds.add(resource.id) : nextIds.delete(resource.id);
      return nextIds;
    });
    startTransition(async () => {
      try {
        await setResourceFavoriteAction(resource.id, nextFavoriteState);
        showToast({ description: nextFavoriteState ? "La ressource est enregistrée dans vos favoris." : "La ressource est retirée de vos favoris.", title: nextFavoriteState ? "Ressource ajoutée aux favoris" : "Ressource retirée des favoris", variant: nextFavoriteState ? "success" : "info" });
        router.refresh();
      } catch {
        setFavoriteResourceIds((ids) => {
          const nextIds = new Set(ids);
          nextFavoriteState ? nextIds.delete(resource.id) : nextIds.add(resource.id);
          return nextIds;
        });
        showToast({ description: "La modification n'a pas pu être enregistrée.", title: "Favori non modifié", variant: "danger" });
      }
    });
  }

  const visibleItems = favoritesOnly
    ? items.filter(({ resource }) => isFavorite(resource))
    : items;

  return (
    <section className="learner-resource-grid" aria-label="Ressources accessibles">
      {visibleItems.length > 0 ? (
        visibleItems.map(({ resource, course }) => {
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
                  disabled={isPending}
                  type="button"
                  onClick={() => toggleFavorite(resource)}
                >
                  <Star size={16} aria-hidden="true" />
                  {favorite ? "Favori" : "Ajouter aux favoris"}
                </button>
              </div>
              <div>
                <span>{resourceTypeLabels[resource.type]}</span>
                <h2>{resource.title}</h2>
                <p>{resource.description}</p>
              </div>
              <div className="learner-resource-card__footer">
                <small>{course.title}</small>
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
