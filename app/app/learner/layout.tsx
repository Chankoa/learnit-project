import type { ReactNode } from "react";

import { AppShellFrame } from "@/components/app/AppShellFrame";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function LearnerAppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AppShellFrame role="learner" title="Espace apprenant">
      <RoleGuard area="learner">{children}</RoleGuard>
    </AppShellFrame>
  );
}
