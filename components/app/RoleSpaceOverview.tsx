import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { AppBreadcrumb } from "@/components/app/AppBreadcrumb";
import { AppPageHeader } from "@/components/app/AppPageHeader";
import {
  getApplicationSpaceByRole,
  getNavigationForRole,
  isNavigationItemActive,
  type PlatformSpaceRole
} from "@/lib/navigation";

type RoleSpaceOverviewProps = {
  role: PlatformSpaceRole;
};

const roleMetrics: Record<PlatformSpaceRole, Array<{ label: string; value: string }>> = {
  learner: [
    { label: "formations suivies", value: "2" },
    { label: "leçons terminées", value: "8" },
    { label: "ressources récentes", value: "4" }
  ],
  teacher: [
    { label: "formations créées", value: "3" },
    { label: "leçons en brouillon", value: "12" },
    { label: "apprenants suivis", value: "48" }
  ],
  admin: [
    { label: "utilisateurs", value: "124" },
    { label: "publications", value: "9" },
    { label: "domaines actifs", value: "5" }
  ]
};

const roleDescriptions: Record<PlatformSpaceRole, string> = {
  learner: "Retrouvez vos formations, votre progression, vos ressources et les prochaines étapes à suivre.",
  teacher: "Structurez les contenus pédagogiques et préparez la gestion des apprenants depuis un espace dédié.",
  admin: "Supervisez les rôles, les domaines, les publications et les paramètres globaux de la plateforme."
};

export function RoleSpaceOverview({ role }: RoleSpaceOverviewProps) {
  const space = getApplicationSpaceByRole(role);

  if (!space) {
    return null;
  }

  const navigation = getNavigationForRole(role);
  const metrics = roleMetrics[role];

  return (
    <div className="app-page">
      <AppBreadcrumb
        items={[
          { label: "Accès plateforme", href: "/app" },
          { label: space.title }
        ]}
      />

      <AppPageHeader
        eyebrow="Espace applicatif"
        title={space.title}
        description={roleDescriptions[role]}
        actions={
          <Link className="btn btn-primary" href={space.primaryHref}>
            {space.primaryLabel}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        }
      />

      <section className="app-kpi-grid" aria-label={`Indicateurs de l'espace ${space.title}`}>
        {metrics.map((metric) => (
          <article className="app-kpi-card" key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </section>

      <section className="app-dashboard-grid" aria-label="Navigation du rôle">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              className="app-dashboard-card"
              data-active={isNavigationItemActive(item, space.href)}
              href={item.href}
              id={item.href.includes("#") ? item.href.split("#")[1] : undefined}
              key={item.label}
            >
              <span className="app-dashboard-card__icon">
                <Icon size={19} aria-hidden="true" />
              </span>
              <div>
                <h2>{item.label}</h2>
                <p>{getCardDescription(item.label, role)}</p>
              </div>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          );
        })}
      </section>

      <section className="app-functional-panel">
        <div>
          <span>Priorités</span>
          <h2>Ce rôle couvre actuellement quatre responsabilités.</h2>
        </div>
        <ul>
          {space.highlights.map((highlight) => (
            <li key={highlight}>
              <CheckCircle2 size={16} aria-hidden="true" />
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function getCardDescription(label: string, role: PlatformSpaceRole) {
  const descriptions: Record<PlatformSpaceRole, Record<string, string>> = {
    learner: {
      "Tableau de bord": "Vue synthétique de votre parcours et des prochaines actions.",
      "Mes formations": "Accès aux parcours suivis, modules et leçons en cours.",
      Progression: "Suivi des leçons terminées, du temps passé et des objectifs.",
      Ressources: "Supports utiles, téléchargements et documents liés aux cours.",
      Certificats: "Badges et attestations prévues pour les formations terminées.",
      Profil: "Informations de compte et préférences d'apprentissage."
    },
    teacher: {
      "Tableau de bord": "Pilotage des contenus et activité pédagogique.",
      "Mes formations": "Gestion des parcours créés ou en préparation.",
      "Créer une formation": "Structure initiale, domaine, niveau et promesse pédagogique.",
      Leçons: "Organisation des modules, leçons et contenus MDX.",
      Ressources: "Bibliothèque de supports, fichiers et exercices.",
      Apprenants: "Suivi des inscrits, progression et livrables."
    },
    admin: {
      "Tableau de bord": "Vue globale sur l'état de la plateforme.",
      Utilisateurs: "Gestion des comptes, rôles et permissions.",
      Formations: "Supervision du catalogue et des statuts.",
      Domaines: "Organisation des familles de compétences.",
      Publications: "Contrôle des contenus publiés ou en attente.",
      Paramètres: "Configuration globale, thème et options de plateforme."
    }
  };

  return descriptions[role][label] ?? "Espace prévu pour les prochaines évolutions.";
}
