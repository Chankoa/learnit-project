import { lessonContentById } from "@/content/lessons";
import type { Lesson, LessonContentDocument } from "@/types/learning";

function buildFallbackContent(lesson: Lesson): LessonContentDocument {
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
