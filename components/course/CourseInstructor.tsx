import type { Instructor } from "@/types/resource";

type CourseInstructorProps = {
  instructors?: Instructor[];
};

export function CourseInstructor({ instructors = [] }: CourseInstructorProps) {
  if (instructors.length === 0) {
    return null;
  }

  return (
    <section className="section-shell py-8">
      <span className="eyebrow w-fit">Intervenants</span>
      <h2 className="mt-4 text-2xl font-black text-text-strong md:text-3xl">Accompagnement</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {instructors.map((instructor) => (
          <article className="lesson-card p-5" key={instructor.id}>
            <h3 className="text-xl font-black text-text-strong">{instructor.name}</h3>
            <p className="mt-1 text-sm font-extrabold text-accent">{instructor.role}</p>
            {instructor.bio ? <p className="mt-3 text-sm text-text-muted">{instructor.bio}</p> : null}
            {instructor.specialties?.length ? (
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-extrabold uppercase text-text-muted">
                {instructor.specialties.map((specialty) => (
                  <span className="rounded-sm bg-muted px-2 py-1" key={specialty}>
                    {specialty}
                  </span>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
