"use client";

import {
  ArrowDown,
  ArrowUp,
  BookOpenCheck,
  Clock3,
  FilePlus2,
  Layers3,
  Plus,
  Trash2,
  X
} from "lucide-react";
import { useState } from "react";

import { LessonEditor } from "@/components/teacher/LessonEditor";
import { ModuleEditor } from "@/components/teacher/ModuleEditor";
import {
  getTeacherLessonDurationTotal,
  lessonTypeLabels,
  teacherLessonStatusLabels,
  teacherModuleStatusLabels,
  teacherResourceTypeLabels
} from "@/lib/teacher";
import type {
  TeacherCourse,
  TeacherLesson,
  TeacherModule,
  TeacherResource
} from "@/types/teaching";

type TeacherCourseBuilderProps = {
  course: TeacherCourse;
  resources: TeacherResource[];
};

type BuilderSelection =
  | { type: "module"; moduleId: string }
  | { type: "lesson"; moduleId: string; lessonId: string };

type PreviewSelection = {
  moduleId: string;
  lessonId: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getModuleDuration(module: TeacherModule) {
  return module.durationMinutes ?? getTeacherLessonDurationTotal(module.lessons);
}

function getModuleStatus(module: TeacherModule) {
  if (module.status) {
    return module.status;
  }

  if (module.lessons.length > 0 && module.lessons.every((lesson) => lesson.status === "published")) {
    return "published";
  }

  if (module.lessons.some((lesson) => lesson.status === "review")) {
    return "review";
  }

  return "draft";
}

function getLessonDefaults(
  lesson: TeacherLesson,
  module: TeacherModule,
  course: TeacherCourse
): TeacherLesson {
  return {
    ...lesson,
    description:
      lesson.description ??
      `Introduction pratique pour avancer dans le module "${module.title}".`,
    objectives:
      lesson.objectives ??
      course.objectives.slice(0, 2).map((objective) => `${objective}.`),
    content:
      lesson.content ??
      `# ${lesson.title}\n\nCette leçon présente les notions clés, un exemple guidé et une action à réaliser côté apprenant.\n\n## À retenir\n\n- Comprendre le contexte\n- Appliquer la méthode\n- Préparer la suite du module`,
    resourceIds: lesson.resourceIds ?? []
  };
}

function cloneModules(course: TeacherCourse) {
  return course.modules.map((module) => {
    const lessons = module.lessons.map((lesson) => getLessonDefaults(lesson, module, course));

    return {
      ...module,
      durationMinutes: getModuleDuration({ ...module, lessons }),
      status: getModuleStatus({ ...module, lessons }),
      lessons
    };
  });
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

function sortByOrder<Item extends { order: number }>(items: Item[]) {
  return [...items]
    .sort((first, second) => first.order - second.order)
    .map((item, index) => ({ ...item, order: index + 1 }));
}

export function TeacherCourseBuilder({ course, resources }: TeacherCourseBuilderProps) {
  const [modules, setModules] = useState(() => cloneModules(course));
  const [selection, setSelection] = useState<BuilderSelection | null>(null);
  const [previewSelection, setPreviewSelection] = useState<PreviewSelection | null>(null);
  const [toast, setToast] = useState<string>();

  const selectedModule = selection
    ? modules.find((module) => module.id === selection.moduleId)
    : undefined;
  const selectedLesson =
    selection?.type === "lesson"
      ? selectedModule?.lessons.find((lesson) => lesson.id === selection.lessonId)
      : undefined;
  const previewModule = previewSelection
    ? modules.find((module) => module.id === previewSelection.moduleId)
    : undefined;
  const previewLesson = previewSelection
    ? previewModule?.lessons.find((lesson) => lesson.id === previewSelection.lessonId)
    : undefined;
  const previewResources =
    previewLesson?.resourceIds
      ?.map((resourceId) => resources.find((resource) => resource.id === resourceId))
      .filter((resource): resource is TeacherResource => Boolean(resource)) ?? [];

  function notify(message: string) {
    setToast(message);
  }

  function addModule() {
    const moduleId = `demo-module-${Date.now()}`;

    setModules((current) => [
      ...current,
      {
        id: moduleId,
        title: "Nouveau module",
        description: "Module ajouté en mode démo.",
        order: current.length + 1,
        durationMinutes: 0,
        status: "draft",
        lessons: []
      }
    ]);
    setSelection({ type: "module", moduleId });
    notify("Module ajouté en mode démo.");
  }

  function updateModule(moduleId: string, patch: Partial<TeacherModule>) {
    setModules((current) => {
      if (patch.order === undefined) {
        return current.map((module) =>
          module.id === moduleId ? { ...module, ...patch } : module
        );
      }

      const currentIndex = current.findIndex((module) => module.id === moduleId);

      if (currentIndex < 0) {
        return current;
      }

      const nextOrder = clamp(Math.round(patch.order), 1, current.length);
      const updatedModule = { ...current[currentIndex], ...patch, order: nextOrder };
      const remainingModules = current.filter((module) => module.id !== moduleId);

      remainingModules.splice(nextOrder - 1, 0, updatedModule);

      return sortByOrder(remainingModules);
    });
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

    if (selection?.moduleId === moduleId) {
      setSelection(null);
    }

    notify("Module supprimé en mode démo.");
  }

  function moveModule(moduleIndex: number, direction: -1 | 1) {
    setModules((current) => reorderItems(current, moduleIndex, direction));
    notify("Ordre des modules mis à jour visuellement.");
  }

  function addLesson(moduleId: string) {
    const lessonId = `demo-lesson-${Date.now()}`;

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
              id: lessonId,
              title: "Nouvelle leçon",
              description: "Leçon ajoutée en mode démo.",
              type: "reading",
              durationMinutes: 20,
              objectives: ["Clarifier l'objectif de la leçon"],
              content:
                "# Nouvelle leçon\n\nAjoutez ici le contenu pédagogique. Ce champ pourra être remplacé par un éditeur MDX.",
              resourceIds: [],
              status: "draft",
              order: module.lessons.length + 1
            }
          ]
        };
      })
    );
    setSelection({ type: "lesson", moduleId, lessonId });
    notify("Leçon ajoutée en mode démo.");
  }

  function updateLesson(moduleId: string, lessonId: string, patch: Partial<TeacherLesson>) {
    setModules((current) =>
      current.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, ...patch } : lesson
              )
            }
          : module
      )
    );
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

    if (selection?.type === "lesson" && selection.lessonId === lessonId) {
      setSelection({ type: "module", moduleId });
    }

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
          <p>
            {modules.length} modules · {modules.reduce((total, module) => total + module.lessons.length, 0)} leçons
          </p>
        </div>
        <button className="btn btn-primary" type="button" onClick={addModule}>
          <Plus size={17} aria-hidden="true" />
          Ajouter module
        </button>
      </div>

      <div className="teacher-builder__workspace">
        <aside className="teacher-builder__outline" aria-label="Structure modules et leçons">
          <div className="teacher-builder__outline-heading">
            <div>
              <span>Structure</span>
              <h2>Modules et leçons</h2>
            </div>
            <button aria-label="Ajouter un module" type="button" onClick={addModule}>
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="teacher-builder__modules">
            {modules.map((module, moduleIndex) => (
              <section
                className="teacher-builder-module"
                data-active={selection?.moduleId === module.id}
                key={module.id}
              >
                <div className="teacher-builder-module__row">
                  <button
                    className="teacher-builder-module__select"
                    type="button"
                    onClick={() => setSelection({ type: "module", moduleId: module.id })}
                  >
                    <span>Module {module.order}</span>
                    <strong>{module.title}</strong>
                    <small>{module.description}</small>
                  </button>

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
                      aria-label="Supprimer le module"
                      type="button"
                      onClick={() => deleteModule(module.id)}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="teacher-builder-module__meta">
                  <span>{module.lessons.length} leçons</span>
                  <span>
                    <Clock3 size={15} aria-hidden="true" />
                    {getModuleDuration(module)} min
                  </span>
                  <span className="state-badge" data-state={getModuleStatus(module)}>
                    {teacherModuleStatusLabels[getModuleStatus(module)]}
                  </span>
                </div>

                <div className="teacher-builder-lessons">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <article
                      className="teacher-builder-lesson"
                      data-active={
                        selection?.type === "lesson" && selection.lessonId === lesson.id
                      }
                      key={lesson.id}
                    >
                      <button
                        className="teacher-builder-lesson__select"
                        type="button"
                        onClick={() =>
                          setSelection({
                            type: "lesson",
                            moduleId: module.id,
                            lessonId: lesson.id
                          })
                        }
                      >
                        <span>{lesson.order}</span>
                        <div>
                          <h4>{lesson.title}</h4>
                          <p>
                            {lessonTypeLabels[lesson.type]} · {lesson.durationMinutes} min
                          </p>
                        </div>
                      </button>
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
        </aside>

        <section className="teacher-builder__panel" aria-label="Panneau d'édition">
          {!selection ? (
            <div className="teacher-builder-empty">
              <span>
                <Layers3 size={24} aria-hidden="true" />
              </span>
              <h2>Aucun élément sélectionné</h2>
              <p>Sélectionnez un module ou une leçon dans la structure pour afficher son éditeur.</p>
            </div>
          ) : null}

          {selection?.type === "module" && selectedModule ? (
            <ModuleEditor
              module={selectedModule}
              onChange={(patch) => updateModule(selectedModule.id, patch)}
              onSave={() => notify("Module enregistré en mode démo.")}
            />
          ) : null}

          {selection?.type === "lesson" && selectedModule && selectedLesson ? (
            <LessonEditor
              lesson={selectedLesson}
              resources={resources}
              onChange={(patch) => updateLesson(selectedModule.id, selectedLesson.id, patch)}
              onPreview={() =>
                setPreviewSelection({
                  moduleId: selectedModule.id,
                  lessonId: selectedLesson.id
                })
              }
              onSave={() => notify("Leçon enregistrée en mode démo.")}
            />
          ) : null}
        </section>
      </div>

      {previewLesson && previewModule ? (
        <div className="teacher-preview-modal" role="dialog" aria-modal="true" aria-label="Prévisualisation leçon">
          <div className="teacher-preview-modal__panel">
            <header>
              <div>
                <span>Prévisualisation apprenant</span>
                <h2>{previewLesson.title}</h2>
                <p>
                  {previewModule.title} · {lessonTypeLabels[previewLesson.type]} ·{" "}
                  {previewLesson.durationMinutes} min
                </p>
              </div>
              <button aria-label="Fermer la prévisualisation" type="button" onClick={() => setPreviewSelection(null)}>
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <article className="teacher-preview-lesson">
              <div className="teacher-preview-lesson__hero">
                <BookOpenCheck size={22} aria-hidden="true" />
                <div>
                  <span className="state-badge" data-state={previewLesson.status}>
                    {teacherLessonStatusLabels[previewLesson.status]}
                  </span>
                  <p>{previewLesson.description}</p>
                </div>
              </div>

              {previewLesson.objectives?.length ? (
                <section>
                  <h3>Objectifs</h3>
                  <ul>
                    {previewLesson.objectives.map((objective) => (
                      <li key={objective}>{objective}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              <section>
                <h3>Contenu</h3>
                {(previewLesson.content ?? "Contenu en préparation.")
                  .split("\n")
                  .filter(Boolean)
                  .map((line) => (
                    <p key={line}>{line.replace(/^#+\s*/, "")}</p>
                  ))}
              </section>

              <section>
                <h3>Ressources liées</h3>
                {previewResources.length > 0 ? (
                  <ul>
                    {previewResources.map((resource) => (
                      <li key={resource.id}>
                        {resource.title} · {teacherResourceTypeLabels[resource.type]}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucune ressource liée pour le moment.</p>
                )}
              </section>
            </article>
          </div>
        </div>
      ) : null}
    </div>
  );
}
