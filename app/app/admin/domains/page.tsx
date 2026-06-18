import type { Metadata } from "next";

import { AdminDomainsManager } from "@/components/app/AdminDomainsManager";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { getAdminDomains } from "@/lib/admin";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Gestion domaines",
  description: "Gérez les domaines de formation LearnIt en mode démo.",
  path: "/app/admin/domains",
  noIndex: true
});

export default function AdminDomainsPage() {
  return (
    <div className="app-page admin-page">
      <AppBreadcrumb
        items={[
          { label: "Administration", href: "/app/admin" },
          { label: "Domaines" }
        ]}
      />

      <AppPageHeader
        eyebrow="Domaines"
        title="Domaines de formation"
        description="Supervisez Création web, WordPress, UX/UI Design, AI Filmmaking et Prompt Design. Les actions restent fictives."
      />

      <AdminDomainsManager domains={getAdminDomains()} />
    </div>
  );
}
