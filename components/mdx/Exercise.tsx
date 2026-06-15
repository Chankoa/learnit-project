import { PencilLine } from "lucide-react";
import type { ReactNode } from "react";

type ExerciseProps = {
  children: ReactNode;
  deliverable?: string;
  title: string;
};

export function Exercise({ children, deliverable, title }: ExerciseProps) {
  return (
    <section className="mdx-exercise">
      <div className="mdx-exercise__heading">
        <span>
          <PencilLine size={19} aria-hidden="true" />
        </span>
        <div>
          <small>Exercice</small>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="mdx-exercise__content">{children}</div>
      {deliverable ? (
        <div className="mdx-exercise__deliverable">
          <strong>Livrable attendu</strong>
          <p>{deliverable}</p>
        </div>
      ) : null}
    </section>
  );
}
