"use client";

import {
  ArrowLeft,
  ClipboardCheck,
  Eye,
  PanelLeft,
  Sparkles,
  X
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type TeacherAuthoringWorkspaceProps = {
  courseTitle: string;
  editor: ReactNode;
  forgePanel?: ReactNode;
  meta: ReactNode;
  previewHref: string;
  publicationHref: string;
  returnHref: string;
  returnLabel: string;
  selectedId?: string;
  selectedKind?: string;
  selectedTitle?: string;
  structure: ReactNode;
};

type OverlayPanel = "forge" | "structure" | null;

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export function TeacherAuthoringWorkspace({
  courseTitle,
  editor,
  forgePanel,
  meta,
  previewHref,
  publicationHref,
  returnHref,
  returnLabel,
  selectedId,
  selectedKind,
  selectedTitle,
  structure
}: TeacherAuthoringWorkspaceProps) {
  const hasForgePanel = Boolean(forgePanel);
  const isForgeOverlay = useMediaQuery("(max-width: 1279px)");
  const isStructureOverlay = useMediaQuery("(max-width: 899px)");
  const [activeOverlay, setActiveOverlay] = useState<OverlayPanel>(null);
  const [isForgeOpen, setIsForgeOpen] = useState(hasForgePanel);
  const forgeButtonRef = useRef<HTMLButtonElement>(null);
  const forgePanelRef = useRef<HTMLElement>(null);
  const structureButtonRef = useRef<HTMLButtonElement>(null);
  const structurePanelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setActiveOverlay(null);
    setIsForgeOpen(hasForgePanel);
  }, [hasForgePanel, selectedId]);

  useEffect(() => {
    if (!activeOverlay) {
      return;
    }

    requestAnimationFrame(() => {
      const panel = activeOverlay === "forge" ? forgePanelRef.current : structurePanelRef.current;
      panel?.querySelector<HTMLButtonElement>("button")?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        const panel = activeOverlay;
        setActiveOverlay(null);
        requestAnimationFrame(() => {
          (panel === "forge" ? forgeButtonRef.current : structureButtonRef.current)?.focus();
        });
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeOverlay]);

  const structureHidden = isStructureOverlay && activeOverlay !== "structure";
  const forgeHidden =
    !hasForgePanel || (isForgeOverlay ? activeOverlay !== "forge" : !isForgeOpen);

  function closeOverlay() {
    const panel = activeOverlay;
    setActiveOverlay(null);
    requestAnimationFrame(() => {
      (panel === "forge" ? forgeButtonRef.current : structureButtonRef.current)?.focus();
    });
  }

  function toggleForge() {
    if (isForgeOverlay) {
      setActiveOverlay((current) => (current === "forge" ? null : "forge"));
      return;
    }

    setIsForgeOpen((current) => !current);
  }

  return (
    <section
      className="teacher-authoring"
      data-forge-open={!forgeHidden}
      data-overlay-open={Boolean(activeOverlay)}
    >
      <header className="teacher-authoring__header">
        <Link className="teacher-authoring__back" href={returnHref}>
          <ArrowLeft size={17} aria-hidden="true" />
          {returnLabel}
        </Link>

        <div className="teacher-authoring__identity">
          <span>{courseTitle}</span>
          <strong>{selectedTitle ?? "Parcours"}</strong>
          <small>{selectedKind ? `${selectedKind} sélectionné · ` : ""}{meta}</small>
        </div>

        <div className="teacher-authoring__actions">
          <button
            aria-controls="teacher-authoring-structure"
            aria-expanded={activeOverlay === "structure"}
            className="btn btn-secondary teacher-authoring__structure-toggle"
            onClick={() => setActiveOverlay((current) => (current === "structure" ? null : "structure"))}
            ref={structureButtonRef}
            type="button"
          >
            <PanelLeft size={17} aria-hidden="true" />
            Structure
          </button>
          <button
            aria-controls="teacher-authoring-forge"
            aria-expanded={!forgeHidden}
            className="btn btn-secondary"
            disabled={!forgePanel}
            onClick={toggleForge}
            ref={forgeButtonRef}
            type="button"
          >
            <Sparkles size={17} aria-hidden="true" />
            Forge
          </button>
          <Link className="btn btn-secondary teacher-authoring__preview" href={previewHref} target="_blank" rel="noreferrer">
            <Eye size={17} aria-hidden="true" />
            Aperçu
          </Link>
          <Link className="btn btn-secondary teacher-authoring__publication" href={publicationHref}>
            <ClipboardCheck size={17} aria-hidden="true" />
            Publication
          </Link>
        </div>
      </header>

      {activeOverlay ? (
        <button
          aria-label="Fermer le panneau"
          className="teacher-authoring__backdrop"
          onClick={closeOverlay}
          type="button"
        />
      ) : null}

      <div className="teacher-authoring__workspace">
        <aside
          aria-label="Structure modules et leçons"
          className="teacher-authoring__structure"
          hidden={structureHidden}
          id="teacher-authoring-structure"
          ref={structurePanelRef}
        >
          <div className="teacher-authoring__panel-mobile-header">
            <strong>Structure</strong>
            <button aria-label="Fermer la structure" onClick={closeOverlay} type="button">
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          {structure}
        </aside>

        <section aria-label="Éditeur de l’objet sélectionné" className="teacher-authoring__editor" id="teacher-authoring-editor">
          {editor}
        </section>

        <aside
          aria-label="Forge AI contextuel"
          className="teacher-authoring__forge"
          hidden={forgeHidden}
          id="teacher-authoring-forge"
          ref={forgePanelRef}
        >
          <div className="teacher-authoring__forge-header">
            <div>
              <span>Forge AI</span>
              <strong>Contexte de travail</strong>
            </div>
            <button
              aria-label="Fermer Forge"
              onClick={() => {
                if (isForgeOverlay) {
                  closeOverlay();
                } else {
                  setIsForgeOpen(false);
                  requestAnimationFrame(() => forgeButtonRef.current?.focus());
                }
              }}
              type="button"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          {forgePanel}
        </aside>
      </div>
    </section>
  );
}
