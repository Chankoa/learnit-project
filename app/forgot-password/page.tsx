import type { Metadata } from "next";
import Link from "next/link";

import { requestPasswordResetAction } from "@/app/auth/actions";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";

type ForgotPasswordPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Mot de passe oublié"
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;

  return (
    <main className="auth-page" id="main-content">
      <section className="auth-card" aria-labelledby="forgot-password-title">
        <div className="auth-card__heading">
          <span className="eyebrow w-fit">Compte LearnIt</span>
          <h1 id="forgot-password-title">Mot de passe oublié</h1>
          <p>Saisissez l'adresse email associée à votre compte pour recevoir un lien de réinitialisation.</p>
        </div>

        {params?.error ? <p className="auth-alert" role="alert">{params.error}</p> : null}
        {params?.message ? (
          <p className="auth-alert auth-alert--success" role="status" aria-live="polite">
            {params.message}
          </p>
        ) : null}

        <form action={requestPasswordResetAction} className="auth-form">
          <label>
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <AuthSubmitButton label="Envoyer le lien" pendingLabel="Envoi..." />
        </form>

        <p className="auth-card__footer">
          Vous connaissez votre mot de passe ? <Link href="/login">Se connecter</Link>
        </p>
      </section>
    </main>
  );
}
