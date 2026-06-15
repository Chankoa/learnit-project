import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb
} from "lucide-react";
import type { ReactNode } from "react";

type CalloutVariant = "info" | "tip" | "warning" | "success";

type CalloutProps = {
  children: ReactNode;
  title?: string;
  variant?: CalloutVariant;
};

const calloutIcons = {
  info: Info,
  tip: Lightbulb,
  warning: AlertTriangle,
  success: CheckCircle2
};

export function Callout({
  children,
  title,
  variant = "info"
}: CalloutProps) {
  const Icon = calloutIcons[variant];

  return (
    <aside className="mdx-callout" data-variant={variant}>
      <Icon size={20} aria-hidden="true" />
      <div>
        {title ? <strong>{title}</strong> : null}
        <div>{children}</div>
      </div>
    </aside>
  );
}
