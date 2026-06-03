import Link from "next/link";

import { siteConfig } from "@/data/site";
import { LogoMark } from "@/components/ui/LogoMark";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[var(--learnit-ink-950)] py-12 text-white">
      <div className="section-shell grid gap-10 md:grid-cols-[1.2fr_2fr]">
        <div className="space-y-5">
          <LogoMark />
          <p className="max-w-sm text-sm text-slate-300">{siteConfig.description}</p>
          <p className="text-sm text-slate-400">hello@learnit.dev</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {siteConfig.footer.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-extrabold uppercase text-white">{column.title}</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                {column.links.map((link) => (
                  <li key={link}>
                    <Link className="transition hover:text-white" href="#">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="section-shell mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
        © 2026 Learn It. Tous droits reserves.
      </div>
    </footer>
  );
}
