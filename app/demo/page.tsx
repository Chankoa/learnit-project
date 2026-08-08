import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Database,
  Info,
  LockKeyhole,
  Server,
  ShieldAlert,
  Users
} from "lucide-react";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Documentation du mode démo",
  description:
    "Comprendre ce qui est fonctionnel, simulé et prêt à être branché à Supabase ou à un CMS dans LearnIt.",
  path: "/demo",
  noIndex: true
});

const functionalItems = [
  "Navigation publique, catalogue, espaces apprenant, enseignant et admin.",
  "Changement de rôle en local pour parcourir les interfaces.",
  "Progression de leçon, favoris de ressources et notes personnelles via localStorage.",
  "Course Builder interactif avec modules, leçons, prévisualisation et édition fictive.",
  "États vides, loading, error et feedbacks utilisateur cohérents."
];

const simulatedItems = [
  "Authentification, sessions et comptes utilisateurs réels.",
  "Création, publication, duplication ou archivage de formations.",
  "Gestion des rôles, apprenants, domaines et paramètres plateforme.",
  "Téléversement de ressources, images de couverture et fichiers pédagogiques.",
  "Certificats, inscriptions, temps d'apprentissage et statistiques globales."
];

const backendItems = [
  {
    icon: Database,
    title: "Supabase",
    text: "Auth, profils utilisateurs, rôles, inscriptions, progression, notes, favoris et certificats."
  },
  {
    icon: ClipboardList,
    title: "CMS ou MDX",
    text: "Contenus pédagogiques, modules, leçons, ressources, templates et versions publiées."
  },
  {
    icon: Server,
    title: "Stockage fichiers",
    text: "Images de couverture, PDF, exercices rendus, exports de certificats et assets enseignants."
  }
];

const roles = [
  {
    title: "Visiteur",
    text: "Explore le catalogue public et la documentation sans compte réel."
  },
  {
    title: "Apprenant",
    text: "Consulte ses formations, ressources, progression locale, notes et certificats fictifs."
  },
  {
    title: "Enseignant",
    text: "Gère des formations, ressources, apprenants et un Course Builder en mode démonstration."
  },
  {
    title: "Admin",
    text: "Supervise utilisateurs, formations, domaines et paramètres sans impact réel."
  }
];

export default function DemoDocumentationPage() {
  return (
    <>
      <section className="section-shell page-hero demo-doc-hero">
        <div className="demo-doc-hero__content">
          <span className="eyebrow w-fit">
            <ShieldAlert size={14} aria-hidden="true" />
            Mode démonstration
          </span>
          <h1>LearnIt montre l'expérience produit sans prétendre être connecté.</h1>
          <p>
            Cette version sert à valider les parcours, l'ergonomie et la structure des données.
            Les actions de gestion restent simulées tant qu'une authentification, une base de données
            et un CMS ne sont pas branchés.
          </p>
          <div className="demo-doc-hero__actions">
            <Link className="btn btn-primary" href="/app">
              Explorer les espaces
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link className="btn btn-secondary" href="#branchements">
              Voir les branchements
            </Link>
          </div>
        </div>

        <div className="demo-doc-hero__media">
          <Image
            alt="Aperçu de l'interface LearnIt utilisée en mode démonstration"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 42vw"
            src="/images/learnit-hub-hero.png"
          />
        </div>
      </section>

      <section className="section-shell content-section" id="branchements">
        <div className="demo-doc-grid">
          <article className="demo-doc-panel">
            <span className="icon-badge icon-badge--cyan">
              <CheckCircle2 size={20} aria-hidden="true" />
            </span>
            <h2>Ce qui est fonctionnel</h2>
            <ul>
              {functionalItems.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="demo-doc-panel">
            <span className="icon-badge icon-badge--pink">
              <Info size={20} aria-hidden="true" />
            </span>
            <h2>Ce qui est simulé</h2>
            <ul>
              {simulatedItems.map((item) => (
                <li key={item}>
                  <Info size={16} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="section-shell content-section">
        <div className="section-intro">
          <div>
            <span className="eyebrow w-fit">Branchements possibles</span>
            <h2>La V1 peut devenir connectée sans changer l'expérience cible.</h2>
          </div>
          <p>
            Les repositories mockés préparent la transition vers une vraie source de données. Supabase
            peut porter l'identité et la progression, tandis qu'un CMS ou des contenus MDX peuvent porter
            les contenus pédagogiques.
          </p>
        </div>

        <div className="demo-backend-grid">
          {backendItems.map((item) => {
            const Icon = item.icon;

            return (
              <article className="demo-backend-card" key={item.title}>
                <span className="icon-badge">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell content-section">
        <div className="section-intro">
          <div>
            <span className="eyebrow w-fit">Rôles disponibles</span>
            <h2>Les rôles servent à tester les surfaces, pas à authentifier.</h2>
          </div>
          <p>
            Le sélecteur de rôle écrit seulement une valeur locale dans le navigateur. Il ne crée pas
            de session, ne vérifie pas d'email et ne protège pas encore des données réelles.
          </p>
        </div>

        <div className="demo-role-grid">
          {roles.map((role) => (
            <article className="demo-role-card" key={role.title}>
              <Users size={18} aria-hidden="true" />
              <h3>{role.title}</h3>
              <p>{role.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell content-section">
        <div className="demo-warning-band">
          <LockKeyhole size={22} aria-hidden="true" />
          <div>
            <h2>À retenir avant une mise en production</h2>
            <p>
              Les guards actuels améliorent la démonstration, mais ne remplacent pas une vraie
              authentification. Une V1 connectée devra vérifier les permissions côté serveur, protéger
              les routes sensibles et persister les actions dans une base de données.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
