import type { ReactNode } from "react";

import { AppShellFrame } from "@/components/app/AppShellFrame";
import { requireAdmin } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function AdminAppLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireAdmin("/app/admin");

  return (
    <AppShellFrame role="admin" title="Administration">
      {children}
    </AppShellFrame>
  );
}
