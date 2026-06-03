import type { Domain } from "@/types/course";

export const webCreationDomain = {
  id: "domain-web-creation",
  slug: "creation-web",
  name: "Création web",
  description: "Concevoir, développer et publier des sites web modernes.",
  icon: "code",
  order: 1
} satisfies Domain;

export const aiFilmmakingDomain = {
  id: "domain-ai-filmmaking",
  slug: "creation-audiovisuelle-ia",
  name: "Création audiovisuelle IA",
  description: "Imaginer, produire et monter des contenus vidéo avec des outils IA.",
  icon: "film",
  order: 2
} satisfies Domain;

export const domains = [webCreationDomain, aiFilmmakingDomain] satisfies Domain[];
