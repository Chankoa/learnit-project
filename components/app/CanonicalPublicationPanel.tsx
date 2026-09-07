"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Send, X } from "lucide-react";

import { TeacherSubmitButton } from "@/components/app/TeacherSubmitButton";

type CanonicalPublicationPanelProps = {
  courseTitle: string;
  publicHref?: string;
  isPublished: boolean;
  issues: string[];
  publishAction: (formData: FormData) => void | Promise<void>;
  unpublishAction: (formData: FormData) => void | Promise<void>;
};

export function CanonicalPublicationPanel({
  courseTitle,
  publicHref,
  isPublished,
  issues,
  publishAction,
  unpublishAction
}: CanonicalPublicationPanelProps) {
  const [dialogMode, setDialogMode] = useState<"publish" | "unpublish" | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const canPublish = issues.length === 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (dialogMode) dialog.showModal();
    else if (dialog.open) dialog.close();
    if (!dialogMode) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [dialogMode]);

  return (
    <section className="teacher-form-section teacher-publication-panel" aria-labelledby="canonical-publication-title">
      <div>
        <span>Publication</span>
        <h2 id="canonical-publication-title">{isPublished ? "Formation publiée" : "Préparer la publication"}</h2>
        <p>{courseTitle} {isPublished ? "est visible dans le catalogue public." : "sera visible dans le catalogue après validation."}</p>
      </div>

      {isPublished && publicHref ? <div className="journey-publication-link"><a href={publicHref}>Voir le parcours public</a><button type="button" className="btn btn-secondary" onClick={async () => { try { await navigator.clipboard.writeText(new URL(publicHref, window.location.origin).href); setCopyMessage("Lien copié."); } catch { setCopyMessage("Copie indisponible. Ouvrez le parcours public pour copier son adresse."); } }}><Copy size={16} aria-hidden="true" />Copier le lien</button><span role="status">{copyMessage}</span></div> : null}
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

      <dialog aria-labelledby="publication-confirmation-title" className="teacher-publication-dialog" onCancel={() => setDialogMode(null)} ref={dialogRef}>
        <div className="teacher-publication-dialog__header">
          <div><span>{dialogMode === "unpublish" ? "Dépublication" : "Publication"}</span><h2 id="publication-confirmation-title">{dialogMode === "unpublish" ? "Dépublier la formation ?" : "Publier la formation ?"}</h2></div>
          <button aria-label="Fermer" onClick={() => setDialogMode(null)} type="button"><X size={18} aria-hidden="true" /></button>
        </div>
        <p><strong>{courseTitle}</strong></p>
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