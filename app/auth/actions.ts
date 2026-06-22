"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { getSiteUrl } from "@/lib/seo";
import { createOptionalClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ProfileRole } from "@/lib/auth/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getSafeNextPath(value: string | null | undefined, fallback = "/app/learner") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

function getAuthRedirectUrl(nextPath: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || getSiteUrl();
  const callbackUrl = new URL("/auth/callback", baseUrl);

  callbackUrl.searchParams.set("next", nextPath);

  return callbackUrl.toString();
}

function redirectWithMessage(path: string, key: "error" | "message", message: string): never {
  redirect(`${path}?${key}=${encodeURIComponent(message)}`);
}

function getRequestedRole(formData: FormData): ProfileRole {
  const role = getString(formData, "role");

  return role === "teacher" || role === "admin" ? role : "learner";
}

export async function loginAction(formData: FormData) {
  const nextPath = getSafeNextPath(getString(formData, "next"));

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
    redirectWithMessage("/login", "error", "Connexion impossible. Vérifiez vos identifiants.");
  }

  revalidatePath("/", "layout");
  redirect(nextPath);
}

export async function registerAction(formData: FormData) {
  const nextPath = getSafeNextPath(getString(formData, "next"));

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
