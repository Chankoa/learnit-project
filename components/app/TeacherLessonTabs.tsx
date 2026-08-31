"use client";

import type { ReactNode } from "react";

import {
  type TeacherAuthoringSurface,
  useTeacherAuthoringSurface
} from "@/components/app/TeacherAuthoringSurface";
import { teacherAuthoringSurfaceLabels } from "@/lib/teacher-authoring";

type TeacherLessonTabsProps = {
  children: ReactNode;
  lessonId: string;
};

const tabs: Array<[TeacherAuthoringSurface, string]> = [
  ["information", teacherAuthoringSurfaceLabels.information],
  ["content", teacherAuthoringSurfaceLabels.content],
  ["resources", teacherAuthoringSurfaceLabels.resources]
];

export function TeacherLessonTabs({ children, lessonId }: TeacherLessonTabsProps) {
  const { activeSurface, setActiveSurface } = useTeacherAuthoringSurface();

  return (
    <div className="teacher-lesson-tab-workspace" data-active-tab={activeSurface}>
      <div aria-label="Sections de l’éditeur" className="teacher-lesson-tabs" role="tablist">
        {tabs.map(([tab, label]) => (
          <button
            aria-controls={`lesson-${tab}-${lessonId}`}
            aria-selected={activeSurface === tab}
            id={`lesson-tab-${tab}-${lessonId}`}
            key={tab}
            onClick={() => setActiveSurface(tab)}
            role="tab"
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
}
