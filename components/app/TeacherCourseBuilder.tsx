import {
  ArrowDown,
  ArrowUp,
  BookOpenCheck,
  Clock3,
  Eye,
  FilePlus2,
  Layers3,
  Plus,
  Save,
  Trash2,
  X
} from "lucide-react";
import Link from "next/link";

import {
  createTeacherLessonAction,
  createTeacherModuleAction,
  deleteTeacherLessonAction,
  deleteTeacherModuleAction,
  moveTeacherLessonAction,
  moveTeacherModuleAction,
  updateTeacherLessonAction,
  updateTeacherModuleAction
} from "@/app/app/teacher/courses/actions";
import { TeacherConfirmForm } from "@/components/app/TeacherConfirmForm";
import { TeacherSubmitButton } from "@/components/app/TeacherSubmitButton";
import {
  formatLessonCount,
  formatModuleCount,
  getLessonById,
  getModuleById,
  getModuleForLesson,
  getTeacherCourseDuration
} from "@/lib/teacher-service";
import {
  lessonTypeLabels,
  teacherLessonStatusLabels,
  teacherModuleStatusLabels
} from "@/lib/teacher";
import type { LessonType } from "@/types/learning";
import type { TeacherCourse } from "@/types/teaching";

type TeacherCourseBuilderProps = {
  course: TeacherCourse;
  error?: string;
  message?: string;
  previewLessonId?: string;
  selectedLessonId?: string;
  selectedModuleId?: string;
};

const lessonTypeOptions = Object.entries(lessonTypeLabels) as Array<[LessonType, string]>;
const statusOptions = [
  ["draft", "Brouillon"],
  ["published", "Publié"]
] as const;

function getBuilderHref(
  courseId: string,
  params: Record<string, string | undefined>
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `/app/teacher/courses/${courseId}/builder?${query}` : `/app/teacher/courses/${courseId}/builder`;
}

function toLines(values?: string[]) {
  return values?.join("\n") ?? "";
}

