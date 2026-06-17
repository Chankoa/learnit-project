import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type AppBreadcrumbItem = {
  label: string;
  href?: string;
};

type AppBreadcrumbProps = {
  items: AppBreadcrumbItem[];
};

export function AppBreadcrumb({ items }: AppBreadcrumbProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav className="app-breadcrumb" aria-label="Fil d'Ariane">
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`}>
              {item.href && !isLast ? <Link href={item.href}>{item.label}</Link> : <span>{item.label}</span>}
              {!isLast ? <ChevronRight size={14} aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
