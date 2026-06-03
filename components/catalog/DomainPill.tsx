import type { ButtonHTMLAttributes } from "react";

type DomainPillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export function DomainPill({ active = false, children, className = "", ...props }: DomainPillProps) {
  return (
    <button
      className={`rounded-md border border-border px-3 py-2 text-sm font-bold text-text-strong transition hover:border-border-strong data-[active=true]:border-accent data-[active=true]:bg-accent data-[active=true]:text-white ${className}`}
      data-active={active}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}
