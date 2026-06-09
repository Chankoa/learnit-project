"use client";

import { Search } from "lucide-react";

import { DomainPill } from "@/components/catalog/DomainPill";
import { courseLevelLabels } from "@/components/catalog/CourseCard";
import type { CourseLevel, Domain } from "@/types/course";

type CourseFiltersProps = {
  query: string;
  domains: Domain[];
  levels: CourseLevel[];
  activeDomain: string;
  activeLevel: CourseLevel | "all";
  resultCount: number;
  totalCount: number;
  onQueryChange: (query: string) => void;
  onDomainChange: (domainId: string) => void;
  onLevelChange: (level: CourseLevel | "all") => void;
};

export function CourseFilters({
  query,
  domains,
  levels,
  activeDomain,
  activeLevel,
  resultCount,
  totalCount,
  onQueryChange,
  onDomainChange,
  onLevelChange
}: CourseFiltersProps) {
  return (
    <>
      <div className="section-heading-row">
        <div>
          <span className="eyebrow w-fit">Catalogue</span>
          <h2>Toutes les formations</h2>
          <p>
            Recherchez un parcours, filtrez par domaine ou par niveau, puis ouvrez la fiche qui vous intéresse.
          </p>
        </div>
        <p className="catalog-count">
          {resultCount} / {totalCount} formation{totalCount > 1 ? "s" : ""}
        </p>
      </div>

      <div className="catalog-toolbar">
        <label className="relative block">
          <span className="sr-only">Rechercher une formation</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            size={18}
            aria-hidden="true"
          />
          <input
            className="catalog-search"
            placeholder="Rechercher une formation"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </label>

        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2" id="domain-filters">
            <DomainPill active={activeDomain === "all"} onClick={() => onDomainChange("all")}>
              Tous les domaines
            </DomainPill>
            {domains.map((domain) => (
              <DomainPill
                active={activeDomain === domain.id}
                key={domain.id}
                onClick={() => onDomainChange(domain.id)}
              >
                {domain.name}
              </DomainPill>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <DomainPill active={activeLevel === "all"} onClick={() => onLevelChange("all")}>
              Tous les niveaux
            </DomainPill>
            {levels.map((level) => (
              <DomainPill active={activeLevel === level} key={level} onClick={() => onLevelChange(level)}>
                {courseLevelLabels[level]}
              </DomainPill>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
