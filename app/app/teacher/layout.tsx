import type { ReactNode } from "react";

import { AppShellFrame } from "@/components/app/AppShellFrame";
import { requireRole } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function TeacherAppLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireRole("teacher", "/app/teacher");

  return (
    <AppShellFrame role="teacher" title="Espace enseignant">
      {children}
    </AppShellFrame>
  );
}
