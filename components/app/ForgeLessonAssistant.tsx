"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, RotateCcw, Sparkles, XCircle } from "lucide-react";

import {
  applyLessonProposalAction,
  generateLessonWithForgeAction
} from "@/app/app/teacher/forge/actions";
import type {
  ForgeLessonContentMode,
  ForgeLessonContentProposal
} from "@/types/forge-ai";

type ForgeLessonAssistantProps = {
  content?: string;
  courseId: string;
  description?: string;
  lessonId: string;
  title: string;
};

type Feedback = {
  tone: "error" | "success";
  text: string;
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
  description,
  lessonId,
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
        setFeedback({ tone: "error", text: result.error });
        return;
      }

      setProposal(result.data);
      setDraft(result.data);
      setFeedback({
        tone: "success",
        text: "Proposition générée par IA — à valider avant application."
      });
    });
  }

  function applyProposal() {
    if (!draft) {
      return;
    }

    if (mode === "analyze") {
      setFeedback({
        tone: "error",
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
        setFeedback({ tone: "error", text: result.error });
        return;
      }

      setFeedback({ tone: "success", text: result.data.message });
      router.refresh();
    });
  }

  function updateDraft(next: Partial<ForgeLessonContentProposal>) {
    setDraft((current) => (current ? { ...current, ...next } : current));
  }

  return (
    <section className="forge-lesson-assistant" aria-live="polite">
      <div>
        <span>Forge AI</span>
        <h3>Modifier avec Forge AI</h3>
        <p>Forge utilise le contexte du cours, le module, les leçons voisines et les sources associées. Rien n'est appliqué sans validation.</p>
      </div>

      <div className="forge-lesson-assistant__controls">
        <label className="teacher-field">
          <span>Action</span>
          <select value={mode} onChange={(event) => setMode(event.target.value as ForgeLessonContentMode)}>
            {Object.entries(modeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-secondary" disabled={isPending} onClick={() => generate()} type="button">
          {isPending ? <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}
          {isPending ? "Forge prépare une proposition..." : "Modifier avec Forge AI"}
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

      {proposal && draft ? (
        <article className="forge-lesson-suggestion">
          <span>Preview obligatoire</span>
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
              Accepter
            </button>
          </div>
        </article>
      ) : null}
    </section>
  );
}
