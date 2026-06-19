type SkeletonCardProps = {
  action?: boolean;
  lines?: number;
  media?: boolean;
};

export function SkeletonCard({
  action = false,
  lines = 3,
  media = false
}: SkeletonCardProps) {
  return (
    <article className="skeleton-card" aria-hidden="true">
      {media ? <span className="skeleton-card__media" /> : null}
      <div className="skeleton-card__body">
        <span className="skeleton-line skeleton-line--short" />
        {Array.from({ length: lines }).map((_, index) => (
          <span
            className="skeleton-line"
            data-size={index === lines - 1 ? "small" : "default"}
            key={`skeleton-card-line-${index}`}
          />
        ))}
      </div>
      {action ? <span className="skeleton-card__action" /> : null}
    </article>
  );
}
