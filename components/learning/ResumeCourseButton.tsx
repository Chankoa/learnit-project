"use client";

import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getResumeCourse,
  getResumeHrefForCourse,
  LEARNER_LOCAL_CHANGE_EVENT,
  type ResumeCourse
} from "@/lib/learner-local-storage";

type ResumeCourseButtonProps = {
  courses: ResumeCourse[];
  preferredCourseSlug?: string;
  className?: string;
  icon?: "arrow" | "play";
  label?: string;
};

export function ResumeCourseButton({
  courses,
  preferredCourseSlug,
  className = "btn btn-primary",
  icon = "play",
  label = "Reprendre la formation"
}: ResumeCourseButtonProps) {
  const [href, setHref] = useState<string>();

  useEffect(() => {
    function updateHref() {
      const course = getResumeCourse(courses, preferredCourseSlug);
      setHref(course ? getResumeHrefForCourse(course) : undefined);
    }

    updateHref();
    window.addEventListener(LEARNER_LOCAL_CHANGE_EVENT, updateHref);
    window.addEventListener("storage", updateHref);

    return () => {
      window.removeEventListener(LEARNER_LOCAL_CHANGE_EVENT, updateHref);
      window.removeEventListener("storage", updateHref);
    };
  }, [courses, preferredCourseSlug]);

  if (!href) {
    return null;
  }

  const Icon = icon === "arrow" ? ArrowRight : PlayCircle;

  return (
    <Link className={className} href={href}>
      <Icon size={17} aria-hidden="true" />
      {label}
    </Link>
  );
}
