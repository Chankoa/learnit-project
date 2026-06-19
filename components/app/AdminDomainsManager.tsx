"use client";

import { CheckCircle2, Pencil, Plus, Power } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import { useToast } from "@/components/app/ToastProvider";
import { adminDomainStatusLabels, formatAdminDate } from "@/lib/admin";
import type { AdminDomain } from "@/types/admin";

type AdminDomainsManagerProps = {
  domains: AdminDomain[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminDomainsManager({ domains }: AdminDomainsManagerProps) {
  const [rows, setRows] = useState(domains);
  const [newDomainName, setNewDomainName] = useState("");
  const [editingDomainId, setEditingDomainId] = useState<string>();
  const [draftName, setDraftName] = useState("");
  const [toast, setToast] = useState<string>();
  const { showToast } = useToast();

  function notify(message: string, variant: "success" | "warning" = "success") {
    setToast(message);
    showToast({
      description: variant === "success" ? "Action appliquée localement en mode démo." : undefined,
      title: message,
      variant
    });
  }

  function createDomain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newDomainName.trim()) {
      notify("Le nom du domaine est requis.", "warning");
      return;
    }

    const name = newDomainName.trim();
    setRows((currentRows) => [
      ...currentRows,
      {
        id: `admin-domain-demo-${Date.now()}`,
        name,
        slug: slugify(name),
        status: "active",
        courseCount: 0,
        order: currentRows.length + 1,
        updatedAt: new Date().toISOString()
      }
    ]);
    setNewDomainName("");
    notify("Domaine créé en mode démo.");
  }

  function startEdit(domain: AdminDomain) {
    setEditingDomainId(domain.id);
    setDraftName(domain.name);
  }

  function saveEdit(domainId: string) {
    if (!draftName.trim()) {
      notify("Le nom du domaine est requis.", "warning");
      return;
    }

    setRows((currentRows) =>
      currentRows.map((domain) =>
        domain.id === domainId
          ? {
              ...domain,
              name: draftName.trim(),
              slug: slugify(draftName.trim()),
              updatedAt: new Date().toISOString()
            }
          : domain
      )
    );
    setEditingDomainId(undefined);
    setDraftName("");
    notify("Domaine modifié en mode démo.");
  }

  function toggleDomain(domainId: string) {
    setRows((currentRows) =>
      currentRows.map((domain) =>
        domain.id === domainId
          ? {
              ...domain,
              status: domain.status === "active" ? "inactive" : "active",
              updatedAt: new Date().toISOString()
            }
          : domain
      )
    );
    notify("Statut du domaine modifié en mode démo.");
  }

  return (
    <div className="admin-domain-manager">
      {toast ? (
        <div className="teacher-toast" role="status">
          {toast}
        </div>
      ) : null}

      <form className="admin-create-strip" onSubmit={createDomain}>
        <label className="teacher-field">
          <span>Nouveau domaine</span>
          <input
            value={newDomainName}
            onChange={(event) => setNewDomainName(event.target.value)}
          />
        </label>
        <button className="btn btn-primary" type="submit">
          <Plus size={17} aria-hidden="true" />
          Créer domaine
        </button>
      </form>

      <section className="admin-domain-grid" aria-label="Domaines de formation">
        {rows.map((domain) => (
          <article className="admin-domain-card" key={domain.id}>
            <div className="admin-domain-card__heading">
              <span className="state-badge" data-state={domain.status}>
                {adminDomainStatusLabels[domain.status]}
              </span>
              <strong>{domain.courseCount} formations</strong>
            </div>

            {editingDomainId === domain.id ? (
              <div className="admin-domain-edit">
                <input
                  aria-label={`Modifier ${domain.name}`}
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                />
                <button type="button" onClick={() => saveEdit(domain.id)}>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  Enregistrer
                </button>
              </div>
            ) : (
              <div>
                <h2>{domain.name}</h2>
                <p>/{domain.slug}</p>
              </div>
            )}

            <small>Mis à jour le {formatAdminDate(domain.updatedAt)}</small>

            <div className="admin-row-actions">
              <button type="button" onClick={() => startEdit(domain)}>
                <Pencil size={15} aria-hidden="true" />
                Modifier
              </button>
              <button type="button" onClick={() => toggleDomain(domain.id)}>
                <Power size={15} aria-hidden="true" />
                {domain.status === "active" ? "Désactiver" : "Activer"}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
