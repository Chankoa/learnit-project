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
  title: "Acces refuse"
};

const roleLabels: Record<ProfileRole, string> = {
  learner: "Apprenant",
  teacher: "Enseignant",
  admin: "Administrateur"
};

const reasonMessages: Record<string, { title: string; detail: string }> = {
  unauthenticated: {
    title: "Connexion requise.",
    detail: "Aucune session active n'a ete trouvee pour ouvrir cet espace."
  },
  profile: {
    title: "Profil introuvable.",
    detail: "La session Supabase existe peut-etre, mais aucun profil applicatif actif n'est associe."
  },
  role: {
    title: "Role insuffisant.",
    detail: "Le role de ce profil ne correspond pas a l'espace demande."
  },
  status: {
    title: "Compte non actif.",
    detail: "Ce compte existe, mais son statut ne permet pas encore d'utiliser la plateforme."
  },
  resource: {
    title: "Ressource interdite.",
    detail: "La ressource demandee n'est pas accessible avec ce compte."
  }
};

function getProfileRole(value?: string): ProfileRole | undefined {
  return value === "learner" || value === "teacher" || value === "admin" ? value : undefined;
}

export default async function AccessDeniedPage({ searchParams }: AccessDeniedPageProps) {
  const params = await searchParams;
  const requiredRole = params?.required;
  const reason = params?.reason ?? "role";
  const reasonMessage = reasonMessages[reason] ?? reasonMessages.role;
  const profileRole = getProfileRole(params?.current);

  return (
    <main className="auth-page" id="main-content">
      <section className="auth-card auth-card--wide" aria-labelledby="access-denied-title">
        <div className="auth-card__heading">
          <span className="eyebrow w-fit">Acces refuse</span>
          <h1 id="access-denied-title">{reasonMessage.title}</h1>
          <p>
            {profileRole
              ? `Ce compte est configure comme ${roleLabels[profileRole]}.`
              : isDemoMode
                ? "Les espaces connectes utilisent le role reel du profil Supabase. Le selecteur local reste limite a la demonstration."
                : "Les espaces connectes utilisent le role reel du profil Supabase."}
          </p>
        </div>

        <div className="access-denied-details">
          <p>{reasonMessage.detail}</p>
          {requiredRole ? (
            <p>
              Espace demande : <strong>{requiredRole}</strong>
            </p>
          ) : null}
        </div>

        <div className="auth-actions">
          {reason !== "unauthenticated" ? (
            <Link className="btn btn-primary" href={profileRole ? getProfileHomePath(profileRole) : "/app"}>
              Retourner a mon espace
            </Link>
          ) : null}
          <Link className="btn btn-secondary" href="/login">
            Se connecter
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
