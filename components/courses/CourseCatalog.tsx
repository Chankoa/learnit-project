"use client";

import { useMemo, useState } from "react";

import {
  CourseFilters,
  type CourseDurationFilter
} from "@/components/catalog/CourseFilters";
import { CourseGrid } from "@/components/catalog/CourseGrid";
import {
  courseAvailabilityLabels,
  courseLevelLabels
} from "@/components/catalog/CourseCard";
import type { Course, CourseAvailability, CourseLevel, Domain } from "@/types/course";

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
  const [activeAvailability, setActiveAvailability] = useState<CourseAvailability | "all">("all");

  const levels = useMemo(() => {
    return Array.from(new Set(courses.map((course) => course.level)));
  }, [courses]);

  const formats = useMemo(() => {
    return Array.from(
      new Set(courses.map((course) => course.format).filter((format): format is string => Boolean(format)))
    ).sort((first, second) => first.localeCompare(second));
  }, [courses]);

  const availabilities = useMemo(() => {
    return Array.from(new Set(courses.map((course) => course.availability)));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = normalize(query.trim());

    return courses.filter((course) => {
      const matchesDomain = activeDomain === "all" || course.domain.id === activeDomain;
      const matchesLevel = activeLevel === "all" || course.level === activeLevel;
      const matchesFormat = activeFormat === "all" || course.format === activeFormat;
      const matchesDuration = matchesDurationFilter(course.durationMinutes, activeDuration);
      const matchesAvailability = activeAvailability === "all" || course.availability === activeAvailability;
      const searchableContent = normalize(
        [
          course.title,
          course.description,
          course.domain.name,
          course.level,
          courseLevelLabels[course.level],
          course.availability,
          courseAvailabilityLabels[course.availability],
          course.format ?? "",
          ...(course.tags ?? [])
        ].join(" ")
      );
      const matchesQuery = normalizedQuery.length === 0 || searchableContent.includes(normalizedQuery);

      return matchesDomain && matchesLevel && matchesFormat && matchesDuration && matchesAvailability && matchesQuery;
    });
  }, [activeAvailability, activeDomain, activeDuration, activeFormat, activeLevel, courses, query]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    activeDomain !== "all" ||
    activeLevel !== "all" ||
    activeFormat !== "all" ||
    activeDuration !== "all" ||
    activeAvailability !== "all";

  function resetFilters() {
    setQuery("");
    setActiveDomain("all");
    setActiveLevel("all");
    setActiveFormat("all");
    setActiveDuration("all");
    setActiveAvailability("all");
  }

  return (
    <section className="section-shell content-section catalog-section" id="catalogue">
      <CourseFilters
        activeAvailability={activeAvailability}
        activeDomain={activeDomain}
        activeDuration={activeDuration}
        activeFormat={activeFormat}
        activeLevel={activeLevel}
        availabilities={availabilities}
        domains={domains}
        formats={formats}
        hasActiveFilters={hasActiveFilters}
        levels={levels}
        query={query}
        resultCount={filteredCourses.length}
        totalCount={courses.length}
        onAvailabilityChange={setActiveAvailability}
        onDomainChange={setActiveDomain}
        onDurationChange={setActiveDuration}
        onFormatChange={setActiveFormat}
        onLevelChange={setActiveLevel}
        onQueryChange={setQuery}
        onReset={resetFilters}
      />
      <CourseGrid courses={filteredCourses} />
    </section>
  );
}
