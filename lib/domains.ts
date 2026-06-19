import { listDomains } from "@/lib/repositories/courseRepository";
import type { Domain } from "@/types/course";

type DomainSource = {
  getDomains: () => Domain[];
};

const staticDomainSource: DomainSource = {
  getDomains: () => listDomains()
};

function getDomainSource() {
  return staticDomainSource;
}

function sortDomains(domains: Domain[]) {
  return [...domains].sort((first, second) => (first.order ?? 999) - (second.order ?? 999));
}

export function getAllDomains() {
  return sortDomains(getDomainSource().getDomains());
}

export function getDomainBySlug(slug: string) {
  return getAllDomains().find((domain) => domain.slug === slug);
}

export function getDomainStaticParams() {
  return getAllDomains().map((domain) => ({
    slug: domain.slug
  }));
}
