import { lessonContentById } from "@/content/lessons";
import {
  getCourseById,
  getCourseBySlug,
  getCourseLessons,
  getCourseModules
} from "@/lib/courses";
import {
  getAllCourseProgress,
  getCourseProgress
} from "@/lib/progress";
import type { CourseModule } from "@/types/course";
import type {
  Lesson,
  LessonContentDocument,
  LessonStatus
} from "@/types/learning";

function getEffectiveLessonStatus(
  lesson: Lesson,
  completedLessons: string[],
  currentLessonId: string
): LessonStatus {
  if (completedLessons.includes(lesson.id)) {
    return "completed";
  }

  if (lesson.id === currentLessonId) {
    return "in-progress";
  }

  return lesson.status ?? "available";
}

function isLessonAccessible(lesson: Lesson) {
  return lesson.status !== "locked";
}

function buildFallbackContent(lesson: Lesson): LessonContentDocument {
  const objectives = lesson.objectives ?? [];

  return {
    lead:
      lesson.description ??
      "Cette leçon présente les notions essentielles à appliquer dans la prochaine étape du parcours.",
    sections: [
      {
        id: "comprendre",
        title: "Comprendre l'objectif",
        paragraphs: [
          lesson.description ??
            "Prenez le temps d'identifier le résultat attendu avant de commencer la mise en pratique.",
          "Reliez cette étape au projet fil rouge de la formation et notez les décisions qui devront être réutilisées dans les prochaines leçons."
        ],
        points: objectives.length > 0 ? objectives : undefined
      },
      {
        id: "appliquer",
        title: "Passer à la pratique",
        paragraphs: [
          "Travaillez sur une version courte et vérifiable. Une première réalisation claire est plus utile qu'un résultat trop large difficile à relire.",
          "Terminez par un contrôle rapide : objectif atteint, contenu compréhensible et prochaine action identifiée."
        ]
      }
    ],
    exercise: {
      title: `Mettre en pratique : ${lesson.title}`,
      description: "Appliquez la notion sur votre projet et conservez une trace du résultat.",
      steps: [
        "Reformulez l'objectif de la leçon avec vos propres mots.",
        "Réalisez une première version sur votre projet.",
        "Comparez le résultat avec les objectifs annoncés.",
        "Notez une amélioration à traiter dans l'étape suivante."
      ],
      deliverable: `Une version vérifiable du travail réalisé pour « ${lesson.title} ».`
    }
  };
}

export function getLearningCourseStaticParams() {
  return getAllCourseProgress()
    .map((progress) => {
      const course = getCourseById(progress.courseId);

      return course ? { courseSlug: course.slug } : undefined;
    })
    .filter((item): item is { courseSlug: string } => Boolean(item));
}

export function getLearningCourseData(courseSlug: string) {
  const course = getCourseBySlug(courseSlug);

  if (!course) {
    return undefined;
  }

  const progress = getCourseProgress(course.id);

  if (!progress) {
    return undefined;
  }

  const modules = getCourseModules(course.id).map((module) => ({
    ...module,
    lessons: module.lessons.map((lesson) => ({
      ...lesson,
      status: getEffectiveLessonStatus(
        lesson,
        progress.completedLessons,
        progress.currentLessonId
      )
    }))
  })) satisfies CourseModule[];
  const lessons = modules.flatMap((module) => module.lessons);
  const completedCount = lessons.filter((lesson) => lesson.status === "completed").length;
  const currentLesson =
    lessons.find((lesson) => lesson.id === progress.currentLessonId) ??
    lessons.find(isLessonAccessible);

  return {
    course,
    progress,
    modules,
    lessons,
    currentLesson,
    completedCount,
    totalLessons: lessons.length,
    percentage: lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0
  };
}

export function getLearningLessonStaticParams() {
  return getAllCourseProgress().flatMap((progress) => {
    const course = getCourseById(progress.courseId);

    if (!course) {
      return [];
    }

    return getCourseLessons(course.id)
      .filter(isLessonAccessible)
      .map((lesson) => ({
        courseSlug: course.slug,
        lessonSlug: lesson.slug
      }));
  });
}

export function getLearningLessonData(courseSlug: string, lessonSlug: string) {
  const courseData = getLearningCourseData(courseSlug);

  if (!courseData) {
    return undefined;
  }

  const lesson = courseData.lessons.find((item) => item.slug === lessonSlug);

  if (!lesson || !isLessonAccessible(lesson)) {
    return undefined;
  }

  const accessibleLessons = courseData.lessons.filter(isLessonAccessible);
  const lessonIndex = accessibleLessons.findIndex((item) => item.id === lesson.id);
  const module = courseData.modules.find((item) =>
    item.lessons.some((moduleLesson) => moduleLesson.id === lesson.id)
  );
  const resources = lesson.resources?.length
    ? lesson.resources
    : module?.resources ?? [];

  return {
    ...courseData,
    lesson,
    module,
    resources,
    content: lessonContentById[lesson.id] ?? buildFallbackContent(lesson),
    previousLesson: lessonIndex > 0 ? accessibleLessons[lessonIndex - 1] : undefined,
    nextLesson:
      lessonIndex >= 0 ? accessibleLessons[lessonIndex + 1] : undefined
  };
}
