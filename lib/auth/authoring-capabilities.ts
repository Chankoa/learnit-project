import type { CourseCapability } from "@/lib/unified-course-relations";

/** Only persisted ownership supports workspace mutations end to end today. */
export function effectiveCourseCapabilities(
  capabilities: CourseCapability[],
  isOwner: boolean,
  isActive: boolean,
  isAdmin = false
): CourseCapability[] {
  if (!isActive) return [];
  return isOwner || isAdmin ? capabilities : capabilities.filter((capability) =>
    !["edit", "publish", "manage_members"].includes(capability));
}
