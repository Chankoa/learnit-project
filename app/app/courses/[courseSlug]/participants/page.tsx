import Link from "next/link";
import { notFound } from "next/navigation";
import { UnifiedAppShell } from "@/components/app/UnifiedAppShell";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import { CourseContextNavigation } from "@/components/app/CourseContextNavigation";
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
  return <UnifiedAppShell profile={profile}><div className="app-page unified-course-overview"><AppBreadcrumb items={[{ label: "Mes parcours", href: "/app/courses" }, { label: course.title, href: `/app/courses/${courseSlug}?mode=view` }, { label: "Participants" }]} /><AppPageHeader eyebrow="Parcours / Participants" title={course.title} description={`${course.enrolledLearnerCount ?? 0} inscription(s) à ce parcours.`} /><CourseContextNavigation courseSlug={courseSlug} active="participants" canEdit={context.canEdit} canLearn={context.canLearn} canPublish={context.canPublish} canManageMembers={context.canManageMembers} /><section className="course-participants-panel" aria-labelledby="participants-title"><h2 id="participants-title">Participants</h2><p>Les inscriptions sont gérées depuis les données réelles du parcours. Les invitations et les discussions collaboratives sont à venir.</p><Link className="btn btn-secondary" href={`/app/courses/${courseSlug}?mode=view`}>Vue d’ensemble</Link></section></div></UnifiedAppShell>;
}
