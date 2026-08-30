"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, XCircle } from "lucide-react";

import {
  applyForgeModuleRevisionAction,
  reviewForgeModuleAction
} from "@/app/app/teacher/forge/actions";
import {
  ForgeAIAction,
  ForgeAIComparison,
  ForgeAIPanel,
  ForgeAIProposal,
  ForgeAIReason,
  ForgeAIStatus,
  type ForgeAIState
} from "@/components/app/ForgeAIPrimitives";
import type { ForgeCourseRevisionIssue } from "@/types/forge-ai";

type ForgeModuleRevisionProps = {
  courseId: string;
  moduleId: string;
  title: string;
};

type Feedback = {
  state: Extract<ForgeAIState, "applied" | "error" | "stale">;
  text: string;
  technicalDetails?: string;
};

function getFailureState(message: string): Feedback["state"] {
  return message.includes("a changé depuis l'analyse") ? "stale" : "error";
}

export function ForgeModuleRevision({
  courseId,
  moduleId,
  title
}: ForgeModuleRevisionProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback>();
  const [hasNoIssue, setHasNoIssue] = useState(false);
  const [operation, setOperation] = useState<"analyze" | "apply">("analyze");
  const [proposal, setProposal] = useState<ForgeCourseRevisionIssue>();
  const [isPending, startTransition] = useTransition();

  function analyzeModule() {
    setFeedback(undefined);
    setHasNoIssue(false);
    setProposal(undefined);
    setOperation("analyze");

    startTransition(async () => {
      const result = await reviewForgeModuleAction({ courseId, moduleId });

      if (!result.ok) {
        setFeedback({
          state: getFailureState(result.error),
          technicalDetails: result.technicalDetails,
          text: result.error
        });
        return;
      }

      const issue = result.data.issues[0];

      if (!issue) {
        setHasNoIssue(true);
        return;
      }

      setProposal(issue);
    });
  }

  function applyProposal() {
    if (!proposal) {
      return;
    }

    const confirmed = window.confirm(
      "Appliquer cette proposition au titre et à la description du module ?"
    );

    if (!confirmed) {
      return;
    }

    setFeedback(undefined);
    setOperation("apply");

    startTransition(async () => {
      const result = await applyForgeModuleRevisionAction({
        courseId,
        issue: proposal,
        moduleId
      });

      if (!result.ok) {
        setFeedback({ state: getFailureState(result.error), text: result.error });
        return;
      }

      setProposal(undefined);
      setFeedback({ state: "applied", text: result.data.message });
      router.refresh();
    });
  }

  return (
    <ForgeAIPanel
      action={
        <ForgeAIAction
          disabled={isPending}
          icon={<Sparkles size={16} aria-hidden="true" />}
          isLoading={isPending && operation === "analyze"}
          loadingLabel="Analyse du module…"
          onClick={analyzeModule}
        >
          Analyser avec Forge
        </ForgeAIAction>
      }
      description={
        <>
          Contexte : « {title} ». Forge compare les informations enregistrées avec les leçons de
          ce module. Aucune modification n’est appliquée sans votre accord.
        </>
      }
      title="Révision pédagogique du module"
    >
      {isPending ? (
        <ForgeAIStatus
          description={
            operation === "apply"
              ? "La correction validée est en cours d’application."
              : "Le titre et la description sont comparés au contenu des leçons."
          }
          state="loading"
          title={operation === "apply" ? "Application de la proposition…" : "Forge analyse ce module…"}
        />
      ) : null}

      {feedback ? (
        <div className="forge-ai-error-recovery">
          <ForgeAIStatus description={feedback.text} state={feedback.state} />
          {feedback.state === "error" ? (
            <div>
              <button className="btn btn-secondary" disabled={isPending} onClick={analyzeModule} type="button">
                Réessayer
              </button>
              {feedback.technicalDetails ? (
                <details>
                  <summary>Détails techniques</summary>
                  <p>{feedback.technicalDetails}</p>
                </details>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {hasNoIssue ? (
        <ForgeAIStatus
          description="Forge n’a détecté aucune incohérence notable sur ce module."
          state="no-suggestion"
        />
      ) : null}

      {proposal ? (
        <ForgeAIProposal
          actions={
            <>
              <button
                className="btn btn-secondary"
                disabled={isPending}
                onClick={() => {
                  setProposal(undefined);
                  setFeedback(undefined);
                }}
                type="button"
              >
                <XCircle size={16} aria-hidden="true" />
                Ignorer
              </button>
              <ForgeAIAction
                disabled={isPending}
                icon={<CheckCircle2 size={16} aria-hidden="true" />}
                isLoading={isPending && operation === "apply"}
                loadingLabel="Application…"
                onClick={applyProposal}
                variant="primary"
              >
                Appliquer
              </ForgeAIAction>
            </>
          }
          label="Incohérence détectée"
          title="Une correction ciblée est proposée"
        >
          <ForgeAIComparison
            current={
              <>
                <h5>{proposal.current.title}</h5>
                <p>{proposal.current.description || "Aucune description."}</p>
              </>
            }
            proposed={
              <>
                <h5>{proposal.proposed.title}</h5>
                <p>{proposal.proposed.description}</p>
              </>
            }
          />
          <ForgeAIReason>{proposal.reason}</ForgeAIReason>
        </ForgeAIProposal>
      ) : null}
    </ForgeAIPanel>
  );
}
