import Link from "next/link";

import { LogoMark } from "@/components/ui/LogoMark";
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
              {siteConfig.nav.map((item) => (
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
              Accédez à une expérience courte pour explorer le parcours LearnIt.
            </p>
            <Link className="btn btn-primary mt-5 w-full sm:w-auto" href="/formations/formation-creation-web">
              Accéder à la démo
            </Link>
          </div>
        </div>
      </div>

      <div className="section-shell mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
        &copy; 2026 LearnIt. Tous droits réservés.
      </div>
    </footer>
  );
}
