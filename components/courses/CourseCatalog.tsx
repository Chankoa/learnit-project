"use client";

import { useMemo, useState } from "react";

import { CourseFilters } from "@/components/catalog/CourseFilters";
import { CourseGrid } from "@/components/catalog/CourseGrid";
import type { Course, CourseLevel, Domain } from "@/types/course";

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

export function CourseCatalog({ courses, domains }: CourseCatalogProps) {
  const [query, setQuery] = useState("");
  const [activeDomain, setActiveDomain] = useState("all");
  const [activeLevel, setActiveLevel] = useState<CourseLevel | "all">("all");

  const levels = useMemo(() => {
    return Array.from(new Set(courses.map((course) => course.level)));
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const normalizedQuery = normalize(query.trim());

    return courses.filter((course) => {
      const matchesDomain = activeDomain === "all" || course.domain.id === activeDomain;
      const matchesLevel = activeLevel === "all" || course.level === activeLevel;
      const searchableContent = normalize(
        [course.title, course.description, course.domain.name, ...(course.tags ?? [])].join(" ")
      );
      const matchesQuery = normalizedQuery.length === 0 || searchableContent.includes(normalizedQuery);

      return matchesDomain && matchesLevel && matchesQuery;
    });
  }, [activeDomain, activeLevel, courses, query]);

  return (
    <section className="section-shell content-section catalog-section" id="catalogue">
      <CourseFilters
        activeDomain={activeDomain}
        activeLevel={activeLevel}
        domains={domains}
        levels={levels}
        query={query}
        resultCount={filteredCourses.length}
        totalCount={courses.length}
        onDomainChange={setActiveDomain}
        onLevelChange={setActiveLevel}
        onQueryChange={setQuery}
      />
      <CourseGrid courses={filteredCourses} />
    </section>
  );
}
