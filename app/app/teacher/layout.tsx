import type { ReactNode } from "react";

import { AppShellFrame } from "@/components/app/AppShellFrame";
import { requireActiveProfile } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function TeacherAppLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireActiveProfile("/app/teacher");

  return (
    <AppShellFrame role="teacher" title="Créer">
      {children}
    </AppShellFrame>
  );
}
