import { Download, ExternalLink, FileText } from "lucide-react";

import type { Resource } from "@/types/resource";

type ResourceListProps = {
  resources: Resource[];
};

export function ResourceList({ resources }: ResourceListProps) {
  if (resources.length === 0) {
    return null;
  }

  return (
    <section className="lesson-resources" aria-labelledby="lesson-resources-title">
      <div className="lesson-section-heading">
        <div>
          <span>Supports</span>
          <h2 id="lesson-resources-title">Ressources de la leçon</h2>
        </div>
        <Download size={20} aria-hidden="true" />
      </div>

      <div className="lesson-resource-list">
        {resources.map((resource) => (
          <a href={resource.href} key={resource.id}>
            <span>
              <FileText size={18} aria-hidden="true" />
            </span>
            <div>
              <strong>{resource.title}</strong>
              {resource.description ? <p>{resource.description}</p> : null}
            </div>
            <ExternalLink size={17} aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}
