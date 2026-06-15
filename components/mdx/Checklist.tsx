import { Check } from "lucide-react";

type ChecklistProps = {
  items: string[];
  title?: string;
};

export function Checklist({ items, title }: ChecklistProps) {
  return (
    <section className="mdx-checklist">
      {title ? <h3>{title}</h3> : null}
      <ul>
        {items.map((item) => (
          <li key={item}>
            <span>
              <Check size={15} aria-hidden="true" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
