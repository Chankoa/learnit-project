"use client";

import {
  ArrowLeft,
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
import { Fragment, useEffect, useRef, useState } from "react";

import { CollapsedForgeRail, ContextualForgeHeader, FORGE_DRAWER_QUERY, useContextualPanel, usePanelMediaQuery } from "@/components/app/ContextualForgeRail";
import { CanonicalCourseTopbar } from "@/components/app/CanonicalCourseTopbar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UserCircle } from "lucide-react";
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

export type CanonicalCourseWorkspaceProps = {
  mode: "learn" | "edit";
  identityName?: string;
  courseTitle: string;
  content: ReactNode;
  forgePanel?: ReactNode;
  meta: ReactNode;
  modeActions?: ReactNode;

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

export function CanonicalCourseWorkspace({
  mode,
  identityName,
  courseTitle,
  content,
  forgePanel,
  meta,
  modeActions,

  returnHref,
  returnLabel,
  selectedId,
  selectedKind,
  selectedTitle,
  structure
}: CanonicalCourseWorkspaceProps) {
  const hasForgePanel = Boolean(forgePanel);
  const isForgeOverlay = usePanelMediaQuery(FORGE_DRAWER_QUERY);
  const isStructureOverlay = usePanelMediaQuery("(max-width: 899px)");
  const [activeOverlay, setActiveOverlay] = useState<OverlayPanel>(null);
  const [isForgeOpen, setIsForgeOpen] = useState(hasForgePanel);
  const [isStructureOpen, setIsStructureOpen] = useState(true);
  const [panelPreferencesReady, setPanelPreferencesReady] = useState(false);
  useEffect(() => {
    try {
      const preference = JSON.parse(window.localStorage.getItem("forge:course-panels:v1") ?? "null");
      if (typeof preference?.structureOpen === "boolean") setIsStructureOpen(preference.structureOpen);
      if (typeof preference?.forgeOpen === "boolean") setIsForgeOpen(preference.forgeOpen);
    } catch { /* Panel preferences are optional. */ }
    setPanelPreferencesReady(true);
  }, []);
  useEffect(() => {
    if (!panelPreferencesReady) return;
    try { window.localStorage.setItem("forge:course-panels:v1", JSON.stringify({ structureOpen: isStructureOpen, forgeOpen: isForgeOpen })); } catch { /* Keep controls usable without storage. */ }
  }, [panelPreferencesReady, isStructureOpen, isForgeOpen]);
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
  }, [hasForgePanel, selectedId]);

  useContextualPanel({ open: Boolean(activeOverlay), modal: true,
    panelRef: activeOverlay === "forge" ? forgePanelRef : structurePanelRef, onClose: closeOverlay });

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
      className="teacher-authoring canonical-course-workspace"
      data-mode={mode}
      data-forge-open={!forgeHidden}
      data-forge-resizing={isForgeResizing}
      data-overlay-open={Boolean(activeOverlay)}
      data-structure-open={!structureHidden}
      ref={authoringRef}
      style={{ "--teacher-forge-width": `${forgeWidth}px` } as CSSProperties}
    >
      <CanonicalCourseTopbar className="teacher-authoring__header">
        <Link className="teacher-authoring__back" href={returnHref}>
          <ArrowLeft size={17} aria-hidden="true" />
          {returnLabel}
        </Link>

        <div className="teacher-authoring__identity">
          <span>{courseTitle}</span>
          <strong>{selectedTitle ?? "Parcours"}</strong>
          <small>{selectedKind ? `${selectedKind} · ` : ""}{meta}</small>
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
            Parcours
          </button>
          <button
            aria-controls="teacher-authoring-forge"
            aria-expanded={!forgeHidden}
            className="btn btn-secondary teacher-authoring__forge-toggle"
            disabled={!forgePanel}
            onClick={toggleForge}
            ref={forgeButtonRef}
            type="button"
          >
            <Sparkles size={17} aria-hidden="true" />
            Forge
          </button>
          <ThemeToggle />
          <Link className="btn btn-secondary btn-icon" href="/app/profile" aria-label={identityName ? `Profil de ${identityName}` : "Profil"}><UserCircle size={18} aria-hidden="true" /></Link>
        </div>
      </CanonicalCourseTopbar>

      {activeOverlay ? (
        <button
          aria-label="Fermer le panneau"
          className="teacher-authoring__backdrop"
          onClick={closeOverlay}
          type="button"
        />
      ) : null}


        <div className="teacher-authoring__workspace">
        {structureHidden && !isStructureOverlay ? (
          <aside className="teacher-authoring__rail" aria-label="Parcours réduit">
            <button
              aria-controls="teacher-authoring-structure"
              aria-expanded="false"
              aria-label="Ouvrir le parcours"
              onClick={toggleStructure}
              ref={structureButtonRef}
              title="Ouvrir le parcours"
              type="button"
            >
              <PanelLeft size={18} aria-hidden="true" />
            </button>
          </aside>
        ) : null}
        <aside
          aria-modal={isStructureOverlay || undefined}
          aria-label="Parcours : modules et leçons"
          className="teacher-authoring__structure"
          hidden={structureHidden}
          id="teacher-authoring-structure"
          ref={structurePanelRef}
          role={isStructureOverlay ? "dialog" : undefined}
        >
          <div className="teacher-authoring__panel-header">
            <strong>Parcours</strong>
            <button
              aria-label="Fermer le parcours"
              onClick={() => {
                if (isStructureOverlay) {
                  closeOverlay();
                  return;
                }
                setIsStructureOpen(false);
                requestAnimationFrame(() => structureButtonRef.current?.focus());
              }}
              title="Fermer le parcours"
              type="button"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <Fragment key={`structure:${selectedId ?? "course"}`}>{structure}</Fragment>
        </aside>

        <main aria-label={mode === "learn" ? "Contenu de la leçon" : "Éditeur de l’objet sélectionné"} className="teacher-authoring__editor" id="main-content">
          <Fragment key={`content:${selectedId ?? "course"}`}>{content}</Fragment>
        </main>

        <aside
          aria-modal={isForgeOverlay || undefined}
          aria-label="Forge AI contextuel"
          className="teacher-authoring__forge"
          hidden={forgeHidden}
          id="teacher-authoring-forge"
          ref={forgePanelRef}
          role={isForgeOverlay ? "dialog" : undefined}
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
            <ContextualForgeHeader context={mode === "learn" ? "Comprendre et apprendre" : "Créer et améliorer"} expanded={isForgeExpanded}
              onExpand={!isForgeOverlay ? toggleForgeExpanded : undefined}
              onClose={() => { if (isForgeOverlay) closeOverlay(); else { setIsForgeOpen(false); requestAnimationFrame(() => forgeButtonRef.current?.focus()); } }} />
            <Fragment key={`forge:${selectedId ?? "course"}`}>{forgePanel}</Fragment>
          </div>
        </aside>
        {forgeHidden && !isForgeOverlay && hasForgePanel ? (
          <CollapsedForgeRail controls="teacher-authoring-forge" onOpen={toggleForge} />
        ) : null}
        </div>

    </section>
  );
}
