"use client";

import { BookOpenCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getLocalCourseProgress,
  LEARNER_LOCAL_CHANGE_EVENT,
  type ResumeCourse
} from "@/lib/learner-local-storage";

type LearnerLocalProgressStripProps = {
  courses: ResumeCourse[];
};

function getGlobalProgress(courses: ResumeCourse[]) {
  const totals = courses.reduce(
    (accumulator, course) => {
      const progress = getLocalCourseProgress(course);

      return {
        completed: accumulator.completed + progress.completedCount,
        total: accumulator.total + progress.totalLessons
      };
    },
    { completed: 0, total: 0 }
  );

  return {
    ...totals,
    percentage: totals.total > 0 ? Math.round((totals.completed / totals.total) * 100) : 0
  };
}

export function LearnerLocalProgressStrip({ courses }: LearnerLocalProgressStripProps) {
  const [progress, setProgress] = useState(() => getGlobalProgress(courses));

  useEffect(() => {
    function syncProgress() {
      setProgress(getGlobalProgress(courses));
    }

    syncProgress();
    window.addEventListener(LEARNER_LOCAL_CHANGE_EVENT, syncProgress);
    window.addEventListener("storage", syncProgress);

    return () => {
      window.removeEventListener(LEARNER_LOCAL_CHANGE_EVENT, syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, [courses]);

  return (
    <section className="learner-local-progress-strip" aria-label="Progression locale">
      <span className="learning-metric-icon learning-metric-icon--green">
        <Sparkles size={19} aria-hidden="true" />
      </span>
      <div>
        <span>Progression locale</span>
        <strong>{progress.percentage}%</strong>
      </div>
      <div className="learning-progress">
        <span style={{ width: `${progress.percentage}%` }} />
      </div>
      <p>
        <BookOpenCheck size={16} aria-hidden="true" />
        {progress.completed}/{progress.total} leçons terminées dans ce navigateur.
      </p>
    </section>
  );
}
