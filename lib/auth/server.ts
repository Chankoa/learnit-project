import type { User as SupabaseUser } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createOptionalClient } from "@/lib/supabase/server";
import type { UserRole, UserStatus } from "@/types/user";

export type ProfileRole = Exclude<UserRole, "visitor">;

export type CurrentProfile = {
  id: string;
  userId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: ProfileRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
};

type RawProfile = {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  role: ProfileRole | null;
  status: UserStatus | null;
  created_at: string;
  updated_at: string;
  last_active_at: string | null;
};

const connectedRoles = ["learner", "teacher", "admin"] satisfies ProfileRole[];

function isProfileRole(value: unknown): value is ProfileRole {
  return connectedRoles.includes(value as ProfileRole);
}

function getLoginRedirect(nextPath: string) {
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

function canAccessRole(profileRole: ProfileRole, requiredRole: UserRole) {
  if (requiredRole === "visitor") {
    return true;
  }

  if (profileRole === "admin") {
    return true;
  }

  return profileRole === requiredRole;
}

function mapProfile(rawProfile: RawProfile, user: SupabaseUser): CurrentProfile | null {
  const role = rawProfile.role;

  if (!isProfileRole(role)) {
    return null;
  }

  return {
    id: rawProfile.id,
    userId: rawProfile.id,
    email: rawProfile.email ?? user.email ?? "",
    name: rawProfile.name ?? user.email ?? "Utilisateur LearnIt",
    avatarUrl: rawProfile.avatar_url ?? undefined,
    role,
    status: rawProfile.status ?? "pending",
    createdAt: rawProfile.created_at,
    updatedAt: rawProfile.updated_at,
    lastActiveAt: rawProfile.last_active_at ?? undefined
  };
}

export async function getCurrentUser() {
  const supabase = await createOptionalClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user ?? null;
}

export async function getCurrentProfile() {
  const supabase = await createOptionalClient();

  if (!supabase) {
    return null;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,name,avatar_url,role,status,created_at,updated_at,last_active_at")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapProfile(data as RawProfile, userData.user);
}

export async function requireAuth(nextPath = "/app/learner") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(getLoginRedirect(nextPath));
  }

  return user;
}

export async function requireRole(requiredRole: UserRole, nextPath = "/app/learner") {
  await requireAuth(nextPath);

  const profile = await getCurrentProfile();

  if (!profile || profile.status !== "active") {
    redirect(`/access-denied?reason=profile&next=${encodeURIComponent(nextPath)}`);
  }

  if (!canAccessRole(profile.role, requiredRole)) {
    redirect(
      `/access-denied?required=${encodeURIComponent(requiredRole)}&current=${encodeURIComponent(
        profile.role
      )}&next=${encodeURIComponent(nextPath)}`
    );
  }

  return profile;
}

export async function requireAdmin(nextPath = "/app/admin") {
  return requireRole("admin", nextPath);
}
