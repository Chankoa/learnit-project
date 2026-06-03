import { audienceProfiles, heroStats, learningModules, siteConfig } from "@/data/site";
import type { AudienceProfile, HeroStat, LearningModule, SiteConfig } from "@/types/site";

type SiteSource = {
  getSiteConfig: () => SiteConfig;
  getHeroStats: () => HeroStat[];
  getAudienceProfiles: () => AudienceProfile[];
  getLearningModules: () => LearningModule[];
};

const staticSiteSource: SiteSource = {
  getSiteConfig: () => siteConfig,
  getHeroStats: () => heroStats,
  getAudienceProfiles: () => audienceProfiles,
  getLearningModules: () => learningModules
};

function getSiteSource() {
  return staticSiteSource;
}

export function getSiteConfig() {
  return getSiteSource().getSiteConfig();
}

export function getHeroStats() {
  return [...getSiteSource().getHeroStats()];
}

export function getAudienceProfiles() {
  return [...getSiteSource().getAudienceProfiles()];
}

export function getLearningModules() {
  return [...getSiteSource().getLearningModules()];
}
