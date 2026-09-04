import {
  CheckCircle2,
  Circle,
  Eye,
  LockKeyhole,
  PlayCircle
} from "lucide-react";
import Link from "next/link";

import { CourseOutlineRail } from "@/components/app/CourseOutlineRail";
import type { Course, CourseModule } from "@/types/course";
import type { Lesson, LessonStatus } from "@/types/learning";

type LessonSidebarProps = {
  basePath?: string;
  courseHref?: string;
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
  basePath,
  lesson,
  isCurrent
}: {
  basePath: string;
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
      href={`${basePath}/${lesson.slug}`}
    >
      {content}
    </Link>
  );
}

export function LessonSidebar({
  basePath,
  courseHref,
  course,
  modules,
  currentLessonId,
  percentage
}: LessonSidebarProps) {
  const courseBasePath = basePath ?? `/learn/${course.slug}`;
  const overviewHref = courseHref ?? `/learn/${course.slug}`;

  return (
    <CourseOutlineRail className="lesson-sidebar" label={`Parcours ${course.title}`}>
      <div className="lesson-sidebar__summary">
        <Link href={overviewHref}>Retour au parcours</Link>
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
                  basePath={courseBasePath}
                  isCurrent={lesson.id === currentLessonId}
                  key={lesson.id}
                  lesson={lesson}
                />
              ))}
            </div>
          </details>
        ))}
      </div>
    </CourseOutlineRail>
  );
}
