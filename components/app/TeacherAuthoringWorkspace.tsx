"use client";

import {
  ArrowLeft,
  ClipboardCheck,
  Eye,
  Maximize2,
  Minimize2,
  PanelLeft,
  Sparkles,
  X
} from "lucide-react";
import Link from "next/link";
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode
} from "react";
import { useEffect, useRef, useState } from "react";

import { TeacherAuthoringSurfaceProvider } from "@/components/app/TeacherAuthoringSurface";
import {
  clampForgePanelWidth,
  FORGE_PANEL_DEFAULT_WIDTH,
  FORGE_PANEL_MAX_WIDTH,
  FORGE_PANEL_MIN_WIDTH,
  FORGE_PANEL_WIDTH_STORAGE_KEY,
  getForgePanelMaxWidth,
  parseForgePanelPreference,
  serializeForgePanelPreference
} from "@/lib/teacher-authoring-preferences";

type TeacherAuthoringWorkspaceProps = {
  courseTitle: string;
  editor: ReactNode;
  forgePanel?: ReactNode;
  meta: ReactNode;
  modeActions?: ReactNode;
  previewHref: string;
  publicationHref: string;
  returnHref: string;
  returnLabel: string;
  relationLabel?: string;
  selectedId?: string;
  selectedKind?: string;
  selectedTitle?: string;
  structure: ReactNode;
};

type OverlayPanel = "forge" | "structure" | null;

