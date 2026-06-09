import { CourseCard } from "@/components/catalog/CourseCard";
import { EmptyState } from "@/components/catalog/EmptyState";
import type { Course } from "@/types/course";

type CourseGridProps = {
  courses: Course[];
};

export function CourseGrid({ courses }: CourseGridProps) {
  if (courses.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="course-grid">
      {courses.map((course) => (
        <CourseCard course={course} key={course.id} />
      ))}
    </div>
  );
}
