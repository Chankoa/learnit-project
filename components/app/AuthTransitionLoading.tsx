import { Loader2 } from "lucide-react";

import { LogoMark } from "@/components/ui/LogoMark";

export function AuthTransitionLoading() {
  return (
    <main className="auth-transition-loading" id="main-content">
      <div className="auth-transition-loading__panel" role="status" aria-live="polite">
        <LogoMark />
        <span className="auth-transition-loading__spinner">
          <Loader2 size={22} aria-hidden="true" />
        </span>
        <p>Chargement de votre espace...</p>
      </div>
    </main>
  );
}
