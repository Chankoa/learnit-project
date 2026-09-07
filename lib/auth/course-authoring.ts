import "server-only";

import { requireActiveProfile } from "@/lib/auth/server";
import { getCourseCapabilities } from "@/lib/unified-course-relations";

/** Creation is an activity available to every active account, not a global role. */
export const requireCourseCreationAccess = requireActiveProfile;

/** U4.2 mutations use teacher_id ownership; editor memberships remain prospective.
 * Global administration retains its existing, separate admin services and policies.
 */
export async function requireCourseCapability(
  courseId: string,
  capability: "edit" | "publish" | "manage_members" = "edit",
  nextPath = "/app/courses"
) {
  const profile = await requireActiveProfile(nextPath);
  const relation = await getCourseCapabilities(profile.id, courseId);
  if (!relation.capabilities.includes(capability)) {
    throw new Error("Parcours introuvable ou accès non autorisé.");
  }
  return profile;
}
