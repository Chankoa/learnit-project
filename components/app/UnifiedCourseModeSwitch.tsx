import { BookOpenText, PenLine } from "lucide-react";
import Link from "next/link";

import type { UnifiedCourseMode } from "@/lib/unified-course-workspace";

type UnifiedCourseModeSwitchProps = {
  canEdit: boolean;
  canLearn: boolean;
  editHref: string;
  learnHref: string;
  mode: UnifiedCourseMode;
};

export function UnifiedCourseModeSwitch({
  canEdit,
  canLearn,
  editHref,
  learnHref,
  mode
}: UnifiedCourseModeSwitchProps) {
  if (!canEdit || !canLearn) return null;

  return (
    <nav aria-label="Mode du parcours" className="unified-course-mode-switch">
      <Link aria-current={mode === "learn" ? "page" : undefined} data-active={mode === "learn"} href={learnHref}>
        <BookOpenText size={16} aria-hidden="true" />
        Apprendre
      </Link>
      <Link aria-current={mode === "edit" ? "page" : undefined} data-active={mode === "edit"} href={editHref}>
        <PenLine size={16} aria-hidden="true" />
        Modifier
      </Link>
    </nav>
  );
}
