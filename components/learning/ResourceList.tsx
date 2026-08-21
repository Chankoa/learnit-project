import { Download, ExternalLink, FileText } from "lucide-react";

import type { Resource } from "@/types/resource";

type ResourceListProps = {
  resources: Resource[];
};

function formatFileSize(bytes?: number) {
  if (!bytes) {
    return "";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} Mo`;
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

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
        {resources.map((resource) => {
            const isFile = Boolean(resource.storagePath || resource.fileName);
            const external = isExternalHref(resource.href);

            return (
              <a
                download={isFile ? resource.fileName : undefined}
                href={resource.href}
                key={resource.id}
                rel={external ? "noreferrer noopener" : undefined}
                target={external ? "_blank" : undefined}
              >
                <span>
                  <FileText size={18} aria-hidden="true" />
                </span>
                <div>
                  <strong>{resource.title}</strong>
                  {resource.description ? <p>{resource.description}</p> : null}
                  {isFile ? (
                    <small>
                      {resource.fileName ?? "Fichier"}
                      {resource.fileSize ? ` · ${formatFileSize(resource.fileSize)}` : ""}
                    </small>
                  ) : null}
                </div>
                {isFile ? (
                  <Download size={17} aria-hidden="true" />
                ) : (
                  <ExternalLink size={17} aria-hidden="true" />
                )}
              </a>
            );
          })}
      </div>
    </section>
  );
}
