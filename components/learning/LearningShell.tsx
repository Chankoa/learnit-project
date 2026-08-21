"use client";

import {
  ChevronLeft,
  Menu,
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
  mobileDrawerContent?: ReactNode;
  pageTitle: string;
  variant?: "default" | "lesson";
};

export function LearningShell({
  children,
  learner,
  identity,
  mobileDrawerContent,
  pageTitle,
  variant = "default"
}: LearningShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLElement>(null);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
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
        closeMobileMenu();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="learning-shell" data-variant={variant}>
      <aside className="learning-sidebar" aria-label="Navigation de l'espace apprenant">
        <Link className="learning-sidebar__brand" href="/" aria-label="Retour à LearnIt">
          <LogoMark tone="inverse" />
        </Link>

        <nav className="learning-sidebar__nav">
          <p>Apprentissage</p>
          {learnerNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = isNavigationItemActive(item, pathname);

            return (
              <Link data-active={isActive} href={item.href} key={item.label}>
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
            <div>
              <Link className="learning-header__home-link" href="/app/learner">
                Espace apprenant
              </Link>
              {variant === "lesson" ? (
                <p className="learning-header__page-title">{pageTitle}</p>
              ) : (
                <h1>{pageTitle}</h1>
              )}
            </div>
          </div>

          <div className="learning-header__actions">
            <ThemeToggle />
            <div className="learning-profile">
              <span>{identity?.avatarUrl ? <img alt="" src={identity.avatarUrl} /> : identity?.initials ?? learner.initials}</span>
              <div>
                <strong>{identity?.name ?? learner.firstName}</strong>
                <small>Apprenant</small>
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
                <strong>Navigation</strong>
                <button aria-label="Fermer la navigation" onClick={closeMobileMenu} type="button">
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
              {learnerNavigation.map((item) => {
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
              <Link href="/" onClick={closeMobileMenu}>
                <ChevronLeft size={18} aria-hidden="true" />
                Retour au site
              </Link>
            </nav>
          </div>
        ) : null}

        <main className="learning-main" id="main-content">{children}</main>
      </div>

      <nav className="learning-mobile-nav" aria-label="Navigation apprenant principale">
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
              <span>{item.label.replace("Tableau de bord", "Accueil").replace("Mes formations", "Formations")}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
