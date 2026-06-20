import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Database,
  Eye,
  Film,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  Palette,
  Route,
  ShieldCheck,
  SquarePen,
  Sparkles,
  Waypoints
} from "lucide-react";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Étude de cas REKODE",
  description:
    "Découvrez comment REKODE a conçu LearnIt, une plateforme pédagogique modulaire avec vitrine de formation, espace apprenant, design system et architecture Next.js.",
  path: "/case-study",
  image: "/images/learnit-hub-hero.png"
});

const heroMetrics = [
  { label: "domaines prêts", value: "2+" },
  { label: "parcours modélisés", value: "4" },
  { label: "routes produit", value: "20+" }
];

const portfolioSignals = [
  {
    icon: GraduationCap,
    title: "Plateforme pédagogique",
    text: "Un modèle de cours capable d'accueillir plusieurs domaines, modules, leçons, ressources et exercices."
  },
  {
    icon: Eye,
    title: "Vitrine de formation",
    text: "Un hub public, des pages domaines et des fiches formation conçus pour comparer, filtrer et convertir."
  },
  {
    icon: LayoutDashboard,
    title: "Espace apprenant",
    text: "Un dashboard, un parcours de formation et des pages leçons distincts de la vitrine commerciale."
  },
  {
    icon: Palette,
    title: "Design system",
    text: "Des tokens, composants, thèmes light/dark et états visuels cohérents sur les surfaces publiques et apprenant."
  },
  {
    icon: Layers3,
    title: "Architecture Next.js modulaire",
    text: "Une App Router structurée par dossiers racine, data layer abstrait et contenus MDX maintenables."
  }
];

const caseSections = [
  {
    icon: BookOpen,
    eyebrow: "Contexte",
    title: "Passer d'une formation exemple à une plateforme multi-parcours.",
    text:
      "LearnIt partait d'une page centrée sur la formation création web. L'enjeu était de transformer cette base en produit générique, capable de porter plusieurs domaines sans casser la cohérence éditoriale ni le déploiement Netlify.",
    points: ["formation web complète", "cours IA en aperçu", "catalogue multi-domaines", "future administration CMS"]
  },
  {
    icon: Route,
    eyebrow: "Objectif",
    title: "Créer une preuve produit utilisable en démonstration commerciale.",
    text:
      "Le projet devait montrer à la fois le potentiel pédagogique, l'expérience apprenant et la qualité d'architecture que REKODE peut livrer sur un produit de formation.",
    points: ["navigation claire", "contenus extensibles", "vitrine crédible", "socle technique maintenable"]
  },
  {
    icon: Sparkles,
    eyebrow: "Cibles",
    title: "Servir trois publics sans multiplier les interfaces.",
    text:
      "La plateforme s'adresse aux apprenants qui veulent progresser, aux formateurs qui doivent structurer des contenus et aux porteurs de projet qui cherchent une vitrine de formation professionnelle.",
    points: ["apprenants autonomes", "créateurs de formations", "équipes pédagogiques", "marques expertes"]
  },
  {
    icon: Waypoints,
    eyebrow: "Architecture produit",
    title: "Séparer vitrine, catalogue, curriculum et expérience apprenant.",
    text:
      "Chaque surface a un rôle net : attirer, orienter, détailler, apprendre. Cette séparation prépare l'ajout d'un CMS, d'un espace admin et de données utilisateur sans réécrire les pages publiques.",
    points: ["hub formations", "pages domaines", "curriculum dédié", "routes /learn"]
  },
  {
    icon: Eye,
    eyebrow: "Choix UX/UI",
    title: "Construire une interface dense, lisible et orientée progression.",
    text:
      "Le design reprend les codes de l'exemple initial en les généralisant : hero visuel, cartes de comparaison, filtres, états de leçon et navigation apprenant persistante.",
    points: ["cartes scannables", "filtres côté client", "CTA directs", "menus mobiles vérifiés"]
  },
  {
    icon: Palette,
    eyebrow: "Design system",
    title: "Un socle visuel cohérent avant l'accélération produit.",
    text:
      "Les tokens SCSS définissent la typographie, les espacements, rayons, ombres, couleurs light/dark, transitions et largeurs de conteneur pour éviter les variations page par page.",
    points: ["tokens globaux", "thèmes data-theme", "focus visible", "composants réutilisables"]
  },
  {
    icon: Database,
    eyebrow: "Stack technique",
    title: "Next.js App Router, TypeScript, MDX et data layer remplaçable.",
    text:
      "Les données sont encore statiques, mais les pages passent par lib/ et une abstraction data-source afin de remplacer plus tard les fichiers locaux par Supabase, un CMS ou une API.",
    points: ["Next.js App Router", "TypeScript", "MDX pédagogique", "Netlify-ready"]
  },
  {
    icon: Film,
    eyebrow: "Évolutions prévues",
    title: "Préparer l'admin, la recherche transversale et les contenus multi-domaines.",
    text:
      "La V1 sert de base pour un back-office, des progressions réelles, plus de contenus MDX, une recherche globale et des parcours spécialisés par domaine.",
    points: ["CMS/admin", "progression réelle", "recherche globale", "nouveaux domaines"]
  }
];

