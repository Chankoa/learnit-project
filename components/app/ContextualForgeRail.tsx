"use client";

import { Maximize2, Minimize2, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export const FORGE_DRAWER_QUERY = "(max-width: 1279px)";
export function usePanelMediaQuery(query: string) {
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

/** Shared keyboard/scroll lifecycle for contextual panels; desktop remains non-modal. */
export function useContextualPanel({ open, modal, panelRef, onClose }: {
  open: boolean; modal: boolean; panelRef: RefObject<HTMLElement>; onClose: () => void;
}) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    const overflow = document.body.style.overflow;
    if (modal) document.body.style.overflow = "hidden";
    const focusable = () => Array.from(panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])')).filter(element => element.getClientRects().length > 0);
    if (modal) (focusable()[0] ?? panel).focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current(); return; }
      if (!modal || event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements.at(-1);
      if (!first || !last) { event.preventDefault(); panel.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => { if (modal) document.body.style.overflow = overflow; document.removeEventListener("keydown", onKeyDown); };
  }, [open, modal, panelRef]);
}

export function ContextualForgeHeader({ context, onClose, expanded, onExpand }: {
  context: string; onClose: () => void; expanded?: boolean; onExpand?: () => void;
}) {
  return <header className="contextual-forge-header"><div><span><Sparkles size={16} aria-hidden="true" />Forge</span><strong>{context}</strong></div><div>
    {onExpand ? <button type="button" aria-label={expanded ? "Restaurer la largeur de Forge" : "Élargir Forge"} onClick={onExpand}>{expanded ? <Minimize2 size={18} aria-hidden="true" /> : <Maximize2 size={18} aria-hidden="true" />}</button> : null}
    <button type="button" aria-label="Fermer Forge" onClick={onClose}><X size={18} aria-hidden="true" /></button>
  </div></header>;
}
export function CollapsedForgeRail({ controls, onOpen }: { controls: string; onOpen: () => void }) {
  return <aside className="contextual-forge-collapsed" aria-label="Forge réduite"><button type="button" aria-controls={controls} aria-expanded="false" aria-label="Ouvrir Forge" onClick={onOpen}><Sparkles size={20} aria-hidden="true" /><span>Forge</span></button></aside>;
}
