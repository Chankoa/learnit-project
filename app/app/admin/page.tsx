import type { Metadata } from "next";

import { RoleSpaceOverview } from "@/components/app/RoleSpaceOverview";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Administration",
  description: "Supervisez les utilisateurs, rôles, formations publiées, domaines et paramètres LearnIt.",
  path: "/app/admin",
  noIndex: true
});

export default function AdminAppPage() {
  return <RoleSpaceOverview role="admin" />;
}
