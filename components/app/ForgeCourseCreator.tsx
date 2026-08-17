"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  Trash2,
  XCircle
} from "lucide-react";

import {
  deleteForgeCourseSourceAction,
  generateForgeCourseProposalAction,
  importForgeCourseProposalAction,
  uploadForgeCourseSourceAction
} from "@/app/app/teacher/forge/actions";
import { TeacherDomainPicker } from "@/components/app/TeacherDomainPicker";
import { courseLevelLabels } from "@/lib/teacher";
import type { CourseLevel, Domain } from "@/types/course";
import type {
  CourseBrief,
  CourseSource,
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

function getLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getLevel(formData: FormData, key: string, fallback: CourseLevel) {
  const value = getString(formData, key);
  return value === "beginner" || value === "intermediate" || value === "advanced"
    ? value
    : fallback;
}

function formatBytes(value: number) {
  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} Mo`;
  }

  return `${Math.max(1, Math.round(value / 1024))} Ko`;
}

function buildBrief(formData: FormData, sources: CourseSource[]): CourseBrief {
  return {
    constraints: getString(formData, "constraints"),
    domainId: getString(formData, "domainId"),
    duration: getString(formData, "duration"),
    entryLevel: getLevel(formData, "entryLevel", "beginner"),
    learningObjectives: getLines(getString(formData, "learningObjectives")),
    prerequisites: getString(formData, "prerequisites"),
    sourceIds: sources.map((source) => source.id),
    sources,
    subject: getString(formData, "subject"),
    targetAudience: getString(formData, "targetAudience"),
    targetLevel: getLevel(formData, "targetLevel", "intermediate")
  };
}

export function ForgeCourseCreator({ domains }: ForgeCourseCreatorProps) {
  const router = useRouter();
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<Feedback | undefined>();
  const [brief, setBrief] = useState<CourseBrief | undefined>();
  const [isPending, startTransition] = useTransition();
  const [isSourcePending, startSourceTransition] = useTransition();
  const [proposal, setProposal] = useState<ForgeCourseProposal | undefined>();
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [sourceFeedback, setSourceFeedback] = useState<Feedback | undefined>();
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceFile, setSourceFile] = useState<File | undefined>();
  const [sources, setSources] = useState<CourseSource[]>([]);

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
    const nextBrief = buildBrief(formData, sources);
    generateFromBrief(nextBrief);
  }

  function generateFromBrief(nextBrief: CourseBrief) {
    setFeedback(undefined);
    setBrief(nextBrief);

    startTransition(async () => {
      const result = await generateForgeCourseProposalAction(nextBrief);

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

  function uploadSource() {
    if (!sourceFile) {
      setSourceFeedback({ tone: "error", text: "Sélectionnez un fichier PDF, TXT ou Markdown." });
      return;
    }

    const formData = new FormData();
    formData.set("sourceTitle", sourceTitle);
    formData.set("sourceFile", sourceFile);
    setSourceFeedback(undefined);

    startSourceTransition(async () => {
      const result = await uploadForgeCourseSourceAction(formData);

      if (!result.ok) {
        setSourceFeedback({ tone: "error", text: result.error });
        return;
      }

      setSources((current) => [result.data, ...current]);
      setSourceTitle("");
      setSourceFile(undefined);

      if (sourceInputRef.current) {
        sourceInputRef.current.value = "";
      }

      setSourceFeedback({ tone: "success", text: "Source ajoutée au Course Brief." });
    });
  }

  function deleteSource(sourceId: string) {
    setSourceFeedback(undefined);

    startSourceTransition(async () => {
      const result = await deleteForgeCourseSourceAction(sourceId);

      if (!result.ok) {
        setSourceFeedback({ tone: "error", text: result.error });
        return;
      }

      setSources((current) => current.filter((source) => source.id !== sourceId));
      setSourceFeedback({ tone: "success", text: "Source retirée du Course Brief." });
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
    if (!proposal || !brief || !hasSelection) {
      setFeedback({ tone: "error", text: "Sélectionnez au moins une leçon avant l'import." });
      return;
    }

    startTransition(async () => {
      const result = await importForgeCourseProposalAction({
        brief,
        domainId: brief.domainId,
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
            <h2>Course Brief</h2>
          </div>
          <div className="teacher-form-grid">
            <label className="teacher-field teacher-field--wide">
              <span>Sujet / titre de travail</span>
              <input name="subject" placeholder="Ex. Créer un portfolio web professionnel" required />
            </label>
            <TeacherDomainPicker domains={domains} selectedDomainId={domains[0]?.id} />
            <label className="teacher-field">
              <span>Niveau initial</span>
              <select name="entryLevel" defaultValue="beginner">
                {levelOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="teacher-field">
              <span>Niveau visé</span>
              <select name="targetLevel" defaultValue="intermediate">
                {levelOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="teacher-field teacher-field--wide">
              <span>Public cible</span>
              <input name="targetAudience" placeholder="Ex. indépendants créatifs débutants" required />
            </label>
            <label className="teacher-field teacher-field--wide">
              <span>Objectifs pédagogiques</span>
              <textarea
                name="learningObjectives"
                placeholder="Un objectif par ligne. Ex. Produire une page portfolio publiable."
                required
                rows={4}
              />
            </label>
            <label className="teacher-field teacher-field--wide">
              <span>Prérequis</span>
              <textarea
                name="prerequisites"
                placeholder="Ex. savoir naviguer dans un éditeur de code, disposer d'un projet personnel."
                rows={3}
              />
            </label>
            <label className="teacher-field">
              <span>Durée cible</span>
              <input name="duration" placeholder="Ex. 4 semaines, 6 heures" />
            </label>
            <label className="teacher-field teacher-field--wide">
              <span>Contraintes particulières</span>
              <textarea
                name="constraints"
                placeholder="Ex. pas de jargon technique, privilégier les exercices courts."
                rows={3}
              />
            </label>
          </div>
        </section>

        <section className="teacher-form-section">
          <div>
            <span>Sources</span>
            <h2>Contexte documentaire</h2>
          </div>
          <div className="teacher-form-grid teacher-form-grid--compact">
            <label className="teacher-field">
              <span>Titre de la source</span>
              <input
                disabled={isSourcePending}
                onChange={(event) => setSourceTitle(event.target.value)}
                placeholder="Ex. Référentiel de compétences"
                type="text"
                value={sourceTitle}
              />
            </label>
            <label className="teacher-field">
              <span>Fichier PDF, TXT ou Markdown</span>
              <input
                accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
                disabled={isSourcePending}
                onChange={(event) => setSourceFile(event.target.files?.[0])}
                ref={sourceInputRef}
                type="file"
              />
            </label>
            <div className="teacher-form-actions">
              <button
                className="btn btn-secondary"
                disabled={isSourcePending || !sourceFile}
                onClick={uploadSource}
                type="button"
              >
                {isSourcePending ? (
                  <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" />
                ) : (
                  <FileText size={16} aria-hidden="true" />
                )}
                {isSourcePending ? "Ajout..." : "Ajouter la source"}
              </button>
            </div>
          </div>

          {sourceFeedback ? (
            <div
              className={sourceFeedback.tone === "error" ? "teacher-form-error" : "teacher-toast"}
              role={sourceFeedback.tone === "error" ? "alert" : "status"}
            >
              {sourceFeedback.text}
            </div>
          ) : null}

          {sources.length > 0 ? (
            <div className="forge-source-list">
              {sources.map((source) => (
                <article className="forge-source-item" key={source.id}>
                  <FileText size={17} aria-hidden="true" />
                  <div>
                    <strong>{source.title}</strong>
                    <span>
                      {source.fileName} · {formatBytes(source.fileSize)}
                    </span>
                  </div>
                  <button
                    aria-label={`Retirer ${source.title}`}
                    className="btn btn-secondary btn-icon"
                    disabled={isSourcePending}
                    onClick={() => deleteSource(source.id)}
                    type="button"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <p className="teacher-field-note">
              Les sources sont facultatives. Forge les traitera comme du contexte, jamais comme des instructions.
            </p>
          )}

          <div className="teacher-form-actions">
            <button className="btn btn-primary" disabled={isPending} type="submit">
              {isPending ? (
                <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" />
              ) : (
                <Sparkles size={17} aria-hidden="true" />
              )}
              {isPending ? "Forge prépare une proposition..." : "Analyser et générer"}
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
          <div
            className={feedback.tone === "error" ? "teacher-form-error" : "teacher-toast"}
            role={feedback.tone === "error" ? "alert" : "status"}
          >
            {feedback.text}
          </div>
        ) : null}

        {!proposal ? (
          <div className="teacher-builder-empty teacher-builder-empty--compact">
            <span>
              <Sparkles size={22} aria-hidden="true" />
            </span>
            <h2>Aucune proposition générée.</h2>
            <p>Décrivez un Course Brief pour obtenir une structure révisable.</p>
          </div>
        ) : (
          <div className="forge-proposal">
            <header>
              <div>
                <span>{courseLevelLabels[proposal.level]}</span>
                <h3>{proposal.title}</h3>
                <p>{proposal.summary}</p>
                <small>Généré à partir de {proposal.sourceCount ?? 0} source(s).</small>
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
              <button
                className="btn btn-secondary"
                disabled={isPending}
                onClick={() => setProposal(undefined)}
                type="button"
              >
                Annuler
              </button>
              <button
                className="btn btn-secondary"
                disabled={isPending || !brief}
                onClick={() => {
                  if (brief) {
                    generateFromBrief(brief);
                  }
                }}
                type="button"
              >
                Régénérer
              </button>
              <button
                className="btn btn-primary"
                disabled={isPending || !hasSelection}
                onClick={handleImport}
                type="button"
              >
                {isPending ? (
                  <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" />
                ) : (
                  <CheckCircle2 size={17} aria-hidden="true" />
                )}
                {isPending ? "Import..." : `Importer ${selectedModuleCount} module(s), ${selectedLessonCount} leçon(s)`}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
