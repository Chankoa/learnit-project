"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { LogoMark } from "@/components/ui/LogoMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const navItems = [
  { label: "Formations", href: "#formations" },
  { label: "Domaines", href: "#domaines" },
  { label: "Ressources", href: "#ressources" },
  { label: "À propos", href: "#apropos" },
  { label: "Contact", href: "#contact" }
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/82 backdrop-blur-xl">
      <div className="section-shell flex min-h-20 items-center justify-between gap-3">
        <Link href="/" aria-label="Retour a l'accueil LearnIt" onClick={closeMenu}>
          <LogoMark />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
          {navItems.map((item) => (
            <Link className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link className="btn btn-primary hidden sm:inline-flex" href="#demo">
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
        <div className="border-t border-border bg-background/96 shadow-sm backdrop-blur-xl lg:hidden">
          <nav className="section-shell flex flex-col gap-1 py-4" aria-label="Navigation mobile">
            {navItems.map((item) => (
              <Link
                className="rounded-md px-3 py-3 text-sm font-extrabold text-text-strong transition hover:bg-muted hover:text-accent"
                href={item.href}
                key={item.href}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ))}
            <Link className="btn btn-primary mt-3 w-full" href="#demo" onClick={closeMenu}>
              Accéder à la démo
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
