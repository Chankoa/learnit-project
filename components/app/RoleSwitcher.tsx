"use client";

import { useEffect, useState } from "react";

import { useToast } from "@/components/app/ToastProvider";
import { getDemoRoleFromStorage, storeDemoRole } from "@/lib/auth/demo-role";
import { roleSwitcherOptions, type ApplicationRole } from "@/lib/navigation";

type RoleSwitcherProps = {
  variant?: "default" | "compact";
};

export function RoleSwitcher({ variant = "default" }: RoleSwitcherProps) {
  const [selectedRole, setSelectedRole] = useState<ApplicationRole>("visitor");
  const { showToast } = useToast();

  useEffect(() => {
    setSelectedRole(getDemoRoleFromStorage());
  }, []);

  function handleRoleChange(role: ApplicationRole) {
    const option = roleSwitcherOptions.find((item) => item.role === role);

    setSelectedRole(role);
    storeDemoRole(role);
    showToast({
      description: `Rôle actif localement : ${option?.label ?? role}. Aucun compte réel n'est connecté.`,
      title: "Rôle de démonstration modifié",
      variant: "info"
    });
  }

  return (
    <section className="role-switcher" data-variant={variant} aria-label="Sélecteur de rôle de démonstration">
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
