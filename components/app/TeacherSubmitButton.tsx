"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

type TeacherSubmitButtonProps = {
  children: ReactNode;
  className?: string;
  pendingLabel: string;
};

export function TeacherSubmitButton({
  children,
  className = "btn btn-primary",
  pendingLabel
}: TeacherSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button aria-disabled={pending} className={className} disabled={pending} type="submit">
      {pending ? <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" /> : null}
      <span>{pending ? pendingLabel : children}</span>
    </button>
  );
}
