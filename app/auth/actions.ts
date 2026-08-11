"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getPublicAppUrl } from "@/lib/config/runtime";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOptionalClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { normalizePublicRegistrationRole } from "@/lib/auth/role-governance";
import { getCurrentProfile, getProfileHomePath, type ProfileRole } from "@/lib/auth/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getAuthRedirectUrl(nextPath: string) {
  const baseUrl = getPublicAppUrl();
  const callbackUrl = new URL("/auth/callback", baseUrl);

  callbackUrl.searchParams.set("next", nextPath);

  return callbackUrl.toString();
}

function redirectWithMessage(path: string, key: "error" | "message", message: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(message)}`);
}

function getRequestedRole(formData: FormData): ProfileRole {
  return normalizePublicRegistrationRole(getString(formData, "role"));
}

export async function loginAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirectWithMessage("/login", "error", "Supabase n'est pas encore configuré pour ce déploiement.");
  }

  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");

  if (!email || !password) {
    redirectWithMessage("/login", "error", "Email et mot de passe requis.");
  }

  const supabase = await createOptionalClient();

  if (!supabase) {
    redirectWithMessage("/login", "error", "Configuration Supabase manquante.");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    if (error.code === "email_not_confirmed") {
      redirectWithMessage("/login", "error", "Votre compte n'est pas confirmé. Vérifiez l'email de confirmation envoyé par LearnIt.");
    }

    redirectWithMessage("/login", "error", "Identifiants invalides. Vérifiez votre email et votre mot de passe.");
  }

  const profile = await getCurrentProfile();

  if (!profile || profile.status !== "active") {
    await supabase.auth.signOut();
    redirectWithMessage("/login", "error", "Accès refusé : ce compte n'est pas autorisé à accéder à la plateforme.");
  }

  revalidatePath("/", "layout");
  redirect(getProfileHomePath(profile.role));
}

export async function registerAction(formData: FormData) {
  const nextPath = "/app/learner";

  if (!isSupabaseConfigured()) {
    redirectWithMessage("/register", "error", "Supabase n'est pas encore configuré pour ce déploiement.");
  }

  const name = getString(formData, "name");
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");
  const role = getRequestedRole(formData);

  if (!name || !email || !password) {
    redirectWithMessage("/register", "error", "Nom, email et mot de passe requis.");
  }

  if (password.length < 8) {
    redirectWithMessage("/register", "error", "Le mot de passe doit contenir au moins 8 caractères.");
  }

  const supabase = await createOptionalClient();

  if (!supabase) {
    redirectWithMessage("/register", "error", "Configuration Supabase manquante.");
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(nextPath),
      data: {
        name,
        role
      }
    }
  });

  if (error) {
    redirectWithMessage("/register", "error", "Inscription impossible avec ces informations.");
  }

  revalidatePath("/", "layout");

  if (data.session) {
    redirect(nextPath);
  }

  redirectWithMessage(
    "/login",
    "message",
    "Compte créé. Confirmez votre email si Supabase l'exige, puis connectez-vous."
  );
}

export async function logoutAction() {
  const supabase = await createOptionalClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/login?message=Session déconnectée.");
}

function redirectToProfile(key: "error" | "message", message: string): never {
  redirect(`/app/profile?${key}=${encodeURIComponent(message)}`);
}

async function getAuthenticatedClient() {
  const supabase = await createOptionalClient();

  if (!supabase) {
    redirectToProfile("error", "Configuration Supabase manquante.");
  }

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    redirect("/login?next=%2Fapp%2Fprofile");
  }

  return { supabase, user: data.user };
}

export async function updateProfileAction(formData: FormData) {
  const name = getString(formData, "name");
  const avatarUrl = getString(formData, "avatarUrl");

  if (!name || name.length > 80) {
    redirectToProfile("error", "Le nom doit contenir entre 1 et 80 caractères.");
  }

  if (avatarUrl) {
    try {
      const url = new URL(avatarUrl);

      if (url.protocol !== "https:" && url.protocol !== "http:") {
        throw new Error("Invalid avatar URL protocol");
      }
    } catch {
      redirectToProfile("error", "L'URL de l'avatar doit être une adresse HTTP(S) valide.");
    }
  }

  const { supabase, user } = await getAuthenticatedClient();
  const { error } = await supabase
    .from("profiles")
    .update({ name, avatar_url: avatarUrl || null })
    .eq("id", user.id);

  if (error) {
    redirectToProfile("error", "La mise à jour du profil a échoué.");
  }

  revalidatePath("/app/profile");
  revalidatePath("/app", "layout");
  redirectToProfile("message", "Profil mis à jour.");
}

export async function updateEmailAction(formData: FormData) {
  const email = getString(formData, "email").toLowerCase();

  if (!email || !email.includes("@")) {
    redirectToProfile("error", "Saisissez une adresse email valide.");
  }

  const { supabase } = await getAuthenticatedClient();
  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: getAuthRedirectUrl("/app/profile") }
  );

  if (error) {
    redirectToProfile("error", "La modification de l'email a échoué.");
  }

  revalidatePath("/app/profile");
  redirectToProfile("message", "Vérifiez votre boîte email pour confirmer cette modification si Supabase le demande.");
}

export async function updatePasswordAction(formData: FormData) {
  const password = getString(formData, "password");
  const passwordConfirmation = getString(formData, "passwordConfirmation");

  if (password.length < 8) {
    redirectToProfile("error", "Le mot de passe doit contenir au moins 8 caractères.");
  }

  if (password !== passwordConfirmation) {
    redirectToProfile("error", "La confirmation du mot de passe ne correspond pas.");
  }

  const { supabase } = await getAuthenticatedClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirectToProfile("error", "La modification du mot de passe a échoué.");
  }

  redirectToProfile("message", "Mot de passe mis à jour.");
}

export async function deleteAccountAction(formData: FormData) {
  const confirmation = getString(formData, "confirmation");
  const requestedUserId = getString(formData, "userId");

  if (confirmation !== "SUPPRIMER") {
    redirectToProfile("error", "Saisissez SUPPRIMER pour confirmer la suppression.");
  }

  const { supabase, user } = await getAuthenticatedClient();

  if (requestedUserId !== user.id) {
    redirectToProfile("error", "La demande de suppression ne correspond pas à la session active.");
  }

  const adminClient = createAdminClient();

  if (!adminClient) {
    redirectToProfile("error", "La suppression de compte n'est pas configurée pour ce déploiement.");
  }

  const { error } = await adminClient.auth.admin.deleteUser(user.id);

  if (error) {
    redirectToProfile("error", "La suppression du compte a échoué.");
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?message=Compte supprimé définitivement.");
}
