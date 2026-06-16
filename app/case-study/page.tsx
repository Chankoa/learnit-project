import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Layers3, Rocket, Sparkles } from "lucide-react";

import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Étude de cas REKODE",
  description:
    "Découvrez comment LearnIt structure une plateforme de formations multi-domaines pour passer d'un catalogue statique à une architecture prête pour un CMS.",
  path: "/case-study",
  image: "/images/learnit-hub-hero.png"
});

const outcomes = [
  "Architecture multi-formations avec types, données statiques et couche lib remplaçable.",
  "Catalogue filtrable par domaine, niveau, format, durée et disponibilité.",
  "Parcours apprenant, leçons MDX et ressources pédagogiques prêtes à évoluer.",
  "Préparation Netlify, metadata Next.js et modèle futur back-office."
];

export default function CaseStudyPage() {
  return (
    <>
      <section className="section-shell page-hero">
        <div className="domain-hero">
          <div className="domain-hero__content">
            <span className="eyebrow w-fit">
              <Sparkles size={14} aria-hidden="true" />
              Étude de cas
            </span>
            <h1>REKODE structure LearnIt comme une plateforme de formation évolutive.</h1>
            <p>
              Le projet transforme une démonstration centrée sur une formation web en une base V1
              multi-domaines, maintenable et prête pour une future administration de contenus.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="btn btn-primary" href="/formations">
                Explorer le catalogue
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link className="btn btn-secondary" href="/formations/formation-creation-web">
                Voir la formation web
              </Link>
            </div>
          </div>

          <div className="domain-hero__media">
            <Image
              alt="Interface LearnIt utilisée dans l'étude de cas REKODE"
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
            <span className="eyebrow w-fit">Résultat V1</span>
            <h2>Une base claire avant CMS, admin et production élargie.</h2>
          </div>
          <p>
            LearnIt peut déjà présenter ses parcours, filtrer le catalogue, afficher un curriculum
            détaillé et servir des leçons riches sans dépendre d'un back-office.
          </p>
        </div>

        <div className="value-grid">
          <article className="value-card">
            <span className="icon-badge">
              <Layers3 size={19} aria-hidden="true" />
            </span>
            <h3>Modèle multi-domaines</h3>
            <p>Les formations web, WordPress, AI Filmmaking et Prompt Design partagent le même socle.</p>
          </article>
          <article className="value-card">
            <span className="icon-badge icon-badge--cyan">
              <CheckCircle2 size={19} aria-hidden="true" />
            </span>
            <h3>Expérience vérifiable</h3>
            <p>Les pages catalogue, domaine, formation, curriculum et leçon sont générées par Next.js.</p>
          </article>
          <article className="value-card">
            <span className="icon-badge icon-badge--pink">
              <Rocket size={19} aria-hidden="true" />
            </span>
            <h3>Préparation production</h3>
            <p>La structure reste compatible avec Netlify, MDX et une future source CMS.</p>
          </article>
        </div>
      </section>

      <section className="section-shell content-section course-content-section">
        <span className="eyebrow w-fit">Livrables</span>
        <h2>Ce que la V1 stabilise</h2>
        <div className="mt-6 grid gap-3">
          {outcomes.map((outcome) => (
            <div className="profile-card flex items-start gap-3 p-4" key={outcome}>
              <CheckCircle2 className="mt-1 text-accent" size={18} aria-hidden="true" />
              <p className="text-sm font-semibold text-text-strong">{outcome}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
