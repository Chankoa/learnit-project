import type { AudienceProfile, HeroStat, LearningModule, SiteConfig } from "@/types/site";

export const siteConfig = {
  name: "LearnIt",
  tagline: "by REXCODE",
  description: "Une formation intensive et pratique pour apprendre, creer et lancer des projets web professionnels.",
  nav: [
    { label: "Formations", href: "#formations" },
    { label: "Domaines", href: "#domaines" },
    { label: "Ressources", href: "#ressources" },
    { label: "À propos", href: "#apropos" },
    { label: "Contact", href: "#contact" }
  ],
  footer: [
    {
      title: "Formation",
      links: ["Parcours creation web", "Programme", "Certificat", "Coaching"]
    },
    {
      title: "Ressources",
      links: ["Modules", "Guides", "Exercices", "Templates"]
    },
    {
      title: "Legal",
      links: ["Confidentialite", "Conditions", "Contact"]
    }
  ]
} satisfies SiteConfig;

export const heroStats = [
  { label: "10 jours", detail: "de formation", icon: "clock" },
  { label: "70+", detail: "lecons video", icon: "video" },
  { label: "1 projet", detail: "final complet", icon: "project" },
  { label: "Certificat", detail: "de reussite", icon: "certificate" }
] satisfies HeroStat[];

export const audienceProfiles = [
  {
    title: "Debutants",
    text: "Aucune experience requise, on part de zero.",
    icon: "sparkles"
  },
  {
    title: "Entrepreneurs",
    text: "Lancez votre site et developpez votre activite.",
    icon: "briefcase"
  },
  {
    title: "Freelances",
    text: "Ajoutez une nouvelle competence a votre offre.",
    icon: "wand"
  },
  {
    title: "Passionnes",
    text: "Apprenez a creer des sites modernes et utiles.",
    icon: "heart"
  }
] satisfies AudienceProfile[];

export const learningModules = [
  { title: "Jour 1 - Introduction", status: "Termine" },
  { title: "Jour 2 - HTML & Structure", status: "Termine" },
  { title: "Jour 4 - CSS & Mise en forme", status: "En cours" }
] satisfies LearningModule[];
