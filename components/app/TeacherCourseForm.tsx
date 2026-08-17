import { Save } from "lucide-react";

import { TeacherDomainPicker } from "@/components/app/TeacherDomainPicker";
import { TeacherSubmitButton } from "@/components/app/TeacherSubmitButton";
import type { TeacherCourseFormValues } from "@/lib/teacher-service";
import { courseLevelLabels, teacherCourseStatusLabels } from "@/lib/teacher";
import type { Domain } from "@/types/course";
import type { TeacherCourse } from "@/types/teaching";

type TeacherCourseFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  course?: TeacherCourse;
  domains: Domain[];
  error?: string;
  initialValues: TeacherCourseFormValues;
  message?: string;
  mode: "create" | "edit";
};

const levelOptions = Object.entries(courseLevelLabels) as Array<
  [TeacherCourseFormValues["level"], string]
>;

export function TeacherCourseForm({
  action,
  course,
  domains,
  error,
  initialValues,
  message,
  mode
}: TeacherCourseFormProps) {
  return (
    <form action={action} className="teacher-form">
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

      {course ? (
        <section className="teacher-form-section">
          <div>
            <span>Publication</span>
            <h2>État actuel</h2>
          </div>
          <div className="teacher-form-grid teacher-form-grid--compact">
            <div className="teacher-field">
              <span>Statut</span>
              <strong className="state-badge" data-state={course.status}>
                {teacherCourseStatusLabels[course.status]}
              </strong>
            </div>
            <div className="teacher-field">
              <span>Slug</span>
              <strong>{course.slug ? `/${course.slug}` : "Non défini"}</strong>
            </div>
            <div className="teacher-field">
              <span>Publication</span>
              <strong>{course.publishedAt ? "Publiée" : "Non publiée"}</strong>
            </div>
          </div>
        </section>
      ) : null}

      <section className="teacher-form-section" id="course-information">
        <div>
          <span>Informations</span>
          <h2>Identité de la formation</h2>
        </div>
        <div className="teacher-form-grid">
          <label className="teacher-field teacher-field--wide">
            <span>Titre</span>
            <input name="title" required defaultValue={initialValues.title} />
          </label>

          <label className="teacher-field teacher-field--wide">
            <span>Description courte</span>
            <input
              name="subtitle"
              placeholder="Une promesse claire en une phrase."
              defaultValue={initialValues.subtitle}
            />
          </label>

          <label className="teacher-field teacher-field--wide">
            <span>Description</span>
            <textarea name="description" required rows={5} defaultValue={initialValues.description} />
          </label>

          <TeacherDomainPicker domains={domains} selectedDomainId={initialValues.domainId || domains[0]?.id} />

          <label className="teacher-field">
            <span>Niveau</span>
            <select name="level" defaultValue={initialValues.level}>
              {levelOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="teacher-field">
            <span>Format</span>
            <input name="format" defaultValue={initialValues.format} />
          </label>

          <label className="teacher-field teacher-field--wide">
            <span>Image de couverture</span>
            <input
              name="coverImage"
              placeholder="/images/courses/web-creation-cover.png"
              defaultValue={initialValues.coverImage}
            />
            <small className="teacher-field-note">
              Vous pouvez conserver une URL existante ou téléverser une image depuis votre ordinateur.
            </small>
          </label>

          <label className="teacher-field teacher-field--wide">
            <span>Téléverser une couverture</span>
            <input accept="image/jpeg,image/png,image/webp,image/gif" name="coverFile" type="file" />
            <small className="teacher-field-note">
              Formats acceptés : JPG, PNG, WebP ou GIF. Taille maximale : 5 Mo.
            </small>
          </label>
        </div>
      </section>

      <div className="teacher-form-actions">
        <TeacherSubmitButton pendingLabel={mode === "edit" ? "Enregistrement..." : "Création..."}>
          <Save size={17} aria-hidden="true" />
          {mode === "edit" ? "Enregistrer" : "Créer la formation"}
        </TeacherSubmitButton>
      </div>
    </form>
  );
}
