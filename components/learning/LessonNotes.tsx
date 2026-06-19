"use client";

import { NotebookPen } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getLessonNotes,
  setLessonNotes
} from "@/lib/learner-local-storage";

type LessonNotesProps = {
  lessonId: string;
};

export function LessonNotes({ lessonId }: LessonNotesProps) {
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("Notes locales");

  useEffect(() => {
    setNotes(getLessonNotes(lessonId));
    setStatus("Notes locales");
  }, [lessonId]);

  useEffect(() => {
    setStatus("Enregistrement automatique...");
    const timeoutId = window.setTimeout(() => {
      setLessonNotes(lessonId, notes);
      setStatus("Notes enregistrées automatiquement.");
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [lessonId, notes]);

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
