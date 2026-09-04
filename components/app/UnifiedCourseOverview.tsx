import { ArrowRight, BookOpenText, Clock3, Layers3, PenLine, Users } from "lucide-react";
import Link from "next/link";

import { UnifiedAppShell } from "@/components/app/UnifiedAppShell";
import { UnifiedCourseModeSwitch } from "@/components/app/UnifiedCourseModeSwitch";
import { EnrollmentButton } from "@/components/learning/EnrollmentButton";
import { formatCourseDuration } from "@/components/catalog/CourseCard";
import type { CurrentProfile } from "@/lib/auth/server";
import type { UnifiedCourseWorkspaceContext } from "@/lib/unified-course-workspace";

type UnifiedCourseOverviewProps = {
  context: UnifiedCourseWorkspaceContext;
  profile: CurrentProfile;
};

export function UnifiedCourseOverview({ context, profile }: UnifiedCourseOverviewProps) {
  const { learning } = context;
  const resumeHref = learning.resumeLesson
    ? `/app/courses/${learning.course.slug}/lessons/${learning.resumeLesson.slug}?mode=learn`
    : undefined;
  const editHref = `/app/courses/${learning.course.slug}?mode=edit`;
  const learnHref = `/app/courses/${learning.course.slug}?mode=learn`;

  return (
    <UnifiedAppShell profile={profile}>
      <main className="app-page unified-course-overview" id="main-content">
        <nav aria-label="Fil d’Ariane" className="app-breadcrumb">
          <Link href="/app/courses">Mes parcours</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{learning.course.title}</span>
        </nav>

        <header className="unified-course-header">
          <div>
            <span>{learning.course.domain.name}</span>
            <h1>{learning.course.title}</h1>
            <p>{learning.course.subtitle ?? learning.course.description}</p>
            {context.relationLabels.length ? (
              <div aria-label="Vos relations à ce parcours" className="unified-course-header__relations">
                {context.relationLabels.map((label) => <span key={label}>{label}</span>)}
              </div>
            ) : null}
          </div>
          <div className="unified-course-header__actions">
            <UnifiedCourseModeSwitch
              canEdit={context.canEdit}
              canLearn={context.canLearn}
              editHref={editHref}
              learnHref={learnHref}
              mode={context.mode}
            />
            {context.canLearn && resumeHref ? (
              <Link className="btn btn-primary" href={resumeHref}>
                <BookOpenText size={17} aria-hidden="true" />
                {learning.ctaLabel}
              </Link>
            ) : null}
            {context.canEnroll ? <EnrollmentButton courseId={learning.course.id} courseSlug={learning.course.slug} /> : null}
            {context.canEdit && !context.canLearn ? (
              <Link className="btn btn-primary" href={editHref}><PenLine size={17} aria-hidden="true" /> Modifier</Link>
            ) : null}
          </div>
        </header>

        <section className="unified-course-overview__metrics" aria-label="Résumé du parcours">
          <article><Layers3 size={18} aria-hidden="true" /><span>Modules</span><strong>{learning.modules.length}</strong></article>
          <article><BookOpenText size={18} aria-hidden="true" /><span>Leçons</span><strong>{learning.totalLessons}</strong></article>
          <article><Clock3 size={18} aria-hidden="true" /><span>Durée</span><strong>{formatCourseDuration(learning.course.durationMinutes)}</strong></article>
          {context.canLearn ? <article><span>Progression</span><strong>{learning.percentage}%</strong></article> : null}
        </section>

        <section className="unified-course-program" aria-labelledby="unified-course-program-title">
          <div className="unified-course-program__heading">
            <div><span>Parcours</span><h2 id="unified-course-program-title">Programme</h2></div>
            {context.canManageMembers ? (
              <Link className="btn btn-secondary" href={`/app/teacher/courses/${learning.course.id}/enrollments`}>
                <Users size={16} aria-hidden="true" /> Participants
              </Link>
            ) : null}
          </div>
          {learning.modules.length ? learning.modules.map((module) => (
            <details key={module.id} open={module.lessons.some((lesson) => lesson.id === learning.currentLesson?.id)}>
              <summary><span>Module {module.order}</span><strong>{module.title}</strong><small>{module.lessons.length} leçon{module.lessons.length > 1 ? "s" : ""}</small></summary>
              <div>
                {module.lessons.map((lesson) => context.canLearn && lesson.status !== "locked" ? (
                  <Link key={lesson.id} href={`/app/courses/${learning.course.slug}/lessons/${lesson.slug}?mode=learn`}>
                    <span>{lesson.order}</span><strong>{lesson.title}</strong><small>{formatCourseDuration(lesson.durationMinutes)}</small><ArrowRight size={16} aria-hidden="true" />
                  </Link>
                ) : (
                  <div key={lesson.id}><span>{lesson.order}</span><strong>{lesson.title}</strong><small>{formatCourseDuration(lesson.durationMinutes)}</small></div>
                ))}
              </div>
            </details>
          )) : <p className="unified-empty">Le contenu de ce parcours n’est pas encore disponible.</p>}
        </section>
      </main>
    </UnifiedAppShell>
  );
}
