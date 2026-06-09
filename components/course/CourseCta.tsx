import Link from "next/link";

type CourseCtaProps = {
  title?: string;
  description?: string;
};

export function CourseCta({
  title = "Prêt à explorer le parcours ?",
  description = "Revenez au catalogue pour comparer les formations ou continuez sur le programme détaillé."
}: CourseCtaProps) {
  return (
    <section className="section-shell content-section">
      <div className="course-cta">
        <h2 className="text-2xl font-black text-text-strong md:text-3xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-text-muted">{description}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link className="btn btn-primary" href="#programme">
            Revoir le programme
          </Link>
          <Link className="btn btn-secondary" href="/#catalogue">
            Toutes les formations
          </Link>
        </div>
      </div>
    </section>
  );
}
