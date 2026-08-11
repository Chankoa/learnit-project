"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { AuthError } from "@supabase/supabase-js";

import { getPublicAppUrl } from "@/lib/config/runtime";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOptionalClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { normalizePublicRegistrationRole } from "@/lib/auth/role-governance";
import { getCurrentProfile, getProfileHomePath, type ProfileRole } from "@/lib/auth/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getSafeNextPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/app";
  }

  return value;
}

function getAuthRedirectUrl(nextPath: string) {
  const baseUrl = getPublicAppUrl();
  const callbackUrl = new URL("/auth/callback", baseUrl);

  callbackUrl.searchParams.set("next", nextPath);

  return callbackUrl.toString();
}

function redirectWithParams(path: string, params: Record<string, string | undefined>): never {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();

  redirect(query ? `${path}?${query}` : path);
}

function redirectWithMessage(path: string, key: "error" | "message", message: string): never {
  redirectWithParams(path, { [key]: message });
}

function getRequestedRole(formData: FormData): ProfileRole {
  return normalizePublicRegistrationRole(getString(formData, "role"));
}

function getRegistrationNextPath(role: ProfileRole) {
  return getProfileHomePath(role);
}

function getAuthErrorDetails(error: AuthError) {
  return {
    code: error.code,
    message: error.message,
    name: error.name,
    status: error.status
  };
}

