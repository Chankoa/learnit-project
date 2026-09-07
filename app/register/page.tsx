import { getSafeNextPath } from "@/lib/auth/redirects";

import type { Metadata } from "next";
import Link from "next/link";

import { registerAction } from "@/app/auth/actions";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";

type RegisterPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Créer un compte"
};


export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params?.next);

  return (
    <main className="auth-page" id="main-content">
      <section className="auth-card" aria-labelledby="register-title">
        <div className="auth-card__heading">
          <span className="eyebrow w-fit">Compte LearnIt</span>
          <h1 id="register-title">Créer un compte</h1>
          <p>Votre compte LearnIt pour apprendre et créer des parcours.</p>
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
          <AuthSubmitButton label="Créer le compte" pendingLabel="Création..." />
        </form>

        <p className="auth-card__footer">
          Déjà inscrit ? <Link href={`/login?next=${encodeURIComponent(nextPath)}`}>Se connecter</Link>
        </p>
      </section>
    </main>
  );
}
