"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { startTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  recordLearningTimeAction,
  setLessonCompletedAction,
  startLessonAction
} from "@/app/learn/actions";
import { useToast } from "@/components/app/ToastProvider";

type CompletionButtonProps = {
  courseId: string;
  courseSlug: string;
  lessonId: string;
  initiallyCompleted?: boolean;
};

export function CompletionButton({
  courseId,
  courseSlug,
  lessonId,
  initiallyCompleted = false
}: CompletionButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initiallyCompleted);
  const [isPending, setIsPending] = useState(false);
  const startedAt = useRef(Date.now());
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    startLessonAction(courseId, lessonId, courseSlug).catch(() => undefined);
    setIsCompleted(initiallyCompleted);

    return () => {
      const elapsedMinutes = Math.floor((Date.now() - startedAt.current) / 60000);
      if (elapsedMinutes > 0) {
        recordLearningTimeAction(courseId, lessonId, courseSlug, elapsedMinutes).catch(() => undefined);
      }
    };
  }, [courseId, courseSlug, initiallyCompleted, lessonId]);

  function toggleCompletion() {
    if (isPending) {
      return;
    }

    const nextValue = !isCompleted;
    setIsCompleted(nextValue);
    setIsPending(true);
    startTransition(async () => {
      try {
        await setLessonCompletedAction(courseId, lessonId, courseSlug, nextValue);
        showToast({
          description: "Votre progression est enregistrée dans votre compte.",
          title: nextValue ? "Leçon marquée comme terminée" : "Leçon remise à faire",
          variant: nextValue ? "success" : "info"
        });
        router.refresh();
      } catch {
        setIsCompleted(!nextValue);
        showToast({ title: "Mise à jour impossible", description: "Réessayez dans un instant.", variant: "danger" });
      } finally {
        setIsPending(false);
      }
    });
  }

  return (
    <button
      aria-pressed={isCompleted}
      className="completion-button"
      data-completed={isCompleted}
      disabled={isPending}
      type="button"
      onClick={toggleCompletion}
    >
      {isCompleted ? (
        <CheckCircle2 size={19} aria-hidden="true" />
      ) : (
        <Circle size={19} aria-hidden="true" />
      )}
      {isPending ? "Enregistrement..." : isCompleted ? "Leçon terminée" : "Marquer comme terminé"}
    </button>
  );
}
