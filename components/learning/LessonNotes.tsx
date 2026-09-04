"use client";

import { NotebookPen } from "lucide-react";
import { startTransition, useEffect, useRef, useState } from "react";

import { saveLessonNoteAction } from "@/app/learn/actions";

type LessonNotesProps = {
  lessonId: string;
  courseSlug: string;
  initialNote: string;
};

export function LessonNotes({ lessonId, courseSlug, initialNote }: LessonNotesProps) {
  const [notes, setNotes] = useState(initialNote);
  const [status, setStatus] = useState("Notes enregistrées dans votre compte.");
  const [autosaveCycle, setAutosaveCycle] = useState(0);
  const draftRef = useRef({ content: initialNote, lessonId, revision: 0 });
  const savedNoteRef = useRef({ content: initialNote, lessonId });
  const savingRef = useRef(false);

  useEffect(() => {
    if (draftRef.current.lessonId === lessonId) return;

    draftRef.current = { content: initialNote, lessonId, revision: 0 };
    savedNoteRef.current = { content: initialNote, lessonId };
    setNotes(initialNote);
    setStatus("Notes enregistrées dans votre compte.");
  }, [initialNote, lessonId]);

  useEffect(() => {
    if (notes === savedNoteRef.current.content && lessonId === savedNoteRef.current.lessonId) return;

    const timeoutId = window.setTimeout(() => {
      const draft = draftRef.current;
      if (savingRef.current || draft.lessonId !== lessonId || draft.content === savedNoteRef.current.content) return;

      savingRef.current = true;
      startTransition(async () => {
        try {
          await saveLessonNoteAction(draft.lessonId, draft.content);

          if (draftRef.current.lessonId === draft.lessonId) {
            savedNoteRef.current = { content: draft.content, lessonId: draft.lessonId };
            if (draftRef.current.revision === draft.revision) {
              setStatus("Notes enregistrées.");
            }
          }
        } catch {
          if (draftRef.current.lessonId === draft.lessonId && draftRef.current.revision === draft.revision) {
            setStatus("Enregistrement impossible. Réessayez.");
          }
        } finally {
          savingRef.current = false;
          if (
            draftRef.current.lessonId === lessonId &&
            (draftRef.current.content !== savedNoteRef.current.content || draftRef.current.lessonId !== savedNoteRef.current.lessonId)
          ) {
            setAutosaveCycle((current) => current + 1);
          }
        }
      });
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [autosaveCycle, courseSlug, lessonId, notes]);

  return (
    <section className="lesson-notes" aria-labelledby="lesson-notes-title">
      <div className="lesson-section-heading">
        <div>
          <span>Mes notes</span>
          <h2 id="lesson-notes-title">Notes personnelles</h2>
        </div>
        <NotebookPen size={20} aria-hidden="true" />
      </div>
      <label>
        <span>Notes privées sur cette leçon</span>
        <textarea
          placeholder="Ajoutez vos idées, décisions, questions ou actions à reprendre plus tard."
          rows={7}
          value={notes}
          onChange={(event) => {
            const content = event.target.value;
            draftRef.current = {
              content,
              lessonId,
              revision: draftRef.current.revision + 1
            };
            setNotes(content);
            setStatus("Enregistrement...");
          }}
        />
      </label>
      <p role="status">{status}</p>
    </section>
  );
}
