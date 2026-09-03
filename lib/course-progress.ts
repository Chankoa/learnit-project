export type CourseProgressSummary = {
  completedCount: number;
  totalLessons: number;
  percentage: number;
};

export function calculateProgressCounts(completedCount: number, totalLessons: number): CourseProgressSummary {
  const boundedTotal = Math.max(0, totalLessons);
  const boundedCompleted = Math.min(Math.max(0, completedCount), boundedTotal);

  return {
    completedCount: boundedCompleted,
    totalLessons: boundedTotal,
    percentage: boundedTotal > 0 ? Math.round((boundedCompleted / boundedTotal) * 100) : 0
  };
}

export function calculateCourseProgress(
  completedLessonIds: Iterable<string>,
  accessibleLessonIds: Iterable<string>
): CourseProgressSummary {
  const accessible = new Set(accessibleLessonIds);
  const completedCount = [...new Set(completedLessonIds)].filter((lessonId) =>
    accessible.has(lessonId)
  ).length;

  return calculateProgressCounts(completedCount, accessible.size);
}
