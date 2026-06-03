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
    title: "Memo HTML essentiel",
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
    description: "Controle final avant publication : SEO, accessibilite, performances et formulaires.",
    fileName: "checklist-mise-en-ligne.pdf",
    access: "enrolled",
    tags: ["netlify", "seo", "publication"]
  }
] satisfies Resource[];

export const aiFilmmakingResources = [
  {
    id: "resource-ai-shotlist",
    title: "Mini shotlist IA",
    type: "template",
    href: "/resources/mini-shotlist-ia.pdf",
    description: "Une fiche simple pour preparer une sequence courte generee avec l'IA.",
    fileName: "mini-shotlist-ia.pdf",
    access: "free",
    tags: ["ia", "preproduction", "shotlist"]
  },
  {
    id: "resource-ai-prompt-bank",
    title: "Banque de prompts video",
    type: "download",
    href: "/resources/banque-prompts-video.pdf",
    description: "Exemples de prompts pour decrire le style, le mouvement camera et l'ambiance.",
    fileName: "banque-prompts-video.pdf",
    access: "free",
    tags: ["ia", "prompt", "video"]
  }
] satisfies Resource[];

export const instructors = [
  {
    id: "instructor-rexcode-web",
    name: "Equipe REXCODE",
    role: "Mentor creation web",
    bio: "Accompagnement pratique pour apprendre a structurer, coder et publier des projets web.",
    specialties: ["HTML", "CSS", "Next.js", "Netlify"],
    links: [{ label: "Site", href: "https://rexcode.dev" }]
  },
  {
    id: "instructor-ai-studio",
    name: "Studio IA",
    role: "Guide AI filmmaking",
    bio: "Initiation aux workflows courts de preproduction, generation et montage assiste par IA.",
    specialties: ["Prompt video", "Storyboard", "Montage IA"]
  }
] satisfies Instructor[];

export const webCourseFAQ = [
  {
    id: "faq-web-prerequis",
    question: "Faut-il deja savoir coder ?",
    answer: "Non. La formation part des bases et avance vers un projet web complet.",
    category: "prerequis",
    order: 1
  },
  {
    id: "faq-web-projet-final",
    question: "Quel projet vais-je construire ?",
    answer: "Vous construirez une page web professionnelle, responsive et deployable sur Netlify.",
    category: "projet",
    order: 2
  },
  {
    id: "faq-web-outils",
    question: "Quels outils sont utilises ?",
    answer: "La formation utilise HTML, CSS, TypeScript, Next.js, Tailwind, Git et Netlify.",
    category: "outils",
    order: 3
  }
] satisfies FAQItem[];

export const aiFilmmakingFAQ = [
  {
    id: "faq-ai-demo",
    question: "Cette formation est-elle complete ?",
    answer: "Cette fiche est une demonstration courte du format AI Filmmaking Foundations.",
    category: "format",
    order: 1
  }
] satisfies FAQItem[];

export const resources = [...webResources, ...aiFilmmakingResources] satisfies Resource[];
