import type { Metadata } from "next";
import Link from "next/link";

import { resetPasswordAction } from "@/app/auth/actions";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { createOptionalClient, isSupabaseConfigured } from "@/lib/supabase/server";

type ResetPasswordPageProps = {
  searchParams?: Promise<{
    error?: string;
    message?: string;
  }>;
};

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Nouveau mot de passe"
};

async function hasRecoverySession() {
  if (!isSupabaseConfigured()) {
    return false;
  }

  const supabase = await createOptionalClient();

  if (!supabase) {
    return false;
  }

  const { data, error } = await supabase.auth.getUser();

  return !error && Boolean(data.user);
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const [params, canResetPassword] = await Promise.all([searchParams, hasRecoverySession()]);

  return (
    <main className="auth-page" id="main-content">
      <section className="auth-card" aria-labelledby="reset-password-title">
        <div className="auth-card__heading">
          <span className="eyebrow w-fit">Compte LearnIt</span>
          <h1 id="reset-password-title">Nouveau mot de passe</h1>
          <p>Choisissez un nouveau mot de passe pour votre compte LearnIt.</p>
        </div>

        {params?.error ? <p className="auth-alert" role="alert">{params.error}</p> : null}
        {params?.message ? (
          <p className="auth-alert auth-alert--success" role="status" aria-live="polite">
            {params.message}
          </p>
        ) : null}

        {canResetPassword ? (
          <form action={resetPasswordAction} className="auth-form">
            <label>
              <span>Nouveau mot de passe</span>
              <input name="password" type="password" autoComplete="new-password" minLength={8} required />
            </label>
            <label>
              <span>Confirmer le mot de passe</span>
              <input
                name="passwordConfirmation"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            <AuthSubmitButton label="Mettre à jour le mot de passe" pendingLabel="Enregistrement..." />
          </form>
        ) : (
          <div className="auth-recovery-state" role="status">
            <strong>Lien invalide ou expiré</strong>
            <p>Demandez un nouvel email de réinitialisation pour continuer.</p>
            <div className="auth-actions">
              <Link className="btn btn-primary" href="/forgot-password">
                Renvoyer un lien
              </Link>
              <Link className="btn btn-secondary" href="/login">
                Se connecter
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