function getLessonPreviewParagraphs(value?: string) {
  return (value || "Contenu en préparation.")
    .split(/\n{2,}/)
    .map((line) => line.replace(/^#+\s*/, "").trim())
    .filter(Boolean);
}

export function TeacherCourseBuilder({
  course,
  error,
  message,
  previewLessonId,
  selectedLessonId,
  selectedModuleId
}: TeacherCourseBuilderProps) {
  const selectedLesson = getLessonById(course, selectedLessonId);
  const selectedModule =
    selectedLesson
      ? getModuleForLesson(course, selectedLesson)
      : getModuleById(course, selectedModuleId);
  const previewLesson = getLessonById(course, previewLessonId);
  const previewModule = previewLesson ? getModuleForLesson(course, previewLesson) : undefined;
  const addModuleAction = createTeacherModuleAction.bind(null, course.id);

  return (
    <div className="teacher-builder">
      {error ? (
        <div className="teacher-form-error" role="alert">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="teacher-toast" role="status">
          {message}
        </div>
      ) : null}

      <div className="teacher-builder__toolbar">
        <div>
          <span>Éditeur de parcours</span>
          <h2>{course.title}</h2>
          <p>
            {formatModuleCount(course.modules.length)} · {formatLessonCount(course.modules.reduce((total, module) => total + module.lessons.length, 0))} · {getTeacherCourseDuration(course)} min
          </p>
        </div>
        <form action={addModuleAction}>
          <TeacherSubmitButton pendingLabel="Ajout...">
            <Plus size={17} aria-hidden="true" />
            Ajouter un module
          </TeacherSubmitButton>
        </form>
      </div>

      <div className="teacher-builder__workspace">
        <aside className="teacher-builder__outline" aria-label="Structure modules et leçons">
          <div className="teacher-builder__outline-heading">
            <div>
              <span>Structure</span>
              <h2>Modules et leçons</h2>
            </div>
          </div>

          <div className="teacher-builder__modules">
            {course.modules.length === 0 ? (
              <div className="teacher-builder-empty">
                <span>
                  <Layers3 size={24} aria-hidden="true" />
                </span>
                <h2>Aucun module</h2>
                <p>Ajoutez un premier module pour commencer la structure du parcours.</p>
              </div>
            ) : null}

            {course.modules.map((module, moduleIndex) => {
              const addLessonAction = createTeacherLessonAction.bind(null, course.id, module.id);

              return (
                <section
                  className="teacher-builder-module"
                  data-active={selectedModule?.id === module.id}
                  key={module.id}
                >
                  <div className="teacher-builder-module__row">
                    <Link
                      className="teacher-builder-module__select"
                      href={getBuilderHref(course.id, { module: module.id })}
                    >
                      <span>Module {module.order}</span>
                      <strong>{module.title}</strong>
                      <small>{module.description}</small>
                    </Link>

                    <div className="teacher-icon-actions">
                      <form action={moveTeacherModuleAction.bind(null, course.id, module.id, -1)}>
                        <button
                          aria-label="Déplacer le module vers le haut"
                          disabled={moduleIndex === 0}
                          type="submit"
                        >
                          <ArrowUp size={16} aria-hidden="true" />
                        </button>
                      </form>
                      <form action={moveTeacherModuleAction.bind(null, course.id, module.id, 1)}>
                        <button
                          aria-label="Déplacer le module vers le bas"
                          disabled={moduleIndex === course.modules.length - 1}
                          type="submit"
                        >
                          <ArrowDown size={16} aria-hidden="true" />
                        </button>
                      </form>
                      <TeacherConfirmForm
                        action={deleteTeacherModuleAction.bind(null, course.id, module.id)}
                        message="Supprimer ce module ? Cette action est autorisée seulement si le module est vide."
                      >
                        <button aria-label="Supprimer le module" type="submit">
                          <Trash2 size={16} aria-hidden="true" />
                        </button>
                      </TeacherConfirmForm>
                    </div>
                  </div>

                  <div className="teacher-builder-module__meta">
                    <span>{formatLessonCount(module.lessons.length)}</span>
                    <span>
                      <Clock3 size={15} aria-hidden="true" />
                      {module.durationMinutes ?? module.lessons.reduce((total, lesson) => total + lesson.durationMinutes, 0)} min
                    </span>
                    <span className="state-badge" data-state={module.status ?? "draft"}>
                      {teacherModuleStatusLabels[module.status ?? "draft"]}
                    </span>
                  </div>

                  <div className="teacher-builder-lessons">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <article
                        className="teacher-builder-lesson"
                        data-active={selectedLesson?.id === lesson.id}
                        key={lesson.id}
                      >
                        <Link
                          className="teacher-builder-lesson__select"
                          href={getBuilderHref(course.id, { lesson: lesson.id })}
                        >
                          <span>{lesson.order}</span>
                          <div>
                            <h4>{lesson.title}</h4>
                            <p>
                              {lessonTypeLabels[lesson.type]} · {lesson.durationMinutes} min
                            </p>
                          </div>
                        </Link>
                        <span className="state-badge" data-state={lesson.status}>
                          {teacherLessonStatusLabels[lesson.status]}
                        </span>
                        <div className="teacher-icon-actions">
                          <form
                            action={moveTeacherLessonAction.bind(
                              null,
                              course.id,
                              module.id,
                              lesson.id,
                              -1
                            )}
                          >
                            <button
                              aria-label="Déplacer la leçon vers le haut"
                              disabled={lessonIndex === 0}
                              type="submit"
                            >
                              <ArrowUp size={15} aria-hidden="true" />
                            </button>
                          </form>
                          <form
                            action={moveTeacherLessonAction.bind(
                              null,
                              course.id,
                              module.id,
                              lesson.id,
                              1
                            )}
                          >
                            <button
                              aria-label="Déplacer la leçon vers le bas"
                              disabled={lessonIndex === module.lessons.length - 1}
                              type="submit"
                            >
                              <ArrowDown size={15} aria-hidden="true" />
                            </button>
                          </form>
                          <TeacherConfirmForm
                            action={deleteTeacherLessonAction.bind(null, course.id, lesson.id, module.id)}
                            message="Supprimer cette leçon ? Seules les leçons en brouillon sont supprimables."
                          >
                            <button aria-label="Supprimer la leçon" type="submit">
                              <Trash2 size={15} aria-hidden="true" />
                            </button>
                          </TeacherConfirmForm>
                        </div>
                      </article>
                    ))}
                  </div>

                  <form action={addLessonAction}>
                    <TeacherSubmitButton className="teacher-builder-add" pendingLabel="Ajout...">
                      <FilePlus2 size={17} aria-hidden="true" />
                      Ajouter une leçon
                    </TeacherSubmitButton>
                  </form>
                </section>
              );
            })}
          </div>
        </aside>

        <section className="teacher-builder__panel" aria-label="Panneau d'édition">
          {!selectedModule && !selectedLesson ? (
            <div className="teacher-builder-empty">
              <span>
                <Layers3 size={24} aria-hidden="true" />
              </span>
              <h2>Aucun élément sélectionné</h2>
              <p>Sélectionnez un module ou une leçon dans la structure pour afficher son éditeur.</p>
            </div>
          ) : null}

          {selectedModule && !selectedLesson ? (
            <section className="teacher-builder-editor" aria-label="Éditeur de module">
              <div className="teacher-builder-editor__heading">
                <div>
                  <span>Module sélectionné</span>
                  <h2>{selectedModule.title}</h2>
                </div>
              </div>
              <form
                action={updateTeacherModuleAction.bind(null, course.id, selectedModule.id)}
                className="teacher-form-grid"
              >
                <label className="teacher-field teacher-field--wide">
                  <span>Titre</span>
                  <input name="title" required defaultValue={selectedModule.title} />
                </label>
                <label className="teacher-field teacher-field--wide">
                  <span>Description</span>
                  <textarea name="description" rows={4} defaultValue={selectedModule.description} />
                </label>
                <label className="teacher-field">
                  <span>Durée estimée</span>
                  <input
                    min={0}
                    name="durationMinutes"
                    type="number"
                    defaultValue={selectedModule.durationMinutes ?? ""}
                  />
                </label>
                <label className="teacher-field">
                  <span>Statut</span>
                  <select name="status" defaultValue={selectedModule.status ?? "draft"}>
                    {statusOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="teacher-form-actions">
                  <TeacherSubmitButton pendingLabel="Enregistrement...">
                    <Save size={16} aria-hidden="true" />
                    Enregistrer le module
                  </TeacherSubmitButton>
                </div>
              </form>
            </section>
          ) : null}

          {selectedLesson && selectedModule ? (
            <section className="teacher-builder-editor" aria-label="Éditeur de leçon">
              <div className="teacher-builder-editor__heading">
                <div>
                  <span>Leçon sélectionnée</span>
                  <h2>{selectedLesson.title}</h2>
                </div>
                <div className="teacher-builder-editor__actions">
                  <Link
                    className="btn btn-secondary"
                    href={getBuilderHref(course.id, {
                      lesson: selectedLesson.id,
                      preview: selectedLesson.id
                    })}
                  >
                    <Eye size={16} aria-hidden="true" />
                    Prévisualiser
                  </Link>
                </div>
              </div>
              <form
                action={updateTeacherLessonAction.bind(null, course.id, selectedLesson.id)}
                className="teacher-form-grid"
              >
                <label className="teacher-field teacher-field--wide">
                  <span>Titre</span>
                  <input name="title" required defaultValue={selectedLesson.title} />
                </label>
                <label className="teacher-field teacher-field--wide">
                  <span>Description</span>
                  <textarea name="description" rows={3} defaultValue={selectedLesson.description ?? ""} />
                </label>
                <label className="teacher-field">
                  <span>Type</span>
                  <select name="type" defaultValue={selectedLesson.type}>
                    {lessonTypeOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="teacher-field">
                  <span>Durée</span>
                  <input
                    min={0}
                    name="durationMinutes"
                    type="number"
                    defaultValue={selectedLesson.durationMinutes}
                  />
                </label>
                <label className="teacher-field teacher-field--wide">
                  <span>Objectifs</span>
                  <textarea name="objectives" rows={4} defaultValue={toLines(selectedLesson.objectives)} />
                </label>
                <label className="teacher-field teacher-field--wide">
                  <span>Contenu</span>
                  <textarea name="content" rows={10} defaultValue={selectedLesson.content ?? ""} />
                  <small className="teacher-field-note">Textarea simple pour cette V1. Un éditeur MDX viendra plus tard.</small>
                </label>
                <label className="teacher-field">
                  <span>Statut</span>
                  <select name="status" defaultValue={selectedLesson.status}>
                    {statusOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="teacher-form-actions">
                  <TeacherSubmitButton pendingLabel="Enregistrement...">
                    <Save size={16} aria-hidden="true" />
                    Enregistrer la leçon
                  </TeacherSubmitButton>
                </div>
              </form>
            </section>
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
                  {previewModule.title} · {lessonTypeLabels[previewLesson.type]} · {previewLesson.durationMinutes} min
                </p>
              </div>
              <Link
                aria-label="Fermer la prévisualisation"
                href={getBuilderHref(course.id, { lesson: previewLesson.id })}
              >
                <X size={18} aria-hidden="true" />
              </Link>
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
                {getLessonPreviewParagraphs(previewLesson.content).map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </section>
            </article>
          </div>
        </div>
      ) : null}
    </div>
  );
}
