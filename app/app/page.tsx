import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { AppShellFrame } from "@/components/app/AppShellFrame";
import { applicationSpaces } from "@/lib/navigation";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Accès plateforme",
  description:
    "Choisissez un espace LearnIt de démonstration : apprenant, enseignant ou administration.",
  path: "/app",
  noIndex: true
});

export default function AppAccessPage() {
  return (
    <AppShellFrame role="visitor" title="Accès plateforme">
      <div className="app-page">
        <AppBreadcrumb items={[{ label: "Accès plateforme" }]} />
        <AppPageHeader
          eyebrow="Sélection d'espace"
          title="Choisissez l'espace LearnIt à explorer."
          description="La plateforme distingue les besoins du visiteur, de l'apprenant, de l'enseignant et de l'administrateur. Ces accès restent des démonstrations en attendant l'authentification."
        />

        <section className="app-space-grid" aria-label="Espaces applicatifs disponibles">
          {applicationSpaces.map((space) => {
            const Icon = space.icon;

            return (
              <article className="app-space-card" key={space.role}>
                <span className="icon-badge">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <h2>{space.title}</h2>
                  <p>{space.description}</p>
                </div>
                <ul>
                  {space.highlights.map((highlight) => (
                    <li key={highlight}>
                      <CheckCircle2 size={15} aria-hidden="true" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
                <Link className="btn btn-primary" href={space.href}>
                  Accéder
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </article>
            );
          })}
        </section>
      </div>
    </AppShellFrame>
  );
}
