"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Eye, Send, X } from "lucide-react";

import { CreatorWorkspaceHeader } from "@/components/app/CreatorWorkspaceHeader";
import { TeacherSubmitButton } from "@/components/app/TeacherSubmitButton";

type PublicationIssue = {
  description?: string;
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
  initialTab?: CockpitTabId;
  isPublished: boolean;
  lessonCountLabel: string;
  moduleCountLabel: string;
  previewHref: string;
  publicationChecklist: PublicationChecklistItem[];
  publicationIssues: PublicationIssue[];
  publishAction: (formData: FormData) => void | Promise<void>;
  sourceContent: ReactNode;
  structureContent: ReactNode;
  unpublishAction: (formData: FormData) => void | Promise<void>;
};

type CockpitTabId = "information" | "structure" | "sources" | "forge" | "publication";

function PublicationIssueList({ issues }: { issues: PublicationIssue[] }) {
  return (
    <ul className="teacher-publication-issue-groups">
      {issues.map((issue) => (
        <li key={`${issue.label}-${issue.href ?? "global"}`}>
          <div>
            <strong>{issue.label}</strong>
            {issue.description ? <span>{issue.description}</span> : null}
          </div>
          {issue.href ? <a href={issue.href}>Corriger cet élément</a> : null}
        </li>
      ))}
    </ul>
  );
}

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
  sourceContent,
  structureContent,
  unpublishAction
}: TeacherCourseCockpitProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [dialogMode, setDialogMode] = useState<"publish" | "unpublish" | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const canPublish = publicationIssues.length === 0;
  const completedCriterionCount = publicationChecklist.filter((item) => item.complete).length;
  const publicationIssueCount = publicationIssues.length;

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

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

  const publicationContent = (
    <section className="teacher-form-section teacher-publication-panel">
      <div>
        <span>Publication</span>
        <h2>{isPublished ? "Formation publiée" : "Préparer la publication"}</h2>
        <p>
          La publication est l’aboutissement du travail éditorial. Elle reste toujours une action
          humaine distincte des propositions Forge.
        </p>
      </div>

      <div className="teacher-publication-summary" aria-label="État de préparation à la publication">
        <strong>{completedCriterionCount} / {publicationChecklist.length} critères validés</strong>
        <span>{canPublish ? "Prêt à publier" : `${publicationIssueCount} élément${publicationIssueCount > 1 ? "s" : ""} à corriger`}</span>
        <details>
          <summary>Voir les critères</summary>
          <ul className="teacher-publication-readiness">
            {publicationChecklist.map((item) => (
              <li data-complete={item.complete} key={item.label}>
                {item.complete ? "✓" : "×"} {item.label}
              </li>
            ))}
          </ul>
        </details>
      </div>

      {!isPublished && !canPublish ? (
        <div className="teacher-publication-panel__issues">
          <strong>{publicationIssueCount} élément{publicationIssueCount > 1 ? "s restent" : " reste"} à compléter.</strong>
          <PublicationIssueList issues={publicationIssues} />
        </div>
      ) : null}

      <p className="teacher-field-note">
        L’action de publication reste dans l’en-tête de la création afin de conserver une seule
        action principale visible.
      </p>
    </section>
  );

  const tabs: Array<{
    id: CockpitTabId;
    label: string;
    content: ReactNode;
  }> = [
    { id: "information", label: "Informations", content: informationContent },
    { id: "structure", label: "Parcours", content: structureContent },
    { id: "sources", label: "Sources", content: sourceContent },
    { id: "forge", label: "Forge AI", content: forgeContent },
    { id: "publication", label: "Publication", content: publicationContent }
  ];

  function moveTab(currentId: CockpitTabId, direction: -1 | 1) {
    const currentIndex = tabs.findIndex((tab) => tab.id === currentId);
    const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];

    setActiveTab(nextTab.id);
    requestAnimationFrame(() => document.getElementById(`${nextTab.id}-tab`)?.focus());
  }

  return (
    <>
      <CreatorWorkspaceHeader
        actions={
          <>
          <a className="btn btn-secondary" href={previewHref} target="_blank" rel="noreferrer">
            <Eye size={17} aria-hidden="true" />
            {isPublished ? "Voir sur le site" : "Prévisualiser"}
          </a>
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
          </>
        }
        eyebrow="Création sélectionnée"
        meta={<>{moduleCountLabel} · {lessonCountLabel} · {enrollmentLabel}</>}
        status={isPublished ? "published" : "draft"}
        statusLabel={isPublished ? "Publié" : "Brouillon"}
        title={courseTitle}
      />

      <div className="teacher-course-tabs" role="tablist" aria-label="Espaces de travail de la formation">
        {tabs.map((tab) => (
          <button
            aria-controls={`${tab.id}-panel`}
            aria-selected={activeTab === tab.id}
            id={`${tab.id}-tab`}
            key={tab.id}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                moveTab(tab.id, -1);
              }

              if (event.key === "ArrowRight") {
                event.preventDefault();
                moveTab(tab.id, 1);
              }
            }}
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
              {publicationIssueCount} élément{publicationIssueCount > 1 ? "s restent" : " reste"} à compléter.
            </p>
            <PublicationIssueList issues={publicationIssues} />
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
