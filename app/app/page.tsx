import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { RoleSwitcher } from "@/components/app/RoleSwitcher";
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
    <>
      <section className="section-shell page-hero app-access-hero">
        <div className="app-access-hero__content">
          <span className="eyebrow w-fit">
            <Sparkles size={14} aria-hidden="true" />
            Accès plateforme
          </span>
          <h1>Choisissez l'espace LearnIt à explorer.</h1>
          <p>
            La plateforme distingue clairement les besoins du visiteur, de l'apprenant, de l'enseignant
            et de l'administrateur. Ces accès sont encore des démonstrations en attendant l'authentification.
          </p>
        </div>
      </section>

      <section className="section-shell content-section">
        <div className="app-space-grid">
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
        </div>
      </section>

      <section className="section-shell content-section">
        <RoleSwitcher />
      </section>
    </>
  );
}
