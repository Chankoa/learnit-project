export type ResumeLesson = {
  id: string;
  slug: string;
  title: string;
  status?: string;
};

export type ResumeCourse = {
  id: string;
  slug: string;
  title: string;
  lessons: ResumeLesson[];
};

type LessonAccess = {
  lessonSlug: string;
  viewedAt: string;
};

const COMPLETED_LESSONS_KEY = "learnit-completed-lessons";
const LESSON_ACCESS_KEY = "learnit-last-lessons-by-course";
const FAVORITE_RESOURCES_KEY = "learnit-favorite-resources";
const LESSON_NOTES_KEY = "learnit-lesson-notes";

export const LEARNER_LOCAL_CHANGE_EVENT = "learnit-learner-local-change";

function canUseStorage() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return Boolean(window.localStorage);
  } catch {
    return false;
  }
}

function readJson<Value>(key: string, fallback: Value): Value {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const storedValue = window.localStorage.getItem(key);

    return storedValue ? (JSON.parse(storedValue) as Value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(LEARNER_LOCAL_CHANGE_EVENT));
  } catch {
    // Local persistence is optional in demo mode.
  }
}

function readStringArray(key: string) {
  const value = readJson<unknown>(key, []);

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function isAccessibleLesson(lesson: ResumeLesson) {
  return lesson.status !== "locked";
}

export function getCompletedLessonIds() {
  return readStringArray(COMPLETED_LESSONS_KEY);
}

export function isLessonCompleted(lessonId: string) {
  return getCompletedLessonIds().includes(lessonId);
}

export function setLessonCompleted(lessonId: string, completed: boolean) {
  const completedLessons = new Set(getCompletedLessonIds());

  if (completed) {
    completedLessons.add(lessonId);
  } else {
    completedLessons.delete(lessonId);
  }

  writeJson(COMPLETED_LESSONS_KEY, [...completedLessons]);
}

export function recordLessonAccess(courseSlug: string, lessonSlug: string) {
  const currentAccess = readJson<Record<string, LessonAccess>>(LESSON_ACCESS_KEY, {});

  writeJson(LESSON_ACCESS_KEY, {
    ...currentAccess,
    [courseSlug]: {
      lessonSlug,
      viewedAt: new Date().toISOString()
    }
  });
}

export function getLessonAccessByCourse() {
  return readJson<Record<string, LessonAccess>>(LESSON_ACCESS_KEY, {});
}

export function getFavoriteResourceIds() {
  return readStringArray(FAVORITE_RESOURCES_KEY);
}

export function isResourceFavorite(resourceId: string, initialFavorite = false) {
  return initialFavorite || getFavoriteResourceIds().includes(resourceId);
}

export function setResourceFavorite(resourceId: string, favorite: boolean) {
  const favoriteResources = new Set(getFavoriteResourceIds());

  if (favorite) {
    favoriteResources.add(resourceId);
  } else {
    favoriteResources.delete(resourceId);
  }

  writeJson(FAVORITE_RESOURCES_KEY, [...favoriteResources]);
}

export function getLessonNotes(lessonId: string) {
  const notes = readJson<Record<string, string>>(LESSON_NOTES_KEY, {});

  return notes[lessonId] ?? "";
}

export function setLessonNotes(lessonId: string, value: string) {
  const notes = readJson<Record<string, string>>(LESSON_NOTES_KEY, {});

  writeJson(LESSON_NOTES_KEY, {
    ...notes,
    [lessonId]: value
  });
}

export function getLocalCourseProgress(course: ResumeCourse) {
  const completedLessons = new Set(getCompletedLessonIds());
  const accessibleLessons = course.lessons.filter(isAccessibleLesson);
  const completedCount = accessibleLessons.filter((lesson) =>
    completedLessons.has(lesson.id)
  ).length;

  return {
    completedCount,
    totalLessons: accessibleLessons.length,
    percentage:
      accessibleLessons.length > 0
        ? Math.round((completedCount / accessibleLessons.length) * 100)
        : 0
  };
}

export function getResumeHrefForCourse(course: ResumeCourse) {
  const accessibleLessons = course.lessons.filter(isAccessibleLesson);
  const lessonAccess = getLessonAccessByCourse()[course.slug];
  const lastViewedLesson = accessibleLessons.find(
    (lesson) => lesson.slug === lessonAccess?.lessonSlug
  );
  const completedLessons = new Set(getCompletedLessonIds());
  const firstIncompleteLesson = accessibleLessons.find(
    (lesson) => !completedLessons.has(lesson.id)
  );
  const targetLesson = lastViewedLesson ?? firstIncompleteLesson ?? accessibleLessons[0];

  return targetLesson ? `/learn/${course.slug}/${targetLesson.slug}` : `/learn/${course.slug}`;
}

export function getResumeCourse(courses: ResumeCourse[], preferredCourseSlug?: string) {
  const accessibleCourses = courses.filter((course) => course.lessons.some(isAccessibleLesson));

  if (preferredCourseSlug) {
    return accessibleCourses.find((course) => course.slug === preferredCourseSlug);
  }

  const accessByCourse = getLessonAccessByCourse();
  const latestAccess = Object.entries(accessByCourse)
    .map(([courseSlug, access]) => ({
      courseSlug,
      time: new Date(access.viewedAt).getTime()
    }))
    .sort((first, second) => second.time - first.time)
    .find(({ courseSlug }) => accessibleCourses.some((course) => course.slug === courseSlug));

  if (latestAccess) {
    return accessibleCourses.find((course) => course.slug === latestAccess.courseSlug);
  }

  return (
    accessibleCourses.find(
      (course) => {
        const progress = getLocalCourseProgress(course);

        return progress.completedCount < progress.totalLessons;
      }
    ) ?? accessibleCourses[0]
  );
}
