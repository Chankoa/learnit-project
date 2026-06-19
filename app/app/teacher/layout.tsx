import type { ReactNode } from "react";

import { AppShellFrame } from "@/components/app/AppShellFrame";
import { RoleGuard } from "@/components/auth/RoleGuard";

export default function TeacherAppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AppShellFrame role="teacher" title="Espace enseignant">
      <RoleGuard area="teacher">{children}</RoleGuard>
    </AppShellFrame>
  );
}
