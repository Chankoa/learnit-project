import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

type AppEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: LucideIcon;
};

export function AppEmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox
}: AppEmptyStateProps) {
  return (
    <div className="app-empty-state">
      <span className="app-empty-state__icon">
        <Icon size={22} aria-hidden="true" />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {action ? <div className="app-empty-state__action">{action}</div> : null}
    </div>
  );
}
