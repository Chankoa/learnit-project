import type { LessonContentDocument } from "@/types/learning";

export const lessonContentById: Record<string, LessonContentDocument> = {
  "lesson-web-brief": {
    lead:
      "Un brief utile transforme une idée générale en décisions concrètes pour la structure, les contenus et les priorités du site.",
    sections: [
      {
        id: "intention",
        title: "Partir de l'intention du projet",
        paragraphs: [
          "Commencez par formuler le résultat attendu en une phrase. Le site peut informer, rassurer, générer des demandes ou vendre une offre, mais chaque page doit servir cet objectif principal.",
          "Décrivez ensuite la personne à laquelle le projet s'adresse. Ses attentes, ses objections et son niveau de connaissance orientent le vocabulaire et la hiérarchie des contenus."
        ],
        points: ["Un objectif principal", "Une cible identifiable", "Une action prioritaire"]
      },
      {
        id: "perimetre",
        title: "Fixer un périmètre réaliste",
        paragraphs: [
          "Listez les pages indispensables avant les fonctionnalités secondaires. Un périmètre court facilite la production et permet de tester plus vite une première version cohérente."
        ],
        points: ["Pages essentielles", "Contenus disponibles", "Contraintes techniques", "Échéance"]
      }
    ],
    exercise: {
      title: "Rédiger le brief de votre projet",
      description: "Préparez une version courte qui pourra guider les prochaines leçons.",
      steps: [
        "Décrivez le projet et son objectif principal en deux phrases.",
        "Présentez la cible et son besoin prioritaire.",
        "Listez les trois à cinq pages indispensables.",
        "Définissez l'action principale attendue sur le site."
      ],
      deliverable: "Un brief d'une page, prêt à être utilisé pour construire l'arborescence."
    }
  },
  "lesson-web-html-structure": {
    lead:
      "Une structure HTML sémantique rend la page plus simple à comprendre, à maintenir et à parcourir avec les technologies d'assistance.",
    sections: [
      {
        id: "structure",
        title: "Donner un rôle clair à chaque zone",
        paragraphs: [
          "Utilisez les éléments HTML selon leur fonction et non selon leur apparence. Le header regroupe l'identité et la navigation, main contient le sujet principal, section rassemble un ensemble cohérent et footer porte les informations de fin de page.",
          "Cette structure crée des repères stables pour le navigateur, les moteurs de recherche et les lecteurs d'écran."
        ],
        points: ["Un seul contenu principal", "Des sections nommées", "Une navigation identifiable"]
      },
      {
        id: "hierarchie",
        title: "Construire une hiérarchie de titres",
        paragraphs: [
          "Le titre de niveau 1 annonce le sujet de la page. Les niveaux suivants organisent les grandes parties sans sauter arbitrairement d'un niveau à l'autre.",
          "Relisez uniquement les titres : ils doivent résumer le parcours de lecture sans dépendre des paragraphes."
        ],
        points: ["Un h1 descriptif", "Des h2 pour les sections", "Des h3 pour les sous-parties"]
      },
      {
        id: "controle",
        title: "Vérifier la structure avant le style",
        paragraphs: [
          "Avant d'ajouter du CSS, parcourez la page sans mise en forme. L'ordre des contenus, les liens et les boutons doivent rester compréhensibles."
        ]
      }
    ],
    exercise: {
      title: "Assembler une page sémantique",
      description: "Créez le squelette HTML de la page principale définie dans votre wireframe.",
      steps: [
        "Ajoutez le header, la navigation, le contenu principal et le footer.",
        "Découpez le contenu principal en sections cohérentes.",
        "Écrivez une hiérarchie de titres complète.",
        "Contrôlez l'ordre de lecture au clavier et sans CSS."
      ],
      deliverable: "Un fichier HTML structuré, lisible et prêt à recevoir les contenus définitifs."
    }
  },
  "lesson-ai-film-concept": {
    lead:
      "Une séquence générative convaincante commence par une intention simple, un format court et un nombre limité de plans à produire.",
    sections: [
      {
        id: "intention",
        title: "Formuler l'intention",
        paragraphs: [
          "Décrivez l'émotion ou l'idée que la séquence doit transmettre avant de choisir un outil. Cette phrase sert de filtre pour toutes les décisions visuelles.",
          "Évitez de cumuler trop de sujets, de styles ou de mouvements. Une contrainte claire améliore la cohérence des générations."
        ],
        points: ["Un sujet", "Une émotion", "Un parti pris visuel"]
      },
      {
        id: "format",
        title: "Choisir un format court",
        paragraphs: [
          "Pour une première démonstration, visez une séquence de quinze à trente secondes composée de trois à cinq plans. Ce format permet d'itérer sans multiplier les coûts et les incohérences."
        ],
        points: ["Durée cible", "Format d'image", "Nombre de plans", "Destination de la vidéo"]
      }
    ],
    exercise: {
      title: "Préparer une mini shotlist",
      description: "Transformez votre intention en une courte liste de plans générables.",
      steps: [
        "Écrivez l'intention de la vidéo en une phrase.",
        "Choisissez le format et la durée.",
        "Décrivez trois à cinq plans avec sujet, cadrage et mouvement.",
        "Vérifiez qu'un même style relie toute la séquence."
      ],
      deliverable: "Une mini shotlist prête à servir de base aux futurs prompts vidéo."
    }
  }
};
