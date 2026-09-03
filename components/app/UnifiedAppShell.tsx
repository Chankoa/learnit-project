import type { ReactNode } from "react";

import { AppShell } from "@/components/app/AppShell";
import type { CurrentProfile } from "@/lib/auth/server";
import { getUnifiedNavigation } from "@/lib/navigation";

type UnifiedAppShellProps = {
  profile: CurrentProfile;
  children: ReactNode;
};

export function UnifiedAppShell({ profile, children }: UnifiedAppShellProps) {
  return (
    <AppShell
      navigationItems={getUnifiedNavigation(profile.role === "admin")}
      presentation="unified"
      role={profile.role}
      title="LearnIt"
    >
      {children}
    </AppShell>
  );
}