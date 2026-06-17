"use client";

import { useEffect, useState } from "react";

import { roleSwitcherOptions, type ApplicationRole } from "@/lib/navigation";

const ROLE_STORAGE_KEY = "learnit-demo-role";

function isApplicationRole(value: string | null): value is ApplicationRole {
  return value === "visitor" || value === "learner" || value === "teacher" || value === "admin";
}

function getStoredRole(): ApplicationRole {
  try {
    const storedRole = window.localStorage.getItem(ROLE_STORAGE_KEY);

    return isApplicationRole(storedRole) ? storedRole : "visitor";
  } catch {
    return "visitor";
  }
}

function storeRole(role: ApplicationRole) {
  try {
    window.localStorage.setItem(ROLE_STORAGE_KEY, role);
  } catch {
    // The switcher remains usable even if storage is blocked.
  }
}

export function RoleSwitcher() {
  const [selectedRole, setSelectedRole] = useState<ApplicationRole>("visitor");

  useEffect(() => {
    setSelectedRole(getStoredRole());
  }, []);

  function handleRoleChange(role: ApplicationRole) {
    setSelectedRole(role);
    storeRole(role);
  }

  return (
    <section className="role-switcher" aria-label="Sélecteur de rôle de démonstration">
      <div>
        <span className="eyebrow w-fit">Mode démo</span>
        <h2>Basculer fictivement de rôle.</h2>
        <p>Ce choix est local au navigateur et prépare l'arrivée d'une authentification réelle.</p>
      </div>

      <div className="role-switcher__options" role="group" aria-label="Rôle actif">
        {roleSwitcherOptions.map((option) => (
          <button
            aria-pressed={selectedRole === option.role}
            className="role-switcher__option"
            data-active={selectedRole === option.role}
            key={option.role}
            type="button"
            onClick={() => handleRoleChange(option.role)}
          >
            <span>{option.label}</span>
            <small>{option.description}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
