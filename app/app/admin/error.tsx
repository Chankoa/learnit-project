"use client";

import { ErrorState } from "@/components/app/ErrorState";

export default function AdminError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="app-page admin-page">
      <ErrorState
        description={error.message || "Une erreur est survenue dans l'administration."}
        onRetry={reset}
        title="Impossible de charger l'administration"
      />
    </div>
  );
}
