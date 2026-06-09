"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LogoMark } from "@/components/ui/LogoMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getSiteConfig } from "@/lib/site";

const siteConfig = getSiteConfig();

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function isActive(label: string) {
    if (label === "Formations") {
      return pathname === "/" || pathname.startsWith("/formations");
    }

    if (label === "Domaines") {
      return pathname.startsWith("/domaines");
    }

    return false;
  }

  return (
    <header className="site-header">
      <div className="section-shell flex min-h-[72px] items-center justify-between gap-3">
        <Link href="/" aria-label="Retour à l'accueil LearnIt" onClick={closeMenu}>
          <LogoMark />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
          {siteConfig.nav.map((item) => (
            <Link className="nav-link" data-active={isActive(item.label)} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link className="btn btn-primary hidden sm:inline-flex" href="/formations/formation-creation-web">
            Accéder à la démo
          </Link>
          <button
            aria-expanded={isMenuOpen}
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
        <div className="site-header__mobile lg:hidden">
          <nav className="section-shell flex flex-col gap-1 py-4" aria-label="Navigation mobile">
            {siteConfig.nav.map((item) => (
              <Link
                className="rounded-md px-3 py-3 text-sm font-extrabold text-text-strong transition hover:bg-muted hover:text-accent"
                href={item.href}
                key={item.href}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            <Link
              className="btn btn-primary mt-3 w-full"
              href="/formations/formation-creation-web"
              onClick={closeMenu}
            >
              Accéder à la démo
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
