import Link from "next/link";

import { siteConfig } from "@/data/site";
import { LogoMark } from "@/components/ui/LogoMark";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/82 backdrop-blur-xl">
      <div className="section-shell flex min-h-20 items-center justify-between gap-4">
        <Link href="/" aria-label="Retour a l'accueil Learn It">
          <LogoMark />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
          {siteConfig.nav.map((item, index) => (
            <Link className="nav-link" data-active={index === 0} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link className="btn btn-primary hidden sm:inline-flex" href="#connexion">
            Se connecter
          </Link>
        </div>
      </div>
    </header>
  );
}
