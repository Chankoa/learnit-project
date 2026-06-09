type CourseMethodProps = {
  method?: string[];
};

export function CourseMethod({ method = [] }: CourseMethodProps) {
  if (method.length === 0) {
    return null;
  }

  return (
    <section className="section-shell content-section course-content-section">
      <span className="eyebrow w-fit">Méthode</span>
      <h2>Comment se déroule la formation</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {method.map((item, index) => (
          <article className="value-card value-card--compact" key={item}>
            <span className="text-sm font-extrabold text-accent">Étape {index + 1}</span>
            <p className="mt-2 font-extrabold text-text-strong">{item}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
