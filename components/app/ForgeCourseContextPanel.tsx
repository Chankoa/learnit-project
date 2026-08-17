"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  FileText,
  Loader2,
  Sparkles,
  Trash2
} from "lucide-react";

import {
  applyForgeCourseImprovementAction,
  deleteForgeCourseSourceAction,
  generateForgeCourseImprovementAction,
  uploadForgeCourseSourceAction
} from "@/app/app/teacher/forge/actions";
import { TeacherDomainPicker } from "@/components/app/TeacherDomainPicker";
import { courseLevelLabels } from "@/lib/teacher";
import type { CourseLevel, Domain } from "@/types/course";
import type {
  CourseBrief,
  CourseSource,
  ForgeCourseImprovement,
  ForgeCourseImprovementInput
} from "@/types/forge-ai";
import type { TeacherCourse } from "@/types/teaching";

type ForgeCourseContextPanelProps = {
  course: TeacherCourse;
  domains: Domain[];
  initialSources: CourseSource[];
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

function buildBrief(formData: FormData, course: TeacherCourse, sources: CourseSource[]): CourseBrief {
  return {
    constraints: getString(formData, "constraints"),
    domainId: getString(formData, "domainId") || course.domain.id,
    duration: getString(formData, "duration"),
    entryLevel: getLevel(formData, "entryLevel", course.level),
    learningObjectives: getLines(getString(formData, "learningObjectives")),
    prerequisites: getString(formData, "prerequisites"),
    sourceIds: sources.map((source) => source.id),
    sources,
    subject: getString(formData, "subject") || course.title,
    targetAudience: getString(formData, "targetAudience"),
    targetLevel: getLevel(formData, "targetLevel", course.level)
  };
}

export function ForgeCourseContextPanel({
  course,
  domains,
  initialSources
}: ForgeCourseContextPanelProps) {
  const router = useRouter();
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<Feedback | undefined>();
  const [improvement, setImprovement] = useState<ForgeCourseImprovement | undefined>();
  const [isPending, startTransition] = useTransition();
  const [isSourcePending, startSourceTransition] = useTransition();
  const [sourceFeedback, setSourceFeedback] = useState<Feedback | undefined>();
  const [sourceFile, setSourceFile] = useState<File | undefined>();
  const [sourceTitle, setSourceTitle] = useState("");
  const [sources, setSources] = useState(initialSources);

  function handleGenerate(formData: FormData) {
    const mode = getString(formData, "mode") === "improve_structure" ? "improve_structure" : "analyze";
    const input: ForgeCourseImprovementInput = {
      brief: buildBrief(formData, course, sources),
      courseId: course.id,
      mode
    };

    setFeedback(undefined);

    startTransition(async () => {
      const result = await generateForgeCourseImprovementAction(input);

      if (!result.ok) {
        setImprovement(undefined);
        setFeedback({ tone: "error", text: result.error });
        return;
      }

      setImprovement(result.data);
      setFeedback({
        tone: "success",
        text: "Proposition Forge générée — aucune modification appliquée."
      });
    });
  }

  function uploadSource() {
    if (!sourceFile) {
      setSourceFeedback({ tone: "error", text: "Sélectionnez un fichier PDF, TXT ou Markdown." });
      return;
    }

    const formData = new FormData();
    formData.set("courseId", course.id);
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

      setSourceFeedback({ tone: "success", text: "Source ajoutée à cette formation." });
    });
  }

  function deleteSource(sourceId: string) {
    setSourceFeedback(undefined);

    startSourceTransition(async () => {
      const result = await deleteForgeCourseSourceAction(sourceId, course.id);

      if (!result.ok) {
        setSourceFeedback({ tone: "error", text: result.error });
        return;
      }

      setSources((current) => current.filter((source) => source.id !== sourceId));
      setSourceFeedback({ tone: "success", text: "Source supprimée." });
    });
  }

  function applySuggestion(suggestion: ForgeCourseImprovement["suggestions"][number]) {
    if (suggestion.type !== "module" && suggestion.type !== "lesson") {
      setFeedback({
        tone: "error",
        text: "Cette suggestion doit être appliquée manuellement dans l'éditeur."
      });
      return;
    }

    const applicableType = suggestion.type;

    startTransition(async () => {
      const result = await applyForgeCourseImprovementAction({
        courseId: course.id,
        moduleId: course.modules[0]?.id,
        suggestion: {
          proposed: suggestion.proposed,
          rationale: suggestion.rationale,
          type: applicableType
        }
      });

      if (!result.ok) {
        setFeedback({ tone: "error", text: result.error });
        return;
      }

      setFeedback({ tone: "success", text: result.data.message });
      router.refresh();
    });
  }

  return (
    <section className="teacher-form-section forge-existing-course" aria-live="polite">
      <div>
        <span>Forge AI</span>
        <h2>Travailler avec Forge AI</h2>
      </div>
      <p className="teacher-field-note">
        Forge analyse le brief, les sources et la structure existante. Les propositions restent en preview jusqu'à validation.
      </p>

      <form action={handleGenerate} className="forge-existing-course__grid">
        <div className="teacher-form-grid">
          <label className="teacher-field teacher-field--wide">
            <span>Sujet / titre de travail</span>
            <input name="subject" defaultValue={course.title} required />
          </label>
          <TeacherDomainPicker domains={domains} selectedDomainId={course.domain.id} />
          <label className="teacher-field">
            <span>Niveau initial</span>
            <select name="entryLevel" defaultValue={course.level}>
              {levelOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="teacher-field">
            <span>Niveau visé</span>
            <select name="targetLevel" defaultValue={course.level}>
              {levelOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="teacher-field teacher-field--wide">
            <span>Public cible</span>
            <input name="targetAudience" defaultValue="Apprenants de cette formation" required />
          </label>
          <label className="teacher-field teacher-field--wide">
            <span>Objectifs pédagogiques</span>
            <textarea
              name="learningObjectives"
              defaultValue={course.objectives.length > 0 ? course.objectives.join("\n") : course.description}
              required
              rows={4}
            />
          </label>
          <label className="teacher-field teacher-field--wide">
            <span>Prérequis</span>
            <textarea name="prerequisites" defaultValue={course.requirements.join("\n")} rows={3} />
          </label>
          <label className="teacher-field">
            <span>Durée cible</span>
            <input name="duration" placeholder="Ex. 6 heures" />
          </label>
          <label className="teacher-field teacher-field--wide">
            <span>Contraintes particulières</span>
            <textarea name="constraints" placeholder="Ex. garder des leçons courtes." rows={3} />
          </label>
          <label className="teacher-field">
            <span>Mode d'assistance</span>
            <select name="mode" defaultValue="analyze">
              <option value="analyze">Analyser le parcours</option>
              <option value="improve_structure">Améliorer la structure</option>
            </select>
          </label>
        </div>

        <div className="forge-source-manager">
          <h3>Sources associées</h3>
          <div className="teacher-form-grid teacher-form-grid--compact">
            <label className="teacher-field">
              <span>Titre de la source</span>
              <input
                disabled={isSourcePending}
                onChange={(event) => setSourceTitle(event.target.value)}
                placeholder="Ex. Programme existant"
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
                {isSourcePending ? "Ajout..." : "Ajouter"}
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
                    aria-label={`Supprimer ${source.title}`}
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
            <p className="teacher-field-note">Aucune source associée à cette formation.</p>
          )}
        </div>

        <div className="teacher-form-actions">
          <button className="btn btn-primary" disabled={isPending} type="submit">
            {isPending ? (
              <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" />
            ) : (
              <Sparkles size={17} aria-hidden="true" />
            )}
            {isPending ? "Forge analyse..." : "Analyser avec Forge"}
          </button>
        </div>
      </form>

      {feedback ? (
        <div
          className={feedback.tone === "error" ? "teacher-form-error" : "teacher-toast"}
          role={feedback.tone === "error" ? "alert" : "status"}
        >
          {feedback.text}
        </div>
      ) : null}

      {improvement ? (
        <div className="forge-diff">
          <div className="forge-diff__current">
            <span>Structure actuelle</span>
            <h3>{course.title}</h3>
            {course.modules.length > 0 ? (
              <ol>
                {course.modules.map((module) => (
                  <li key={module.id}>
                    <strong>{module.title}</strong>
                    <ul>
                      {module.lessons.map((lesson) => (
                        <li key={lesson.id}>{lesson.title}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            ) : (
              <p>Aucun module existant.</p>
            )}
          </div>

          <div className="forge-diff__proposal">
            <span>Proposition Forge</span>
            <h3>{improvement.title}</h3>
            <p>{improvement.summary}</p>
            <small>Généré à partir de {improvement.sourceCount} source(s).</small>

            <div className="forge-suggestion-list">
              {improvement.suggestions.map((suggestion) => (
                <article className="forge-suggestion" key={suggestion.clientId}>
                  <span>{suggestion.type}</span>
                  {suggestion.current ? <p><strong>Actuel :</strong> {suggestion.current}</p> : null}
                  <p><strong>Proposition :</strong> {suggestion.proposed}</p>
                  <p>{suggestion.rationale}</p>
                  <div className="teacher-form-actions">
                    <button
                      className="btn btn-secondary"
                      disabled={isPending}
                      onClick={() => setFeedback({ tone: "success", text: "Suggestion ignorée." })}
                      type="button"
                    >
                      Ignorer
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={isPending || (suggestion.type !== "module" && suggestion.type !== "lesson")}
                      onClick={() => applySuggestion(suggestion)}
                      type="button"
                    >
                      <CheckCircle2 size={16} aria-hidden="true" />
                      Accepter en brouillon
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