function getAuthErrorText(error: AuthError) {
  return `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
}

function isEmailNotConfirmedError(error: AuthError) {
  const text = getAuthErrorText(error);

  return error.code === "email_not_confirmed" || text.includes("email not confirmed");
}

function isRateLimitError(error: AuthError) {
  const text = getAuthErrorText(error);

  return error.status === 429 || text.includes("rate limit") || text.includes("too many");
}

function isTemporaryAuthError(error: AuthError) {
  return typeof error.status === "number" && error.status >= 500;
}

function isExistingAccountError(error: AuthError) {
  const text = getAuthErrorText(error);

  return (
    error.code === "user_already_exists" ||
    error.code === "email_exists" ||
    text.includes("already registered") ||
    text.includes("already exists")
  );
}

export async function loginAction(formData: FormData) {
  const nextPath = getSafeNextPath(getString(formData, "next"));

  if (!isSupabaseConfigured()) {
    redirectWithParams("/login", {
      error: "Supabase n'est pas encore configuré pour ce déploiement.",
      next: nextPath
    });
  }

  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");

  if (!email || !password) {
    redirectWithParams("/login", {
      error: "Email et mot de passe requis.",
      next: nextPath
    });
  }

  const supabase = await createOptionalClient();

  if (!supabase) {
    redirectWithParams("/login", {
      error: "Configuration Supabase manquante.",
      next: nextPath
    });
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error("[auth] login failed", getAuthErrorDetails(error));

    if (isEmailNotConfirmedError(error)) {
      redirectWithParams("/login", {
        confirmationEmail: email,
        error: "Votre adresse email n'est pas confirmée. Vous pouvez demander un nouvel email de confirmation.",
        next: nextPath
      });
    }

    if (isRateLimitError(error)) {
      redirectWithParams("/login", {
        error: "Trop de tentatives. Patientez quelques minutes avant de réessayer.",
        next: nextPath
      });
    }

    if (isTemporaryAuthError(error)) {
      redirectWithParams("/login", {
        error: "Le service d'authentification est temporairement indisponible. Réessayez dans quelques minutes.",
        next: nextPath
      });
    }

    redirectWithParams("/login", {
      error: "Identifiants invalides. Vérifiez votre email et votre mot de passe.",
      next: nextPath
    });
  }

  const profile = await getCurrentProfile();

  if (!profile || profile.status !== "active") {
    await supabase.auth.signOut();
    redirectWithParams("/login", {
      error: "Accès refusé : ce compte n'est pas autorisé à accéder à la plateforme.",
      next: nextPath
    });
  }

  revalidatePath("/", "layout");
  redirect(getProfileHomePath(profile.role));
}

export async function registerAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirectWithMessage("/register", "error", "Supabase n'est pas encore configuré pour ce déploiement.");
  }

  const name = getString(formData, "name");
  const email = getString(formData, "email").toLowerCase();
  const password = getString(formData, "password");
  const role = getRequestedRole(formData);
  const nextPath = getRegistrationNextPath(role);

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
    console.error("[auth] signup failed", getAuthErrorDetails(error));

    if (isExistingAccountError(error)) {
      redirectWithParams("/login", {
        confirmationEmail: email,
        message: "Si cette adresse correspond à un compte en attente de confirmation, vous pouvez demander un nouvel email de confirmation.",
        next: nextPath
      });
    }

    if (isRateLimitError(error)) {
      redirectWithMessage("/register", "error", "Trop de tentatives. Patientez quelques minutes avant de réessayer.");
    }

    if (isTemporaryAuthError(error)) {
      redirectWithMessage(
        "/register",
        "error",
        "Le service d'authentification est temporairement indisponible. Réessayez dans quelques minutes."
      );
    }

    redirectWithMessage("/register", "error", "Inscription impossible avec ces informations.");
  }

  revalidatePath("/", "layout");

  if (data.session) {
    redirect(nextPath);
  }

  redirectWithParams("/login", {
    confirmationEmail: email,
    message: "Compte créé. Consultez votre boîte mail pour confirmer votre adresse.",
    next: nextPath
  });
}

export async function resendConfirmationAction(formData: FormData) {
  const email = getString(formData, "email").toLowerCase();
  const nextPath = getSafeNextPath(getString(formData, "next"));
  const neutralMessage =
    "Si cette adresse correspond à un compte en attente de confirmation, un nouvel email a été envoyé.";

  if (!email || !email.includes("@")) {
    redirectWithParams("/login", {
      error: "Saisissez une adresse email valide.",
      next: nextPath
    });
  }

  if (!isSupabaseConfigured()) {
    redirectWithParams("/login", {
      confirmationEmail: email,
      error: "Supabase n'est pas encore configuré pour ce déploiement.",
      next: nextPath
    });
  }

  const supabase = await createOptionalClient();

  if (!supabase) {
    redirectWithParams("/login", {
      confirmationEmail: email,
      error: "Configuration Supabase manquante.",
      next: nextPath
    });
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: getAuthRedirectUrl(nextPath)
    }
  });

  if (error) {
    console.error("[auth] resend signup confirmation failed", getAuthErrorDetails(error));

    if (isRateLimitError(error)) {
      redirectWithParams("/login", {
        confirmationEmail: email,
        error: "Trop de demandes. Patientez quelques minutes avant de renvoyer l'email.",
        next: nextPath
      });
    }

    if (isTemporaryAuthError(error)) {
      redirectWithParams("/login", {
        confirmationEmail: email,
        error: "Le service d'authentification est temporairement indisponible. Réessayez dans quelques minutes.",
        next: nextPath
      });
    }
  }

  redirectWithParams("/login", {
    confirmationEmail: email,
    message: neutralMessage,
    next: nextPath
  });
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = getString(formData, "email").toLowerCase();
  const neutralMessage = "Si un compte correspond à cette adresse, un email vous a été envoyé.";

  if (!email || !email.includes("@")) {
    redirectWithParams("/forgot-password", {
      error: "Saisissez une adresse email valide."
    });
  }

  if (!isSupabaseConfigured()) {
    redirectWithParams("/forgot-password", {
      error: "Supabase n'est pas encore configuré pour ce déploiement."
    });
  }

  const supabase = await createOptionalClient();

  if (!supabase) {
    redirectWithParams("/forgot-password", {
      error: "Configuration Supabase manquante."
    });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthRedirectUrl("/auth/reset-password")
  });

  if (error) {
    console.error("[auth] password reset request failed", getAuthErrorDetails(error));

    if (isRateLimitError(error)) {
      redirectWithParams("/forgot-password", {
        error: "Trop de demandes. Patientez quelques minutes avant de réessayer."
      });
    }

    if (isTemporaryAuthError(error)) {
      redirectWithParams("/forgot-password", {
        error: "Le service d'authentification est temporairement indisponible. Réessayez dans quelques minutes."
      });
    }
  }

  redirectWithParams("/forgot-password", {
    message: neutralMessage
  });
}

export async function resetPasswordAction(formData: FormData) {
  const password = getString(formData, "password");
  const passwordConfirmation = getString(formData, "passwordConfirmation");

  if (password.length < 8) {
    redirectWithParams("/auth/reset-password", {
      error: "Le mot de passe doit contenir au moins 8 caractères."
    });
  }

  if (password !== passwordConfirmation) {
    redirectWithParams("/auth/reset-password", {
      error: "La confirmation du mot de passe ne correspond pas."
    });
  }

  if (!isSupabaseConfigured()) {
    redirectWithParams("/auth/reset-password", {
      error: "Supabase n'est pas encore configuré pour ce déploiement."
    });
  }

  const supabase = await createOptionalClient();

  if (!supabase) {
    redirectWithParams("/auth/reset-password", {
      error: "Configuration Supabase manquante."
    });
  }

  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data.user) {
    if (userError) {
      console.error("[auth] password reset session lookup failed", getAuthErrorDetails(userError));
    }

    redirectWithParams("/forgot-password", {
      error: "Lien de réinitialisation expiré ou invalide. Demandez un nouvel email."
    });
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    console.error("[auth] password reset update failed", getAuthErrorDetails(error));

    if (isRateLimitError(error)) {
      redirectWithParams("/auth/reset-password", {
        error: "Trop de tentatives. Patientez quelques minutes avant de réessayer."
      });
    }

    if (isTemporaryAuthError(error)) {
      redirectWithParams("/auth/reset-password", {
        error: "Le service d'authentification est temporairement indisponible. Réessayez dans quelques minutes."
      });
    }

    redirectWithParams("/auth/reset-password", {
      error: "La réinitialisation du mot de passe a échoué. Demandez un nouveau lien si nécessaire."
    });
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirectWithParams("/login", {
    message: "Mot de passe mis à jour. Connectez-vous avec votre nouveau mot de passe."
  });
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
