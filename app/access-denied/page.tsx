import type { Metadata } from "next";
import Link from "next/link";

import { logoutAction } from "@/app/auth/actions";
import { getProfileHomePath, type ProfileRole } from "@/lib/auth/server";
import { isDemoMode } from "@/lib/config/features";

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

const roleLabels: Record<ProfileRole, string> = {
  learner: "Apprenant",
  teacher: "Enseignant",
  admin: "Administrateur"
};

export default async function AccessDeniedPage({ searchParams }: AccessDeniedPageProps) {
  const params = await searchParams;
  const requiredRole = params?.required;
  const currentRole = params?.current;
  const reason = params?.reason;
  const profileRole = currentRole === "learner" || currentRole === "teacher" || currentRole === "admin"
    ? currentRole
    : undefined;

  return (
    <main className="auth-page" id="main-content">
      <section className="auth-card auth-card--wide" aria-labelledby="access-denied-title">
        <div className="auth-card__heading">
          <span className="eyebrow w-fit">Accès refusé</span>
          <h1 id="access-denied-title">Votre compte ne peut pas ouvrir cet espace.</h1>
          <p>
            {profileRole
              ? `Ce compte est configuré comme ${roleLabels[profileRole]}.`
              : isDemoMode
              ? "Les espaces connectés utilisent désormais le rôle réel du profil Supabase. Le sélecteur de rôle local reste disponible uniquement pour la démonstration."
              : "Les espaces connectés utilisent le rôle réel du profil Supabase."}
          </p>
        </div>

        <div className="access-denied-details">
          {reason === "profile" ? <p>Profil introuvable ou inactif pour cette session.</p> : null}
          {requiredRole ? <p>Espace demandé : <strong>{requiredRole}</strong></p> : null}
        </div>

        <div className="auth-actions">
          <Link className="btn btn-primary" href={profileRole ? getProfileHomePath(profileRole) : "/app"}>
            Retourner à mon espace
          </Link>
          <form action={logoutAction}>
            <button className="btn btn-secondary" type="submit">
            Changer de compte
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
