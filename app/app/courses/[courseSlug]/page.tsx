import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { TeacherCourseBuilder } from "@/components/app/TeacherCourseBuilder";
import { UnifiedCourseOverview } from "@/components/app/UnifiedCourseOverview";
import { getCurrentProfile, requireAuth } from "@/lib/auth/server";
import { getForgeCourseSources } from "@/lib/forge-ai/service";
import { createPageMetadata } from "@/lib/seo";
import { getTeacherStudioCourse } from "@/lib/teacher-service";
import { getUnifiedCourseContext } from "@/lib/unified-course-workspace";

type UnifiedCoursePageProps = {
  params: Promise<{ courseSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const metadata: Metadata = createPageMetadata({ title: "Parcours", description: "Workspace de parcours LearnIt.", path: "/app/courses", noIndex: true });

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function UnifiedCoursePage({ params, searchParams }: UnifiedCoursePageProps) {
  const [{ courseSlug }, query] = await Promise.all([params, searchParams]);
  await requireAuth(`/app/courses/${courseSlug}`);
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(`/app/courses/${courseSlug}`)}`);

  const context = await getUnifiedCourseContext(courseSlug, single(query.mode));
  if (!context) notFound();

  if (context.mode === "edit") {
    const [course, sources] = await Promise.all([
      getTeacherStudioCourse(context.learning.course.id, `/app/courses/${courseSlug}?mode=edit`),
      getForgeCourseSources(context.learning.course.id, `/app/courses/${courseSlug}?mode=edit`)
    ]);
    if (!course) notFound();

    return (
      <div className="teacher-focus-page unified-authoring-workspace">
        <TeacherCourseBuilder
          canonicalCourseSlug={courseSlug}
          canonicalLearnHref={(() => {
            const selectedLesson = context.learning.lessons.find((lesson) => lesson.id === single(query.lesson));
            return selectedLesson
              ? `/app/courses/${courseSlug}/lessons/${selectedLesson.slug}?mode=learn`
              : `/app/courses/${courseSlug}?mode=learn`;
          })()}
          course={course}
          error={single(query.error)}
          message={single(query.message)}
          previewLessonId={single(query.preview)}
          relationLabel={context.relationLabels.join(" · ")}
          selectedLessonId={single(query.lesson)}
          selectedModuleId={single(query.module)}
          showLearnMode={context.canLearn}
          sourceCount={sources.length}
        />
      </div>
    );
  }

  return <UnifiedCourseOverview context={context} profile={profile} />;
}
