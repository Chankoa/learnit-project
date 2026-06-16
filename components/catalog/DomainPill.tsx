import type { ButtonHTMLAttributes } from "react";

type DomainPillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function DomainPill({ active = false, children, className = "", ...props }: DomainPillProps) {
  return (
    <button
      aria-pressed={active}
      className={`filter-pill ${className}`}
      data-active={active}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
