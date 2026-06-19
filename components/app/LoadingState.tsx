import { Loader2 } from "lucide-react";

import { SkeletonCard } from "@/components/app/SkeletonCard";
import { SkeletonTable } from "@/components/app/SkeletonTable";

type LoadingStateProps = {
  description?: string;
  title?: string;
  variant?: "cards" | "dashboard" | "table";
};

export function LoadingState({
  description = "Les données de démonstration sont en cours de préparation.",
  title = "Chargement",
  variant = "dashboard"
}: LoadingStateProps) {
  return (
    <section className="app-loading-state" role="status" aria-live="polite">
      <div className="app-loading-state__heading">
        <span className="app-loading-state__icon">
          <Loader2 size={20} aria-hidden="true" />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>

      {variant === "table" ? (
        <SkeletonTable columns={6} rows={5} />
      ) : (
        <div className="app-loading-state__grid" data-variant={variant}>
          {Array.from({ length: variant === "dashboard" ? 6 : 3 }).map((_, index) => (
            <SkeletonCard
              action={index % 2 === 0}
              key={`loading-card-${index}`}
              lines={index % 2 === 0 ? 3 : 2}
              media={variant === "cards"}
            />
          ))}
          {variant === "dashboard" ? <SkeletonTable columns={5} rows={4} /> : null}
        </div>
      )}
    </section>
  );
}
