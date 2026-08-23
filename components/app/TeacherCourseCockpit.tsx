"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Eye, Send, Sparkles, X } from "lucide-react";

import { TeacherSubmitButton } from "@/components/app/TeacherSubmitButton";

type PublicationIssue = {
  href?: string;
  label: string;
};

type PublicationChecklistItem = {
  complete: boolean;
  label: string;
};

type TeacherCourseCockpitProps = {
  courseTitle: string;
  enrollmentLabel: string;
  forgeContent: ReactNode;
  informationContent: ReactNode;
  initialTab?: "information" | "structure" | "forge";
  isPublished: boolean;
  lessonCountLabel: string;
  moduleCountLabel: string;
  previewHref: string;
  publicationChecklist: PublicationChecklistItem[];
  publicationIssues: PublicationIssue[];
  publishAction: (formData: FormData) => void | Promise<void>;
  structureContent: ReactNode;
  unpublishAction: (formData: FormData) => void | Promise<void>;
};

export function TeacherCourseCockpit({
  courseTitle,
  enrollmentLabel,
  forgeContent,
  informationContent,
  initialTab = "information",
  isPublished,
  lessonCountLabel,
  moduleCountLabel,
  previewHref,
  publicationChecklist,
  publicationIssues,
  publishAction,
  structureContent,
  unpublishAction
}: TeacherCourseCockpitProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [dialogMode, setDialogMode] = useState<"publish" | "unpublish" | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const canPublish = publicationIssues.length === 0;

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (dialogMode) {
      dialog.showModal();
      closeButtonRef.current?.focus();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [dialogMode]);

  function closeDialog() {
    setDialogMode(null);
  }

  const tabs: Array<{
    id: "information" | "structure" | "forge";
    label: string;
    content: ReactNode;
  }> = [
    { id: "information", label: "Informations", content: informationContent },
    { id: "structure", label: "Parcours", content: structureContent },
    { id: "forge", label: "Forge AI", content: forgeContent }
  ];

  return (
    <>
      <section className="teacher-course-cockpit" aria-label="Pilotage de la formation">
        <div className="teacher-course-cockpit__identity">
          <div>
            <span className="eyebrow">Création sélectionnée</span>
            <h1>{courseTitle}</h1>
          </div>
          <span className="state-badge" data-state={isPublished ? "published" : "draft"}>
            {isPublished ? "Publié" : "Brouillon"}
          </span>
        </div>
        <p className="teacher-course-cockpit__meta">
          {moduleCountLabel} · {lessonCountLabel} · {enrollmentLabel}
        </p>
        <div className="teacher-course-cockpit__actions">
          <a className="btn btn-secondary" href={previewHref} target="_blank" rel="noreferrer">
            <Eye size={17} aria-hidden="true" />
            {isPublished ? "Voir sur le site" : "Prévisualiser"}
          </a>
          <button className="btn btn-secondary" onClick={() => setActiveTab("forge")} type="button">
            <Sparkles size={17} aria-hidden="true" />
            Modifier le parcours avec Forge AI
          </button>
          {isPublished ? (
            <button className="btn btn-secondary" onClick={() => setDialogMode("unpublish")} type="button">
              Dépublier
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => setDialogMode("publish")} type="button">
              <Send size={17} aria-hidden="true" />
              Publier la formation
            </button>
          )}
        </div>
      </section>

      <div className="teacher-course-tabs" role="tablist" aria-label="Espaces de travail de la formation">
        {tabs.map((tab) => (
          <button
            aria-controls={`${tab.id}-panel`}
            aria-selected={activeTab === tab.id}
            id={`${tab.id}-tab`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            tabIndex={activeTab === tab.id ? 0 : -1}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <section
          aria-labelledby={`${tab.id}-tab`}
          hidden={activeTab !== tab.id}
          id={`${tab.id}-panel`}
          key={tab.id}
          role="tabpanel"
          tabIndex={0}
        >
          {tab.content}
        </section>
      ))}

      <dialog
        aria-labelledby="publication-dialog-title"
        className="teacher-publication-dialog"
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        ref={dialogRef}
      >
        <div className="teacher-publication-dialog__header">
          <div>
            <span>{dialogMode === "unpublish" ? "Dépublication" : "Publication"}</span>
            <h2 id="publication-dialog-title">
              {dialogMode === "unpublish" ? "Dépublier la formation ?" : "Vérifier avant publication"}
            </h2>
          </div>
          <button aria-label="Fermer" onClick={closeDialog} ref={closeButtonRef} type="button">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {dialogMode === "unpublish" ? (
          <>
            <p>
              La formation ne sera plus visible dans le catalogue. Les inscriptions existantes restent conservées.
            </p>
            <div className="teacher-publication-dialog__actions">
              <button className="btn btn-secondary" onClick={closeDialog} type="button">
                Annuler
              </button>
              <form action={unpublishAction}>
                <TeacherSubmitButton className="btn btn-primary" pendingLabel="Dépublication...">
                  Dépublier
                </TeacherSubmitButton>
              </form>
            </div>
          </>
        ) : canPublish ? (
          <>
            <ul className="teacher-publication-readiness" aria-label="Checklist de publication">
              {publicationChecklist.map((item) => (
                <li data-complete={item.complete} key={item.label}>
                  {item.complete ? "✓" : "×"} {item.label}
                </li>
              ))}
            </ul>
            <p className="teacher-publication-dialog__success">Tout est prêt pour la publication.</p>
            <p>La formation sera visible dans le catalogue et les apprenants pourront s&apos;y inscrire.</p>
            <div className="teacher-publication-dialog__actions">
              <button className="btn btn-secondary" onClick={closeDialog} type="button">
                Annuler
              </button>
              <form action={publishAction}>
                <TeacherSubmitButton className="btn btn-primary" pendingLabel="Publication...">
                  <Send size={17} aria-hidden="true" />
                  Publier la formation
                </TeacherSubmitButton>
              </form>
            </div>
          </>
        ) : (
          <>
            <ul className="teacher-publication-readiness" aria-label="Checklist de publication">
              {publicationChecklist.map((item) => (
                <li data-complete={item.complete} key={item.label}>
                  {item.complete ? "✓" : "×"} {item.label}
                </li>
              ))}
            </ul>
            <p className="teacher-publication-dialog__incomplete">
              {publicationIssues.length} {publicationIssues.length > 1 ? "éléments restent" : "élément reste"} à compléter.
            </p>
            <ul className="teacher-publication-checklist">
              {publicationIssues.map((issue) => (
                <li key={issue.label}>
                  {issue.href ? <a href={issue.href}>{issue.label}</a> : issue.label}
                </li>
              ))}
            </ul>
            <div className="teacher-publication-dialog__actions">
              <button className="btn btn-secondary" onClick={closeDialog} type="button">
                Fermer
              </button>
              <button className="btn btn-primary" disabled type="button">
                Publier la formation
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
