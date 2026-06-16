import {
  CheckCircle2,
  Circle,
  Eye,
  LockKeyhole,
  PlayCircle
} from "lucide-react";
import Link from "next/link";

import type { Course, CourseModule } from "@/types/course";
import type { Lesson, LessonStatus } from "@/types/learning";

type LessonSidebarProps = {
  course: Course;
  modules: CourseModule[];
  currentLessonId?: string;
  percentage: number;
};

function LessonStateIcon({ status }: { status: LessonStatus }) {
  const icons = {
    available: Circle,
    locked: LockKeyhole,
    preview: Eye,
    "in-progress": PlayCircle,
    completed: CheckCircle2
  };
  const Icon = icons[status];

  return <Icon size={16} aria-hidden="true" />;
}

function LessonItem({
  courseSlug,
  lesson,
  isCurrent
}: {
  courseSlug: string;
  lesson: Lesson;
  isCurrent: boolean;
}) {
  const status = lesson.status ?? "available";
  const content = (
    <>
      <LessonStateIcon status={status} />
      <span>{lesson.title}</span>
    </>
  );

  if (status === "locked") {
    return (
      <span className="lesson-sidebar__lesson" data-status={status}>
        {content}
      </span>
    );
  }

  return (
    <Link
      aria-current={isCurrent ? "page" : undefined}
      className="lesson-sidebar__lesson"
      data-status={status}
      href={`/learn/${courseSlug}/${lesson.slug}`}
    >
      {content}
    </Link>
  );
}

export function LessonSidebar({
  course,
  modules,
  currentLessonId,
  percentage
}: LessonSidebarProps) {
  return (
    <aside className="lesson-sidebar" aria-label={`Parcours ${course.title}`}>
      <div className="lesson-sidebar__summary">
        <Link href={`/learn/${course.slug}`}>Vue du parcours</Link>
        <h2>{course.title}</h2>
        <div className="learning-progress" aria-label={`${percentage}% de progression`}>
          <span style={{ width: `${percentage}%` }} />
        </div>
        <small>{percentage}% terminé</small>
      </div>

      <div className="lesson-sidebar__modules">
        {modules.map((module) => (
          <details
            aria-label={`Module ${module.order} : ${module.title}`}
            key={module.id}
            open={module.lessons.some((lesson) => lesson.id === currentLessonId)}
          >
            <summary>
              <span>Module {module.order}</span>
              <strong>{module.title}</strong>
            </summary>
            <div>
              {module.lessons.map((lesson) => (
                <LessonItem
                  courseSlug={course.slug}
                  isCurrent={lesson.id === currentLessonId}
                  key={lesson.id}
                  lesson={lesson}
                />
              ))}
            </div>
          </details>
        ))}
      </div>
    </aside>
  );
}
