import type { Metadata } from "next";

import { AdminSettingsForm } from "@/components/app/AdminSettingsForm";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { getPlatformSettings } from "@/lib/admin";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Paramètres plateforme",
  description: "Configurez l'identité, les inscriptions, le catalogue, la maintenance et les certificats LearnIt.",
  path: "/app/admin/settings",
  noIndex: true
});

export default function AdminSettingsPage() {
  return (
    <div className="app-page admin-page">
      <AppBreadcrumb
        items={[
          { label: "Administration", href: "/app/admin" },
          { label: "Paramètres" }
        ]}
      />

      <AppPageHeader
        eyebrow="Paramètres"
        title="Configuration plateforme"
        description="Réglez l'identité plateforme, les options d'inscription, l'affichage catalogue, le mode maintenance fictif et les certificats."
      />

      <AdminSettingsForm settings={getPlatformSettings()} />
    </div>
  );
}
