"use client";

import { ShieldAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { RoleSwitcher } from "@/components/app/RoleSwitcher";
import {
  DEMO_ROLE_CHANGE_EVENT,
  DEMO_ROLE_STORAGE_KEY,
  getDemoRoleFromStorage,
  isUserRole
} from "@/lib/auth/demo-role";
import {
  canAccessAdminArea,
  canAccessLearnerArea,
  canAccessTeacherArea
} from "@/lib/auth/permissions";
import type { User, UserRole } from "@/types/user";

type ProtectedArea = "learner" | "teacher" | "admin";

type RoleGuardProps = {
  area: ProtectedArea;
  children: ReactNode;
};

const areaLabels: Record<ProtectedArea, string> = {
  learner: "espace apprenant",
  teacher: "espace enseignant",
  admin: "administration"
};

function getDemoUser(role: UserRole): User {
  return {
    id: `demo-${role}`,
    name: "Utilisateur démo",
    email: `${role}@learnit.local`,
    role,
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    lastActiveAt: new Date().toISOString()
  };
}

function canAccessArea(user: User, area: ProtectedArea) {
  switch (area) {
    case "learner":
      return canAccessLearnerArea(user);
    case "teacher":
      return canAccessTeacherArea(user);
    case "admin":
      return canAccessAdminArea(user);
    default:
      return false;
  }
}

export function RoleGuard({ area, children }: RoleGuardProps) {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const demoUser = useMemo(() => (currentRole ? getDemoUser(currentRole) : null), [currentRole]);
  const hasAccess = demoUser ? canAccessArea(demoUser, area) : false;

  useEffect(() => {
    setCurrentRole(getDemoRoleFromStorage());

    function handleDemoRoleChange(event: Event) {
      const candidateRole = (event as CustomEvent<{ role?: string }>).detail?.role ?? null;
      setCurrentRole(isUserRole(candidateRole) ? candidateRole : getDemoRoleFromStorage());
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === DEMO_ROLE_STORAGE_KEY) {
        setCurrentRole(isUserRole(event.newValue) ? event.newValue : "visitor");
      }
    }

    window.addEventListener(DEMO_ROLE_CHANGE_EVENT, handleDemoRoleChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(DEMO_ROLE_CHANGE_EVENT, handleDemoRoleChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  if (!currentRole) {
    return (
      <section className="role-guard" aria-live="polite">
        <div className="role-guard__message">
          <span>Mode démo</span>
          <h1>Vérification de l'accès.</h1>
          <p>Lecture du rôle local avant d'afficher cet espace.</p>
        </div>
      </section>
    );
  }

  if (hasAccess) {
    return children;
  }

  return (
    <section className="role-guard" aria-live="polite">
      <div className="role-guard__message">
        <span>Accès limité</span>
        <h1>Ce rôle ne permet pas d'ouvrir cet espace.</h1>
        <p>
          Le rôle actuel est <strong>{currentRole}</strong>. Sélectionnez un rôle compatible
          avec l'{areaLabels[area]} pour continuer en mode démo.
        </p>
        <div className="role-guard__status">
          <ShieldAlert size={17} aria-hidden="true" />
          <span>Cette vérification sera remplacée par une authentification réelle.</span>
        </div>
      </div>

      <RoleSwitcher />
    </section>
  );
}
