type CourseMethodProps = {
  method?: string[];
};

export function CourseMethod({ method = [] }: CourseMethodProps) {
  if (method.length === 0) {
    return null;
  }

  return (
    <section className="section-shell py-8">
      <span className="eyebrow w-fit">Méthode</span>
      <h2 className="mt-4 text-2xl font-black text-text-strong md:text-3xl">Comment se déroule la formation</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {method.map((item, index) => (
          <article className="profile-card p-5" key={item}>
            <span className="text-sm font-extrabold text-accent">Étape {index + 1}</span>
            <p className="mt-2 font-extrabold text-text-strong">{item}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
