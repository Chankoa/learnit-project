import type { ReactNode } from "react";

import { AppShellFrame } from "@/components/app/AppShellFrame";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function AdminAppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AppShellFrame role="admin" title="Administration">
      <RoleGuard area="admin">{children}</RoleGuard>
    </AppShellFrame>
  );
}
