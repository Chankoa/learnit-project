import { BookOpen, Clock, Layers, MonitorPlay } from "lucide-react";

import { formatCourseDuration, getCourseLessonCount } from "@/components/catalog/CourseCard";
import type { Course, CourseModule } from "@/types/course";

type CourseMetaProps = {
  course: Course;
  modules: CourseModule[];
};

export function CourseMeta({ course, modules }: CourseMetaProps) {
  return (
    <section className="section-shell -mt-8 pb-8">
      <div className="lesson-card grid gap-4 p-5 md:grid-cols-4">
        <div className="flex items-center gap-3">
          <span className="icon-badge">
            <Layers size={18} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-extrabold text-text-strong">
              {modules.length} module{modules.length > 1 ? "s" : ""}
            </span>
            <span className="block text-xs text-text-muted">programme complet</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="icon-badge">
            <BookOpen size={18} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-extrabold text-text-strong">
              {getCourseLessonCount(course)} leçons
            </span>
            <span className="block text-xs text-text-muted">progression guidée</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="icon-badge">
            <Clock size={18} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-extrabold text-text-strong">
              {formatCourseDuration(course.durationMinutes)}
            </span>
            <span className="block text-xs text-text-muted">durée estimée</span>
          </span>
        </div>
        {course.format ? (
          <div className="flex items-center gap-3">
            <span className="icon-badge">
              <MonitorPlay size={18} aria-hidden="true" />
            </span>
            <span>
              <span className="block text-sm font-extrabold text-text-strong">Format</span>
              <span className="block text-xs text-text-muted">{course.format}</span>
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
