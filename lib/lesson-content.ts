import { lessonContentById } from "@/content/lessons";
import type { Lesson, LessonContentDocument } from "@/types/learning";

function splitContentParagraphs(value: string) {
  return value
    .split(/\n{2,}/)
    .map((item) => item.replace(/^#+\s*/, "").trim())
    .filter(Boolean);
}

function buildFallbackContent(lesson: Lesson): LessonContentDocument {
  if (lesson.content?.trim()) {
    const paragraphs = splitContentParagraphs(lesson.content);
    const [lead, ...rest] = paragraphs;

    return {
      lead: lead ?? lesson.description ?? `Cette lecon presente ${lesson.title}.`,
      sections: [
        {
          id: "contenu",
          title: "Contenu de la lecon",
          paragraphs: rest.length > 0 ? rest : [lesson.description ?? "Contenu en preparation."],
          points: lesson.objectives
        }
      ],
      exercise: {
        title: `Mettre en pratique : ${lesson.title}`,
        description: "Appliquez la notion sur votre projet et conservez une trace du resultat.",
        steps: ["Relisez les points cles.", "Appliquez la methode.", "Notez ce qui reste a clarifier."],
        deliverable: `Une trace verifiable du travail realise pour « ${lesson.title} ».`
      }
    };
  }

  return {
    lead: lesson.description ?? "Cette leçon présente les notions essentielles à appliquer dans votre parcours.",
    sections: [
      {
        id: "comprendre",
        title: "Comprendre l'objectif",
        paragraphs: [lesson.description ?? "Identifiez le résultat attendu avant de commencer."],
        points: lesson.objectives
      },
      {
        id: "appliquer",
        title: "Passer à la pratique",
        paragraphs: ["Réalisez une première version vérifiable, puis notez les améliorations à poursuivre."]
      }
    ],
    exercise: {
      title: `Mettre en pratique : ${lesson.title}`,
      description: "Appliquez la notion sur votre projet et conservez une trace du résultat.",
      steps: ["Reformulez l'objectif.", "Réalisez une première version.", "Vérifiez le résultat."],
      deliverable: `Une version vérifiable du travail réalisé pour « ${lesson.title} ».`
    }
  };
}

export function getLessonContent(lesson: Lesson) {
  return lessonContentById[lesson.id] ?? buildFallbackContent(lesson);
}
