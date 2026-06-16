"use client";

import {
  BookOpen,
  CheckSquare2,
  ChevronLeft,
  GraduationCap,
  LayoutDashboard,
  Library,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LogoMark } from "@/components/ui/LogoMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { LearnerProfile } from "@/types/learning";
import type { ReactNode } from "react";

type LearningShellProps = {
  children: ReactNode;
  learner: LearnerProfile;
  pageTitle: string;
  variant?: "default" | "lesson";
};

const learningNavigation = [
  { label: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { label: "Mes formations", href: "/dashboard#mes-formations", icon: GraduationCap },
  { label: "Progression", href: "/dashboard#progression", icon: BookOpen },
  { label: "Ressources", href: "/dashboard#ressources", icon: Library },
  { label: "Livrables", href: "/dashboard#livrables", icon: CheckSquare2 }
];

export function LearningShell({
  children,
  learner,
  pageTitle,
  variant = "default"
}: LearningShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setIsMobileMenuOpen(false);
  }

  return (
    <div className="learning-shell" data-variant={variant}>
      <aside className="learning-sidebar" aria-label="Navigation de l'espace apprenant">
        <Link className="learning-sidebar__brand" href="/" aria-label="Retour à LearnIt">
          <LogoMark tone="inverse" />
        </Link>

        <nav className="learning-sidebar__nav">
          <p>Apprentissage</p>
          {learningNavigation.map((item) => {
            const Icon = item.icon;
            const isActive =
              (item.href === "/dashboard" && pathname === "/dashboard") ||
              (item.label === "Mes formations" && pathname.startsWith("/learn/"));

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
            <span>{learner.initials}</span>
            <div>
              <strong>{learner.displayName}</strong>
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
              <span>Espace apprenant</span>
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
              <span>{learner.initials}</span>
              <div>
                <strong>{learner.firstName}</strong>
                <small>Apprenant</small>
              </div>
            </div>
          </div>
        </header>

        {isMobileMenuOpen ? (
          <nav
            className="learning-mobile-drawer"
            id="learning-mobile-drawer"
            aria-label="Navigation apprenant mobile"
          >
            {learningNavigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                (item.href === "/dashboard" && pathname === "/dashboard") ||
                (item.label === "Mes formations" && pathname.startsWith("/learn/"));

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
            <Link href="/" onClick={closeMobileMenu}>
              <ChevronLeft size={18} aria-hidden="true" />
              Retour au site
            </Link>
          </nav>
        ) : null}

        <main className="learning-main" id="main-content">{children}</main>
      </div>

      <nav className="learning-mobile-nav" aria-label="Navigation apprenant principale">
        {learningNavigation.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const isActive =
            (item.href === "/dashboard" && pathname === "/dashboard") ||
            (item.label === "Mes formations" && pathname.startsWith("/learn/"));

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
