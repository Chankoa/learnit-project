import type { ReactNode } from "react";

import { AppShellFrame } from "@/components/app/AppShellFrame";

export default function TeacherAppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AppShellFrame role="teacher" title="Espace enseignant">
      {children}
    </AppShellFrame>
  );
}
