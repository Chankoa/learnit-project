"use client";

import { Save } from "lucide-react";

import { teacherModuleStatusLabels } from "@/lib/teacher";
import type { TeacherModule, TeacherModuleStatus } from "@/types/teaching";

type ModuleEditorProps = {
  module: TeacherModule;
  onChange: (patch: Partial<TeacherModule>) => void;
  onSave: () => void;
};

const moduleStatusOptions = Object.entries(teacherModuleStatusLabels) as Array<
  [TeacherModuleStatus, string]
>;

export function ModuleEditor({ module, onChange, onSave }: ModuleEditorProps) {
  return (
    <section className="teacher-builder-editor" aria-label="Éditeur de module">
      <div className="teacher-builder-editor__heading">
        <div>
          <span>Module sélectionné</span>
          <h2>{module.title}</h2>
        </div>
        <button className="btn btn-secondary" type="button" onClick={onSave}>
          <Save size={16} aria-hidden="true" />
          Enregistrer
        </button>
      </div>

      <div className="teacher-form-grid">
        <label className="teacher-field teacher-field--wide">
          <span>Titre</span>
          <input
            value={module.title}
            onChange={(event) => onChange({ title: event.target.value })}
          />
        </label>

        <label className="teacher-field teacher-field--wide">
          <span>Description</span>
          <textarea
            rows={4}
            value={module.description}
            onChange={(event) => onChange({ description: event.target.value })}
          />
        </label>

        <label className="teacher-field">
          <span>Ordre</span>
          <input
            min={1}
            type="number"
            value={module.order}
            onChange={(event) => onChange({ order: Number(event.target.value) || 1 })}
          />
        </label>

        <label className="teacher-field">
          <span>Durée estimée</span>
          <input
            min={0}
            type="number"
            value={module.durationMinutes ?? 0}
            onChange={(event) =>
              onChange({ durationMinutes: Number(event.target.value) || 0 })
            }
          />
        </label>

        <label className="teacher-field teacher-field--wide">
          <span>Statut</span>
          <select
            value={module.status ?? "draft"}
            onChange={(event) =>
              onChange({ status: event.target.value as TeacherModuleStatus })
            }
          >
            {moduleStatusOptions.map(([value, label]) => (
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
