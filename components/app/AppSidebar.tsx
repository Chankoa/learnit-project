import Link from "next/link";
import { ArrowLeft, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { AppNavItem } from "@/components/app/AppNavItem";
import { RoleSwitcher } from "@/components/app/RoleSwitcher";
import { LogoMark } from "@/components/ui/LogoMark";
import type { ApplicationRole, NavigationItem } from "@/lib/navigation";

type AppSidebarProps = {
  role: ApplicationRole;
  title: string;
  navigationItems: NavigationItem[];
  pathname: string;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
};

const roleLabels: Record<ApplicationRole, string> = {
  visitor: "Sélection",
  learner: "Apprenant",
  teacher: "Créateur",
  admin: "Admin"
};

export function AppSidebar({
  role,
  title,
  navigationItems,
  pathname,
  isCollapsed,
  onCollapseToggle
}: AppSidebarProps) {
  return (
    <aside className="app-sidebar" aria-label={`Navigation ${roleLabels[role].toLowerCase()}`}>
      <div className="app-sidebar__topline">
        <Link className="app-sidebar__brand" href="/" aria-label="Retour à LearnIt" title="Retour à LearnIt">
        <LogoMark tone="inverse" />
        </Link>
        <button
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Développer la navigation" : "Réduire la navigation"}
          className="app-sidebar__collapse"
          onClick={onCollapseToggle}
          title={isCollapsed ? "Développer la navigation" : "Réduire la navigation"}
          type="button"
        >
          {isCollapsed ? <PanelLeftOpen size={18} aria-hidden="true" /> : <PanelLeftClose size={18} aria-hidden="true" />}
        </button>
      </div>

      <div className="app-sidebar__context">
        <span>{roleLabels[role]}</span>
        <strong>{title}</strong>
      </div>

      <nav className="app-sidebar__nav" aria-label="Navigation de l'espace">
        {navigationItems.map((item) => (
          <AppNavItem item={item} key={`${item.role}-${item.label}`} pathname={pathname} />
        ))}
      </nav>

      <div className="app-sidebar__tools">
        <RoleSwitcher variant="compact" />
        {role !== "visitor" ? (
          <Link className="app-sidebar__back" href="/logout" title="Déconnexion">
            <LogOut size={16} aria-hidden="true" />
            Déconnexion
          </Link>
        ) : null}
        <Link className="app-sidebar__back" href="/" title="Retour au site public">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour au site public
        </Link>
      </div>
    </aside>
  );
}