const productLayers = [
  {
    title: "Vitrine publique",
    text: "Accueil hub, catalogue filtrable, domaines, pages formation et CTA de démonstration."
  },
  {
    title: "Programme pédagogique",
    text: "Curriculum dédié, modules ordonnés, leçons, statuts preview/verrouillé et ressources principales."
  },
  {
    title: "Espace apprenant",
    text: "Dashboard, progression fictive, parcours /learn, sidebar de leçon et navigation précédent/suivant."
  },
  {
    title: "Socle contenu",
    text: "Types TypeScript, fichiers data, abstraction lib/data-source et premières leçons MDX multi-domaines."
  }
];

const multiRoleSections = [
  {
    icon: GraduationCap,
    title: "Espace apprenant",
    text:
      "Un suivi pédagogique centré sur la reprise de parcours, les ressources, les notes personnelles, les favoris et la progression locale.",
    points: ["dashboard dédié", "progression par parcours", "reprise de leçon", "ressources filtrables"]
  },
  {
    icon: SquarePen,
    title: "Espace enseignant",
    text:
      "Une interface de production pédagogique pour organiser les formations, structurer les modules et préparer les ressources.",
    points: ["gestion des formations", "Course Builder", "édition module/leçon", "apprenants fictifs"]
  },
  {
    icon: ShieldCheck,
    title: "Administration",
    text:
      "Un espace de supervision pour visualiser les utilisateurs, les domaines, les publications et les paramètres plateforme.",
    points: ["utilisateurs", "formations", "domaines", "paramètres"]
  },
  {
    icon: Database,
    title: "Architecture évolutive",
    text:
      "Les données sont mockées, mais les repositories préparent une migration vers une vraie auth, une base de progression et un CMS.",
    points: ["types partagés", "repositories", "permissions", "backend-ready"]
  }
];

const demoSurfaces = [
  {
    icon: Compass,
    title: "Hub formations",
    label: "Catalogue",
    metric: "4 parcours",
    text: "Recherche, domaines, fiches formation et accès rapide vers le parcours principal.",
    items: ["Création web", "WordPress", "AI Filmmaking"]
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard apprenant",
    label: "Progression",
    metric: "68%",
    text: "Vue synthétique sur les formations en cours, la prochaine leçon, les ressources et certificats.",
    items: ["Reprendre", "Ressources", "Certificats"]
  },
  {
    icon: Layers3,
    title: "Course Builder enseignant",
    label: "Structure",
    metric: "Modules",
    text: "Deux colonnes pour piloter les modules, sélectionner une leçon et éditer le contenu.",
    items: ["Module", "Leçon", "Preview"]
  },
  {
    icon: ShieldCheck,
    title: "Admin plateforme",
    label: "Supervision",
    metric: "Rôles",
    text: "Tableaux utilisateurs, formations, domaines et paramètres pour cadrer une future V1 SaaS.",
    items: ["Users", "Courses", "Settings"]
  }
];

