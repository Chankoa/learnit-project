import type { Metadata } from "next";
import {
  BookOpenText,
  CheckCircle2,
  Clock3,
  Eye,
  Layers3,
  LockKeyhole,
  PlayCircle
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatCourseDuration } from "@/components/catalog/CourseCard";
import { LearningShell } from "@/components/learning/LearningShell";
import {
  getLearningCourseData,
  getLearningCourseStaticParams
} from "@/lib/learning";
import { getLearnerProfile } from "@/lib/progress";
import { createPageMetadata } from "@/lib/seo";
import type { LessonStatus } from "@/types/learning";

type LearningCoursePageProps = {
  params: Promise<{
    courseSlug: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getLearningCourseStaticParams();
}

export async function generateMetadata({
  params
}: LearningCoursePageProps): Promise<Metadata> {
  const { courseSlug } = await params;
  const data = getLearningCourseData(courseSlug);

  return data
    ? createPageMetadata({
        title: `Mon parcours - ${data.course.title}`,
        description: `Suivez les modules et les leçons de ${data.course.title}.`,
        path: `/learn/${data.course.slug}`,
        image: data.course.coverImage,
        noIndex: true
      })
    : {
        title: "Parcours introuvable"
      };
}

function LessonIcon({ status }: { status: LessonStatus }) {
  const icons = {
    available: PlayCircle,
    locked: LockKeyhole,
    preview: Eye,
    "in-progress": PlayCircle,
    completed: CheckCircle2
  };
  const Icon = icons[status];

  return <Icon size={17} aria-hidden="true" />;
}

export default async function LearningCoursePage({
  params
}: LearningCoursePageProps) {
  const { courseSlug } = await params;
  const data = getLearningCourseData(courseSlug);

  if (!data) {
    notFound();
  }

  const learner = getLearnerProfile();
  const continueHref = data.currentLesson
    ? `/learn/${data.course.slug}/${data.currentLesson.slug}`
    : undefined;

  return (
    <LearningShell learner={learner} pageTitle="Mon parcours">
      <div className="learning-course-page">
        <section className="learning-course-hero">
          <div>
            <span className="dashboard-kicker">{data.course.domain.name}</span>
            <h2>{data.course.title}</h2>
            <p>{data.course.subtitle ?? data.course.description}</p>
          </div>

          <div className="learning-course-hero__progress">
            <strong>{data.percentage}%</strong>
            <span>de la formation terminée</span>
            <div className="learning-progress">
              <span style={{ width: `${data.percentage}%` }} />
            </div>
            {continueHref ? (
              <Link className="btn btn-primary" href={continueHref}>
                <PlayCircle size={18} aria-hidden="true" />
                Continuer la formation
              </Link>
            ) : null}
          </div>
        </section>

        <section className="learning-metrics" aria-label="Résumé de la formation">
          <article>
            <span className="learning-metric-icon learning-metric-icon--purple">
              <Layers3 size={19} aria-hidden="true" />
            </span>
            <div>
              <small>Modules</small>
              <strong>{data.modules.length}</strong>
            </div>
          </article>
          <article>
            <span className="learning-metric-icon learning-metric-icon--cyan">
              <BookOpenText size={19} aria-hidden="true" />
            </span>
            <div>
              <small>Leçons terminées</small>
              <strong>{data.completedCount}/{data.totalLessons}</strong>
            </div>
          </article>
          <article>
            <span className="learning-metric-icon learning-metric-icon--green">
              <Clock3 size={19} aria-hidden="true" />
            </span>
            <div>
              <small>Durée estimée</small>
              <strong>{formatCourseDuration(data.course.durationMinutes)}</strong>
            </div>
          </article>
        </section>

        <section className="learning-course-curriculum">
          <div className="learning-section__heading">
            <div>
              <span>Programme</span>
              <h2>Modules et leçons</h2>
            </div>
          </div>

          <div className="learning-module-list">
            {data.modules.map((module) => (
              <details
                aria-label={`Module ${module.order} : ${module.title}`}
                data-status={module.status}
                key={module.id}
                open={module.lessons.some(
                  (lesson) => lesson.id === data.currentLesson?.id
                )}
              >
                <summary>
                  <span className="learning-module-list__index">{module.order}</span>
                  <div>
                    <small>Module {module.order}</small>
                    <h3>{module.title}</h3>
                    <p>{module.description}</p>
                  </div>
                  <span>{formatCourseDuration(module.durationMinutes)}</span>
                </summary>

                <div className="learning-module-lessons">
                  {module.lessons.map((lesson) => {
                    const status = lesson.status ?? "available";
                    const content = (
                      <>
                        <span data-status={status}>
                          <LessonIcon status={status} />
                        </span>
                        <div>
                          <strong>{lesson.title}</strong>
                          <small>
                            {formatCourseDuration(lesson.durationMinutes)} · {lesson.type}
                          </small>
                        </div>
                        <span className="state-badge" data-state={status}>
                          {status === "completed"
                            ? "Terminée"
                            : status === "in-progress"
                              ? "En cours"
                              : status === "preview"
                                ? "Aperçu"
                                : status === "locked"
                                  ? "Verrouillée"
                                  : "Disponible"}
                        </span>
                      </>
                    );

                    return status === "locked" ? (
                      <div className="learning-module-lesson" key={lesson.id}>
                        {content}
                      </div>
                    ) : (
                      <Link
                        className="learning-module-lesson"
                        href={`/learn/${data.course.slug}/${lesson.slug}`}
                        key={lesson.id}
                      >
                        {content}
                      </Link>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </LearningShell>
  );
}
