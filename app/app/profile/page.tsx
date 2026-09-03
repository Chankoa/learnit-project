import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  deleteAccountAction,
  updateEmailAction,
  updatePasswordAction,
  updateProfileAction
} from "@/app/auth/actions";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { UnifiedAppShell } from "@/components/app/UnifiedAppShell";
import { getCurrentProfile, requireAuth } from "@/lib/auth/server";
import { createPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Mon profil",
  description: "Gérez votre profil et la sécurité de votre compte LearnIt.",
  path: "/app/profile",
  noIndex: true
});

type ProfilePageProps = {
  searchParams?: Promise<{ error?: string; message?: string }>;
};

const roleLabels = {
  learner: "Apprenant",
  teacher: "Enseignant",
  admin: "Administrateur"
};

const statusLabels = {
  active: "Actif",
  pending: "En attente",
  disabled: "Désactivé"
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  await requireAuth("/app/profile");
  const profile = await getCurrentProfile();
  const params = await searchParams;

  if (!profile) {
    redirect("/access-denied?reason=profile&next=%2Fapp%2Fprofile");
  }

  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <UnifiedAppShell profile={profile}>
      <div className="app-page profile-page">
        <AppBreadcrumb items={[{ label: "Mon profil" }]} />
        <AppPageHeader
          eyebrow="Compte LearnIt"
          title="Mon profil"
          description="Gérez les informations visibles sur votre compte et les paramètres de sécurité."
        />

        {params?.error ? <p className="auth-alert" role="alert">{params.error}</p> : null}
        {params?.message ? <p className="auth-alert auth-alert--success" role="status">{params.message}</p> : null}

        <div className="profile-page__grid">
          <section className="profile-panel" aria-labelledby="profile-details-title">
            <div className="profile-panel__heading">
              <div>
                <span>Profil</span>
                <h2 id="profile-details-title">Informations personnelles</h2>
              </div>
              <div className="profile-avatar" aria-label={`Avatar de ${profile.name}`}>
                {profile.avatarUrl ? <img alt="" src={profile.avatarUrl} /> : initials}
              </div>
            </div>

            <form action={updateProfileAction} className="profile-form">
              <label>
                <span>Nom affiché</span>
                <input defaultValue={profile.name} maxLength={80} name="name" required />
              </label>
              <label>
                <span>URL de l'avatar</span>
                <input defaultValue={profile.avatarUrl ?? ""} name="avatarUrl" type="url" />
              </label>
              <label>
                <span>Email</span>
                <input readOnly value={profile.email} />
              </label>
              <label>
                <span>Rôle</span>
                <input readOnly value={roleLabels[profile.role]} />
              </label>
              <label>
                <span>Statut</span>
                <input readOnly value={statusLabels[profile.status]} />
              </label>
              <div className="profile-form__actions">
                <button className="btn btn-primary" type="submit">Enregistrer le profil</button>
              </div>
            </form>
          </section>

          <section className="profile-panel" aria-labelledby="profile-security-title">
            <div className="profile-panel__heading">
              <div>
                <span>Sécurité</span>
                <h2 id="profile-security-title">Identifiants et session</h2>
              </div>
            </div>

            <div className="profile-security-forms">
              <form action={updateEmailAction} className="profile-form">
                <h3>Modifier l'email</h3>
                <p>Une confirmation peut être demandée par Supabase avant la prise en compte de l'adresse.</p>
                <label>
                  <span>Nouvel email</span>
                  <input defaultValue={profile.email} name="email" type="email" autoComplete="email" required />
                </label>
                <button className="btn btn-secondary" type="submit">Mettre à jour l'email</button>
              </form>

              <form action={updatePasswordAction} className="profile-form">
                <h3>Modifier le mot de passe</h3>
                <label>
                  <span>Nouveau mot de passe</span>
                  <input minLength={8} name="password" type="password" autoComplete="new-password" required />
                </label>
                <label>
                  <span>Confirmer le mot de passe</span>
                  <input minLength={8} name="passwordConfirmation" type="password" autoComplete="new-password" required />
                </label>
                <button className="btn btn-secondary" type="submit">Mettre à jour le mot de passe</button>
              </form>

              <Link className="text-link" href="/logout">Se déconnecter</Link>
            </div>
          </section>
        </div>

        <section className="profile-panel profile-panel--danger" aria-labelledby="profile-danger-title">
          <div className="profile-panel__heading">
            <div>
              <span>Zone de danger</span>
              <h2 id="profile-danger-title">Supprimer définitivement le compte</h2>
            </div>
          </div>
          <p>Cette opération supprime votre identité, votre profil et les données personnelles liées. Elle est irréversible.</p>
          <form action={deleteAccountAction} className="profile-form profile-form--danger">
            <input name="userId" type="hidden" value={profile.userId} />
            <label>
              <span>Pour confirmer, saisissez SUPPRIMER</span>
              <input name="confirmation" pattern="SUPPRIMER" required />
            </label>
            <button className="btn btn-danger" type="submit">Supprimer définitivement mon compte</button>
          </form>
        </section>
      </div>
    </UnifiedAppShell>
  );
}