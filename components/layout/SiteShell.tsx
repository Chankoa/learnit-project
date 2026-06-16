"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

type SiteShellProps = Readonly<{
  children: ReactNode;
}>;

export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  const isLearningRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.startsWith("/learn/");

  if (isLearningRoute) {
    return children;
  }

  return (
    <div className="site-shell">
      <Header />
      <main className="site-main" id="main-content">{children}</main>
      <Footer />
    </div>
  );
}
