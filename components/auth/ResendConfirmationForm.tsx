"use client";

import { resendConfirmationAction } from "@/app/auth/actions";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";

type ResendConfirmationFormProps = {
  initialEmail?: string;
  nextPath: string;
};

export function ResendConfirmationForm({ initialEmail, nextPath }: ResendConfirmationFormProps) {
  const hasInitialEmail = Boolean(initialEmail);

  return (
    <form action={resendConfirmationAction} className="auth-resend-form">
      <input name="next" type="hidden" value={nextPath} />

      {hasInitialEmail ? (
        <input name="email" type="hidden" value={initialEmail} readOnly />
      ) : (
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
      )}

      <AuthSubmitButton
        className="btn btn-secondary"
        label="Renvoyer l'email"
        pendingLabel="Envoi..."
      />
    </form>
  );
}
