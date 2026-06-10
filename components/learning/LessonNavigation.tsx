import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import type { Lesson } from "@/types/learning";

type LessonNavigationProps = {
  courseSlug: string;
  previousLesson?: Lesson;
  nextLesson?: Lesson;
};

export function LessonNavigation({
  courseSlug,
  previousLesson,
  nextLesson
}: LessonNavigationProps) {
  return (
    <nav className="lesson-navigation" aria-label="Navigation entre les leçons">
      {previousLesson ? (
        <Link href={`/learn/${courseSlug}/${previousLesson.slug}`}>
          <ArrowLeft size={18} aria-hidden="true" />
          <span>
            <small>Leçon précédente</small>
            <strong>{previousLesson.title}</strong>
          </span>
        </Link>
      ) : (
        <span className="lesson-navigation__empty" />
      )}

      {nextLesson ? (
        <Link href={`/learn/${courseSlug}/${nextLesson.slug}`}>
          <span>
            <small>Leçon suivante</small>
            <strong>{nextLesson.title}</strong>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      ) : (
        <Link href={`/learn/${courseSlug}`}>
          <span>
            <small>Parcours terminé</small>
            <strong>Retour à la formation</strong>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}
