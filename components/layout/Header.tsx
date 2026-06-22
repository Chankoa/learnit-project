"use client";

import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LogoMark } from "@/components/ui/LogoMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  isNavigationItemActive,
  platformAccessNavigation,
  publicNavigation
} from "@/lib/navigation";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPlatformMenuOpen, setIsPlatformMenuOpen] = useState(false);
  const pathname = usePathname();

  function closeMenu() {
    setIsMenuOpen(false);
    setIsPlatformMenuOpen(false);
  }

  return (
    <header className="site-header">
      <div className="section-shell flex min-h-[72px] items-center justify-between gap-3">
        <Link href="/" aria-label="Retour à l'accueil LearnIt" onClick={closeMenu}>
          <LogoMark />
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label="Navigation principale">
          {publicNavigation.map((item) => {
            const active = isNavigationItemActive(item, pathname);

            return (
              <Link
                aria-current={active ? "page" : undefined}
                className="nav-link"
                data-active={active}
                href={item.href}
                key={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="platform-menu hidden lg:block">
            <button
              aria-expanded={isPlatformMenuOpen}
              aria-controls="platform-access-menu"
              className="platform-menu__button"
              type="button"
              onClick={() => setIsPlatformMenuOpen((current) => !current)}
            >
              Accès plateforme
              <span>Démo</span>
              <ChevronDown size={15} aria-hidden="true" />
            </button>

            {isPlatformMenuOpen ? (
              <nav
                aria-label="Accès plateforme"
                className="platform-menu__panel"
                id="platform-access-menu"
              >
                <p>Choisir un espace</p>
                {platformAccessNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isNavigationItemActive(item, pathname);

                  return (
                    <Link
                      aria-current={active ? "page" : undefined}
                      data-active={active}
                      href={item.href}
                      key={item.href}
                      onClick={closeMenu}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>{item.label}</span>
                      {item.badge ? <small>{item.badge}</small> : null}
                    </Link>
                  );
                })}
              </nav>
            ) : null}
          </div>

          <ThemeToggle />
          <Link className="btn btn-primary hidden sm:inline-flex" href="/login">
            Se connecter
          </Link>
          <button
            aria-expanded={isMenuOpen}
            aria-controls="site-mobile-nav"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-text-strong transition hover:border-border-strong lg:hidden"
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="site-header__mobile lg:hidden" id="site-mobile-nav">
          <nav className="section-shell flex flex-col gap-1 py-4" aria-label="Navigation mobile">
            {publicNavigation.map((item) => {
              const Icon = item.icon;
              const active = isNavigationItemActive(item, pathname);

              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className="rounded-md px-3 py-3 text-sm font-extrabold text-text-strong transition hover:bg-muted hover:text-accent"
                  data-active={active}
                  href={item.href}
                  key={item.href}
                  onClick={closeMenu}
                >
                  <Icon size={17} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}

            <div className="mobile-platform-menu">
              <p>
                Accès plateforme
                <span>Démo</span>
              </p>
              {platformAccessNavigation.map((item) => {
                const Icon = item.icon;
                const active = isNavigationItemActive(item, pathname);

                return (
                  <Link
                    aria-current={active ? "page" : undefined}
                    className="mobile-platform-menu__link"
                    data-active={active}
                    href={item.href}
                    key={item.href}
                    onClick={closeMenu}
                  >
                    <Icon size={17} aria-hidden="true" />
                    <span>{item.label}</span>
                    {item.badge ? <small>{item.badge}</small> : null}
                  </Link>
                );
              })}
            </div>

            <Link
              className="btn btn-primary mt-3 w-full"
              href="/login"
              onClick={closeMenu}
            >
              Se connecter
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
