import { Check, FileCheck2 } from "lucide-react";

import type { LessonExercise } from "@/types/learning";

type ExerciseBlockProps = {
  exercise: LessonExercise;
};

export function ExerciseBlock({ exercise }: ExerciseBlockProps) {
  return (
    <section className="exercise-block" aria-labelledby="lesson-exercise-title">
      <div className="exercise-block__icon">
        <FileCheck2 size={22} aria-hidden="true" />
      </div>
      <div>
        <span>Mise en pratique</span>
        <h2 id="lesson-exercise-title">{exercise.title}</h2>
        <p>{exercise.description}</p>
        <ol>
          {exercise.steps.map((step) => (
            <li key={step}>
              <Check size={16} aria-hidden="true" />
              <span>{step}</span>
            </li>
          ))}
        </ol>
        {exercise.deliverable ? (
          <div className="exercise-block__deliverable">
            <strong>Livrable</strong>
            <p>{exercise.deliverable}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
