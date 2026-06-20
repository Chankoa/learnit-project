import { Info } from "lucide-react";
import Link from "next/link";

export function DemoModeBanner() {
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
