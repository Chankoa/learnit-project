import Link from "next/link";
import { Award, Clock, Code2, Play, Trophy, Video } from "lucide-react";

import { getHeroStats, getSiteConfig } from "@/lib/site";

const statIcons = {
  clock: Clock,
  video: Video,
  project: Trophy,
  certificate: Award
};

export function HeroSection() {
  const heroStats = getHeroStats();
  const siteConfig = getSiteConfig();

  return (
    <section className="section-shell py-8 md:py-12" id="formations">
      <div className="hero-card grid gap-10 p-5 md:grid-cols-[1fr_0.92fr] md:p-10">
        <div className="flex flex-col justify-center">
          <span className="eyebrow w-fit">
            <Code2 size={14} aria-hidden="true" />
            Parcours création web
          </span>

          <h1 className="mt-6 max-w-2xl text-4xl font-black leading-tight text-text-strong md:text-[3.25rem]">
            Apprenez. Créez. Lancez{" "}
            <span className="text-accent">vos projets web.</span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-text-muted md:text-lg">{siteConfig.description}</p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {heroStats.map((stat) => {
              const Icon = statIcons[stat.icon];

              return (
                <div className="flex items-center gap-3" key={stat.label}>
                  <span className="icon-badge h-9 w-9">
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold text-text-strong">{stat.label}</span>
                    <span className="block text-xs text-text-muted">{stat.detail}</span>
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="btn btn-primary" href="#programme">
              Découvrir la formation
            </Link>
            <Link className="btn btn-secondary" href="#programme">
              Voir le programme
            </Link>
          </div>
        </div>

        <div className="hero-media" aria-label="Aperçu vidéo de la formation Learn It">
          <div className="hero-media-grid" aria-hidden="true" />
          <button className="play-button" type="button" aria-label="Lire l'aperçu vidéo">
            <Play fill="currentColor" size={30} aria-hidden="true" />
          </button>
          <div className="laptop-preview" aria-hidden="true">
            <div className="laptop-bar">
              <span className="laptop-dot" />
              <span className="laptop-dot" />
              <span className="laptop-dot" />
            </div>
            <div className="code-lines">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
