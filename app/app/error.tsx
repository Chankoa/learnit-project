"use client";

import { ErrorState } from "@/components/app/ErrorState";
import { AppShellFrame } from "@/components/app/AppShellFrame";

export default function AppError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppShellFrame role="visitor" title="Accès plateforme">
      <ErrorState
        description={error.message || "Une erreur est survenue dans l'espace app."}
        onRetry={reset}
      />
    </AppShellFrame>
  );
}
