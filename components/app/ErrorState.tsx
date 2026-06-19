"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

type ErrorStateProps = {
  actionLabel?: string;
  description?: string;
  onRetry?: () => void;
  title?: string;
};

export function ErrorState({
  actionLabel = "Réessayer",
  description = "Une erreur temporaire empêche l'affichage de cette page.",
  onRetry,
  title = "Impossible de charger cet espace"
}: ErrorStateProps) {
  return (
    <section className="app-error-state" role="alert">
      <span className="app-error-state__icon">
        <AlertTriangle size={24} aria-hidden="true" />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {onRetry ? (
        <button className="btn btn-secondary" type="button" onClick={onRetry}>
          <RotateCcw size={17} aria-hidden="true" />
          {actionLabel}
        </button>
      ) : null}
    </section>
  );
}
