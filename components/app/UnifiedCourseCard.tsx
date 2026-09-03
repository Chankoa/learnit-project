import { ArrowRight, BookOpenText, PenLine } from "lucide-react";
import Link from "next/link";

import type { UnifiedCourseRelation } from "@/lib/unified-course-relations";

type UnifiedCourseCardProps = {
  relation: UnifiedCourseRelation;
};

export function UnifiedCourseCard({ relation }: UnifiedCourseCardProps) {
  const labels = [
    relation.enrollment ? "J'apprends" : null,
    relation.capabilities.includes("edit") ? "Je crée" : null,
    relation.capabilities.includes("propose") && !relation.capabilities.includes("edit") ? "Je contribue" : null
  ].filter(Boolean);

  return (
    <article className="unified-course-card">
      <div className="unified-course-card__topline">
        <span>{relation.course.domain.name}</span>
        <span className="state-badge" data-state={relation.course.status}>{relation.course.status === "published" ? "Publié" : "Brouillon"}</span>
      </div>
      <h2>{relation.course.title}</h2>
      <p>{relation.course.description}</p>
      {labels.length ? <div className="unified-course-card__relations" aria-label="Vos relations à ce parcours">{labels.map((label) => <span key={label}>{label}</span>)}</div> : null}
      {relation.enrollment ? (
        <div className="unified-course-card__progress" aria-label={`${relation.progress.percentage}% terminé`}>
          <span><BookOpenText size={15} aria-hidden="true" /> {relation.progress.completedCount}/{relation.progress.totalLessons} leçons</span>
          <strong>{relation.progress.percentage}%</strong>
          <i><b style={{ width: `${relation.progress.percentage}%` }} /></i>
        </div>
      ) : null}
      <Link className="btn btn-secondary" href={relation.primaryHref}>
        {relation.primaryLabel === "Gérer" ? <PenLine size={16} aria-hidden="true" /> : <BookOpenText size={16} aria-hidden="true" />}
        {relation.primaryLabel}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}