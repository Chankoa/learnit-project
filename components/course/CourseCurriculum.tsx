import {
  BookOpenText,
  CheckCircle2,
  ChevronDown,
  Circle,
  CirclePlay,
  Clock3,
  Eye,
  FileQuestion,
  FolderKanban,
  Layers3,
  LockKeyhole,
  PencilLine,
  PlayCircle,
  Video
} from "lucide-react";

import { courseAvailabilityLabels, formatCourseDuration } from "@/components/catalog/CourseCard";
import type { Course, CourseModule, CourseModuleStatus } from "@/types/course";
import type { Lesson, LessonStatus, LessonType } from "@/types/learning";

type CourseCurriculumProps = {
  course: Course;
  modules: CourseModule[];
  lessons: Lesson[];
};

const lessonTypeLabels: Record<LessonType, string> = {
  video: "Vidéo",
  reading: "Lecture",
  exercise: "Exercice",
  quiz: "Quiz",
  project: "Projet"
};

const lessonStatusLabels: Record<LessonStatus, string> = {
  available: "Disponible",
  locked: "Verrouillée",
  preview: "Aperçu",
  "in-progress": "En cours",
  completed: "Terminée"
};

const moduleStatusLabels: Record<CourseModuleStatus, string> = {
  available: "Disponible",
  locked: "Verrouillé",
  preview: "Aperçu",
  "in-progress": "En cours",
  completed: "Module terminé"
};

function LessonTypeIcon({ type }: { type: LessonType }) {
  const icons = {
    video: Video,
    reading: BookOpenText,
    exercise: PencilLine,
    quiz: FileQuestion,
    project: FolderKanban
  };
  const Icon = icons[type];

  return <Icon size={17} aria-hidden="true" />;
}

function LessonStatusIcon({ status }: { status: LessonStatus }) {
  const icons = {
    available: CirclePlay,
    locked: LockKeyhole,
    preview: Eye,
    "in-progress": PlayCircle,
    completed: CheckCircle2
  };
  const Icon = icons[status];

  return <Icon size={17} aria-hidden="true" />;
}

function getModuleStatus(module: CourseModule): CourseModuleStatus {
  if (module.status) {
    return module.status;
  }

  const lessonStatuses = module.lessons.map((lesson) => lesson.status ?? "available");

  if (lessonStatuses.length > 0 && lessonStatuses.every((status) => status === "completed")) {
    return "completed";
  }

  if (lessonStatuses.includes("in-progress")) {
    return "in-progress";
  }

  if (lessonStatuses.includes("preview")) {
    return "preview";
  }

  if (lessonStatuses.length > 0 && lessonStatuses.every((status) => status === "locked")) {
    return "locked";
  }

  return "available";
}

export function CourseCurriculum({ course, modules, lessons }: CourseCurriculumProps) {
  const orderedModules = [...modules].sort((first, second) => first.order - second.order);
  const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const completedModules = orderedModules.filter((module) => getModuleStatus(module) === "completed").length;

  return (
    <div className="curriculum-layout">
      <section className="curriculum-summary">
        <div>
          <span className="eyebrow w-fit">Programme complet</span>
          <h1>{course.title}</h1>
          <p>{course.subtitle ?? course.description}</p>
        </div>

        <div className="curriculum-summary__stats">
          <div>
            <Layers3 size={19} aria-hidden="true" />
            <strong>{orderedModules.length}</strong>
            <span>modules</span>
          </div>
          <div>
            <BookOpenText size={19} aria-hidden="true" />
            <strong>{lessons.length}</strong>
            <span>leçons</span>
          </div>
          <div>
            <Clock3 size={19} aria-hidden="true" />
            <strong>{formatCourseDuration(course.durationMinutes)}</strong>
            <span>durée estimée</span>
          </div>
        </div>

        <div className="curriculum-progress" aria-label={`${completedModules} modules terminés sur ${orderedModules.length}`}>
          <span style={{ width: `${orderedModules.length ? (completedModules / orderedModules.length) * 100 : 0}%` }} />
        </div>
      </section>

      {course.availability !== "complete" ? (
        <aside className="curriculum-notice" data-status={course.availability}>
          {course.availability === "coming-soon" ? <LockKeyhole size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          <div>
            <strong>{courseAvailabilityLabels[course.availability]}</strong>
            <p>
              {course.availability === "coming-soon"
                ? "Le programme est présenté à titre prévisionnel. Les leçons seront ouvertes lors de la publication."
                : "Cette fiche permet de consulter la structure prévue et les contenus disponibles en aperçu."}
            </p>
          </div>
        </aside>
      ) : null}

      <section className="curriculum-list" aria-label={`Curriculum de ${course.title}`}>
        {orderedModules.map((module, moduleIndex) => {
          const moduleStatus = getModuleStatus(module);
          const moduleLessons = module.lessons
            .map((lesson) => lessonById.get(lesson.id) ?? lesson)
            .sort((first, second) => first.order - second.order);

          return (
            <details
              aria-label={`Module ${module.order} : ${module.title}`}
              className="curriculum-module"
              data-status={moduleStatus}
              key={module.id}
              open={moduleIndex === 0}
            >
              <summary>
                <div className="curriculum-module__index">
                  {moduleStatus === "completed" ? <CheckCircle2 size={20} aria-hidden="true" /> : module.order}
                </div>
                <div className="curriculum-module__heading">
                  <span>Module {module.order}</span>
                  <h2>{module.title}</h2>
                  {module.description ? <p>{module.description}</p> : null}
                </div>
                <div className="curriculum-module__meta">
                  <span className="state-badge" data-state={moduleStatus}>
                    {moduleStatusLabels[moduleStatus]}
                  </span>
                  <span>
                    {moduleLessons.length} leçon{moduleLessons.length > 1 ? "s" : ""}
                  </span>
                  <span>{formatCourseDuration(module.durationMinutes)}</span>
                  <ChevronDown size={20} aria-hidden="true" />
                </div>
              </summary>

              <div className="curriculum-lessons">
                {moduleLessons.map((lesson) => {
                  const lessonStatus = lesson.status ?? "available";

                  return (
                    <article className="curriculum-lesson" data-status={lessonStatus} key={lesson.id}>
                      <span className="curriculum-lesson__state">
                        <LessonStatusIcon status={lessonStatus} />
                      </span>
                      <div className="curriculum-lesson__content">
                        <div className="curriculum-lesson__title">
                          <h3>{lesson.title}</h3>
                          <span className="state-badge" data-state={lessonStatus}>
                            {lessonStatusLabels[lessonStatus]}
                          </span>
                        </div>
                        {lesson.description ? <p>{lesson.description}</p> : null}
                        <div className="curriculum-lesson__meta">
                          <span>
                            <LessonTypeIcon type={lesson.type} />
                            {lessonTypeLabels[lesson.type]}
                          </span>
                          <span>
                            <Clock3 size={16} aria-hidden="true" />
                            {formatCourseDuration(lesson.durationMinutes)}
                          </span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </details>
          );
        })}

        {orderedModules.length === 0 ? (
          <div className="empty-state">
            <Circle size={22} aria-hidden="true" />
            <h2>Programme en préparation</h2>
            <p>Les modules de cette formation seront ajoutés prochainement.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
