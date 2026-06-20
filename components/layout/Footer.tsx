import Link from "next/link";

import { LogoMark } from "@/components/ui/LogoMark";
import { publicNavigation } from "@/lib/navigation";
import { getSiteConfig } from "@/lib/site";

export function Footer() {
  const siteConfig = getSiteConfig();

  return (
    <footer className="site-footer" id="contact">
      <div className="section-shell grid gap-10 md:grid-cols-[1.15fr_1fr] lg:grid-cols-[1.25fr_1.75fr]">
        <div className="space-y-5">
          <LogoMark tone="inverse" />
          <p className="max-w-sm text-sm text-slate-300">{siteConfig.description}</p>
          <p className="text-sm text-slate-400">hello@learnit.dev</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="text-sm font-extrabold uppercase text-white">Navigation</h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              {publicNavigation.map((item) => (
                <li key={item.href}>
                  <Link className="transition hover:text-white" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-extrabold uppercase text-white">Démo</h2>
            <p className="mt-4 text-sm text-slate-300">
              Accédez aux espaces multi-rôles ou consultez les limites du mode démonstration.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link className="btn btn-primary w-full sm:w-auto" href="/app">
                Accéder à la démo
              </Link>
              <Link className="btn btn-secondary w-full sm:w-auto" href="/demo">
                Limites démo
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="section-shell mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
        &copy; 2026 LearnIt. Tous droits réservés.
      </div>
    </footer>
  );
}
