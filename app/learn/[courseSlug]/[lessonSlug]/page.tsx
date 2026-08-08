import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { CompletionButton } from "@/components/learning/CompletionButton";
import { ExerciseBlock } from "@/components/learning/ExerciseBlock";
import { LearningShell } from "@/components/learning/LearningShell";
import { LessonContent } from "@/components/learning/LessonContent";
import { LessonHeader } from "@/components/learning/LessonHeader";
import { LessonNotes } from "@/components/learning/LessonNotes";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { LessonSidebar } from "@/components/learning/LessonSidebar";
import { ResourceList } from "@/components/learning/ResourceList";
import { getLessonMdxComponent } from "@/content/lessons/registry";
import { requireRole } from "@/lib/auth/server";
import { getLessonContent } from "@/lib/lesson-content";
import { getLearningCourseState, getLessonNote } from "@/lib/learning-service";
import { createPageMetadata } from "@/lib/seo";

type LessonPageProps = {
  params: Promise<{
    courseSlug: string;
    lessonSlug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: LessonPageProps): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const data = await getLearningCourseState(courseSlug);
  const lesson = data?.lessons.find((item) => item.slug === lessonSlug);

  return data && lesson
    ? createPageMetadata({
        title: `${lesson.title} - ${data.course.title}`,
        description: lesson.description ?? data.course.description,
        path: `/learn/${data.course.slug}/${lesson.slug}`,
        image: data.course.coverImage,
        noIndex: true
      })
    : {
        title: "Leçon introuvable"
      };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;
  const profile = await requireRole("learner", `/learn/${courseSlug}/${lessonSlug}`);
  const data = await getLearningCourseState(courseSlug);
  const lesson = data?.lessons.find((item) => item.slug === lessonSlug);

  if (!data || !lesson) {
    notFound();
  }

  if (!data.enrollment) {
    redirect(
      `/access-denied?reason=resource&current=${encodeURIComponent(profile.role)}&next=${encodeURIComponent(
        `/learn/${courseSlug}/${lessonSlug}`
      )}`
    );
  }

  const MdxLesson = getLessonMdxComponent(courseSlug, lessonSlug);
  const note = await getLessonNote(lesson.id);
  const module = data.modules.find((item) => item.lessons.some((item) => item.id === lesson.id));
  const lessonIndex = data.lessons.findIndex((item) => item.id === lesson.id);
  const initials = profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const learner = { id: profile.id, firstName: profile.name, displayName: profile.name, email: profile.email, initials };
  const content = getLessonContent(lesson);

  return (
    <LearningShell
      identity={{ name: profile.name, initials, avatarUrl: profile.avatarUrl }}
      learner={learner}
      pageTitle={data.course.title}
      variant="lesson"
    >
      <div className="lesson-page-layout">
        <LessonSidebar
          course={data.course}
            currentLessonId={lesson.id}
          modules={data.modules}
          percentage={data.percentage}
        />

        <article className="lesson-page">
          <LessonHeader
            course={data.course}
            lesson={lesson}
            module={module}
          />
          {MdxLesson ? (
            <div className="lesson-content lesson-content--mdx">
              <MdxLesson />
            </div>
          ) : (
            <>
              <LessonContent content={content} />
              <ResourceList resources={lesson.resources ?? module?.resources ?? []} />
              <ExerciseBlock exercise={content.exercise} />
            </>
          )}

          <div className="lesson-completion">
            <div>
              <span>Progression</span>
              <h2>Cette leçon est-elle terminée ?</h2>
            </div>
            <CompletionButton
              courseId={data.course.id}
              courseSlug={data.course.slug}
              initiallyCompleted={lesson.status === "completed"}
              lessonId={lesson.id}
            />
          </div>

          <LessonNotes courseSlug={data.course.slug} initialNote={note} lessonId={lesson.id} />

          <LessonNavigation
            courseSlug={data.course.slug}
            nextLesson={lessonIndex >= 0 ? data.lessons[lessonIndex + 1] : undefined}
            previousLesson={lessonIndex > 0 ? data.lessons[lessonIndex - 1] : undefined}
          />
        </article>
      </div>
    </LearningShell>
  );
}
