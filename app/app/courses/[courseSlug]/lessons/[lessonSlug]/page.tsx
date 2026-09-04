import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { TeacherCourseBuilder } from "@/components/app/TeacherCourseBuilder";
import { UnifiedCourseModeSwitch } from "@/components/app/UnifiedCourseModeSwitch";
import { CompletionButton } from "@/components/learning/CompletionButton";
import { LearnerLessonWorkspace } from "@/components/learning/LearnerLessonWorkspace";
import { LessonHeader } from "@/components/learning/LessonHeader";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { LessonNotes } from "@/components/learning/LessonNotes";
import { LessonSidebar } from "@/components/learning/LessonSidebar";
import { MarkdownLessonContent } from "@/components/learning/MarkdownLessonContent";
import { ResourceList } from "@/components/learning/ResourceList";
import { getLessonMdxComponent } from "@/content/lessons/registry";
import { getCurrentProfile, requireAuth } from "@/lib/auth/server";
import { getLearnerForgeSourceSummary, getForgeCourseSources } from "@/lib/forge-ai/service";
import { getLessonNote } from "@/lib/learning-service";
import { createPageMetadata } from "@/lib/seo";
import { getTeacherStudioCourse } from "@/lib/teacher-service";
import { getUnifiedCourseContext } from "@/lib/unified-course-workspace";

type UnifiedLessonPageProps = {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const metadata: Metadata = createPageMetadata({ title: "Leçon", description: "Leçon dans le workspace LearnIt.", path: "/app/courses", noIndex: true });

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function UnifiedLessonPage({ params, searchParams }: UnifiedLessonPageProps) {
  const [{ courseSlug, lessonSlug }, query] = await Promise.all([params, searchParams]);
  const requestedMode = single(query.mode);
  const nextPath = `/app/courses/${courseSlug}/lessons/${lessonSlug}${requestedMode ? `?mode=${encodeURIComponent(requestedMode)}` : ""}`;
  await requireAuth(nextPath);
  const profile = await getCurrentProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(nextPath)}`);

  const context = await getUnifiedCourseContext(courseSlug, requestedMode);
  if (!context) notFound();
  const lesson = context.learning.lessons.find((item) => item.slug === lessonSlug);
  if (!lesson) notFound();

  if (context.mode === "edit") {
    const [course, sources] = await Promise.all([
      getTeacherStudioCourse(context.learning.course.id, `${nextPath}?mode=edit`),
      getForgeCourseSources(context.learning.course.id, `${nextPath}?mode=edit`)
    ]);
    if (!course) notFound();
    return (
      <div className="teacher-focus-page unified-authoring-workspace">
        <TeacherCourseBuilder
          canonicalCourseSlug={courseSlug}
          canonicalLearnHref={`${nextPath}?mode=learn`}
          course={course}
          relationLabel={context.relationLabels.join(" · ")}
          selectedLessonId={lesson.id}
          showLearnMode={context.canLearn}
          sourceCount={sources.length}
        />
      </div>
    );
  }

  if (!context.canLearn || lesson.status === "locked") {
    redirect(`/app/courses/${courseSlug}`);
  }

  const [note, sourceSummary] = await Promise.all([
    getLessonNote(lesson.id),
    getLearnerForgeSourceSummary(context.learning.course.id)
  ]);
  const course = context.learning.course;
  const module = context.learning.modules.find((item) => item.lessons.some((item) => item.id === lesson.id));
  const lessonIndex = context.learning.lessons.findIndex((item) => item.id === lesson.id);
  const initials = profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const learner = { id: profile.id, firstName: profile.name, displayName: profile.name, email: profile.email, initials };
  const resources = lesson.resources ?? module?.resources ?? [];
  const basePath = `/app/courses/${courseSlug}/lessons`;
  const MdxLesson = getLessonMdxComponent(courseSlug, lessonSlug);
  const outline = <LessonSidebar basePath={basePath} course={course} courseHref={`/app/courses/${courseSlug}`} currentLessonId={lesson.id} modules={context.learning.modules} percentage={context.learning.percentage} />;

  return (
    <LearnerLessonWorkspace
      courseId={course.id}
      courseTitle={course.title}
      identity={{ name: profile.name, initials, avatarUrl: profile.avatarUrl }}
      learner={learner}
      lessonId={lesson.id}
      lessonTitle={lesson.title}
      mobileDrawerContent={outline}
      sidebar={outline}
      sourceSummary={sourceSummary}
      workspaceContext={{
        headerActions: context.canEdit ? (
          <UnifiedCourseModeSwitch
            canEdit
            canLearn
            editHref={`${nextPath}?mode=edit`}
            learnHref={`${nextPath}?mode=learn`}
            mode="learn"
          />
        ) : undefined,
        homeHref: "/app/courses",
        homeLabel: "Mes parcours",
        relationLabel: context.relationLabels.join(" · ")
      }}
    >
      <LessonHeader course={course} courseBasePath={`/app/courses/${courseSlug}`} coursesHref="/app/courses" lesson={lesson} module={module} />
      {MdxLesson ? <div className="lesson-content lesson-content--mdx"><MdxLesson /></div> : <MarkdownLessonContent content={lesson.content} />}
      <ResourceList resources={resources} />
      <div className="lesson-completion"><div><span>Progression</span><h2>Cette leçon est-elle terminée ?</h2></div><CompletionButton courseId={course.id} courseSlug={course.slug} initiallyCompleted={lesson.status === "completed"} lessonId={lesson.id} /></div>
      <LessonNotes courseSlug={course.slug} initialNote={note} lessonId={lesson.id} />
      <LessonNavigation basePath={basePath} courseSlug={course.slug} nextLesson={lessonIndex >= 0 ? context.learning.lessons[lessonIndex + 1] : undefined} overviewHref={`/app/courses/${courseSlug}`} previousLesson={lessonIndex > 0 ? context.learning.lessons[lessonIndex - 1] : undefined} />
    </LearnerLessonWorkspace>
  );
}
