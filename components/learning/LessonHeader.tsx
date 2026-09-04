import { BookOpenText, ChevronRight, Clock3, PlayCircle } from "lucide-react";
import Link from "next/link";

import { formatCourseDuration } from "@/components/catalog/CourseCard";
import type { Course, CourseModule } from "@/types/course";
import type { Lesson, LessonType } from "@/types/learning";

type LessonHeaderProps = {
  courseBasePath?: string;
  coursesHref?: string;
  course: Course;
  lesson: Lesson;
  module?: CourseModule;
};

const lessonTypeLabels: Record<LessonType, string> = {
  video: "Vidéo",
  reading: "Lecture",
  exercise: "Exercice",
  quiz: "Quiz",
  project: "Projet"
};

export function LessonHeader({
  course,
  courseBasePath = `/learn/${course.slug}`,
  coursesHref = "/app/learner/courses",
  lesson,
  module
}: LessonHeaderProps) {
  return (
    <header className="lesson-header">
      <div className="lesson-header__context">
        <span>Étape sélectionnée</span>
        <p>{module ? `${course.title} · ${module.title}` : course.title}</p>
      </div>
      <nav className="lesson-breadcrumb" aria-label="Fil d'Ariane">
        <Link href={coursesHref}>Mes parcours</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <Link href={courseBasePath}>{course.title}</Link>
        {module ? (
          <>
            <ChevronRight size={14} aria-hidden="true" />
            <span>{module.title}</span>
          </>
        ) : null}
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{lesson.title}</span>
      </nav>

      <h1>{lesson.title}</h1>

      <div className="lesson-header__meta">
        <span>
          <BookOpenText size={16} aria-hidden="true" />
          {lessonTypeLabels[lesson.type]}
        </span>
        <span>
          <Clock3 size={16} aria-hidden="true" />
          {formatCourseDuration(lesson.durationMinutes)}
        </span>
        {lesson.status === "in-progress" ? (
          <span data-status="active">
            <PlayCircle size={16} aria-hidden="true" />
            En cours
          </span>
        ) : null}
      </div>

      {lesson.description ? <p>{lesson.description}</p> : null}

      {lesson.objectives?.length ? (
        <section className="lesson-objectives" aria-labelledby="lesson-objectives-title">
          <h2 id="lesson-objectives-title">Objectifs de la leçon</h2>
          <ul>
            {lesson.objectives.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </header>
  );
}
