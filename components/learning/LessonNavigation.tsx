import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

import type { Lesson } from "@/types/learning";

type LessonNavigationProps = {
  basePath?: string;
  overviewHref?: string;
  courseSlug: string;
  previousLesson?: Lesson;
  nextLesson?: Lesson;
};

function getLessonStateLabel(lesson: Lesson) {
  return lesson.status === "completed" ? "Terminée" : "À faire";
}

export function LessonNavigation({
  basePath,
  overviewHref,
  courseSlug,
  previousLesson,
  nextLesson
}: LessonNavigationProps) {
  const courseBasePath = basePath ?? `/learn/${courseSlug}`;
  const courseOverviewHref = overviewHref ?? `/learn/${courseSlug}`;

  return (
    <nav className="lesson-navigation" aria-label="Navigation entre les leçons">
      {previousLesson ? (
        <Link href={`${courseBasePath}/${previousLesson.slug}`}>
          <ArrowLeft size={18} aria-hidden="true" />
          <span>
            <small>Leçon précédente · {getLessonStateLabel(previousLesson)}</small>
            <strong>{previousLesson.title}</strong>
          </span>
        </Link>
      ) : (
        <span className="lesson-navigation__empty" />
      )}

      {nextLesson ? (
        <Link href={`${courseBasePath}/${nextLesson.slug}`}>
          <span>
            <small>Leçon suivante · {getLessonStateLabel(nextLesson)}</small>
            <strong>{nextLesson.title}</strong>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </Link>
      ) : (
        <Link href={courseOverviewHref}>
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
