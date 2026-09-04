import type { ReactNode } from "react";

type CourseOutlineRailProps = {
  as?: "aside" | "div";
  children: ReactNode;
  className?: string;
  label: string;
};

export function CourseOutlineRail({ as: Element = "aside", children, className = "", label }: CourseOutlineRailProps) {
  return (
    <Element aria-label={label} className={`course-outline-rail ${className}`.trim()}>
      {children}
    </Element>
  );
}
