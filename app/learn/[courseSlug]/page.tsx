import type { Metadata } from "next";
import { BookOpenText, CheckCircle2, Clock3, Layers3 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { formatCourseDuration } from "@/components/catalog/CourseCard";
import { EnrollmentButton } from "@/components/learning/EnrollmentButton";
import { LearningShell } from "@/components/learning/LearningShell";
import { requireRole } from "@/lib/auth/server";
import { getLearningCourseState } from "@/lib/learning-service";
import { createPageMetadata } from "@/lib/seo";

type LearningCoursePageProps = {
  params: Promise<{
    courseSlug: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params
}: LearningCoursePageProps): Promise<Metadata> {
  const { courseSlug } = await params;
  const data = await getLearningCourseState(courseSlug);

  return data
    ? createPageMetadata({
        title: `Parcours - ${data.course.title}`,
        description: `Suivez les modules et les leçons de ${data.course.title}.`,
        path: `/learn/${data.course.slug}`,
        image: data.course.coverImage,
        noIndex: true
      })
    : {
        title: "Parcours introuvable"
      };
}

export default async function LearningCoursePage({
  params
}: LearningCoursePageProps) {
  const { courseSlug } = await params;
  const profile = await requireRole("learner", `/learn/${courseSlug}`);
  const data = await getLearningCourseState(courseSlug);

  if (!data) {
    notFound();
  }

  const initials = profile.name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const learner = { id: profile.id, firstName: profile.name, displayName: profile.name, email: profile.email, initials };

  return (
    <LearningShell identity={{ name: profile.name, initials, avatarUrl: profile.avatarUrl }} learner={learner} pageTitle="Parcours">
      <div className="learning-course-page">
        <section className="learning-course-hero">
          <div>
            <span className="dashboard-kicker">{data.course.domain.name}</span>
            <h2>{data.course.title}</h2>
            <p>{data.course.subtitle ?? data.course.description}</p>
          </div>

          {data.enrollment ? (
            <section className="learning-local-progress" aria-label="Progression de la formation">
              <div><span>Progression</span><strong>{data.percentage}%</strong></div>
              <div className="learning-progress"><span style={{ width: `${data.percentage}%` }} /></div>
              <p>{data.completedCount}/{data.totalLessons} leçons terminées.</p>
              {data.resumeLesson ? <Link className="btn btn-primary" href={`/learn/${data.course.slug}/${data.resumeLesson.slug}`}>Continuer</Link> : null}
            </section>
          ) : (
            <section className="learning-local-progress" aria-label="Inscription à la formation">
              <div><span>Formation</span><strong>Prêt à commencer</strong></div>
              <p>Inscrivez-vous pour enregistrer votre progression et vos notes.</p>
              <EnrollmentButton courseId={data.course.id} courseSlug={data.course.slug} />
            </section>
          )}
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
                          {status === "completed" ? <CheckCircle2 size={17} aria-hidden="true" /> : <BookOpenText size={17} aria-hidden="true" />}
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
                        aria-current={lesson.id === data.currentLesson?.id ? "step" : undefined}
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
