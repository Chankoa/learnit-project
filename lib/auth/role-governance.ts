import type { UserRole } from "@/types/user";

export type AssignableProfileRole = Exclude<UserRole, "visitor">;

// Internal schema compatibility only. Public callers cannot select or promote a role.
export const publicRegistrationCompatibilityRole = "learner" as const;

export function isAssignableProfileRole(value: unknown): value is AssignableProfileRole {
  return value === "learner" || value === "teacher" || value === "admin";
}

export function isAdminRole(role: UserRole | null | undefined) {
  return role === "admin";
}

export function canAssignProfileRole(actorRole: UserRole | null | undefined, targetRole: unknown) {
  return isAdminRole(actorRole) && isAssignableProfileRole(targetRole);
}
