import type { Metadata } from "next";

import { RoleSpaceOverview } from "@/components/app/RoleSpaceOverview";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Espace apprenant",
  description: "Suivez vos formations, modules, leçons, ressources et progression LearnIt.",
  path: "/app/learner",
  noIndex: true
});

export default function LearnerAppPage() {
  return <RoleSpaceOverview role="learner" />;
}
