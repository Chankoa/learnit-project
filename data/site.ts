import type { AudienceProfile, HeroStat, LearningModule, SiteConfig } from "@/types/site";

export const siteConfig = {
  name: "LearnIt",
  tagline: "by REKODE",
  description:
    "Une plateforme de formations pratiques pour apprendre, créer et concrétiser des projets web et créatifs.",
  nav: [
    { label: "Formations", href: "/formations" },
    { label: "Domaines", href: "/#domaines" },
    { label: "Ressources", href: "/#ressources" },
    { label: "À propos", href: "/#apropos" },
    { label: "Contact", href: "/#contact" }
  ],
  footer: [
    {
      title: "Formation",
      links: ["Parcours création web", "Programme", "Certificat", "Coaching"]
    },
    {
      title: "Ressources",
      links: ["Modules", "Guides", "Exercices", "Templates"]
    },
    {
      title: "Légal",
      links: ["Confidentialité", "Conditions", "Contact"]
    }
  ]
} satisfies SiteConfig;

export const heroStats = [
  { label: "10 jours", detail: "de formation", icon: "clock" },
  { label: "70+", detail: "leçons vidéo", icon: "video" },
  { label: "1 projet", detail: "final complet", icon: "project" },
  { label: "Certificat", detail: "de réussite", icon: "certificate" }
] satisfies HeroStat[];

export const audienceProfiles = [
  {
    title: "Débutants",
    text: "Aucune expérience requise, on part de zéro.",
    icon: "sparkles"
  },
  {
    title: "Entrepreneurs",
    text: "Lancez votre site et développez votre activité.",
    icon: "briefcase"
  },
  {
    title: "Freelances",
    text: "Ajoutez une nouvelle compétence à votre offre.",
    icon: "wand"
  },
  {
    title: "Passionnés",
    text: "Apprenez à créer des sites modernes et utiles.",
    icon: "heart"
  }
] satisfies AudienceProfile[];

export const learningModules = [
  { title: "Jour 1 - Introduction", status: "Terminé" },
  { title: "Jour 2 - HTML & Structure", status: "Terminé" },
  { title: "Jour 4 - CSS & Mise en forme", status: "En cours" }
] satisfies LearningModule[];
