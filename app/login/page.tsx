import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/LoginForm";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
    next?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Connexion"
};

function getSafeNextPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/app/learner";
  }

  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(params?.next);

  return (
    <main className="auth-page" id="main-content">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-card__heading">
          <span className="eyebrow w-fit">Compte LearnIt</span>
          <h1 id="login-title">Connexion</h1>
          <p>Connectez-vous pour accéder à votre espace apprenant, enseignant ou admin.</p>
        </div>

        {params?.error ? <p className="auth-alert" role="alert">{params.error}</p> : null}
        {params?.message ? <p className="auth-alert auth-alert--success">{params.message}</p> : null}

        <LoginForm nextPath={nextPath} />

        <p className="auth-card__footer">
          Pas encore de compte ? <Link href={`/register?next=${encodeURIComponent(nextPath)}`}>Créer un compte</Link>
        </p>
      </section>
    </main>
  );
}
