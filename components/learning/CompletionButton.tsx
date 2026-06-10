"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";

type CompletionButtonProps = {
  lessonId: string;
  initiallyCompleted?: boolean;
};

const COMPLETION_STORAGE_KEY = "learnit-completed-lessons";

function readCompletedLessons() {
  try {
    const storedValue = window.localStorage.getItem(COMPLETION_STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];

    return Array.isArray(parsedValue)
      ? parsedValue.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function CompletionButton({
  lessonId,
  initiallyCompleted = false
}: CompletionButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initiallyCompleted);

  useEffect(() => {
    setIsCompleted(
      initiallyCompleted || readCompletedLessons().includes(lessonId)
    );
  }, [initiallyCompleted, lessonId]);

  function toggleCompletion() {
    const completedLessons = new Set(readCompletedLessons());
    const nextValue = !isCompleted;

    if (nextValue) {
      completedLessons.add(lessonId);
    } else {
      completedLessons.delete(lessonId);
    }

    try {
      window.localStorage.setItem(
        COMPLETION_STORAGE_KEY,
        JSON.stringify([...completedLessons])
      );
    } catch {
      // The button remains usable even when local storage is unavailable.
    }

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
      {isCompleted ? "Leçon terminée" : "Marquer comme terminée"}
    </button>
  );
}
