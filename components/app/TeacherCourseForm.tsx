"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";

import { useToast } from "@/components/app/ToastProvider";
import type { CourseLevel, Domain } from "@/types/course";
import type { TeacherCourseStatus } from "@/types/teaching";

export type TeacherCourseFormValues = {
  title: string;
  description: string;
  domainId: string;
  level: CourseLevel;
  format: string;
  objectives: string;
  audience: string;
  requirements: string;
  coverImage: string;
  status: TeacherCourseStatus;
};

type TeacherCourseFormProps = {
  mode: "create" | "edit";
  domains: Domain[];
  initialValues: TeacherCourseFormValues;
};

type FormErrors = Partial<Record<keyof TeacherCourseFormValues, string>>;

const levelOptions = [
  { value: "beginner", label: "Débutant" },
  { value: "intermediate", label: "Intermédiaire" },
  { value: "advanced", label: "Avancé" }
] satisfies Array<{ value: CourseLevel; label: string }>;

function getListValue(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function TeacherCourseForm({
  mode,
  domains,
  initialValues
}: TeacherCourseFormProps) {
  const [form, setForm] = useState<TeacherCourseFormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<string>();
  const { showToast } = useToast();

  function updateField<Field extends keyof TeacherCourseFormValues>(
    field: Field,
    value: TeacherCourseFormValues[Field]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validateForm() {
    const nextErrors: FormErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Le titre est requis.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "La description est requise.";
    }

    if (!form.domainId) {
      nextErrors.domainId = "Le domaine est requis.";
    }

    if (!form.format.trim()) {
      nextErrors.format = "Le format est requis.";
    }

    if (getListValue(form.objectives).length === 0) {
      nextErrors.objectives = "Ajoutez au moins un objectif pédagogique.";
    }

    if (getListValue(form.audience).length === 0) {
      nextErrors.audience = "Ajoutez au moins un public cible.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      setToast("Certains champs requis doivent être complétés.");
      showToast({
        description: "Vérifiez les champs signalés avant de renvoyer le formulaire.",
        title: "Formulaire incomplet",
        variant: "warning"
      });
      return;
    }

    const payload = {
      ...form,
      objectives: getListValue(form.objectives),
      audience: getListValue(form.audience),
      requirements: getListValue(form.requirements)
    };

    console.log("[LearnIt demo] teacher course form", payload);
    const message =
      mode === "edit"
        ? "Modifications enregistrées en mode démo."
        : "Formation créée en mode démo.";

    setToast(message);
    showToast({
      description: "Aucune donnée réelle n'a été persistée.",
      title: message,
      variant: "success"
    });
  }

  return (
    <form className="teacher-form" onSubmit={handleSubmit} noValidate>
      {toast ? (
        <div className="teacher-toast" role="status">
          {toast}
        </div>
      ) : null}

      <section className="teacher-form-section">
        <div>
          <span>Informations générales</span>
          <h2>Identité de la formation</h2>
        </div>
        <div className="teacher-form-grid">
          <label className="teacher-field teacher-field--wide">
            <span>Titre</span>
            <input
              aria-invalid={Boolean(errors.title)}
              name="title"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
            {errors.title ? <small>{errors.title}</small> : null}
          </label>

          <label className="teacher-field teacher-field--wide">
            <span>Description</span>
            <textarea
              aria-invalid={Boolean(errors.description)}
              name="description"
              rows={4}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
            />
            {errors.description ? <small>{errors.description}</small> : null}
          </label>

          <label className="teacher-field">
            <span>Domaine</span>
            <select
              aria-invalid={Boolean(errors.domainId)}
              name="domain"
              value={form.domainId}
              onChange={(event) => updateField("domainId", event.target.value)}
            >
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
            {errors.domainId ? <small>{errors.domainId}</small> : null}
          </label>

          <label className="teacher-field">
            <span>Niveau</span>
            <select
              name="level"
              value={form.level}
              onChange={(event) => updateField("level", event.target.value as CourseLevel)}
            >
              {levelOptions.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </label>

          <label className="teacher-field">
            <span>Format</span>
            <input
              aria-invalid={Boolean(errors.format)}
              name="format"
              value={form.format}
              onChange={(event) => updateField("format", event.target.value)}
            />
            {errors.format ? <small>{errors.format}</small> : null}
          </label>

          <label className="teacher-field">
            <span>Statut</span>
            <select
              name="status"
              value={form.status}
              onChange={(event) => updateField("status", event.target.value as TeacherCourseStatus)}
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </label>
        </div>
      </section>

      <section className="teacher-form-section">
        <div>
          <span>Pédagogie</span>
          <h2>Objectifs, public et prérequis</h2>
        </div>
        <div className="teacher-form-grid">
          <label className="teacher-field">
            <span>Objectifs pédagogiques</span>
            <textarea
              aria-invalid={Boolean(errors.objectives)}
              name="objectives"
              rows={6}
              value={form.objectives}
              onChange={(event) => updateField("objectives", event.target.value)}
            />
            {errors.objectives ? <small>{errors.objectives}</small> : null}
          </label>

          <label className="teacher-field">
            <span>Public cible</span>
            <textarea
              aria-invalid={Boolean(errors.audience)}
              name="audience"
              rows={6}
              value={form.audience}
              onChange={(event) => updateField("audience", event.target.value)}
            />
            {errors.audience ? <small>{errors.audience}</small> : null}
          </label>

          <label className="teacher-field teacher-field--wide">
            <span>Prérequis</span>
            <textarea
              name="requirements"
              rows={5}
              value={form.requirements}
              onChange={(event) => updateField("requirements", event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="teacher-form-section">
        <div>
          <span>Image de couverture</span>
          <h2>Visuel de présentation</h2>
        </div>
        <label className="teacher-field">
          <span>Chemin ou URL</span>
          <input
            name="coverImage"
            placeholder="/images/courses/web-creation-cover.png"
            value={form.coverImage}
            onChange={(event) => updateField("coverImage", event.target.value)}
          />
        </label>
      </section>

      <div className="teacher-form-actions">
        <button className="btn btn-primary" type="submit">
          <Save size={17} aria-hidden="true" />
          {mode === "edit" ? "Enregistrer les modifications" : "Créer la formation"}
        </button>
      </div>
    </form>
  );
}
