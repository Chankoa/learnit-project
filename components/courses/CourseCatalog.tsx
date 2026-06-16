"use client";

import { useMemo, useState } from "react";

import {
  CourseFilters,
  type CourseDurationFilter
} from "@/components/catalog/CourseFilters";
import { CourseGrid } from "@/components/catalog/CourseGrid";
import {
  courseLevelLabels,
  courseStatusLabels
} from "@/components/catalog/CourseCard";
import type { Course, CourseLevel, CourseStatus, Domain } from "@/types/course";

type CourseCatalogProps = {
  courses: Course[];
  domains: Domain[];
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchesDurationFilter(minutes: number | undefined, duration: CourseDurationFilter) {
  if (duration === "all") {
    return true;
  }

  if (!minutes) {
    return false;
  }

  if (duration === "short") {
    return minutes <= 60;
  }

  if (duration === "medium") {
    return minutes > 60 && minutes <= 180;
  }

  return minutes > 180;
}

export function CourseCatalog({ courses, domains }: CourseCatalogProps) {
  const [query, setQuery] = useState("");
  const [activeDomain, setActiveDomain] = useState("all");
  const [activeLevel, setActiveLevel] = useState<CourseLevel | "all">("all");
  const [activeFormat, setActiveFormat] = useState("all");
  const [activeDuration, setActiveDuration] = useState<CourseDurationFilter>("all");
  const [activeStatus, setActiveStatus] = useState<CourseStatus | "all">("all");

  const levels = useMemo(() => {
    return Array.from(new Set(courses.map((course) => course.level)));
  }, [courses]);

  const formats = useMemo(() => {
    return Array.from(
      new Set(courses.map((course) => course.format).filter((format): format is string => Boolean(format)))
    ).sort((first, second) => first.localeCompare(second));
  }, [courses]);

  const statuses = useMemo(() => {
    return Array.from(new Set(courses.map((course) => course.status)));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = normalize(query.trim());

    return courses.filter((course) => {
      const matchesDomain = activeDomain === "all" || course.domain.id === activeDomain;
      const matchesLevel = activeLevel === "all" || course.level === activeLevel;
      const matchesFormat = activeFormat === "all" || course.format === activeFormat;
      const matchesDuration = matchesDurationFilter(course.durationMinutes, activeDuration);
      const matchesStatus = activeStatus === "all" || course.status === activeStatus;
      const searchableContent = normalize(
        [
          course.title,
          course.description,
          course.domain.name,
          course.level,
          courseLevelLabels[course.level],
          course.status,
          courseStatusLabels[course.status],
          course.format ?? "",
          ...(course.tags ?? [])
        ].join(" ")
      );
      const matchesQuery = normalizedQuery.length === 0 || searchableContent.includes(normalizedQuery);

      return matchesDomain && matchesLevel && matchesFormat && matchesDuration && matchesStatus && matchesQuery;
    });
  }, [activeDomain, activeDuration, activeFormat, activeLevel, activeStatus, courses, query]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    activeDomain !== "all" ||
    activeLevel !== "all" ||
    activeFormat !== "all" ||
    activeDuration !== "all" ||
    activeStatus !== "all";

  function resetFilters() {
    setQuery("");
    setActiveDomain("all");
    setActiveLevel("all");
    setActiveFormat("all");
    setActiveDuration("all");
    setActiveStatus("all");
  }

  return (
    <section className="section-shell content-section catalog-section" id="catalogue">
      <CourseFilters
        activeDomain={activeDomain}
        activeDuration={activeDuration}
        activeFormat={activeFormat}
        activeLevel={activeLevel}
        activeStatus={activeStatus}
        domains={domains}
        formats={formats}
        hasActiveFilters={hasActiveFilters}
        levels={levels}
        query={query}
        resultCount={filteredCourses.length}
        statuses={statuses}
        totalCount={courses.length}
        onDomainChange={setActiveDomain}
        onDurationChange={setActiveDuration}
        onFormatChange={setActiveFormat}
        onLevelChange={setActiveLevel}
        onQueryChange={setQuery}
        onReset={resetFilters}
        onStatusChange={setActiveStatus}
      />
      <CourseGrid courses={filteredCourses} />
    </section>
  );
}
