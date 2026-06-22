import type { ReactNode } from "react";

import { AppShellFrame } from "@/components/app/AppShellFrame";
import { requireRole } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

export default async function LearnerAppLayout({ children }: Readonly<{ children: ReactNode }>) {
  await requireRole("learner", "/app/learner");

  return (
    <AppShellFrame role="learner" title="Espace apprenant">
      {children}
    </AppShellFrame>
  );
}
