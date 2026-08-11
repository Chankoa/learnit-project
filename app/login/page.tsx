import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/LoginForm";
import { ResendConfirmationForm } from "@/components/auth/ResendConfirmationForm";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    confirmationEmail?: string;
    message?: string;
    next?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Connexion"
};

function getSafeNextPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/app";
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
        {params?.message ? (
          <p className="auth-alert auth-alert--success" role="status" aria-live="polite">
            {params.message}
          </p>
        ) : null}

        <LoginForm nextPath={nextPath} />

        <section className="auth-confirmation-panel" aria-labelledby="confirmation-email-title">
          <div>
            <h2 id="confirmation-email-title">
              {params?.confirmationEmail ? "Vous n'avez rien reçu ?" : "Renvoyer un email de confirmation"}
            </h2>
            <p>
              {params?.confirmationEmail
                ? "Demandez un nouvel email de confirmation pour finaliser l'accès à votre compte."
                : "Saisissez l'adresse utilisée lors de l'inscription. Le message reste volontairement neutre."}
            </p>
          </div>
          <ResendConfirmationForm initialEmail={params?.confirmationEmail} nextPath={nextPath} />
        </section>

        <p className="auth-card__footer">
          Pas encore de compte ? <Link href={`/register?next=${encodeURIComponent(nextPath)}`}>Créer un compte</Link>
        </p>
      </section>
    </main>
  );
}
