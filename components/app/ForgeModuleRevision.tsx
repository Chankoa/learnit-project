"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";

import {
  applyForgeModuleRevisionAction,
  reviewForgeModuleAction
} from "@/app/app/teacher/forge/actions";
import type { ForgeCourseRevisionIssue } from "@/types/forge-ai";

type ForgeModuleRevisionProps = {
  courseId: string;
  moduleId: string;
  title: string;
};

type Feedback = {
  tone: "error" | "success";
  text: string;
};

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
        setFeedback({ tone: "error", text: result.error });
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
        setFeedback({ tone: "error", text: result.error });
        return;
      }

      setProposal(undefined);
      setFeedback({ tone: "success", text: result.data.message });
      router.refresh();
    });
  }

  return (
    <section className="forge-module-revision" aria-live="polite">
      <div className="forge-module-revision__heading">
        <div>
          <span>Forge AI</span>
          <h3>Révision pédagogique du module</h3>
          <p>
            Contexte : « {title} ». Forge compare les informations enregistrées avec les leçons de
            ce module. Aucune modification n’est appliquée sans votre accord.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          disabled={isPending}
          onClick={analyzeModule}
          type="button"
        >
          {isPending && operation === "analyze" ? (
            <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" />
          ) : (
            <Sparkles size={16} aria-hidden="true" />
          )}
          {isPending && operation === "analyze" ? "Analyse du module…" : "Analyser avec Forge"}
        </button>
      </div>

      {feedback ? (
        <div
          className={feedback.tone === "error" ? "teacher-form-error" : "teacher-toast"}
          role={feedback.tone === "error" ? "alert" : "status"}
        >
          {feedback.text}
        </div>
      ) : null}

      {hasNoIssue ? (
        <div className="forge-module-revision__empty" role="status">
          <CheckCircle2 size={18} aria-hidden="true" />
          <p>Forge n’a détecté aucune incohérence notable sur ce module.</p>
        </div>
      ) : null}

      {proposal ? (
        <article className="forge-module-revision__proposal">
          <header>
            <span>Incohérence détectée</span>
            <h4>Une correction ciblée est proposée</h4>
          </header>

          <div className="forge-module-revision__diff">
            <section>
              <span>Actuel</span>
              <h5>{proposal.current.title}</h5>
              <p>{proposal.current.description || "Aucune description."}</p>
            </section>
            <section>
              <span>Proposition</span>
              <h5>{proposal.proposed.title}</h5>
              <p>{proposal.proposed.description}</p>
            </section>
          </div>

          <section className="forge-module-revision__reason">
            <span>Pourquoi ?</span>
            <p>{proposal.reason}</p>
          </section>

          <div className="teacher-form-actions">
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
            <button
              className="btn btn-primary"
              disabled={isPending}
              onClick={applyProposal}
              type="button"
            >
              {isPending && operation === "apply" ? (
                <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" />
              ) : (
                <CheckCircle2 size={16} aria-hidden="true" />
              )}
              {isPending && operation === "apply" ? "Application…" : "Appliquer"}
            </button>
          </div>
        </article>
      ) : null}
    </section>
  );
}
