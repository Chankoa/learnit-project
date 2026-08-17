"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Sparkles, XCircle } from "lucide-react";

import {
  generateForgeCourseProposalAction,
  importForgeCourseProposalAction
} from "@/app/app/teacher/forge/actions";
import { courseLevelLabels } from "@/lib/teacher";
import type { CourseLevel, Domain } from "@/types/course";
import type {
  ForgeCourseIntent,
  ForgeCourseProposal
} from "@/types/forge-ai";

type ForgeCourseCreatorProps = {
  domains: Domain[];
};

type Feedback = {
  tone: "error" | "success";
  text: string;
};

const levelOptions = Object.entries(courseLevelLabels) as Array<[CourseLevel, string]>;

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function buildIntent(formData: FormData): ForgeCourseIntent {
  const level = getString(formData, "level") as CourseLevel;

  return {
    audience: getString(formData, "audience"),
    constraints: getString(formData, "constraints"),
    domainId: getString(formData, "domainId"),
    duration: getString(formData, "duration"),
    goal: getString(formData, "goal"),
    level,
    subject: getString(formData, "subject"),
    tone: getString(formData, "tone")
  };
}

export function ForgeCourseCreator({ domains }: ForgeCourseCreatorProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | undefined>();
  const [intent, setIntent] = useState<ForgeCourseIntent | undefined>();
  const [isPending, startTransition] = useTransition();
  const [proposal, setProposal] = useState<ForgeCourseProposal | undefined>();
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());

  const selectedLessonCount = selectedLessons.size;
  const selectedModuleCount = selectedModules.size;
  const hasSelection = selectedLessonCount > 0 && selectedModuleCount > 0;

  const allLessonIds = useMemo(
    () => proposal?.modules.flatMap((module) => module.lessons.map((lesson) => lesson.clientId)) ?? [],
    [proposal]
  );

  function selectAll(nextProposal: ForgeCourseProposal) {
    setSelectedModules(new Set(nextProposal.modules.map((module) => module.clientId)));
    setSelectedLessons(
      new Set(nextProposal.modules.flatMap((module) => module.lessons.map((lesson) => lesson.clientId)))
    );
  }

  function handleGenerate(formData: FormData) {
    const nextIntent = buildIntent(formData);
    generateFromIntent(nextIntent);
  }

  function generateFromIntent(nextIntent: ForgeCourseIntent) {
    setFeedback(undefined);
    setIntent(nextIntent);

    startTransition(async () => {
      const result = await generateForgeCourseProposalAction(nextIntent);

      if (result.ok) {
        setProposal(result.data);
        selectAll(result.data);
        setFeedback({
          tone: "success",
          text: "Proposition générée par IA — à valider avant import."
        });
      } else {
        setProposal(undefined);
        setFeedback({ tone: "error", text: result.error });
      }
    });
  }

  function toggleModule(moduleId: string, lessonIds: string[]) {
    setSelectedModules((current) => {
      const next = new Set(current);
      const enabled = next.has(moduleId);

      if (enabled) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }

      return next;
    });

    setSelectedLessons((current) => {
      const next = new Set(current);
      const enabled = selectedModules.has(moduleId);

      lessonIds.forEach((lessonId) => {
        if (enabled) {
          next.delete(lessonId);
        } else {
          next.add(lessonId);
        }
      });

      return next;
    });
  }

  function toggleLesson(moduleId: string, lessonId: string) {
    setSelectedLessons((current) => {
      const next = new Set(current);

      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }

      setSelectedModules((moduleSelection) => {
        const nextModules = new Set(moduleSelection);
        const module = proposal?.modules.find((item) => item.clientId === moduleId);
        const hasSelectedLesson = module?.lessons.some((lesson) =>
          lesson.clientId === lessonId ? !current.has(lessonId) : next.has(lesson.clientId)
        );

        if (hasSelectedLesson) {
          nextModules.add(moduleId);
        } else {
          nextModules.delete(moduleId);
        }

        return nextModules;
      });

      return next;
    });
  }

  function handleImport() {
    if (!proposal || !intent || !hasSelection) {
      setFeedback({ tone: "error", text: "Sélectionnez au moins une leçon avant l'import." });
      return;
    }

    startTransition(async () => {
      const result = await importForgeCourseProposalAction({
        domainId: intent.domainId,
        proposal,
        selection: {
          lessonIds: Array.from(selectedLessons),
          moduleIds: Array.from(selectedModules)
        }
      });

      if (result.ok) {
        router.push(result.destination);
      } else {
        setFeedback({ tone: "error", text: result.error });
      }
    });
  }

  return (
    <div className="forge-ai-layout">
      <form action={handleGenerate} className="teacher-form forge-ai-form">
        <section className="teacher-form-section">
          <div>
            <span>Forge AI</span>
            <h2>Intention pédagogique</h2>
          </div>
          <div className="teacher-form-grid">
            <label className="teacher-field teacher-field--wide">
              <span>Sujet / thème</span>
              <input name="subject" placeholder="Ex. Créer un portfolio web professionnel" required />
            </label>
            <label className="teacher-field">
              <span>Domaine</span>
              <select name="domainId" required defaultValue={domains[0]?.id ?? ""}>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="teacher-field">
              <span>Niveau</span>
              <select name="level" defaultValue="beginner">
                {levelOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="teacher-field teacher-field--wide">
              <span>Public cible</span>
              <input name="audience" placeholder="Ex. indépendants créatifs débutants" required />
            </label>
            <label className="teacher-field teacher-field--wide">
              <span>Objectif général</span>
              <textarea
                name="goal"
                placeholder="Ce que l'apprenant doit être capable de produire ou réaliser."
                required
                rows={4}
              />
            </label>
            <label className="teacher-field">
              <span>Durée envisagée</span>
              <input name="duration" placeholder="Ex. 4 semaines, 6 heures" />
            </label>
            <label className="teacher-field">
              <span>Ton / approche</span>
              <input name="tone" placeholder="Ex. pratique, direct, accessible" />
            </label>
            <label className="teacher-field teacher-field--wide">
              <span>Contraintes</span>
              <textarea
                name="constraints"
                placeholder="Ex. pas de prérequis technique, privilégier les exercices courts."
                rows={3}
              />
            </label>
          </div>
          <div className="teacher-form-actions">
            <button className="btn btn-primary" disabled={isPending} type="submit">
              {isPending ? <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" /> : <Sparkles size={17} aria-hidden="true" />}
              {isPending ? "Forge prépare une proposition..." : "Générer une structure"}
            </button>
          </div>
        </section>
      </form>

      <section className="teacher-form-section forge-ai-preview" aria-live="polite">
        <div>
          <span>Prévisualisation</span>
          <h2>Proposition générée par IA — à valider</h2>
        </div>

        {feedback ? (
          <div className={feedback.tone === "error" ? "teacher-form-error" : "teacher-toast"} role={feedback.tone === "error" ? "alert" : "status"}>
            {feedback.text}
          </div>
        ) : null}

        {!proposal ? (
          <div className="teacher-builder-empty teacher-builder-empty--compact">
            <span>
              <Sparkles size={22} aria-hidden="true" />
            </span>
            <h2>Aucune proposition générée.</h2>
            <p>Décrivez une intention pédagogique pour obtenir une structure révisable.</p>
          </div>
        ) : (
          <div className="forge-proposal">
            <header>
              <div>
                <span>{courseLevelLabels[proposal.level]}</span>
                <h3>{proposal.title}</h3>
                <p>{proposal.summary}</p>
              </div>
            </header>

            <section>
              <h4>Objectifs pédagogiques</h4>
              <ul>
                {proposal.objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            </section>

            <div className="forge-proposal__selection">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedModules(new Set(proposal.modules.map((module) => module.clientId)));
                  setSelectedLessons(new Set(allLessonIds));
                }}
                type="button"
              >
                <CheckCircle2 size={16} aria-hidden="true" />
                Tout sélectionner
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedModules(new Set());
                  setSelectedLessons(new Set());
                }}
                type="button"
              >
                <XCircle size={16} aria-hidden="true" />
                Tout désélectionner
              </button>
            </div>

            {proposal.modules.map((module, moduleIndex) => {
              const lessonIds = module.lessons.map((lesson) => lesson.clientId);

              return (
                <article className="forge-proposal-module" key={module.clientId}>
                  <label>
                    <input
                      checked={selectedModules.has(module.clientId)}
                      onChange={() => toggleModule(module.clientId, lessonIds)}
                      type="checkbox"
                    />
                    <span>Module {moduleIndex + 1}</span>
                    <strong>{module.title}</strong>
                  </label>
                  {module.description ? <p>{module.description}</p> : null}

                  <div>
                    {module.lessons.map((lesson) => (
                      <label className="forge-proposal-lesson" key={lesson.clientId}>
                        <input
                          checked={selectedLessons.has(lesson.clientId)}
                          onChange={() => toggleLesson(module.clientId, lesson.clientId)}
                          type="checkbox"
                        />
                        <span>
                          <strong>{lesson.title}</strong>
                          <small>
                            {lesson.objective ?? "Objectif à préciser"}
                            {lesson.estimatedMinutes ? ` · ${lesson.estimatedMinutes} min` : ""}
                          </small>
                        </span>
                      </label>
                    ))}
                  </div>
                </article>
              );
            })}

            <div className="teacher-form-actions">
              <button className="btn btn-secondary" disabled={isPending} onClick={() => setProposal(undefined)} type="button">
                Annuler
              </button>
              <button
                className="btn btn-secondary"
                disabled={isPending || !intent}
                onClick={() => {
                  if (intent) {
                    generateFromIntent(intent);
                  }
                }}
                type="button"
              >
                Régénérer
              </button>
              <button className="btn btn-primary" disabled={isPending || !hasSelection} onClick={handleImport} type="button">
                {isPending ? <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" /> : <CheckCircle2 size={17} aria-hidden="true" />}
                {isPending ? "Import..." : `Importer ${selectedModuleCount} module(s), ${selectedLessonCount} leçon(s)`}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
