"use client";

import { Check, Loader2, Plus, X } from "lucide-react";
import { startTransition, useId, useState } from "react";

import { createTeacherDomainAction } from "@/app/app/teacher/courses/actions";
import type { Domain } from "@/types/course";

type TeacherDomainPickerProps = {
  domains: Domain[];
  selectedDomainId?: string;
};

export function TeacherDomainPicker({ domains, selectedDomainId }: TeacherDomainPickerProps) {
  const selectId = useId();
  const inputId = useId();
  const [items, setItems] = useState(domains);
  const [selectedId, setSelectedId] = useState(selectedDomainId || domains[0]?.id || "");
  const [draftName, setDraftName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "error" | "success"; message: string }>();

  function cancelCreate() {
    setDraftName("");
    setIsCreating(false);
    setFeedback(undefined);
  }

  function createDomain() {
    const name = draftName.trim();

    if (!name) {
      setFeedback({ tone: "error", message: "Le nom du domaine est requis." });
      return;
    }

    setIsPending(true);
    setFeedback(undefined);

    startTransition(async () => {
      const result = await createTeacherDomainAction(name);

      if (!result.ok) {
        setFeedback({ tone: "error", message: result.error });
        setIsPending(false);
        return;
      }

      setItems((currentItems) => {
        const exists = currentItems.some((domain) => domain.id === result.domain.id);
        return exists
          ? currentItems
          : [...currentItems, result.domain].sort(
              (first, second) => (first.order ?? 0) - (second.order ?? 0)
            );
      });
      setSelectedId(result.domain.id);
      setDraftName("");
      setIsCreating(false);
      setFeedback({ tone: "success", message: result.message });
      setIsPending(false);
    });
  }

  return (
    <div className="teacher-field teacher-domain-picker">
      <label htmlFor={selectId}>Domaine</label>
      <select
        id={selectId}
        name="domainId"
        onChange={(event) => setSelectedId(event.target.value)}
        required
        value={selectedId}
      >
        {items.map((domain) => (
          <option key={domain.id} value={domain.id}>
            {domain.name}
          </option>
        ))}
      </select>

      {!isCreating ? (
        <button className="teacher-inline-action" onClick={() => setIsCreating(true)} type="button">
          <Plus size={16} aria-hidden="true" />
          Créer un domaine
        </button>
      ) : (
        <div className="teacher-domain-create">
          <label htmlFor={inputId}>
            <span>Nom du domaine</span>
            <input
              autoFocus
              disabled={isPending}
              id={inputId}
              maxLength={80}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Ex. Création web"
              type="text"
              value={draftName}
            />
          </label>
          <div className="teacher-domain-create__actions">
            <button className="btn btn-secondary" disabled={isPending} onClick={cancelCreate} type="button">
              <X size={16} aria-hidden="true" />
              Annuler
            </button>
            <button className="btn btn-primary" disabled={isPending} onClick={createDomain} type="button">
              {isPending ? <Loader2 className="auth-button-spinner" size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}
              {isPending ? "Création..." : "Créer"}
            </button>
          </div>
        </div>
      )}

      {feedback ? (
        <p className="teacher-field-note" data-tone={feedback.tone} role={feedback.tone === "error" ? "alert" : "status"} aria-live="polite">
          {feedback.message}
        </p>
      ) : (
        <p className="teacher-field-note">Les domaines créés ici sont disponibles immédiatement pour vos formations.</p>
      )}
    </div>
  );
}
