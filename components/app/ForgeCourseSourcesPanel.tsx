"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ForgeSourceManager } from "@/components/app/ForgeSourceManager";
import type { CourseSource } from "@/types/forge-ai";

type ForgeCourseSourcesPanelProps = {
  courseId: string;
  initialSources: CourseSource[];
};

export function ForgeCourseSourcesPanel({
  courseId,
  initialSources
}: ForgeCourseSourcesPanelProps) {
  const router = useRouter();
  const [sources, setSources] = useState(initialSources);

  return (
    <section className="teacher-form-section forge-course-sources-panel">
      <ForgeSourceManager
        courseId={courseId}
        onMutationComplete={() => router.refresh()}
        onSourcesChange={setSources}
        sources={sources}
      />
    </section>
  );
}
