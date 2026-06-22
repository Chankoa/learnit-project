import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { ApplicationRole } from "@/lib/navigation";

type AppTopbarProps = {
  role: ApplicationRole;
  title: string;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
};

const roleLabels: Record<ApplicationRole, string> = {
  visitor: "Plateforme",
  learner: "Apprenant",
  teacher: "Enseignant",
  admin: "Admin"
};

export function AppTopbar({ role, title, isMenuOpen, onMenuToggle }: AppTopbarProps) {
  return (
    <header className="app-topbar">
      <button
        aria-expanded={isMenuOpen}
        aria-controls="app-mobile-drawer"
        aria-label={isMenuOpen ? "Fermer la navigation" : "Ouvrir la navigation"}
        className="app-topbar__menu"
        type="button"
        onClick={onMenuToggle}
      >
        {isMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
      </button>

      <div className="app-topbar__title">
        <span>{roleLabels[role]}</span>
        <strong>{title}</strong>
      </div>

      <div className="app-topbar__actions">
        <ThemeToggle />
        {role !== "visitor" ? (
          <Link className="app-topbar__public-link" href="/logout">
            <LogOut size={15} aria-hidden="true" />
            Sortir
          </Link>
        ) : null}
        <Link className="app-topbar__public-link" href="/">
          Site public
        </Link>
      </div>
    </header>
  );
}
