import "server-only";

import { calculateCourseProgress } from "@/lib/course-progress";
import type { CurrentProfile } from "@/lib/auth/server";
import { getLmsDataSource } from "@/lib/lms";
import { getEnrollments } from "@/lib/repositories/learningRepository";
import { createOptionalClient } from "@/lib/supabase/server";
import type { Course } from "@/types/course";
import type { EnrollmentRecord } from "@/lib/repositories/learningRepository.types";

export type CourseMembershipRole = "viewer" | "participant" | "contributor" | "editor" | "owner";
export type CourseCapability = "view" | "comment" | "propose" | "reuse" | "remix" | "edit" | "publish" | "manage_members";

type MembershipRow = { course_id: string; role: CourseMembershipRole; status: "invited" | "active" | "suspended" | "revoked" };
type ProgressRow = { course_id: string; lesson_id: string; completed: boolean; updated_at: string };

export type UnifiedCourseRelation = {
  course: Course;
  capabilities: CourseCapability[];
  enrollment?: EnrollmentRecord;
  isLegacyOwner: boolean;
  isAdmin: boolean;
  memberships: CourseMembershipRole[];
  progress: { completedCount: number; percentage: number; totalLessons: number };
  lastActivityAt?: string;
  primaryHref: string;
  primaryLabel: "Continuer" | "Revoir" | "Gérer" | "Consulter";
};

const capabilityByRole: Record<CourseMembershipRole, CourseCapability[]> = {
  viewer: ["view", "reuse", "remix"],
  participant: ["view", "comment", "reuse", "remix"],
  contributor: ["view", "comment", "propose", "reuse", "remix"],
  editor: ["view", "comment", "propose", "reuse", "remix", "edit"],
  owner: ["view", "comment", "propose", "reuse", "remix", "edit", "publish", "manage_members"]
};

function latest(...values: Array<string | undefined>) {
  return values
    .filter((value): value is string => Boolean(value))
    .sort((first, second) => new Date(second).getTime() - new Date(first).getTime())[0];
}

async function getMemberships(): Promise<MembershipRow[]> {
  const supabase = await createOptionalClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("course_memberships")
    .select("course_id,role,status")
    .eq("status", "active");
  if (error) return [];
  return data as MembershipRow[];
}

async function getProgress(courseIds: string[]): Promise<ProgressRow[]> {
  const supabase = await createOptionalClient();
  if (!supabase || courseIds.length === 0) return [];

  const { data, error } = await supabase
    .from("lesson_progress")
    .select("course_id,lesson_id,completed,updated_at")
    .in("course_id", courseIds);
  if (error) return [];
  return data as ProgressRow[];
}

export async function getCourseCapabilities(userId: string, courseId: string) {
  const supabase = await createOptionalClient();
  if (!supabase) return { relation: [], capabilities: [], isEnrolled: false, isOwnerLegacy: false, isAdmin: false };

  const [{ data: authData }, { data: courseData }, { data: membershipData }, { data: enrollmentData }, { data: profileData }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("courses").select("teacher_id").eq("id", courseId).maybeSingle(),
    supabase.from("course_memberships").select("role,status").eq("course_id", courseId).eq("user_id", userId).eq("status", "active"),
    supabase.from("enrollments").select("id").eq("course_id", courseId).eq("user_id", userId).maybeSingle(),
    supabase.from("profiles").select("role").eq("id", userId).maybeSingle()
  ]);

  if (authData.user?.id !== userId) throw new Error("Course capabilities require the current user.");

  const isAdmin = profileData?.role === "admin";
  const isOwnerLegacy = courseData?.teacher_id === userId;
  const relation = (membershipData as Array<Pick<MembershipRow, "role">> | null ?? []).map(({ role }) => role);
  if (isOwnerLegacy && !relation.includes("owner")) relation.push("owner");
  const capabilities = isAdmin
    ? Object.values(capabilityByRole.owner).flat()
    : [...new Set(relation.flatMap((role) => capabilityByRole[role]))];

  return { relation, capabilities, isEnrolled: Boolean(enrollmentData), isOwnerLegacy, isAdmin };
}

export async function getUnifiedCourseRelations(profile: CurrentProfile): Promise<UnifiedCourseRelation[]> {
  const [courses, enrollments, memberships] = await Promise.all([
    getLmsDataSource().getCourses(),
    getEnrollments(),
    getMemberships()
  ]);
  const progressRows = await getProgress(courses.map((course) => course.id));
  const membershipByCourse = new Map<string, CourseMembershipRole[]>();
  memberships.forEach((membership) => {
    const roles = membershipByCourse.get(membership.course_id) ?? [];
    roles.push(membership.role);
    membershipByCourse.set(membership.course_id, roles);
  });
  const enrollmentByCourse = new Map(enrollments.map((enrollment) => [enrollment.courseId, enrollment]));

  return courses.flatMap((course) => {
    const enrollment = enrollmentByCourse.get(course.id);
    const isLegacyOwner = course.createdBy === profile.id;
    const membershipsForCourse = membershipByCourse.get(course.id) ?? [];
    if (!enrollment && !isLegacyOwner && membershipsForCourse.length === 0 && profile.role !== "admin") return [];

    const roles = isLegacyOwner && !membershipsForCourse.includes("owner")
      ? [...membershipsForCourse, "owner" as const]
      : membershipsForCourse;
    const roleCapabilities = profile.role === "admin"
      ? capabilityByRole.owner
      : [...new Set(roles.flatMap((role) => capabilityByRole[role]))];
    const capabilities = profile.role === "teacher" || profile.role === "admin"
      ? roleCapabilities
      : roleCapabilities.filter((capability) => !["edit", "publish", "manage_members"].includes(capability));
    const accessibleLessonIds = course.modules.flatMap((module) => module.lessons).filter((lesson) => lesson.status !== "locked").map((lesson) => lesson.id);
    const courseProgress = progressRows.filter((progress) => progress.course_id === course.id);
    const progress = calculateCourseProgress(courseProgress.filter((item) => item.completed).map((item) => item.lesson_id), accessibleLessonIds);
    const lastActivityAt = latest(enrollment?.lastAccessedAt, ...courseProgress.map((item) => item.updated_at), course.updatedAt);
    const primaryLabel: UnifiedCourseRelation["primaryLabel"] = enrollment
      ? enrollment.status === "completed"
        ? "Revoir"
        : "Continuer"
      : capabilities.includes("edit")
        ? "Gérer"
        : "Consulter";
    const currentLesson = course.modules.flatMap((module) => module.lessons).find((lesson) => lesson.id === enrollment?.currentLessonId);
    const primaryHref = primaryLabel === "Continuer" && currentLesson
      ? `/app/courses/${course.slug}/lessons/${currentLesson.slug}?mode=learn`
      : primaryLabel === "Gérer"
        ? `/app/courses/${course.slug}?mode=edit`
        : `/app/courses/${course.slug}`;

    return [{
      course,
      capabilities,
      enrollment,
      isLegacyOwner,
      isAdmin: profile.role === "admin",
      memberships: roles,
      progress,
      lastActivityAt,
      primaryHref,
      primaryLabel
    }];
  }).sort((first, second) => new Date(second.lastActivityAt ?? 0).getTime() - new Date(first.lastActivityAt ?? 0).getTime());
}