const nextReasons = [
  {
    icon: Route,
    title: "App Router",
    text:
      "La séparation par routes rend les surfaces publiques, apprenant, enseignant et admin faciles à isoler et maintenir."
  },
  {
    icon: Waypoints,
    title: "Routes dynamiques",
    text:
      "Les domaines, formations, curriculums et leçons utilisent des segments dynamiques adaptés à un catalogue évolutif."
  },
  {
    icon: LayoutDashboard,
    title: "Serveur et client",
    text:
      "Les pages lisent les données côté serveur, tandis que les interactions locales restent dans des composants client ciblés."
  },
  {
    icon: BookOpen,
    title: "MDX pédagogique",
    text:
      "Les leçons peuvent évoluer vers des contenus éditoriaux structurés, versionnés et compatibles avec un CMS."
  },
  {
    icon: Palette,
    title: "Design system",
    text:
      "Les tokens SCSS, composants et états communs donnent une base cohérente aux espaces multi-rôles."
  },
  {
    icon: Database,
    title: "SaaS pédagogique",
    text:
      "Les repositories, types et permissions préparent l'auth, la progression réelle et l'administration connectée."
  }
];

const stackItems = [
  "Next.js App Router",
  "TypeScript",
  "SCSS tokens",
  "MDX",
  "Lucide icons",
  "Netlify build",
  "Data layer statique",
  "Architecture CMS-ready"
];

