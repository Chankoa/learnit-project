"use client";

import type { ReactNode } from "react";

import { AppShell } from "@/components/app/AppShell";
import {
  getNavigationForRole,
  platformAccessNavigation,
  type ApplicationRole
} from "@/lib/navigation";

type AppShellFrameProps = {
  role: ApplicationRole;
  children: ReactNode;
  title?: string;
};

export function AppShellFrame({ role, children, title }: AppShellFrameProps) {
  const navigationItems = role === "visitor" ? platformAccessNavigation : getNavigationForRole(role);

  return (
    <AppShell navigationItems={navigationItems} role={role} title={title}>
      {children}
    </AppShell>
  );
}
