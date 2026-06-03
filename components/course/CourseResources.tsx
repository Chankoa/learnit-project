import { Tag } from "lucide-react";

import type { Resource } from "@/types/resource";

type CourseResourcesProps = {
  resources?: Resource[];
};

export function CourseResources({ resources = [] }: CourseResourcesProps) {
  if (resources.length === 0) {
    return null;
  }

  return (
    <section className="section-shell py-8">
      <span className="eyebrow w-fit">Ressources</span>
      <h2 className="mt-4 text-2xl font-black text-text-strong md:text-3xl">Ressources principales</h2>
      <p className="mt-2 max-w-2xl text-sm text-text-muted">
        Supports inclus pour cadrer le projet, pratiquer les notions clés et préparer la publication.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {resources.map((resource) => (
          <article className="profile-card p-5" key={resource.id}>
            <span className="icon-badge">
              <Tag size={18} aria-hidden="true" />
            </span>
            <h3 className="mt-5 text-base font-extrabold text-text-strong">{resource.title}</h3>
            {resource.description ? <p className="mt-2 text-sm text-text-muted">{resource.description}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-extrabold uppercase text-text-muted">
              <span className="rounded-sm bg-muted px-2 py-1">{resource.type}</span>
              {resource.access ? <span className="rounded-sm bg-muted px-2 py-1">{resource.access}</span> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
