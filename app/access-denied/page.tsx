import type { Metadata } from "next";
import Link from "next/link";

type AccessDeniedPageProps = {
  searchParams?: Promise<{
    current?: string;
    next?: string;
    reason?: string;
    required?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Accès refusé"
};

export default async function AccessDeniedPage({ searchParams }: AccessDeniedPageProps) {
  const params = await searchParams;
  const requiredRole = params?.required;
  const currentRole = params?.current;
  const reason = params?.reason;

  return (
    <main className="auth-page" id="main-content">
      <section className="auth-card auth-card--wide" aria-labelledby="access-denied-title">
        <div className="auth-card__heading">
          <span className="eyebrow w-fit">Accès refusé</span>
          <h1 id="access-denied-title">Votre compte ne peut pas ouvrir cet espace.</h1>
          <p>
            Les espaces connectés utilisent désormais le rôle réel du profil Supabase. Le sélecteur de
            rôle local reste disponible uniquement pour la démonstration.
          </p>
        </div>

        <div className="access-denied-details">
          {reason === "profile" ? <p>Profil introuvable ou inactif pour cette session.</p> : null}
          {requiredRole ? <p>Rôle requis : <strong>{requiredRole}</strong></p> : null}
          {currentRole ? <p>Rôle actuel : <strong>{currentRole}</strong></p> : null}
        </div>

        <div className="auth-actions">
          <Link className="btn btn-primary" href="/app">
            Retour au dashboard
          </Link>
          <Link className="btn btn-secondary" href="/logout">
            Changer de compte
          </Link>
        </div>
      </section>
    </main>
  );
}
