import type { ReactNode } from "react";

type CreatorWorkspaceHeaderProps = {
  actions?: ReactNode;
  eyebrow?: string;
  meta: ReactNode;
  status: "draft" | "published" | "review";
  statusLabel: string;
  title: string;
};

export function CreatorWorkspaceHeader({
  actions,
  eyebrow = "Création",
  meta,
  status,
  statusLabel,
  title
}: CreatorWorkspaceHeaderProps) {
  return (
    <section className="teacher-course-cockpit creator-workspace-header" aria-label="Création en cours">
      <div className="teacher-course-cockpit__identity">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
        </div>
        <span className="state-badge" data-state={status}>
          {statusLabel}
        </span>
      </div>
      <p className="teacher-course-cockpit__meta">{meta}</p>
      {actions ? <div className="teacher-course-cockpit__actions">{actions}</div> : null}
    </section>
  );
}
