"use client";

import { ErrorState } from "@/components/app/ErrorState";

export default function TeacherError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="app-page teacher-page">
      <ErrorState
        description={error.message || "Une erreur est survenue dans l'espace enseignant."}
        onRetry={reset}
        title="Impossible de charger l'espace enseignant"
      />
    </div>
  );
}
