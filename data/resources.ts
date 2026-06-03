import type { FAQItem, Instructor, Resource } from "@/types/resource";

export const webResources = [
  {
    id: "resource-web-brief-checklist",
    title: "Checklist du brief projet",
    type: "template",
    href: "/resources/checklist-brief-projet.pdf",
    description: "Une trame pour cadrer l'objectif, la cible, les pages et les contraintes du site.",
    fileName: "checklist-brief-projet.pdf",
    access: "enrolled",
    tags: ["brief", "strategie", "projet"]
  },
  {
    id: "resource-web-html-cheatsheet",
    title: "Mémo HTML essentiel",
    type: "download",
    href: "/resources/memo-html-essentiel.pdf",
    description: "Les balises HTML les plus utiles pour structurer une page claire et accessible.",
    fileName: "memo-html-essentiel.pdf",
    access: "enrolled",
    tags: ["html", "structure"]
  },
  {
    id: "resource-web-css-layout-kit",
    title: "Kit Flexbox et Grid",
    type: "exercise",
    href: "/resources/kit-flexbox-grid.zip",
    description: "Exercices courts pour pratiquer les mises en page responsives.",
    fileName: "kit-flexbox-grid.zip",
    access: "enrolled",
    tags: ["css", "responsive", "layout"]
  },
  {
    id: "resource-web-next-starter",
    title: "Starter Next.js Learn It",
    type: "template",
    href: "/resources/next-starter-learnit.zip",
    description: "Base de projet Next.js avec App Router, TypeScript, Tailwind et Sass.",
    fileName: "next-starter-learnit.zip",
    access: "premium",
    tags: ["nextjs", "typescript", "starter"]
  },
  {
    id: "resource-web-launch-checklist",
    title: "Checklist mise en ligne",
    type: "download",
    href: "/resources/checklist-mise-en-ligne.pdf",
    description: "Contrôle final avant publication : SEO, accessibilité, performances et formulaires.",
    fileName: "checklist-mise-en-ligne.pdf",
    access: "enrolled",
    tags: ["netlify", "seo", "publication"]
  },
  {
    id: "resource-web-final-project-guide",
    title: "Guide du projet final",
    type: "download",
    href: "/resources/guide-projet-final-web.pdf",
    description: "Un guide pour assembler le brief, la structure, les composants, les tests et la publication.",
    fileName: "guide-projet-final-web.pdf",
    access: "premium",
    tags: ["projet final", "portfolio", "livraison"]
  }
] satisfies Resource[];

export const aiFilmmakingResources = [
  {
    id: "resource-ai-shotlist",
    title: "Mini shotlist IA",
    type: "template",
    href: "/resources/mini-shotlist-ia.pdf",
    description: "Une fiche simple pour préparer une séquence courte générée avec l'IA.",
    fileName: "mini-shotlist-ia.pdf",
    access: "free",
    tags: ["ia", "preproduction", "shotlist"]
  },
  {
    id: "resource-ai-prompt-bank",
    title: "Banque de prompts vidéo",
    type: "download",
    href: "/resources/banque-prompts-video.pdf",
    description: "Exemples de prompts pour décrire le style, le mouvement caméra et l'ambiance.",
    fileName: "banque-prompts-video.pdf",
    access: "free",
    tags: ["ia", "prompt", "video"]
  }
] satisfies Resource[];

export const instructors = [
  {
    id: "instructor-rexcode-web",
    name: "Équipe REXCODE",
    role: "Mentor création web",
    bio: "Accompagnement pratique pour apprendre à structurer, coder et publier des projets web.",
    specialties: ["HTML", "CSS", "Next.js", "Netlify"],
    links: [{ label: "Site", href: "https://rexcode.dev" }]
  },
  {
    id: "instructor-ai-studio",
    name: "Studio IA",
    role: "Guide AI filmmaking",
    bio: "Initiation aux workflows courts de préproduction, génération et montage assisté par IA.",
    specialties: ["Prompt vidéo", "Storyboard", "Montage IA"]
  }
] satisfies Instructor[];

export const webCourseFAQ = [
  {
    id: "faq-web-prerequis",
    question: "Faut-il déjà savoir coder ?",
    answer: "Non. La formation part des bases et avance vers un projet web complet.",
    category: "prerequis",
    order: 1
  },
  {
    id: "faq-web-projet-final",
    question: "Quel projet vais-je construire ?",
    answer: "Vous construirez une page web professionnelle, responsive et déployable sur Netlify.",
    category: "projet",
    order: 2
  },
  {
    id: "faq-web-outils",
    question: "Quels outils sont utilisés ?",
    answer: "La formation utilise HTML, CSS, TypeScript, Next.js, Tailwind, Git et Netlify.",
    category: "outils",
    order: 3
  },
  {
    id: "faq-web-duree",
    question: "Combien de temps faut-il prévoir ?",
    answer: "Le programme représente environ 13 heures de contenu et de pratique guidée, à répartir selon votre rythme.",
    category: "format",
    order: 4
  },
  {
    id: "faq-web-livrable",
    question: "Est-ce que je repars avec un livrable concret ?",
    answer: "Oui. L'objectif est de finaliser un site web responsive, structuré et prêt à être présenté ou publié.",
    category: "projet",
    order: 5
  },
  {
    id: "faq-web-netlify",
    question: "Le déploiement est-il inclus ?",
    answer: "Oui. Le dernier module couvre les contrôles qualité et la publication du projet sur Netlify.",
    category: "publication",
    order: 6
  }
] satisfies FAQItem[];

export const aiFilmmakingFAQ = [
  {
    id: "faq-ai-demo",
    question: "Cette formation est-elle complète ?",
    answer: "Cette fiche est une démonstration courte du format AI Filmmaking Foundations.",
    category: "format",
    order: 1
  }
] satisfies FAQItem[];

export const resources = [...webResources, ...aiFilmmakingResources] satisfies Resource[];
