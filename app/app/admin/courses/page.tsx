import type { Metadata } from "next";
import Link from "next/link";
import { Filter } from "lucide-react";

import { AdminCoursesTable, type AdminCourseRow } from "@/components/app/AdminCoursesTable";
import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import {
  adminCourseStatusLabels,
  adminPublicationLabels,
  getAdminDomains,
  getAdminTeachers,
  getFilteredAdminCourseRows,
  isAdminCourseStatus,
  isAdminPublicationState,
  type AdminCourseFilters
} from "@/lib/admin";
import { createPageMetadata } from "@/lib/seo";

type AdminCoursesSearchParams = {
  status?: string | string[];
  domain?: string | string[];
  teacher?: string | string[];
  publication?: string | string[];
};

type AdminCoursesPageProps = {
  searchParams?: Promise<AdminCoursesSearchParams>;
};

export const metadata: Metadata = createPageMetadata({
  title: "Gestion formations admin",
  description: "Supervisez toutes les formations de la plateforme LearnIt.",
  path: "/app/admin/courses",
  noIndex: true
});

function getSingleParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminCoursesPage({
  searchParams
}: AdminCoursesPageProps) {
  const params = await searchParams;
  const domains = getAdminDomains();
  const teachers = getAdminTeachers();
  const statusParam = getSingleParam(params?.status);
  const domainParam = getSingleParam(params?.domain);
  const teacherParam = getSingleParam(params?.teacher);
  const publicationParam = getSingleParam(params?.publication);
  const filters = {
    status: isAdminCourseStatus(statusParam) ? statusParam : undefined,
    domainId: domains.some((domain) => domain.id === domainParam) ? domainParam : undefined,
    teacherId: teachers.some((teacher) => teacher.id === teacherParam) ? teacherParam : undefined,
    publication: isAdminPublicationState(publicationParam) ? publicationParam : undefined
  } satisfies AdminCourseFilters;
  const rows = getFilteredAdminCourseRows(filters).map(
    ({ course, domain, teacher }) =>
      ({
        course,
        domainName: domain?.name ?? "Domaine supprimé",
        teacherName: teacher?.name ?? "Enseignant supprimé"
      }) satisfies AdminCourseRow
  );

  return (
    <div className="app-page admin-page">
      <AppBreadcrumb
        items={[
          { label: "Administration", href: "/app/admin" },
          { label: "Formations" }
        ]}
      />

      <AppPageHeader
        eyebrow="Formations"
        title="Catalogue plateforme"
        description="Vue de supervision de toutes les formations, avec filtres et actions de publication fictives."
      />

      <form className="admin-filter-panel" action="/app/admin/courses">
        <div>
          <label>
            <span>Statut</span>
            <select name="status" defaultValue={filters.status ?? ""}>
              <option value="">Tous</option>
              {Object.entries(adminCourseStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Domaine</span>
            <select name="domain" defaultValue={filters.domainId ?? ""}>
              <option value="">Tous</option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Enseignant</span>
            <select name="teacher" defaultValue={filters.teacherId ?? ""}>
              <option value="">Tous</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Publication</span>
            <select name="publication" defaultValue={filters.publication ?? ""}>
              <option value="">Toutes</option>
              {Object.entries(adminPublicationLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="admin-filter-panel__actions">
          <button className="btn btn-primary" type="submit">
            <Filter size={17} aria-hidden="true" />
            Filtrer
          </button>
          <Link className="btn btn-secondary" href="/app/admin/courses">
            Réinitialiser
          </Link>
        </div>
      </form>

      <AdminCoursesTable rows={rows} />
    </div>
  );
}
