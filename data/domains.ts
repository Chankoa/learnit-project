import type { Domain } from "@/types/course";

export const webCreationDomain = {
  id: "domain-web-creation",
  slug: "creation-web",
  name: "Creation web",
  description: "Concevoir, developper et publier des sites web modernes.",
  icon: "code",
  order: 1
} satisfies Domain;

export const aiFilmmakingDomain = {
  id: "domain-ai-filmmaking",
  slug: "creation-audiovisuelle-ia",
  name: "Creation audiovisuelle IA",
  description: "Imaginer, produire et monter des contenus video avec des outils IA.",
  icon: "film",
  order: 2
} satisfies Domain;

export const domains = [webCreationDomain, aiFilmmakingDomain] satisfies Domain[];
