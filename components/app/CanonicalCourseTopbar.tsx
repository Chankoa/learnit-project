import type { ReactNode } from "react";

type CanonicalCourseTopbarProps = {
  children: ReactNode;
  className?: string;
};

export function CanonicalCourseTopbar({ children, className = "" }: CanonicalCourseTopbarProps) {
  return <header className={`canonical-course-topbar ${className}`.trim()}>{children}</header>;
}