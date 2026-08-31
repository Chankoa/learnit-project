"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, RotateCcw, Sparkles, XCircle } from "lucide-react";

import {
  applyLessonProposalAction,
  generateLessonWithForgeAction
} from "@/app/app/teacher/forge/actions";
import {
  ForgeAIStatus,
  type ForgeAIState
} from "@/components/app/ForgeAIPrimitives";
import { MarkdownLessonContent } from "@/components/learning/MarkdownLessonContent";
import type {
  ForgeLessonContentMode,
  ForgeLessonContentProposal
} from "@/types/forge-ai";

type ForgeLessonAssistantProps = {
  content?: string;
  courseId: string;
  courseTitle: string;
  description?: string;
  lessonId: string;
  moduleTitle: string;
  sourceCount: number;
  title: string;
};

type Feedback = {
  state: Extract<ForgeAIState, "applied" | "error" | "success">;
  text: string;
  technicalDetails?: string;
};

const modeLabels: Record<ForgeLessonContentMode, string> = {
  analyze: "Analyser cette leçon",
  examples: "Proposer des exemples",
  exercise: "Proposer un exercice",
  expand: "Développer",
  generate: "Générer le contenu",
  improve: "Améliorer le contenu",
  intro: "Générer une introduction",
  simplify: "Simplifier",
  summary: "Générer une synthèse"
};

const forgeActionModes: ForgeLessonContentMode[] = [
  "generate",
  "improve",
  "examples",
  "exercise",
  "simplify",
  "summary"
];

function toLines(values: string[]) {
  return values.join("\n");
}

function fromLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function ForgeLessonAssistant({
  content,
  courseId,
  courseTitle,
  description,
  lessonId,
  moduleTitle,
  sourceCount,
  title
}: ForgeLessonAssistantProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | undefined>();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<ForgeLessonContentMode>(content ? "improve" : "generate");
  const [proposal, setProposal] = useState<ForgeLessonContentProposal | undefined>();
  const [draft, setDraft] = useState<ForgeLessonContentProposal | undefined>();

  function generate(nextMode = mode) {
    setFeedback(undefined);

    startTransition(async () => {
      const result = await generateLessonWithForgeAction({
        content,
        courseId,
        description,
        lessonId,
        mode: nextMode,
        title
      });

      if (!result.ok) {
        setProposal(undefined);
        setDraft(undefined);
        setFeedback({
          state: "error",
          technicalDetails: result.technicalDetails,
          text: result.error
        });
        return;
      }

      setProposal(result.data);
      setDraft(result.data);
      setFeedback({
        state: "success",
        text: "Proposition Forge prête — vérifiez-la avant toute application."
      });
    });
  }

  function applyProposal() {
    if (!draft) {
      return;
    }

    if (mode === "analyze") {
      setFeedback({
        state: "error",
        text: "L'analyse est une recommandation : appliquez-la manuellement dans l'éditeur."
      });
      return;
    }

    startTransition(async () => {
      const result = await applyLessonProposalAction({
        courseId,
        lessonId,
        proposal: draft
      });

      if (!result.ok) {
        setFeedback({ state: "error", text: result.error });
        return;
      }

      setFeedback({ state: "applied", text: result.data.message });
      router.refresh();
    });
  }

  function updateDraft(next: Partial<ForgeLessonContentProposal>) {
    setDraft((current) => (current ? { ...current, ...next } : current));
  }

  return (
    <section className="forge-lesson-assistant" aria-live="polite">
      <div>
        <span>Contexte actif</span>
        <h3>Assistant de cette leçon</h3>
        <dl className="forge-lesson-assistant__context">
          <div>
            <dt>Formation</dt>
            <dd>{courseTitle}</dd>
          </div>
          <div>
            <dt>Module</dt>
            <dd>{moduleTitle}</dd>
          </div>
          <div>
            <dt>Leçon</dt>
            <dd>{title}</dd>
          </div>
          <div>
            <dt>Sources</dt>
            <dd>{sourceCount} source{sourceCount > 1 ? "s" : ""} associée{sourceCount > 1 ? "s" : ""}</dd>
          </div>
        </dl>
        <p>Forge recharge ce cours, ce module, les leçons voisines et les sources associées avant de préparer une proposition.</p>
      </div>

      <div className="forge-lesson-assistant__controls">
        <label className="teacher-field">
          <span>Action</span>
          <select value={mode} onChange={(event) => setMode(event.target.value as ForgeLessonContentMode)}>
            {forgeActionModes.map((value) => (
              <option key={value} value={value}>
                {modeLabels[value]}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary" disabled={isPending} onClick={() => generate()} type="button">
          {isPending ? <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}
          {isPending ? "Forge prépare une proposition..." : mode === "generate" ? "Générer la leçon" : "Préparer la proposition"}
        </button>
      </div>

      {feedback ? (
        <div className="forge-ai-error-recovery">
          <ForgeAIStatus description={feedback.text} state={feedback.state} />
          {feedback.state === "error" ? (
            <div>
              <button className="btn btn-secondary" disabled={isPending} onClick={() => generate(mode)} type="button">
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

      {proposal && draft ? (
        <article className="forge-lesson-suggestion">
          <span>Proposition IA à valider</span>
          <h4>{proposal.title}</h4>
          <div className="forge-lesson-diff">
            <section>
              <span>Contenu actuel</span>
              <pre>{content?.trim() || "Aucun contenu actuel."}</pre>
            </section>
            <section>
              <span>Proposition Forge</span>
              <label className="teacher-field">
                <span>Titre</span>
                <input
                  value={draft.title}
                  onChange={(event) => updateDraft({ title: event.target.value })}
                />
              </label>
              <label className="teacher-field">
                <span>Résumé</span>
                <textarea
                  rows={3}
                  value={draft.summary}
                  onChange={(event) => updateDraft({ summary: event.target.value })}
                />
              </label>
              <label className="teacher-field">
                <span>Objectifs</span>
                <textarea
                  rows={4}
                  value={toLines(draft.objectives)}
                  onChange={(event) => updateDraft({ objectives: fromLines(event.target.value) })}
                />
              </label>
              <label className="teacher-field">
                <span>Durée estimée</span>
                <input
                  min={1}
                  type="number"
                  value={draft.estimatedMinutes}
                  onChange={(event) => updateDraft({ estimatedMinutes: Number(event.target.value) || 20 })}
                />
              </label>
              <label className="teacher-field">
                <span>Contenu Markdown</span>
                <textarea
                  rows={14}
                  value={draft.contentMarkdown}
                  onChange={(event) => updateDraft({ contentMarkdown: event.target.value })}
                />
              </label>
              <div className="forge-lesson-rendered-preview">
                <span>Aperçu apprenant</span>
                <MarkdownLessonContent content={draft.contentMarkdown} />
              </div>
            </section>
          </div>

          <section className="forge-source-references">
            <h5>Sources utilisées</h5>
            {proposal.sourceReferences.length > 0 ? (
              <ul>
                {proposal.sourceReferences.map((reference) => (
                  <li key={`${reference.sourceId}-${reference.label}`}>
                    <strong>{reference.label}</strong>
                    {reference.excerpt ? <span>{reference.excerpt}</span> : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Aucune source documentaire citée pour cette proposition.</p>
            )}
          </section>

          <div className="teacher-form-actions">
            <button className="btn btn-secondary" disabled={isPending} onClick={() => generate(mode)} type="button">
              <RotateCcw size={16} aria-hidden="true" />
              Régénérer
            </button>
            <button
              className="btn btn-secondary"
              disabled={isPending}
              onClick={() => {
                setProposal(undefined);
                setDraft(undefined);
              }}
              type="button"
            >
              <XCircle size={16} aria-hidden="true" />
              Ignorer
            </button>
            <button
              className="btn btn-primary"
              disabled={isPending || mode === "analyze"}
              onClick={applyProposal}
              type="button"
            >
              <CheckCircle2 size={16} aria-hidden="true" />
              Accepter et enregistrer
            </button>
          </div>
        </article>
      ) : null}
    </section>
  );
}
