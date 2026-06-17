import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { RoleSwitcher } from "@/components/app/RoleSwitcher";
import {
  getApplicationSpaceByRole,
  getApplicationSpaceStaticParams,
  getNavigationForRole,
  isNavigationItemActive
} from "@/lib/navigation";
import { createPageMetadata } from "@/lib/seo";

type RoleSpacePageProps = {
  params: Promise<{
    role: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getApplicationSpaceStaticParams();
}

export async function generateMetadata({ params }: RoleSpacePageProps): Promise<Metadata> {
  const { role } = await params;
  const space = getApplicationSpaceByRole(role);

  if (!space) {
    return {
      title: "Espace introuvable"
    };
  }

  return createPageMetadata({
    title: space.title,
    description: `${space.description} Aperçu démo LearnIt pour le rôle ${space.role}.`,
    path: space.href,
    noIndex: true
  });
}

export default async function RoleSpacePage({ params }: RoleSpacePageProps) {
  const { role } = await params;
  const space = getApplicationSpaceByRole(role);

  if (!space) {
    notFound();
  }

  const navigation = getNavigationForRole(space.role);
  const Icon = space.icon;

  return (
    <>
      <section className="section-shell page-hero app-role-hero">
        <Link className="nav-link inline-flex items-center gap-2" href="/app">
          <ArrowLeft size={16} aria-hidden="true" />
          Retour aux espaces
        </Link>

        <div className="app-role-hero__panel">
          <div>
            <span className="eyebrow w-fit">
              <Sparkles size={14} aria-hidden="true" />
              Espace démo
            </span>
            <h1>{space.title}</h1>
            <p>{space.description}</p>
            <Link className="btn btn-primary" href={space.primaryHref}>
              {space.primaryLabel}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <span className="app-role-hero__icon">
            <Icon size={34} aria-hidden="true" />
          </span>
        </div>
      </section>

      <section className="section-shell content-section">
        <div className="section-intro">
          <div>
            <span className="eyebrow w-fit">Navigation du rôle</span>
            <h2>Entrées principales prévues pour cet espace.</h2>
          </div>
          <p>
            Ces liens structurent le futur périmètre applicatif. Les écrans enseignant et admin restent
            volontairement en aperçu jusqu'à l'ajout de l'authentification et du back-office.
          </p>
        </div>

        <div className="role-navigation-grid">
          {navigation.map((item) => {
            const ItemIcon = item.icon;

            return (
              <Link
                className="role-navigation-card"
                data-active={isNavigationItemActive(item, space.href)}
                href={item.href}
                key={item.label}
              >
                <ItemIcon size={19} aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge ? <small>{item.badge}</small> : null}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section-shell content-section">
        <div className="app-role-summary">
          <div>
            <span className="eyebrow w-fit">Périmètre</span>
            <h2>Ce rôle couvre actuellement quatre priorités.</h2>
          </div>
          <ul>
            {space.highlights.map((highlight) => (
              <li key={highlight}>
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-shell content-section">
        <RoleSwitcher />
      </section>
    </>
  );
}
