import type { CSSProperties } from "react";

type SkeletonTableProps = {
  columns?: number;
  rows?: number;
};

export function SkeletonTable({ columns = 6, rows = 5 }: SkeletonTableProps) {
  const gridStyle = {
    "--skeleton-table-columns": columns
  } as CSSProperties;

  return (
    <div className="skeleton-table" aria-hidden="true">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          className="skeleton-table__row"
          key={`skeleton-table-row-${rowIndex}`}
          style={gridStyle}
        >
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <span
              className="skeleton-line"
              data-size={columnIndex === columns - 1 ? "small" : "default"}
              key={`skeleton-table-cell-${rowIndex}-${columnIndex}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
