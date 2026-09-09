"use client";

import {
  BookOpenText,
  CircleHelp,
  Lightbulb,
  MessageCircleQuestion,
  RefreshCw,
  Sparkles,
  X
} from "lucide-react";
import { useState, useTransition } from "react";

import { CanonicalCourseWorkspace } from "@/components/app/CanonicalCourseWorkspace";
import { askLearnerForgeAction } from "@/app/learn/forge-actions";
import { ForgeAIStatus } from "@/components/app/ForgeAIPrimitives";

import type { LearnerForgeAction, LearnerForgeResponse } from "@/types/forge-ai";
import type { LearnerProfile } from "@/types/learning";
import type { ReactNode } from "react";

type LearnerLessonWorkspaceProps = {
  children: ReactNode;
  courseId: string;
  courseTitle: string;
  identity: { avatarUrl?: string; initials: string; name: string };
  learner: LearnerProfile;
  lessonId: string;
  lessonTitle: string;
  mobileDrawerContent: ReactNode;
  sidebar: ReactNode;
  sourceSummary: { count: number; titles: string[] };
  workspaceContext?: {
    headerActions?: ReactNode;
    homeHref: string;
    homeLabel: string;
    relationLabel?: string;
  };
};

const actions: Array<{
  action: Exclude<LearnerForgeAction, "freeform">;
  icon: typeof Sparkles;
  label: string;
}> = [
  { action: "explain", icon: BookOpenText, label: "Expliquer" },
  { action: "clarify", icon: CircleHelp, label: "Clarifier" },
  { action: "rephrase", icon: RefreshCw, label: "Reformuler" },
  { action: "example", icon: Lightbulb, label: "Donner un exemple" },
  { action: "question", icon: MessageCircleQuestion, label: "Me questionner" }
];

export function LearnerLessonWorkspace({
  children,
  courseId,
  courseTitle,
  identity,
  learner,
  lessonId,
  lessonTitle,
  mobileDrawerContent,
  sidebar,
  sourceSummary,
  workspaceContext
}: LearnerLessonWorkspaceProps) {
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<LearnerForgeAction>();
  const [question, setQuestion] = useState("");
  const [lastRequest, setLastRequest] = useState<{ action: LearnerForgeAction; question?: string }>();
  const [response, setResponse] = useState<LearnerForgeResponse>();
  const [error, setError] = useState<string>();
  function askForge(action: LearnerForgeAction, freeformQuestion?: string) {
    setError(undefined);
    setPendingAction(action);
    setLastRequest({ action, question: freeformQuestion });

    startTransition(async () => {
      const result = await askLearnerForgeAction({
        action,
        courseId,
        lessonId,
        question: freeformQuestion
      });

      if (result.ok) {
        setResponse(result.data);
        if (action === "freeform") setQuestion("");
      } else {
        setError(result.error);
      }
      setPendingAction(undefined);
    });
  }

  const panel = (
      <div className="learner-forge-panel__body">
        <section className="learner-forge-context" aria-labelledby="learner-forge-context-title">
          <h3 id="learner-forge-context-title">Contexte actif</h3>
          <strong>{lessonTitle}</strong>
          <span>{courseTitle}</span>
          <details>
            <summary>Sources du cours : {sourceSummary.count}</summary>
            {sourceSummary.titles.length ? (
              <ul>{sourceSummary.titles.map((title) => <li key={title}>{title}</li>)}</ul>
            ) : <p>Aucune source documentaire exploitable.</p>}
          </details>
        </section>

        <section className="learner-forge-actions" aria-labelledby="learner-forge-actions-title">
          <h3 id="learner-forge-actions-title">Comment Forge peut vous aider</h3>
          <div>
            {actions.map(({ action, icon: Icon, label }) => (
              <button
                className="btn btn-secondary"
                disabled={isPending}
                key={action}
                onClick={() => askForge(action)}
                type="button"
              >
                <Icon size={16} aria-hidden="true" />
                {isPending && pendingAction === action ? "Forge analyse…" : label}
              </button>
            ))}
          </div>
        </section>

        <form
          className="learner-forge-question"
          onSubmit={(event) => {
            event.preventDefault();
            if (question.trim().length >= 3) askForge("freeform", question.trim());
          }}
        >
          <label htmlFor="learner-forge-question">Votre question</label>
          <textarea
            disabled={isPending}
            id="learner-forge-question"
            maxLength={600}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Posez une question sur cette leçon…"
            rows={4}
            value={question}
          />
          <button className="btn btn-primary" disabled={isPending || question.trim().length < 3} type="submit">
            <MessageCircleQuestion size={16} aria-hidden="true" />
            {isPending && pendingAction === "freeform" ? "Forge répond…" : "Poser ma question"}
          </button>
        </form>

        <div aria-live="polite" aria-busy={isPending || undefined} className="learner-forge-result">
          {isPending ? (
            <ForgeAIStatus description="Forge s'appuie sur la leçon et ses sources disponibles." state="loading" title="Forge analyse cette étape…" />
          ) : null}
          {error ? (
            <div className="learner-forge-error">
              <ForgeAIStatus description={error} state="error" />
              {lastRequest ? (
                <button className="btn btn-secondary" onClick={() => askForge(lastRequest.action, lastRequest.question)} type="button">
                  Réessayer
                </button>
              ) : null}
            </div>
          ) : null}
          {!isPending && !error && response ? (
            <article>
              <span>Réponse Forge</span>
              <p>{response.answer}</p>
              {response.example ? <div><strong>Exemple</strong><p>{response.example}</p></div> : null}
              {response.checkQuestion ? <div><strong>À vous</strong><p>{response.checkQuestion}</p></div> : null}
              {response.sourceReferences.length ? (
                <details>
                  <summary>Sources utilisées : {response.sourceReferences.length}</summary>
                  <ul>{response.sourceReferences.map((source) => <li key={source.sourceId}>{source.label}</li>)}</ul>
                </details>
              ) : null}
            </article>
          ) : null}
        </div>
      </div>
  );

  return (
    <div className="teacher-focus-page unified-authoring-workspace canonical-learning-workspace">
      <CanonicalCourseWorkspace
        mode="learn"
        courseTitle={courseTitle}
        selectedId={lessonId}
        selectedTitle={lessonTitle}
        selectedKind="Leçon"
        identityName={identity.name}
        meta={null}
        modeActions={workspaceContext?.headerActions}
        returnHref={workspaceContext?.homeHref ?? "/app/courses"}
        returnLabel="Retour au parcours"
        structure={sidebar}
        content={<article className="lesson-page">{children}</article>}
        forgePanel={panel}
      />
    </div>
  );
}
