"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import { useToast } from "@/components/app/ToastProvider";
import type { ResourceType } from "@/types/resource";
import type { TeacherResourceStatus } from "@/types/teaching";

type ResourceCourseOption = {
  id: string;
  title: string;
};

type ResourceLessonOption = {
  id: string;
  title: string;
  courseId: string;
};

type TeacherResourceFormProps = {
  courses: ResourceCourseOption[];
  lessons: ResourceLessonOption[];
};

type ResourceFormState = {
  title: string;
  type: ResourceType;
  courseId: string;
  lessonId: string;
  status: TeacherResourceStatus;
};

const resourceTypeOptions = [
  { value: "download", label: "Téléchargement" },
  { value: "template", label: "Template" },
  { value: "exercise", label: "Exercice" },
  { value: "link", label: "Lien" },
  { value: "video", label: "Vidéo" },
  { value: "article", label: "Article" },
  { value: "tool", label: "Outil" }
] satisfies Array<{ value: ResourceType; label: string }>;

export function TeacherResourceForm({
  courses,
  lessons
}: TeacherResourceFormProps) {
  const [form, setForm] = useState<ResourceFormState>({
    title: "",
    type: "download",
    courseId: courses[0]?.id ?? "",
    lessonId: "",
    status: "draft"
  });
  const [error, setError] = useState<string>();
  const [toast, setToast] = useState<string>();
  const { showToast } = useToast();
  const availableLessons = lessons.filter((lesson) => lesson.courseId === form.courseId);

  function updateForm(nextForm: Partial<ResourceFormState>) {
    setForm((current) => ({ ...current, ...nextForm }));
    setError(undefined);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Le titre de la ressource est requis.");
      showToast({
        title: "Titre requis",
        variant: "warning"
      });
      return;
    }

    if (!form.courseId) {
      setError("La formation liée est requise.");
      showToast({
        title: "Formation liée requise",
        variant: "warning"
      });
      return;
    }

    console.log("[LearnIt demo] teacher resource form", form);
    setToast("Ressource ajoutée en mode démo.");
    showToast({
      description: "Aucun fichier n'est téléversé ; la ressource est simulée localement.",
      title: "Ressource ajoutée à la démo",
      variant: "success"
    });
    setForm((current) => ({ ...current, title: "", lessonId: "" }));
  }

  return (
    <form className="teacher-inline-form" onSubmit={handleSubmit} noValidate>
      <div className="teacher-inline-form__heading">
        <div>
          <span>Nouvelle ressource</span>
          <h2>Ajouter une ressource</h2>
        </div>
        <button className="btn btn-primary" type="submit">
          <Plus size={17} aria-hidden="true" />
          Ajouter la ressource démo
        </button>
      </div>

      {error ? <p className="teacher-form-error">{error}</p> : null}
      {toast ? (
        <div className="teacher-toast" role="status">
          {toast}
        </div>
      ) : null}

      <div className="teacher-form-grid teacher-form-grid--compact">
        <label className="teacher-field">
          <span>Titre</span>
          <input
            aria-invalid={Boolean(error)}
            value={form.title}
            onChange={(event) => updateForm({ title: event.target.value })}
          />
        </label>

        <label className="teacher-field">
          <span>Type</span>
          <select
            value={form.type}
            onChange={(event) => updateForm({ type: event.target.value as ResourceType })}
          >
            {resourceTypeOptions.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>

        <label className="teacher-field">
          <span>Formation liée</span>
          <select
            value={form.courseId}
            onChange={(event) =>
              updateForm({
                courseId: event.target.value,
                lessonId: ""
              })
            }
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>

        <label className="teacher-field">
          <span>Leçon liée</span>
          <select
            value={form.lessonId}
            onChange={(event) => updateForm({ lessonId: event.target.value })}
          >
            <option value="">Aucune leçon précise</option>
            {availableLessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </label>

        <label className="teacher-field">
          <span>Statut</span>
          <select
            value={form.status}
            onChange={(event) =>
              updateForm({ status: event.target.value as TeacherResourceStatus })
            }
          >
            <option value="draft">Brouillon</option>
            <option value="published">Publié</option>
          </select>
        </label>
      </div>
    </form>
  );
}
