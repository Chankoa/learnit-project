type CourseAudienceProps = {
  audience?: string[];
};

export function CourseAudience({ audience = [] }: CourseAudienceProps) {
  if (audience.length === 0) {
    return null;
  }

  return (
    <section className="section-shell py-8">
      <span className="eyebrow w-fit">Pour qui</span>
      <h2 className="mt-4 text-2xl font-black text-text-strong md:text-3xl">Public visé</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {audience.map((item) => (
          <article className="profile-card p-5" key={item}>
            <p className="font-extrabold text-text-strong">{item}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
