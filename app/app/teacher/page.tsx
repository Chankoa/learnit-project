import type { Metadata } from "next";

import { RoleSpaceOverview } from "@/components/app/RoleSpaceOverview";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Espace enseignant",
  description: "Créez et organisez vos formations, modules, leçons, ressources et apprenants LearnIt.",
  path: "/app/teacher",
  noIndex: true
});

export default function TeacherAppPage() {
  return <RoleSpaceOverview role="teacher" />;
}
