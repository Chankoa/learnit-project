"use client";

import {
  ArrowDown,
  ArrowUp,
  Clock3,
  FilePlus2,
  Pencil,
  Plus,
  Trash2
} from "lucide-react";
import { useState } from "react";

import {
  getTeacherLessonDurationTotal,
  lessonTypeLabels,
  teacherLessonStatusLabels
} from "@/lib/teacher";
import type { TeacherCourse, TeacherLesson, TeacherModule } from "@/types/teaching";

type TeacherCourseBuilderProps = {
  course: TeacherCourse;
};

function cloneModules(modules: TeacherModule[]) {
  return modules.map((module) => ({
    ...module,
    lessons: module.lessons.map((lesson) => ({ ...lesson }))
  }));
}

function reorderItems<Item extends { order: number }>(
  items: Item[],
  index: number,
  direction: -1 | 1
) {
  const targetIndex = index + direction;

  if (targetIndex < 0 || targetIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const currentItem = nextItems[index];
  const targetItem = nextItems[targetIndex];

  if (!currentItem || !targetItem) {
    return items;
  }

  nextItems[index] = targetItem;
  nextItems[targetIndex] = currentItem;

  return nextItems.map((item, itemIndex) => ({
    ...item,
    order: itemIndex + 1
  }));
}

export function TeacherCourseBuilder({ course }: TeacherCourseBuilderProps) {
  const [modules, setModules] = useState(() => cloneModules(course.modules));
  const [toast, setToast] = useState<string>();

  function notify(message: string) {
    setToast(message);
  }

  function addModule() {
    setModules((current) => [
      ...current,
      {
        id: `demo-module-${Date.now()}`,
        title: "Nouveau module",
        description: "Module ajouté en mode démo.",
        order: current.length + 1,
        lessons: []
      }
    ]);
    notify("Module ajouté en mode démo.");
  }

  function renameModule(moduleId: string) {
    const module = modules.find((item) => item.id === moduleId);
    const nextTitle = window.prompt("Nouveau nom du module", module?.title);

    if (!nextTitle?.trim()) {
      return;
    }

    setModules((current) =>
      current.map((item) =>
        item.id === moduleId ? { ...item, title: nextTitle.trim() } : item
      )
    );
    notify("Module renommé en mode démo.");
  }

  function deleteModule(moduleId: string) {
    if (!window.confirm("Supprimer ce module en mode démo ?")) {
      return;
    }

    setModules((current) =>
      current
        .filter((module) => module.id !== moduleId)
        .map((module, index) => ({ ...module, order: index + 1 }))
    );
    notify("Module supprimé en mode démo.");
  }

  function moveModule(moduleIndex: number, direction: -1 | 1) {
    setModules((current) => reorderItems(current, moduleIndex, direction));
    notify("Ordre des modules mis à jour visuellement.");
  }

  function addLesson(moduleId: string) {
    setModules((current) =>
      current.map((module) => {
        if (module.id !== moduleId) {
          return module;
        }

        return {
          ...module,
          lessons: [
            ...module.lessons,
            {
              id: `demo-lesson-${Date.now()}`,
              title: "Nouvelle leçon",
              type: "reading",
              durationMinutes: 20,
              status: "draft",
              order: module.lessons.length + 1
            }
          ]
        };
      })
    );
    notify("Leçon ajoutée en mode démo.");
  }

  function renameLesson(moduleId: string, lessonId: string) {
    const module = modules.find((item) => item.id === moduleId);
    const lesson = module?.lessons.find((item) => item.id === lessonId);
    const nextTitle = window.prompt("Nouveau nom de la leçon", lesson?.title);

    if (!nextTitle?.trim()) {
      return;
    }

    setModules((current) =>
      current.map((item) =>
        item.id === moduleId
          ? {
              ...item,
              lessons: item.lessons.map((currentLesson) =>
                currentLesson.id === lessonId
                  ? { ...currentLesson, title: nextTitle.trim() }
                  : currentLesson
              )
            }
          : item
      )
    );
    notify("Leçon renommée en mode démo.");
  }

  function deleteLesson(moduleId: string, lessonId: string) {
    if (!window.confirm("Supprimer cette leçon en mode démo ?")) {
      return;
    }

    setModules((current) =>
      current.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons
                .filter((lesson) => lesson.id !== lessonId)
                .map((lesson, index) => ({ ...lesson, order: index + 1 }))
            }
          : module
      )
    );
    notify("Leçon supprimée en mode démo.");
  }

  function moveLesson(moduleId: string, lessonIndex: number, direction: -1 | 1) {
    setModules((current) =>
      current.map((module) =>
        module.id === moduleId
          ? { ...module, lessons: reorderItems(module.lessons, lessonIndex, direction) }
          : module
      )
    );
    notify("Ordre des leçons mis à jour visuellement.");
  }

  return (
    <div className="teacher-builder">
      {toast ? (
        <div className="teacher-toast" role="status">
          {toast}
        </div>
      ) : null}

      <div className="teacher-builder__toolbar">
        <div>
          <span>Course Builder</span>
          <h2>{course.title}</h2>
        </div>
        <button className="btn btn-primary" type="button" onClick={addModule}>
          <Plus size={17} aria-hidden="true" />
          Ajouter module
        </button>
      </div>

      <div className="teacher-builder__modules">
        {modules.map((module, moduleIndex) => (
          <section className="teacher-builder-module" key={module.id}>
            <header>
              <div>
                <span>Module {module.order}</span>
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>
              <div className="teacher-icon-actions">
                <button
                  aria-label="Déplacer le module vers le haut"
                  disabled={moduleIndex === 0}
                  type="button"
                  onClick={() => moveModule(moduleIndex, -1)}
                >
                  <ArrowUp size={16} aria-hidden="true" />
                </button>
                <button
                  aria-label="Déplacer le module vers le bas"
                  disabled={moduleIndex === modules.length - 1}
                  type="button"
                  onClick={() => moveModule(moduleIndex, 1)}
                >
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
                <button
                  aria-label="Renommer le module"
                  type="button"
                  onClick={() => renameModule(module.id)}
                >
                  <Pencil size={16} aria-hidden="true" />
                </button>
                <button
                  aria-label="Supprimer le module"
                  type="button"
                  onClick={() => deleteModule(module.id)}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </header>

            <div className="teacher-builder-module__meta">
              <span>{module.lessons.length} leçons</span>
              <span>
                <Clock3 size={15} aria-hidden="true" />
                {getTeacherLessonDurationTotal(module.lessons)} min
              </span>
            </div>

            <div className="teacher-builder-lessons">
              {module.lessons.map((lesson, lessonIndex) => (
                <article className="teacher-builder-lesson" key={lesson.id}>
                  <span>{lesson.order}</span>
                  <div>
                    <h4>{lesson.title}</h4>
                    <p>
                      {lessonTypeLabels[lesson.type]} · {lesson.durationMinutes} min
                    </p>
                  </div>
                  <span className="state-badge" data-state={lesson.status}>
                    {teacherLessonStatusLabels[lesson.status]}
                  </span>
                  <div className="teacher-icon-actions">
                    <button
                      aria-label="Déplacer la leçon vers le haut"
                      disabled={lessonIndex === 0}
                      type="button"
                      onClick={() => moveLesson(module.id, lessonIndex, -1)}
                    >
                      <ArrowUp size={15} aria-hidden="true" />
                    </button>
                    <button
                      aria-label="Déplacer la leçon vers le bas"
                      disabled={lessonIndex === module.lessons.length - 1}
                      type="button"
                      onClick={() => moveLesson(module.id, lessonIndex, 1)}
                    >
                      <ArrowDown size={15} aria-hidden="true" />
                    </button>
                    <button
                      aria-label="Renommer la leçon"
                      type="button"
                      onClick={() => renameLesson(module.id, lesson.id)}
                    >
                      <Pencil size={15} aria-hidden="true" />
                    </button>
                    <button
                      aria-label="Supprimer la leçon"
                      type="button"
                      onClick={() => deleteLesson(module.id, lesson.id)}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <button
              className="teacher-builder-add"
              type="button"
              onClick={() => addLesson(module.id)}
            >
              <FilePlus2 size={17} aria-hidden="true" />
              Ajouter une leçon
            </button>
          </section>
        ))}
      </div>
    </div>
  );
}
