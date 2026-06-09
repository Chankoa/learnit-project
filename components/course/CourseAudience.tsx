type CourseAudienceProps = {
  audience?: string[];
};

export function CourseAudience({ audience = [] }: CourseAudienceProps) {
  if (audience.length === 0) {
    return null;
  }

  return (
    <section className="section-shell content-section course-content-section">
      <span className="eyebrow w-fit">Pour qui</span>
      <h2>Public visé</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {audience.map((item) => (
          <article className="value-card value-card--compact" key={item}>
            <p className="font-extrabold text-text-strong">{item}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
