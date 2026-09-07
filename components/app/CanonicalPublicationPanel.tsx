"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";

import { TeacherSubmitButton } from "@/components/app/TeacherSubmitButton";

type CanonicalPublicationPanelProps = {
  courseTitle: string;
  isPublished: boolean;
  issues: string[];
  publishAction: (formData: FormData) => void | Promise<void>;
  unpublishAction: (formData: FormData) => void | Promise<void>;
};

export function CanonicalPublicationPanel({
  courseTitle,
  isPublished,
  issues,
  publishAction,
  unpublishAction
}: CanonicalPublicationPanelProps) {
  const [dialogMode, setDialogMode] = useState<"publish" | "unpublish" | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canPublish = issues.length === 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (dialogMode) dialog.showModal();
    else if (dialog.open) dialog.close();
  }, [dialogMode]);

  return (
    <section className="teacher-form-section teacher-publication-panel" aria-labelledby="canonical-publication-title">
      <div>
        <span>Publication</span>
        <h2 id="canonical-publication-title">{isPublished ? "Formation publiée" : "Préparer la publication"}</h2>
        <p>{courseTitle} {isPublished ? "est visible dans le catalogue public." : "sera visible dans le catalogue après validation."}</p>
      </div>

      {isPublished ? (
        <button className="btn btn-secondary" onClick={() => setDialogMode("unpublish")} type="button">
          Gérer la publication
        </button>
      ) : (
        <>
          {canPublish ? <p className="teacher-publication-dialog__success">Tout est prêt pour la publication.</p> : (
            <ul className="teacher-publication-issue-groups">
              {issues.map((issue) => <li key={issue}><strong>{issue}</strong></li>)}
            </ul>
          )}
          <button className="btn btn-primary" disabled={!canPublish} onClick={() => setDialogMode("publish")} type="button">
            <Send size={17} aria-hidden="true" /> Publier
          </button>
        </>
      )}

      <dialog className="teacher-publication-dialog" onCancel={() => setDialogMode(null)} ref={dialogRef}>
        <div className="teacher-publication-dialog__header">
          <div><span>{dialogMode === "unpublish" ? "Dépublication" : "Publication"}</span><h2>{dialogMode === "unpublish" ? "Dépublier la formation ?" : "Publier la formation ?"}</h2></div>
          <button aria-label="Fermer" onClick={() => setDialogMode(null)} type="button"><X size={18} aria-hidden="true" /></button>
        </div>
        <p>{dialogMode === "unpublish" ? "La formation ne sera plus visible dans le catalogue. Les inscriptions existantes restent conservées." : "La formation sera visible dans le catalogue et les apprenants pourront s’y inscrire."}</p>
        <div className="teacher-publication-dialog__actions">
          <button className="btn btn-secondary" onClick={() => setDialogMode(null)} type="button">Annuler</button>
          <form action={dialogMode === "unpublish" ? unpublishAction : publishAction}>
            <TeacherSubmitButton pendingLabel={dialogMode === "unpublish" ? "Dépublication..." : "Publication..."}>
              {dialogMode === "unpublish" ? "Dépublier" : "Publier la formation"}
            </TeacherSubmitButton>
          </form>
        </div>
      </dialog>
    </section>
  );
}