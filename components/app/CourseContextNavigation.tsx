import Link from "next/link";
import { BookOpenText, Send, Users } from "lucide-react";
import { buildCoursePublicationHref } from "@/lib/course-mode-href";

type Props = { courseSlug: string; active: "overview" | "publication" | "participants"; canPublish: boolean; canManageMembers: boolean };
export function CourseContextNavigation({ courseSlug, active, canPublish, canManageMembers }: Props) {
  const coursePath = `/app/courses/${courseSlug}`;
  const items = [
    { key: "overview", label: "Vue d’ensemble", href: `${coursePath}?mode=view`, icon: BookOpenText },
    ...(canPublish ? [{ key: "publication", label: "Gérer la publication", href: buildCoursePublicationHref(coursePath), icon: Send }] : []),
    ...(canManageMembers ? [{ key: "participants", label: "Participants", href: `${coursePath}/participants`, icon: Users }] : [])
  ];
  if (items.length === 1 && active === "overview") return null;
  return <nav className="course-context-navigation" aria-label="Gestion du parcours">{items.map(({ key, label, href, icon: Icon }) => <Link key={key} href={href} aria-current={active === key ? "page" : undefined}><Icon size={16} aria-hidden="true" />{label}</Link>)}</nav>;
}
