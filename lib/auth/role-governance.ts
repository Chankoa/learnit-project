import type { UserRole } from "@/types/user";

export type PublicRegistrationRole = Extract<UserRole, "learner" | "teacher">;
export type AssignableProfileRole = Exclude<UserRole, "visitor">;

export const publicRegistrationRoles = [
  { value: "learner", label: "Apprenant" },
  { value: "teacher", label: "Enseignant" }
] satisfies Array<{ value: PublicRegistrationRole; label: string }>;

export function normalizePublicRegistrationRole(value: unknown): PublicRegistrationRole {
  return value === "teacher" ? "teacher" : "learner";
}

export function isAssignableProfileRole(value: unknown): value is AssignableProfileRole {
  return value === "learner" || value === "teacher" || value === "admin";
}

export function isAdminRole(role: UserRole | null | undefined) {
  return role === "admin";
}

export function canAssignProfileRole(actorRole: UserRole | null | undefined, targetRole: unknown) {
  return isAdminRole(actorRole) && isAssignableProfileRole(targetRole);
}
