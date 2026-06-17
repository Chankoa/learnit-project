import type { ReactNode } from "react";

import { AppShellFrame } from "@/components/app/AppShellFrame";

export default function LearnerAppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AppShellFrame role="learner" title="Espace apprenant">
      {children}
    </AppShellFrame>
  );
}
