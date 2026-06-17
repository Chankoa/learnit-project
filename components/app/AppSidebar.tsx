import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppNavItem } from "@/components/app/AppNavItem";
import { RoleSwitcher } from "@/components/app/RoleSwitcher";
import { LogoMark } from "@/components/ui/LogoMark";
import type { ApplicationRole, NavigationItem } from "@/lib/navigation";

type AppSidebarProps = {
  role: ApplicationRole;
  title: string;
  navigationItems: NavigationItem[];
  pathname: string;
};

const roleLabels: Record<ApplicationRole, string> = {
  visitor: "Sélection",
  learner: "Apprenant",
  teacher: "Enseignant",
  admin: "Admin"
};

export function AppSidebar({ role, title, navigationItems, pathname }: AppSidebarProps) {
  return (
    <aside className="app-sidebar" aria-label={`Navigation ${roleLabels[role].toLowerCase()}`}>
      <Link className="app-sidebar__brand" href="/" aria-label="Retour à LearnIt">
        <LogoMark tone="inverse" />
      </Link>

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
        <Link className="app-sidebar__back" href="/">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour au site public
        </Link>
      </div>
    </aside>
  );
}
