import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { AppShellFrame } from "@/components/app/AppShellFrame";
import { getCurrentProfile, getCurrentUser, getProfileHomePath } from "@/lib/auth/server";
import { isDemoMode } from "@/lib/config/features";
import { applicationSpaces } from "@/lib/navigation";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Accès plateforme",
  description: "Accédez aux espaces LearnIt pour apprenants, enseignants et administrateurs.",
  path: "/app",
  noIndex: true
});

export const dynamic = "force-dynamic";

export default async function AppAccessPage() {
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);

  return (
    <AppShellFrame role="visitor" title="Accès plateforme">
      <div className="app-page">
        <AppBreadcrumb items={[{ label: "Accès plateforme" }]} />
        <AppPageHeader
          eyebrow="Sélection d'espace"
          title="Choisissez l'espace LearnIt à explorer."
          description={
            isDemoMode
              ? "La plateforme distingue les besoins du visiteur, de l'apprenant, de l'enseignant et de l'administrateur. Ces accès restent des démonstrations en attendant l'authentification."
              : user
                ? "Votre espace est déterminé par la configuration de votre compte."
                : "Connectez-vous ou créez un compte pour accéder à votre espace LearnIt."
          }
        />

        {isDemoMode ? (
          <section className="app-space-grid" aria-label="Espaces applicatifs de démonstration">
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
        ) : user && profile ? (
          <section className="learning-panel" aria-label="Mon espace">
            <div className="learning-panel__heading">
              <div>
                <span>Compte connecté</span>
                <h2>Mon espace</h2>
              </div>
            </div>
            <p>Accédez à l'espace associé à votre compte LearnIt.</p>
            <Link className="btn btn-primary" href={getProfileHomePath(profile.role)}>
              Mon espace
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </section>
        ) : user ? (
          <section className="learning-panel" aria-label="Compte à configurer">
            <div className="learning-panel__heading"><div><span>Compte connecté</span><h2>Accès indisponible</h2></div></div>
            <p>Votre compte n'est pas encore configuré pour accéder à un espace LearnIt.</p>
            <Link className="btn btn-secondary" href="/logout">Changer de compte</Link>
          </section>
        ) : (
          <section className="learning-panel" aria-label="Connexion à la plateforme">
            <div className="learning-panel__heading"><div><span>Compte LearnIt</span><h2>Accéder à la plateforme</h2></div></div>
            <p>Connectez-vous avec votre compte existant ou créez-en un pour commencer.</p>
            <div className="auth-actions">
              <Link className="btn btn-primary" href="/login">Se connecter</Link>
              <Link className="btn btn-secondary" href="/register">Créer un compte</Link>
            </div>
          </section>
        )}
      </div>
    </AppShellFrame>
  );
}
