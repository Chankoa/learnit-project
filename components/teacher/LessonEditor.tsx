"use client";

import { Eye, Save } from "lucide-react";

import {
  lessonTypeLabels,
  teacherLessonStatusLabels,
  teacherResourceTypeLabels
} from "@/lib/teacher";
import type { LessonType } from "@/types/learning";
import type {
  TeacherLesson,
  TeacherLessonStatus,
  TeacherResource
} from "@/types/teaching";

type LessonEditorProps = {
  lesson: TeacherLesson;
  resources: TeacherResource[];
  onChange: (patch: Partial<TeacherLesson>) => void;
  onPreview: () => void;
  onSave: () => void;
};

const lessonTypeOptions = Object.entries(lessonTypeLabels) as Array<[LessonType, string]>;
const lessonStatusOptions = Object.entries(teacherLessonStatusLabels) as Array<
  [TeacherLessonStatus, string]
>;

function toLines(values?: string[]) {
  return values?.join("\n") ?? "";
}

function fromLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function LessonEditor({
  lesson,
  resources,
  onChange,
  onPreview,
  onSave
}: LessonEditorProps) {
  const selectedResourceIds = lesson.resourceIds ?? [];

  function toggleResource(resourceId: string) {
    const nextResourceIds = selectedResourceIds.includes(resourceId)
      ? selectedResourceIds.filter((id) => id !== resourceId)
      : [...selectedResourceIds, resourceId];

    onChange({ resourceIds: nextResourceIds });
  }

  return (
    <section className="teacher-builder-editor" aria-label="Éditeur de leçon">
      <div className="teacher-builder-editor__heading">
        <div>
          <span>Leçon sélectionnée</span>
          <h2>{lesson.title}</h2>
        </div>
        <div className="teacher-builder-editor__actions">
          <button className="btn btn-secondary" type="button" onClick={onPreview}>
            <Eye size={16} aria-hidden="true" />
            Prévisualiser
          </button>
          <button className="btn btn-primary" type="button" onClick={onSave}>
            <Save size={16} aria-hidden="true" />
            Enregistrer
          </button>
        </div>
      </div>

      <div className="teacher-form-grid">
        <label className="teacher-field teacher-field--wide">
          <span>Titre</span>
          <input
            value={lesson.title}
            onChange={(event) => onChange({ title: event.target.value })}
          />
        </label>

        <label className="teacher-field teacher-field--wide">
          <span>Description</span>
          <textarea
            rows={3}
            value={lesson.description ?? ""}
            onChange={(event) => onChange({ description: event.target.value })}
          />
        </label>

        <label className="teacher-field">
          <span>Type</span>
          <select
            value={lesson.type}
            onChange={(event) => onChange({ type: event.target.value as LessonType })}
          >
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
            type="number"
            value={lesson.durationMinutes}
            onChange={(event) =>
              onChange({ durationMinutes: Number(event.target.value) || 0 })
            }
          />
        </label>

        <label className="teacher-field teacher-field--wide">
          <span>Objectifs</span>
          <textarea
            rows={4}
            value={toLines(lesson.objectives)}
            onChange={(event) => onChange({ objectives: fromLines(event.target.value) })}
          />
        </label>

        <label className="teacher-field teacher-field--wide">
          <span>Contenu</span>
          <textarea
            rows={9}
            value={lesson.content ?? ""}
            onChange={(event) => onChange({ content: event.target.value })}
          />
          <small className="teacher-field-note">Prévu pour accueillir un éditeur MDX plus tard.</small>
        </label>

        <fieldset className="teacher-resource-picker">
          <legend>Ressources liées</legend>
          {resources.length > 0 ? (
            resources.map((resource) => (
              <label key={resource.id}>
                <input
                  checked={selectedResourceIds.includes(resource.id)}
                  type="checkbox"
                  onChange={() => toggleResource(resource.id)}
                />
                <span>{resource.title}</span>
                <small>{teacherResourceTypeLabels[resource.type]}</small>
              </label>
            ))
          ) : (
            <p>Aucune ressource disponible pour cette formation.</p>
          )}
        </fieldset>

        <label className="teacher-field teacher-field--wide">
          <span>Statut</span>
          <select
            value={lesson.status}
            onChange={(event) =>
              onChange({ status: event.target.value as TeacherLessonStatus })
            }
          >
            {lessonStatusOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
