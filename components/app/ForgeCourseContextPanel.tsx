"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Sparkles
} from "lucide-react";

import {
  applyForgeCourseImprovementAction,
  generateForgeCourseImprovementAction
} from "@/app/app/teacher/forge/actions";
import { ForgeAIStatus } from "@/components/app/ForgeAIPrimitives";
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
  technicalDetails?: string;
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
  const [feedback, setFeedback] = useState<Feedback | undefined>();
  const [improvement, setImprovement] = useState<ForgeCourseImprovement | undefined>();
  const [lastInput, setLastInput] = useState<ForgeCourseImprovementInput>();
  const [isPending, startTransition] = useTransition();

  function runGenerate(input: ForgeCourseImprovementInput) {
    setFeedback(undefined);

    startTransition(async () => {
      const result = await generateForgeCourseImprovementAction(input);

      if (!result.ok) {
        setImprovement(undefined);
        setFeedback({
          tone: "error",
          technicalDetails: result.technicalDetails,
          text: result.error
        });
        return;
      }

      setImprovement(result.data);
      setFeedback({
        tone: "success",
        text: "Proposition Forge générée — aucune modification appliquée."
      });
    });
  }

  function handleGenerate(formData: FormData) {
    const mode = getString(formData, "mode") === "improve_structure" ? "improve_structure" : "analyze";
    const input: ForgeCourseImprovementInput = {
      brief: buildBrief(formData, course, initialSources),
      courseId: course.id,
      mode
    };

    setLastInput(input);
    runGenerate(input);
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
        <div className="teacher-form-grid forge-existing-course__essential">
          <label className="teacher-field teacher-field--wide">
            <span>Sujet / titre de travail</span>
            <input name="subject" defaultValue={course.title} required />
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
            <span>Durée cible</span>
            <input name="duration" placeholder="Ex. 6 heures" />
          </label>
        </div>

        <details className="forge-brief-advanced">
          <summary>
            <span>Affiner l’analyse</span>
            <small>Domaine, niveaux, prérequis et contraintes</small>
          </summary>
          <div className="teacher-form-grid">
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
              <span>Prérequis</span>
              <textarea name="prerequisites" defaultValue={course.requirements.join("\n")} rows={3} />
            </label>
            <label className="teacher-field teacher-field--wide">
              <span>Contraintes particulières</span>
              <textarea name="constraints" placeholder="Ex. garder des leçons courtes." rows={3} />
            </label>
          </div>
        </details>

        <div className="forge-existing-course__context">
          <p>
            {initialSources.length} source{initialSources.length > 1 ? "s" : ""} associée{initialSources.length > 1 ? "s" : ""}
            à cette création.
          </p>
          <Link href={`/app/teacher/courses/${course.id}/edit?tab=sources`}>
            Gérer les sources
          </Link>
        </div>

        <label className="teacher-field">
          <span>Action Forge</span>
          <select name="mode" defaultValue="analyze">
            <option value="analyze">Analyser le parcours</option>
            <option value="improve_structure">Améliorer la structure</option>
          </select>
        </label>

        <div className="teacher-form-actions">
          <button className="btn btn-primary" disabled={isPending} type="submit">
            {isPending ? (
              <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" />
            ) : (
              <Sparkles size={17} aria-hidden="true" />
            )}
            {isPending ? "Forge analyse…" : "Lancer l’analyse"}
          </button>
        </div>
      </form>

      {isPending ? (
        <ForgeAIStatus
          description="Le parcours enregistré et son contexte sont en cours d’analyse."
          state="loading"
          title="Forge analyse cette création…"
        />
      ) : null}

      {feedback ? (
        <div className="forge-ai-error-recovery">
          <ForgeAIStatus
            description={feedback.text}
            state={feedback.tone === "error" ? "error" : "success"}
          />
          {feedback.tone === "error" && lastInput ? (
            <div>
              <button className="btn btn-secondary" disabled={isPending} onClick={() => runGenerate(lastInput)} type="button">
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
