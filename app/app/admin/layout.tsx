import type { ReactNode } from "react";

import { AppShellFrame } from "@/components/app/AppShellFrame";

export default function AdminAppLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AppShellFrame role="admin" title="Administration">
      {children}
    </AppShellFrame>
  );
}
