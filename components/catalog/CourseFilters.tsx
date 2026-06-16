"use client";

import { RotateCcw, Search } from "lucide-react";

import { DomainPill } from "@/components/catalog/DomainPill";
import { courseLevelLabels, courseStatusLabels } from "@/components/catalog/CourseCard";
import type { CourseLevel, CourseStatus, Domain } from "@/types/course";

export type CourseDurationFilter = "all" | "short" | "medium" | "long";

export const courseDurationFilterLabels: Record<CourseDurationFilter, string> = {
  all: "Toutes les durées",
  short: "1h ou moins",
  medium: "1h à 3h",
  long: "Plus de 3h"
};

type CourseFiltersProps = {
  query: string;
  domains: Domain[];
  levels: CourseLevel[];
  formats: string[];
  statuses: CourseStatus[];
  activeDomain: string;
  activeLevel: CourseLevel | "all";
  activeFormat: string;
  activeDuration: CourseDurationFilter;
  activeStatus: CourseStatus | "all";
  resultCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onQueryChange: (query: string) => void;
  onDomainChange: (domainId: string) => void;
  onLevelChange: (level: CourseLevel | "all") => void;
  onFormatChange: (format: string) => void;
  onDurationChange: (duration: CourseDurationFilter) => void;
  onStatusChange: (status: CourseStatus | "all") => void;
  onReset: () => void;
};

export function CourseFilters({
  query,
  domains,
  levels,
  formats,
  statuses,
  activeDomain,
  activeLevel,
  activeFormat,
  activeDuration,
  activeStatus,
  resultCount,
  totalCount,
  hasActiveFilters,
  onQueryChange,
  onDomainChange,
  onLevelChange,
  onFormatChange,
  onDurationChange,
  onStatusChange,
  onReset
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
        <div className="catalog-toolbar__search">
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
          {hasActiveFilters ? (
            <button className="catalog-reset" type="button" onClick={onReset}>
              <RotateCcw size={15} aria-hidden="true" />
              Réinitialiser
            </button>
          ) : null}
        </div>

        <div className="catalog-filter-groups">
          <div className="catalog-filter-group" id="domain-filters">
            <p>Domaine</p>
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

          <div className="catalog-filter-group">
            <p>Niveau</p>
            <DomainPill active={activeLevel === "all"} onClick={() => onLevelChange("all")}>
              Tous les niveaux
            </DomainPill>
            {levels.map((level) => (
              <DomainPill active={activeLevel === level} key={level} onClick={() => onLevelChange(level)}>
                {courseLevelLabels[level]}
              </DomainPill>
            ))}
          </div>

          <div className="catalog-filter-group">
            <p>Format</p>
            <DomainPill active={activeFormat === "all"} onClick={() => onFormatChange("all")}>
              Tous les formats
            </DomainPill>
            {formats.map((format) => (
              <DomainPill active={activeFormat === format} key={format} onClick={() => onFormatChange(format)}>
                {format}
              </DomainPill>
            ))}
          </div>

          <div className="catalog-filter-group">
            <p>Durée</p>
            {(Object.entries(courseDurationFilterLabels) as [CourseDurationFilter, string][]).map(([duration, label]) => (
              <DomainPill
                active={activeDuration === duration}
                key={duration}
                onClick={() => onDurationChange(duration)}
              >
                {label}
              </DomainPill>
            ))}
          </div>

          <div className="catalog-filter-group">
            <p>Statut</p>
            <DomainPill active={activeStatus === "all"} onClick={() => onStatusChange("all")}>
              Tous les statuts
            </DomainPill>
            {statuses.map((status) => (
              <DomainPill active={activeStatus === status} key={status} onClick={() => onStatusChange(status)}>
                {courseStatusLabels[status]}
              </DomainPill>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
