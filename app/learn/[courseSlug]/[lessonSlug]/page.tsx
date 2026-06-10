import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CompletionButton } from "@/components/learning/CompletionButton";
import { ExerciseBlock } from "@/components/learning/ExerciseBlock";
import { LearningShell } from "@/components/learning/LearningShell";
import { LessonContent } from "@/components/learning/LessonContent";
import { LessonHeader } from "@/components/learning/LessonHeader";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { LessonSidebar } from "@/components/learning/LessonSidebar";
import { ResourceList } from "@/components/learning/ResourceList";
import {
  getLearningLessonData,
  getLearningLessonStaticParams
} from "@/lib/learning";
import { getLearnerProfile } from "@/lib/progress";

type LessonPageProps = {
  params: Promise<{
    courseSlug: string;
    lessonSlug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getLearningLessonStaticParams();
}

export async function generateMetadata({
  params
}: LessonPageProps): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const data = getLearningLessonData(courseSlug, lessonSlug);

  return data
    ? {
        title: `${data.lesson.title} - ${data.course.title}`,
        description: data.lesson.description
      }
    : {
        title: "Leçon introuvable"
      };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseSlug, lessonSlug } = await params;
  const data = getLearningLessonData(courseSlug, lessonSlug);

  if (!data) {
    notFound();
  }

  return (
    <LearningShell
      learner={getLearnerProfile()}
      pageTitle={data.course.title}
      variant="lesson"
    >
      <div className="lesson-page-layout">
        <LessonSidebar
          course={data.course}
          currentLessonId={data.lesson.id}
          modules={data.modules}
          percentage={data.percentage}
        />

        <article className="lesson-page">
          <LessonHeader
            course={data.course}
            lesson={data.lesson}
            module={data.module}
          />
          <LessonContent content={data.content} />
          <ResourceList resources={data.resources} />
          <ExerciseBlock exercise={data.content.exercise} />

          <div className="lesson-completion">
            <div>
              <span>Progression</span>
              <h2>Cette leçon est-elle terminée ?</h2>
            </div>
            <CompletionButton
              initiallyCompleted={data.lesson.status === "completed"}
              lessonId={data.lesson.id}
            />
          </div>

          <LessonNavigation
            courseSlug={data.course.slug}
            nextLesson={data.nextLesson}
            previousLesson={data.previousLesson}
          />
        </article>
      </div>
    </LearningShell>
  );
}
