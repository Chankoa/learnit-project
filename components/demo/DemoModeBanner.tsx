import { Info } from "lucide-react";
import Link from "next/link";

import { isDemoMode } from "@/lib/config/features";

export function DemoModeBanner() {
  if (!isDemoMode) {
    return null;
  }

  return (
    <aside className="demo-mode-banner" aria-label="Information sur le mode démo">
      <Info size={16} aria-hidden="true" />
      <p>
        <strong>Mode démo</strong> — les données sont simulées et stockées localement.
      </p>
      <Link href="/demo">Voir les limites</Link>
    </aside>
  );
}
