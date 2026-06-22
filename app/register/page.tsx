import type { Metadata } from "next";
import Link from "next/link";

import { registerAction } from "@/app/auth/actions";

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Créer un compte"
};

function getSafeNextPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/app/learner";
  }

  return value;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params?.next);

  return (
    <main className="auth-page" id="main-content">
      <section className="auth-card" aria-labelledby="register-title">
        <div className="auth-card__heading">
          <span className="eyebrow w-fit">Compte LearnIt</span>
          <h1 id="register-title">Créer un compte</h1>
          <p>Un profil sera créé dans Supabase et rattaché à votre compte d'authentification.</p>
        </div>

        {params?.error ? <p className="auth-alert" role="alert">{params.error}</p> : null}

        <form action={registerAction} className="auth-form">
          <input name="next" type="hidden" value={nextPath} />
          <label>
            <span>Nom complet</span>
            <input name="name" type="text" autoComplete="name" required />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            <span>Mot de passe</span>
            <input name="password" type="password" autoComplete="new-password" minLength={8} required />
          </label>
          <label>
            <span>Rôle demandé</span>
            <select name="role" defaultValue="learner">
              <option value="learner">Apprenant</option>
              <option value="teacher">Enseignant</option>
            </select>
          </label>
          <button className="btn btn-primary" type="submit">
            Créer le compte
          </button>
        </form>

        <p className="auth-card__footer">
          Déjà inscrit ? <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>Se connecter</Link>
        </p>
      </section>
    </main>
  );
}
