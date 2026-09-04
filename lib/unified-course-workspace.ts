import "server-only";

import { getCurrentProfile } from "@/lib/auth/server";
import { getLearningCourseState, type LearningCourseState } from "@/lib/learning-service";
import { getCourseCapabilities, type CourseCapability, type CourseMembershipRole } from "@/lib/unified-course-relations";

export type UnifiedCourseMode = "edit" | "learn" | "view";

export type UnifiedCourseWorkspaceContext = {
  capabilities: CourseCapability[];
  canEdit: boolean;
  canEnroll: boolean;
  canLearn: boolean;
  canManageMembers: boolean;
  canPublish: boolean;
  canView: boolean;
  defaultMode: UnifiedCourseMode;
  isAdmin: boolean;
  isLegacyOwner: boolean;
  learning: LearningCourseState;
  memberships: CourseMembershipRole[];
  mode: UnifiedCourseMode;
  relationLabels: string[];
};

function resolveRequestedMode(
  requestedMode: string | undefined,
  defaults: { canEdit: boolean; canLearn: boolean; defaultMode: UnifiedCourseMode }
) {
  if (requestedMode === "edit" && defaults.canEdit) return "edit";
  if (requestedMode === "learn" && defaults.canLearn) return "learn";
  if (requestedMode === "view") return "view";
  return defaults.defaultMode;
}

export async function getUnifiedCourseContext(
  courseSlug: string,
  requestedMode?: string
): Promise<UnifiedCourseWorkspaceContext | undefined> {
  const profile = await getCurrentProfile();
  if (!profile) return undefined;

  const learning = await getLearningCourseState(courseSlug);
  if (!learning) return undefined;

  const relation = await getCourseCapabilities(profile.id, learning.course.id);
  const capabilities = relation.capabilities;
  const hasEditorialRole = profile.role === "teacher" || profile.role === "admin";
  const isPublished = learning.course.status === "published";
  const isPublic = isPublished && learning.course.visibility === "public";
  const canLearn = isPublished && relation.isEnrolled;
  const canEdit = hasEditorialRole && capabilities.includes("edit");
  const canView = isPublic || canLearn || capabilities.includes("view") || canEdit;

  if (!canView) return undefined;

  const defaultMode: UnifiedCourseMode = canLearn ? "learn" : canEdit ? "edit" : "view";
  const mode = resolveRequestedMode(requestedMode, { canEdit, canLearn, defaultMode });
  const relationLabels = [
    relation.isEnrolled ? "J’apprends" : undefined,
    canEdit ? "Je crée" : undefined,
    capabilities.includes("propose") && !canEdit ? "Je contribue" : undefined
  ].filter((label): label is string => Boolean(label));

  return {
    capabilities,
    canEdit,
    canEnroll: isPublic && !relation.isEnrolled,
    canLearn,
    canManageMembers: hasEditorialRole && capabilities.includes("manage_members"),
    canPublish: hasEditorialRole && capabilities.includes("publish"),
    canView,
    defaultMode,
    isAdmin: relation.isAdmin,
    isLegacyOwner: relation.isOwnerLegacy,
    learning,
    memberships: relation.relation,
    mode,
    relationLabels
  };
}

export function getCanonicalCourseHref(courseSlug: string, mode?: UnifiedCourseMode) {
  return `/app/courses/${courseSlug}${mode ? `?mode=${mode}` : ""}`;
}

export function getCanonicalLessonHref(
  courseSlug: string,
  lessonSlug: string,
  mode: "edit" | "learn" = "learn"
) {
  return `/app/courses/${courseSlug}/lessons/${lessonSlug}?mode=${mode}`;
}
