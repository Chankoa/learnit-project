"use client";

import { NotebookPen } from "lucide-react";
import { startTransition, useEffect, useState } from "react";

import { saveLessonNoteAction } from "@/app/learn/actions";

type LessonNotesProps = {
  lessonId: string;
  courseSlug: string;
  initialNote: string;
};

export function LessonNotes({ lessonId, courseSlug, initialNote }: LessonNotesProps) {
  const [notes, setNotes] = useState(initialNote);
  const [status, setStatus] = useState("Notes enregistrées dans votre compte.");

  useEffect(() => {
    setNotes(initialNote);
  }, [initialNote, lessonId]);

  useEffect(() => {
    if (notes === initialNote) return;
    setStatus("Enregistrement...");
    const timeoutId = window.setTimeout(() => {
      startTransition(async () => {
        try {
          await saveLessonNoteAction(lessonId, notes, courseSlug);
          setStatus("Notes enregistrées.");
        } catch {
          setStatus("Enregistrement impossible. Réessayez.");
        }
      });
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [courseSlug, initialNote, lessonId, notes]);

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
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>
      <p role="status">{status}</p>
    </section>
  );
}
