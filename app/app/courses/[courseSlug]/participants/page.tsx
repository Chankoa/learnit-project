import Link from "next/link";
import { notFound } from "next/navigation";
import { UnifiedAppShell } from "@/components/app/UnifiedAppShell";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { requireActiveProfile } from "@/lib/auth/server";
import { getUnifiedCourseContext } from "@/lib/unified-course-workspace";
import { getTeacherStudioCourse } from "@/lib/teacher-service";
export const dynamic = "force-dynamic";
export default async function CourseParticipantsPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const path = `/app/courses/${courseSlug}/participants`;
  const profile = await requireActiveProfile(path);
  const context = await getUnifiedCourseContext(courseSlug, "view");
  if (!context?.canManageMembers) notFound();
  const course = await getTeacherStudioCourse(context.learning.course.id, path);
  if (!course) notFound();
  return <UnifiedAppShell profile={profile}><div className="app-page"><AppBreadcrumb items={[{ label: "Mes parcours", href: "/app/courses" }, { label: course.title, href: `/app/courses/${courseSlug}?mode=view` }, { label: "Participants" }]} /><AppPageHeader eyebrow="Participants" title={course.title} description={`${course.enrolledLearnerCount ?? 0} inscription(s) à ce parcours.`} /><p>Les invitations et les discussions collaboratives sont à venir.</p><Link className="btn btn-secondary" href={`/app/courses/${courseSlug}?mode=view`}>Retour au parcours</Link></div></UnifiedAppShell>;
}
