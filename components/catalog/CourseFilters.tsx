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
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="eyebrow w-fit">Catalogue</span>
          <h2 className="mt-4 text-2xl font-black text-text-strong md:text-3xl">
            Toutes les formations
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-text-muted">
            Recherchez un parcours, filtrez par domaine ou par niveau, puis ouvrez la fiche qui vous interesse.
          </p>
        </div>
        <p className="text-sm font-bold text-text-muted">
          {resultCount} / {totalCount} formation{totalCount > 1 ? "s" : ""}
        </p>
      </div>

      <div className="mt-6 grid gap-4 rounded-md border border-border bg-surface p-4 shadow-xs lg:grid-cols-[1fr_1.5fr]">
        <label className="relative block">
          <span className="sr-only">Rechercher une formation</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            size={18}
            aria-hidden="true"
          />
          <input
            className="min-h-12 w-full rounded-md border border-border bg-background px-10 text-sm text-text-strong outline-none transition focus:border-border-strong"
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