type ForgeResizeSession = {
  pointerId: number;
  startWidth: number;
  startX: number;
};

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
  modeActions,
  previewHref,
  publicationHref,
  returnHref,
  returnLabel,
  relationLabel,
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
  const [isStructureOpen, setIsStructureOpen] = useState(true);
  const [forgeWidth, setForgeWidth] = useState(FORGE_PANEL_DEFAULT_WIDTH);
  const [forgeMaxWidth, setForgeMaxWidth] = useState(FORGE_PANEL_MAX_WIDTH);
  const [isForgeResizing, setIsForgeResizing] = useState(false);
  const authoringRef = useRef<HTMLElement>(null);
  const forgeButtonRef = useRef<HTMLButtonElement>(null);
  const forgePanelRef = useRef<HTMLElement>(null);
  const forgeResizeRef = useRef<ForgeResizeSession | null>(null);
  const forgeRestoreWidthRef = useRef(FORGE_PANEL_DEFAULT_WIDTH);
  const forgeWidthRef = useRef(FORGE_PANEL_DEFAULT_WIDTH);
  const structureButtonRef = useRef<HTMLButtonElement>(null);
  const structurePanelRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateForViewport = () => {
      const maximum = getForgePanelMaxWidth(window.innerWidth);
      const width = clampForgePanelWidth(forgeWidthRef.current, window.innerWidth);

      setForgeMaxWidth(maximum);
      forgeWidthRef.current = width;
      setForgeWidth(width);
    };

    try {
      const storedWidth = parseForgePanelPreference(
        window.localStorage.getItem(FORGE_PANEL_WIDTH_STORAGE_KEY)
      );

      if (storedWidth !== null) {
        forgeWidthRef.current = storedWidth;
      }
    } catch {
      // Local preferences are optional (private browsing and storage policies can block them).
    }

    updateForViewport();
    window.addEventListener("resize", updateForViewport);
    return () => window.removeEventListener("resize", updateForViewport);
  }, []);

  useEffect(() => {
    setActiveOverlay(null);
    setIsForgeOpen(hasForgePanel);
    setIsStructureOpen(true);
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
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const panel = activeOverlay === "forge" ? forgePanelRef.current : structurePanelRef.current;
      const focusable = Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      ).filter((element) => element.getClientRects().length > 0);

      if (!focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeOverlay]);

  const structureHidden =
    isStructureOverlay ? activeOverlay !== "structure" : !isStructureOpen;
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

  function toggleStructure() {
    if (isStructureOverlay) {
      setActiveOverlay((current) => (current === "structure" ? null : "structure"));
      return;
    }

    setIsStructureOpen((current) => !current);
  }

  function previewForgeWidth(width: number) {
    const nextWidth = clampForgePanelWidth(width, window.innerWidth);

    forgeWidthRef.current = nextWidth;
    authoringRef.current?.style.setProperty("--teacher-forge-width", `${nextWidth}px`);
    return nextWidth;
  }

  function persistForgeWidth(width: number) {
    try {
      window.localStorage.setItem(
        FORGE_PANEL_WIDTH_STORAGE_KEY,
        serializeForgePanelPreference(width)
      );
    } catch {
      // Resizing remains functional even when local preferences cannot be stored.
    }
  }

  function commitForgeWidth(width: number) {
    const nextWidth = previewForgeWidth(width);

    setForgeWidth(nextWidth);
    persistForgeWidth(nextWidth);
  }

  function handleForgeResizeStart(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || isForgeOverlay) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    forgeResizeRef.current = {
      pointerId: event.pointerId,
      startWidth: forgeWidthRef.current,
      startX: event.clientX
    };
    setIsForgeResizing(true);
  }

  function handleForgeResizeMove(event: ReactPointerEvent<HTMLDivElement>) {
    const session = forgeResizeRef.current;

    if (!session || session.pointerId !== event.pointerId) {
      return;
    }

    previewForgeWidth(session.startWidth + session.startX - event.clientX);
  }

  function handleForgeResizeEnd(event: ReactPointerEvent<HTMLDivElement>) {
    const session = forgeResizeRef.current;

    if (!session || session.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    forgeResizeRef.current = null;
    setIsForgeResizing(false);
    setForgeWidth(forgeWidthRef.current);
    persistForgeWidth(forgeWidthRef.current);
  }

  function handleForgeResizeCancel(event: ReactPointerEvent<HTMLDivElement>) {
    const session = forgeResizeRef.current;

    if (!session || session.pointerId !== event.pointerId) {
      return;
    }

    forgeResizeRef.current = null;
    setIsForgeResizing(false);
    commitForgeWidth(session.startWidth);
  }

  function handleForgeResizeKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 32 : 16;
    let nextWidth: number | null = null;

    if (event.key === "ArrowLeft") {
      nextWidth = forgeWidthRef.current + step;
    } else if (event.key === "ArrowRight") {
      nextWidth = forgeWidthRef.current - step;
    } else if (event.key === "Home") {
      nextWidth = FORGE_PANEL_MIN_WIDTH;
    } else if (event.key === "End") {
      nextWidth = forgeMaxWidth;
    }

    if (nextWidth === null) {
      return;
    }

    event.preventDefault();
    commitForgeWidth(nextWidth);
  }

  function toggleForgeExpanded() {
    const isExpanded = forgeWidth >= forgeMaxWidth - 1;

    if (isExpanded) {
      commitForgeWidth(forgeRestoreWidthRef.current);
      return;
    }

    forgeRestoreWidthRef.current = forgeWidth;
    commitForgeWidth(forgeMaxWidth);
  }

  const isForgeExpanded = forgeWidth >= forgeMaxWidth - 1;

  return (
    <section
      className="teacher-authoring"
      data-forge-open={!forgeHidden}
      data-forge-resizing={isForgeResizing}
      data-overlay-open={Boolean(activeOverlay)}
      data-structure-open={!structureHidden}
      ref={authoringRef}
      style={{ "--teacher-forge-width": `${forgeWidth}px` } as CSSProperties}
    >
      <header className="teacher-authoring__header">
        <Link className="teacher-authoring__back" href={returnHref}>
          <ArrowLeft size={17} aria-hidden="true" />
          {returnLabel}
        </Link>

        <div className="teacher-authoring__identity">
          <span>{relationLabel ?? courseTitle}</span>
          <strong>{selectedTitle ?? "Parcours"}</strong>
          <small>{relationLabel ? `${courseTitle} · ` : ""}{selectedKind ? `${selectedKind} sélectionné · ` : ""}{meta}</small>
        </div>

        <div className="teacher-authoring__actions">
          {modeActions}
          <button
            aria-controls="teacher-authoring-structure"
            aria-expanded={!structureHidden}
            className="btn btn-secondary teacher-authoring__structure-toggle"
            onClick={toggleStructure}
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

      <TeacherAuthoringSurfaceProvider key={selectedId ?? "course"}>
        <div className="teacher-authoring__workspace">
        {structureHidden && !isStructureOverlay ? (
          <aside className="teacher-authoring__rail" aria-label="Structure réduite">
            <button
              aria-controls="teacher-authoring-structure"
              aria-expanded="false"
              aria-label="Ouvrir la structure"
              onClick={toggleStructure}
              ref={structureButtonRef}
              title="Ouvrir la structure"
              type="button"
            >
              <PanelLeft size={18} aria-hidden="true" />
            </button>
          </aside>
        ) : null}
        <aside
          aria-label="Structure modules et leçons"
          className="teacher-authoring__structure"
          hidden={structureHidden}
          id="teacher-authoring-structure"
          ref={structurePanelRef}
        >
          <div className="teacher-authoring__panel-header">
            <strong>Structure</strong>
            <button
              aria-label="Fermer la structure"
              onClick={() => {
                if (isStructureOverlay) {
                  closeOverlay();
                  return;
                }
                setIsStructureOpen(false);
                requestAnimationFrame(() => structureButtonRef.current?.focus());
              }}
              title="Fermer la structure"
              type="button"
            >
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
          {!isForgeOverlay ? (
            <div
              aria-label="Redimensionner le panneau Forge"
              aria-orientation="vertical"
              aria-valuemax={forgeMaxWidth}
              aria-valuemin={FORGE_PANEL_MIN_WIDTH}
              aria-valuenow={forgeWidth}
              aria-valuetext={`${forgeWidth} pixels`}
              className="teacher-authoring__forge-resize"
              onKeyDown={handleForgeResizeKeyDown}
              onPointerCancel={handleForgeResizeCancel}
              onPointerDown={handleForgeResizeStart}
              onPointerMove={handleForgeResizeMove}
              onPointerUp={handleForgeResizeEnd}
              role="separator"
              tabIndex={0}
              title="Redimensionner Forge"
            />
          ) : null}
          <div className="teacher-authoring__forge-scroll">
            <div className="teacher-authoring__forge-header">
              <div>
                <span>Forge AI</span>
                <strong>Contexte de travail</strong>
              </div>
              <div className="teacher-authoring__forge-tools">
                {!isForgeOverlay ? (
                  <button
                    aria-label={isForgeExpanded ? "Restaurer la largeur de Forge" : "Élargir Forge"}
                    className="teacher-authoring__forge-expand"
                    onClick={toggleForgeExpanded}
                    title={isForgeExpanded ? "Restaurer la largeur" : "Élargir Forge"}
                    type="button"
                  >
                    {isForgeExpanded ? (
                      <Minimize2 size={17} aria-hidden="true" />
                    ) : (
                      <Maximize2 size={17} aria-hidden="true" />
                    )}
                  </button>
                ) : null}
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
                  title="Fermer Forge"
                  type="button"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            </div>
            {forgePanel}
          </div>
        </aside>
        {forgeHidden && !isForgeOverlay && hasForgePanel ? (
          <aside className="teacher-authoring__rail teacher-authoring__rail--forge" aria-label="Forge réduite">
            <button
              aria-controls="teacher-authoring-forge"
              aria-expanded="false"
              aria-label="Ouvrir Forge"
              onClick={toggleForge}
              title="Ouvrir Forge"
              type="button"
            >
              <Sparkles size={18} aria-hidden="true" />
            </button>
          </aside>
        ) : null}
        </div>
      </TeacherAuthoringSurfaceProvider>
    </section>
  );
}
