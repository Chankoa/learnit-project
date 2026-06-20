"use client";

import { Eye, Power, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { useToast } from "@/components/app/ToastProvider";
import {
  adminUserRoleLabels,
  adminUserStatusLabels,
  formatAdminDate,
  formatAdminDateTime
} from "@/lib/admin";
import type { AdminUser, AdminUserRole } from "@/types/admin";

type AdminUsersTableProps = {
  users: AdminUser[];
};

const roleOptions = [
  { value: "learner", label: adminUserRoleLabels.learner },
  { value: "teacher", label: adminUserRoleLabels.teacher },
  { value: "admin", label: adminUserRoleLabels.admin }
] satisfies Array<{ value: AdminUserRole; label: string }>;

export function AdminUsersTable({ users }: AdminUsersTableProps) {
  const [rows, setRows] = useState(users);
  const [selectedUser, setSelectedUser] = useState<AdminUser | undefined>();
  const [toast, setToast] = useState<string>();
  const { showToast } = useToast();

  function notify(message: string) {
    setToast(message);
    showToast({
      description: "Action simulée localement ; aucun compte réel n'est modifié.",
      title: message,
      variant: "success"
    });
  }

  function updateRole(userId: string, role: AdminUserRole) {
    setRows((currentRows) =>
      currentRows.map((user) => (user.id === userId ? { ...user, role } : user))
    );
    notify("Rôle modifié en mode démo.");
  }

  function toggleUser(userId: string) {
    setRows((currentRows) =>
      currentRows.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "disabled" ? "active" : "disabled" }
        : user
      )
    );
    notify("Statut utilisateur modifié en mode démo.");
  }

  function showDetails(user: AdminUser) {
    setSelectedUser(user);
    notify("Détail utilisateur chargé en mode démo.");
  }

  return (
    <section className="admin-table-card" aria-label="Tableau utilisateurs">
      {toast ? (
        <div className="teacher-toast" role="status">
          {toast}
        </div>
      ) : null}

      <div className="admin-table admin-table--users">
        <div className="admin-table__row admin-table__row--head">
          <span>Nom</span>
          <span>Email</span>
          <span>Rôle</span>
          <span>Statut</span>
          <span>Création</span>
          <span>Dernière activité</span>
          <span>Actions</span>
        </div>
        {rows.map((user) => (
          <article className="admin-table__row" key={user.id}>
            <span>{user.name}</span>
            <span>{user.email}</span>
            <span>
              <select
                aria-label={`Changer le rôle de ${user.name}`}
                value={user.role}
                onChange={(event) => updateRole(user.id, event.target.value as AdminUserRole)}
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </span>
            <span className="state-badge" data-state={user.status}>
              {adminUserStatusLabels[user.status]}
            </span>
            <span>{formatAdminDate(user.createdAt)}</span>
            <span>{formatAdminDateTime(user.lastActivityAt)}</span>
            <span className="admin-row-actions">
              <button type="button" onClick={() => updateRole(user.id, "teacher")}>
                <ShieldCheck size={15} aria-hidden="true" />
                Changer rôle
              </button>
              <button type="button" onClick={() => toggleUser(user.id)}>
                <Power size={15} aria-hidden="true" />
                {user.status === "disabled" ? "Réactiver" : "Désactiver"}
              </button>
              <button type="button" onClick={() => showDetails(user)}>
                <Eye size={15} aria-hidden="true" />
                Voir détail
              </button>
            </span>
          </article>
        ))}
      </div>

      {selectedUser ? (
        <aside className="admin-detail-panel" aria-label="Détail utilisateur">
          <div>
            <span>Détail utilisateur</span>
            <h2>{selectedUser.name}</h2>
            <p>{selectedUser.email}</p>
          </div>
          <dl>
            <div>
              <dt>Rôle</dt>
              <dd>{adminUserRoleLabels[selectedUser.role]}</dd>
            </div>
            <div>
              <dt>Statut</dt>
              <dd>{adminUserStatusLabels[selectedUser.status]}</dd>
            </div>
            <div>
              <dt>Créé le</dt>
              <dd>{formatAdminDate(selectedUser.createdAt)}</dd>
            </div>
          </dl>
        </aside>
      ) : null}
    </section>
  );
}
