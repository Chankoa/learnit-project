import Link from "next/link";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { getTeacherStudioCourse } from "@/lib/teacher-service";

type TeacherCourseEnrollmentsPageProps = {
  params: Promise<{ courseId: string }>;
};

export const dynamic = "force-dynamic";

export default async function TeacherCourseEnrollmentsPage({ params }: TeacherCourseEnrollmentsPageProps) {
  const { courseId } = await params;
  const course = await getTeacherStudioCourse(courseId, `/app/teacher/courses/${courseId}/enrollments`);

  if (!course) {
    notFound();
  }

  const enrollmentCount = course.enrolledLearnerCount ?? 0;

  return (
    <div className="app-page teacher-page">
      <AppBreadcrumb
        items={[
          { label: "Créer", href: "/app/teacher" },
          { label: "Mes créations", href: "/app/teacher/courses" },
          { label: course.title, href: `/app/teacher/courses/${course.id}/edit` },
          { label: "Inscrits" }
        ]}
      />
      <section className="teacher-course-preview">
        <span className="eyebrow">Inscrits</span>
        <h1>{course.title}</h1>
        <p>{enrollmentCount} {enrollmentCount > 1 ? "inscrits" : "inscrit"}</p>
        <div className="teacher-course-preview__actions">
          <Link className="btn btn-secondary" href={`/app/teacher/courses/${course.id}/edit`}>
            Retour à l'édition
          </Link>
          <Link className="btn btn-primary" href={`/app/teacher/courses/${course.id}/builder`}>
            <Users size={17} aria-hidden="true" />
            Éditer le parcours
          </Link>
        </div>
      </section>
    </div>
  );
}
