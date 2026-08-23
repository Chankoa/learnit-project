"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, PencilLine, Sparkles } from "lucide-react";

import {
  ForgeAIAction,
  ForgeAIStatus
} from "@/components/app/ForgeAIPrimitives";
import {
  forgeCreationFormats,
  forgeCreationIntentLimits,
  getForgeCourseCreatorHref,
  validateForgeCreationIntent
} from "@/lib/forge-ai/creation-intent";
import type { ForgeCreationFormatHint } from "@/types/forge-ai";

export function ForgeHomeIntent() {
  const router = useRouter();
  const [formatHint, setFormatHint] = useState<ForgeCreationFormatHint>();
  const [intent, setIntent] = useState("");
  const [fieldError, setFieldError] = useState<string>();
  const [submissionError, setSubmissionError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError(undefined);
    setSubmissionError(undefined);

    const result = validateForgeCreationIntent({ formatHint, text: intent });

    if (!result.ok) {
      setFieldError(result.error);
      return;
    }

    startTransition(() => {
      try {
        router.push(getForgeCourseCreatorHref(result.data));
      } catch {
        setSubmissionError("Le point de départ n'a pas pu être préparé. Réessayez.");
      }
    });
  }

  return (
    <form
      aria-busy={isPending}
      className="forge-home-intent"
      onSubmit={handleSubmit}
    >
      <label className="forge-home-intent__label" htmlFor="forge-creation-intent">
        Décrivez une idée, un objectif ou un besoin pédagogique
      </label>

      <div className="forge-home-intent__field">
        <Sparkles size={20} aria-hidden="true" />
        <input
          aria-describedby={fieldError ? "forge-creation-intent-error" : undefined}
          aria-invalid={fieldError ? true : undefined}
          autoComplete="off"
          disabled={isPending}
          id="forge-creation-intent"
          maxLength={forgeCreationIntentLimits.maxLength}
          onChange={(event) => {
            setIntent(event.target.value);
            setFieldError(undefined);
            setSubmissionError(undefined);
          }}
          placeholder="Ex. Créer un parcours d'initiation aux agents IA pour des professionnels"
          type="text"
          value={intent}
        />
        <ForgeAIAction
          icon={<ArrowRight size={18} aria-hidden="true" />}
          isLoading={isPending}
          loadingLabel="Préparation…"
          type="submit"
          variant="primary"
        >
          Préparer le brief
        </ForgeAIAction>
      </div>

      {fieldError ? (
        <p className="forge-home-intent__error" id="forge-creation-intent-error" role="alert">
          {fieldError}
        </p>
      ) : null}

      <fieldset className="forge-home-intent__formats" disabled={isPending}>
        <legend>Préciser le format (facultatif)</legend>
        <div>
          {forgeCreationFormats.map((format) => {
            const selected = formatHint === format.value;

            return (
              <button
                aria-pressed={selected}
                key={format.value}
                onClick={() => setFormatHint(selected ? undefined : format.value)}
                title={format.description}
                type="button"
              >
                {format.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {isPending ? (
        <ForgeAIStatus
          description="Vous pourrez vérifier et compléter le Course Brief avant toute génération."
          state="loading"
          title="Forge prépare votre point de départ…"
        />
      ) : null}

      {submissionError ? (
        <ForgeAIStatus description={submissionError} state="error" />
      ) : null}

      <div className="forge-home-intent__footer">
        <p>Aucune génération ne démarre avant votre validation du brief.</p>
        <Link className="text-link" href="/app/teacher/courses/new">
          <PencilLine size={16} aria-hidden="true" />
          Créer manuellement
        </Link>
      </div>
    </form>
  );
}
