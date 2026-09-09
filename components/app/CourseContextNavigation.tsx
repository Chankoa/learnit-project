import Link from "next/link";
import { BookOpenText, GraduationCap, PenLine, Send, Users } from "lucide-react";
import { buildCoursePublicationHref } from "@/lib/course-mode-href";

type Props = { courseSlug: string; active: "overview" | "learn" | "edit" | "publication" | "participants"; canEdit: boolean; canLearn: boolean; canPublish: boolean; canManageMembers: boolean; editHref?: string; learnHref?: string };
export function CourseContextNavigation({ courseSlug, active, canEdit, canLearn, canPublish, canManageMembers, editHref, learnHref }: Props) {
  const coursePath = `/app/courses/${courseSlug}`;
  const items = [
    { key: "overview", label: "Vue d’ensemble", href: `${coursePath}?mode=view`, icon: BookOpenText },
    ...(canLearn ? [{ key: "learn", label: "Apprendre", href: learnHref ?? `${coursePath}?mode=learn`, icon: GraduationCap }] : []),
    ...(canEdit ? [{ key: "edit", label: "Modifier", href: editHref ?? `${coursePath}?mode=edit`, icon: PenLine }] : []),
    ...(canPublish ? [{ key: "publication", label: "Publication", href: buildCoursePublicationHref(coursePath), icon: Send }] : []),
    ...(canManageMembers ? [{ key: "participants", label: "Participants", href: `${coursePath}/participants`, icon: Users }] : [])
  ];
  return <nav className="course-context-navigation" aria-label="Navigation du parcours">{items.map(({ key, label, href, icon: Icon }) => <Link key={key} href={href} aria-current={active === key ? "page" : undefined}><Icon size={16} aria-hidden="true" />{label}</Link>)}</nav>;
}
