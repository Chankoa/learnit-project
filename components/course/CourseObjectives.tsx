import { CheckCircle2 } from "lucide-react";

type CourseObjectivesProps = {
  objectives?: string[];
};

export function CourseObjectives({ objectives = [] }: CourseObjectivesProps) {
  if (objectives.length === 0) {
    return null;
  }

  return (
    <section className="section-shell content-section course-content-section">
      <span className="eyebrow w-fit">Objectifs</span>
      <h2>Ce que vous saurez faire</h2>
      <div className="mt-6 grid gap-3">
        {objectives.map((objective) => (
          <div className="lesson-card flex items-start gap-3 p-4" key={objective}>
            <span className="icon-badge h-9 w-9 shrink-0">
              <CheckCircle2 size={17} aria-hidden="true" />
            </span>
            <p className="font-extrabold text-text-strong">{objective}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
