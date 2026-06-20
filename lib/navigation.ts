import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  BookPlus,
  Compass,
  GraduationCap,
  Home,
  Info,
  LayoutDashboard,
  Library,
  Mail,
  Send,
  Settings,
  ShieldCheck,
  SquarePen,
  TrendingUp,
  UserCircle,
  UserCog,
  Users
} from "lucide-react";

export type ApplicationRole = "visitor" | "learner" | "teacher" | "admin";
export type PlatformSpaceRole = Exclude<ApplicationRole, "visitor">;

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  role: ApplicationRole;
  badge?: string;
  isActive?: (pathname: string) => boolean;
};

export type PlatformSpace = {
  role: PlatformSpaceRole;
  title: string;
  href: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  icon: LucideIcon;
  highlights: string[];
};

const inactiveAnchor = () => false;

export const publicNavigation = [
  {
    label: "Accueil",
    href: "/",
    icon: Home,
    role: "visitor",
    isActive: (pathname) => pathname === "/"
  },
  {
    label: "Formations",
    href: "/formations",
    icon: GraduationCap,
    role: "visitor",
    isActive: (pathname) => pathname.startsWith("/formations")
  },
  {
    label: "Étude de cas",
    href: "/case-study",
    icon: Award,
    role: "visitor",
    isActive: (pathname) => pathname === "/case-study"
  },
  {
    label: "Domaines",
    href: "/#domaines",
    icon: Compass,
    role: "visitor",
    isActive: (pathname) => pathname.startsWith("/domaines")
  },
  {
    label: "Ressources",
    href: "/#ressources",
    icon: Library,
    role: "visitor",
    isActive: inactiveAnchor
  },
  {
    label: "À propos",
    href: "/#apropos",
    icon: Info,
    role: "visitor",
    isActive: inactiveAnchor
  },
  {
    label: "Contact",
    href: "/#contact",
    icon: Mail,
    role: "visitor",
    isActive: inactiveAnchor
  }
] satisfies NavigationItem[];

export const learnerNavigation = [
  {
    label: "Tableau de bord",
    href: "/app/learner",
    icon: LayoutDashboard,
    role: "learner",
    isActive: (pathname) => pathname === "/app/learner" || pathname === "/dashboard"
  },
  {
    label: "Mes formations",
    href: "/app/learner/courses",
    icon: GraduationCap,
    role: "learner",
    isActive: (pathname) => pathname === "/app/learner/courses" || pathname.startsWith("/learn")
  },
  {
    label: "Progression",
    href: "/app/learner/progress",
    icon: TrendingUp,
    role: "learner",
    isActive: (pathname) => pathname === "/app/learner/progress"
  },
  {
    label: "Ressources",
    href: "/app/learner/resources",
    icon: Library,
    role: "learner",
    isActive: (pathname) => pathname === "/app/learner/resources"
  },
  {
    label: "Certificats",
    href: "/app/learner/certificates",
    icon: Award,
    role: "learner",
    isActive: (pathname) => pathname === "/app/learner/certificates"
  },
  {
    label: "Profil",
    href: "/app/learner#profil",
    icon: UserCircle,
    role: "learner",
    isActive: inactiveAnchor
  }
] satisfies NavigationItem[];

export const teacherNavigation = [
  {
    label: "Tableau de bord",
    href: "/app/teacher",
    icon: LayoutDashboard,
    role: "teacher",
    isActive: (pathname) => pathname === "/app/teacher"
  },
  {
    label: "Mes formations",
    href: "/app/teacher/courses",
    icon: GraduationCap,
    role: "teacher",
    isActive: (pathname) =>
      pathname === "/app/teacher/courses" ||
      (pathname.startsWith("/app/teacher/courses/") &&
        pathname !== "/app/teacher/courses/new" &&
        !pathname.endsWith("/builder"))
  },
  {
    label: "Créer une formation",
    href: "/app/teacher/courses/new",
    icon: BookPlus,
    role: "teacher",
    isActive: (pathname) => pathname === "/app/teacher/courses/new"
  },
  {
    label: "Leçons",
    href: "/app/teacher/courses/teacher-course-web-portfolio/builder",
    icon: BookOpen,
    role: "teacher",
    isActive: (pathname) => pathname.endsWith("/builder")
  },
  {
    label: "Ressources",
    href: "/app/teacher/resources",
    icon: Library,
    role: "teacher",
    isActive: (pathname) => pathname === "/app/teacher/resources"
  },
  {
    label: "Apprenants",
    href: "/app/teacher/students",
    icon: Users,
    role: "teacher",
    isActive: (pathname) => pathname === "/app/teacher/students"
  }
] satisfies NavigationItem[];

