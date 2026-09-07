"use client";

import { ArrowLeft, LogOut, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { AppNavItem } from "@/components/app/AppNavItem";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AppTopbar } from "@/components/app/AppTopbar";
import { RoleSwitcher } from "@/components/app/RoleSwitcher";
import { DemoModeBanner } from "@/components/demo/DemoModeBanner";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { isTeacherAuthoringPath } from "@/lib/teacher-authoring";
import type { ApplicationRole, NavigationItem } from "@/lib/navigation";

type AppShellProps = {
  role: ApplicationRole;
  navigationItems: NavigationItem[];
  children: ReactNode;
  title?: string;
  presentation?: "legacy" | "unified";
};

const defaultTitles: Record<ApplicationRole, string> = {
  visitor: "Accès plateforme",
  learner: "Espace apprenant",
  teacher: "Créer",
  admin: "Administration"
};

export function AppShell({
  role,
  navigationItems,
  children,
  title = defaultTitles[role],
  presentation = "legacy"
}: AppShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDrawerRef = useRef<HTMLElement>(null);
  const isTeacherFocusMode =
    role === "teacher" && isTeacherAuthoringPath(pathname);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(mobileDrawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]') ?? []);
    focusable()[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Tab") {
        const items = focusable();
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
      if (event.key === "Escape") {
        closeMobileMenu();
        mobileMenuButtonRef.current?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      mobileMenuButtonRef.current?.focus();
    };
  }, [isMobileMenuOpen]);

  return (
    <div
      className="app-shell"
      data-focus-mode={isTeacherFocusMode}
      data-role={role}
      data-presentation={presentation}
      data-sidebar-collapsed={isSidebarCollapsed}
    >
      {!isTeacherFocusMode ? (
        <AppSidebar
          isCollapsed={isSidebarCollapsed}
          navigationItems={navigationItems}
          onCollapseToggle={() => setIsSidebarCollapsed((current) => !current)}
          pathname={pathname}
          presentation={presentation}
          role={role}
          title={title}
        />
      ) : null}

      <div className="app-workspace">
        {!isTeacherFocusMode ? (
          <AppTopbar
            isMenuOpen={isMobileMenuOpen}
            menuButtonRef={mobileMenuButtonRef}
            onMenuToggle={() => setIsMobileMenuOpen((current) => !current)}
            presentation={presentation}
            role={role}
            title={title}
          />
        ) : null}

        {!isTeacherFocusMode ? (
          <div className="app-desktop-actions">
            <ThemeToggle />
          </div>
        ) : null}

        {isMobileMenuOpen && !isTeacherFocusMode ? (
          <>
          <div className="journey-nav-overlay" onClick={closeMobileMenu} aria-hidden="true" />
          <aside
            role="dialog"
            aria-modal="true"
            className="app-mobile-drawer"
            id="app-mobile-drawer"
            aria-label="Navigation applicative mobile"
            ref={mobileDrawerRef}
            tabIndex={-1}
          >
            <button type="button" className="btn btn-secondary" onClick={closeMobileMenu}><X size={18} aria-hidden="true" />Fermer la navigation</button>
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
            {presentation === "legacy" ? <RoleSwitcher variant="compact" /> : null}
            {role !== "visitor" ? (
              <Link className="app-mobile-drawer__back" href="/logout" onClick={closeMobileMenu}>
                <LogOut size={16} aria-hidden="true" />
                Déconnexion
              </Link>
            ) : null}
            <Link className="app-mobile-drawer__back" href="/" onClick={closeMobileMenu}>
              <ArrowLeft size={16} aria-hidden="true" />
              Retour au site public
            </Link>
          </aside>
          </>
        ) : null}

        <main className={isTeacherFocusMode ? "app-main app-main--focus" : "app-main"} id="main-content">
          <DemoModeBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
