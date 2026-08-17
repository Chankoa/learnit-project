"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Sparkles } from "lucide-react";

import { generateForgeLessonSuggestionAction } from "@/app/app/teacher/forge/actions";
import type {
  ForgeLessonAction,
  ForgeLessonSuggestion
} from "@/types/forge-ai";

type ForgeLessonAssistantProps = {
  content?: string;
  courseId: string;
  description?: string;
  lessonId: string;
  targetTextareaId: string;
  title: string;
};

const actionLabels: Record<ForgeLessonAction, string> = {
  intro: "Générer une introduction",
  plan: "Proposer un plan",
  simplify: "Simplifier",
  summary: "Générer une synthèse"
};

export function ForgeLessonAssistant({
  content,
  courseId,
  description,
  lessonId,
  targetTextareaId,
  title
}: ForgeLessonAssistantProps) {
  const [action, setAction] = useState<ForgeLessonAction>("plan");
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [suggestion, setSuggestion] = useState<ForgeLessonSuggestion | undefined>();

  function generate() {
    setError(undefined);

    startTransition(async () => {
      const result = await generateForgeLessonSuggestionAction({
        action,
        content,
        courseId,
        description,
        lessonId,
        title
      });

      if (result.ok) {
        setSuggestion(result.data);
      } else {
        setSuggestion(undefined);
        setError(result.error);
      }
    });
  }

  function insertSuggestion() {
    if (!suggestion) {
      return;
    }

    const textarea = document.getElementById(targetTextareaId);

    if (!(textarea instanceof HTMLTextAreaElement)) {
      setError("Champ de contenu introuvable. Rechargez la page puis réessayez.");
      return;
    }

    const current = textarea.value.trim();
    textarea.value = current ? `${current}\n\n${suggestion.content}` : suggestion.content;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.focus();
    setError(undefined);
  }

  return (
    <section className="forge-lesson-assistant" aria-live="polite">
      <div>
        <span>Forge AI</span>
        <h3>Demander à Forge</h3>
        <p>La proposition reste locale au formulaire tant que vous ne cliquez pas sur Enregistrer.</p>
      </div>

      <div className="forge-lesson-assistant__controls">
        <label className="teacher-field">
          <span>Action</span>
          <select value={action} onChange={(event) => setAction(event.target.value as ForgeLessonAction)}>
            {Object.entries(actionLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="btn btn-secondary" disabled={isPending} onClick={generate} type="button">
          {isPending ? <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" /> : <Sparkles size={16} aria-hidden="true" />}
          {isPending ? "Forge prépare une proposition..." : "Demander à Forge"}
        </button>
      </div>

      {error ? (
        <div className="teacher-form-error" role="alert">
          {error}
        </div>
      ) : null}

      {suggestion ? (
        <article className="forge-lesson-suggestion">
          <span>Proposition générée par IA — à valider</span>
          <h4>{suggestion.title}</h4>
          <pre>{suggestion.content}</pre>
          <div className="teacher-form-actions">
            <button className="btn btn-secondary" onClick={() => setSuggestion(undefined)} type="button">
              Annuler
            </button>
            <button className="btn btn-primary" onClick={insertSuggestion} type="button">
              <CheckCircle2 size={16} aria-hidden="true" />
              Insérer dans le contenu
            </button>
          </div>
        </article>
      ) : null}
    </section>
  );
}
