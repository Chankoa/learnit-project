"use client";

import { BookOpenText, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ResumeCourseButton } from "@/components/learning/ResumeCourseButton";
import {
  getCompletedLessonIds,
  getLocalCourseProgress,
  LEARNER_LOCAL_CHANGE_EVENT,
  type ResumeCourse
} from "@/lib/learner-local-storage";

type LearningCourseLocalProgressProps = {
  course: ResumeCourse;
};

export function LearningCourseLocalProgress({ course }: LearningCourseLocalProgressProps) {
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const completedLessonSet = useMemo(() => new Set(completedLessonIds), [completedLessonIds]);
  const progress = getLocalCourseProgress(course);

  useEffect(() => {
    function syncProgress() {
      setCompletedLessonIds(getCompletedLessonIds());
    }

    syncProgress();
    window.addEventListener(LEARNER_LOCAL_CHANGE_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);

    return () => {
      window.removeEventListener(LEARNER_LOCAL_CHANGE_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, []);

  return (
    <section className="learning-local-progress" aria-label="Progression locale">
      <div>
        <span>Progression locale</span>
        <strong>{progress.percentage}%</strong>
      </div>
      <div className="learning-progress">
        <span style={{ width: `${progress.percentage}%` }} />
      </div>
      <p>
        {progress.completedCount}/{progress.totalLessons} leçons terminées dans ce navigateur.
      </p>
      <ResumeCourseButton courses={[course]} preferredCourseSlug={course.slug} />

      <div className="learning-local-progress__lessons">
        {course.lessons.map((lesson) => (
          <span data-completed={completedLessonSet.has(lesson.id)} key={lesson.id}>
            {completedLessonSet.has(lesson.id) ? (
              <CheckCircle2 size={14} aria-hidden="true" />
            ) : (
              <BookOpenText size={14} aria-hidden="true" />
            )}
            {lesson.title}
          </span>
        ))}
      </div>
    </section>
  );
}
