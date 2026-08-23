"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Sparkles,
  XCircle
} from "lucide-react";

import {
  generateForgeCourseProposalAction,
  importForgeCourseProposalAction
} from "@/app/app/teacher/forge/actions";
import { ForgeAIPanel, ForgeAIStatus } from "@/components/app/ForgeAIPrimitives";
import { ForgeSourceManager } from "@/components/app/ForgeSourceManager";
import { TeacherDomainPicker } from "@/components/app/TeacherDomainPicker";
import { getForgeCourseBriefPrefill } from "@/lib/forge-ai/creation-intent";
import { courseLevelLabels } from "@/lib/teacher";
import type { CourseLevel, Domain } from "@/types/course";
import type {
  CourseBrief,
  CourseSource,
  ForgeCreationIntent,
  ForgeCourseProposal
} from "@/types/forge-ai";

type ForgeCourseCreatorProps = {
  domains: Domain[];
  initialIntent?: ForgeCreationIntent;
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

export function ForgeCourseCreator({ domains, initialIntent }: ForgeCourseCreatorProps) {
  const router = useRouter();
  const initialBrief = getForgeCourseBriefPrefill(initialIntent);
  const [audience, setAudience] = useState("");
  const [feedback, setFeedback] = useState<Feedback | undefined>();
  const [brief, setBrief] = useState<CourseBrief | undefined>();
  const [duration, setDuration] = useState("");
  const [isPending, startTransition] = useTransition();
  const [objectives, setObjectives] = useState("");
  const [proposal, setProposal] = useState<ForgeCourseProposal | undefined>();
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [sources, setSources] = useState<CourseSource[]>([]);
  const [subject, setSubject] = useState(initialBrief.subject);

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
    <div className="forge-course-creator">
      {initialIntent ? (
        <section className="forge-brief-intent" aria-labelledby="forge-brief-intent-title">
          <span>Votre intention</span>
          <blockquote id="forge-brief-intent-title">{initialIntent.text}</blockquote>
          <p>
            Forge a préparé ce point de départ. Complétez ce qui manque avant de demander une
            proposition.
          </p>
        </section>
      ) : null}

      <div className="forge-ai-layout">
        <form
          action={handleGenerate}
          aria-busy={isPending}
          className="teacher-form forge-ai-form forge-brief-workspace"
        >
          <section className="teacher-form-section forge-brief-essential">
            <div className="forge-brief-section-heading">
              <div>
                <span>Brief essentiel</span>
                <h2>Le point de départ</h2>
                <p>Les quatre informations utiles pour cadrer la proposition.</p>
              </div>
            </div>

            <div className="forge-brief-completeness" aria-label="État du brief essentiel">
              {[
                ["Sujet", subject],
                ["Public", audience],
                ["Objectifs", objectives],
                ["Durée", duration]
              ].map(([label, value]) => (
                <div data-complete={Boolean(value.trim())} key={label}>
                  <span>{label}</span>
                  <strong>{value.trim() ? "Renseigné" : "À préciser"}</strong>
                </div>
              ))}
            </div>

            <div className="teacher-form-grid">
              <label className="teacher-field teacher-field--wide">
                <span>Sujet / titre de travail</span>
                <input
                  name="subject"
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Ex. Construire un atelier sur la sécurité en canyoning"
                  required
                  value={subject}
                />
              </label>
              <label className="teacher-field teacher-field--wide">
                <span>Public cible</span>
                <input
                  name="targetAudience"
                  onChange={(event) => setAudience(event.target.value)}
                  placeholder="Ex. encadrants débutants en canyoning"
                  required
                  value={audience}
                />
              </label>
              <label className="teacher-field teacher-field--wide">
                <span>Objectifs pédagogiques</span>
                <textarea
                  name="learningObjectives"
                  onChange={(event) => setObjectives(event.target.value)}
                  placeholder="Un objectif observable par ligne."
                  required
                  rows={4}
                  value={objectives}
                />
              </label>
              <label className="teacher-field teacher-field--wide">
                <span>Durée cible</span>
                <input
                  name="duration"
                  onChange={(event) => setDuration(event.target.value)}
                  placeholder="Ex. 2 heures ou 3 semaines"
                  value={duration}
                />
              </label>
            </div>
          </section>

          <details className="forge-brief-advanced">
            <summary>
              <span>Affiner le brief</span>
              <small>Domaine, niveaux, prérequis et contraintes</small>
            </summary>
            <div className="teacher-form-grid">
              <TeacherDomainPicker domains={domains} />
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
                <span>Prérequis</span>
                <textarea
                  name="prerequisites"
                  placeholder="Ex. disposer d'une première expérience de terrain."
                  rows={3}
                />
              </label>
              <label className="teacher-field teacher-field--wide">
                <span>Contraintes particulières</span>
                <textarea
                  defaultValue={initialBrief.constraints}
                  name="constraints"
                  placeholder="Ex. privilégier des exercices courts et du vocabulaire accessible."
                  rows={3}
                />
              </label>
            </div>
          </details>

          <section className="teacher-form-section forge-brief-sources">
            <ForgeSourceManager
              onSourcesChange={setSources}
              sources={sources}
            />
          </section>

          <div className="forge-brief-submit">
            <p>Forge proposera une structure. Vous choisirez ensuite ce qui sera importé.</p>
            <button className="btn btn-primary" disabled={isPending} type="submit">
              {isPending ? (
                <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" />
              ) : (
                <Sparkles size={17} aria-hidden="true" />
              )}
              {isPending ? "Forge prépare une proposition…" : "Générer une proposition"}
            </button>
          </div>
        </form>

        <div className="forge-ai-preview" aria-live="polite">
          <ForgeAIPanel
            description={
              proposal
                ? "Examinez la structure, retirez les éléments inutiles puis importez uniquement votre sélection."
                : "À partir du brief, Forge proposera une structure de modules et de leçons adaptée à votre objectif."
            }
            eyebrow={proposal ? "Proposition Forge" : "Forge"}
            title={proposal ? "Une structure à vérifier" : "Ce que Forge va faire"}
          >

        {feedback ? (
          <ForgeAIStatus
            description={feedback.text}
            state={feedback.tone === "error" ? "error" : "success"}
          />
        ) : null}

        {isPending ? (
          <ForgeAIStatus
            description="Le brief et les sources sont analysés. Votre saisie reste disponible."
            state="loading"
            title="Forge prépare une proposition…"
          />
        ) : null}

        {!proposal && !isPending ? (
          <ul className="forge-preview-guidance">
            <li><CheckCircle2 size={17} aria-hidden="true" /> examiner la proposition ;</li>
            <li><CheckCircle2 size={17} aria-hidden="true" /> retirer des modules ou leçons ;</li>
            <li><CheckCircle2 size={17} aria-hidden="true" /> décider de ce qui est importé.</li>
            <li><Sparkles size={17} aria-hidden="true" /> Rien ne sera ajouté sans validation.</li>
          </ul>
        ) : (
          proposal ? (
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
                  <details className="forge-proposal-module__details">
                    <summary>
                      {module.lessons.length} leçon{module.lessons.length > 1 ? "s" : ""} · Voir le détail
                    </summary>
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
                  </details>
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
          ) : null
        )}
          </ForgeAIPanel>
        </div>
      </div>
    </div>
  );
}
