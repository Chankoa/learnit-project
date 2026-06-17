"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import { AppNavItem } from "@/components/app/AppNavItem";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppTopbar } from "@/components/app/AppTopbar";
import { RoleSwitcher } from "@/components/app/RoleSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { ApplicationRole, NavigationItem } from "@/lib/navigation";

type AppShellProps = {
  role: ApplicationRole;
  navigationItems: NavigationItem[];
  children: ReactNode;
  title?: string;
};

const defaultTitles: Record<ApplicationRole, string> = {
  visitor: "Accès plateforme",
  learner: "Espace apprenant",
  teacher: "Espace enseignant",
  admin: "Administration"
};

export function AppShell({
  role,
  navigationItems,
  children,
  title = defaultTitles[role]
}: AppShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  return (
    <div className="app-shell" data-role={role}>
      <AppSidebar navigationItems={navigationItems} pathname={pathname} role={role} title={title} />

      <div className="app-workspace">
        <AppTopbar
          isMenuOpen={isMobileMenuOpen}
          onMenuToggle={() => setIsMobileMenuOpen((current) => !current)}
          role={role}
          title={title}
        />

        <div className="app-desktop-actions">
          <ThemeToggle />
        </div>

        {isMobileMenuOpen ? (
          <aside
            className="app-mobile-drawer"
            id="app-mobile-drawer"
            aria-label="Navigation applicative mobile"
          >
            <nav>
              {navigationItems.map((item) => (
                <AppNavItem
                  item={item}
                  key={`${item.role}-${item.label}`}
                  onNavigate={closeMobileMenu}
                  pathname={pathname}
                />
              ))}
            </nav>
            <RoleSwitcher variant="compact" />
            <Link className="app-mobile-drawer__back" href="/" onClick={closeMobileMenu}>
              <ArrowLeft size={16} aria-hidden="true" />
              Retour au site public
            </Link>
          </aside>
        ) : null}

        <main className="app-main" id="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