export default function CaseStudyPage() {
  return (
    <>
      <section className="section-shell page-hero">
        <div className="domain-hero case-study-hero">
          <div className="domain-hero__content">
            <span className="eyebrow w-fit">
              <Sparkles size={14} aria-hidden="true" />
              Étude de cas REKODE
            </span>
            <h1>LearnIt, une plateforme de formation conçue comme preuve produit.</h1>
            <p>
              REKODE a transformé LearnIt en démonstrateur complet : catalogue public, fiches formation,
              curriculum, espace apprenant, leçons MDX et architecture prête pour un futur back-office.
            </p>

            <div className="case-study-metrics" aria-label="Indicateurs du projet LearnIt">
              {heroMetrics.map((metric) => (
                <div key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn btn-primary" href="/formations">
                Explorer LearnIt
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link className="btn btn-secondary" href="/learn/formation-creation-web">
                Voir l'espace apprenant
              </Link>
            </div>
          </div>

          <div className="domain-hero__media">
            <Image
              alt="Interface LearnIt utilisée comme étude de cas REKODE"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
              src="/images/learnit-hub-hero.png"
            />
          </div>
        </div>
      </section>

      <section className="section-shell content-section">
        <div className="section-intro">
          <div>
            <span className="eyebrow w-fit">Vue d'ensemble</span>
            <h2>Un produit pédagogique présenté comme un actif commercial.</h2>
          </div>
          <p>
            La page documente les décisions produit, UX, design et techniques qui rendent LearnIt crédible
            comme plateforme de formation et comme référence portfolio REKODE.
          </p>
        </div>

        <div className="case-section-grid">
          {caseSections.map((section) => {
            const Icon = section.icon;

            return (
              <article className="case-section-card" key={section.eyebrow}>
                <span className="icon-badge">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <p className="case-section-card__eyebrow">{section.eyebrow}</p>
                <h3>{section.title}</h3>
                <p>{section.text}</p>
                <ul>
                  {section.points.map((point) => (
                    <li key={point}>
                      <CheckCircle2 size={15} aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell content-section">
        <div className="section-intro">
          <div>
            <span className="eyebrow w-fit">Architecture produit</span>
            <h2>Une plateforme structurée en couches lisibles.</h2>
          </div>
          <p>
            Chaque couche peut évoluer séparément : la vitrine peut vendre, le curriculum peut s'enrichir,
            l'espace apprenant peut connecter une vraie progression et le socle contenu peut basculer vers un CMS.
          </p>
        </div>

        <div className="case-layer-grid">
          {productLayers.map((layer, index) => (
            <article className="case-layer-card" key={layer.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{layer.title}</h3>
              <p>{layer.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell content-section">
        <div className="section-intro">
          <div>
            <span className="eyebrow w-fit">Application multi-rôles</span>
            <h2>Une même base produit, trois espaces applicatifs distincts.</h2>
          </div>
          <p>
            LearnIt ne se limite pas à une vitrine. Le projet expose déjà les principaux rôles d'une
            plateforme pédagogique : apprendre, produire les contenus et superviser l'ensemble.
          </p>
        </div>

        <div className="case-role-grid">
          {multiRoleSections.map((section) => {
            const Icon = section.icon;

            return (
              <article className="case-role-card" key={section.title}>
                <span className="icon-badge">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <h3>{section.title}</h3>
                <p>{section.text}</p>
                <ul>
                  {section.points.map((point) => (
                    <li key={point}>
                      <CheckCircle2 size={15} aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell content-section">
        <div className="section-intro">
          <div>
            <span className="eyebrow w-fit">Blocs de démonstration</span>
            <h2>Des captures simulées pour présenter rapidement la profondeur produit.</h2>
          </div>
          <p>
            Ces cartes résument les écrans clés à montrer à un prospect ou recruteur : le hub, le
            suivi apprenant, le builder enseignant et la supervision admin.
          </p>
        </div>

        <div className="case-demo-grid">
          {demoSurfaces.map((surface) => {
            const Icon = surface.icon;

            return (
              <article className="case-demo-card" key={surface.title}>
                <div className="case-demo-card__preview" aria-hidden="true">
                  <div>
                    <span>{surface.label}</span>
                    <strong>{surface.metric}</strong>
                  </div>
                  <div className="case-demo-card__bars">
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="case-demo-card__chips">
                    {surface.items.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
                <div className="case-demo-card__content">
                  <span className="icon-badge">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3>{surface.title}</h3>
                  <p>{surface.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell content-section">
        <div className="section-intro">
          <div>
            <span className="eyebrow w-fit">Pourquoi Next.js</span>
            <h2>Un choix pragmatique pour une plateforme pédagogique évolutive.</h2>
          </div>
          <p>
            Next.js permet de combiner pages publiques, expérience connectée, contenus pédagogiques
            et futures données SaaS sans multiplier les socles techniques.
          </p>
        </div>

        <div className="case-next-grid">
          {nextReasons.map((reason) => {
            const Icon = reason.icon;

            return (
              <article className="case-next-card" key={reason.title}>
                <Icon size={20} aria-hidden="true" />
                <h3>{reason.title}</h3>
                <p>{reason.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section-shell content-section">
        <div className="section-heading-row">
          <div>
            <span className="eyebrow w-fit">Stack technique</span>
            <h2>Une base V1 simple, mais déjà remplaçable.</h2>
            <p>
              Le choix technique privilégie la maintenabilité : pas de dépendance prématurée à un back-office,
              mais une structure pensée pour intégrer progressivement authentification, CMS et progression réelle.
            </p>
          </div>
        </div>

        <div className="case-stack-grid" aria-label="Technologies et fondations du projet">
          {stackItems.map((item) => (
            <div className="case-stack-item" key={item}>
              <CheckCircle2 size={16} aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell content-section">
        <div className="case-portfolio-band">
          <div>
            <span className="eyebrow w-fit">Projet conçu par REKODE</span>
            <h2>LearnIt démontre une capacité complète : stratégie produit, interface, contenus et architecture.</h2>
            <p>
              Le projet peut être présenté comme une preuve commerciale concrète : REKODE ne livre pas seulement
              des pages, mais un système pédagogique extensible, exploitable et prêt à devenir une plateforme réelle.
            </p>
            <Link className="btn btn-primary" href="/formations/formation-creation-web">
              Voir la démo complète
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="case-portfolio-grid" aria-label="Ce que LearnIt démontre pour REKODE">
            {portfolioSignals.map((signal) => {
              const Icon = signal.icon;

              return (
                <article className="case-portfolio-item" key={signal.title}>
                  <Icon size={20} aria-hidden="true" />
                  <h3>{signal.title}</h3>
                  <p>{signal.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
