import type { UserRole } from "@/types/user";

export const DEMO_ROLE_STORAGE_KEY = "learnit-demo-role";
export const DEMO_ROLE_CHANGE_EVENT = "learnit-demo-role-change";

export function isUserRole(value: string | null): value is UserRole {
  return value === "visitor" || value === "learner" || value === "teacher" || value === "admin";
}

export function getDemoRoleFromStorage(): UserRole {
  if (typeof window === "undefined") {
    return "visitor";
  }

  try {
    const storedRole = window.localStorage.getItem(DEMO_ROLE_STORAGE_KEY);

    return isUserRole(storedRole) ? storedRole : "visitor";
  } catch {
    return "visitor";
  }
}

export function storeDemoRole(role: UserRole) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(DEMO_ROLE_STORAGE_KEY, role);
  } catch {
    // The demo role remains usable for the current render even if storage is blocked.
  }

  window.dispatchEvent(new CustomEvent(DEMO_ROLE_CHANGE_EVENT, { detail: { role } }));
}
