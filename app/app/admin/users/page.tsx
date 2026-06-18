import type { Metadata } from "next";
import { Users } from "lucide-react";

import { AdminUsersTable } from "@/components/app/AdminUsersTable";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { getAdminUsers } from "@/lib/admin";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Gestion utilisateurs",
  description: "Supervisez les utilisateurs LearnIt en mode démo.",
  path: "/app/admin/users",
  noIndex: true
});

export default function AdminUsersPage() {
  const users = getAdminUsers();

  return (
    <div className="app-page admin-page">
      <AppBreadcrumb
        items={[
          { label: "Administration", href: "/app/admin" },
          { label: "Utilisateurs" }
        ]}
      />

      <AppPageHeader
        eyebrow="Utilisateurs"
        title="Gestion des comptes"
        description="Tableau des utilisateurs avec rôle, statut, dates de création et dernière activité. Les actions fonctionnent en mode démo."
        actions={
          <span className="admin-header-count">
            <Users size={17} aria-hidden="true" />
            {users.length} utilisateurs
          </span>
        }
      />

      <AdminUsersTable users={users} />
    </div>
  );
}
