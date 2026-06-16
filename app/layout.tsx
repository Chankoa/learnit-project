import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/SiteShell";
import { createPageMetadata, getSiteUrl } from "@/lib/seo";
import { getSiteConfig } from "@/lib/site";
import "@/styles/globals.scss";

const themeInitializer = `
(function() {
  try {
    var key = "learnit-theme";
    var storedTheme = window.localStorage.getItem(key);
    var isLearningRoute = window.location.pathname === "/dashboard"
      || window.location.pathname.indexOf("/dashboard/") === 0
      || window.location.pathname.indexOf("/learn/") === 0;
    var theme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : isLearningRoute || window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";

    document.documentElement.dataset.theme = theme;
  } catch (error) {
    document.documentElement.dataset.theme =
      window.location.pathname.indexOf("/dashboard") === 0
      || window.location.pathname.indexOf("/learn/") === 0
      ? "dark"
      : "light";
  }
})();
`;

const siteConfig = getSiteConfig();

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  ...createPageMetadata({
    title: siteConfig.name,
    description: siteConfig.description
  }),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  }
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body>
        <a className="skip-link" href="#main-content">
          Aller au contenu principal
        </a>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
