import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import {
  CheckCircle2,
  CircleDashed,
  Loader2,
  SearchCheck,
  Sparkles,
  TriangleAlert,
  XCircle
} from "lucide-react";

export type ForgeAIState =
  | "idle"
  | "loading"
  | "success"
  | "no-suggestion"
  | "error"
  | "stale"
  | "applied";

const stateConfiguration = {
  idle: {
    icon: CircleDashed,
    title: "Forge est prêt."
  },
  loading: {
    icon: Loader2,
    title: "Forge analyse le contenu…"
  },
  success: {
    icon: Sparkles,
    title: "Proposition Forge prête à être vérifiée."
  },
  "no-suggestion": {
    icon: SearchCheck,
    title: "Aucune correction nécessaire."
  },
  error: {
    icon: XCircle,
    title: "L’analyse Forge n’a pas abouti."
  },
  stale: {
    icon: TriangleAlert,
    title: "Cette proposition n’est plus à jour."
  },
  applied: {
    icon: CheckCircle2,
    title: "Proposition Forge appliquée."
  }
} satisfies Record<ForgeAIState, { icon: typeof Sparkles; title: string }>;

type ForgeAIActionProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  isLoading?: boolean;
  loadingLabel?: string;
  variant?: "primary" | "secondary";
};

export function ForgeAIAction({
  children,
  className,
  disabled,
  icon,
  isLoading = false,
  loadingLabel = "Forge analyse…",
  variant = "secondary",
  ...props
}: ForgeAIActionProps) {
  const classes = ["btn", `btn-${variant}`, "forge-ai-action", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      aria-busy={isLoading || undefined}
      className={classes}
      disabled={disabled || isLoading}
      type={props.type ?? "button"}
    >
      {isLoading ? (
        <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" />
      ) : (
        icon
      )}
      {isLoading ? loadingLabel : children}
    </button>
  );
}

type ForgeAIPanelProps = {
  action?: ReactNode;
  children?: ReactNode;
  description: ReactNode;
  eyebrow?: string;
  title: string;
};

export function ForgeAIPanel({
  action,
  children,
  description,
  eyebrow = "Forge AI",
  title
}: ForgeAIPanelProps) {
  const titleId = useId();

  return (
    <section className="forge-ai-panel" aria-labelledby={titleId}>
      <div className="forge-ai-panel__heading">
        <div>
          <span>{eyebrow}</span>
          <h3 id={titleId}>{title}</h3>
          <p>{description}</p>
        </div>
        {action ? <div className="forge-ai-panel__action">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

type ForgeAIStatusProps = {
  description?: ReactNode;
  state: ForgeAIState;
  title?: string;
};

export function ForgeAIStatus({ description, state, title }: ForgeAIStatusProps) {
  const configuration = stateConfiguration[state];
  const Icon = configuration.icon;

  return (
    <div
      className="forge-ai-status"
      data-state={state}
      role={state === "error" ? "alert" : "status"}
    >
      <Icon
        className={state === "loading" ? "auth-button-spinner" : undefined}
        size={18}
        aria-hidden="true"
      />
      <div>
        <strong>{title ?? configuration.title}</strong>
        {description ? <p>{description}</p> : null}
      </div>
    </div>
  );
}

type ForgeAIProposalProps = {
  actions?: ReactNode;
  children: ReactNode;
  label?: string;
  title: string;
};

export function ForgeAIProposal({
  actions,
  children,
  label = "Suggestion",
  title
}: ForgeAIProposalProps) {
  const titleId = useId();

  return (
    <article className="forge-ai-proposal" aria-labelledby={titleId}>
      <header>
        <span>{label}</span>
        <h4 id={titleId}>{title}</h4>
      </header>
      {children}
      {actions ? <ForgeAIDecisionBar>{actions}</ForgeAIDecisionBar> : null}
    </article>
  );
}

type ForgeAIComparisonProps = {
  current: ReactNode;
  currentLabel?: string;
  proposed: ReactNode;
  proposedLabel?: string;
};

export function ForgeAIComparison({
  current,
  currentLabel = "Actuel",
  proposed,
  proposedLabel = "Proposition"
}: ForgeAIComparisonProps) {
  return (
    <div className="forge-ai-comparison">
      <section>
        <span>{currentLabel}</span>
        {current}
      </section>
      <section>
        <span>{proposedLabel}</span>
        {proposed}
      </section>
    </div>
  );
}

export function ForgeAIReason({ children }: { children: ReactNode }) {
  return (
    <section className="forge-ai-reason">
      <span>Pourquoi ?</span>
      <p>{children}</p>
    </section>
  );
}

export function ForgeAIDecisionBar({ children }: { children: ReactNode }) {
  return (
    <div className="forge-ai-decision-bar" aria-label="Décision sur la proposition Forge">
      {children}
    </div>
  );
}