export const adminNavigation = [
  {
    label: "Tableau de bord",
    href: "/app/admin",
    icon: LayoutDashboard,
    role: "admin",
    isActive: (pathname) => pathname === "/app/admin"
  },
  {
    label: "Utilisateurs",
    href: "/app/admin/users",
    icon: UserCog,
    role: "admin",
    isActive: (pathname) => pathname === "/app/admin/users"
  },
  {
    label: "Formations",
    href: "/app/admin/courses",
    icon: GraduationCap,
    role: "admin",
    isActive: (pathname) => pathname === "/app/admin/courses"
  },
  {
    label: "Domaines",
    href: "/app/admin/domains",
    icon: Compass,
    role: "admin",
    isActive: (pathname) => pathname === "/app/admin/domains"
  },
  {
    label: "Publications",
    href: "/app/admin#publications",
    icon: Send,
    role: "admin",
    isActive: inactiveAnchor
  },
  {
    label: "Paramètres",
    href: "/app/admin/settings",
    icon: Settings,
    role: "admin",
    isActive: (pathname) => pathname === "/app/admin/settings"
  }
] satisfies NavigationItem[];

export const platformAccessNavigation = [
  {
    label: "Espace apprenant",
    href: "/app/learner",
    icon: GraduationCap,
    role: "learner",
    badge: "Démo",
    isActive: (pathname) => pathname.startsWith("/app/learner") || pathname.startsWith("/dashboard") || pathname.startsWith("/learn")
  },
  {
    label: "Espace enseignant",
    href: "/app/teacher",
    icon: SquarePen,
    role: "teacher",
    badge: "Démo",
    isActive: (pathname) => pathname.startsWith("/app/teacher")
  },
  {
    label: "Administration",
    href: "/app/admin",
    icon: ShieldCheck,
    role: "admin",
    badge: "Démo",
    isActive: (pathname) => pathname.startsWith("/app/admin")
  }
] satisfies NavigationItem[];

export const roleSwitcherOptions = [
  { role: "visitor", label: "Visiteur", description: "Consulte le hub et les formations." },
  { role: "learner", label: "Apprenant", description: "Suit ses formations et sa progression." },
  { role: "teacher", label: "Enseignant", description: "Crée et gère ses contenus." },
  { role: "admin", label: "Admin", description: "Supervise la plateforme." }
] satisfies Array<{
  role: ApplicationRole;
  label: string;
  description: string;
}>;

export const applicationSpaces = [
  {
    role: "learner",
    title: "Espace apprenant",
    href: "/app/learner",
    description: "Suivre vos formations, reprendre vos leçons et consulter vos ressources.",
    primaryHref: "/app/learner",
    primaryLabel: "Ouvrir le dashboard",
    icon: GraduationCap,
    highlights: ["formations suivies", "progression", "prochaine leçon", "ressources"]
  },
  {
    role: "teacher",
    title: "Espace enseignant",
    href: "/app/teacher",
    description: "Créer et organiser vos formations, modules, leçons et supports.",
    primaryHref: "/app/teacher",
    primaryLabel: "Voir l'aperçu enseignant",
    icon: SquarePen,
    highlights: ["création de formation", "modules", "leçons", "apprenants"]
  },
  {
    role: "admin",
    title: "Administration",
    href: "/app/admin",
    description: "Superviser les utilisateurs, domaines, publications et paramètres de la plateforme.",
    primaryHref: "/app/admin",
    primaryLabel: "Voir l'aperçu admin",
    icon: ShieldCheck,
    highlights: ["utilisateurs", "rôles", "publications", "paramètres"]
  }
] satisfies PlatformSpace[];

export function getNavigationForRole(role: ApplicationRole): NavigationItem[] {
  switch (role) {
    case "learner":
      return learnerNavigation;
    case "teacher":
      return teacherNavigation;
    case "admin":
      return adminNavigation;
    case "visitor":
    default:
      return publicNavigation;
  }
}

export function getApplicationSpaceByRole(role: string) {
  return applicationSpaces.find((space) => space.role === role);
}

export function isNavigationItemActive(item: NavigationItem, pathname: string) {
  if (item.isActive) {
    return item.isActive(pathname);
  }

  const hrefPath = item.href.split("#")[0];

  if (!hrefPath) {
    return false;
  }

  if (hrefPath === "/") {
    return pathname === "/";
  }

  return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
}
