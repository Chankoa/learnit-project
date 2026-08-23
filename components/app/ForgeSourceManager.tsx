"use client";

import { useRef, useState, useTransition } from "react";
import { FilePlus2, FileText, Loader2, Trash2 } from "lucide-react";

import {
  deleteForgeCourseSourceAction,
  uploadForgeCourseSourceAction
} from "@/app/app/teacher/forge/actions";
import type { CourseSource } from "@/types/forge-ai";

type ForgeSourceManagerProps = {
  courseId?: string;
  onMutationComplete?: () => void;
  onSourcesChange: (sources: CourseSource[]) => void;
  sources: CourseSource[];
};

type Feedback = {
  tone: "error" | "success";
  text: string;
};

function formatBytes(value: number) {
  if (value >= 1024 * 1024) {
    return `${(value / (1024 * 1024)).toFixed(1)} Mo`;
  }

  return `${Math.max(1, Math.round(value / 1024))} Ko`;
}

export function ForgeSourceManager({
  courseId,
  onMutationComplete,
  onSourcesChange,
  sources
}: ForgeSourceManagerProps) {
  const sourceInputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<Feedback>();
  const [sourceFile, setSourceFile] = useState<File>();
  const [sourceTitle, setSourceTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  function uploadSource() {
    if (!sourceFile) {
      setFeedback({ tone: "error", text: "Sélectionnez un fichier PDF, TXT ou Markdown." });
      return;
    }

    const formData = new FormData();

    if (courseId) {
      formData.set("courseId", courseId);
    }

    formData.set("sourceTitle", sourceTitle);
    formData.set("sourceFile", sourceFile);
    setFeedback(undefined);

    startTransition(async () => {
      const result = await uploadForgeCourseSourceAction(formData);

      if (!result.ok) {
        setFeedback({ tone: "error", text: result.error });
        return;
      }

      onSourcesChange([result.data, ...sources]);
      setSourceTitle("");
      setSourceFile(undefined);

      if (sourceInputRef.current) {
        sourceInputRef.current.value = "";
      }

      setFeedback({
        tone: "success",
        text: courseId ? "Source ajoutée à cette création." : "Source ajoutée au Course Brief."
      });
      onMutationComplete?.();
    });
  }

  function deleteSource(sourceId: string) {
    setFeedback(undefined);

    startTransition(async () => {
      const result = await deleteForgeCourseSourceAction(sourceId, courseId);

      if (!result.ok) {
        setFeedback({ tone: "error", text: result.error });
        return;
      }

      onSourcesChange(sources.filter((source) => source.id !== sourceId));
      setFeedback({ tone: "success", text: "Source retirée." });
      onMutationComplete?.();
    });
  }

  return (
    <div className="forge-source-manager">
      <div className="forge-source-manager__heading">
        <div>
          <span>Sources</span>
          <h2>Contexte documentaire</h2>
          <p>
            Ajoutez éventuellement des documents pour donner à Forge un contexte de travail.
            Aucune citation ni réponse sourcée n’est promise à ce stade.
          </p>
        </div>
        <span className="state-badge" data-state={sources.length > 0 ? "published" : "draft"}>
          {sources.length} source{sources.length > 1 ? "s" : ""}
        </span>
      </div>

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
                disabled={isPending}
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
          Aucune source ajoutée. Le brief peut être généré sans document.
        </p>
      )}

      <details className="forge-source-manager__add">
        <summary>
          <FilePlus2 size={17} aria-hidden="true" />
          Ajouter une source
        </summary>
        <div className="teacher-form-grid">
          <label className="teacher-field">
            <span>Titre de la source</span>
            <input
              disabled={isPending}
              onChange={(event) => setSourceTitle(event.target.value)}
              placeholder="Ex. Référentiel de compétences"
              type="text"
              value={sourceTitle}
            />
          </label>
          <label className="teacher-field">
            <span>Fichier</span>
            <input
              accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
              disabled={isPending}
              onChange={(event) => setSourceFile(event.target.files?.[0])}
              ref={sourceInputRef}
              type="file"
            />
            <small className="teacher-field-note">PDF, TXT ou Markdown · 10 Mo maximum.</small>
          </label>
          <div className="teacher-form-actions teacher-field--wide">
            <button
              className="btn btn-secondary"
              disabled={isPending || !sourceFile}
              onClick={uploadSource}
              type="button"
            >
              {isPending ? (
                <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" />
              ) : (
                <FilePlus2 size={16} aria-hidden="true" />
              )}
              {isPending ? "Ajout…" : "Ajouter au brief"}
            </button>
          </div>
        </div>
      </details>

      {feedback ? (
        <div
          className={feedback.tone === "error" ? "teacher-form-error" : "teacher-toast"}
          role={feedback.tone === "error" ? "alert" : "status"}
        >
          {feedback.text}
        </div>
      ) : null}
    </div>
  );
}
