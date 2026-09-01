"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

type TeacherModuleDisclosureProps = {
  actions: ReactNode;
  active: boolean;
  children: ReactNode;
  controlsId: string;
  forcedOpen?: boolean;
  heading: ReactNode;
  meta: ReactNode;
};

export function TeacherModuleDisclosure({
  actions,
  active,
  children,
  controlsId,
  forcedOpen = false,
  heading,
  meta
}: TeacherModuleDisclosureProps) {
  const [expanded, setExpanded] = useState(true);
  const isOpen = forcedOpen || expanded;

  return (
    <section className="teacher-builder-module" data-active={active}>
      <div className="teacher-builder-module__row">
        {heading}
        <div className="teacher-builder-module__controls">
          {actions}
          <button
            aria-label={isOpen ? "Masquer les leçons" : "Afficher les leçons"}
            aria-controls={controlsId}
            aria-expanded={isOpen}
            className="teacher-builder-module__toggle"
            disabled={forcedOpen}
            onClick={() => setExpanded((current) => !current)}
            title={forcedOpen ? "Le module de la leçon active reste ouvert" : isOpen ? "Masquer les leçons" : "Afficher les leçons"}
            type="button"
          >
            <ChevronDown aria-hidden="true" size={16} />
          </button>
        </div>
      </div>

      {meta}

      <div className="teacher-builder-module__body" hidden={!isOpen} id={controlsId}>
        {children}
      </div>
    </section>
  );
}
