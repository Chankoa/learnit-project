import type { FAQItem } from "@/types/resource";

type CourseFaqProps = {
  faq?: FAQItem[];
};

export function CourseFaq({ faq = [] }: CourseFaqProps) {
  if (faq.length === 0) {
    return null;
  }

  return (
    <section className="section-shell py-8">
      <span className="eyebrow w-fit">FAQ</span>
      <h2 className="mt-4 text-2xl font-black text-text-strong md:text-3xl">Questions fréquentes</h2>
      <div className="mt-6 grid gap-3">
        {[...faq]
          .sort((first, second) => (first.order ?? 999) - (second.order ?? 999))
          .map((item) => (
            <article className="lesson-card p-5" key={item.id}>
              <h3 className="font-black text-text-strong">{item.question}</h3>
              <p className="mt-2 text-sm text-text-muted">{item.answer}</p>
            </article>
          ))}
      </div>
    </section>
  );
}
