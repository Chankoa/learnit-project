"use client";

import {
  ChevronLeft,
  Menu,
  PanelLeft,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { LogoMark } from "@/components/ui/LogoMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { isNavigationItemActive, learnerNavigation } from "@/lib/navigation";
import type { LearnerProfile } from "@/types/learning";
import type { ReactNode } from "react";

type LearningShellProps = {
  children: ReactNode;
  learner: LearnerProfile;
  identity?: {
    name: string;
    initials: string;
    avatarUrl?: string;
  };
  headerActions?: ReactNode;
  mobileDrawerContent?: ReactNode;
  pageTitle: string;
  variant?: "default" | "lesson";
  workspaceContext?: {
    homeHref: string;
    homeLabel: string;
    relationLabel?: string;
  };
};

export function LearningShell({
  children,
  learner,
  identity,
  headerActions,
  mobileDrawerContent,
  pageTitle,
  variant = "default",
  workspaceContext
}: LearningShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
    requestAnimationFrame(() => mobileMenuButtonRef.current?.focus());
  }

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileMenu();
        return;
      }

      if (event.key !== "Tab" || !drawerRef.current) {
        return;
      }

      const focusable = Array.from(
        drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable.at(-1);

      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className={`learning-shell${workspaceContext ? " learning-shell--unified" : ""}`} data-variant={variant}>
      <aside className="learning-sidebar" aria-label="Navigation LearnIt">
        <Link className="learning-sidebar__brand" href="/" aria-label="Retour à LearnIt">
          <LogoMark tone="inverse" />
        </Link>

        <nav className="learning-sidebar__nav">
          <p>Apprentissage</p>
          {learnerNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = isNavigationItemActive(item, pathname);

            return (
              <Link aria-current={isActive ? "page" : undefined} data-active={isActive} href={item.href} key={item.label}>
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="learning-sidebar__footer">
          <Link href="/">
            <ChevronLeft size={17} aria-hidden="true" />
            Retour au site
          </Link>
          <div className="learning-profile learning-profile--sidebar">
            <span>{identity?.avatarUrl ? <img alt="" src={identity.avatarUrl} /> : identity?.initials ?? learner.initials}</span>
            <div>
              <strong>{identity?.name ?? learner.displayName}</strong>
              <small>Compte apprenant</small>
            </div>
          </div>
        </div>
      </aside>

      <div className="learning-workspace">
        <header className="learning-header">
          <div className="learning-header__title">
            {variant === "lesson" ? (
              <>
                <Link className="learning-context-return" href={workspaceContext?.homeHref ?? "/app/learner"}>
                  <ChevronLeft size={18} aria-hidden="true" />
                  {workspaceContext ? `Retour à ${workspaceContext.homeLabel}` : "Retour au tableau de bord"}
                </Link>
                <button
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="learning-mobile-drawer"
                  aria-label={isMobileMenuOpen ? "Fermer le parcours" : "Ouvrir le parcours"}
                  className="btn btn-secondary learning-context-button"
                  ref={mobileMenuButtonRef}
                  title={isMobileMenuOpen ? "Fermer le parcours" : "Ouvrir le parcours"}
                  type="button"
                  onClick={() => {
                    if (isMobileMenuOpen) {
                      closeMobileMenu();
                      return;
                    }

                    setIsMobileMenuOpen(true);
                  }}
                >
                  {isMobileMenuOpen ? <X size={17} aria-hidden="true" /> : <PanelLeft size={17} aria-hidden="true" />}
                </button>
              </>
            ) : (
              <button
                aria-expanded={isMobileMenuOpen}
                aria-controls="learning-mobile-drawer"
                aria-label={isMobileMenuOpen ? "Fermer la navigation" : "Ouvrir la navigation"}
                className="learning-menu-button"
                type="button"
                onClick={() => setIsMobileMenuOpen((current) => !current)}
              >
                {isMobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
              </button>
            )}
            <div>
              <Link className="learning-header__home-link" href={workspaceContext?.homeHref ?? "/app/learner"}>
                {workspaceContext?.homeLabel ?? "Espace apprenant"}
              </Link>
              {variant === "lesson" ? (
                <p className="learning-header__page-title">{pageTitle}</p>
              ) : (
                <h1>{pageTitle}</h1>
              )}
            </div>
          </div>

          <div className="learning-header__actions">
            {headerActions}
            <ThemeToggle />
            <div className="learning-profile">
              <span>{identity?.avatarUrl ? <img alt="" src={identity.avatarUrl} /> : identity?.initials ?? learner.initials}</span>
              <div>
                <strong>{identity?.name ?? learner.firstName}</strong>
                <small>{workspaceContext?.relationLabel ?? "Apprenant"}</small>
              </div>
            </div>
          </div>
        </header>

        {isMobileMenuOpen ? (
          <div className="learning-mobile-drawer-overlay" onClick={closeMobileMenu}>
            <nav
              aria-label="Navigation apprenant mobile"
              className="learning-mobile-drawer"
              id="learning-mobile-drawer"
              onClick={(event) => event.stopPropagation()}
              ref={drawerRef}
              tabIndex={-1}
            >
              <div className="learning-mobile-drawer__heading">
                <strong>{variant === "lesson" ? "Parcours" : "Navigation"}</strong>
                <button aria-label="Fermer la navigation" onClick={closeMobileMenu} type="button">
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              {workspaceContext ? null : learnerNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = isNavigationItemActive(item, pathname);

                return (
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    data-active={isActive}
                    href={item.href}
                    key={item.label}
                    onClick={closeMobileMenu}
                  >
                    <Icon size={18} aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
              {mobileDrawerContent ? <div className="learning-mobile-drawer__context">{mobileDrawerContent}</div> : null}
              <Link href={workspaceContext?.homeHref ?? "/"} onClick={closeMobileMenu}>
                <ChevronLeft size={18} aria-hidden="true" />
                {workspaceContext ? workspaceContext.homeLabel : "Retour au site"}
              </Link>
            </nav>
          </div>
        ) : null}

        <main className="learning-main" id="main-content">{children}</main>
      </div>

      {!workspaceContext ? <nav className="learning-mobile-nav" aria-label="Navigation apprenant principale">
        {learnerNavigation.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive = isNavigationItemActive(item, pathname);

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              data-active={isActive}
              href={item.href}
              key={item.label}
            >
              <Icon size={19} aria-hidden="true" />
              <span>{item.label.replace("Tableau de bord", "Accueil").replace("Mes apprentissages", "Apprentissages")}</span>
            </Link>
          );
        })}
      </nav> : null}
    </div>
  );
}
