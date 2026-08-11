"use client";

import type { ReactNode } from "react";

type TeacherConfirmFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  className?: string;
  message: string;
};

export function TeacherConfirmForm({
  action,
  children,
  className,
  message
}: TeacherConfirmFormProps) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </form>
  );
}
