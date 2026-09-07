import { ArrowRight, BookOpenText, Clock3, PenLine } from "lucide-react";
import Link from "next/link";
import type { Course } from "@/types/course";
import type { UnifiedCourseRelation } from "@/lib/unified-course-relations";

type Props = { relation: UnifiedCourseRelation; course?: never; href?: never } | { relation?: never; course: Course; href: string };
export function UnifiedCourseCard(props: Props) {
  const relation = props.relation;
  const course = relation?.course ?? props.course!;
  const href = relation?.primaryHref ?? props.href!;
  const labels = [relation?.enrollment ? "J’apprends" : null, relation?.capabilities.includes("edit") ? "Je crée" : null].filter(Boolean);
  const lessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
  return <article className="unified-course-card">
    <div className="unified-course-card__topline">
      <div className="unified-course-card__cover">{course.coverImage ? <img src={course.coverImage} alt="" loading="lazy" /> : <BookOpenText aria-hidden="true" />}</div>
      <span className="state-badge" data-state={course.status}>{course.status === "published" ? "Publié" : course.status === "archived" ? "Archivé" : "Brouillon"}</span>
    </div>
    <span className="unified-course-card__domain">{course.domain.name}</span>
    <h2><Link href={href}>{course.title}</Link></h2>
    <p>{course.description}</p>
    {labels.length ? <div className="unified-course-card__relations" aria-label="Vos relations à ce parcours">{labels.map(label => <span key={label}>{label}</span>)}</div> : null}
    <div className="unified-course-card__meta"><span><BookOpenText size={14} aria-hidden="true" />{lessons} leçons</span>{course.durationMinutes ? <span><Clock3 size={14} aria-hidden="true" />{course.durationMinutes} min</span> : null}</div>
    {relation?.enrollment ? <div className="unified-course-card__progress" aria-label={`${relation.progress.percentage}% terminé`}><span>{relation.progress.completedCount}/{relation.progress.totalLessons} leçons terminées</span><strong>{relation.progress.percentage}%</strong><progress max={100} value={relation.progress.percentage} aria-label="Progression du parcours" /></div> : null}
    <div className="unified-course-card__actions"><Link className="btn btn-secondary" href={href}>{relation?.primaryLabel ?? "Consulter"}<ArrowRight size={16} aria-hidden="true" /></Link>{relation?.enrollment && relation.capabilities.includes("edit") ? <Link className="btn btn-ghost" href={`/app/courses/${course.slug}?mode=edit`} aria-label={`Modifier ${course.title}`}><PenLine size={16} aria-hidden="true" />Modifier</Link> : null}</div>
  </article>;
}
