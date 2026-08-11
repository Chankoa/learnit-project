"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

type AuthSubmitButtonProps = {
  className?: string;
  label: string;
  pendingLabel: string;
};

export function AuthSubmitButton({
  className = "btn btn-primary",
  label,
  pendingLabel
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button aria-disabled={pending} className={className} disabled={pending} type="submit">
      {pending ? <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" /> : null}
      <span>{pending ? pendingLabel : label}</span>
    </button>
  );
}
