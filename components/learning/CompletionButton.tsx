"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";

import {
  isLessonCompleted,
  recordLessonAccess,
  setLessonCompleted
} from "@/lib/learner-local-storage";

type CompletionButtonProps = {
  courseSlug: string;
  lessonId: string;
  lessonSlug: string;
  initiallyCompleted?: boolean;
};

export function CompletionButton({
  courseSlug,
  lessonId,
  lessonSlug,
  initiallyCompleted = false
}: CompletionButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initiallyCompleted);

  useEffect(() => {
    recordLessonAccess(courseSlug, lessonSlug);
    setIsCompleted(initiallyCompleted || isLessonCompleted(lessonId));
  }, [courseSlug, initiallyCompleted, lessonId, lessonSlug]);

  function toggleCompletion() {
    const nextValue = !isCompleted;

    setLessonCompleted(lessonId, nextValue);
    setIsCompleted(nextValue);
  }

  return (
    <button
      aria-pressed={isCompleted}
      className="completion-button"
      data-completed={isCompleted}
      type="button"
      onClick={toggleCompletion}
    >
      {isCompleted ? (
        <CheckCircle2 size={19} aria-hidden="true" />
      ) : (
        <Circle size={19} aria-hidden="true" />
      )}
      {isCompleted ? "Leçon terminée" : "Marquer comme terminé"}
    </button>
  );
}
