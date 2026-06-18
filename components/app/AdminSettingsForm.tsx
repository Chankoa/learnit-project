"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import type { PlatformSettings } from "@/types/admin";

type AdminSettingsFormProps = {
  settings: PlatformSettings;
};

export function AdminSettingsForm({ settings }: AdminSettingsFormProps) {
  const [form, setForm] = useState(settings);
  const [toast, setToast] = useState<string>();

  function submitSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log("[LearnIt demo] admin settings", form);
    setToast("Paramètres enregistrés en mode démo.");
  }

  return (
    <form className="admin-settings-form" onSubmit={submitSettings}>
      {toast ? (
        <div className="teacher-toast" role="status">
          {toast}
        </div>
      ) : null}

      <section className="teacher-form-section">
        <div>
          <span>Identité plateforme</span>
          <h2>Nom, promesse et support</h2>
        </div>
        <div className="teacher-form-grid">
          <label className="teacher-field">
            <span>Nom</span>
            <input
              value={form.identity.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  identity: { ...current.identity, name: event.target.value }
                }))
              }
            />
          </label>
          <label className="teacher-field">
            <span>Email support</span>
            <input
              type="email"
              value={form.identity.supportEmail}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  identity: { ...current.identity, supportEmail: event.target.value }
                }))
              }
            />
          </label>
          <label className="teacher-field teacher-field--wide">
            <span>Tagline</span>
            <input
              value={form.identity.tagline}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  identity: { ...current.identity, tagline: event.target.value }
                }))
              }
            />
          </label>
        </div>
      </section>

      <section className="teacher-form-section">
        <div>
          <span>Options d'inscription</span>
          <h2>Accès apprenants et enseignants</h2>
        </div>
        <div className="admin-toggle-grid">
          <label>
            <input
              checked={form.registration.learnersEnabled}
              type="checkbox"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  registration: {
                    ...current.registration,
                    learnersEnabled: event.target.checked
                  }
                }))
              }
            />
            Inscriptions apprenants ouvertes
          </label>
          <label>
            <input
              checked={form.registration.teachersRequireApproval}
              type="checkbox"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  registration: {
                    ...current.registration,
                    teachersRequireApproval: event.target.checked
                  }
                }))
              }
            />
            Validation requise pour les enseignants
          </label>
          <label>
            <input
              checked={form.registration.inviteOnly}
              type="checkbox"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  registration: { ...current.registration, inviteOnly: event.target.checked }
                }))
              }
            />
            Plateforme sur invitation
          </label>
        </div>
      </section>

      <section className="teacher-form-section">
        <div>
          <span>Affichage catalogue</span>
          <h2>Présentation des formations</h2>
        </div>
        <div className="teacher-form-grid">
          <label className="teacher-field">
            <span>Tri par défaut</span>
            <select
              value={form.catalog.defaultSort}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  catalog: {
                    ...current.catalog,
                    defaultSort: event.target.value as PlatformSettings["catalog"]["defaultSort"]
                  }
                }))
              }
            >
              <option value="recent">Plus récentes</option>
              <option value="popular">Populaires</option>
              <option value="domain">Par domaine</option>
            </select>
          </label>
          <div className="admin-toggle-grid">
            <label>
              <input
                checked={form.catalog.showDraftPreviews}
                type="checkbox"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    catalog: {
                      ...current.catalog,
                      showDraftPreviews: event.target.checked
                    }
                  }))
                }
              />
              Afficher les aperçus brouillon
            </label>
            <label>
              <input
                checked={form.catalog.highlightNewCourses}
                type="checkbox"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    catalog: {
                      ...current.catalog,
                      highlightNewCourses: event.target.checked
                    }
                  }))
                }
              />
              Mettre en avant les nouveautés
            </label>
          </div>
        </div>
      </section>

      <section className="teacher-form-section">
        <div>
          <span>Mode maintenance fictif</span>
          <h2>Message et activation</h2>
        </div>
        <div className="teacher-form-grid">
          <label className="admin-switch-row">
            <input
              checked={form.maintenance.enabled}
              type="checkbox"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  maintenance: { ...current.maintenance, enabled: event.target.checked }
                }))
              }
            />
            Activer le mode maintenance
          </label>
          <label className="teacher-field teacher-field--wide">
            <span>Message</span>
            <textarea
              rows={4}
              value={form.maintenance.message}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  maintenance: { ...current.maintenance, message: event.target.value }
                }))
              }
            />
          </label>
        </div>
      </section>

      <section className="teacher-form-section">
        <div>
          <span>Paramètres certificats</span>
          <h2>Émission et critères</h2>
        </div>
        <div className="teacher-form-grid">
          <label className="teacher-field">
            <span>Émetteur</span>
            <input
              value={form.certificates.issuerName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  certificates: { ...current.certificates, issuerName: event.target.value }
                }))
              }
            />
          </label>
          <div className="admin-toggle-grid">
            <label>
              <input
                checked={form.certificates.enabled}
                type="checkbox"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    certificates: { ...current.certificates, enabled: event.target.checked }
                  }))
                }
              />
              Certificats activés
            </label>
            <label>
              <input
                checked={form.certificates.requireFullCompletion}
                type="checkbox"
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    certificates: {
                      ...current.certificates,
                      requireFullCompletion: event.target.checked
                    }
                  }))
                }
              />
              Exiger 100% de complétion
            </label>
          </div>
        </div>
      </section>

      <div className="teacher-form-actions">
        <button className="btn btn-primary" type="submit">
          <Save size={17} aria-hidden="true" />
          Enregistrer les paramètres
        </button>
      </div>
    </form>
  );
}
