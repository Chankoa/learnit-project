"use client";

import { ErrorState } from "@/components/app/ErrorState";

export default function LearnerError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="app-page learner-page">
      <ErrorState
        description={error.message || "Une erreur est survenue dans l'espace apprenant."}
        onRetry={reset}
        title="Impossible de charger l'espace apprenant"
      />
    </div>
  );
}
