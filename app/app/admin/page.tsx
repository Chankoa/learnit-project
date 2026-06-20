import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  BookOpenCheck,
  Clock3,
  Compass,
  GraduationCap,
  UserCog,
  Users
} from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import {
  formatAdminDateTime,
  getAdminDashboardData
} from "@/lib/admin";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Administration",
  description: "Supervisez les utilisateurs, formations, domaines et paramètres LearnIt.",
  path: "/app/admin",
  noIndex: true
});

export default function AdminAppPage() {
  const dashboard = getAdminDashboardData();

  return (
    <div className="app-page admin-page">
      <AppBreadcrumb
        items={[
          { label: "Accès plateforme", href: "/app" },
          { label: "Administration" }
        ]}
      />

      <AppPageHeader
        eyebrow="Supervision globale"
        title="Administration LearnIt"
        description="Suivez l'état de la plateforme, les utilisateurs, les formations, les domaines actifs et les dernières opérations."
        actions={
          <Link className="btn btn-primary" href="/app/admin/courses">
            <GraduationCap size={17} aria-hidden="true" />
            Gérer les formations démo
          </Link>
        }
      />

      <section className="learning-metrics admin-metrics" aria-label="Indicateurs plateforme">
        <article>
          <span className="learning-metric-icon learning-metric-icon--purple">
            <Users size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Utilisateurs</small>
            <strong>{dashboard.metrics.totalUsers}</strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--cyan">
            <UserCog size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Apprenants / enseignants</small>
            <strong>
              {dashboard.metrics.learnerCount}/{dashboard.metrics.teacherCount}
            </strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--green">
            <BookOpenCheck size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Formations publiées</small>
            <strong>{dashboard.metrics.publishedCourseCount}</strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--amber">
            <Clock3 size={19} aria-hidden="true" />
          </span>
          <div>
            <small>En attente</small>
            <strong>{dashboard.metrics.pendingCourseCount}</strong>
          </div>
        </article>
        <article>
          <span className="learning-metric-icon learning-metric-icon--purple">
            <Compass size={19} aria-hidden="true" />
          </span>
          <div>
            <small>Domaines actifs</small>
            <strong>{dashboard.metrics.activeDomainCount}</strong>
          </div>
        </article>
      </section>

      <div className="dashboard-primary-grid">
        <section className="learning-panel">
          <div className="learning-panel__heading">
            <div>
              <span>Activité récente</span>
              <h2>Dernières opérations</h2>
            </div>
            <Activity size={20} aria-hidden="true" />
          </div>

          <div className="admin-timeline">
            {dashboard.activities.map((activity) => (
              <article key={activity.id}>
                <span />
                <div>
                  <h3>{activity.label}</h3>
                  <p>
                    {activity.actor} · {formatAdminDateTime(activity.createdAt)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="learning-panel">
          <div className="learning-panel__heading">
            <div>
              <span>Accès rapides</span>
              <h2>Supervision</h2>
            </div>
          </div>

          <div className="admin-quick-grid">
            <Link href="/app/admin/users">Utilisateurs</Link>
            <Link href="/app/admin/courses">Formations</Link>
            <Link href="/app/admin/domains">Domaines</Link>
            <Link href="/app/admin/settings">Paramètres</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
