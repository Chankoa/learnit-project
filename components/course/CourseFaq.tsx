import { ChevronDown } from "lucide-react";

import type { FAQItem } from "@/types/resource";

type CourseFaqProps = {
  faq?: FAQItem[];
};

export function CourseFaq({ faq = [] }: CourseFaqProps) {
  if (faq.length === 0) {
    return null;
  }

  return (
    <section className="section-shell content-section course-content-section">
      <span className="eyebrow w-fit">FAQ</span>
      <h2>Questions fréquentes</h2>
      <div className="mt-6 grid gap-3">
        {[...faq]
          .sort((first, second) => (first.order ?? 999) - (second.order ?? 999))
          .map((item) => (
            <details aria-label={`Question fréquente : ${item.question}`} className="faq-item" key={item.id}>
              <summary>
                <span>{item.question}</span>
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
      </div>
    </section>
  );
}
